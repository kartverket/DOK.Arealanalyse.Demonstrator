import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api, apiFetch } from 'store/api';
import { Button, Heading, Tabs } from '@digdir/designsystemet-react';
import { Dialog, FileUpload } from 'components';
import GeoJson from './GeoJson';
import MapView from './MapView';
import SampleSelector from './SampleSelector';
import Search from './Search';
import AreaIcon from 'assets/gfx/icon-area.svg?react'
// import { QuestionmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './AreaDialog.module.scss';
import { setFormData } from 'store/slices/appSlice';
import { useCurrentLocation } from 'hooks';
import { Editor } from 'features';
import { createAreaMap } from 'utils/map';
import { addInteractions } from 'utils/map/interactions';
import { XMarkOctagonFillIcon } from '@navikt/aksel-icons';

const DEFAULT_EPSG = 25833;

export default function AreaDialog({ onOk }) {
    const [open, setOpen] = useState(false);
    const [map, setMap] = useState(null);
    const [selectedTab, setSelectedTab] = useState('map');
    const [selectedSample, setSelectedSample] = useState(null);
    const [title, setTitle] = useState(null);
    const geometry = _geometry; // useSelector(state => state.app.formData.inputGeometry);
    const { coordinates } = useCurrentLocation();
    const dispatch = useDispatch();
    const mapRendered = useSelector(state => state.app.mapRendered);
    const initRef = useRef(true);
    const isValid = useSelector(state => state.areaMap.isValid);

    useEffect(
        () => {
            if (geometry === null || !initRef.current) {
                return;
            }

            (async () => {
                initRef.current = false;
                const map = await createAreaMap(geometry);

                addInteractions(map);
                setMap(map);                
            })();
        },
        [geometry]
    );

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
                dispatch(setFormData({ name: 'inputGeometry', value: geoJson }))
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleSampleSelected(sample) {
        setSelectedSample(sample)
        setTitle(sample.fileName);
        dispatch(setFormData({ name: 'inputGeometry', value: sample.geoJson }))
    }

    function handleSearchResponse(feature) {
        setSelectedSample(null);
        setTitle(feature.properties.tittel)
        dispatch(setFormData({ name: 'inputGeometry', value: feature.geometry }))
    }

    function renderDialog() {
        return (
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                closeButton={false}
                className={styles.areaDialog}
            >
                <Heading>Analyseområde{title !== null ? `: ${title}` : ''}</Heading>

                <div className={styles.content}>
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
                                <div className={styles.addArea}>
                                    <Heading level={3}>Legg til område</Heading>

                                    <Tabs defaultValue="upload">
                                        <Tabs.List>
                                            <Tabs.Tab value="search">Søk</Tabs.Tab>
                                            <Tabs.Tab value="upload">Last opp</Tabs.Tab>
                                            <Tabs.Tab value="draw">Tegn</Tabs.Tab>
                                            <Tabs.Tab value="samples">Eksempler</Tabs.Tab>
                                        </Tabs.List>

                                        <Tabs.Panel value="search">
                                            <Search
                                                onResponse={handleSearchResponse}
                                            />
                                        </Tabs.Panel>
                                        <Tabs.Panel value="upload">
                                            <div className={styles.panel}>
                                                <FileUpload
                                                    onFileSelected={handleFileSelected}
                                                />
                                            </div>
                                        </Tabs.Panel>
                                        <Tabs.Panel value="draw">
                                            <Editor map={map} />
                                        </Tabs.Panel>
                                        <Tabs.Panel value="samples">
                                            <div className={styles.panel}>
                                                <SampleSelector
                                                    selectedSample={selectedSample}
                                                    onSampleSelect={handleSampleSelected}
                                                />
                                            </div>
                                        </Tabs.Panel>
                                    </Tabs>
                                </div>

                                <MapView
                                    map={map}
                                    currentLocation={coordinates}
                                    dialogOpen={open}
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
                            disabled={geometry === null || !isValid}
                        >
                            OK
                        </Button>

                        <Button
                            onClick={cancel}
                            variant="secondary"
                        >
                            Avbryt
                        </Button>

                        {
                            !isValid && (
                                <div className={styles.error}>
                                    <XMarkOctagonFillIcon />
                                    Analyseområdet er ugyldig
                                </div>
                            )
                        }
                    </div>
                </div>
            </Dialog>
        );
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

            {renderDialog()}
        </>
    );
}

const _geometry = {
    "type": "MultiPolygon",
    "coordinates": [
        [
            [
                [
                    196245.008,
                    6562107.572
                ],
                [
                    196229.591,
                    6562103.926
                ],
                [
                    196222.105,
                    6562110.753
                ],
                [
                    196199.112,
                    6562159.204
                ],
                [
                    196268.705,
                    6562181.558
                ],
                [
                    196265.603,
                    6562198.885
                ],
                [
                    196264.261,
                    6562206.183
                ],
                [
                    196273.401,
                    6562215.36
                ],
                [
                    196281.051,
                    6562202.106
                ],
                [
                    196285.908,
                    6562182.168
                ],
                [
                    196297.046,
                    6562141.811
                ],
                [
                    196276.525,
                    6562135.399
                ],
                [
                    196253.464,
                    6562118.641
                ],
                [
                    196245.008,
                    6562107.572
                ]
            ]
        ],
        [
            [
                [
                    196343.502,
                    6562224.953
                ],
                [
                    196344.651,
                    6562222.869
                ],
                [
                    196344.928,
                    6562221.929
                ],
                [
                    196345.622,
                    6562219.926
                ],
                [
                    196346.472,
                    6562216.975
                ],
                [
                    196347.067,
                    6562215.554
                ],
                [
                    196347.084,
                    6562215.513
                ],
                [
                    196345.606,
                    6562214.842
                ],
                [
                    196338.31,
                    6562211.63
                ],
                [
                    196334.274,
                    6562220.829
                ],
                [
                    196341.57,
                    6562224.041
                ],
                [
                    196343.502,
                    6562224.953
                ]
            ]
        ]
    ],
    "crs": {
        "type": "name",
        "properties": {
            "name": "urn:ogc:def:crs:EPSG::25833"
        }
    }
};