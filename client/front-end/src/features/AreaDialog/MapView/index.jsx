import { useEffect, useRef, useState } from 'react';
import { createAreaMap } from 'utils/map';
import { setupMap } from './helpers';
import { Zoom, ZoomToExtent } from 'components/Map';
import styles from './MapView.module.scss';
import { Editor } from 'features';
import { useSelector } from 'react-redux';

export default function MapView({ geometry, currentLocation }) {
    const [map, setMap] = useState(null);
    const mapElementRef = useRef(null);
    const mapRendered = useSelector(state => state.app.mapRendered);

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
            {
                mapRendered && (
                    <div className={styles.editor}>
                        <Editor map={map} />
                    </div>
                )
            }
        </div>
    );
}