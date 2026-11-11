import type { Geometry } from 'geojson';

export interface NamedCrs {
    type: 'name';
    properties: {
        name: string;
    };
}

export type CrsGeometry = Geometry & {
    crs?: NamedCrs;
};

export type LonLat = [lon: number, lat: number];
