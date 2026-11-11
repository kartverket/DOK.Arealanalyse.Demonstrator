import { useEffect, useRef, useState } from 'react';
import { createAreaMap } from '@/lib/map/map';
import { setupMap } from './MapView.helpers';
import Zoom from '@/components/Map/Zoom/Zoom';
import ZoomToExtent from '@/components/Map/ZoomToExtent/ZoomToExtent';
import styles from './MapView.module.scss';

export default function MapView({ geometry, currentLocation }) {
    const [map, setMap] = useState(null);
    const mapElementRef = useRef(null);

    useEffect(
        () => {
            if (geometry === null && currentLocation === null) {
                return;
            }

            (async () => {
                const olMap = await createAreaMap(geometry);
                setMap(olMap);
            })();
        },
        [geometry, currentLocation]
    );

    useEffect(
        () => {
            if (map === null) {
                return;
            }

            map.setTarget(mapElementRef.current);
            setupMap(map, currentLocation);

            return () => {
                map.dispose();
            }
        },
        [map, currentLocation]
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