const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

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

export function parseJson(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function createRandomId() {
    return `_${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`;
}
