import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { containsExtent, isEmpty } from 'ol/extent';
import proj4 from 'proj4';
import { reproject } from 'reproject';
import { getLayer } from '@/lib/map/map';
import basemap from '@/config/basemap.config';

import type { LonLat } from '@/types/geo.types';
import type { Point } from 'geojson';
import type { Extent } from 'ol/extent';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';

export function setupMap(map: OlMap): void {
    const view = map.getView();
    view.setMinZoom(basemap.minZoom);
    view.setMaxZoom(basemap.maxZoom);
}

export function zoomToFeatures(map: OlMap): void {
    if (!hasSize(map)) {
        map.once('change:size', () => zoomToFeatures(map));

        return;
    }

    const extent = getFeatureExtent(map);
    if (extent !== null) {
        map.getView().fit(extent);
    }
}

// Zoomer kun ut når objektene ikke allerede er synlige i kartutsnittet
export function fitToFeatures(map: OlMap): void {
    if (!hasSize(map)) {
        map.once('change:size', () => fitToFeatures(map));

        return;
    }

    const view = map.getView();
    const extent = getFeatureExtent(map);
    if (extent === null || !view.isDef()) {
        return;
    }

    if (!containsExtent(view.calculateExtent(), extent)) {
        view.fit(extent, { duration: 250 });
    }
}

// Viser posisjonen til brukeren så lenge ingen områder er valgt
export function zoomToLocation(map: OlMap, coordinates: LonLat): void {
    if (!hasSize(map)) {
        map.once('change:size', () => zoomToLocation(map, coordinates));

        return;
    }

    if (getFeatureExtent(map) !== null) {
        return;
    }

    const extent = getCurrentLocationExtent(coordinates);
    if (extent !== null) {
        const view = map.getView();
        view.fit(extent);
        view.setZoom(12);
    }
}

// Kartet har ingen størrelse mens kartfanen er skjult, og da gir view.fit et ugyldig utsnitt
function hasSize(map: OlMap): boolean {
    const size = map.getSize();
    return size !== undefined && size[0] > 0 && size[1] > 0;
}

function getFeatureExtent(map: OlMap): Extent | null {
    const vectorLayer = getLayer<VectorLayer<VectorSource>>(map, 'features');
    const extent = vectorLayer?.getSource()?.getExtent();

    // Et tomt lag gir en uendelig utstrekning i stedet for null
    return extent && !isEmpty(extent) ? extent : null;
}

function getCurrentLocationExtent(coordinates: LonLat): Extent | null {
    const point: Point = {
        type: 'Point',
        coordinates,
    };

    const buffered = buffer(point, 10, { units: 'meters' });
    if (buffered === undefined) {
        return null;
    }

    const transformed = reproject(buffered, 'EPSG:4326', 'EPSG:25833', {
        'EPSG:25833': proj4('EPSG:25833'),
    });
    return bbox(transformed);
}
