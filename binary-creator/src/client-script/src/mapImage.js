import { Map, View } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { WMTSCapabilities } from 'ol/format';
import GeoJSON from 'ol/format/GeoJSON';
import './config/projections.config';
import './config/extents.config';

const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

export default async function createMapImage(options) {
    let map, mapElement;

    try {
        [map, mapElement] = await createTempMap(options);
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }

    return new Promise((resolve, reject) => {
        try {
            map.once('rendercomplete', () => {
                const base64 = exportToPngImage(map);
                const split = base64.split(',');

                map.dispose();
                mapElement.remove();

                resolve({
                    data: split[1],
                    error: null
                });
            })
        } catch (error) {
            reject({
                data: null,
                error: error.message
            });
        }
    });
}

async function createTempMap(options) {
    const layers = [];

    if (options.wmts) {
        layers.push(await createWmtsLayer(options.wmts));
    }

    if (options.wms?.length) {
        options.wms.forEach(url => layers.push(createWmsLayer(url)));
    }

    const featuresLayer = createFeaturesLayer(options.features, options.styling);
    layers.push(featuresLayer);

    const map = new Map({ layers });

    map.setView(new View({
        padding: [50, 50, 50, 50],
        projection: 'EPSG:3857'
    }));

    const mapElement = document.createElement('div');
    Object.assign(mapElement.style, { position: 'absolute', left: '-10000px', top: '-10000px', width: `${options.width}px`, height: `${options.height}px` });
    document.getElementsByTagName('body')[0].appendChild(mapElement);

    map.setTarget(mapElement);

    const extent = featuresLayer.getSource().getExtent();
    console.log(extent)
    map.getView().fit(extent, map.getSize());

    return [map, mapElement];
}

async function createWmtsLayer(wmts) {
    const options = await getWmtsOptions(wmts);

    if (options === null) {
        return null;
    }

    return new TileLayer({
        source: new WMTS(options),
        maxZoom: 22,
    });
}

function createWmsLayer(url, params = {}) {
    return new TileLayer({
        source: new TileWMS({
            url,
            params: {
                'VERSION': '1.1.1',
                ...params
            },
            crossOrigin: 'anonymous'
        })
    });
}

function createFeaturesLayer(features, styling) {
    const reader = new GeoJSON();
    const dataProjection = getProjection(features);

    const vectorLayer = new VectorLayer({
        source: new VectorSource({
            features: reader.readFeatures(features, { dataProjection, featureProjection: 'EPSG:3857' })
        }),
        declutter: true
    });

    if (styling) {
        vectorLayer.setStyle(styling);
    }

    return vectorLayer;
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

async function getWmtsOptions(wmts) {
    const xml = window.atob(wmts.capabilities)
    const capabilities = new WMTSCapabilities().read(xml);

    const options = optionsFromCapabilities(capabilities, {
        layer: wmts.layer,
        matrixSet: 'EPSG:3857'
    });

    return {
        ...options,
        crossOrigin: 'anonymous'
    };
}

function getProjection(geoJson) {
    const crsName = getCrsName(geoJson);
    let epsgCode = 4326;

    if (crsName) {
        epsgCode = getEpsgCode(crsName) || 4326;
    }

    return `EPSG:${epsgCode}`;
}

function getEpsgCode(crsName) {
    if (!crsName) {
        return null;
    }

    const match = EPSG_REGEX.exec(crsName);

    return match !== null ?
        match.groups.epsg :
        null;
}

function getCrsName(geoJson) {
    return geoJson?.crs?.properties?.name;
}
