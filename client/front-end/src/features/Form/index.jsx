import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetState as resetAppState } from 'store/slices/progressSlice';
import { setBusy, setErrorMessage } from 'store/slices/appSlice';
import { setResponse } from 'store/slices/responseSlice';
import { analyze, fetcher } from 'utils/api';
import { mapResponse } from './helpers';
import { Button, Checkbox, CircularProgress, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem } from '@mui/material';
import { IntegerField } from 'components';
import { AreaDialog, GeometryDialog } from 'features';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './Form.module.scss';
import { Field, Input, Label, Select } from '@digdir/designsystemet-react';
import useSWR from 'swr';
import { useFetcher } from 'hooks';

export default function Form() {
    const [state, setState] = useState(getDefaultValues());
    const geometryDialogRef = useRef(null);
    const correlationId = useSelector(state => state.app.correlationId);
    const busy = useSelector(state => state.app.busy);
    const { data: themes = [] } = useFetcher('/dokthemes');
    const dispatch = useDispatch();

    function getDefaultValues() {
        return {
            inputGeometry: null,
            requestedBuffer: 0,
            context: '',
            theme: '',
            includeGuidance: true,
            includeQualityMeasurement: true,
            includeFilterChosenDOK: false,
            includeFacts: true,
            createBinaries: false
        };
    }

    function handleChange(event) {
        const value = event.target.type === 'checkbox' ?
            event.target.checked :
            event.target.value;

        setState({ ...state, [event.target.name]: value });
    }

    function handleGeometryDialogOk(polygon) {
        setState({ ...state, inputGeometry: polygon });
    }

    function handleAreaDialogOk(geometry) {
        console.log(geometry);
    }

    function canSubmit() {
        return !busy && state.inputGeometry !== null;
    }

    function getPayload() {
        const inputs = { ...state, };

        inputs.context = inputs.context !== '' ? inputs.context : null;
        inputs.theme = inputs.theme !== '' ? inputs.theme : null;
        inputs.correlationId = correlationId;

        return {
            inputs
        };
    }

    function resetState() {
        // setResponse(null);
        // clearCache();
        dispatch(resetAppState());
    }

    async function runAnalyses() {
        resetState();
        const payload = getPayload();

        try {
            dispatch(setBusy(true));
            const response = _data; // await analyze(payload);
            const mapped = mapResponse(response);
            dispatch(setResponse(mapped));
        } catch (error) {
            dispatch(setErrorMessage('Kunne ikke kjøre DOK-analyse. En feil har oppstått.'));
            console.log(error);
        } finally {
            dispatch(setBusy(false));
        }
    }

    return (
        <section className={styles.form}>
            <div className={styles.input}>
                <div className={styles.row}>
                    <div className={styles.addGeometry}>
                        {/* <GeometryDialog
                            ref={geometryDialogRef}
                            onOk={handleGeometryDialogOk}
                        /> */}
                        <AreaDialog onOk={handleAreaDialogOk} />
                        
                        <div className={styles.icons}>
                            <CheckCircleIcon
                                color="success"
                                sx={{
                                    display: state.inputGeometry !== null ? 'block !important' : 'none'
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <Field>
                            <Label>Buffer</Label>
                            <Field.Affixes>
                                <Input type="number" />
                                <Field.Affix>meter</Field.Affix>
                            </Field.Affixes>
                        </Field>
                    </div>
                    <div>
                        <Field>
                            <Label>Bruksområde</Label>
                            <Select defaultValue="">
                                <Select.Option value="" disabled>
                                    Velg bruksområde
                                </Select.Option>
                                <Select.Option value="Reguleringsplan">Reguleringsplan</Select.Option>
                                <Select.Option value="Kommuneplan">Kommuneplan</Select.Option>
                                <Select.Option value="Byggesak">Byggesak</Select.Option>
                            </Select>
                        </Field>
                        {/* <FormControl sx={{ width: 200 }}>
                            <InputLabel id="context-label">Bruksområde</InputLabel>
                            <Select
                                labelId="context-label"
                                id="context-select"
                                name="context"
                                value={state.context}
                                label="Velg bruksområde"
                                onChange={handleChange}
                            >
                                <MenuItem value="">Velg...</MenuItem>
                                <MenuItem value="Reguleringsplan">Reguleringsplan</MenuItem>
                                <MenuItem value="Kommuneplan">Kommuneplan</MenuItem>
                                <MenuItem value="Byggesak">Byggesak</MenuItem>
                            </Select>
                        </FormControl> */}
                    </div>
                    <div>
                        {/* // <FormControl sx={{ width: 200 }}>
                        //     <InputLabel id="theme-label">Tema</InputLabel>
                        //     <Select
                        //         labelId="theme-label"
                        //         id="theme-select"
                        //         name="theme"
                        //         value={state.theme}
                        //         label="Velg tema"
                        //         onChange={handleChange}
                        //     >
                        //         <MenuItem value="">Velg...</MenuItem>
                        //         <MenuItem value="Geologi">Geologi</MenuItem>
                        //         <MenuItem value="Kulturminner">Kulturminner</MenuItem>
                        //         <MenuItem value="Klima">Klima</MenuItem>
                        //         <MenuItem value="Kyst og fiskeri">Kyst og fiskeri</MenuItem>
                        //         <MenuItem value="Landbruk">Landbruk</MenuItem>
                        //         <MenuItem value="Natur">Natur</MenuItem>
                        //         <MenuItem value="Plan">Plan</MenuItem>
                        //         <MenuItem value="Samferdsel">Samferdsel</MenuItem>
                        //         <MenuItem value="Samfunnssikkerhet">Samfunnssikkerhet</MenuItem>
                        //     </Select>
                        // </FormControl> */}
                        <Field>
                            <Label>Tema</Label>
                            <Select defaultValue="">
                                <Select.Option value="" disabled>
                                    Velg tema
                                </Select.Option>
                                {
                                    themes.map(theme => (
                                        <Select.Option 
                                            key={theme}
                                            value={theme}
                                        >
                                            {theme}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Field>                        
                    </div>
                    <div className={styles.checkboxes}>
                        <div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="includeGuidance"
                                        checked={state.includeGuidance}
                                        onChange={handleChange}
                                    />
                                }
                                label="Inkluder veiledning" />
                        </div>
                        <div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="includeFilterChosenDOK"
                                        checked={state.includeFilterChosenDOK}
                                        onChange={handleChange}
                                    />
                                }
                                label="Inkluder kun kommunens valgte DOK-data" />
                        </div>
                        <div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="includeQualityMeasurement"
                                        checked={state.includeQualityMeasurement}
                                        onChange={handleChange}
                                    />
                                }
                                label="Inkluder kvalitetsinformasjon" />
                        </div>
                        <div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="createBinaries"
                                        checked={state.createBinaries}
                                        onChange={handleChange}
                                    />
                                }
                                label="Lag kartbilder og PDF-rapport" />
                        </div>
                        <div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="includeFacts"
                                        checked={state.includeFacts}
                                        onChange={handleChange}
                                    />
                                }
                                label="Inkluder faktainformasjon" />
                        </div>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.submit}>
                        <Button
                            onClick={runAnalyses}
                            variant="contained"
                        // disabled={!canSubmit()}
                        >
                            Start DOK-analyse
                        </Button>
                        {
                            busy && <CircularProgress size={30} />
                        }
                    </div>
                </div>
            </div>
        </section>
    );
}


