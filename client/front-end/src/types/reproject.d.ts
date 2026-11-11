declare module 'reproject' {
    import type { GeoJSON } from 'geojson';

    export function reproject<T extends GeoJSON>(
        geojson: T,
        from: string,
        to: string,
        crss?: Record<string, unknown>,
    ): T;
}
