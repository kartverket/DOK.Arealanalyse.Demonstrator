import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createMap, type WmtsLayerName } from '@/lib/map/map';
import { setupMap } from './MapView.helpers';
import { MapControl } from '../Map.constants';
import Zoom from '../Zoom/Zoom';
import ZoomToExtent from '../ZoomToExtent/ZoomToExtent';
import type OlMap from 'ol/Map';
import type { CrsGeometry } from '@/types/geo.types';
import styles from './MapView.module.scss';

interface MapViewProps {
    geometry: CrsGeometry;
    bufferedGeometry: CrsGeometry | null;
    wmtsLayer: WmtsLayerName;
    wmsUrl?: string | null;
    controls?: MapControl[];
    className?: string;
    children?: ReactNode;
}

export default function MapView({ geometry, bufferedGeometry, wmtsLayer, wmsUrl = null, controls = [], className = '', children }: MapViewProps) {
    const [map, setMap] = useState<OlMap | null>(null);
    const mapElementRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            (async () => {
                const olMap = await createMap({
                    geometry,
                    bufferedGeometry,
                    wmtsLayer,
                    wmsUrl
                });

                setMap(olMap);
            })();
        },
        [geometry, bufferedGeometry, wmtsLayer, wmsUrl]
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
        <div className={`${styles.mapContainer} ${className}`}>
            <div ref={mapElementRef} className={styles.map}></div>
            {
                map !== null && (
                    <div className={styles.buttons}>
                        {
                            controls.includes(MapControl.ZOOM) && (
                                <Zoom map={map} />
                            )
                        }
                        {
                            controls.includes(MapControl.ZOOM_TO_EXTENT) && (
                                <ZoomToExtent map={map} />
                            )
                        }
                        {children}
                    </div>
                )
            }
        </div>
    );
}
