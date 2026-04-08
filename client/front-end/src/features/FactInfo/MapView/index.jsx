import { useRef, useState, useEffect } from 'react';
import { createFactInfoMap } from 'utils/map';
import { setupMap } from './helpers';
import { Zoom, ZoomToExtent } from 'components/Map';
import styles from './MapView.module.scss';

export default function MapView({ geometry, bufferedGeometry }) {
    const [map, setMap] = useState(null);
    const mapElementRef = useRef(null);

    useEffect(
        () => {
            (async () => {
                const olMap = await createFactInfoMap({
                    geometry,
                    bufferedGeometry
                });

                setMap(olMap);
            })();
        },
        [geometry, bufferedGeometry]
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
                    </div>
                )
            }
        </div>
    );
}