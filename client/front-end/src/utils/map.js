import { Feature, Map as OlMap, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { OSM } from 'ol/source';
import { WMTSCapabilities } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { defaults as defaultControls, FullScreen } from 'ol/control';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { getEpsgCode } from './helpers';
import baseMap from 'config/baseMap.config';

const MAP_WIDTH = 720;
const MAP_HEIGHT = 480;
const CACHE_API_URL = import.meta.env.VITE_CACHE_API_URL;
const BASE_MAP = import.meta.env.VITE_BASE_MAP;

export async function createMap(inputGeometry, result) {
    const featuresLayer = createFeaturesLayer(inputGeometry, result);
    const layers = [];

    featuresLayer.set('id', 'features');

    if (BASE_MAP === 'OSM') {
        layers.push(createOsmLayer());
    } else {
        layers.push(await createWmtsLayer());
    }

    layers.push(createWmsLayer(result.rasterResult.mapUri));
    layers.push(featuresLayer);

    const map = new OlMap({
        controls: defaultControls().extend([new FullScreen()]),
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers
    });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: baseMap.maxZoom
    }));

    return map;
}

export async function createOutlineMap(geometry) {
    const featuresLayer = createOutlineFeaturesLayer(geometry);
    const layers = [];

    featuresLayer.set('id', 'features');

    if (BASE_MAP === 'OSM') {
        layers.push(createOsmLayer());
    } else {
        layers.push(await createWmtsLayer());
    }

    layers.push(featuresLayer);

    const map = new OlMap({
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers
    });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: baseMap.maxZoom
    }));

    return map;
}

export async function createMapImage(inputGeometry, result) {
    const [map, mapElement] = await createTempMap(inputGeometry, result);

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

async function createTempMap(inputGeometry, result) {
    const featuresLayer = createFeaturesLayer(inputGeometry, result);
    const layers = [];

    if (BASE_MAP === 'OSM') {
        layers.push(createOsmLayer());
    } else {
        layers.push(await createWmtsLayer());
    }

    layers.push(createWmsLayer(result.rasterResult.mapUri));
    layers.push(featuresLayer);

    const map = new OlMap({ layers });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:25833',
        maxZoom: baseMap.maxZoom,
        constrainResolution: true
    }));

    const mapElement = document.createElement('div');
    Object.assign(mapElement.style, { position: 'absolute', top: '-9999px', left: '-9999px', width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` });
    document.getElementsByTagName('body')[0].appendChild(mapElement);

    map.setTarget(mapElement);

    const extent = featuresLayer.getSource().getExtent();
    map.getView().fit(extent, map.getSize());

    return [map, mapElement];
}

function createFeaturesLayer(inputGeometry, result) {
    const projection = getProjection(inputGeometry);
    const source = new VectorSource();

    if (result.buffer > 0) {
        source.addFeature(createFeature(result.runOnInputGeometry, projection, getBufferStyle()));
    }

    source.addFeature(createFeature(inputGeometry, projection, getOutlineStyle()));

    return new VectorLayer({ source });
}

function createOutlineFeaturesLayer(geometry) {
    const projection = getProjection(geometry);
    const source = new VectorSource();

    source.addFeature(createFeature(geometry, projection, getOutlineStyle()));

    return new VectorLayer({ source });
}

function createFeature(geoJson, projection, style) {
    const reader = new GeoJSON();
    const geometry = reader.readGeometry(geoJson, { dataProjection: projection, featureProjection: 'EPSG:25833' });
    const feature = new Feature(geometry);

    feature.setStyle(style);

    return feature;
}

function createOsmLayer() {
    return new TileLayer({
        source: new OSM()
    });
}

async function createWmtsLayer() {
    const options = await getWmtsOptions();

    if (options === null) {
        return null;
    }

    return new TileLayer({
        source: new WMTS(options),
        maxZoom: baseMap.maxZoom
    });
}

async function getWmtsOptions() {
    let xml;

    try {
        const url = `${CACHE_API_URL}${encodeURIComponent(baseMap.wmtsUrl)}`
        const response = await fetch(url, { timeout: 10000 });
        xml = await response.text();
    } catch {
        return null;
    }

    const capabilities = new WMTSCapabilities().read(xml);

    const options = optionsFromCapabilities(capabilities, {
        layer: baseMap.layer,
        matrixSet: 'EPSG:3857'
    });

    const wmtsOptions = {
        ...options,
        crossOrigin: 'anonymous',
        tileLoadFunction: (tile, src) => {
            if (tile.tileCoord[0] >= 12) {
                tile.getImage().src = `${CACHE_API_URL}${encodeURIComponent(src)}`;
            } else {
                tile.getImage().src = src;
            }
        }
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
