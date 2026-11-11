import { useRef, useState, useEffect } from 'react';
import { createFactInfoMap } from '@/lib/map/map';
import { setupMap } from './MapView.helpers';
import Zoom from '@/components/Map/Zoom/Zoom';
import ZoomToExtent from '@/components/Map/ZoomToExtent/ZoomToExtent';
import type OlMap from 'ol/Map';
import type { CrsGeometry } from '@/types/geo.types';
import styles from './MapView.module.scss';

interface MapViewProps {
    geometry: CrsGeometry;
    bufferedGeometry: CrsGeometry | null;
}

export default function MapView({ geometry, bufferedGeometry }: MapViewProps) {
    const [map, setMap] = useState<OlMap | null>(null);
    const mapElementRef = useRef<HTMLDivElement>(null);

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

            map.setTarget(mapElementRef.current ?? undefined);
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