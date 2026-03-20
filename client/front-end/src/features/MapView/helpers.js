import { getLayer } from 'utils/map';
import baseMap from 'config/baseMap.config';

export function setupMap(map) {
    const vectorLayer = getLayer(map, 'features');
    const extent = vectorLayer.getSource().getExtent();
    const view = map.getView();

    view.fit(extent, map.getSize());
    view.setMinZoom(baseMap.minZoom);
    view.setMaxZoom(baseMap.maxZoom);

    const currentZoom = view.getZoom();

    if (currentZoom > baseMap.maxZoom) {
        view.setZoom(baseMap.maxZoom);
    }
}