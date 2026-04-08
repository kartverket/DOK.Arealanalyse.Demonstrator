import createBuffer from '@turf/buffer';
import proj4 from 'proj4';
import { reproject } from 'reproject';
import { getProjection } from 'utils/helpers';

export function getGeometries(inputGeometry, bufferStr) {
    const parsed = parseInt(bufferStr);
    const buffer = Number.isInteger(parsed) && parsed > 0 ? parsed : 0;

    if (buffer === 0) {
        return {
            geometry: inputGeometry,
            bufferedGeometry: null
        };
    }

    const projection = getProjection(inputGeometry);
    let geometry = inputGeometry;

    if (projection !== 'EPSG:4326') {
        geometry = reproject(geometry, projection, 'EPSG:4326', {
            [projection]: proj4(projection)
        });
    }

    const buffered = createBuffer(geometry, buffer, { units: 'meters' });

    return {
        geometry,
        bufferedGeometry: buffered.geometry
    };
}