const _data = {
    "resultList": [
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://nap.ft.dibk.no/services/rest/kommuneplaner",
                "intersects layer kpomrade (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 10178.23,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://nap.ft.dibk.no/services/wms/kommuneplaner?layers=kommuneplan"
            },
            "cartography": "https://nap.ft.dibk.no/services/wms/kommuneplaner?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=kommuneplan&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "arealplanId": {
                        "kommunenummer": "3806",
                        "planidentifikasjon": "1406"
                    },
                    "plannavn": "Kommuneplanens arealdel 2018-2030",
                    "plantype": "20",
                    "planstatus": "3",
                    "ikrafttredelsesdato": "2019-06-13",
                    "vedtakendeligplandato": null,
                    "link": null
                },
                {
                    "arealplanId": {
                        "kommunenummer": "3806",
                        "planidentifikasjon": "1406"
                    },
                    "plannavn": "Kommuneplanens arealdel 2018-2030",
                    "plantype": "20",
                    "planstatus": "3",
                    "ikrafttredelsesdato": "2019-06-13",
                    "vedtakendeligplandato": null,
                    "link": "https://plandialog.isy.no/detailsplan/4001/1406/True/False"
                }
            ],
            "themes": [
                "Plan"
            ],
            "runOnDataset": {
                "datasetId": "41435fda-93ba-48a8-bd56-79a9287b6dad",
                "title": "Kommuneplaner (landsdekkende kopi)",
                "description": "Fra 1.1.2026 vil Direktoratet for byggkvalitet opprettholde «Norge digitalt arealplankartløsning» (NAP) med datasett for kommuneplaner og denne oppføringen er oppdatert med distribusjoner.\n\nKommuneplanen skal være kommunens overordnede styringsdokument. Den skal gi rammer for virksomhetenes planer og tiltak, og planer for bruk og vern av arealer i kommunen. Alle kommuner skal ha en kommuneplan. En samlet kommuneplan består både av en samfunnsdel med handlingsdel og en arealdel. Kommunen bestemmer gjennom vedtak av kommunal planstrategi om kommunen skal gjennomføre en full kommuneplanrevisjon av alle delene, eller om bare deler av kommuneplanen skal revideres, og hva revisjonen skal gå ut på. Kommuneplanen skal ivareta både kommunale, regionale og nasjonale mål, interesser og oppgaver, og bør omfatte alle viktige mål og oppgaver i kommunen. Den skal ta utgangspunkt i den kommunale planstrategien og legge retningslinjer og pålegg fra statlige og regionale myndigheter til grunn. Det kan utarbeides kommunedelplan for bestemte områder, temaer eller virksomhetsområder. Kommuneplanen skal ha en handlingsdel som angir hvordan planen skal følges opp de fire påfølgende år eller mer, og revideres årlig (Regjeringen.no).\n\nDatasettet genereres fra den landsdekkende kopien av kommuneplaner . Denne holdes oppdatert med data fra de originale plandataene i kommunene. Oppdateringen skjer ved synkronisering fra kommunene.",
                "owner": "Direktoratet for byggkvalitet",
                "updated": "2025-09-16T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/41435fda-93ba-48a8-bd56-79a9287b6dad"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://nap.ft.dibk.no/services/rest/reguleringsplaner/vn2",
                "intersects layer rpomrade (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 5089.11,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://nap.ft.dibk.no/services/wms/reguleringsplaner?layers=vertikalniva_2"
            },
            "cartography": "https://nap.ft.dibk.no/services/wms/reguleringsplaner?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=vertikalniva_2&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "arealplanId": {
                        "kommunenummer": "4001",
                        "planidentifikasjon": "750"
                    },
                    "plannavn": "Hvalenområdet",
                    "plantype": "30",
                    "planstatus": "3",
                    "ikrafttredelsesdato": "1998-04-02",
                    "vedtakendeligplandato": null,
                    "link": "https://plandialog.isy.no/detailsplan/4001/750/True/False"
                }
            ],
            "themes": [
                "Plan"
            ],
            "runOnDataset": {
                "datasetId": "dac27348-5c2e-4a6a-9497-c4c792108cae",
                "title": "Reguleringsplaner (landsdekkende kopi)",
                "description": "Fra 1.1.2026 vil Direktoratet for byggkvalitet opprettholde «Norge digitalt arealplankartløsning» (NAP) med datasett for reguleringsplaner og denne oppføringen er oppdatert med distribusjoner.\n\nReguleringsplan er et arealplankart med tilhørende bestemmelser som fastlegger bruk, flerbruk og vern i bestemte områder, og som gir grunnlag for avklaring av hvilke bygge- og anleggstiltak som kan gjennomføres i planområdet. Kommunestyret skal sørge for at det blir utarbeidet reguleringsplan for de områder i kommunen hvor dette følger av loven eller av kommuneplanens arealdel, samt der det ellers er behov for å sikre forsvarlig planavklaring og gjennomføring av bygge- og anleggstiltak, flerbruk og vern i forhold til berørte private og offentlige interesser. For gjennomføring av større bygge- og anleggstiltak og andre tiltak som kan få vesentlige virkninger for miljø og samfunn, kreves det reguleringsplan. Reguleringsplan kan utarbeides som en områderegulering for et større område eller som en detaljregulering for enkelttiltak eller mindre områder. Staten kan, når viktige statlige eller regionale interesser tilsier det, vedta statlig reguleringsplan. Private har rett til å fremme forslag til detaljregulering.\n\nDatasettet genereres fra den landsdekkende kopien av reguleringsplaner. Denne holdes oppdatert med data fra de originale plandataene som forvaltes i kommunene. Oppdateringen skjer ved synkronisering eller periodisk kopiering fra kommunene sine data.",
                "owner": "Direktoratet for byggkvalitet",
                "updated": "2025-09-16T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dac27348-5c2e-4a6a-9497-c4c792108cae"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Rettighet til mineralundersøkelse",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs.geonorge.no/skwms1/wfs.bergrettigheter",
                "add filter servituttType = 'UN'",
                "intersects layer Bergrettighet (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 10021,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Geologi"
            ],
            "runOnDataset": {
                "datasetId": "b3c319bd-910d-4663-8ce8-23a246afe879",
                "title": "Bergrettigheter",
                "description": "Dataene viser områder som er belagt med bergrettigheter for statens mineraler, som definert av \"Lov om erverv og utvinning av mineralressurser (mineralloven)\" §7. Datasettet inneholder definerte områder for undersøkelses (UN)- og utvinningsretter (UT). Det kan være utstedt flere bergrettigheter for samme geografiske område; datasettet har overlappende flater, men de individuelle rettighetene har forskjellig prioritet. \nFørste prioritet gjelder basert på mottatt dato, beskrevet i attributtet InnsendtDato. Direktoratet for mineralforvaltning med Bergmesteren for Svalbard (DMF) er eier av datasettet. \nEn undersøkelsesrett på statens mineraler tildeles som en rett på et bestemt område, og ikke som en rettighet til en bestemt forekomst. Den som har undersøkelsesrett med best prioritet, dvs. den som søkte om retten først, har enerett til å søke om utvinningsrett etter minerallovens § 29. Gyldighet for undersøkelsesretter er 7 år fra best prioritet, utvinningsrettigheter har 10 års gyldighet. Rettigheter kan forlenges ved vedtak, jf. mineralloven § 23 og §§ 33 - 34.",
                "owner": "Direktoratet for mineralforvaltning",
                "updated": "2026-03-16T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b3c319bd-910d-4663-8ce8-23a246afe879"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://dirmin.no/bergrettigheter",
                    "title": "Mer informasjon om bergrettigheter"
                },
                {
                    "href": "https://dirmin.no/data/bergrettigheter",
                    "title": "Oppslag rettighet og rettighetshaver"
                }
            ],
            "possibleActions": [
                "Rettigheten begrenser ikke muligheten for å vedta en reguleringsplan. Opprett gjerne dialog med rettighetshaver, fordi foretaket likevel kan ha relevant informasjon for plansaken.",
                "Direktoratet for mineralforvaltning skal ha tilsendt varsel om planoppstart."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 3,
                    "comment": "Egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 2,
                    "comment": "Noe egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Rettighet til mineralutvinning",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs.geonorge.no/skwms1/wfs.bergrettigheter",
                "add filter servituttType = 'UT'",
                "intersects layer Bergrettighet (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Geologi"
            ],
            "runOnDataset": {
                "datasetId": "b3c319bd-910d-4663-8ce8-23a246afe879",
                "title": "Bergrettigheter",
                "description": "Dataene viser områder som er belagt med bergrettigheter for statens mineraler, som definert av \"Lov om erverv og utvinning av mineralressurser (mineralloven)\" §7. Datasettet inneholder definerte områder for undersøkelses (UN)- og utvinningsretter (UT). Det kan være utstedt flere bergrettigheter for samme geografiske område; datasettet har overlappende flater, men de individuelle rettighetene har forskjellig prioritet. \nFørste prioritet gjelder basert på mottatt dato, beskrevet i attributtet InnsendtDato. Direktoratet for mineralforvaltning med Bergmesteren for Svalbard (DMF) er eier av datasettet. \nEn undersøkelsesrett på statens mineraler tildeles som en rett på et bestemt område, og ikke som en rettighet til en bestemt forekomst. Den som har undersøkelsesrett med best prioritet, dvs. den som søkte om retten først, har enerett til å søke om utvinningsrett etter minerallovens § 29. Gyldighet for undersøkelsesretter er 7 år fra best prioritet, utvinningsrettigheter har 10 års gyldighet. Rettigheter kan forlenges ved vedtak, jf. mineralloven § 23 og §§ 33 - 34.",
                "owner": "Direktoratet for mineralforvaltning",
                "updated": "2026-03-16T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b3c319bd-910d-4663-8ce8-23a246afe879"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://dirmin.no/bergrettigheter",
                    "title": "Mer informasjon om bergrettigheter"
                },
                {
                    "href": "https://dirmin.no/data/bergrettigheter",
                    "title": "Oppslag rettighet og rettighetshaver"
                }
            ],
            "possibleActions": [
                "En plan vil sannsynligvis måtte konsekvensutredes for temaet viktige mineralressurser."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 3,
                    "comment": "Egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 2,
                    "comment": "Noe egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Tilfluktsrom - offentlige",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs.geonorge.no/skwms1/wfs.tilfluktsrom_offentlige",
                "intersects layer Tilfluktsrom (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 3708,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "dbae9aae-10e7-4b75-8d67-7f0e8828f3d8",
                "title": "Tilfluktsrom - Offentlige",
                "description": "Offentlige tilfluktsrom i Norge. Tilfluktsrom er permanente beskyttelsesrom som skal verne befolkningen mot skader ved krigshandlinger. Offentlige tilfluktsrom er for befolkningen i et område og er bygget i byer og større tettsteder, samt i boligområder hvor dekningen av private tilfluktsrom ikke er tilfredsstillende.",
                "owner": "Direktoratet for samfunnssikkerhet og beredskap",
                "updated": "2026-03-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dbae9aae-10e7-4b75-8d67-7f0e8828f3d8"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_kld_markagrensen.geojson",
                "intersects layer 0 (False)",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [
                {
                    "dataeier": "Klima- og miljødepartementet",
                    "dekningsstatus": "Ikke relevant",
                    "dekningsinfo": "Fenomenet er ikke relevant i området"
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "45e9ba77-388c-40eb-87df-e34e9d9ab300",
                "title": "Markagrensen",
                "description": "Datasettet avgrenser område for virkeområdet til lov 6. juni 2009 nr. 35 om naturområder i Oslo og nærliggende kommuner (markaloven) som trådte i kraft 1. september 2009. Markalovens virkeområde er fastsatt i forskrift 4. september 2015 nr. 1032 om justering av markagrensen fastlegger markalovens geografiske virkeområde med tilhørende kart. Stortinget vedtok mindre endringer i det tilhørende kartet 10. april 2019.",
                "owner": "Klima- og miljødepartementet",
                "updated": "2026-03-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/45e9ba77-388c-40eb-87df-e34e9d9ab300"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Nei",
                    "comment": "Ikke relevant"
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Flom fra sjø ved høye vannstander (stormflo) og økt havnivå",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage https://wfs.geonorge.no/skwms1/wfs.stormflo_havniva",
                "intersects layer Dekningsområde (True)",
                "query https://wfs.geonorge.no/skwms1/wfs.stormflo_havniva",
                "intersects layer Stormflo20År_KlimaÅrNå (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 91.88,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://wms.geonorge.no/skwms1/wms.stormflo_havniva?layers=stormflo20ar_klimaarna"
            },
            "cartography": "https://wms.geonorge.no/skwms1/wms.stormflo_havniva?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=stormflo20ar_klimaarna&sld_version=1.1.0&format=image/png",
            "data": [
                {
                    "sikkerhetsklasseFlom": "F1",
                    "oppdateringsdato": "2026-03-02T03:41:54.333",
                    "opphav": "Kartverket"
                }
            ],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "fbb95c67-623f-430a-9fa5-9cfcea8366b3",
                "title": "Stormflo og havnivå",
                "description": "Merk at datasettet \"Stormflo og havnivå\" kom i ny utgave da DSBs veileder ble oppdatert 1. juli 2024. I januar 2025 kom det forbedringer som blant annet fjernet isolerte, oversvømte arealer på land som ikke var reelle. Det er planlagt flere forbedringer av datasettet utover våren som spesielt vil forbedre datasettet for enkelte fjorder/basseng med trang åpning.\n\nEn konsekvens av menneskeskapte klimaendringer er at havnivået stiger. Rapporten Sea-Level Rise and Extremes in Norway (2024) viser at også i Norge vil vi merke den økende stigningen. I veilederen «Havnivåstigning og høye vannstander i samfunnsplanlegging» (2024) kommer DSB med råd og anbefalinger om hvordan kommunene skal ta hensyn til havnivåstigning i sin planlegging, både på kort og lang sikt, og for ny og eksisterende bebyggelse. Hensikten er å forebygge risiko for tap av liv, skade på helse, miljø og viktig infrastruktur, materielle verdier mv. på grunn av oversvømmelse. I tillegg til havnivåstigning, omhandler veilederen høye vannstander (stormflo) fordi havnivåstigningen fører til at høye vannstander vil inntreffe lenger, og oftere, inn over land enn hva som er tilfelle i dag.\n\nInformasjon om de høye vannstander med dagens havnivå eller med et framtidig havnivå som denne veilederen anbefaler kommunene å bruke, er samlet i dette datasettet. Videre har Kartverket modellert hvilke areal som kan bli berørt av oversvømmelse ved de ulike høye vannstandene, nå og i framtiden. \nDe høye vannstandene tilsvarer sikkerhetsklassene for flom brukt i TEK17 som er 20-års, 200-års og 1000-års stormflo. I tillegg finnes et «øvre estimat vannstand» som er anbefalt brukt for bygg som omfattes av TEK17 § 7-2 første ledd. \n\nNoen av disse høye vannstandene kommer også med klimapåslaget for havnivåendring frem til år 2100 eller år 2150. I tråd med det nye føre-var-grunnlaget for klimatilpasning i Norge er klimapåslaget basert på utslippsscenario SSP3-7.0 der man bruker 83-prosentiler for det sannsynlige utfallsrommet.\n\nDatasettet og veilederen fra DSB retter seg hovedsakelig mot kommuner og andre fagkyndige som skal utrede og vurdere konsekvensene av havnivåstigning og stormflo i saker etter plan- og bygningsloven, og ved utarbeidelse av helhetlig risiko- og sårbarhetsanalyse etter sivilbeskyttelsesloven.  \n\nSe produktspesifikasjon for ytterligere informasjon.",
                "owner": "Kartverket",
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fbb95c67-623f-430a-9fa5-9cfcea8366b3"
            },
            "description": "En konsekvens av menneskeskapte klimaendringer er at havnivået stiger. Rapporten Sea-Level Rise and Extremes in Norway (2024) viser at også i Norge vil vi merke den økende stigningen. I veilederen «Havnivåstigning og høye vannstander i samfunnsplanlegging» (2024) kommer DSB med råd og anbefalinger om hvordan kommunene skal ta hensyn til havnivåstigning i sin planlegging, både på kort og lang sikt, og for ny og eksisterende bebyggelse. Hensikten er å forebygge risiko for tap av liv, skade på helse, miljø og viktig infrastruktur, materielle verdier mv. på grunn av oversvømmelse. I tillegg til havnivåstigning, omhandler veilederen høye vannstander (stormflo) fordi havnivåstigningen fører til at høye vannstander vil inntreffe lenger, og oftere, inn over land enn hva som er tilfelle i dag.\n\nAnalyser viser at området i dette treffet kan bli utsatt for flom ved høye vannstander fra sjø og økt havnivå. ",
            "guidanceText": "Planområdet kan være utsatt for flom ved høye vannstander fra sjø og økt havnivå. ",
            "guidanceUri": [
                {
                    "href": "https://www.dsb.no/veiledere-handboker-og-informasjonsmateriell/havnivastigning-og-hoye-vannstander/",
                    "title": "Veileder fra DSB: Havnivåstigning og høye vannstander i samfunnsplanleggingen"
                },
                {
                    "href": "https://kartverket.no/til-sjos/se-havniva/kart",
                    "title": "Visualiseringstjeneste fra Kartverket for høye vannstander og økt havnivå"
                },
                {
                    "href": "https://kartkatalog.geonorge.no/metadata/stormflo-og-havnivaa/fbb95c67-623f-430a-9fa5-9cfcea8366b3",
                    "title": "Datasettet \"Stormflo og havnivå\" i Geonorge"
                }
            ],
            "possibleActions": [
                "Først må man finne ut i hvilken grad planområdet er utsatt for flom fra sjø. Se DSBs veileder for «Havnivåstigning og høye vannstander i samfunnsplanleggingen» for anbefalinger om hvilke kartlag for stormflo og havnivå som skal legges til grunn i planarbeidet og hvordan vurdere bølger som kommer i tillegg til dette.",
                "DSB anbefaler fire mulige strategiser for å møte utfordringer med flom fra sjø og økt havnivå:",
                "Beskytte: gjennom fysiske sikringstiltak slik som diker, barrierer og voller.",
                "Tilpasse: man tillater bygging i utsatte områder, men tilpasser mennesklig aktivitet, bygg og infrastruktur til økende havnivå. Dette kan være forsterking av bygg og infrastruktur slik at den tåler påvirkningen eller ulike naturbaserte løsninger.",
                "Unngå: ikke tillate ny utvikling i utsatte områder og revurdere avsatte arealer som er utsatt",
                "Tilbaketrekke: strategisk planlagt tilbaketrekking fra rammede kystområder ved å relokalisere bygninger og infrastruktur"
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Ja",
                    "comment": "Grundig kartlagt med funn"
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Farledsareal",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekning_hovedled_biled_arealgrense.gpkg",
                "intersects layer 0 (True)",
                "query https://wfs.geonorge.no/skwms1/wfs.farled",
                "intersects layer HovedledOgBiledAreal (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 3002,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samferdsel"
            ],
            "runOnDataset": {
                "datasetId": "8ff1538a-a93c-4391-8d6f-3555fc37819c",
                "title": "Hovedled og Biled",
                "description": "Farleden er gitt gjennom forskrift av 11. desember 2019 nr. 1834 (forskrift om farleder).\n\nHele norskekysten er i dag dekket av et standardisert referansesystem av ulike farledskategorier. Farledsstrukturen omfatter nettverket av sjøverts transportårer og er et nasjonalt geografisk referansesystem for tiltak innen forvaltning, planlegging, utbygging og operativ virksomhet i kystsonen.\n\nMer om farledsstrukturen:\n\nhttp://www.kystverket.no/Maritim-infrastruktur/Farleder\n/Farledsstrukturen/",
                "owner": "Kystverket",
                "updated": "2026-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/8ff1538a-a93c-4391-8d6f-3555fc37819c"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [
                "Du bør justere planforslaget slik at det ikke overlapper med farleden. Om dette ikke lar seg gjøre, må du få vurdert hvilke virkninger planforslaget ditt har for sikker og effektiv ferdsel."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Nei",
                    "comment": "Ikke relevant"
                },
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Ja",
                    "comment": null
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 3,
                    "comment": "Egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 3,
                    "comment": "Egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/artnasjonal2/MapServer",
                "intersects layer 2 (False)",
                "intersects layer 1 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 0,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/artnasjonal2/MapServer/WMSServer?layers=Alle_arter_av_sarlig_stor_forv_int_pkt,Alle_arter_av_sarlig_stor_forv_int_omr"
            },
            "cartography": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAkCAYAAACE7WrnAAAAsklEQVR4nM3UUQ4DIQgE0KHxsnqg8bjT37aCusYmkOyPG5+4sJgk4UK8biBXoRK9MLNhbfYVXMjMQNJdj7DhahECACTdTAdohqywfFVLDklCa226obXmtsCQ0QyLECBoSEl3Onu1yYvkVUsBFcCfPTvxWZD/XI0kJIUPyXDMfEG11vDE3vt+RjtIdNgS2kGW0C4yhZ4gIfQUcaETZIBOETejFRL1k0lSqn+t/MqnkW+wvQGx1m840hh+WAAAAABJRU5ErkJggg==",
            "data": [
                {
                    "AntallObservasjoner": 1,
                    "Gruppe": "karplanter",
                    "NorskNavn": "ask",
                    "Status": "EN",
                    "Faktaark": "https://faktaark.naturbase.no/artnasjonal?id=9.69505_59.08983_102409"
                },
                {
                    "AntallObservasjoner": 1,
                    "Gruppe": "karplanter",
                    "NorskNavn": "ask",
                    "Status": "EN",
                    "Faktaark": "https://faktaark.naturbase.no/artnasjonal?id=9.694942_59.089978_102409"
                },
                {
                    "AntallObservasjoner": 1,
                    "Gruppe": "karplanter",
                    "NorskNavn": "alm",
                    "Status": "EN",
                    "Faktaark": "https://faktaark.naturbase.no/artnasjonal?id=9.695346_59.089627_103527"
                },
                {
                    "AntallObservasjoner": 1,
                    "Gruppe": "karplanter",
                    "NorskNavn": "alm",
                    "Status": "EN",
                    "Faktaark": "https://faktaark.naturbase.no/artnasjonal?id=9.695131_59.089876_103527"
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "a8456aed-441a-40c4-831f-46bcbe4e6ff1",
                "title": "Arter av nasjonal forvaltningsinteresse",
                "description": "Arter av nasjonal forvaltningsinteresse er et forvaltningsrettet datasett som distribueres av Miljødirektoratet, der datafangsten helt og fullt er basert på dataflyten for artsdata som er etablert av Artsdatabanken. Artsdatabanken har, siden etableringen i 2005, etablert dataflyt med relevante institusjoner og relevante databaser som blir synliggjort i Artskart. Eierskapet til data er avklart og ligger hos originalverten. \n\nArter av nasjonal forvaltningsinteresse består både av arter som trenger beskyttelse og arter som er skadelige (fremmede). Alle relevante artsgrupper er omfattet. Beslutning om hvilke arter som inngår er i all hovedsak tatt i henhold til ulike relevante statuser som arter kan befinne seg i. Trua arter, ansvarsarter og freda arter er eksempler på slike statuser, som i datasettet er definert som utvalgskriterier. \n\nI tillegg til at det er besluttet hvilke arter som skal inngå, er det besluttet to kvalitetsparametere som må være utfylt eller som må fylle noen minstekrav; geografisk presisjon og funksjon (aktivitet). Disse kravene varierer mellom ulike artsgrupper. \n\nKartlagte forekomster av sensitive funksjonsområder for gitte arter, dvs. forekomster som det ikke skal være allmenn tilgang til detaljert informasjon om, er ikke inkludert i dette datasettet.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a8456aed-441a-40c4-831f-46bcbe4e6ff1"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Forurenset grunn",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/grunnforurensning2/MapServer",
                "intersects layer 1 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 912,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "e48e71ac-16fc-4e47-9e7f-c0a4a4bbfad0",
                "title": "Forurenset grunn",
                "description": "Datasettet omfatter eiendommer med forurenset grunn samt kommunale og private-/ industrideponier. Datasettet er fremskaffet ved kartlegging av lokaliteter med forurenset grunn og/eller med mistanke om forurenset grunn og ved innrapporteringer gjort i forbindelse med bygge- og gravesaker, pålegg om undersøkelser etter tiltak eller på eget initiativ.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e48e71ac-16fc-4e47-9e7f-c0a4a4bbfad0"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/forurensning/forurenset-grunn/forurenset-grunn/",
                    "title": "Informasjon om forurenset grunn"
                },
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/overvaking-arealplanlegging/arealplanlegging/miljohensyn-i-arealplanlegging/forurensning/forurenset-grunn/",
                    "title": "Veileder om forurenset grunn i arealplaner"
                },
                {
                    "href": "https://www.regjeringen.no/no/dokumenter/nasjonale-og-vesentlige-regionale-interesser-pa-miljoomradet--klargjoring-av-miljoforvaltningens-innsigelsespraksis/id2504971/",
                    "title": "Nasjonale og vesentlige regionale interesser på miljøområdet"
                }
            ],
            "possibleActions": [
                "Vurder om du kan utforme planområdet slik at det ikke overlapper med forurenset grunn.",
                "Hvis planområdet må overlappe forurenset grunn, må du omtale dette i planbeskrivelsen og gjøre rede for hvordan forekomsten av forurenset grunn skal ivaretas.",
                "Vurder hvordan arealbruken i planen kan utformes slik at det blir minst mulig konflikt med forurenset grunn, og dermed også minst mulig behov for tiltak.&#x20;"
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Naturtypelokalitet, svært stor verdi",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_nin/MapServer",
                "intersects layer 1 (True)",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_kuverdi/MapServer",
                "add filter Verdikategori = 'Svært stor verdi'",
                "intersects layer 0 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 10401.16,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_kuverdi/MapServer/WMSServer?layers=kuverdi_svært_stor_verdi"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_kuverdi/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=kuverdi_svært_stor_verdi&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Naturtype": "Åpen kalkmark",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Mindre god (> 50m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-BN00122762"
                },
                {
                    "Naturtype": "Hule eiker",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510214350"
                },
                {
                    "Naturtype": "Hule eiker",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510214351"
                },
                {
                    "Naturtype": "Slåttemark",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510213702"
                },
                {
                    "Naturtype": "Hule eiker",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510214356"
                },
                {
                    "Naturtype": "Hule eiker",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510214363"
                },
                {
                    "Naturtype": "Store gamle trær",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Mindre god (> 50m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-BN00070868"
                },
                {
                    "Naturtype": "Slåttemark",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Mindre god (> 50m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-BN00109531"
                },
                {
                    "Naturtype": "Lågurtalm-lind-hasselskog",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper på land (NiN)",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-NINFP2510214368"
                },
                {
                    "Naturtype": "Hule eiker",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510214365"
                },
                {
                    "Naturtype": "Åpen grunnlendt kalkmark i boreonemoral sone",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2510214366"
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "64cbb884-a19d-4356-a114-380cfe4a7314",
                "title": "Naturtyper - verdsatte",
                "description": "Datasettet er tidligere publisert under navnet \"Naturtyper -KU-verdi\". Datasettet viser naturtypelokaliteter fordelt på verdikategorier i henhold til verdsettingskriteriene i veilederen M-1941 Konsekvensutredninger for klima og miljø. Datasettet viser ikke naturtyper i marint miljø.\n\nSom grunnlagsdatasett er benyttet \"Naturtyper - Utvalgte\", \"Naturtyper på land (NiN)\" og \"Naturtyper på land og i ferskvann (HB13)\". Naturtypene kartlagt etter DN-håndbok 13 er, med unntak av lokaliteter som er utvalgte naturtyper, ikke mulig å knytte presist til dagens utvalgskriterier for hvilke naturtyper som kartlegges. Lokalitetene er derfor plassert uten forsøk på å ta hensyn til utvalgskriterier.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/64cbb884-a19d-4356-a114-380cfe4a7314"
            },
            "description": "Naturtypelokaliteter med svært stor verdi er svært viktige for naturmangfoldet. Naturtypen i seg selv kan være en trua naturtype, og lokaliteten kan også være en utvalgt naturtype. Når lokaliteten har svært stor verdi, er som regel tilstanden god, og det vil være registrert eller sannsynliggjort at lokaliteten er levested for trua eller sjeldne arter.",
            "guidanceText": "Planområdet kommer i overlapp med en naturtypelokalitet med svært stor verdi. Dette vil gjøre det vanskeligere å få godkjent planen. Konflikt med slike lokaliteter er også innsigelsesgrunnlag, jf. rundskriv T-2/16 om nasjonale eller vesentlige regionale interesser på miljøområdet.",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/overvaking-arealplanlegging/arealplanlegging/miljohensyn-i-arealplanlegging/naturmangfold/naturtyper-i-arealplanlegging/",
                    "title": "Informasjon om naturtyper i arealplanlegging"
                },
                {
                    "href": "https://www.regjeringen.no/no/dokumenter/nasjonale-og-vesentlige-regionale-interesser-pa-miljoomradet--klargjoring-av-miljoforvaltningens-innsigelsespraksis/id2504971/",
                    "title": "Nasjonale og vesentlige regionale interesser på miljøområdet"
                },
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/",
                    "title": "Beskrivelse av naturtypene"
                }
            ],
            "possibleActions": [
                "Arronder planområdet slik at lokaliteten ikke berøres.",
                "Dersom planområdet, helt eller delvis, må overlappe lokaliteten, må du gi en begrunnelse for behovet.&#x20;"
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Ja",
                    "comment": null
                },
                {
                    "qualityDimensionId": "stedfestingsnøyaktighet",
                    "qualityDimensionName": "Stedfestingsnøyaktighet",
                    "value": "Mindre god (> 50m)",
                    "comment": null
                },
                {
                    "qualityDimensionId": "stedfestingsnøyaktighet",
                    "qualityDimensionName": "Stedfestingsnøyaktighet",
                    "value": "Meget god (5 - 20m)",
                    "comment": null
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": [
                "Stedfestingsnøyaktighet er usikker på et eller flere objekter"
            ]
        },
        {
            "title": "Naturtyper på land (NiN), dekningskart",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_nin/MapServer",
                "intersects layer 1 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 5089.11,
            "resultStatus": "HIT-YELLOW",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer?layers=dekningskart_naturtyper_nin"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=dekningskart_naturtyper_nin&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Prosjektnavn": "572840__Kalkområder - Bamble og Porsgrunn__2025__NTYP",
                    "Årstall": 2025,
                    "Oppdragsgiver": "Miljødirektoratet",
                    "Oppdragstaker": "Dokkadeltaet Nasjonale Våtmarkssenter AS",
                    "Kartleggingsinstruks": "https://nedlasting.miljodirektoratet.no/NiN_Instrukser/Ntyp2025_kartleggingsinstruks.pdf",
                    "Dekningskartverdi": 1,
                    "Prosjektrapport": null
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "eb48dd19-03da-41e1-afd9-7ebc3079265c",
                "title": "Naturtyper på land (NiN)",
                "description": "Datasettet er tidligere publisert under navnet \"Naturtyper - Miljødirektoratets instruks\". Datasettet viser naturtypelokaliteter kartlagt etter Miljødirektoratets instruks for kartlegging av naturtyper på land. Naturtyper prioritert for kartlegging er rødlistede naturtyper og naturtyper med sentral økosystemfunksjon. Type- og beskrivelsessystemet Natur i Norge er benyttet for å dokumentere det faglige innholdet. Hver lokalitet er gitt en økologisk kvalitet, basert på tilstand og naturmangfold.\n\nDen enkelte lokalitet består av én naturtype, som er beskrevet i instruksen. Naturtypen har en definisjon i form av én eller flere mulige kartleggingsenheter i NiN, eventuelt i kombinasjon med bestemte beskrivelsesvariabler (Definerende variabler). Lokalitetens økologiske tilstand registreres ved hjelp av et sett med beskrivelsesvariabler som er definert som relevante for den aktuelle naturtypen. Innslag av fremmede arter og spor etter tunge kjøretøy er eksempler på slike variabler. Basert på trinnverdier for variablene og regler i metodikken settes en samlet vurdering av tilstand. Tilsvarende vurderes lokaliteten når det gjelder naturmangfold. Naturmangfold vurderes primært med grunnlag i funn av spesifikke arter og funn av biologisk viktige livsmiljøer. Vurderingen av tilstand og naturmangfold danner grunnlag for å gi lokaliteten en samlet vurdering av økologisk kvalitet; Lokalitetskvalitet. Knyttet til tilstand og naturmangfold er det også gitt tekstlig informasjon.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/eb48dd19-03da-41e1-afd9-7ebc3079265c"
            },
            "description": "Dekningskartet for datasettet Naturtyper på land (NiN) forteller hvor det er kartlagt naturtyper etter Miljødirektoratets instruks. Dekningskartet viser arealer som skal være fullstendig kartlagt.&#x20;",
            "guidanceText": "Planområdet overlapper areal som er kartlagt for naturtyper etter Miljødirektoratet instruks. Dersom overlappen er fullstendig, kan du som regel regne med at det ikke vil bli stilt krav om ny kartlegging av naturtyper i området. Dersom planområdet delvis overlapper, kan det bli stilt krav om naturtypekartlegging i den delen av arealet som ikke overlapper. Det kan imidlertid bli stilt krav om ny kartlegging hvis den opprinnelige kartlegginga er av eldre dato. Dette gjelder selv om det måtte være kartlagt naturtyper etter tidligere metodikk (DN-håndbok 13).",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/overvaking-arealplanlegging/arealplanlegging/miljohensyn-i-arealplanlegging/naturmangfold/naturtyper-i-arealplanlegging/",
                    "title": "Informasjon om naturtyper i arealplanlegging"
                },
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/overvaking-arealplanlegging/naturkartlegging/myndigheter/kartlegging-av-naturtyper-pa-land/hvordan-kartlegges-naturtyper/",
                    "title": "Informasjon kartlegging av naturtyper"
                }
            ],
            "possibleActions": [
                "Du bør sjekke hvilket år kartlegginga er utført, og du kan vise til dette i saken."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Hule eiker",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN03'",
                "intersects layer 0 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 4158.35,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?layers=naturtype_utvalgt_omr"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=naturtype_utvalgt_omr&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Områdenavn": "Nedre Hvalen eik 5",
                    "UtvalgtNaturtype": "Hule eiker",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759795200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510214363"
                },
                {
                    "Områdenavn": "Hvalen",
                    "UtvalgtNaturtype": "Hule eiker",
                    "Nøyaktighetsklasse": "Mindre god (> 50m)",
                    "Registreringsdato": 1285200000000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-BN00070868"
                },
                {
                    "Områdenavn": "Nedre Hvalen eik 3",
                    "UtvalgtNaturtype": "Hule eiker",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759795200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510214365"
                },
                {
                    "Områdenavn": "Nedre Hvalen eik 4",
                    "UtvalgtNaturtype": "Hule eiker",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759795200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510214350"
                },
                {
                    "Områdenavn": "Nedre Hvalen eik 1",
                    "UtvalgtNaturtype": "Hule eiker",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759795200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510214351"
                },
                {
                    "Områdenavn": "Nedre Hvalen eik 2",
                    "UtvalgtNaturtype": "Hule eiker",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759795200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510214356"
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": "Eiketrær kan bli flere hundre år gamle og et stort mangfold av arter lever i hulrom, dype barkesprekker og på døde grener i slike trær. Så mange som 1500 arter kan leve på og i hule eiker. Hul eik er en utvalgt naturtype som skal tas hensyn til og vurderes i byggesøknaden.",
            "guidanceText": "Tiltaket er plassert nærmere enn 15m fra stammen til en hul eik som er utvalgt naturtype.",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/hule-eiker/",
                    "title": "Les mer om hul eik"
                },
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Tiltaket kan plasseres 15m eller lengre fra stammen.",
                "Dersom tiltaket må plasseres nærmere enn 15m fra stammen, skal kommunen vurdere tiltaket i henhold til bestemmelsene i naturmangfoldloven. Rotsystemet på treet må ikke skades. En arborist kan vurdere det for deg. Gi en begrunnelse for behovet og legg ved en eventuell uttalelse fra arborist."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Kalklindeskog",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN04'",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 616,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/kalklindeskog/",
                    "title": "Les mer om kalklindeskog"
                },
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket utenom kalklindskogen.",
                "Plasser tiltaket i ytterkanten av kalklindeskogen.",
                "Gjør tiltaket så lite arealkrevende som mulig.",
                "Dersom tiltaket helt eller delvis må plasseres inn i kalklindeskogen, skal kommunen vurdere tiltaket i henhold til naturmangfoldloven. Gi en begrunnelse for behovet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Åpen grunnlendt kalkmark i boreonemoral sone",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN07'",
                "intersects layer 0 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 6.71,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?layers=naturtype_utvalgt_omr"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=naturtype_utvalgt_omr&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Områdenavn": "Hvalenveien 90, strandberg",
                    "UtvalgtNaturtype": "Åpen grunnlendt kalkmark i boreonemoral sone",
                    "Nøyaktighetsklasse": "Mindre god (> 50m)",
                    "Registreringsdato": 1561507200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-BN00122762"
                },
                {
                    "Områdenavn": "Tangenbukta V1b",
                    "UtvalgtNaturtype": "Åpen grunnlendt kalkmark i boreonemoral sone",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759795200000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510214366"
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": "Åpen grunnlendt kalkrik mark i boreonemoral sone er en svært artsrik naturtype som oftest finnes som små arealer i overganger mellom nakent berg og skogsmark. Naturtypen og mange av artene som lever der, er trua. Naturtypen har en sørøstlig utbredelse i Norge, med tyngdepunkt i kalkområdene i Oslofjorden. TIl sammen har vi bare 1-2 km2. Åpen grunnlendt kalkmark i boreonemoral sone er en utvalgt naturtype som skal tas hensyn til og vurderes i byggesøknaden. Vis hensyn til forekomsten ved å unngå eller minimere eventuelle inngrep.",
            "guidanceText": "Tiltaket kommer i overlapp med en åpen grunnlendt kalkmark som er utvalgt naturtype. Det kan føre til avslag på byggesøknaden din.",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/apen-grunnlendt-kalkrik-mark-i-boreonemoral-sone/",
                    "title": "Les mer om åpen grunnlendt kalkmark i boreonemoral sone"
                },
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket utenom kalkmarka.",
                "Plasser tiltaket i ytterkanten av kalkmarka.",
                "Gjør tiltaket så lite arealkrevende som mulig.",
                "Dersom tiltaket helt eller delvis må plasseres inn på kalkmarka, skal kommunen vurdere tiltaket i henhold til naturmangfoldloven. Gi en begrunnelse for behovet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Kalksjøer",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN05'",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1074,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket utenom kalksjøen, og  unngå påvirkning av tilførselsbekker.",
                "Unngå også myr eller vegetasjonsbelter som hører til sjøen.",
                "Dersom tiltaket helt eller delvis må plasseres inn på kalksjøen, skal kommunen vurdere tiltaket i henhold til naturmangfoldloven. Gi en begrunnelse for behovet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Kystlynghei",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN06'",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/kystlynghei/",
                    "title": "Les mer om kystlynghei"
                },
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket utenom kystlyngheia.",
                "Plasser tiltaket i ytterkanten av kystlyngheia.",
                "Gjør tiltaket så lite arealkrevende som mulig.",
                "Dersom tiltaket helt eller delvis må plasseres inn på kystlyngheia, skal kommunen vurdere tiltaket i henhold til naturmangfoldloven. Gi en begrunnelse for behovet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Slåttemark",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN01'",
                "intersects layer 0 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 5027.47,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?layers=naturtype_utvalgt_omr"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=naturtype_utvalgt_omr&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Områdenavn": "Hvalen",
                    "UtvalgtNaturtype": "Slåttemark",
                    "Nøyaktighetsklasse": "Mindre god (> 50m)",
                    "Registreringsdato": 1404432000000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-BN00109531"
                },
                {
                    "Områdenavn": "Nedre Hvalen N1",
                    "UtvalgtNaturtype": "Slåttemark",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1759449600000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2510213702"
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": "Slåttemarker er ugjødsla enger som tradisjonelt ble slått for å skaffe vinterfôr til husdyrene. Svært mange arter har slåttemarker som leveområde. I dag har både slåttemarkene og mange av artene som lever der blitt sjeldne. Slåttemark er en utvalgt naturtype som skal tas hensyn til og vurderes i byggesøknaden. Vis hensyn til forekomsten av utvalgt naturtype ved å unngå eller minimere eventuelle inngrep i slåttemarka.",
            "guidanceText": "Tiltaket kommer i overlapp med en slåttemark som er utvalgt naturtype. Det kan føre til avslag på byggesøknaden din.",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/slattemark/",
                    "title": "Les mer om slåttemark"
                },
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket utenom slåttemarka.",
                "Plasser tiltaket i ytterkanten av slåttemarka.",
                "Gjør tiltaket så lite arealkrevende som mulig.",
                "Dersom tiltaket helt eller delvis må plasseres inn på slåttemarka, skal kommunen vurdere tiltaket i henhold til naturmangfoldloven. Gi en begrunnelse for behovet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Slåttemyr",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_utvalgte2/MapServer",
                "add filter UtvalgtNaturtypeKode = 'UN02'",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9800,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "2c0072de-f702-401e-bfb3-5ad3d08d4c2d",
                "title": "Naturtyper - utvalgte",
                "description": "Datasettet viser registrerte forekomster av utvalgte naturtyper, jf forskrift om utvalgte naturtyper, http://lovdata.no/dokument/SF/forskrift/2011-05-13-512. \nÅtte naturtyper har status som utvalgt naturtype: Kystlynghei, slåttemark, slåttemyr, kalklindeskog, kalksjøer, hule eiker, åpen grunnlendt kalkmark i boreonemoral sone og olivinskog. Lokaliteter av\nutvalgte naturtyper forvaltes i Miljødirektoratets datasett Naturtyper - DN-håndbok 13 og Naturtyper – Miljødirektoratets instruks.\nForskriften for utvalgte naturtyper gjelder alle lokaliteter som fyller kravene i forskriften, uavhengig av om lokaliteten er registrert i Naturbase eller ikke. Statsforvalteren vil kunne bistå dersom det er usikkerhet om hvorvidt en lokalitet faktisk er en utvalgt naturtype. I tvilstilfeller kan det være nødvendig å kontakte spesialkompetanse for å få gjort en vurdering.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c0072de-f702-401e-bfb3-5ad3d08d4c2d"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/tjenester/naturtyper/slattemyr/",
                    "title": "Les mer om slåttemyr"
                },
                {
                    "href": "https://lovdata.no/dokument/SF/forskrift/2011-05-13-512",
                    "title": "Forskrift om utvalgte naturtyper etter naturmangfoldloven"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket utenom slåttemyra.",
                "Plasser tiltaket i ytterkanten av slåttemyra.",
                "Gjør tiltaket så lite arealkrevende som mulig.",
                "Dersom tiltaket helt eller delvis må plasseres inn på slåttemyra, skal kommunen vurdere tiltaket i henhold til naturmangfoldloven. Gi en begrunnelse for behovet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_mdir_naturvernomrader.gpkg",
                "intersects layer 0 (False)",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [
                {
                    "dataeier": "Miljødirektoratet",
                    "dekningsstatus": "Ikke relevant",
                    "dekningsinfo": "Fenomenet er ikke relevant i området."
                }
            ],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "5857ec0a-8d2c-4cd8-baa2-0dc54ae213b4",
                "title": "Naturvernområder",
                "description": "Datasettet inneholder verneområder og vernede enkeltobjekt i Norge, herunder Svalbard og Jan Mayen. Verneområder opprettes først og fremst for å bevare naturverdier av nasjonal betydning. Dette er verdier vi skal ta vare på for all overskuelig framtid, også med tanke på naturopplevelse og kunnskap om naturen. Verneområdene forvaltes av fylkesmannen, kommunen, et nasjonalparkstyre eller et interkommunalt verneområdestyre.\\\\n\\\\nDatasettet gir en oversikt over hvilke områder som er vernet etter følgende lover:\\\\n- naturmangfoldloven av 2009\\\\n- biotopvern etter viltloven av 1981\\\\n- naturvernloven av 1970\\\\n- lov om naturvern av 1954\\\\n- lov om Jan Mayen av 1930\\\\n- lov om naturfredning av 1910. \\\\n\\\\nI tillegg inneholder det områder vernet etter følgende lovverk på Svalbard: \\\\n- Svalbardloven av 1925\\\\n- Svalbardmiljøloven av 2002.\\\\n\\\\nFor vernevedtak etter 1970 gir datasettet også tilgang til verneforskriften som gjelder for hvert enkelt verneområde.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/5857ec0a-8d2c-4cd8-baa2-0dc54ae213b4"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Nei",
                    "comment": "Ikke relevant"
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Foreslåtte naturvernområder",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://kart.miljodirektoratet.no/arcgis/rest/services/vern/mapserver",
                "intersects layer 4 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 2959,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "0e7eb17f-35ef-46d3-a465-3112d8bb2b5e",
                "title": "Naturvernområder - Foreslåtte",
                "description": "Datasettet viser områder som er under planlegging og sendt på offentlig høring etter lov om Naturmangfold - Kapittel V. Områdevern. \n\nVerneområder opprettes først og fremst for å bevare naturverdier av nasjonal betydning. Dette er verdier vi skal ta vare på for all overskuelig framtid, også med tanke på naturopplevelse og kunnskap om naturen. Verneområdene forvaltes av fylkesmannen, kommunen, et nasjonalparkstyre eller et interkommunalt verneområdestyre\n\nDatasettet har nær sammenheng med datasettet Naturvernområder. Når et verneforslag blir vedtatt, slettes kartobjektet fra Foreslåtte naturvernområder og opprettes isteden i datasett Naturvernområder.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/0e7eb17f-35ef-46d3-a465-3112d8bb2b5e"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [
                "Sørg for at planområdet ikke overlapper det foreslåtte naturvernområdet.",
                "Unngå at planområdet legges helt inntil grensa for det foreslåtte naturvernområdet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Geotekniske undersøkelser",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://ogcapitest.ngu.no/rest/services/grunnundersokelser_utvidet",
                "intersects layer geotekniskunders (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": 10178.23,
            "resultStatus": "HIT-YELLOW",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://geo.ngu.no/geoserver/nadag/ows?layers=GB_filter_komplette_data"
            },
            "cartography": "https://geo.ngu.no/geoserver/nadag/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=GB_filter_komplette_data&sld_version=1.1.0&format=image/png&bbox=196199.112,6562103.926,196347.084,6562224.953&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "prosjektNavn": "E18 Langangen - Rugtvedt",
                    "oppdragsgiver": "Nye Veier AS",
                    "beskrivelse": "Koordinat endret manuelt i ett punkt fra forrige opplasting",
                    "prosjektNr": "1350018019",
                    "opphav": "Levert til NADAG fra SVV 2020-03-31"
                },
                {
                    "prosjektNavn": "E18 Alle",
                    "oppdragsgiver": null,
                    "beskrivelse": null,
                    "prosjektNr": "19756",
                    "opphav": "Levert til NADAG fra Geosuite toolbox 2024-11-04"
                }
            ],
            "themes": [
                "Geologi"
            ],
            "runOnDataset": {
                "datasetId": "bf45a463-434d-4b4d-84dc-9325780ab5fb",
                "title": "Nasjonal database for grunnundersøkelser (NADAG)",
                "description": "NGU har utviklet Nasjonal database for grunnundersøkelser (NADAG) med tilhørende karttjenester og muligheter for innmelding og nedlasting av data fra geotekniske undersøkelser. Fra og med 2025 er det lovfestet plikt for innmelding av komplette geotekniske grunnundersøkelser til NADAG. Eldre data har stor nytteverdi, og ønskes også meldt inn. Prosjektet for utvikling av NADAG er et samarbeid mellom NGU og etatene Statens vegvesen, Bane NOR, og Norges vassdrags- og energidirektorat (NVE). NGU samarbeider også med ulike konsulenter i utviklingen av løsningene. \n\nPunktene i NADAGs kartinnsyn representerer geotekniske borehull (GB), hvor metadata vises (f.eks. boretype, oppdragsfirma, oppdragsgiver, stedfestelse (posisjon), boret dybde, ev. dyp til berg). For noen punkter vil mer informasjon være tilgjengelig (f.eks. lenke til rapport og ev. rådata, boreprofil og måleresultater). NADAGs datamodell er basert på en datastruktur beskrevet i SOSI-standardene for Geovitenskapelige undersøkelser og Geotekniske undersøkelser. NADAG er innlemmet i listen over datasett til DOK. Visningstjenesten til NADAG har to innsynsløsninger, der «Mobilvennlig versjon» ligner de andre kartinnsynene til NGU, mens «NADAG fullversjon» har litt annet oppsett og andre verktøy. \n\nNye data skal leveres komplett til NADAG, enten ved bruk av GeoSuite toolbox eller gjennom et innmeldings-API som er under utarbeidelse. Eldre data kan alternativt leveres gjennom NADAG WebReg. \n\nNADAG er landsdekkende. Alle data som ligger i NADAG er fritt tilgjengelig for alle, og lastes ned vederlagsfritt. Det vil være varierende mengde informasjon tilhørende hvert datapunkt, noe som vil avhenge blant annet av formatet data er levert på, og dataeiers vilje til å offentliggjøre data utover kun å vise metadata. Tilgjengelige rapporter (pdf) kan lastes ned fra NADAGs infoark. Data kan lastes ned på formatene GML, Filgeodatabase og GeoSuite. I tillegg kan man benytte NADAGs WMS, samt at det arbeides med lese-API (OGC API Features). Nedlasting kan gjøres via Geonorge, men dette gjelder enkle datasett, dvs. primært metadata og URL-lenker til rapporter. Komplette data må lastes ned gjennom NADAGs kartinnsyn. \n\nNADAG og bidragsytere er ikke ansvarlige for den enkeltes bruk av datasettene. Datasettene og rapportene ble laget for bestemte formål/prosjekt. Den som benytter data for nye formål/prosjekt må gjøre egne og selvstendige vurderinger av dataenes kvalitet, egnethet og gyldighet. Ved bruk av data skal det refereres til rapport/dataeier. Datasettet er gjort tilgjengelig under Norsk lisens for offentlige data (NLOD). Ved å starte NADAG nettjeneste godtar du disse vilkårene for bruk.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2026-03-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/bf45a463-434d-4b4d-84dc-9325780ab5fb"
            },
            "description": "Geotekniske grunnundersøkelser i NADAG gir informasjon om løsmassetyper og deres egenskaper, lagdeling, og noen ganger dyp til berg. Data kan benyttes i både plan- og byggesak for å få oversikt over grunnforholdene. I NADAGs kartinnsyn får man også tilgang til andre typer grunnundersøkelser.\n\nDet er innmeldingsplikt for geotekniske grunnundersøkelser f.o.m. 2025.",
            "guidanceText": "I forbindelse med tiltak må man ta hensyn til grunnforhold. Alle løsmassearealer under marin grense kan potensielt inneholde marin leire som kan være kvikk. Kvikkleire kan gi utfordringer med lokalstabilitet og områdestabilitet (skred).",
            "guidanceUri": [
                {
                    "href": "https://geo.ngu.no/kart/nadag/",
                    "title": "Karttjenesten NADAG"
                },
                {
                    "href": "https://www.ngu.no/geologisk-kartlegging/om-nadag-nasjonal-database-grunnundersokelser",
                    "title": "Informasjon om NADAG"
                }
            ],
            "possibleActions": [
                "Sjekk hva som finnes av informasjon fra geoteknisk undersøkelser i NADAG. Vær oppmerksom på at boredata vil være av ulik kvalitet og detaljeringsgrad. I noen tilfeller er ikke selve boredata levert til NADAG, men kan finnes i datarapport som er lenket opp."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Aktsomhetsområder for kvikkleireskred",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_nve_aktsomhetsomr_kvikkleireskred.geojson",
                "intersects layer 0 (True)",
                "query https://nve.geodataonline.no/arcgis/rest/services/KvikkleireskredAktsomhet/MapServer/",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 5828,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "dabd2a2c-36d5-4ed7-a4c9-d49808a2b848",
                "title": "Aktsomhetskart for kvikkleireskred",
                "description": "Aktsomhetskart for kvikkleireskred er utviklet av NVE, og tar hensyn til både løsmassene og terrenget. Det kan brukes for å følge steg 2 og 3 i «Prosedyre for utredning av områdeskredfare» i NVE veileder 1/2019 «Sikkerhet mot kvikkleireskred» kapittel 3.2.\n\nTidligere var det kartet «Aktsomhet marin leire» som ble benyttet for å sjekke steg 2 i prosedyren (Avgrens områder med mulig marin leire). «Aktsomhet marin leire» baserte seg på NGUs kart Mulighet for marin leire, og viste mulighet for sammenhengende forekomster av marin leire basert på løsmassekartene (kvartær-geologisk kartlegging). Det forelå ikke noe verktøy for steg 3 i prosedyren (Avgrens områder med terreng som kan være utsatt for områdeskred /kvikkleireskred).\n\nAktsomhetskartet bruker «Aktsomhet marin leire» som utgangspunkt og tar i tillegg hensyn til \nterreng-kriteriene som er gitt i NVE veileder 1/2019. Flate områder langt unna skråninger, er dermed fjernet fra aktsomhetskartet, i tillegg til områder uten sammenhengende marin leire. Områder kartlagt som «grunnlendt» og «fjell i dagen» i Nibio AR5 Grunnforhold er tatt vekk fra kartet.\n\n\nDersom planlagte tiltak ligger innenfor aktsomhetsområde for kvikkleireskred, må man gå videre i prosedyren i NVE veileder 1/2019. \nMetodikken aktsomhetskartet bygger på identifiserer mulige løsneområder for kvikkleireskred. NVE vurderte at aktsomhetskartet også markerer i tilstrekkelig grad hvor det kan være fare for skade fra utløp fra et kvikkleire-skred. Det er dermed ikke nødvendig å vurdere fare for utløp utenfor aktsomhetskartet. \nUnntaket er der det ligger utløp fra registrerte faresoner utenom aktsomhetsområdet, dette må i så fall følge prosedyren i NVE veileder 1/2019 videre fra steg 4.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-10T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dabd2a2c-36d5-4ed7-a4c9-d49808a2b848"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [
                "Du må finne ut hvilken tiltakskategori tiltaket vil være. Dette finner du i [NVEs veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf)",
                "I [NVE Veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf)<u> </u>kap.3.2. er det beskrevet en stegvis prosedyre som skal benyttes ved vurdering og utredning av fare for områdeskred.",
                "Dersom du skal bygge i et område der det er fare for områdeskred må reguleringsplanen vise hva som må gjøres for at tiltaket vil være skredsikkert. Dette må vises i planen ved hjelp av hensynsoner og bestemmelser.",
                "Se [NVEs retningslinjer 2/2011 Flaum og skredfare i arealplanar](http://publikasjoner.nve.no/retningslinjer/2011/retningslinjer2011_02.pdf) og [NVE Veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf) for mer informasjon om videre fremgangsmåte.",
                "Dersom konsulenten gjennom nye grunnundersøkelser får ytterligere kunnskap om eksisterende eller nye faresoner for kvikkleireskred, skal kartleggingen [meldes inn til NVE](https://www.nve.no/flaum-og-skred/kartlegging/innmelding-av-farekartlegging/)."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Ja",
                    "comment": null
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Faresoner for fjellskred",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://nve.geodataonline.no/arcgis/rest/services/Fjellskred1/MapServer",
                "intersects layer 8 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "17149f79-1289-4e3c-b964-94113eeb14c8",
                "title": "Store fjellskred",
                "description": "Dette produktet er et resultat av at NVE overtok det statlige forvaltningsansvaret for skred i 2009.\nTjenesten er ment som et hjelpemiddel som gjør det enklere å skaffe oversikt over ustabile fjellparti og\ntilhørende konsekvenser.\nFare- og risikokartlegging gjennomføres av NGU på vegne av NVE. Hvordan oppfølgingen av de ustabile fjellpartiene og faresonene bør følges opp med overvåking og i arealplanlegging er beskrevet i NVE rapport 77/2016: Fare og risikoklassifisering av ustabile fjellparti.\n\nDet er etablert to databaser for formidling av kartleggingen og fareområdene. NVEs database formidler faresoner for utløpsområder og flodbølger, samt potensielle oppdemmingsområder og nedstrøms flom som følge av dambrudd der dette er aktuelt. NGUs database har fokus på de geologiske data, inkludert bevegelsesmålinger.\n\nNVEs kartlegging retter seg først og fremst mot eksisterende bebyggelse. Ved identifisering og prioritering av områder som har behov for kontinuerlig overvåking er det derfor lagt vekt på hvor det bor og oppholder seg mennesker innenfor potensielt skredfareutsatte områder og områder som blir berørt av flodbølger eller oppdemning/dambrudd som en direkte konsekvens av et fjellskred.\n\nDatabasen er et produkt av den kartleggingen og fare- og risikoklassifiseringen som er gjort. Sammen skal dette gi grunnlag for å vurdere tiltak i form av overvåking med sikte på å kunne varsle et kommende fjellskred og dermed unngå potensielt tap av menneskeliv. Kartleggingen gir viktig informasjon om faregraden som grunnlag for arealplanlegging.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/17149f79-1289-4e3c-b964-94113eeb14c8"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://lovdata.no/dokument/NL/lov/2008-06-27-71/KAPITTEL_4-9#%C2%A728-1",
                    "title": "Plan- og bygningsloven § 28-1"
                },
                {
                    "href": "https://dibk.no/regelverk/byggteknisk-forskrift-tek17/7/7-3/",
                    "title": "TEK 17 Kapittel 7 - Sikkerhet mot naturpåkjenninger - § 7-3 Sikkerhet mot skred"
                }
            ],
            "possibleActions": [
                "Sjekke hvilke krav til sikkerhet som gjelder for ønsket tiltak i byggteknisk forskrift (TEK17) §§ 7-3 og 7-4 og om ønsket tiltak likevel oppfyller krav til sikkerhet.",
                "Flytte tiltaket ut av faresonen.",
                "Hvis behov, utføre sikringstiltak etter råd fra fagkyndig."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Faresoner for kvikkleireskred",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://nve.geodataonline.no/arcgis/rest/services/SkredKvikkleire2/MapServer",
                "intersects layer 1 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1623,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1",
                "title": "Skredfaresoner",
                "description": "NVE gjennomfører faresonekartlegging av skred i bratt terreng for utvalgte områder prioritert for kartlegging, jfr Plan for skredfarekartlegging (NVE rapport 14/2011).Kartleggingen dekker skredtypene snøskred, sørpeskred, steinsprang, jordskred og flomskred.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [
                "Dersom du skal bygge i et område der det er fare for områdeskred må reguleringsplanen vise hva som må gjøres for at tiltaket vil være skredsikkert. Kravet til sikkerhet er også knyttet til mulighet for at planlagte tiltak kan bli truffet at et skred fra ovenforliggende areal.",
                "Du må finne ut hvilken tiltakskategori tiltaket vil være. Dette finner du i [NVEs veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf).",
                "Arealer med utilstrekkelig sikkerhet må vises som hensynssoner og gis tilhørende bestemmelser som gir krav om nødvendig sikring.",
                "For mer informasjon om kvikkleireskred og hvordan sikkerheten kan ivaretas, se [NVEs veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf).",
                "Dersom konsulenten gjennom nye grunnundersøkelser får ytterligere kunnskap om eksisterende eller nye faresoner for kvikkleireskred, skal kartleggingen [meldes inn til NVE](https://www.nve.no/flaum-og-skred/kartlegging/innmelding-av-farekartlegging/)."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Faresoner for kvikkleireskred",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://nve.geodataonline.no/arcgis/rest/services/Skredfaresoner1/MapServer",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1213,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1",
                "title": "Skredfaresoner",
                "description": "NVE gjennomfører faresonekartlegging av skred i bratt terreng for utvalgte områder prioritert for kartlegging, jfr Plan for skredfarekartlegging (NVE rapport 14/2011).Kartleggingen dekker skredtypene snøskred, sørpeskred, steinsprang, jordskred og flomskred.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [
                "Dersom du skal bygge i et område der det er fare for områdeskred må reguleringsplanen vise hva som må gjøres for at tiltaket vil være skredsikkert. Kravet til sikkerhet er også knyttet til mulighet for at planlagte tiltak kan bli truffet at et skred fra ovenforliggende areal.",
                "Du må finne ut hvilken tiltakskategori tiltaket vil være. Dette finner du i [NVEs veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf).",
                "Arealer med utilstrekkelig sikkerhet må vises som hensynssoner og gis tilhørende bestemmelser som gir krav om nødvendig sikring.",
                "For mer informasjon om kvikkleireskred og hvordan sikkerheten kan ivaretas, se [NVEs veileder 1/2019 Sikkerhet mot kvikkleireskred](https://publikasjoner.nve.no/veileder/2019/veileder2019_01.pdf).",
                "Dersom konsulenten gjennom nye grunnundersøkelser får ytterligere kunnskap om eksisterende eller nye faresoner for kvikkleireskred, skal kartleggingen [meldes inn til NVE](https://www.nve.no/flaum-og-skred/kartlegging/innmelding-av-farekartlegging/)."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_nve_flomsoner.gpkg",
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-YELLOW",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [
                {
                    "dataeier": "NVE",
                    "dekningsstatus": "Ikke kartlagt",
                    "dekningsinfo": "Området er ikke kartlagt."
                }
            ],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "e95008fc-0945-4d66-8bc9-e50ab3f50401",
                "title": "Flomsoner",
                "description": "Flomsoner viser arealer som oversvømmes ved ulike flomstørrelser (gjentaksintervall).  Det blir utarbeidet flomsoner for 20-, 200- og 1000-årsflommene. I områder der klimaendringene gir en forventet økning i vannføringen på mer enn 20 %, utarbeides det flomsone for 200-årsflommen i år 2100.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e95008fc-0945-4d66-8bc9-e50ab3f50401"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Nei",
                    "comment": "Ikke kartlagt"
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": [
                "Området er ikke kartlagt for flomsoner"
            ]
        },
        {
            "title": "Aktsomhetsområde for flom og erosjon",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query http://wfs.geonorge.no/skwms1/wfs.flomaktsomhetsomrader",
                "intersects layer FlomAktsomhetOmr (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 148,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "60c5024f-bf93-4d7a-888a-5fe001427195",
                "title": "Flom aktsomhetsområder",
                "description": "NVEs aktsomhetskart for flom er et nasjonalt datasett som på oversiktsnivå viser hvilke arealer som kan være utsatt for flomfare. Potensielt flomutsatte områder vises som polygon på kartet, men inneholder ikke informasjon om den årlige sannsynligheten for flom.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2025-06-30T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/60c5024f-bf93-4d7a-888a-5fe001427195"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [
                "Du må finne ut hvilken sikkerhetsklasse tiltaket vil være. Dette finner du i [TEK 17 § 7-2](https://dibk.no/byggereglene/byggteknisk-forskrift-tek17/7/7-2/)<u>.  </u>Flomfaren må utredes i henhold til sikkerhetsklassen.",
                "Dersom det er fare for flom må reguleringsplanen vise hva som må gjøres for at tiltaket vil være flomsikkert. Dette må vises i planen ved hjelp av hensynsoner og bestemmelser.",
                "Se [NVEs retningslinjer 2/2011 Flaum og skredfare i arealplanar](http://publikasjoner.nve.no/retningslinjer/2011/retningslinjer2011_02.pdf) og [NVE Veileder 3/2023: Sikkerhet mot flom. Utredning av flomfare i reguleringsplan og byggesak](https://publikasjoner.nve.no/veileder/2022/veileder2022_03.pdf) for mer informasjon om videre fremgangsmåte.",
                "For tiltak i sikkerhetsklasse F3 og tiltak som omfattes av § 7-2 første ledd, må det alltid gjennomføres en faresonekartlegging/-utredning.",
                "<u>Erosjon</u>",
                "Dersom planområdet ligger i tilknytning til en elvekant med løsmasser der det pågår erosjon, vil sannsynligheten for at arealet undergraves økes med tiden. Byggverk må derfor legges i sikker avstand fra erosjonsutsatt skråning, eller skråningen sikres mot erosjon. Krav til sikkerhet mot erosjon langs vassdrag er definert i [**TEK17 § 7-2 med veiledning.**](https://dibk.no/byggereglene/byggteknisk-forskrift-tek17/7/7-2/)",
                "For å unngå fare for erosjon bør avstand fra topp elveskråning til bebyggelse bør være minst lik høyden på elveskråningen og minimum 20 meter."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Hensynssone for energianlegg",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs.geonorge.no/skwms1/wfs.nettanlegg",
                "intersects layer EL_Luftlinje (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 868,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "9f71a24b-9997-409f-8e42-ce6f0c62e073",
                "title": "Nettanlegg utbygd",
                "description": "Viser beliggenhet av luftlinjer, sjøkabler, transformatorstasjoner og master i transmisjons-, regional- og høyspent distribusjonsnett. Lavspent distribusjonsnett er ikke en del av datasettet. Jordkabler er heller ikke inkludert. \n\nDatasettet oppdateres ikke fortløpende, kun ved behov. Det kan derfor være feil og mangler i datasettet som skyldes manglende oppdatering.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/9f71a24b-9997-409f-8e42-ce6f0c62e073"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://lovdata.no/dokument/NL/lov/1990-06-29-50",
                    "title": "Energilova"
                },
                {
                    "href": "https://www.nve.no/konsesjon/konsesjonssaker/?ref=mainmenu",
                    "title": "NVEs nettsider for Konsesjonssaker"
                },
                {
                    "href": "https://www.dsb.no/elsikkerhet/elektriske-forsyningsanlegg/veiledning-til-forskrift-om-elektriske-forsyningsanlegg/",
                    "title": "Veiledning til forskrift om elektriske forsyningsanlegg"
                }
            ],
            "possibleActions": [
                "Plasser tiltaket lenger vekk fra energianlegget.",
                "Ta kontakt med netteier for avklaring om det er greit at tiltaket gjennomføres."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 0,
                    "comment": "Ikke egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 0,
                    "comment": "Ikke egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 0,
                    "comment": "Ikke egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Aktsomhetsområder for jord- og flomskred",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs.geonorge.no/skwms1/wfs.aktsomhetskartforjordogflomskred",
                "intersects layer AktsomhetsOmrJordOgFlomskred (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 229,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "30e1883e-70e9-4510-9e97-00edbdcddc02",
                "title": "Aktsomhetskart for jord- og flomskred",
                "description": "NVEs aktsomhetskart for jord- og flomskred viser potensielle utløpsområder for ulike typer løsmasseskred. Det omfatter ikke kvikkleireskred og grunne utglidninger i lave løsmasseskråninger, og ikke masseførende flom.\n\nAktsomhetskartet er basert på deldatasettene «jord- og flomskred» (2025) og «mellomstore flomskred» (2014). \n\nVed bruk av datasettet til analyseformål bør som hovedregel hele utløpsområdet vurderes. Utløpsområdet dekker alle areal hvor skredet fortsatt inneholder en viss andel fast materiale som kan avsettes.Dersom vanninnholdet i skredet er veldig høyt, kan den mest flytende delen av skredet i visse tilfeller nå enda lenger.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-15T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/30e1883e-70e9-4510-9e97-00edbdcddc02"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://veileder-skredfareutredning-bratt-terreng.nve.no/",
                    "title": "NVEs veileder Utredning av sikkerhet mot skred i bratt terreng"
                },
                {
                    "href": "https://www.nve.no/arealplanlegging/bygge-og-dispensasjonssaker/",
                    "title": "NVEs nettsider om bygge- og dispensasjonssaker"
                },
                {
                    "href": "https://lovdata.no/dokument/NL/lov/2008-06-27-71/KAPITTEL_4-9#%C2%A728-1",
                    "title": "Plan- og bygningsloven § 28-1"
                },
                {
                    "href": "https://dibk.no/regelverk/byggteknisk-forskrift-tek17/7/7-3/",
                    "title": "TEK 17 Kapittel 7 - Sikkerhet mot naturpåkjenninger - § 7-3 Sikkerhet mot skred"
                }
            ],
            "possibleActions": [
                "Flytte tiltaket ut av aktsomhetsområdet.",
                "Få fagkyndig til å dokumentere tilstrekkelig sikkerhet mot skred for tiltaket i henhold til byggteknisk forskrift (TEK17) §7-3.",
                "Hvis behov, utføre sikringstiltak etter råd fra fagkyndig."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 3,
                    "comment": "Egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_nve_skredhendelser.gpkg",
                "intersects layer 0 (True)",
                "query https://wfs.geonorge.no/skwms1/wfs.skredhendelser",
                "intersects layer SkredObsHistorisk (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 266,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Natur"
            ],
            "runOnDataset": {
                "datasetId": "de19fbbf-3734-47a0-89f5-6c5769071cdd",
                "title": "Skredhendelser",
                "description": "Datasettet gir en oversikt over registrerte skredhendelser i Norge, og kalles også for den nasjonale skredhendelsesdatabasen (NSDB). NSDB driftes av NVE og inneholder over 100 000 registrerte skredhendelser. Målet for NSDB er å samle skredregistreringer fra forskjellige kilder i én nasjonal database. Statens vegvesen står for størstedelen av skredregistreringene i databasen, men det er også mange skred registrert av Bane NOR, NGI, NGU, NVE og andre personer. De siste årene har antall registreringer økt betraktelig, men databasen inneholder også mange større historiske skredhendelser, spesielt knyttet til dødsulykker. Alle skredhendelser registrert via Varsom Regobs eller Skredregistrering.no ender opp i NSDB.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/de19fbbf-3734-47a0-89f5-6c5769071cdd"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "fullstendighet_dekning",
                    "qualityDimensionName": "Fullstendighetsdekning",
                    "value": "Ja",
                    "comment": null
                },
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 3,
                    "comment": "Egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Aktsomhetsområder for steinsprang",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs.geonorge.no/skwms1/wfs.steinsprang_aktsomhetsomrader",
                "intersects layer PotensieltSkredfareOmr (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "02c6d51c-4e8c-4948-a620-dc046c8cb747",
                "title": "Steinsprang - aktsomhetsområder",
                "description": "Aktsomhetsområder for steinsprang er en nasjonal kartserie som viser potensielt steinsprangutsatte områder på oversiktsnivå. Kartene viser potensielle løsneområder og utløpsområder for steinsprang.\n\nDet gjøres oppmerksom på at arealene som dekkes av utløsningsområder  i praksis også er utløpsområder, ettersom skred som løsner helt øverst i et utløsningsområde beveger seg gjennom nedenforliggende utløsningsområder før det når utløpsområdene nedenfor. Ved bruk av datasettet til analyseformål bør derfor som en hovedregel både utløsningsområder og utløpsområder benyttes sammen.\n\nAktsomhetsområdene er identifisert ved bruk av en datamodell som gjenkjenner mulige løsneområder for steinsprang ut fra helning på terreng og geologisk informasjon. Fra hvert kildeområde er utløpsområdet for steinsprang beregnet automatisk. Det er ikke gjort feltarbeid ved identifisering eller avgrensning av områdene.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2023-12-16T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/02c6d51c-4e8c-4948-a620-dc046c8cb747"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://veileder-skredfareutredning-bratt-terreng.nve.no/",
                    "title": "NVEs veileder Utredning av sikkerhet mot skred i bratt terreng"
                },
                {
                    "href": "https://www.nve.no/arealplanlegging/bygge-og-dispensasjonssaker/",
                    "title": "NVEs nettsider om bygge- og dispensasjonssaker"
                },
                {
                    "href": "https://lovdata.no/dokument/NL/lov/2008-06-27-71/KAPITTEL_4-9#%C2%A728-1",
                    "title": "Plan- og bygningsloven § 28-1"
                },
                {
                    "href": "https://dibk.no/regelverk/byggteknisk-forskrift-tek17/7/7-3/",
                    "title": "TEK 17 Kapittel 7 - Sikkerhet mot naturpåkjenninger - § 7-3 Sikkerhet mot skred"
                }
            ],
            "possibleActions": [
                "Flytte tiltaket ut av aktsomhetsområdet.",
                "Få fagkyndig til å dokumentere tilstrekkelig sikkerhet mot skred for tiltaket i henhold til byggteknisk forskrift (TEK17) §7-3.",
                "Hvis behov, utføre sikringstiltak etter råd fra fagkyndig."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 2,
                    "comment": "Noe egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Automatisk fredede arkeologiske kulturminner",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner",
                "add filter vernetype = 'AUT' AND enkeltminnekategori IN ('E-ARK', 'E-BER', 'E-MAR', 'E-RUI')",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 778,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kulturminner"
            ],
            "runOnDataset": {
                "datasetId": "c72906a0-2bc2-41d7-bea2-c92d368e3c49",
                "title": "Kulturminner - Lokaliteter, Enkeltminner og Sikringssoner",
                "description": "Datasettet Kulturminner – Lokaliteter, Enkeltminner og Sikringssoner inneholder alle  kulturminner på fastlands-Norge og Svalbard (bortsett fra kulturminner som har begrenset offentlighet) som er registrert i Riksantikvarens offisielle database over kulturminner og kulturmiljøer, Askeladden, uavhengig av vernestatus. Et kulturminne er i denne sammenhengen en helhet bestående av en lokalitet med et eller flere enkeltminner, samt sikringssoner (hvis vernestatus tilsier det). \n\nOverordnet kan man si at et enkeltminne representerer et fysisk kulturminne, med dets geografiske utstrekning og informasjon som er spesifikt for det. En lokalitet representerer et geografisk område som inneholder et eller flere enkeltminner som hører sammen på en eller annen måte. Lokaliteten inneholder generell informasjon om dette området, samt informasjon om høyeste vern («høyesteVern») blant enkeltminnene innenfor.\n\nEksempelvis vil et gravfelt utgjøre en lokalitet, mens gravhaug(er)/gravrøys(er) i gravfeltet utgjør enkeltminner. For nyere tids kulturminner kan lokaliteten være ett anlegg som er representert av et enkelt bygg, et gårdstun bestående av flere bygninger, eller én eller flere bygninger med et vedtaksfredet område rundt (park, hage, o.l.).\n\nEn sikringssone er et geografisk område rundt automatisk fredede kulturminner. Området er ment for å gi et ekstra vern mot tiltak, og er derfor særlig viktig å ta hensyn til.",
                "owner": "Riksantikvaren",
                "updated": "2026-03-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c72906a0-2bc2-41d7-bea2-c92d368e3c49"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://lovdata.no/dokument/NL/lov/1978-06-09-50",
                    "title": "Lovdata | Kulturminneloven"
                },
                {
                    "href": "https://riksantikvaren.no/fredning/fredningsstatus/",
                    "title": "Riksantikvaren | Fredning"
                },
                {
                    "href": "https://riksantikvaren.no/fagomrader/arkeologi/",
                    "title": "Riksantikvaren | Fagområde: Arkeologi"
                }
            ],
            "possibleActions": [
                "Kontakt fylkeskommunen som er rette myndighet for å vurdere hva du kan få tillatelse til å gjøre innenfor planområdet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Fjernet arkeologisk kulturminne",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner",
                "add filter vernetype = 'FJE' AND enkeltminnekategori IN ('E-ARK', 'E-BER', 'E-MAR', 'E-RUI')",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1018,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kulturminner"
            ],
            "runOnDataset": {
                "datasetId": "c72906a0-2bc2-41d7-bea2-c92d368e3c49",
                "title": "Kulturminner - Lokaliteter, Enkeltminner og Sikringssoner",
                "description": "Datasettet Kulturminner – Lokaliteter, Enkeltminner og Sikringssoner inneholder alle  kulturminner på fastlands-Norge og Svalbard (bortsett fra kulturminner som har begrenset offentlighet) som er registrert i Riksantikvarens offisielle database over kulturminner og kulturmiljøer, Askeladden, uavhengig av vernestatus. Et kulturminne er i denne sammenhengen en helhet bestående av en lokalitet med et eller flere enkeltminner, samt sikringssoner (hvis vernestatus tilsier det). \n\nOverordnet kan man si at et enkeltminne representerer et fysisk kulturminne, med dets geografiske utstrekning og informasjon som er spesifikt for det. En lokalitet representerer et geografisk område som inneholder et eller flere enkeltminner som hører sammen på en eller annen måte. Lokaliteten inneholder generell informasjon om dette området, samt informasjon om høyeste vern («høyesteVern») blant enkeltminnene innenfor.\n\nEksempelvis vil et gravfelt utgjøre en lokalitet, mens gravhaug(er)/gravrøys(er) i gravfeltet utgjør enkeltminner. For nyere tids kulturminner kan lokaliteten være ett anlegg som er representert av et enkelt bygg, et gårdstun bestående av flere bygninger, eller én eller flere bygninger med et vedtaksfredet område rundt (park, hage, o.l.).\n\nEn sikringssone er et geografisk område rundt automatisk fredede kulturminner. Området er ment for å gi et ekstra vern mot tiltak, og er derfor særlig viktig å ta hensyn til.",
                "owner": "Riksantikvaren",
                "updated": "2026-03-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c72906a0-2bc2-41d7-bea2-c92d368e3c49"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://lovdata.no/dokument/NL/lov/1978-06-09-50",
                    "title": "Lovdata | Kulturminneloven"
                },
                {
                    "href": "https://riksantikvaren.no/fredning/fredningsstatus/ ",
                    "title": "Riksantikvaren | Fredning"
                },
                {
                    "href": "https://riksantikvaren.no/fagomrader/arkeologi/ ",
                    "title": "Riksantikvaren | Fagområde: Arkeologi "
                }
            ],
            "possibleActions": [
                "Kontakt fylkeskommunen som er rette myndighet for å vurdere hvilke arkeologiske undersøkelser som må gjennomføres som en del av planprosessen."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Uavklart arkeologisk kulturminne",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner",
                "add filter vernetype = 'UAV' AND enkeltminnekategori IN ('E-ARK', 'E-BER', 'E-MAR', 'E-RUI')",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 997,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kulturminner"
            ],
            "runOnDataset": {
                "datasetId": "c72906a0-2bc2-41d7-bea2-c92d368e3c49",
                "title": "Kulturminner - Lokaliteter, Enkeltminner og Sikringssoner",
                "description": "Datasettet Kulturminner – Lokaliteter, Enkeltminner og Sikringssoner inneholder alle  kulturminner på fastlands-Norge og Svalbard (bortsett fra kulturminner som har begrenset offentlighet) som er registrert i Riksantikvarens offisielle database over kulturminner og kulturmiljøer, Askeladden, uavhengig av vernestatus. Et kulturminne er i denne sammenhengen en helhet bestående av en lokalitet med et eller flere enkeltminner, samt sikringssoner (hvis vernestatus tilsier det). \n\nOverordnet kan man si at et enkeltminne representerer et fysisk kulturminne, med dets geografiske utstrekning og informasjon som er spesifikt for det. En lokalitet representerer et geografisk område som inneholder et eller flere enkeltminner som hører sammen på en eller annen måte. Lokaliteten inneholder generell informasjon om dette området, samt informasjon om høyeste vern («høyesteVern») blant enkeltminnene innenfor.\n\nEksempelvis vil et gravfelt utgjøre en lokalitet, mens gravhaug(er)/gravrøys(er) i gravfeltet utgjør enkeltminner. For nyere tids kulturminner kan lokaliteten være ett anlegg som er representert av et enkelt bygg, et gårdstun bestående av flere bygninger, eller én eller flere bygninger med et vedtaksfredet område rundt (park, hage, o.l.).\n\nEn sikringssone er et geografisk område rundt automatisk fredede kulturminner. Området er ment for å gi et ekstra vern mot tiltak, og er derfor særlig viktig å ta hensyn til.",
                "owner": "Riksantikvaren",
                "updated": "2026-03-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c72906a0-2bc2-41d7-bea2-c92d368e3c49"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://riksantikvaren.no/fagomrader/arkeologi/",
                    "title": "Riksantikvaren | Fagområde: Arkeologi"
                }
            ],
            "possibleActions": [
                "Kontakt fylkeskommunen som er rette myndighet for å avklare om dette er et automatisk fredet kulturminne eller ikke."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": "Arkeologisk kulturminne uten vern",
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner",
                "add filter vernetype = 'IKKEV' AND enkeltminnekategori IN ('E-ARK', 'E-BER', 'E-MAR', 'E-RUI')",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1050,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kulturminner"
            ],
            "runOnDataset": {
                "datasetId": "c72906a0-2bc2-41d7-bea2-c92d368e3c49",
                "title": "Kulturminner - Lokaliteter, Enkeltminner og Sikringssoner",
                "description": "Datasettet Kulturminner – Lokaliteter, Enkeltminner og Sikringssoner inneholder alle  kulturminner på fastlands-Norge og Svalbard (bortsett fra kulturminner som har begrenset offentlighet) som er registrert i Riksantikvarens offisielle database over kulturminner og kulturmiljøer, Askeladden, uavhengig av vernestatus. Et kulturminne er i denne sammenhengen en helhet bestående av en lokalitet med et eller flere enkeltminner, samt sikringssoner (hvis vernestatus tilsier det). \n\nOverordnet kan man si at et enkeltminne representerer et fysisk kulturminne, med dets geografiske utstrekning og informasjon som er spesifikt for det. En lokalitet representerer et geografisk område som inneholder et eller flere enkeltminner som hører sammen på en eller annen måte. Lokaliteten inneholder generell informasjon om dette området, samt informasjon om høyeste vern («høyesteVern») blant enkeltminnene innenfor.\n\nEksempelvis vil et gravfelt utgjøre en lokalitet, mens gravhaug(er)/gravrøys(er) i gravfeltet utgjør enkeltminner. For nyere tids kulturminner kan lokaliteten være ett anlegg som er representert av et enkelt bygg, et gårdstun bestående av flere bygninger, eller én eller flere bygninger med et vedtaksfredet område rundt (park, hage, o.l.).\n\nEn sikringssone er et geografisk område rundt automatisk fredede kulturminner. Området er ment for å gi et ekstra vern mot tiltak, og er derfor særlig viktig å ta hensyn til.",
                "owner": "Riksantikvaren",
                "updated": "2026-03-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c72906a0-2bc2-41d7-bea2-c92d368e3c49"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://riksantikvaren.no/fagomrader/arkeologi/",
                    "title": "Riksantikvaren | Fagområde: Arkeologi"
                }
            ],
            "possibleActions": [
                "Kontakt fylkeskommunen så de kan vurdere om kulturminnet bør tas vare på eller ikke. Dette avgjør hvilke hensyn du må ta til kulturminnet."
            ],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs02.nibio.no/cgi-bin/rein/flyttlei",
                "intersects layer Flyttlei (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Landbruk"
            ],
            "runOnDataset": {
                "datasetId": "f9c1e228-892f-4f1a-9e4e-b6d6149f373c",
                "title": "Reindrift - Flyttlei",
                "description": "Datasettet flyttlei beskriver lengre leier eller traséer i terrenget der reinen enten drives/ledes/føres eller trekker selv mellom årstidsbeitene. Også svømmelei inngår som flyttlei. \n\nBredden på en flyttlei varierer ut ifra terreng og måten det flyttes på. Det kan være en aktiv driving av reinen, eller at reinen styres i ønsket retning, hvor reinen får beite seg gjennom et område. Enkelte steder er det utvidelser på flyttleia. Disse utvidelsene markerer beitelommer eller overnattingsbeiter hvor flokken hviler/beiter. Bredden vil variere, blant annet etter terrenget og snøforholdene samt størrelsen og samlingen på flokken. Beitelommer/ overnattingsbeite er markert som utvidelser. \n\nHøstflyttingen foregår som oftest mer spredt og over adskillig lenger tid enn vår-flyttingen. Derfor er ofte høstleia bredere. \n\nDatasettet viser dagens arealbruk og er å regne som veiledende illustrasjon på hvordan reindriftsnæringen i hovedsak og normalt bruker områdene.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/f9c1e228-892f-4f1a-9e4e-b6d6149f373c"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs02.nibio.no/cgi-bin/rein/oppsamlingsomrade",
                "intersects layer Oppsamlingsomrade (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Landbruk"
            ],
            "runOnDataset": {
                "datasetId": "a02e84ec-322c-47a7-a626-ca02d57d1f7e",
                "title": "Reindrift - Oppsamlingsområde",
                "description": "Datasettet oppsamlingsområde viser områder som har kvaliteter (godt beite, oversiktlig, naturlig avgrensning etc.) som gjør det enklere for reineiere å kunne utøve kontroll over flokken i et ønsket tidsrom. Oppsamlingsområder benyttes når reinen samles for å foreta kalvemerking, skilling, slakting eller flytting. \n\nDatasettet viser dagens arealbruk og er å regne som veiledende illustrasjon på hvordan reindriftsnæringen i hovedsak og normalt bruker områdene.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a02e84ec-322c-47a7-a626-ca02d57d1f7e"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs02.nibio.no/cgi-bin/rein/reindriftsanlegg",
                "intersects layer ReindriftsAnleggPunkt (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Landbruk"
            ],
            "runOnDataset": {
                "datasetId": "8dfa67c5-3099-4353-9ce0-72f9ebd44a2c",
                "title": "Reindrift - Reindriftsanlegg",
                "description": "Datasettet reindriftsanlegg gir opplysninger om ulike typer gjerder, gjeterhytter og anlegg som er tilknyttet reindrifta. Retten til å utøve reindrift kan også gi rett til husvære, buer o.l. etter reindriftsloven § 21, og rett til å føre opp arbeids- og sperregjerder, slakteanlegg, broer og andre anlegg som er nødvendige for reindriften, etter reindriftsloven § 24. Gjerder og anlegg som skal bli stående ut over en sesong, kan ikke oppføres uten godkjenning av departementet.\n\nDatasettet gir illustrasjon på stedfesting av ulike typer gjerder og anlegg i tilknyttet reindrifta. Dette kan være både linjer og punkter.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/8dfa67c5-3099-4353-9ce0-72f9ebd44a2c"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 5,
                    "comment": "Svært godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 5,
                    "comment": "Svært godt egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                196245.01,
                                6562107.57
                            ],
                            [
                                196229.59,
                                6562103.93
                            ],
                            [
                                196222.11,
                                6562110.75
                            ],
                            [
                                196199.11,
                                6562159.2
                            ],
                            [
                                196268.7,
                                6562181.56
                            ],
                            [
                                196265.6,
                                6562198.88
                            ],
                            [
                                196264.26,
                                6562206.18
                            ],
                            [
                                196273.4,
                                6562215.36
                            ],
                            [
                                196281.05,
                                6562202.11
                            ],
                            [
                                196285.91,
                                6562182.17
                            ],
                            [
                                196297.05,
                                6562141.81
                            ],
                            [
                                196276.52,
                                6562135.4
                            ],
                            [
                                196253.46,
                                6562118.64
                            ],
                            [
                                196245.01,
                                6562107.57
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                196343.5,
                                6562224.95
                            ],
                            [
                                196344.65,
                                6562222.87
                            ],
                            [
                                196344.93,
                                6562221.93
                            ],
                            [
                                196345.62,
                                6562219.93
                            ],
                            [
                                196346.47,
                                6562216.97
                            ],
                            [
                                196347.07,
                                6562215.55
                            ],
                            [
                                196347.08,
                                6562215.51
                            ],
                            [
                                196345.61,
                                6562214.84
                            ],
                            [
                                196338.31,
                                6562211.63
                            ],
                            [
                                196334.27,
                                6562220.83
                            ],
                            [
                                196341.57,
                                6562224.04
                            ],
                            [
                                196343.5,
                                6562224.95
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
            },
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "query https://wfs02.nibio.no/cgi-bin/rein/trekklei",
                "intersects layer Trekklei (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 5089.11,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 9223372036854776000,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Landbruk"
            ],
            "runOnDataset": {
                "datasetId": "95b0d396-a6fe-462b-8753-120efd0b60f3",
                "title": "Reindrift - Trekklei",
                "description": "Datasettet trekklei viser viktige naturlige trekk mellom ulike beiteområder og forbi passasjer, der reinen trekker av seg selv, enten enkeltvis eller i flokk.\n\nDatasettet viser dagens arealbruk og er å regne som veiledende illustrasjon på hvordan reindriftsnæringen i hovedsak og normalt bruker områdene.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/95b0d396-a6fe-462b-8753-120efd0b60f3"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [
                {
                    "qualityDimensionId": "egnethet_reguleringsplan",
                    "qualityDimensionName": "Reguleringsplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_kommuneplan",
                    "qualityDimensionName": "Kommuneplan",
                    "value": 4,
                    "comment": "Godt egnet"
                },
                {
                    "qualityDimensionId": "egnethet_byggesak",
                    "qualityDimensionName": "Byggesak",
                    "value": 4,
                    "comment": "Godt egnet"
                }
            ],
            "qualityWarning": []
        }
    ],
    "inputGeometry": {
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
    },
    "inputGeometryArea": 5089.11,
    "municipalityNumber": "4001",
    "municipalityName": "Porsgrunn",
    "report": null,
    "factSheetRasterResult": {
        "imageUri": null,
        "mapUri": null
    },
    "factSheetCartography": null,
    "factList": []
};