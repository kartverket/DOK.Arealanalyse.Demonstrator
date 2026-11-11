export const MapControl = {
    EXPAND: 'EXPAND',
    ZOOM: 'ZOOM',
    ZOOM_TO_EXTENT: 'ZOOM_TO_EXTENT',
} as const;

export type MapControl = (typeof MapControl)[keyof typeof MapControl];
