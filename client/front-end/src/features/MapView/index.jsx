import { useRef, useState, useEffect } from 'react';
import { createMap } from 'utils/map';
import { setupMap } from './helpers';
import Zoom from './Zoom';
import ZoomToExtent from './ZoomToExtent';
import Expand from './Expand';
import styles from './MapView.module.scss';

export default function MapView({ result, inputGeometry }) {
    const [map, setMap] = useState(null);
    const mapElementRef = useRef(null);

    useEffect(
        () => {
            (async () => {
                const olMap = await createMap({
                    geometry: inputGeometry,
                    bufferedGeometry: result.buffer > 0 ? result.runOnInputGeometry : null,
                    wmsUrl: result.rasterResult.mapUri
                });

                setMap(olMap);
            })();
        },
        [result, inputGeometry]
    );

    useEffect(
        () => {
            if (map === null) {
                return;
            }

            map.setTarget(mapElementRef.current);
            setupMap(map);

            return () => {
                map.dispose();
            }
        },
        [map]
    );

    return (
        <div className={styles.mapContainer}>
            <div ref={mapElementRef} className={styles.map}></div>
            {
                map !== null && (
                    <div className={styles.buttons}>
                        <Zoom map={map} />
                        <ZoomToExtent map={map} />
                        <Expand />
                    </div>
                )
            }
        </div>
    );
}