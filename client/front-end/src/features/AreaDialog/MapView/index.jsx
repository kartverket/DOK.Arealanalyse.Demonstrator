import { useEffect, useRef } from 'react';
import { setupMap } from './helpers';
import { Zoom, ZoomToExtent } from 'components/Map';
import styles from './MapView.module.scss';

export default function MapView({ map, currentLocation, dialogOpen }) {
    const mapElementRef = useRef(null);

    useEffect(
        () => {
            if (map !== null && dialogOpen) {
                map.setTarget(mapElementRef.current);
            }
        },
        [map, dialogOpen]
    );

    useEffect(
        () => {
            if (map === null) {
                return;
            }

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