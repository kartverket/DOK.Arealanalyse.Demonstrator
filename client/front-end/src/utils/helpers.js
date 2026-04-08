const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

export function getProjection(geometry) {
    const crsName = getCrsName(geometry);
    let epsgCode = 4326;

    if (crsName !== undefined) {
        epsgCode = getEpsgCode(crsName) || 4326;
    }

    return `EPSG:${epsgCode}`;
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

export function parseJson(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isEmptyObject(value) {
    return (
        value != null &&
        typeof value === 'object' &&
        Object.keys(value).length === 0
    );
}

export function createRandomId() {
    return `_${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`;
}