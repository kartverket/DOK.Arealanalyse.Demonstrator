import { getLayer } from 'utils/map';
import basemap from 'config/basemap.config';

export function setupMap(map) {
    const vectorLayer = getLayer(map, 'feature');
    const extent = vectorLayer.getSource().getExtent();
    const view = map.getView();

    view.fit(extent, map.getSize());
    view.setMinZoom(basemap.minZoom);
    view.setMaxZoom(basemap.maxZoom);

    const currentZoom = view.getZoom();

    if (currentZoom > basemap.maxZoom) {
        view.setZoom(basemap.maxZoom);
    }
}