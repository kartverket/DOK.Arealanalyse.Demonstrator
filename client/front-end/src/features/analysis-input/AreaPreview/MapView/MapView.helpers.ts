import { containsExtent, isEmpty } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import { getLayer } from '@/lib/map/map';
import basemap from '@/config/basemap.config';

import type { LonLat } from '@/types/geo.types';
import type { Extent } from 'ol/extent';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';

// Viser nærområdet rundt posisjonen til brukeren
const LOCATION_ZOOM = 14;

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

    const view = map.getView();
    view.setCenter(fromLonLat(coordinates, view.getProjection()));
    view.setZoom(LOCATION_ZOOM);
}

export function zoomToPoint(
    map: OlMap,
    coordinates: LonLat,
    zoom: number,
): void {
    const view = map.getView();
    view.animate({
        center: fromLonLat(coordinates, view.getProjection()),
        zoom,
        duration: 500,
    });
}

export function zoomToExtent(map: OlMap, extent: Extent): void {
    if (!hasSize(map)) {
        map.once('change:size', () => zoomToExtent(map, extent));

        return;
    }

    map.getView().fit(extent);
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
