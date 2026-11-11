import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
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

export function setupMap(map: OlMap, currentLocation: LonLat | null): void {
    const view = map.getView();
    let extent = getFeatureExtent(map);
    if (extent !== null) {
        view.fit(extent);
    } else {
        extent = getCurrentLocationExtent(currentLocation);
        if (extent !== null) {
            view.fit(extent);
            view.setZoom(12);
        }
    }

    view.setMinZoom(basemap.minZoom);
    view.setMaxZoom(basemap.maxZoom);
}

function getFeatureExtent(map: OlMap): Extent | null {
    const vectorLayer = getLayer<VectorLayer<VectorSource>>(map, 'features');
    return vectorLayer?.getSource()?.getExtent() ?? null;
}

function getCurrentLocationExtent(coordinates: LonLat | null): Extent | null {
    if (coordinates === null) {
        return null;
    }

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
