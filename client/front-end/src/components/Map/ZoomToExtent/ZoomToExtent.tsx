import { getLayer } from '@/lib/map/map';
import type OlMap from 'ol/Map';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import styles from './ZoomToExtent.module.scss';

interface ZoomToExtentProps {
    map: OlMap;
}

export default function ZoomToExtent({ map }: ZoomToExtentProps) {
    function zoomToExtent() {
        const vectorSource = getLayer<VectorLayer<VectorSource>>(map, 'features')?.getSource();

        if (!vectorSource) {
            return;
        }

        const features = vectorSource.getFeatures();

        if (features.length > 0) {
            const extent = vectorSource.getExtent()!;
            const view = map.getView();

            view.fit(extent, { 
                size: map.getSize(), 
                padding: [50, 50, 50, 50],
                duration: 250
            });
        }
    }

    return (
        <button
            className={styles.button}
            onClick={zoomToExtent}
            title="Zoom til kartets utstrekning"
        >
            <span>E</span>
        </button>
    );
}