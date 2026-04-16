import GeoJSON from 'ol/format/GeoJSON';

const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

export function getLayer(map, id) {
    return map.getLayers().getArray()
        .find(layer => layer.get('id') === id) || null;
}

export function getFeaturesLayer(map) {
    return getLayer(map, 'feature');
}

export function getEditLayer(map) {
    return getLayer(map, 'features-edit');
}

export function getFeature(map) {
    const layer = getFeaturesLayer(map);

    return layer.getSource().getFeatures()[0] || null;
}

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

export function readGeometry(geometry, options = {}) {
    if (geometry === null) {
        return null;
    }

    const { srcProj, destProj, precision = 0 } = options;
    let geoJsonOptions = {};

    if (srcProj && destProj) {
        geoJsonOptions = {
            dataProjection: srcProj,
            featureProjection: destProj
        };
    }

    if (precision > 0) {
        geoJsonOptions.decimals = precision;
    }

    return new GeoJSON().readGeometry(geometry, geoJsonOptions);
}

export function writeFeatureObject(feature, options = {}) {
    if (feature === null) {
        return null;
    }

    const { srcProj, destProj, precision = 0 } = options;
    let geoJsonOptions = {};

    if (srcProj && destProj) {
        geoJsonOptions = {
            dataProjection: srcProj,
            featureProjection: destProj
        };
    }

    if (precision > 0) {
        geoJsonOptions.decimals = precision;
    }

    return new GeoJSON().writeFeatureObject(feature, geoJsonOptions);
}

export function writeGeometryObject(geometry, options = {}) {
    if (geometry === null) {
        return null;
    }

    const { srcProj, destProj, precision = 0 } = options;
    let geoJsonOptions = {};

    if (srcProj && destProj) {
        geoJsonOptions = {
            dataProjection: srcProj,
            featureProjection: destProj
        };
    }

    if (precision > 0) {
        geoJsonOptions.decimals = precision;
    }

    return new GeoJSON().writeGeometryObject(geometry, geoJsonOptions);
}

export function getInteraction(map, name) {
    return map.getInteractions()
        .getArray()
        .find(interaction => interaction.get('_name') === name) || null;
}