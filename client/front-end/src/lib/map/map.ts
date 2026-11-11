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
import type BaseLayer from 'ol/layer/Base';
import type { Options as WmtsOptions } from 'ol/source/WMTS';
import type { CrsGeometry, LonLat } from '@/types/geo.types';
import { getProjection } from '@/lib/geo/crs';
import basemap from '@/config/basemap.config';

const MAP_WIDTH = 720;
const MAP_HEIGHT = 480;

type WmtsLayerName = (typeof basemap.layers)[keyof typeof basemap.layers];

interface MapImageOptions {
    width?: number;
    height?: number;
    constrainResolution?: boolean;
}

const _wmtsOptions: Partial<Record<WmtsLayerName, WmtsOptions>> = {};

export async function createMap({ geometry, bufferedGeometry, wmsUrl }: {
    geometry: CrsGeometry;
    bufferedGeometry: CrsGeometry | null;
    wmsUrl: string | null;
}): Promise<OlMap> {
    const layers = withoutNull([
        await createWmtsLayer(basemap.layers.topograatone),
        createWmsLayer(wmsUrl),
        createFeaturesLayer(geometry, bufferedGeometry)
    ]);

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

export async function createAreaMap(geometry: CrsGeometry | null): Promise<OlMap> {
    const layers = withoutNull<BaseLayer>([
        await createWmtsLayer(basemap.layers.topograatone)
    ]);

    if (geometry !== null) {
        layers.push(createAreaFeaturesLayer(geometry));
    }

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

export async function createFactInfoMap({ geometry, bufferedGeometry }: {
    geometry: CrsGeometry;
    bufferedGeometry: CrsGeometry | null;
}): Promise<OlMap> {
    const layers = withoutNull([
        await createWmtsLayer(basemap.layers.topo),
        createFeaturesLayer(geometry, bufferedGeometry)
    ]);

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

export async function createMapImage({ geometry, bufferedGeometry, wmtsLayer, wmsUrl = null, options = {} }: {
    geometry: CrsGeometry;
    bufferedGeometry: CrsGeometry | null;
    wmtsLayer: WmtsLayerName;
    wmsUrl?: string | null;
    options?: MapImageOptions;
}): Promise<string> {
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

export function getLayer<TLayer extends BaseLayer = BaseLayer>(map: OlMap, id: string): TLayer | undefined {
    return map.getLayers().getArray()
        .find(layer => layer.get('id') === id) as TLayer | undefined;
}

export async function getCurrentPosition(): Promise<LonLat | null> {
    return new Promise(resolve => {
        if ('geolocation' in navigator) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve([position.coords.longitude, position.coords.latitude]);
                },
                error => {
                    console.log(`Error (${error.code}): ${error.message}`);
                    resolve(null);
                },
                options
            );
        } else {
            console.log('Geolocation er ikke støttet');
            resolve(null);
        }
    });
}

async function createTempMap(
    geometry: CrsGeometry,
    bufferedGeometry: CrsGeometry | null,
    wmtsLayer: WmtsLayerName,
    wmsUrl: string | null,
    options: MapImageOptions
): Promise<[OlMap, HTMLDivElement]> {
    const featuresLayer = createFeaturesLayer(geometry, bufferedGeometry);
    const wmts = await createWmtsLayer(wmtsLayer);
    const layers: BaseLayer[] = [];

    if (wmts !== null) {
        layers.push(wmts);
    }

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

    const extent = featuresLayer.getSource()!.getExtent()!;
    map.getView().fit(extent);

    return [map, mapElement];
}

function createFeaturesLayer(geometry: CrsGeometry, bufferedGeometry: CrsGeometry | null = null): VectorLayer<VectorSource> {
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

function createAreaFeaturesLayer(geometry: CrsGeometry): VectorLayer<VectorSource> {
    const projection = getProjection(geometry);
    const source = new VectorSource();

    source.addFeature(createFeature(geometry, projection, getOutlineStyle()));

    const vectorLayer = new VectorLayer({ source });
    vectorLayer.set('id', 'features');

    return vectorLayer;
}

function createFeature(geoJson: CrsGeometry, projection: string, style: Style): Feature {
    const reader = new GeoJSON();
    const geometry = reader.readGeometry(geoJson, { dataProjection: projection, featureProjection: 'EPSG:25833' });
    const feature = new Feature(geometry);

    feature.setStyle(style);

    return feature;
}

async function createWmtsLayer(wmtsLayer: WmtsLayerName): Promise<TileLayer | null> {
    const options = await getWmtsOptions(wmtsLayer);

    if (options === null) {
        return null;
    }

    return new TileLayer({
        source: new WMTS(options),
        maxZoom: basemap.maxZoom
    });
}

async function getWmtsOptions(wmtsLayer: WmtsLayerName): Promise<WmtsOptions | null> {
    const cached = _wmtsOptions[wmtsLayer];

    if (cached !== undefined) {
        return cached;
    }

    let xml: string;

    try {
        const response = await fetch(basemap.wmtsUrl, { signal: AbortSignal.timeout(10000) });
        xml = await response.text();
    } catch {
        return null;
    }

    const capabilities = new WMTSCapabilities().read(xml);

    const options = optionsFromCapabilities(capabilities, {
        layer: wmtsLayer,
        matrixSet: 'EPSG:3857'
    });

    if (options === null) {
        return null;
    }

    const wmtsOptions: WmtsOptions = {
        ...options,
        crossOrigin: 'anonymous'
    };

    _wmtsOptions[wmtsLayer] = wmtsOptions;

    return wmtsOptions;
}

function createWmsLayer(url: string | null): TileLayer {
    return new TileLayer({
        source: new TileWMS({
            url: url ?? undefined,
            params: {},
            crossOrigin: 'anonymous'
        })
    });
}

function exportToPngImage(map: OlMap): string {
    const mapCanvas = document.createElement('canvas');
    const size = map.getSize()!;

    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext('2d')!;
    const canvases = map.getViewport().querySelectorAll<HTMLCanvasElement>('.ol-layer canvas, canvas.ol-layer');

    canvases.forEach(canvas => {
        if (canvas.width === 0) {
            return;
        }

        const parent = canvas.parentNode as HTMLElement;
        const opacity = parent.style.opacity || canvas.style.opacity;
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
        const transform = canvas.style.transform;
        let matrix: number[];

        if (transform) {
            matrix = transform
                .match(/^matrix\(([^(]*)\)$/)![1]
                .split(',')
                .map(Number);
        } else {
            matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
        }

        mapContext.setTransform(...(matrix as [number, number, number, number, number, number]));
        const backgroundColor = parent.style.backgroundColor;

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

function getOutlineStyle(): Style {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 4
        })
    });
}

function getBufferStyle(): Style {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            lineDash: [8, 8],
            width: 2
        })
    });
}

function withoutNull<T>(items: (T | null)[]): T[] {
    return items.filter((item): item is T => item !== null);
}
