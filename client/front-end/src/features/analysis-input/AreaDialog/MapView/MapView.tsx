import { useEffect, useRef, useState } from 'react';
import { createMap } from '@/lib/map/map';
import { setupMap } from './MapView.helpers';
import Zoom from '@/components/Map/Zoom/Zoom';
import ZoomToExtent from '@/components/Map/ZoomToExtent/ZoomToExtent';
import basemap from '@/config/basemap.config';
import type OlMap from 'ol/Map';
import type { CrsGeometry, LonLat } from '@/types/geo.types';
import styles from './MapView.module.scss';

interface MapViewProps {
    geometry: CrsGeometry | null;
    currentLocation: LonLat | null;
}

export default function MapView({ geometry, currentLocation }: MapViewProps) {
    const [map, setMap] = useState<OlMap | null>(null);
    const mapElementRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            if (geometry === null && currentLocation === null) {
                return;
            }

            (async () => {
                const olMap = await createMap({
                    geometry,
                    wmtsLayer: basemap.layers.topograatone
                });

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

            map.setTarget(mapElementRef.current ?? undefined);
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