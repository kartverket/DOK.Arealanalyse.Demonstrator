import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentLocation } from 'hooks';
import { createAreaMap } from 'utils/map';
import { setupMap } from './helpers';
import { Editor } from 'features';
import { Zoom, ZoomToExtent } from 'components/Map';
import styles from './MapView.module.scss';

export default function MapView({ dialogOpen, geometry }) {
    const [map, setMap] = useState(null);
    const mapElementRef = useRef(null);
    const { coordinates } = useCurrentLocation();

    useEffect(
        () => {
            if (geometry === null && coordinates === null) {
                return;
            }

            (async () => {
                const olMap = await createAreaMap(geometry);
                setMap(olMap);
            })();
        },
        [geometry, coordinates]
    );

    useEffect(
        () => {
            if (dialogOpen && map !== null) {
                map.setTarget(mapElementRef.current);
            }
        },
        [dialogOpen, map]
    )

    useEffect(
        () => {
            if (map === null) {
                return;
            }

            // const mapElement = document.createElement('div');
            // Object.assign(mapElement.style, { position: 'absolute', top: '-9999px', left: '-9999px', width: `600px`, height: `600px` });
            // document.getElementsByTagName('body')[0].appendChild(mapElement);

            // map.setTarget(mapElementRef.current);
            setupMap(map, coordinates);

            return () => {
                map.dispose();
            }
        },
        [map, coordinates]
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
            <div className={styles.editor}>
                <Editor map={map} />
            </div>
        </div>
    );
}