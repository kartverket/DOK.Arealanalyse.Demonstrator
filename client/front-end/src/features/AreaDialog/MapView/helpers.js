import { getLayer } from 'utils/map';
import { reproject } from 'reproject';
import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import proj4 from 'proj4';
import basemap from 'config/basemap.config';

export function setupMap(map, currentLocation) {
    const view = map.getView();
    let extent = getFeatureExtent(map);

    if (extent !== null) {
        // view.fit(extent, map.getSize());
        view.fit(extent);
        view.setZoom(16);
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

function getFeatureExtent(map) {
    const layer = getLayer(map, 'feature');
    const source = layer.getSource();

    if (source.getFeatures().length === 0) {
        return null;
    }

    return source.getExtent();
}

function getCurrentLocationExtent(coordinates) {
    if (coordinates === null) {
        return null;
    }

    const point = {
        type: 'Point',
        coordinates
    };

    const buffered = buffer(point, 10, { units: 'meters' });

    const transformed = reproject(buffered, 'EPSG:4326', 'EPSG:25833', {
        'EPSG:25833': proj4('EPSG:25833')
    });

    return bbox(transformed);
}