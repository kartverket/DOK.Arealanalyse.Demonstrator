import { Feature, Map as OlMap, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { WMTSCapabilities } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { getEpsgCode } from './helpers';
import basemap from 'config/basemap.config';

const MAP_WIDTH = 720;
const MAP_HEIGHT = 480;

export async function createMap({ geometry, bufferedGeometry, wmsUrl }) {
    const layers = [
        await createWmtsLayer(),
        createWmsLayer(wmsUrl),
        createFeaturesLayer(geometry, bufferedGeometry)
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

export async function createOutlineMap(geometry) {
    const layers = [
        await createWmtsLayer(),
        createOutlineFeaturesLayer(geometry)
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

export async function createMapImage({ geometry, bufferedGeometry, wmsUrl, options = {} }) {
    const [map, mapElement] = await createTempMap(geometry, bufferedGeometry, wmsUrl, options);

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
        .find(layer => layer.get('id') === id);
}

async function createTempMap(geometry, bufferedGeometry, wmsUrl, options) {
    const featuresLayer = createFeaturesLayer(geometry, bufferedGeometry);

    const layers = [
        await createWmtsLayer(),
        createWmsLayer(wmsUrl),
        featuresLayer
    ];

    const map = new OlMap({ layers });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: basemap.maxZoom,
        constrainResolution: true
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

function createFeaturesLayer(geometry, bufferedGeometry = null) {
    const projection = getProjection(geometry);
    const source = new VectorSource();

    if (bufferedGeometry !== null) {
        source.addFeature(createFeature(bufferedGeometry, projection, getBufferStyle()));
    }

    source.addFeature(createFeature(geometry, projection, getOutlineStyle()));

    const vectorLayer = new VectorLayer({ source });
    vectorLayer.set('id', 'features');

    return vectorLayer;
}

function createOutlineFeaturesLayer(geometry) {
    const projection = getProjection(geometry);
    const source = new VectorSource();

    source.addFeature(createFeature(geometry, projection, getOutlineStyle()));

    const vectorLayer = new VectorLayer({ source });
    vectorLayer.set('id', 'features');

    return vectorLayer;
}

function createFeature(geoJson, projection, style) {
    const reader = new GeoJSON();
    const geometry = reader.readGeometry(geoJson, { dataProjection: projection, featureProjection: 'EPSG:25833' });
    const feature = new Feature(geometry);

    feature.setStyle(style);

    return feature;
}

async function createWmtsLayer() {
    const options = await getWmtsOptions();

    if (options === null) {
        return null;
    }

    return new TileLayer({
        source: new WMTS(options),
        maxZoom: basemap.maxZoom
    });
}

async function getWmtsOptions() {
    let xml;

    try {
        const response = await fetch(basemap.wmtsUrl, { timeout: 10000 });
        xml = await response.text();
    } catch {
        return null;
    }

    const capabilities = new WMTSCapabilities().read(xml);

    const options = optionsFromCapabilities(capabilities, {
        layer: basemap.layer,
        matrixSet: 'EPSG:3857'
    });

    const wmtsOptions = {
        ...options,
        crossOrigin: 'anonymous'
    };

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

function getProjection(geometry) {
    const crsName = geometry?.crs?.properties?.name;
    let epsgCode = 4326;

    if (crsName !== undefined) {
        epsgCode = getEpsgCode(crsName) || 4326;
    }

    return `EPSG:${epsgCode}`;
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
