import { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { getFeaturesLayer, getLayer, getProjection } from './helpers';
import { createAreaStyle, createBufferStyle } from './styles';
import { MAP_EPSG } from './constants';

export function createAreaFeatureLayer(geometry) {
    const source = new VectorSource();

    if (geometry !== null) {
        const projection = getProjection(geometry);
        source.addFeature(createFeature(geometry, projection));
    }

    const layer = new VectorLayer({ 
        source, 
        style: createAreaStyle() 
    });

    layer.set('id', 'feature');

    return layer;
}

export function createFeatureLayer(geometry, bufferedGeometry = null) {
    const projection = getProjection(geometry);
    const source = new VectorSource();

    if (bufferedGeometry !== null) {
        source.addFeature(createFeature(bufferedGeometry, projection, createBufferStyle()));
    }

    source.addFeature(createFeature(geometry, projection, createAreaStyle()));

    const layer = new VectorLayer({ source });
    layer.set('id', 'feature');

    return layer;
}

export function createFeatureEditLayer() {
    const layer = new VectorLayer({
        source: new VectorSource(),
        style: createAreaStyle()
    });

    layer.set('id', 'feature-edit');

    return layer;
}

export function createFeature(geoJson, projection, style = null) {
    const reader = new GeoJSON();

    const geometry = reader.readGeometry(geoJson, {
        dataProjection: projection,
        featureProjection: MAP_EPSG
    });

    const feature = new Feature(geometry);

    if (style !== null) {
        feature.setStyle(style);
    }

    return feature;
}

export function setFeature(map, layerId, feature) {
    const layer = getLayer(map, layerId);
    const source = layer.getSource();

    source.clear();
    source.addFeature(feature);
}