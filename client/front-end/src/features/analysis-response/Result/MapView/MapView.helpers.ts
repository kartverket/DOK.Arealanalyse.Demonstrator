import { getLayer } from '@/lib/map/map';
import basemap from '@/config/basemap.config';
import type OlMap from 'ol/Map';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';

export function setupMap(map: OlMap): void {
    const vectorSource = getLayer<VectorLayer<VectorSource>>(map, 'features')?.getSource();

    if (!vectorSource) {
        return;
    }

    const extent = vectorSource.getExtent()!;
    const view = map.getView();

    view.fit(extent);
    view.setMinZoom(basemap.minZoom);
    view.setMaxZoom(basemap.maxZoom);

    const currentZoom = view.getZoom();

    if (currentZoom !== undefined && currentZoom > basemap.maxZoom) {
        view.setZoom(basemap.maxZoom);
    }
}