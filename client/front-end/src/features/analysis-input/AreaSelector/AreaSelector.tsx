import { useDeferredValue, useMemo, useState } from 'react';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { api } from '@/lib/api/api';
import { bufferGeometry } from '@/lib/geo/buffer';
import GeoJson from './GeoJson/GeoJson';
import MapView from './MapView/MapView';
import SampleSelector from './SampleSelector/SampleSelector';
import Search from './Search/Search';
import { apiFetch } from '@/app/apiFetch';
import { setFormData } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { parseRequestedBuffer } from '../Form/Form.helpers';
import FilePicker from '@/components/FilePicker/FilePicker';
import { Button, Heading, Popover, Tabs } from 'dibk-designsystemet';
import { QuestionmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './AreaSelector.module.scss';

import type { AreaFeature, Sample } from '@/types/api.types';
import type { CrsGeometry } from '@/types/geo.types';

const DEFAULT_EPSG = 25833;

export default function AreaSelector() {
    const geometry = useAppSelector(
        (state) => state.app.formData.inputGeometry,
    );
    const requestedBuffer = useAppSelector(
        (state) => state.app.formData.requestedBuffer,
    );

    // Holder bufferfeltet responsivt mens bufferen beregnes på nytt
    const bufferDistance = useDeferredValue(
        parseRequestedBuffer(requestedBuffer),
    );
    const bufferedGeometry = useMemo(
        () =>
            geometry !== null ? bufferGeometry(geometry, bufferDistance) : null,
        [geometry, bufferDistance],
    );
    const [selectedTab, setSelectedTab] = useState('map');
    const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const currentLocation = useCurrentLocation();
    const dispatch = useAppDispatch();

    function setGeometry(value: CrsGeometry | null) {
        dispatch(setFormData({ name: 'inputGeometry', value }));
    }

    async function handleFileSelected(file: File | null) {
        if (file === null) {
            return;
        }

        try {
            const geoJson = await apiFetch(api.endpoints.getOmråde, {
                file,
                epsg: DEFAULT_EPSG,
            });
            if (geoJson !== null) {
                setSelectedSample(null);
                setTitle(file.name);
                setGeometry(geoJson);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleSampleSelected(sample: Sample) {
        setSelectedSample(sample);
        setTitle(sample.fileName);
        setGeometry(sample.geoJson);
    }

    function handleSearchResponse(feature: AreaFeature) {
        setSelectedSample(null);
        setTitle(feature.properties.tittel);
        setGeometry(feature.geometry);
    }

    return (
        <section className={styles.areaSelector}>
            <Heading level={2}>
                Analyseområde{title !== null ? `: ${title}` : ''}
            </Heading>

            <div className={styles.top}>
                <div>
                    {/* Search leser kommunenummeret kun ved første rendring, så den rendres på nytt når posisjonen er funnet */}
                    <Search
                        key={currentLocation.kommunenummer ?? ''}
                        onResponse={handleSearchResponse}
                        kommunenummer={currentLocation.kommunenummer}
                    />
                </div>

                <div className={styles.topRight}>
                    <div className={styles.filePicker}>
                        <FilePicker
                            label="Legg til fil"
                            fileTypes={[
                                'json',
                                'geojson',
                                'sos',
                                'sosi',
                                'gml',
                                'gpkg',
                            ]}
                            onFileSelected={handleFileSelected}
                        />

                        <Button
                            icon
                            variant="tertiary"
                            popovertarget="fileTypes"
                            className={styles.popover}
                        >
                            <QuestionmarkCircleFillIcon
                                fontSize="24px"
                                aria-hidden
                            />
                        </Button>

                        <Popover
                            id="fileTypes"
                            placement="top"
                        >
                            GeoJSON, GML, SOSI, GeoPackage
                        </Popover>
                    </div>

                    <div className={styles.sampleSelector}>
                        <SampleSelector
                            selectedSample={selectedSample}
                            onSampleSelect={handleSampleSelected}
                        />
                    </div>
                </div>
            </div>

            <Tabs
                value={selectedTab}
                onChange={setSelectedTab}
                className={styles.tabs}
            >
                <Tabs.List>
                    <Tabs.Tab value="map">Kart</Tabs.Tab>
                    <Tabs.Tab value="geojson">GeoJSON</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel
                    value="map"
                    className={styles.tabPanel}
                >
                    <div className={styles.map}>
                        <MapView
                            geometry={geometry}
                            bufferedGeometry={bufferedGeometry}
                            currentLocation={currentLocation.coordinates}
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
        </section>
    );
}
