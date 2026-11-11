import type { CrsGeometry } from '@/types/geo.types';

const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

export function getProjection(geometry: CrsGeometry): string {
    const crsName = getCrsName(geometry);
    const epsgCode = getEpsgCode(crsName);

    if (epsgCode !== null) {
        return `EPSG:${epsgCode}`;
    }

    return 'OGC:CRS84';
}

export function getEpsgCode(crsName: string | undefined): string | null {
    if (!crsName) {
        return null;
    }

    const match = EPSG_REGEX.exec(crsName);

    return match?.groups?.epsg ?? null;
}

export function getCrsName(geoJson: CrsGeometry): string | undefined {
    return geoJson?.crs?.properties?.name;
}
