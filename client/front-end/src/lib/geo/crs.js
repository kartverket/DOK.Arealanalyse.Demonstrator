const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

export function getProjection(geometry) {
    const crsName = getCrsName(geometry);
    const epsgCode = getEpsgCode(crsName);

    if (epsgCode !== null) {
        return `EPSG:${epsgCode}`;
    }

    return 'OGC:CRS84';
}

export function getEpsgCode(crsName) {
    if (!crsName) {
        return null;
    }

    const match = EPSG_REGEX.exec(crsName);

    return match !== null ?
        match.groups.epsg :
        null;
}

export function getCrsName(geoJson) {
    return geoJson?.crs?.properties?.name;
}

export function addCrsName(geoJson, epsg) {
    geoJson.crs = {
        type: 'name',
        properties: {
            name: `urn:ogc:def:crs:EPSG::${epsg}`
        }
    }
}
