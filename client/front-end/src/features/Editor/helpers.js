import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { getEditLayer, getLayer } from 'utils/map';
import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
// import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import UndoRedo from './UndoRedo';
import { getFeaturesLayer } from 'utils/map/helpers';

export const GeometryType = {
   Point: 'Point',
   LineString: 'LineString',
   Polygon: 'Polygon',
   MultiPoint: 'MultiPoint',
   MultiLineString: 'MultiLineString',
   MultiPolygon: 'MultiPolygon',
   GeometryCollection: 'GeometryCollection'
};

export const Color = {
   DEFAULT_FEATURE_COLOR: '#3767c7',
   SELECTED_FEATURE_COLOR: '#fe5000',
   ANALYSIS_FEATURE_COLOR: '#249446',
   CLUSTER_FONT_COLOR: '#ffffff'
};

export function createModifyGeometryStyle() {
   return new Style({
      image: new CircleStyle({
         radius: 9,
         fill: new Fill({
            color: Color.SELECTED_FEATURE_COLOR,
         }),
      }),
   });
}

export function createDrawLineStringStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR,
            }),
         }),
      }),
   ];
}

export function createDrawPolygonStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`,
         }),
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR,
            }),
         }),
      }),
   ];
}

export function createDrawPolygonHoleStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`,
         }),
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR,
            }),
         }),
      }),
   ];
}

export function createSelectGeometryStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         stroke: new Stroke({
            color: '#ffffff',
            width: 8,
         }),
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`,
         }),
      }),
   ];
}

export function getEditedFeature(map) {
   const layer = getFeaturesLayer(map);

   return layer.getSource().getFeatures()[0] || null;
}
