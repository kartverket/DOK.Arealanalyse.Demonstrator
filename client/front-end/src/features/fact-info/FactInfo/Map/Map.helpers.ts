import createBuffer from '@turf/buffer';
import proj4 from 'proj4';
import { reproject } from 'reproject';
import { getProjection } from '@/lib/geo/crs';
import type { GeometryCollection } from 'geojson';
import type { CrsGeometry } from '@/types/geo.types';

export function getGeometries(inputGeometry: CrsGeometry, bufferStr: string): {
    geometry: CrsGeometry;
    bufferedGeometry: CrsGeometry | null;
} {
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

    const buffered = createBuffer(geometry as Exclude<CrsGeometry, GeometryCollection>, buffer, { units: 'meters' });

    return {
        geometry,
        bufferedGeometry: buffered?.geometry ?? null
    };
}
