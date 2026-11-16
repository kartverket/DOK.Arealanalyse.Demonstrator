import { memo, useEffect, useRef, useState } from 'react';
import { createMap, setBufferedGeometry, setGeometry } from '@/lib/map/map';
import basemap from '@/config/basemap.config';
import {
    fitToFeatures,
    setupMap,
    zoomToFeatures,
    zoomToLocation,
} from './MapView.helpers';
import Zoom from '@/components/Map/Zoom/Zoom';
import ZoomToExtent from '@/components/Map/ZoomToExtent/ZoomToExtent';
import styles from './MapView.module.scss';

import type { CrsGeometry, LonLat } from '@/types/geo.types';
import type OlMap from 'ol/Map';

interface MapViewProps {
    geometry: CrsGeometry | null;
    bufferedGeometry: CrsGeometry | null;
    currentLocation: LonLat | null;
}

// memo: AreaPreview rendres på nytt for hvert tastetrykk i bufferfeltet, mens bufferen kun endres etter debounce
export default memo(function MapView({
    geometry,
    bufferedGeometry,
    currentLocation,
}: MapViewProps) {
    const [map, setMap] = useState<OlMap | null>(null);
    const mapElementRef = useRef<HTMLDivElement>(null);
    const geometryRef = useRef<CrsGeometry | null>(null);

    // Kartet lages én gang, og området og bufferen byttes ut i kartlaget
    useEffect(() => {
        let olMap: OlMap | null = null;
        let cancelled = false;

        (async () => {
            const created = await createMap({
                geometry: null,
                wmtsLayer: basemap.layers.topograatone,
            });

            if (cancelled) {
                created.dispose();
                return;
            }

            created.setTarget(mapElementRef.current ?? undefined);
            setupMap(created);
            olMap = created;
            setMap(created);
        })();

        return () => {
            cancelled = true;
            olMap?.dispose();
        };
    }, []);

    useEffect(() => {
        if (map === null) {
            return;
        }

        const areaChanged = geometry !== geometryRef.current;

        geometryRef.current = geometry;

        setGeometry(map, geometry);
        setBufferedGeometry(map, bufferedGeometry);

        // Et nytt område gir nytt utsnitt, mens en ny buffer bare zoomer ut ved behov
        if (areaChanged) {
            zoomToFeatures(map);
        } else {
            fitToFeatures(map);
        }
    }, [map, geometry, bufferedGeometry]);

    useEffect(() => {
        if (map !== null && currentLocation !== null) {
            zoomToLocation(map, currentLocation);
        }
    }, [map, currentLocation]);

    return (
        <div className={styles.mapContainer}>
            <div
                ref={mapElementRef}
                className={styles.map}
            ></div>
            {/* Uten område eller posisjon har kartet ikke noe utsnitt å zoome i */}
            {map !== null &&
                (geometry !== null || currentLocation !== null) && (
                    <div className={styles.buttons}>
                        <Zoom map={map} />
                        <ZoomToExtent map={map} />
                    </div>
                )}
        </div>
    );
});
