import { useState } from 'react';
import { getArea } from 'utils/api';
import { Button, Heading, Popover, Tabs } from '@digdir/designsystemet-react';
import { Dialog, FilePicker } from 'components';
import GeoJson from './GeoJson';
import MapView from './MapView';
import SampleSelector from './SampleSelector';
import AreaIcon from 'assets/gfx/icon-area.svg?react'
import { QuestionmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './AreaDialog.module.scss';

export default function AreaDialog({ onOk }) {
    const [open, setOpen] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [filename, setFilename] = useState(null);
    const [geometry, setGeometry] = useState(null);

    function ok() {
        setOpen(false)
        onOk(geometry);
    }

    function cancel() {
        setOpen(false);
    }

    async function handleFileSelected(file) {
        if (file === null) {
            return;
        }

        const geoJson = await getArea(file);

        if (geoJson !== null) {
            setSelectedSample(null);
            setFilename(file.name);
            setGeometry(geoJson);
        }
    }

    function handleSampleSelected(sample) {
        setSelectedSample(sample)
        setFilename(sample.fileName);
        setGeometry(sample.geoJson);
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="secondary"
            >
                <AreaIcon
                    color="#3e6272"
                    width="18"
                    height="18"
                />
                Analyseområde
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                closeButton={false}
                className={styles.areaDialog}
            >
                <Heading>Analyseområde{filename !== null ? `: ${filename}` : ''}</Heading>

                <div className={styles.content}>
                    <div className={styles.top}>
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

                    <Tabs defaultValue="map" className={styles.tabs}>
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
                                <MapView geometry={geometry} />
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
        </>
    );
}