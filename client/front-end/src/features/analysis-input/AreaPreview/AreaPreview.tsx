import { useMemo, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { bufferGeometry } from '@/lib/geo/buffer';
import { getProjection } from '@/lib/geo/crs';
import GeoJson from './GeoJson/GeoJson';
import MapView from './MapView/MapView';
import { useAppSelector } from '@/app/hooks';
import { parseRequestedBuffer } from '../Form/Form.helpers';
import { Tabs } from 'dibk-designsystemet';
import styles from './AreaPreview.module.scss';

import type { LonLat } from '@/types/geo.types';

const BUFFER_DEBOUNCE_MS = 100;

interface AreaPreviewProps {
    currentLocation: LonLat | null;
}

export default function AreaPreview({ currentLocation }: AreaPreviewProps) {
    const geometry = useAppSelector(
        (state) => state.app.formData.inputGeometry,
    );
    const title = useAppSelector((state) => state.app.area?.title ?? null);
    const requestedBuffer = useAppSelector(
        (state) => state.app.formData.requestedBuffer,
    );

    // Bufferen beregnes først når brukeren har sluttet å skrive i bufferfeltet
    const bufferDistance = useDebounce(
        parseRequestedBuffer(requestedBuffer),
        BUFFER_DEBOUNCE_MS,
    );

    const bufferedGeometry = useMemo(() => {
        return geometry !== null
            ? bufferGeometry(geometry, bufferDistance)
            : null;
    }, [geometry, bufferDistance]);

    const [selectedTab, setSelectedTab] = useState('map');

    // GeoJSON-fanen er deaktivert uten analyseområde, så da vises kartet selv om GeoJSON var valgt
    const activeTab = geometry === null ? 'map' : selectedTab;

    function handleTabChange(tab: string) {
        // Tabs.Tab kaller onChange også når fanen har aria-disabled
        if (tab === 'geojson' && geometry === null) {
            return;
        }

        setSelectedTab(tab);
    }

    return (
        <div>
            <div className={styles.areaHeading}>
                {geometry !== null && title !== null
                    ? title.map((part, index) => (
                          <span key={index}>{part}</span>
                      ))
                    : 'Analyseområde ikke valgt'}
            </div>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                className={styles.tabs}
            >
                <Tabs.List>
                    <Tabs.Tab value="map">Kart</Tabs.Tab>
                    <Tabs.Tab
                        value="geojson"
                        // ds-tab er et custom element, så React rendrer true som en tom streng
                        aria-disabled={`${geometry === null}`}
                    >
                        GeoJSON
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel
                    value="map"
                    className={styles.tabPanel}
                >
                    <div className={styles.map}>
                        <MapView
                            geometry={geometry}
                            bufferedGeometry={bufferedGeometry}
                            currentLocation={currentLocation}
                        />
                    </div>
                </Tabs.Panel>
                <Tabs.Panel
                    value="geojson"
                    className={styles.tabPanel}
                >
                    <div className={styles.geojson}>
                        <GeoJson data={geometry} />
                    </div>
                </Tabs.Panel>
            </Tabs>

            {geometry !== null && (
                <span className={styles.crs}>{getProjection(geometry)}</span>
            )}
        </div>
    );
}
