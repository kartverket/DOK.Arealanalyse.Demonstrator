import { getLayer } from 'utils/map';
import styles from './ZoomToExtent.module.scss';

export default function ZoomToExtent({ map }) {
    function zoomToExtent() {
        const vectorLayer = getLayer(map, 'features');
        const vectorSource = vectorLayer.getSource();
        const features = vectorSource.getFeatures();

        if (features.length > 0) {
            const extent = vectorLayer.getSource().getExtent();
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