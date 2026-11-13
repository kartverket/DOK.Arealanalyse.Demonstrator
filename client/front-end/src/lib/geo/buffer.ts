import buffer from '@turf/buffer';
import GeoJSON from 'ol/format/GeoJSON';
import { getProjection } from './crs';

import type { CrsGeometry } from '@/types/geo.types';

// Returnerer bufferen i WGS 84 (uten crs), siden turf kun regner på lengde- og breddegrader
export function bufferGeometry(
    geometry: CrsGeometry,
    distance: number,
): CrsGeometry | null {
    if (distance <= 0) {
        return null;
    }

    const format = new GeoJSON();
    const olGeometry = format.readGeometry(geometry, {
        dataProjection: getProjection(geometry),
        featureProjection: 'OGC:CRS84',
    });
    if (olGeometry === null) {
        return null;
    }

    const wgs84 = format.writeGeometryObject(olGeometry, {
        dataProjection: 'OGC:CRS84',
        featureProjection: 'OGC:CRS84',
    });

    const buffered = buffer(wgs84, distance, { units: 'meters' });
    if (buffered === undefined) {
        return null;
    }

    if (buffered.type === 'FeatureCollection') {
        return {
            type: 'GeometryCollection',
            geometries: buffered.features.map((feature) => feature.geometry),
        };
    }

    return buffered.geometry;
}
