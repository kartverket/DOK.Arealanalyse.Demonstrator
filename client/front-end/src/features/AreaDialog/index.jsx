import { useState } from 'react';
import { Button, Dialog, Heading, Tabs } from '@digdir/designsystemet-react';
import { FilePicker } from 'components';
import GeoJson from './GeoJson';
import MapView from './MapView';
import SampleSelector from './SampleSelector';
import styles from './AreaDialog.module.scss';

export default function AreaDialog({ onOk }) {
    const [open, setOpen] = useState(false);
    const [filename, setFilename] = useState(null);
    const [geometry, setGeometry] = useState(null);

    function ok() {
        setOpen(false)
        onOk(geometry);
    }

    function cancel() {
        setOpen(false);
    }

    function handleFileSelected(file) {
        console.log(file);
    }

    async function handleSampleSelected(sample) {
        setFilename(sample.fileName);
        setGeometry(sample.geoJson);
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
            >
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
                                fileTypes={['json', 'geojson', 'sos', 'sosi', 'gml']}
                                onFileSelected={handleFileSelected}
                            />
                        </div>

                        <div className={styles.sampleSelector}>
                            <SampleSelector onSampleSelect={handleSampleSelected} />
                        </div>
                    </div>

                    <Tabs defaultValue="map" className={styles.tabs}>
                        <Tabs.List>
                            <Tabs.Tab value="map">Kart</Tabs.Tab>
                            <Tabs.Tab value="geojson">GeoJSON</Tabs.Tab>
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