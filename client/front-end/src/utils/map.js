import { Map as OlMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { WMTSCapabilities } from 'ol/format';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import basemap from 'config/basemap.config';
import { Fill } from 'ol/style';
import { createAreaFeatureLayer, createFeatureLayer } from './map/features';
import SelectGeometry from 'features/Editor/SelectGeometry';
import DrawPolygon from 'features/Editor/DrawPolygon';
import DrawPolygonHole from 'features/Editor/DrawPolygonHole';
import UndoRedo from 'features/Editor/UndoRedo';
import store from 'store';
import { setMapRendered } from 'store/slices/appSlice';

const MAP_WIDTH = 720;
const MAP_HEIGHT = 480;

const _wmtsOptions = {};

export async function createMap({ geometry, bufferedGeometry, wmsUrl }) {
    const layers = [
        await createWmtsLayer(basemap.layers.topograatone),
        createWmsLayer(wmsUrl),
        createFeatureLayer(geometry, bufferedGeometry)
    ];

    const map = new OlMap({
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers
    });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: basemap.maxZoom
    }));

    return map;
}

export async function createAreaMap(geometry) {
    const layers = [
        await createWmtsLayer(basemap.layers.topograatone),
        createAreaFeatureLayer(geometry),
        // createFeatureEditLayer()
    ];

    // if (geometry !== null) {
    //     layers.push(createAreaFeatureLayer(geometry));
    // }

    // layers.push(createFeatureEditLayer());


    const map = new OlMap({
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers
    });

    map.once('loadend', () => {
        addInteractions(map);
        store.dispatch(setMapRendered());
    })
    

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: basemap.maxZoom
    }));

    return map;
}

export function addInteractions(map) {
   SelectGeometry.addInteraction(map);
   DrawPolygon.addInteraction(map);
   DrawPolygonHole.addInteraction(map);
//    DrawLineString.addInteraction(map);
//    ModifyGeometry.addInteraction(map);
   UndoRedo.addInteraction(map);
}


export async function createFactInfoMap({ geometry, bufferedGeometry }) {
    const layers = [
        await createWmtsLayer(basemap.layers.topo),
        createFeatureLayer(geometry, bufferedGeometry)
    ];

    const map = new OlMap({
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers
    });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: basemap.maxZoom
    }));

    return map;
}

export async function createMapImage({ geometry, bufferedGeometry, wmtsLayer, wmsUrl, options = {} }) {
    const [map, mapElement] = await createTempMap(geometry, bufferedGeometry, wmtsLayer, wmsUrl, options);

    return new Promise((resolve) => {
        map.once('rendercomplete', () => {
            const base64 = exportToPngImage(map);
            map.dispose();
            mapElement.remove();

            resolve(base64);
        })
    });
}

export function getLayer(map, id) {
    return map.getLayers().getArray()
        .find(layer => layer.get('id') === id) || null;
}

export function getEditLayer(map) {
    return getLayer(map, 'feature-edit');
}

async function createTempMap(geometry, bufferedGeometry, wmtsLayer, wmsUrl, options) {
    const featuresLayer = createFeatureLayer(geometry, bufferedGeometry);

    const layers = [
        await createWmtsLayer(wmtsLayer)
    ];

    if (wmsUrl) {
        layers.push(createWmsLayer(wmsUrl));
    }

    layers.push(featuresLayer);

    const map = new OlMap({ layers });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: basemap.maxZoom,
        constrainResolution: options.constrainResolution !== undefined ?
            options.constrainResolution :
            true
    }));

    const mapWidth = options.width || MAP_WIDTH;
    const mapHeight = options.height || MAP_HEIGHT;

    const mapElement = document.createElement('div');
    Object.assign(mapElement.style, { position: 'absolute', top: '-9999px', left: '-9999px', width: `${mapWidth}px`, height: `${mapHeight}px` });
    document.getElementsByTagName('body')[0].appendChild(mapElement);

    map.setTarget(mapElement);

    const extent = featuresLayer.getSource().getExtent();
    map.getView().fit(extent, map.getSize());

    return [map, mapElement];
}



async function createWmtsLayer(wmtsLayer) {
    const options = await getWmtsOptions(wmtsLayer);

    if (options === null) {
        return null;
    }

    return new TileLayer({
        source: new WMTS(options),
        maxZoom: basemap.maxZoom
    });
}

async function getWmtsOptions(wmtsLayer) {
    if (_wmtsOptions[wmtsLayer] !== undefined) {
        return _wmtsOptions[wmtsLayer];
    }

    let xml;

    try {
        const response = await fetch(basemap.wmtsUrl, { timeout: 10000 });
        xml = await response.text();
    } catch {
        return null;
    }

    const capabilities = new WMTSCapabilities().read(xml);

    const options = optionsFromCapabilities(capabilities, {
        layer: wmtsLayer,
        matrixSet: 'EPSG:3857'
    });

    const wmtsOptions = {
        ...options,
        crossOrigin: 'anonymous'
    };

    _wmtsOptions[wmtsLayer] = wmtsOptions;

    return wmtsOptions;
}

function createWmsLayer(url) {
    return new TileLayer({
        source: new TileWMS({
            url,
            crossOrigin: 'anonymous'
        })
    });
}

function exportToPngImage(map) {
    const mapCanvas = document.createElement('canvas');
    const size = map.getSize();

    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext('2d');
    const canvases = map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer');

    canvases.forEach(canvas => {
        if (canvas.width === 0) {
            return;
        }

        const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
        const transform = canvas.style.transform;
        let matrix;

        if (transform) {
            matrix = transform
                .match(/^matrix\(([^(]*)\)$/)[1]
                .split(',')
                .map(Number);
        } else {
            matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
        }

        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
        const backgroundColor = canvas.parentNode.style.backgroundColor;

        if (backgroundColor) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        mapContext.drawImage(canvas, 0, 0);
    });

    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);

    return mapCanvas.toDataURL();
}

function getOutlineStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 4
        }),
        fill: new Fill({
            color: 'transparent'
        })
    });
}

export function getEditStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 4
        }),
        fill: new Fill({
            color: '#d333333d'
        })
    });
}


function getBufferStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            lineDash: [8, 8],
            width: 2
        })
    });
}
