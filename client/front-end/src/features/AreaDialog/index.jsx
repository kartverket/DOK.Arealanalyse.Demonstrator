import { useState } from 'react';
import { api, apiFetch } from 'store/api';
import { useCurrentLocation } from 'hooks';
import { Button, Heading, Popover, Tabs } from '@digdir/designsystemet-react';
import { Dialog, FilePicker } from 'components';
import GeoJson from './GeoJson';
import MapView from './MapView';
import SampleSelector from './SampleSelector';
import Search from './Search';
import AreaIcon from 'assets/gfx/icon-area.svg?react'
import { QuestionmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './AreaDialog.module.scss';

const DEFAULT_EPSG = 25833;

export default function AreaDialog({ onOk }) {
    const [open, setOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('map');
    const [selectedSample, setSelectedSample] = useState(null);
    const [title, setTitle] = useState(null);
    const [geometry, setGeometry] = useState(null);
    const currentLocation = useCurrentLocation();
    
    function ok() {
        setOpen(false)
        onOk(geometry);
    }

    function cancel() {
        setOpen(false);
        setSelectedTab('map')
    }

    async function handleFileSelected(file) {
        if (file === null) {
            return;
        }

        try {
            const geoJson = await apiFetch(api.endpoints.getOmråde, { file, epsg: DEFAULT_EPSG });

            if (geoJson !== null) {
                setSelectedSample(null);
                setTitle(file.name);
                setGeometry(geoJson);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleSampleSelected(sample) {
        setSelectedSample(sample)
        setTitle(sample.fileName);
        setGeometry(sample.geoJson);
    }

    function handleSearchResponse(feature) {
        setSelectedSample(null);
        setTitle(feature.properties.tittel)
        setGeometry(feature.geometry);
    }

    function renderDialog() {
        if (currentLocation.loading) {
            return null;
        }

        return (
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                closeButton={false}
                className={styles.areaDialog}
            >
                <Heading>Analyseområde{title !== null ? `: ${title}` : ''}</Heading>

                <div className={styles.content}>
                    <div className={styles.top}>
                        <div>
                            <Search 
                                onResponse={handleSearchResponse}
                                kommunenummer={currentLocation.kommunenummer}    
                            />
                        </div>

                        <div className={styles.topRight}>
                            <div className={styles.filePicker}>
                                <FilePicker
                                    label="Legg til fil"
                                    fileTypes={['json', 'geojson', 'sos', 'sosi', 'gml', 'gpkg']}
                                    onFileSelected={handleFileSelected}
                                />

                                <Popover.TriggerContext>
                                    <Popover.Trigger
                                        icon
                                        variant="tertiary"
                                    >
                                        <QuestionmarkCircleFillIcon width={24} height={24} />
                                    </Popover.Trigger>
                                    <Popover placement="top">
                                        GeoJSON, GML, SOSI, GeoPackage
                                    </Popover>
                                </Popover.TriggerContext>
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
                            <Tabs.Tab value="map">
                                Kart
                            </Tabs.Tab>
                            <Tabs.Tab value="geojson">
                                GeoJSON
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="map" className={styles.tabPanel}>
                            <div className={styles.map}>
                                <MapView 
                                    geometry={geometry} 
                                    currentLocation={currentLocation.coordinates}    
                                />
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="geojson" className={styles.tabPanel}>
                            <div className={styles.geojson}>
                                <GeoJson data={geometry} />
                            </div>
                        </Tabs.Panel>
                    </Tabs>

                    <div className={styles.buttons}>
                        <Button
                            onClick={ok}
                            disabled={geometry === null}
                        >
                            OK
                        </Button>

                        <Button
                            onClick={cancel}
                            variant="secondary"
                        >
                            Avbryt
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                disabled={currentLocation === null}
                variant="secondary"
            >
                <AreaIcon
                    color="#3e6272"
                    width="18"
                    height="18"
                />
                Analyseområde
            </Button>

            {renderDialog()}
        </>
    );
}