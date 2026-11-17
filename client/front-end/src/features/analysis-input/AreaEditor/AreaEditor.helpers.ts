import union from '@turf/union';
import dayjs from 'dayjs';
import GeoJSON from 'ol/format/GeoJSON';
import { transformExtent } from 'ol/proj';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { MAP_PROJECTION } from '@/lib/map/map';

import type { AreaInfo } from '@/app/appSlice';
import type { CrsGeometry } from '@/types/geo.types';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { Extent } from 'ol/extent';
import type Geometry from 'ol/geom/Geometry';

// Områder fra editoren skrives i samme projeksjon som /omrade og analysen bruker
export const OUTPUT_EPSG = 25833;

// Samme presisjon som /omrade bruker for projiserte koordinater
const COORDINATE_DECIMALS = 2;

// Utsnittet som vises når det verken finnes et område eller en posisjon å zoome til
export const NORWAY_EXTENT: Extent = transformExtent(
    [4, 57.7, 31, 71.6],
    'EPSG:4326',
    MAP_PROJECTION,
);

export function getEditorStyle(): Style {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 3,
        }),
        // Uten fyll kan polygonet bare velges ved å treffe kanten
        fill: new Fill({
            color: 'rgb(211 51 51 / 15%)',
        }),
    });
}

export function writeGeometry(geometry: Geometry): CrsGeometry {
    const writer = new GeoJSON();
    const geoJson = writer.writeGeometryObject(geometry, {
        dataProjection: `EPSG:${OUTPUT_EPSG}`,
        featureProjection: MAP_PROJECTION,
        decimals: COORDINATE_DECIMALS,
    }) as CrsGeometry;
    return {
        ...geoJson,
        crs: {
            type: 'name',
            properties: {
                name: `urn:ogc:def:crs:EPSG::${OUTPUT_EPSG}`,
            },
        },
    };
}

export function unionGeometries(first: Geometry, second: Geometry): Geometry {
    const writer = new GeoJSON();
    const collection: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [first, second].map((geometry) => ({
            type: 'Feature',
            geometry: writer.writeGeometryObject(geometry) as
                | Polygon
                | MultiPolygon,
            properties: {},
        })),
    };

    const unioned = union(collection);
    const geometry =
        unioned !== null ? writer.readGeometry(unioned.geometry) : null;
    return geometry ?? first.clone();
}

export function geometryToFile(geometry: CrsGeometry): File {
    return new File([JSON.stringify(geometry)], 'analyseområde.geojson', {
        type: 'application/geo+json',
    });
}

export function downloadGeometry(geometry: CrsGeometry): void {
    const json = JSON.stringify(geometry, null, 2);
    const blob = new Blob([json], {
        type: 'application/geo+json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyseområde-${dayjs().format('YYYYMMDDHHmmss')}.geojson`;
    link.click();

    URL.revokeObjectURL(url);
}

// Navnet på området som redigeres, så tittelen viser hva det er laget fra
export function getEditedAreaName(area: AreaInfo | null): string | null {
    if (area === null) {
        return null;
    }

    if (area.source.type === 'drawn') {
        return area.source.name;
    }

    return area.title[1] ?? null;
}
