import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetState as resetAppState } from 'store/slices/progressSlice';
import { useResponse } from 'context/ResponseContext';
import { useMap } from 'context/MapContext';
import { setErrorMessage } from 'store/slices/appSlice';
import { analyze } from 'utils/api';
import { mapResponse } from './helpers';
import { Button, Checkbox, CircularProgress, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Paper, Select } from '@mui/material';
import { IntegerField } from 'components';
import { GeometryDialog } from 'features';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './Form.module.scss';

export default function Form() {
    const [state, setState] = useState(getDefaultValues());
    const { clearCache } = useMap();
    const { setResponse, busy, setBusy } = useResponse();
    const geometryDialogRef = useRef(null);
    const correlationId = useSelector(state => state.app.correlationId);
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
        setResponse(null);
        clearCache();
        dispatch(resetAppState());
    }

    async function runAnalyses() {       
        resetState();
        const payload = getPayload();

        try {
            setBusy(true);
            const response = _data; // await analyze(payload);
            const mapped = mapResponse(response);
            setResponse(mapped);
        } catch (error) {
            dispatch(setErrorMessage('Kunne ikke kjøre DOK-analyse. En feil har oppstått.'));
            console.log(error);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className={styles.form}>
            <div className={styles.input}>
                <div className={styles.row}>
                    <div className={styles.addGeometry}>
                        <GeometryDialog
                            ref={geometryDialogRef}
                            onOk={handleGeometryDialogOk}
                        />

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
                        <IntegerField
                            name="requestedBuffer"
                            value={state.requestedBuffer}
                            onChange={handleChange}
                            label="Buffer"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">[meter]</InputAdornment>
                            }}
                            sx={{
                                width: 150
                            }}
                        />
                    </div>
                    <div>
                        <FormControl sx={{ width: 200 }}>
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
                        </FormControl>
                    </div>
                    <div>
                        <FormControl sx={{ width: 200 }}>
                            <InputLabel id="theme-label">Tema</InputLabel>
                            <Select
                                labelId="theme-label"
                                id="theme-select"
                                name="theme"
                                value={state.theme}
                                label="Velg tema"
                                onChange={handleChange}
                            >
                                <MenuItem value="">Velg...</MenuItem>
                                <MenuItem value="Geologi">Geologi</MenuItem>
                                <MenuItem value="Kulturminner">Kulturminner</MenuItem>
                                <MenuItem value="Klima">Klima</MenuItem>
                                <MenuItem value="Kyst og fiskeri">Kyst og fiskeri</MenuItem>
                                <MenuItem value="Landbruk">Landbruk</MenuItem>
                                <MenuItem value="Natur">Natur</MenuItem>
                                <MenuItem value="Plan">Plan</MenuItem>
                                <MenuItem value="Samferdsel">Samferdsel</MenuItem>
                                <MenuItem value="Samfunnssikkerhet">Samfunnssikkerhet</MenuItem>
                            </Select>
                        </FormControl>
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "ec1541d3-4a56-4095-9bf7-08dcfbb673d1",
                "title": "Støysoner for Forsvarets flyplasser",
                "description": "Støysonene er ment som et hjelpemiddel i forbindelse med kommunens plan- og byggesaksarbeid. Rød sone angir områder som er sterkt berørte av støy, der det frarådes å etablere støyfølsom bebyggelse. Gul sone angir områder som i noen grad er berørte av støy og der etablering av støyfølsom bebyggelse kan vurderes dersom det utføres støyreduserende tiltak.",
                "owner": "Forsvarsbygg",
                "updated": "2025-05-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/ec1541d3-4a56-4095-9bf7-08dcfbb673d1"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Støy fra vegtrafikk, gul støysone",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "query https://www.vegvesen.no/kart/ogc/norstoy_1_0/ows",
                "add filter \"STØYSONEKATEGORI\" = 'G'",
                "intersects layer Stoyvarselkart (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": 1639.23,
            "resultStatus": "HIT-YELLOW",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://www.vegvesen.no/kart/ogc/norstoy_1_0/ows?layers=Stoyvarselkart"
            },
            "cartography": "https://www.vegvesen.no/kart/ogc/norstoy_1_0/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=Stoyvarselkart&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "STØYSONEKATEGORI": "G",
                    "STØYKILDE": "V",
                    "STØYKILDENAVN": "ERF-veger",
                    "STØYMETODE": "Norstøy versjon 3.4, beregningsmetode Nord2000",
                    "BEREGNETÅR": "2040"
                }
            ],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "d6db9f39-9725-4630-909e-5e62f09a0766",
                "title": "Støykartlegging veg etter T-1442",
                "description": "Denne tjenesten inneholder Støyvarselkart etter T-1442. Støyvarselkartene er utarbeidet etter Retningslinje for behandling av støy i arealplanlegging (T-1442). Støyvarselkartene viser beregnet rød (Lden>65dB) og gul (Lden>55dB) støysone langs riks- og fylkesveg. Støyvarselkartene fra Statens vegvesen viser en prognosesituasjon 15–20 år fram i tid. Det vil si at trafikkvolum (ÅDT), som er en av de viktigste parameterne i støyberegningsmodellen, er fremskrevet (basert på prognoser) til oppgitt beregningsår. Beregningshøyden er 4 meter. Kartleggingene er gjennomført med Statens vegvesens beregningsverktøy NorStøy. Beregningsmetode er Nord2000Road. Data om vegene og trafikken hentes fra Nasjonal vegdatabank (NVDB). De viktigste parameterne er ÅDT, tungtrafikkandel og hastighet. Kartdata hentes fra felles kartdatabasen (FKB). Informasjon om bygninger hentes fra matrikkelen.",
                "owner": "Statens vegvesen",
                "updated": "2025-10-23T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d6db9f39-9725-4630-909e-5e62f09a0766"
            },
            "description": "Støy rammer svært mange mennesker i Norge i dag, og er et alvorlig folkehelseproblem. Støy kan føre til søvnforstyrrelser og en rekke støyplager som for eksempel muskelspenninger og muskelsmerter, og er en medvirkende årsak til hjerte- og karsykdom.\n\nStøyretningslinje T-1442 anbefaler grenseverdier for støyfølsom bebyggelse. Bakgrunnen for støygrensene er forskning på støy og helse. Grenseverdiene for utendørs lydnivå er satt på bakgrunn av kunnskapen vi har om hvor mye støy folk tåler å bli utsatt for uten at de føler seg plaget av støyen. T-1442 anbefaler at ny bebyggelse etableres på en slik måte at alle boliger får en stille side av bebyggelse, og tilfredsstillende støynivå på utearealer og innendørs.",
            "guidanceText": "Planområdet ligger innenfor gul støysone. I gul støysone bør det vises varsomhet med å etablere ny støyfølsom bebyggelse. Støynivåer i øvre del av støysone kan gjøre det vanskelig å sikre tilfredsstillende støyforhold for ny bebyggelse.\n\nEtablering av støyfølsom bebyggelse i øvre del av gul støysone og i rød støysone er også innsigelsesgrunnlag, jf. rundskriv T-2/16 om nasjonale eller vesentlige regionale interesser på miljøområdet.",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/forurensning/stoy/for-myndigheter/veileder-om-behandling-av-stoy-i-arealplanlegging/",
                    "title": "Veileder om behandling av støy i arealplanlegging"
                },
                {
                    "href": "https://www.regjeringen.no/no/dokumenter/miljoforvaltningens-innsigelsespraksis/id2504971/",
                    "title": "Nasjonale og vesentlige regionale interesser på miljøområdet"
                }
            ],
            "possibleActions": [
                "Legg bebyggelsen utenfor støysonen der dette er mulig. Der det ikke er mulig, kan det settes opp støyvoller eller støyskjermer for å redusere støynivået i området. Bebyggelsen kan brukes som skjerm og sikre tilfredsstillende støyforhold på én side av bebyggelsen og uteområdene. Dersom denne løsningen brukes, bør alle boliger/leiligheter være gjennomgående, slik at de har tilgang til den stille siden."
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
                    "value": 3,
                    "comment": "Egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Støy fra jernbanenettet, rød støysone",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "query https://wfs.geonorge.no/skwms1/wfs.stoysonerjernbanenett",
                "add filter \"støysonekategori\" = 'R'",
                "intersects layer Støy (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 91,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "47234f63-a9d1-43c7-b91c-db90c92d5008",
                "title": "Støysoner for Bane NORs jernbanenett",
                "description": "Datasettet inneheld støysonekart for Bane NORs jernbanenett utarbeidd i samsvar med \"Retningslinje for behandling av støy i arealplanlegging (T-1442)\". Støysonekarta viser berekna raud (Lden>68 dB) og gul (Lden>58dB) støysone.",
                "owner": "Bane NOR SF",
                "updated": "2025-03-12T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/47234f63-a9d1-43c7-b91c-db90c92d5008"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/forurensning/stoy/for-myndigheter/veileder-om-behandling-av-stoy-i-arealplanlegging/",
                    "title": "Veileder om behandling av støy i arealplanlegging"
                },
                {
                    "href": "https://www.regjeringen.no/no/dokumenter/miljoforvaltningens-innsigelsespraksis/id2504971/",
                    "title": "Nasjonale og vesentlige regionale interesser på miljøområdet"
                }
            ],
            "possibleActions": [
                "Legg bebyggelsen utenfor støysonen der dette er mulig. Der det ikke er mulig, kan det settes opp støyvoller eller støyskjermer for å redusere støynivået i området. Bebyggelsen kan brukes som skjerm og sikre tilfredsstillende støyforhold på én side av bebyggelsen og uteområdene. Dersom denne løsningen brukes, bør alle boliger/leiligheter være gjennomgående, slik at de har tilgang til den stille siden."
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
                    "value": 2,
                    "comment": "Noe egnet"
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_kld_markagrensen.geojson"
            ],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "ERROR",
            "distanceToObject": 0,
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
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Geotekniske undersøkelser",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": 31933.4,
            "resultStatus": "HIT-YELLOW",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://geo.ngu.no/geoserver/nadag/ows?layers=GB_filter_komplette_data"
            },
            "cartography": "https://geo.ngu.no/geoserver/nadag/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=GB_filter_komplette_data&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "prosjektNavn": "121043-2 Ny E18 i Bærum",
                    "oppdragsgiver": "Statens vegvesen",
                    "beskrivelse": null,
                    "prosjektNr": "121043",
                    "opphav": "Levert til NADAG fra SVV 2020-11-03"
                },
                {
                    "prosjektNavn": "E18 Store Stabekk Gård",
                    "oppdragsgiver": "Statens vegvesen",
                    "beskrivelse": null,
                    "prosjektNr": "20150078-01",
                    "opphav": "Levert til NADAG fra SVV 2020-12-11"
                },
                {
                    "prosjektNavn": "Bærumsdiagonalen",
                    "oppdragsgiver": "Statens vegvesen",
                    "beskrivelse": "10035-GEOT-08",
                    "prosjektNr": "10035-08",
                    "opphav": "Levert til NADAG fra SVV 2020-11-04"
                },
                {
                    "prosjektNavn": "121043-1 Ny E18 i Bærum",
                    "oppdragsgiver": "Statens vegvesen",
                    "beskrivelse": null,
                    "prosjektNr": "121043",
                    "opphav": "Levert til NADAG fra SVV 2020-11-03"
                },
                {
                    "prosjektNavn": "E18 Vestkorridoren",
                    "oppdragsgiver": "Statens vegvesen",
                    "beskrivelse": null,
                    "prosjektNr": "20130851",
                    "opphav": "Levert til NADAG fra SVV 2020-11-17"
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
                "updated": "2026-03-06T00:00:00",
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
            "title": "Uavklart arkeologisk kulturminne",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 51,
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
                "updated": "2026-03-09T00:00:00",
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
            "title": null,
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "check coverage dekning_fiskeplasser_redskap.geojson",
                "intersects layer 0 (False)",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
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
                    "dataeier": "Fiskeridirektoratet",
                    "dekningsstatus": "ikkeRelevant",
                    "dekningsinfo": "Fenomenet er ikke relevant i området."
                },
                {
                    "dataeier": "Fiskeridirektoratet",
                    "dekningsstatus": "ikkeRelevant",
                    "dekningsinfo": "Fenomenet er ikke relevant i området."
                }
            ],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "09a40026-00e2-4fd8-b390-afd8d6f88c63",
                "title": "Fiskeplasser - redskap",
                "description": "Fiskeribruksområder - Arealavgrenset område hvor det drives fiske med med aktive redskap for eksempel snurrevad, snurpenot, reketrål, eller passive redskap som for eksempel garn og line. Informasjonen som er registrert er basert på intervju med fiskere.",
                "owner": "Fiskeridirektoratet",
                "updated": "2024-12-29T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/09a40026-00e2-4fd8-b390-afd8d6f88c63"
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
                    "value": 2,
                    "comment": "Noe egnet"
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
                    "value": 3,
                    "comment": "Egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Flom fra sjø ved høye vannstander (stormflo) og økt havnivå",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "intersects layer Stormflo20År_KlimaÅrNå (False)",
                "intersects layer Stormflo200År_KlimaÅrNå (False)",
                "intersects layer Stormflo200År_KlimaÅr2100 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 570,
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
                "datasetId": "fbb95c67-623f-430a-9fa5-9cfcea8366b3",
                "title": "Stormflo og havnivå",
                "description": "Merk at datasettet \"Stormflo og havnivå\" kom i ny utgave da DSBs veileder ble oppdatert 1. juli 2024. I januar 2025 kom det forbedringer som blant annet fjernet isolerte, oversvømte arealer på land som ikke var reelle. Det er planlagt flere forbedringer av datasettet utover våren som spesielt vil forbedre datasettet for enkelte fjorder/basseng med trang åpning.\n\nEn konsekvens av menneskeskapte klimaendringer er at havnivået stiger. Rapporten Sea-Level Rise and Extremes in Norway (2024) viser at også i Norge vil vi merke den økende stigningen. I veilederen «Havnivåstigning og høye vannstander i samfunnsplanlegging» (2024) kommer DSB med råd og anbefalinger om hvordan kommunene skal ta hensyn til havnivåstigning i sin planlegging, både på kort og lang sikt, og for ny og eksisterende bebyggelse. Hensikten er å forebygge risiko for tap av liv, skade på helse, miljø og viktig infrastruktur, materielle verdier mv. på grunn av oversvømmelse. I tillegg til havnivåstigning, omhandler veilederen høye vannstander (stormflo) fordi havnivåstigningen fører til at høye vannstander vil inntreffe lenger, og oftere, inn over land enn hva som er tilfelle i dag.\n\nInformasjon om de høye vannstander med dagens havnivå eller med et framtidig havnivå som denne veilederen anbefaler kommunene å bruke, er samlet i dette datasettet. Videre har Kartverket modellert hvilke areal som kan bli berørt av oversvømmelse ved de ulike høye vannstandene, nå og i framtiden. \nDe høye vannstandene tilsvarer sikkerhetsklassene for flom brukt i TEK17 som er 20-års, 200-års og 1000-års stormflo. I tillegg finnes et «øvre estimat vannstand» som er anbefalt brukt for bygg som omfattes av TEK17 § 7-2 første ledd. \n\nNoen av disse høye vannstandene kommer også med klimapåslaget for havnivåendring frem til år 2100 eller år 2150. I tråd med det nye føre-var-grunnlaget for klimatilpasning i Norge er klimapåslaget basert på utslippsscenario SSP3-7.0 der man bruker 83-prosentiler for det sannsynlige utfallsrommet.\n\nDatasettet og veilederen fra DSB retter seg hovedsakelig mot kommuner og andre fagkyndige som skal utrede og vurdere konsekvensene av havnivåstigning og stormflo i saker etter plan- og bygningsloven, og ved utarbeidelse av helhetlig risiko- og sårbarhetsanalyse etter sivilbeskyttelsesloven.  \n\nSe produktspesifikasjon for ytterligere informasjon.",
                "owner": "Kartverket",
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fbb95c67-623f-430a-9fa5-9cfcea8366b3"
            },
            "description": null,
            "guidanceText": null,
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
                    "comment": "Kartlagt uten funn"
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_nve_aktsomhetsomr_kvikkleireskred.geojson"
            ],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "ERROR",
            "distanceToObject": 0,
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
                "updated": "2026-02-17T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dabd2a2c-36d5-4ed7-a4c9-d49808a2b848"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Naturtypelokalitet, svært stor verdi",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": 900.52,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_kuverdi/MapServer/WMSServer?layers=kuverdi_svært_stor_verdi"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_kuverdi/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=kuverdi_svært_stor_verdi&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Naturtype": "Slåttemark",
                    "Verdikategori": "Svært stor verdi",
                    "Opphav": "Naturtyper - Utvalgte",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Faktaark": "https://faktaark.naturbase.no/?id=VKU-UN-NINFP2310146601"
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
            "qualityWarning": []
        },
        {
            "title": "Naturtyper på land (NiN), dekningskart",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": 7952.74,
            "resultStatus": "HIT-YELLOW",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer?layers=dekningskart_naturtyper_nin"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=dekningskart_naturtyper_nin&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Prosjektnavn": "472849__Gamle drammensveg 74__2023__NTYP",
                    "Årstall": 2023,
                    "Oppdragsgiver": "Arborist & Gartner Kenneth Thomassen",
                    "Oppdragstaker": "Ecofact Sørvest AS",
                    "Kartleggingsinstruks": "https://nedlasting.miljodirektoratet.no/NiN_Instrukser/Ntyp2023_kartleggingsinstruks.pdf",
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
            "title": "Forurenset grunn",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 112,
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "ec1541d3-4a56-4095-9bf7-08dcfbb673d1",
                "title": "Støysoner for Forsvarets flyplasser",
                "description": "Støysonene er ment som et hjelpemiddel i forbindelse med kommunens plan- og byggesaksarbeid. Rød sone angir områder som er sterkt berørte av støy, der det frarådes å etablere støyfølsom bebyggelse. Gul sone angir områder som i noen grad er berørte av støy og der etablering av støyfølsom bebyggelse kan vurderes dersom det utføres støyreduserende tiltak.",
                "owner": "Forsvarsbygg",
                "updated": "2025-05-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/ec1541d3-4a56-4095-9bf7-08dcfbb673d1"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "c3d6bba0-e4b0-44e6-93a4-5b379946acb7",
                "title": "Gyteområder",
                "description": "Datasettet viser områder hvor det blir fanget gytefisk, hvilken art og gyteperiode. Opplysningene er basert på intervju av i fiskere, dvs at det inneholder opplysninger om kommersielle arter",
                "owner": "Fiskeridirektoratet",
                "updated": "2026-02-28T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c3d6bba0-e4b0-44e6-93a4-5b379946acb7"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Kalksjøer",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1800,
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
            "title": "Støy fra jernbanenettet, gul støysone",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "query https://wfs.geonorge.no/skwms1/wfs.stoysonerjernbanenett",
                "add filter \"støysonekategori\" = 'G'",
                "intersects layer Støy (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 15,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "47234f63-a9d1-43c7-b91c-db90c92d5008",
                "title": "Støysoner for Bane NORs jernbanenett",
                "description": "Datasettet inneheld støysonekart for Bane NORs jernbanenett utarbeidd i samsvar med \"Retningslinje for behandling av støy i arealplanlegging (T-1442)\". Støysonekarta viser berekna raud (Lden>68 dB) og gul (Lden>58dB) støysone.",
                "owner": "Bane NOR SF",
                "updated": "2025-03-12T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/47234f63-a9d1-43c7-b91c-db90c92d5008"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/forurensning/stoy/for-myndigheter/veileder-om-behandling-av-stoy-i-arealplanlegging/",
                    "title": "Veileder om behandling av støy i arealplanlegging"
                },
                {
                    "href": "https://www.regjeringen.no/no/dokumenter/miljoforvaltningens-innsigelsespraksis/id2504971/",
                    "title": "Nasjonale og vesentlige regionale interesser på miljøområdet"
                }
            ],
            "possibleActions": [
                "Legg bebyggelsen utenfor støysonen der dette er mulig. Der det ikke er mulig, kan det settes opp støyvoller eller støyskjermer for å redusere støynivået i området. Bebyggelsen kan brukes som skjerm og sikre tilfredsstillende støyforhold på én side av bebyggelsen og uteområdene. Dersom denne løsningen brukes, bør alle boliger/leiligheter være gjennomgående, slik at de har tilgang til den stille siden."
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
                    "value": 2,
                    "comment": "Noe egnet"
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b3c319bd-910d-4663-8ce8-23a246afe879"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Åpen grunnlendt kalkmark i boreonemoral sone",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 15,
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
            "title": "Faresoner for kvikkleireskred",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 7147,
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
                "updated": "2026-03-08T00:00:00",
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
            "title": "Tilfluktsrom - offentlige",
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
                "updated": "2026-03-09T00:00:00",
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
            "title": "Foreslåtte naturvernområder",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 2475,
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_nve_skredhendelser.gpkg"
            ],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "ERROR",
            "distanceToObject": 0,
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
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/de19fbbf-3734-47a0-89f5-6c5769071cdd"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Kalklindeskog",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 716,
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
            "title": "Hule eiker",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "intersects layer 0 (False)",
                "get distance to nearest object",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 398,
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b3c319bd-910d-4663-8ce8-23a246afe879"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Arkeologisk kulturminne uten vern",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1135,
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
                "updated": "2026-03-09T00:00:00",
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
            "title": "Faresoner for kvikkleireskred",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "intersects layer 1 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": 2213.15,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://nve.geodataonline.no/arcgis/services/SkredKvikkleire2/MapServer/WMSServer?layers=KvikkleireRisiko"
            },
            "cartography": "https://nve.geodataonline.no/arcgis/services/SkredKvikkleire2/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=KvikkleireRisiko&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "skredOmrNavn": "Område uten fare",
                    "faregrad": "Ingen",
                    "konsekvens": 0,
                    "risiko": 0,
                    "rapportURL": "www.nve.no/akershus/kvikkleirerapporter-for-baerum-kommune/"
                }
            ],
            "themes": [
                "Samfunnssikkerhet"
            ],
            "runOnDataset": {
                "datasetId": "b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1",
                "title": "Skredfaresoner",
                "description": "NVE gjennomfører faresonekartlegging av skred i bratt terreng for utvalgte områder prioritert for kartlegging, jfr Plan for skredfarekartlegging (NVE rapport 14/2011).Kartleggingen dekker skredtypene snøskred, sørpeskred, steinsprang, jordskred og flomskred.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1"
            },
            "description": "Planområdet er skredutsatt.\n\nDet er utarbeidet faresonekart for kvikklerieskred for hele eller deler av planområdet",
            "guidanceText": "Planområdet ligger innenfor kartlagt kvikkleireområde",
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "4ca8af5e-ffc7-4636-847d-4eca92c4a3b0",
                "title": "Akvakultur - lokaliteter",
                "description": "Datasettet Akvakultur - lokaliteter viser ca midtpunkt på alle akvakultur lokaliteter i Norge. Opplysninger om status tillatelse, samt fiskeart, type produksjon, kapasitet og formål inngår. \n\nDet vises også flater som er områder i sjø hvor det er gitt tillatelse til å drive med akvakulturvirksomhet. Flatene er tegnet basert på lokalitetenes klarerte ytterpunkt registrert i Fiskeridirektoratets akvakulturregister. \n\nDet er ikke alltid fisk eller skjell ved lokalitetene- dette kan sjekkes ved å se på Biomasse- ja/nei tema. Biomasse- ja/nei er basert på rapporter som viser opplysninger fra lokaliteten siste dag i hver måned. \n\nI tillegg er det informasjon om slettede/ nedlagte lokaliteter. Det har vært gitt tillatelse til akvakulturvirksomhet på lokalitetene på et tidspunkt, men tillatelsen er trukket tilbake og per dags dato er det ikke godkjent til bruk for akvakulturvirksomhet. De vises med status \"TT\" -Trukket tilbake, og dato for \"ikke lenger gyldig\".",
                "owner": "Fiskeridirektoratet",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/4ca8af5e-ffc7-4636-847d-4eca92c4a3b0"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Kystlynghei",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
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
            "title": "Aktsomhetsområde for flom og erosjon",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 59,
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
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
            "title": "Dyrkbar jord",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "query https://wfs.nibio.no/cgi-bin/dyrkbarjord",
                "intersects layer Dyrkbarjord (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": 6007.36,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://wms.nibio.no/cgi-bin/dyrkbarjord_2?layers=dyrkbar_jord"
            },
            "cartography": "https://wms.nibio.no/cgi-bin/dyrkbarjord_2?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=dyrkbar_jord&sld_version=1.1.0&format=image/png",
            "data": [
                {
                    "dyrkbarjord": "82",
                    "lokalid": "685383",
                    "endretetter2008": "1",
                    "informasjon": "DBJ_20240404_FRA_DMK_2008_OG_AR5_2023",
                    "komid": "3201"
                },
                {
                    "dyrkbarjord": "82",
                    "lokalid": "685384",
                    "endretetter2008": "1",
                    "informasjon": "DBJ_20240404_FRA_DMK_2008_OG_AR5_2023",
                    "komid": "3201"
                },
                {
                    "dyrkbarjord": "82",
                    "lokalid": "682827",
                    "endretetter2008": "1",
                    "informasjon": "DBJ_20240404_FRA_DMK_2008_OG_AR5_2023",
                    "komid": "3201"
                }
            ],
            "themes": [
                "Geologi"
            ],
            "runOnDataset": {
                "datasetId": "8252baea-5bad-428b-8f18-fe236fa4ced6",
                "title": "Dyrkbar jord",
                "description": "Dyrkbar jord er i år (2025) revidert gjennom bruk av flere datakilder og nye metoder, og det nye datsettet ble gjort tilgjengelig via Geonorge den 16. september. Det er nå lagt inn flere nye tematiske egenskaper i datasettet, og det er gjort en teknisk rydding som innebærer nye objekter og ny geometri. Gå til produktsiden for å lese mer om det reviderte datasettet.\n\nDatasettet Dyrkbar jord er et landsdekkende data-sett som viser arealer som per i dag ikke er fulldyrka jord, men som ut fra agronomiske perspektiv kan dyrkes opp, og som holder kravene til klima og jordkvalitet for plantedyrking. Dyrkbar jord kan være registrert på arealtypene Overflatedyrka jord, Innmarksbeite, Skog, Åpen fastmark og Myr, slik disse er klassifisert i AR5.\n\nDatasettet er et automatisk avledet produkt som produseres årlig.",
                "owner": "Norsk institutt for bioøkonomi",
                "updated": "2025-09-12T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/8252baea-5bad-428b-8f18-fe236fa4ced6"
            },
            "description": "Dyrkbar jord er arealer som ikke er jordbruksareal i dag, men som ved oppdyrking vil holde kravene til fulldyrka jord. I tillegg skal de holde kravene til klima og jordkvalitet for plantedyrking. Dyrkbar jord er en begrensa ressurs og utgjør en reserve for matproduksjon i framtida. I henhold til Jordloven må ikke dyrkbar jord disponeres slik at den blir uegna til jordbruksproduksjon i framtida. Området kan likevel være regulert til annet formål, sjekk med kommuneplanens arealdel.",
            "guidanceText": "Planområdet kommer i overlapp med dyrkbar jord, dvs. areal som ved oppdyrking kan settes i stand til å bli fulldyrka jord. Dette kan gjøre det vanskeligere å få godkjent planen.",
            "guidanceUri": [
                {
                    "href": "https://www.nibio.no/tema/jord/arealressurser/dyrkbar-jord",
                    "title": "Informasjon om dyrkbar jord"
                },
                {
                    "href": "https://lovdata.no/dokument/NL/lov/1995-05-12-23/KAPITTEL_4#KAPITTEL_4",
                    "title": "Jordloven, om vern av dyrka og dyrkbar jord"
                }
            ],
            "possibleActions": [
                "Arronder planområdet slik at dyrkbar jord ikke berøres.",
                "Gjør tiltaket så lite arealkrevende som mulig.",
                "Dersom planområdet helt eller delvis må plasseres på dyrkbar jord, skal kommunen vurdere tiltaket i henhold til Jordloven. Gi i så fall en begrunnelse for behovet"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_mdir_naturvernomrader.gpkg"
            ],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "ERROR",
            "distanceToObject": 0,
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
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekning_hovedled_biled_arealgrense.gpkg"
            ],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "ERROR",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "samferdsel"
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
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Hensynssone for energianlegg",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 247,
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
            "title": "Slåttemyr",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
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
            "title": "Aktsomhetsområder for steinsprang",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "1489f7f8-40c8-4dc4-83b6-bcf277b56506",
                "title": "Støysoner Avinors lufthavner",
                "description": "Datasettet gir opplysninger om støy i innflyvningssoner og støy ved bakken i tilknytning til flyplasser. Støysoner er behandlet iht. T-1442 Retningslinjer for behandling av støy i arealplanlegging, Miljøverndepartementet",
                "owner": "Avinor",
                "updated": "2025-01-17T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/1489f7f8-40c8-4dc4-83b6-bcf277b56506"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Fjernet arkeologisk kulturminne",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1574,
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
                "updated": "2026-03-09T00:00:00",
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
            "title": "Slåttemark",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": 900.52,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?layers=naturtype_utvalgt_omr"
            },
            "cartography": "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_utvalgte2/MapServer/WMSServer?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=naturtype_utvalgt_omr&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "Områdenavn": "Store Stabekk slåttemark",
                    "UtvalgtNaturtype": "Slåttemark",
                    "Nøyaktighetsklasse": "Meget god (5 - 20m)",
                    "Registreringsdato": 1684886400000,
                    "Faktaark": "https://faktaark.naturbase.no?id=UN-NINFP2310146601"
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
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
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Automatisk fredede arkeologiske kulturminner",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
            "inputGeometryArea": 8630.86,
            "hitArea": null,
            "resultStatus": "NO-HIT-GREEN",
            "distanceToObject": 1222,
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
                "updated": "2026-03-09T00:00:00",
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "fb59846b-edb3-4631-ba85-90dd0193e3be",
                "title": "Låssettingsplasser",
                "description": "En låssettingsplass er et arealavgrenset område nær strandlinjen hvor fisk oppbevares i not/notinnhengning til den er klar for levering. \nEn låssettingsplass er definert som en plass nær strandlinjen hvor topografiske og hydrografiske forhold er slik at et notsteng kan låssettes der, dvs fisken kan oppbevares i noten/ innhengningen til den er klar for omsetning.\n\nEn låssettingsplass karakteriseres av at den er godt skjermet for vær og vind, ikke har for mye strøm og har tilstrekkelig dybde, oksygen og saltholdighet.",
                "owner": "Fiskeridirektoratet",
                "updated": "2026-02-28T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fb59846b-edb3-4631-ba85-90dd0193e3be"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        },
        {
            "title": "Støy fra vegtrafikk, rød støysone",
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "query https://www.vegvesen.no/kart/ogc/norstoy_1_0/ows",
                "add filter \"STØYSONEKATEGORI\" = 'R'",
                "intersects layer Stoyvarselkart (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": 238.15,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://www.vegvesen.no/kart/ogc/norstoy_1_0/ows?layers=Stoyvarselkart"
            },
            "cartography": "https://www.vegvesen.no/kart/ogc/norstoy_1_0/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=Stoyvarselkart&sld_version=1.1.0&format=image/png&bbox=253513.21,6649009.25,253626.7,6649225.2&crs=EPSG:25833&legend_options=countMatched:true;fontAntiAliasing:true;hideEmptyRules:true",
            "data": [
                {
                    "STØYSONEKATEGORI": "R",
                    "STØYKILDE": "V",
                    "STØYKILDENAVN": "ERF-veger",
                    "STØYMETODE": "Norstøy versjon 3.4, beregningsmetode Nord2000",
                    "BEREGNETÅR": "2040"
                }
            ],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "d6db9f39-9725-4630-909e-5e62f09a0766",
                "title": "Støykartlegging veg etter T-1442",
                "description": "Denne tjenesten inneholder Støyvarselkart etter T-1442. Støyvarselkartene er utarbeidet etter Retningslinje for behandling av støy i arealplanlegging (T-1442). Støyvarselkartene viser beregnet rød (Lden>65dB) og gul (Lden>55dB) støysone langs riks- og fylkesveg. Støyvarselkartene fra Statens vegvesen viser en prognosesituasjon 15–20 år fram i tid. Det vil si at trafikkvolum (ÅDT), som er en av de viktigste parameterne i støyberegningsmodellen, er fremskrevet (basert på prognoser) til oppgitt beregningsår. Beregningshøyden er 4 meter. Kartleggingene er gjennomført med Statens vegvesens beregningsverktøy NorStøy. Beregningsmetode er Nord2000Road. Data om vegene og trafikken hentes fra Nasjonal vegdatabank (NVDB). De viktigste parameterne er ÅDT, tungtrafikkandel og hastighet. Kartdata hentes fra felles kartdatabasen (FKB). Informasjon om bygninger hentes fra matrikkelen.",
                "owner": "Statens vegvesen",
                "updated": "2025-10-23T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d6db9f39-9725-4630-909e-5e62f09a0766"
            },
            "description": "Støy rammer svært mange mennesker i Norge i dag, og er et alvorlig folkehelseproblem. Støy kan føre til søvnforstyrrelser og en rekke støyplager som for eksempel muskelspenninger og muskelsmerter, og er en medvirkende årsak til hjerte- og karsykdom.\n\nStøyretningslinje T-1442 anbefaler grenseverdier for støyfølsom bebyggelse. Bakgrunnen for støygrensene er forskning på støy og helse. Grenseverdiene for utendørs lydnivå er satt på bakgrunn av kunnskapen vi har om hvor mye støy folk tåler å bli utsatt for uten at de føler seg plaget av støyen. T-1442 anbefaler at ny bebyggelse etableres på en slik måte at alle boliger får en stille side av bebyggelse, og tilfredsstillende støynivå på utearealer og innendørs.",
            "guidanceText": "Planområdet ligger innenfor rød støysone. Det er i utgangspunktet ikke anbefalt å etablere støyfølsom bebyggelse i rød støysone. Unntaket er bebyggelse som ligger i knutepunkter og sentrumsområder og bidrar til fortetting. I rød støysone er det vanskelig å sikre tilfredsstillende støyforhold for ny bebyggelse.\n\nEtablering av støyfølsom bebyggelse i øvre del av gul støysone og i rød støysone er også innsigelsesgrunnlag, jf. rundskriv T-2/16 om nasjonale eller vesentlige regionale interesser på miljøområdet.",
            "guidanceUri": [
                {
                    "href": "https://www.miljodirektoratet.no/ansvarsomrader/forurensning/stoy/for-myndigheter/veileder-om-behandling-av-stoy-i-arealplanlegging/",
                    "title": "Veileder om behandling av støy i arealplanlegging"
                },
                {
                    "href": "https://www.regjeringen.no/no/dokumenter/miljoforvaltningens-innsigelsespraksis/id2504971/",
                    "title": "Nasjonale og vesentlige regionale interesser på miljøområdet"
                }
            ],
            "possibleActions": [
                "Legg bebyggelsen utenfor støysonen der dette er mulig. Der det ikke er mulig, kan det settes opp støyvoller eller støyskjermer for å redusere støynivået i området. Bebyggelsen kan brukes som skjerm og sikre tilfredsstillende støyforhold på én side av bebyggelsen og uteområdene. Dersom denne løsningen brukes, bør alle boliger/leiligheter være gjennomgående, slik at de har tilgang til den stille siden."
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
                    "value": 3,
                    "comment": "Egnet"
                }
            ],
            "qualityWarning": []
        },
        {
            "title": null,
            "runOnInputGeometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            253604.27,
                            6649088.55
                        ],
                        [
                            253595.58,
                            6649107.92
                        ],
                        [
                            253586.48,
                            6649128.21
                        ],
                        [
                            253576.21,
                            6649151.44
                        ],
                        [
                            253570.79,
                            6649169.65
                        ],
                        [
                            253568.23,
                            6649176.54
                        ],
                        [
                            253549.54,
                            6649225.2
                        ],
                        [
                            253513.21,
                            6649208.66
                        ],
                        [
                            253549.09,
                            6649115.7
                        ],
                        [
                            253513.68,
                            6649090.96
                        ],
                        [
                            253528.24,
                            6649069.39
                        ],
                        [
                            253543.04,
                            6649047.45
                        ],
                        [
                            253559.81,
                            6649058.19
                        ],
                        [
                            253570.94,
                            6649061.71
                        ],
                        [
                            253579.21,
                            6649056.08
                        ],
                        [
                            253601.8,
                            6649022.94
                        ],
                        [
                            253603.08,
                            6649021.06
                        ],
                        [
                            253593.9,
                            6649009.25
                        ],
                        [
                            253626.7,
                            6649029.3
                        ],
                        [
                            253610.04,
                            6649025.2
                        ],
                        [
                            253594.88,
                            6649049.29
                        ],
                        [
                            253579.83,
                            6649073.12
                        ],
                        [
                            253604.27,
                            6649088.55
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
                "intersects layer 2 (True)",
                "calculate hit area",
                "deliver result"
            ],
            "inputGeometryArea": 8630.86,
            "hitArea": 16785.95,
            "resultStatus": "HIT-RED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": "https://kart.miljodirektoratet.no/arcgis/services/artnasjonal2/MapServer/WMSServer?layers=Alle_arter_av_sarlig_stor_forv_int_omr,Alle_arter_av_sarlig_stor_forv_int_pkt"
            },
            "cartography": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAkCAYAAACE7WrnAAAAs0lEQVR4nO3UQQ4DIQgF0E/jZeVAeNw/i27aCuJYm7goyawmPDGAQpLYEAUARGQp+bWGx45qOsjMQDL8zAxmlkO11vDE1tp8RTNIdFgKzSApNIsMoTtICN1FXGgF6aBVxK0oQ6J5EpI8atfKp7wav9n+P+RGiX54szXqrguJiPukikiIdVeLEOD5pkdb8AaNkAw7r2uHQyShqsMEVXVHoKtohEUIEAwkyT2TnSV5cXjXvokLFw9vOP7y8MgAAAAASUVORK5CYII=",
            "data": [
                {
                    "AntallObservasjoner": 1,
                    "Gruppe": "fugl",
                    "NorskNavn": "fiskeørn",
                    "Status": "VU",
                    "Faktaark": "https://faktaark.naturbase.no/artnasjonal?id=10.629852_59.950867_3918"
                },
                {
                    "AntallObservasjoner": 1,
                    "Gruppe": "karplanter",
                    "NorskNavn": "aksveronika",
                    "Status": "VU",
                    "Faktaark": "https://faktaark.naturbase.no/artnasjonal?id=10.587454_59.905336_102575"
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
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
            "title": null,
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "forurensning"
            ],
            "runOnDataset": {
                "datasetId": "1489f7f8-40c8-4dc4-83b6-bcf277b56506",
                "title": "Støysoner Avinors lufthavner",
                "description": "Datasettet gir opplysninger om støy i innflyvningssoner og støy ved bakken i tilknytning til flyplasser. Støysoner er behandlet iht. T-1442 Retningslinjer for behandling av støy i arealplanlegging, Miljøverndepartementet",
                "owner": "Avinor",
                "updated": "2025-01-17T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/1489f7f8-40c8-4dc4-83b6-bcf277b56506"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-RELEVANT",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "b12d041d-03d4-4562-b333-bc9d7c9bd123",
                "title": "Nasjonale laksefjorder",
                "description": "Datasettet viser nasjonale laksefjorder opprettet etter vedtak i stortinget 25. februar 2003 og 15. mai 2007. Nasjonale laksefjorder skal gi et utvalg av de viktigste laksebestandene i Norge en særlig beskyttelse mot inngrep og aktiviteter i vassdragene og mot oppdrettsvirksomhet i de nærliggende fjord- og kystområdene.",
                "owner": "Fiskeridirektoratet",
                "updated": "2026-02-23T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b12d041d-03d4-4562-b333-bc9d7c9bd123"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [
                "set input_geometry",
                "check coverage dekningskart_nve_flomsoner.gpkg"
            ],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "ERROR",
            "distanceToObject": 0,
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
                "datasetId": "e95008fc-0945-4d66-8bc9-e50ab3f50401",
                "title": "Flomsoner",
                "description": "Flomsoner viser arealer som oversvømmes ved ulike flomstørrelser (gjentaksintervall).  Det blir utarbeidet flomsoner for 20-, 200- og 1000-årsflommene. I områder der klimaendringene gir en forventet økning i vannføringen på mer enn 20 %, utarbeides det flomsone for 200-årsflommen i år 2100.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e95008fc-0945-4d66-8bc9-e50ab3f50401"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "07e6b8af-84a7-43cb-9d91-887885a7342f",
                "title": "Snøscooterløyper",
                "description": "Datasettet viser snøscooterløyper som er fastsatt av kommunen etter § 4a i forskrift for bruk av motorkjøretøyer i utmark og på islagte vassdrag. Datasettet viser selve traseen og kan inneholde ytterligere  informasjon om rutenavn, hjemmel for godkjenning, rutenummer, hvordan løypen er merket, tidsperioder for lovlig kjøring, steder for lovlig rasting, fartsgrenser mv.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/07e6b8af-84a7-43cb-9d91-887885a7342f"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "6bfec384-92cf-44d3-863b-0187afa06658",
                "title": "Reindrift - Reinbeitedistrikt",
                "description": "Datasettet reinbeitedistrikt viser administrativ og geografisk inndeling av reinbeitedistrikter i det samiske reinbeiteområdet. \n\nRetten til å utøve reindrift innenfor disse områdene er eksklusiv for den samiske befolkningen. Denne samiske særretten gjelder ikke utenfor disse områdene, hvor det kreves særskilt tillatelse for å utøve reindrift på egne og leide arealer.\n\nEt reinbeitedistrikt utgjør en administrativ enhet for en eller flere siidaer. Statsforvalteren er forvaltningsmyndighet for reinbeitedistriktene.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/6bfec384-92cf-44d3-863b-0187afa06658"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "a26e57bc-15bd-46db-8504-6c6ed1e7c501",
                "title": "Grus og pukk",
                "description": "Grus- og Pukkdatabasen ved NGU inneholder opplysninger om de aller fleste grus- og pukkforekomster og uttakssteder i Norge for utnyttelse som råstoff for bygge- og anleggsvirksomhet. Databasen gir også informasjon om arealbruk, volum, kvalitet og hvor viktige ressursene er som råstoff til byggetekniske formål.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2026-03-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a26e57bc-15bd-46db-8504-6c6ed1e7c501"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "d6a20e09-fa68-4d57-ab43-c22e755ff60a",
                "title": "Ankringsområder",
                "description": "Ankringsområde inneholder tre objekttyper og tilhørende informasjon særlig rettet mot kystsoneforvaltning og kystsoneplanlegging. Annen informasjon for de aktuelle områdene til støtte for operativ bruk av områdene er ikke inkludert her. \nFor «featureType» Ankringsområde for sjøtransport, vil disse også finnes igjen med ulik symbolisering og informasjonsinnhold i sjøkartene og Den norske los. Denne «nautiske» informasjonen må hentes i de produktene, og er ikke del av dette produktet.\n\nFor «featureType» Opplagsområde for sjøtransport, og Riggområde i sjø er det også informasjon med hensyn til kystsoneforvaltning og planlegging som er inkludert.\n\nDatasett holdes løpende ajour av Kystverket i samarbeid med andre maritime aktører og andre berørte.",
                "owner": "Kystverket",
                "updated": "2026-02-15T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d6a20e09-fa68-4d57-ab43-c22e755ff60a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Forurensning"
            ],
            "runOnDataset": {
                "datasetId": "21d93ab2-868f-4ef9-986b-bf362746f4bd",
                "title": "Støysoner for Forsvarets skyte- og øvingsfelt",
                "description": "Datasettet inneholder støysoner for Forsvarets skyte- og øvingsfelt. Hovedsakelig er disse beregnet etter retningslinje for behandling av støy i arealplanlegging, T-1442. Der det er aktuelt inkluderes også relevant støy fra aktiviteter som ikke er omtalt av retningslinjen, som tunge våpen, sprengninger og øving i felt (uten veldefinert standplass og skyteretning). Støysonene er ment som et hjelpemiddel i forbindelse med kommunens plan- og byggesaksarbeid. Rød sone angir områder som er sterkt berørte av støy, og er i utgangspunktet ikke egnet for støyfølsom bebyggelse. Gul sone er en vurderingssone, hvor det må planlegges godt for å oppnå tilfredsstillende støyforhold. Nye støyberegninger skal vurderes hvert 5. år eller dersom det skjer forandringer i skytefeltet/skytebanen som påvirker støybildet.",
                "owner": "Forsvarsbygg",
                "updated": "2025-12-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/21d93ab2-868f-4ef9-986b-bf362746f4bd"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "1e8d7811-87ea-429a-8d97-4ea6bbf6e010",
                "title": "Hovedled og Biled, arealavgrensning",
                "description": "Farleden er gitt gjennom Forskrift om farleder (farledsforskriften).\n\nHele norskekysten er i dag dekket av et standardisert referansesystem av ulike farledskategorier. Farledsstrukturen omfatter nettverket av sjøverts transportårer og er et nasjonalt geografisk referansesystem for tiltak innen forvaltning, planlegging, utbygging og operativ virksomhet i kystsonen.\nMer om farledsstrukturen: http://www.kystverket.no/Maritim-infrastruktur/Farleder/Farledsstrukturen/\nDatasettet viser hoved- og biledenes arealmessige utstrekning.",
                "owner": "Kystverket",
                "updated": "2026-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/1e8d7811-87ea-429a-8d97-4ea6bbf6e010"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "d02dc4bd-77d5-4b3b-a316-5a488b6fe811",
                "title": "Reindrift - Reinbeiteområde",
                "description": "Datasettet avgrenser de seks reinbeiteområdene som til sammen utgjør det samiske reinbeiteområdet. Retten til å utøve reindrift innenfor disse områdene er eksklusiv for den samiske befolkning. Denne samiske særretten gjelder ikke utenfor disse områdene, hvor det kreves særskilt tillatelse for å utøve reindrift på egne og leide arealer. Et reinbeiteområde utgjør en administrativ enhet for flere reinbeitedistrikt. Statsforvalteren er forvaltningsmyndighet i reinbeiteområdene.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d02dc4bd-77d5-4b3b-a316-5a488b6fe811"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "c5f09d79-1546-495c-8b36-91efd4008bd7",
                "title": "Kart over grå arealer -Versjon 1",
                "description": "Kart over grå arealet -Versjon 1 er utviklet i samarbeidet mellom Miljødirektoratet, Kartverket, NIBIO og SSB.\n\nKartet er landsdekkende og viser grå arealer i henhold til Kommunal- og distriktsdepartementet sin definisjon;\n«Arealer som allerede er tatt i bruk eller sterkt påvirket av menneskelig bygge- og anleggsaktivitet, inkludert bebyggelse, konstruksjoner, permanente overflater og tilhørende arealer.»\n\nRapport kan leses her\nhttps://dokument.geonorge.no/nasjonale-standarder-og-veiledere/dokumentasjon-og-metode/kart-over-gr%C3%A5-arealer-sluttrapport/1/kart-over-gr%C3%A5-arealer-sluttrapport.pdf\n\nOversikt over arealklasser som er med i kartet kan leses her\nhttps://dokument.geonorge.no/nasjonale-standarder-og-veiledere/dokumentasjon-og-metode/kart-over-gr%C3%A5-arealer-utvalg-fra-grunnkartet/1/kart-over-gr%C3%A5-arealer-utvalg-fra-grunnkartet.pdf",
                "owner": "Miljødirektoratet",
                "updated": "2025-12-15T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c5f09d79-1546-495c-8b36-91efd4008bd7"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "fc28749e-633d-4dcc-b4c3-c073720a0982",
                "title": "Ramsarområder",
                "description": "Datasettet viser norske naturvernområder med status som ramsarområder, under den internasjonale våtmarkskonvensjonen (Ramsarkonvensjonen). Alle norske ramsarområder er vernet som naturvernområder (eget datasett). Noen ganger omfatter ramsarstatusen kun deler av det aktuelle naturvernområdet. Et ramsarområde kan også omfatte areal i flere ulike naturvernområder. \n\nI dette datasettet defineres entydig hvilke areal som omfattes av Ramsarkonvensjonen i Norge. I tillegg inneholder det en områdebeskrivelse på norsk, som forklarer om historikk og begrunnelse for at områdene har fått en så viktig internasjonal status.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fc28749e-633d-4dcc-b4c3-c073720a0982"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "94b8c392-e2c8-426a-8dbe-ae828049a1df",
                "title": "Navigasjonsinstallasjon",
                "description": "Kystverket administrerer et system av innretninger for navigasjonsveiledning i Norge. Dette systemet består av innretninger drevet av Kystverket, innretninger drevet av kommunale havner og private innretninger drevet av andre. Innretninger for navigasjonsveiledning gir visuelle og elektroniske signaler som er lagt til rette for å være til hjelp i navigasjonsprosessen for aktsomme sjøfarende. Det er imidlertid ikke hensikten å gjøre det mulig for sjøfarende å identifisere enhver båe eller grunne eller hindring for sjøtrafikken som finnes i norske farvann som ellers er farbare for skip. Derimot skal Kystverket sørge for en fornuftig merking av farvannet i den utstrekning som ressursene tillater.",
                "owner": "Kystverket",
                "updated": "2020-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/94b8c392-e2c8-426a-8dbe-ae828049a1df"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Befolkning"
            ],
            "runOnDataset": {
                "datasetId": "0cebdeba-5cd2-4642-a485-6d7b09159337",
                "title": "Tettsteder 2025",
                "description": "Datasettet viser Tettsteder pr. 01.01.2025. Tettsteder er geografiske områder som har en dynamisk avgrensing, og antall tettsteder og deres yttergrenser vil endre seg over tid avhengig av byggeaktivitet og befolkningsutvikling. Et tettsted er en hussamling med minst 200 bosatte og der avstanden mellom husene normalt ikke skal overstige 50 meter. Les mer om tettsted, fullstendig definisjon og tilhørende statistikk på produktsiden her: https://www.ssb.no/befolkning/folketall/statistikk/tettsteders-befolkning-og-areal.\nDataene tilgjengelig for innsyn og nedlasting fra Geonorge og fra SSBs kartportal Kart.ssb.no",
                "owner": "Statistisk sentralbyrå",
                "updated": "2025-11-13T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/0cebdeba-5cd2-4642-a485-6d7b09159337"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "641a81c2-9354-473b-b8f0-2b1e2ab3930a",
                "title": "Mulighet for marin leire",
                "description": "Datasettet 'Mulighet for marin leire' (MML) er basert på løsmassekart og datasett for marin grense (MG), og viser hvor det potensielt kan finnes marin leire - enten oppe i dagen eller under andre løsmassetyper.\n\nMML leveres kun for områder der løsmasser er kartlagt i målestokk 1:50 000 eller mer detaljert. Det er ikke dekning for MML der løsmasser er kartlagt i grovere målestokk, men marine avsetninger kan likevel forekomme for arealer under marin grense og disse arealene er angitt med rosa farge. MML for nye kvartærgeologiske detaljkart i skala 1:10.000 er ennå ikke inkludert i tjenesten eller nedlasting.\n\nI datasettet MML er de kartlagte løsmassetypene under MG klassifisert etter muligheten for å finne marin leire. MML inndeles i svært stor, stor, middels, svært stor men usammenhengende/tynt, liten, stort sett fraværende eller ikke angitt. De ulike klasser er vist i ulike blåtoner/hvit. Blå skravur gis løsmassetyper der lokale/tynne forekomster av marin leire kan forventes. Områdene over MG vises med tynn svart skravur, og disse kan det generelt ses bort fra mht forekomst av marin leire.\n\nMML-klassifikasjon gjelder ikke for vanndekte områder under MG. Men marin leire er også vanlig under dagens havnivå både i form av gamle avsetninger og nye, løst lagrede sedimenter som begge kan være en utfordring med hensyn til stabilitet. Selv om løsmasser ikke er kartlagt under vann så er løsmassepolygoner av tekniske årsaker trukket over strandlinjen og ut i sjøen. Dette gjenspeiles i MML-polygonene, og det oppfordres derfor til å legge vannpolygoner over MML. Arealer for mulig marin leire bør alltid sees sammen med arealer for marin grense. Les mer om MG og MML inklusive bruk og usikkerheter på ngu.no under fagområder/kvartærgeologi/marin grense. \nLes mer om MML samt kartapplikasjon inklusive bruk og usikkerheter ved å trykke på lenken 'Vis produktside' øverst.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2024-07-10T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/641a81c2-9354-473b-b8f0-2b1e2ab3930a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "166382b4-82d6-4ea9-a68e-6fd0c87bf788",
                "title": "FKB-AR5",
                "description": "FKB-AR5, som står for \"Felles Kartdatabase - Arealressurs 5\", representerer en omfattende kartlegging og beskrivelse av Norges arealressurser på et svært detaljert nivå. Dette datasettet er designet for å gi en grundig og presis oversikt over landets arealbruk, naturressurser, og topografiske forhold, og er et kritisk verktøy for planleggere, forskere, og beslutningstakere som arbeider med landforvaltning, miljøovervåking, og utviklingsplanlegging.\n\nAR5-datasettet er flatedekkende, noe som betyr at det gir en sammenhengende oversikt over hele Norges landareal, inkludert både urbane og rurale områder. Det skiller seg ut ved sin høye oppløsning og detaljnivå, som muliggjør analyse og kartframstillinger av høy kvalitet. Denne detaljerte innsikten er spesielt verdifull for å forstå og håndtere komplekse arealbruksutfordringer, som balansen mellom bevaring og utvikling, landbruk, skogbruk, og byutvikling.\n\nEn av de viktigste funksjonene til AR5 er dens rolle i ajourhold og oppdatering av Norges arealressursinformasjon. Ved å tilby en detaljert og nøyaktig base, gjør AR5 det mulig for ulike aktører å hollegge, oppdatere, og dele relevant informasjon om arealbruksendringer, miljøtilstand, og ressursforvaltning. Dette sikrer at beslutningstaking kan baseres på oppdatert og nøyaktig informasjon, noe som er avgjørende for effektiv forvaltning og bærekraftig utvikling.\n\nVidere er AR5 designet for å være fleksibelt og tilgjengelig for en bred brukergruppe, inkludert offentlige etater, private selskaper, forskningsinstitusjoner, og den generelle offentligheten. Dette gjør datasettet til et verdifullt verktøy for en rekke analyseformål, fra miljøovervåking og risikostyring til urban planlegging og landskapsanalyser.\n\nSamlet sett representerer FKB-AR5 et fundamentalt verktøy for å forstå, forvalte, og utvikle Norges arealressurser på en bærekraftig måte. Dets detaljerte innsikt og omfattende dekning gjør det mulig for brukere å utføre avanserte analyser og skape informative kartframstillinger som understøtter informerte beslutninger og effektiv ressursforvaltning.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/166382b4-82d6-4ea9-a68e-6fd0c87bf788"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "fabfe189-06b5-4a3f-84ba-3c48b02ce6de",
                "title": "Fiskerihavner",
                "description": "Fiskerihavner.",
                "owner": "Kystverket",
                "updated": "2020-11-17T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fabfe189-06b5-4a3f-84ba-3c48b02ce6de"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "4d0bd656-640b-4592-be35-e7435aa313dc",
                "title": "Tare - høstefelt",
                "description": "Arealavgrensete felt hvor det innenfor angitte tidsrom kan høstes tare med trål. \nInnenfor feltene er det stengte områder hvor det er forbudt å høste tare. \nOgså innenfor feltene er det referanseområder hvor det er ikke tillatt å høste tare uten særskilt tillatelse fra Fiskeridirektoratet.\nHoved forskrift finnes på www.fiskeridir.no og https://lovdata.no/dokument/SF/forskrift/1995-07-13-642\n\nHøstefeltene er spesifiserte i tre forskrift: \nRogaland og Vestland;\nMøre og Romsdal og Trøndelag;\nNordland sør av Vegaøyan verdensarvområde\n\nFeltgrenser følger langs hele bredde- og lengdeminutter, med bredde på 1 nautisk mil for hvert høstefelt i Rogaland, Vestland, Møre og Romsdal og Trøndelag. I Nordland har høstefelt 1/2 nautisk mil der grensen mellom feltene følger hvert 1/2 breddeminutt. Se forskrift for mer informasjon om hvilke felt som er åpne.",
                "owner": "Fiskeridirektoratet",
                "updated": "2026-02-11T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/4d0bd656-640b-4592-be35-e7435aa313dc"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "595e47d9-d201-479c-a77d-cbc1f573a76b",
                "title": "FKB-Vann",
                "description": "FKB-Vann beskriver geografisk beliggenhet, forløp og form for bekker, elver, kanaler, grøfter, innsjøer, isbreer og den topografiske delen av kyst og sjø. Primærdata kystkontur er identisk med kystkonturen i FKB-Vann",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/595e47d9-d201-479c-a77d-cbc1f573a76b"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "6e05aefb-f90e-4c7d-9fb9-299574d0bbf6",
                "title": "FKB-Ledning",
                "description": "FKB-Ledning er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Ledning omfatter ledningsdata innenfor elektrisitet, elektrisk kommunikasjon, belysningsanlegg, ledningsanlegg tilknyttet bane og VA. Det er kun objekter som er synlig i terrenget (ligger på eller over bakkenivå) som inngår i produktspesifikasjonen. Produktspesifikasjonen er tenkt benyttet ved datafangst av ledningsobjekter og som et grunnlag for distribusjon av FKB-data.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/6e05aefb-f90e-4c7d-9fb9-299574d0bbf6"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "fa02a652-cd6d-4828-9fb5-7bd4515aa6d0",
                "title": "Reindrift - Årstidsbeite - Vårbeite",
                "description": "Vårbeite er ett av fem datasett som til sammen beskriver reindriftens årstidsbeiter. Det skilles mellom to typer vårbeite: kalvingsland og oksebeiteland. \n\nKalvingsland er de deler av vårområdet som beites tidligst og hvor hoveddelen av simleflokken oppholder seg før kalving, under kalving og i pregningsperioden. Pregningsperioden er tiden etter kalving og frem til simler med kalv samler seg i større flokker, såkalte fostringsflokker. Oksebeiteland er områder hvor okserein, fjorårskalver og simler som ikke skal kalve oppholder seg i kalvingstida. \n\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Et reindriftsår er inndelt i fem ulike årstider med tilhørende årstidsbeiter. Årlige variasjonene i blant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fa02a652-cd6d-4828-9fb5-7bd4515aa6d0"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "d776ff93-104d-4aa5-a8d9-276df01eb51c",
                "title": "Naturtyper på land og i ferskvann (HB13)",
                "description": "Datasettet er tidligere publisert under navnet \"Naturtyper - DN-håndbok 13\". Datasettet viser naturtypelokaliteter på land og i ferskvann, kartlagt etter DN-håndbok 13. Den enkelte lokalitet er registrert med en naturtype, som kan være registrert mer detaljert i form av utforminger. Hver naturtype er beskrevet i DN-håndbok 13, med utgangspunkt i gjeldende beskrivelse av den eller de truede vegetasjonstypene som vanligvis vil inngå. Rødlistede naturtyper fra 2011 er lagt inn som naturtype eller utforming med samme betegnelse som er brukt i rødlista. Hver registrert lokalitet er gitt en naturfaglig verdi, basert på tilstand og naturmangfold. Lokalitetene har en mer eller mindre omfattende områdebeskrivelse. Presisjon i avgrensing er varierende, noe som også følger av at krav til presisjon har endret seg i årenes løp. Generelt vil nyere data være mer presist avgrenset enn eldre data, men datasettet inneholder også eldre data med god presisjon.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d776ff93-104d-4aa5-a8d9-276df01eb51c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "fc59e9a4-59df-4eb3-978a-1c173b84bf4e",
                "title": "Villreinområder",
                "description": "Datasettet inneholder data fra nasjonale villreinområder. På Norges fastland finnes 24 villreinområder, hvorav 10 er utpekt som nasjonale villreinområder. Disse er Forollhogna, Hardangervidda, Knutshø, Nordfjella, Reinheimen-Breheimen, Rondane, Setesdal-Austhei, Setesdal-Ryfylke, Snøhetta og Sølnkletten. \n\nDatasettet viser yttergrenser for villreinbestandenes biologiske leveområde. I tillegg vises funksjonsområder der dette er kartlagt. Funksjonsområdene i datasettet er trekkområde, beiteområde og kalvingsområde. Den største polygonen for hvert villreinområde viser yttergrensen for leveområdet. De mindre polygonene innenfor leveområdet er funksjonsområder. \n\nMerk at begrepet \"nasjonalt villreinområde\" også brukes om soneavgrensninger i regionale planer for de 10 nasjonale villreinområdene. Disse soneavgrensningene er ikke del av dette datasettet, og de sammenfaller ikke nødvendigvis med de biologiske leveområdene.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fc59e9a4-59df-4eb3-978a-1c173b84bf4e"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "updated": "2026-02-15T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/30e1883e-70e9-4510-9e97-00edbdcddc02"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "93f06149-037c-48cf-b294-d166f65b6838",
                "title": "Kulturminner - SEFRAK-bygninger",
                "description": "SEFRAK er et landsdekkende register over eldre bygninger og andre kulturminner i Norge. Navnet er en forkortelse for SEkretariatet For Registrering Av faste Kulturminner, som var navnet på den institusjonen som påbegynte arbeidet med registeret. I dag ligger ansvaret for registering og vedlikehold av data hos Riksantikvaren. Alle bygninger fra før år 1900 ble registrert, foruten ruiner og en del andre kulturminner. I Finnmark ble grensa for innføring i registeret satt til året 1945. Det at et hus er registrert i SEFRAK gir det ikke automatisk vernestatus, og legger heller ikke spesifikke restriksjoner på hva som kan gjøres med det. SEFRAK-registeret sier ikke noe om objektenes verneverdi.",
                "owner": "Riksantikvaren",
                "updated": "2026-03-04T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/93f06149-037c-48cf-b294-d166f65b6838"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "67a3a191-49cc-45bc-baf0-eaaf7c513549",
                "title": "Dybdedata - terrengmodeller 50 meters grid",
                "description": "Datasettet viser terrengvariasjoner på havbunnen. Terrengmodellene har blitt produsert av innsamlede sjømålingsdata av høy kvalitet. Dekningsområdet kystnært inkluderer store deler av Hordaland og ellers utvalgte områder i Sogn og Fjordane, Møre og Romsdal og Trøndelag. De nordligste fylkene har den beste dekningen med relativt heldekkende dekning nord for 67 grader. For havområdene er dekningen i stor grad avhengig av kartleggingen i forbindelse med MAREANO programmet. MAREANO har kartlagt havområdene utenfor Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Barentshavet øst og ellers utvalgte områder ved Svalbard. Dekningsområdet utvides kontinuerlig etterhvert som nye områder blir kartlagt. Oppløsning på terrengmodellene er 50m x 50m. Terrengmodellene tilbys i UTM sone 33 og geografisk WGS84. Det innebærer at enkelte kartdata ikke ligger i den UTM-sonen som dekker det aktuelle området.",
                "owner": "Kartverket",
                "updated": "2026-02-26T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/67a3a191-49cc-45bc-baf0-eaaf7c513549"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "277bda73-b924-4a0e-b299-ea5441de2d3b",
                "title": "Inngrepsfri natur i Norge",
                "description": "Datasettet viser hvilke områder på Norges fastland  (inkl. ferskvann og øyer) som ikke er berørt av større naturinngrep per januar 1988, 2008, 2013, 2018 og 2023. Inngrepsfri natur er områder som ligger en kilometer eller mer i luftlinje unna større inngrep, så som veier, større kraftlinjer, jernbane, steinbrudd, vind- og vannkraftutbygging m.fl. Dataene som danner grunnlaget for kartene er hentet fra en rekke nasjonale registre, bl.a. fra NVE, Statnett og Statens kartverk. Datasettet viser også hvilke områder som har fått endret status som følge av nye inngrep eller restaureringstiltak i perioden 1988-2008, 2008-2013, 2013-2018, 2018-2023 og 1988-2023. \n\nUtvikling i areal av inngrepsfrie naturområder er en av åtte indikatorer under nasjonalt miljømål 1.1 Naturmangfold: \"Økosystemene skal ha god tilstand og levere økosystemtjenester. Inngrepsfri natur er også en etablert arealbruksindikator, som er med på å vise status og utviklingstrekk for store sammenhengende naturområder med et urørt preg i Norge.",
                "owner": "Miljødirektoratet",
                "updated": "2023-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/277bda73-b924-4a0e-b299-ea5441de2d3b"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "86a6a0d7-62e3-4967-9db8-40d903d72afe",
                "title": "Naturtyper - Elvedelta",
                "description": "Datasettet omfatter de fleste elvedelta større enn 250 daa i Norge. Svalbard er ikke inkludert. Utgangspunktet er Elvedeltabasen, som ble etablert av Direktoratet for naturforvaltning i 1999, og som har vært publisert på nettstedet elvedelta.no. Etablering som geografisk datasett erstatter denne publiseringen.\n\nBakgrunnen for datasettet er at elvedelta er en naturtype som kan ha store biologiske verdier, samtidig som naturtypen er svært utsatt for naturinngrep og påvirkninger i form av forurensning, kraftutbygging, utfylling o.l.\n\nI forbindelse med etablering av Elvedeltabasen ble det i samarbeid med NVE og NGU utviklet metodikk/kriterier for avgrensing av deltaområdet, inndeling i deltatyper og vurdering av grad av menneskelig påvirkning. Dokumenter som beskriver metodikk/kriterier er tilgjengelig under dokumentasjonen av datasettet i Miljødirektoratets kartkatalog.",
                "owner": "Miljødirektoratet",
                "updated": "2023-09-29T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/86a6a0d7-62e3-4967-9db8-40d903d72afe"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Landskap"
            ],
            "runOnDataset": {
                "datasetId": "77512fbd-cfc5-497a-8c41-ebaf5f736ded",
                "title": "Naturtyper i Norge - Landskap",
                "description": "NiN landskap er et system for beskrivelse av landskapsmessig variasjon som forholder seg til definisjonene i den europeiske landskapskonvensjonen og i naturmangfoldloven. NiN landskap er en del av Artsdatabanken sitt typesystem «Natur i Norge (NiN)».",
                "owner": "Artsdatabanken",
                "updated": "2025-11-27T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/77512fbd-cfc5-497a-8c41-ebaf5f736ded"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "d80faca7-2a0d-47de-b58b-5007a2afdc74",
                "title": "Barmarksløyper i Finnmark",
                "description": "Data knyttet til motorisert ferdsel i utmark. Data over vedtatte og dermed lovlig ruter for terrengkjøretøy sommerstid. Grunnlag for vedtak er lov om motorferdsel i utmark og håndteres av fylkesmannen, eventuelt andre vedtak i kommunen. Motorisert ferdsel i utmark. Gjelder spesifiserte ruter for terrengkjøretøy sommerstid.",
                "owner": "Statsforvalteren",
                "updated": "2020-08-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d80faca7-2a0d-47de-b58b-5007a2afdc74"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "dfd900d8-bc16-4f7a-a08a-3f0081284259",
                "title": "Reindrift - Samebyavtale",
                "description": "Samebyavtale viser grenser for svenske reineieres (samebyers) beiteområder i Norge, i henhold til private avtaler mellom svenske samebyer og norske reinbeitedistrikter. Samebyer i Sverige er økonomiske og administrative enheter med eget styre, i likhet med reinbeitedistrikter i Norge.  \n\nDatasettet anbefales brukt sammen med to andre datasett som viser svenske reineieres rettigheter i Norge, “Reindrift - Konvensjonsområde” og “Reindrift - Samebyrettsavgjørelse”.\n\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Årlige variasjoner i blant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dfd900d8-bc16-4f7a-a08a-3f0081284259"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "edddd150-1cec-4edb-90fd-06806c1f585d",
                "title": "Lufthavn - Restriksjonsplaner for Avinors lufthavner",
                "description": "Restriksjonsplanen produseres for å vise de begrensninger og rådighetsinnskrenkninger som er nødvendig for å sikre hinderfritt luftrom for flytrafikken for Avinors lufthavner.\nFlater har høydeverdi og kan brukes til 3D-modellering.",
                "owner": "Avinor",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/edddd150-1cec-4edb-90fd-06806c1f585d"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "b187c449-04ac-42fe-9eab-83d81bf338bc",
                "title": "N20 Bygning",
                "description": "N20 Bygning inneholder alle bygninger med bygningsomriss tilpasset målestokk 1:20000",
                "owner": "Geovekst",
                "updated": "2026-03-03T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b187c449-04ac-42fe-9eab-83d81bf338bc"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "e0db7ab9-c1fc-4a52-b381-1e5273204ef9",
                "title": "Lufthavn - Byggerestriksjoner (BRA)",
                "description": "BRA står for Building Restriction Areas, og beskriver et eller flere områder rundt flyplasser og enkeltstående NAV-anlegg der bygg og konstruksjoner kan forårsake forstyrrelser på signalene mellom fly og bakke, og som vil kunne medføre nærmere bestemte restriksjoner.",
                "owner": "Avinor",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e0db7ab9-c1fc-4a52-b381-1e5273204ef9"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "a4bfd879-120f-490e-9907-68ba870664b1",
                "title": "Kulturminner - Freda bygninger",
                "description": "Bygninger og kirker som er automatisk, vedtaks-, forskrifts- eller midlertidig fredet etter lov og kirker som har status som listeførte.\n\nBygninger kan fredes etter ulike paragrafer i kulturminneloven: Bygninger som blir vedtatt fredet (kml § 15), statlige bygninger som blir vedtatt fredet i forskrift (kml § 22a), bygninger som er eldre enn 1537 er automatisk fredet (kml § 4), stående byggverk med opprinnelse fra perioden 1537-1649 kan bli erklært fredet (kml § 4), samiske bygninger eldre enn 100 år er automatisk fredet (kml § 4).",
                "owner": "Riksantikvaren",
                "updated": "2026-03-05T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a4bfd879-120f-490e-9907-68ba870664b1"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "5cb86063-3f66-4d7a-9799-0551e2e21a46",
                "title": "Reindrift - Konvensjonsområde",
                "description": "Datasettet viser administrative grenser for svenske reineieres (samebyers) beiteområder i Norge, fastsatt i forskrift om beiteområder for svensk rein i Norge, jf. grensereinbeiteloven. Samebyer i Sverige er økonomiske og administrative enheter med eget styre, i likhet med reinbeitedistrikter i Norge.\nKonvensjonsområde anbefales brukt sammen med to andre datasett som viser svenske reineieres rettigheter i Norge, “Reindrift - Samebyrettsavgjørelse” og “Reindrift - Samebyavtale”.\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Årlige variasjoner i blant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/5cb86063-3f66-4d7a-9799-0551e2e21a46"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "a29b905c-6aaa-4283-ae2c-d167624c08a8",
                "title": "Kvikkleire",
                "description": "Kartene gir en oversikt over soner med potensiell fare (aktsomhetsområder) for større kvikkleireskred. Sonene er identifisert og avgrenset ved kvartærgeologisk kartlegging (for å identifisere områder med marin leire), geoteknisk vurdering av topografi og grove, geotekniske undersøkelser.  Sonene omfatter løsneområder for kvikkleireskred (områder som kan gli ut) og utløpsområder (områder som kan rammes av skredmasser) for nye kartlegginger. For identifiserte soner som kun inneholder løsneområder, må utløpsområdene vurderes særskilt.\\\\nDe identifiserte kvikkleiresonene er klassifisert i tre faregradsklasser (høy-, middels- og lav faregrad), basert på topografiske, geotekniske og hydrologiske kriterier. Sonene er videre klassifisert i tre konsekvensklasser(høy-, middels- og lav konsekvensklasse) avhengig av konsekvenser som et skred i sonen vil ha på bebyggelse og infrastruktur. Sonene er deretter klassifisert i fem risikoklasser, utledet fra faregrads- og konsekvensklassifiseringen.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a29b905c-6aaa-4283-ae2c-d167624c08a8"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "3165138f-1461-44fe-8b10-eac44e08a10a",
                "title": "FKB-Bane",
                "description": "FKB-Bane er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Bane omfatter data om infrastruktur for skinnegående kjøretøy, bl.a. jernbane, tunnelbane, forstadsbane, sporveg og kabelbane. Datasettet er avgrenset til den delen av infrastrukturen som betegnes overbygning, dvs. spor og plattform.\n\nØvrige deler av infrastrukturen, i hovedsak underbygning (fylling, skjæring, bru, tunnel, støttemur mv), elkraftanlegg, signalanlegg og teleanlegg, omfattes av andre FKB-datasett, f.eks. FKB-Høydekurve, FKB-Bygning, FKB-BygnAnlegg og FKB-Ledning.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/3165138f-1461-44fe-8b10-eac44e08a10a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "87b31015-a3de-4540-9b8b-cb1bf4e1cb3a",
                "title": "FKB-Arealbruk",
                "description": "FKB-Arealbruk er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Arealbruk beskriver den fysiske bruken av et areal. Datasettet er ikke heldekkende.\n\nMarkslagsbeskrivelser kartlegges i datasettet FKB-AR5 (arealtilstand, bonitet, markslag og mineralske råstoffer). Arealplandata (kommuneplaner, reguleringsplaner osv.) viser juridiske bestemmelser om hvordan et område skal disponeres. FKB-Arealbruk er viser altså en tredje type kartlegging av et areal der det fokuseres på den fysiske bruken av et geografisk område uavhengig av jordas produksjonsevne eller hva området er planlagt/bestemt brukt til. Eksempel på dette kan være et utbyggingsområde som i FKB-Arealbruk vil kodes som et anleggsområde, uavhengig av om dette arealstykke egner seg som fulldyrka areal og hva området er regulert til i plandataene.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/87b31015-a3de-4540-9b8b-cb1bf4e1cb3a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "ea192681-d039-42ec-b1bc-f3ce04c189ac",
                "title": "N50 Kartdata",
                "description": "Kartdata tilpasset målestokkområdet 1:25 000 til 1:100 000. Produktet har et innhold som tilsvarer papirkartserien Norge 1:50 000 med unntak av bathymetri (dybder). Temaer som inngår i produktet er arealdekke (vann, markslag, etc.), administrative områder, bygninger og anlegg, høyde, restriksjonsområder, samferdsel og stedsnavn. N50 Kartdata dekker fastlands-Norge og er begrenset av riksgrensen mot nabolandene og territorialgrensen i havet. Produktet er kartografisk redigert med tanke på presentasjon i målestokk 1:50 000. N50 Kartdata ajourføres kontinuerlig og distribueres ukentlig.",
                "owner": "Kartverket",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/ea192681-d039-42ec-b1bc-f3ce04c189ac"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "5a887d78-07ef-44c6-8941-cb8017c6328c",
                "title": "Mineralressurser: industrimineral, naturstein og metaller",
                "description": "Dataene gir en oversikt over registrerte oppføringer av industrimineral, naturstein og metallressurser. \nMineralressursdataene inneholder både areal- og punktoppføringer for alle tre grupper. Datasettet gir en oversikt over dokumenterte forekomster (verdivurderte arealer; forekomst/deposit), prospektive områder (arealer med høy sannsynlighet for funn av økonomisk interessante mineraler; prospekt/prospect), registreringer hvor det er observert og/eller analysert forhøyede verdier av økonomisk interessante mineraler (registrering/occurence) og provinser (arealer med muligheter for funn av gitte mineraler; provins/province). Registreringene kan inneholde lite eller mye informasjon. \nDe dokumenterte forekomstene inneholder en vurdering av offentlig betydning; internasjonal, nasjonal, regional, lokal, liten eller ingen eller ikke vurdert.\nDataene er innsamlet over lang tid og oppdateres fortløpende etter prioriteringer.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/5a887d78-07ef-44c6-8941-cb8017c6328c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Befolkning"
            ],
            "runOnDataset": {
                "datasetId": "d8f245c0-a002-4d3b-b833-10c638c6a879",
                "title": "Befolkning på rutenett 250 m 2025",
                "description": "Bosatte på ruter 250 * 250 meter i 2025. Grunnlaget for dataene er folkeregistrert befolkning knyttet mot adressepunkter i Matrikkelen. Dette er summert til rutenett.",
                "owner": "Statistisk sentralbyrå",
                "updated": "2025-10-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d8f245c0-a002-4d3b-b833-10c638c6a879"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "c3da3591-cded-4584-a4b1-bc61b7d1f4f2",
                "title": "Jernbane - Banenettverk",
                "description": "Datasettet Banenettverk inneheld referanselinjer for jernbanestrekningar som er ein del av statens jernbaneinfrastruktur (samt museumsbanar) i Norge med geografisk stedfesta linjegeometri og noder i eit topologisk nettverk. Nettverket har verdiar i samsvar med Bane NOR sin modell for lineære referansar (kilometrering).",
                "owner": "Bane NOR SF",
                "updated": "2025-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c3da3591-cded-4584-a4b1-bc61b7d1f4f2"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "12fa3360-ce91-4f02-82c8-22ff85cf0c67",
                "title": "Anlegg med farlig stoff",
                "description": "Datasettet viser anlegg med farlig stoff, dvs. brannfarlig og giftig gass, stoff og væske. Dataene er etablert ved innmelding fra eierne av anleggene.  DSB har derfor liten kontroll med kvaliteten på stedfestingen. DSB gjør disse dataene tilgjengelig bare for utvalgte brukere innenfor Norge digitalt. Dette vil særlig være brukere innenfor arealplanlegging, byggesaksbehandling og beredskap. Disse får bare tilgang til data for eget distrikt ved direkte henvendelse til DSB ved kart@dsb.no. Brukeretatene må forplikte seg til å behandle dataene slik at de bare er tilgjengelig for brukere med reelt behov for informasjonen.  Dataene kan ikke legges på åpne kartapplikasjoner på internett.\n\nDSB har en online-løsning, FAST, som krever brukernavn og passord, og som gjøres tilgjengelig for de samme brukergruppene som vektordataene.  FAST består av en kartløsning med farlig stoff-dataene og en database med mer informasjon om anleggene. Se DSBs nettsider https://www.dsb.no/farlige-stoffer/farlige-stoffer/informasjon-og-verktoy/fast---anlegg-og-kart/",
                "owner": "Direktoratet for samfunnssikkerhet og beredskap",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/12fa3360-ce91-4f02-82c8-22ff85cf0c67"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Energi"
            ],
            "runOnDataset": {
                "datasetId": "7893680e-183b-4f22-9d43-876d51764675",
                "title": "Byggeforbudssoner kraftledninger",
                "description": "Datasettet Byggeforbudssoner kraftledninger inneholder byggeforbudssoner for Statnetts kraftledninger. Dette er arealer rundt kraftledninger som er klausulert i medhold av konsesjon etter energiloven og ekspropriasjon etter oreigningslova eller minnelig avtale med berørte grunneiere. Byggeforbudssonen legger restriksjoner på aktivitet i denne sonen. Det er ikke tillatt med ny bebyggelse innenfor byggeforbudssonen og alle tiltak i terrenget og anleggsarbeid innenfor byggeforbudssonen skal på forhånd avklares med ledningseier. Datasettet er et landsdekkende datasett for Statnett. \n\nStatnett ønsker i tillegg å informere om at det er en varslingsplikt til ledningseier for anleggsarbeid (maskiner og utstyr) som kan nå innenfor 30 meter fra ytterste strømførende ledning. Da skal ledningseier kontaktes for nødvendig avklaringer og tillatelse til anleggsarbeid innenfor denne varslingssonen.\n\nDatasettet har tidligere blitt kalt Hensynssoner kraftledninger.",
                "owner": "Statnett",
                "updated": "2025-03-07T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/7893680e-183b-4f22-9d43-876d51764675"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "13b707ad-a379-4bf0-a707-da237d646f44",
                "title": "Dybdedata - terrengmodeller 5 meters grid",
                "description": "Datasettet viser terrengvariasjoner på havbunnen. Terrengmodellene har blitt produsert av innsamlede sjømålingsdata av høy kvalitet. Dekningsområdet er avhengig av kartleggingen i forbindelse med MAREANO programmet. MAREANO har kartlagt havområdene utenfor Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Barentshavet øst og ellers utvalgte områder ved Svalbard. Dekningsområdet utvides kontinuerlig etterhvert som nye områder blir kartlagt. Oppløsningen på terrengmodellene er 5m x 5m. Terrengmodellene tilbys i UTM sone 33 og geografisk WGS84. Det innebærer at enkelte kartdata ikke ligger i den UTM-sonen som dekker det aktuelle området.",
                "owner": "Kartverket",
                "updated": "2026-02-26T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/13b707ad-a379-4bf0-a707-da237d646f44"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Befolkning"
            ],
            "runOnDataset": {
                "datasetId": "a965a979-c12a-4b26-90a0-f09de47dbecd",
                "title": "SSB-arealbruk 2025",
                "description": "SSB-arealbruk skal være et landsdekkende datasett som gir oversikt over bebygd og opparbeidet areal og hvordan dette brukes. Datasettet danner deler av grunnlaget for SSBs arealstatistikk. SSB-arealbruk er basert på en rekke digitale kartdata, tilrettelagt og sammensatt slik at det kvalitetsmessig beste datasettet blir valgt ut der det er tilgjengelig, men der slikt datagrunnlag ikke finnes tas datagrunnlag av enklere kvalitet inn.",
                "owner": "Statistisk sentralbyrå",
                "updated": "2025-10-21T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a965a979-c12a-4b26-90a0-f09de47dbecd"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "30caed2f-454e-44be-b5cc-26bb5c0110ca",
                "title": "Stedsnavn",
                "description": "Stedsnavn på geografiske detaljer basert på kartseriene Norge 1:50 000, økonomisk kartverk, sjøkart og navnevedtak gjort etter lov 18. mai 1990 nr.11 om stadnamn. Hvert navn har opplysninger om språk/språkform, koordinater for posisjon (punkt) , kommunetilhørighet, temakode for navnetype, vedtakstype, dato for registrering av navnevedtak og i hvilken sammenheng navnet er benyttet.",
                "owner": "Kartverket",
                "updated": "2026-02-27T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/30caed2f-454e-44be-b5cc-26bb5c0110ca"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "b49478fd-038e-4c2c-ae28-dda1958a8048",
                "title": "FKB-Høydekurve",
                "description": "FKB-Høydekurve er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Høydekurve omfatter data som er nødvendig for å beskrive terrengets form og høyde over et gitt referansenivå. Objekttypene høydekurve, forsenkningskurve, toppunkt, forsenkningspunkt, terrengpunkt og terrenglinje omfattes av spesifikasjonen.\n\nNye høydekurver genereres hovedsaklig fra en terrengmodell basert på punktskyer fra laserskanning. Høydekurvene blir da bare en visning av terrengmodellen. Best informasjon om terrenget fås ved direkte bruk av terrengmodellen.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-02-17T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b49478fd-038e-4c2c-ae28-dda1958a8048"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "85a4c5e3-25ab-427c-b664-bbac2d0c9e79",
                "title": "Reindrift - Årstidsbeite - Høstvinterbeite",
                "description": "Høstvinterbeite er ett av fem datasett som til sammen beskriver reindriftens årstidsbeiter. Høstvinterbeite beskriver beiteområder for rein i sesongen mellom høst og vinter, og det skilles mellom tidlig høstvinterbeite og spredt brukte høstvinterbeiter.\n\nTidlig høstvinterbeite er de deler av høstvinterområdene som beites tidligst og som ofte pakkes til med snø og blir utilgjengelige for reinen utover vinteren. Beitene kan være utsatt for nedising i perioder hvor været veksler fra mildt til kaldt. Spredt brukte høstvinterbeiter er områder i tilknytning til tidlig høstvinterbeite, og som reinen benytter mer spredt. \n\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Et reindriftsår er inndelt i fem ulike årstider med tilhørende årstidsbeiter. Årlige variasjonene i blant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/85a4c5e3-25ab-427c-b664-bbac2d0c9e79"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "aa3c01f3-0678-470d-b03b-33085a7bae28",
                "title": "FKB-Naturinfo",
                "description": "FKB-Naturinfo er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Naturinfo beskriver naturinformasjon som ikke faller inn under de andre naturressurskapitlene - konkret hekk, innmålte trær og steiner.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-02-27T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/aa3c01f3-0678-470d-b03b-33085a7bae28"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "2751aacf-5472-4850-a208-3532a51c529a",
                "title": "Sjøkart - Dybdedata",
                "description": "Datasettet inneholder ugraderte vektoriserte dybdedata til fri bruk. De er enkelt tilgjengelige for innsyn på www.norgeskart.no. Dybdeinformasjonen er referert til sjøkartnull (EPSG 9672). Kystkontur, konstruert kyst og skjær er referert til middel høyvann. Dybdedata gjelder kun saltvann. Dybdedataene er et DOK datasett.  \n\nDybdedataene er grunnlag for Kartverkets navigasjonsprodukter og tjenester. Dybdedataene forvaltes i sjødivisjonens maritime primærdatabase. Databasen inneholder sjømålingsdata av forskjellig alder og kvalitet som er sammenstilt til et sømløst vektorisert datasett. Datasettet oppdateres kontinuerlig. \nDatasettet er ugradert og oppløsning på tetthet mellom dybdepunkt er i henhold til graderingsregimet og gjeldende lovverk om skjermingsverdig informasjon (dvs. 50 m mellom dybdepunktene). Kurveintervallet er: 2, 5, 10, 15, 20, 30, 40, 50, 100, 150, 200, 250, osv. Noen havner har tettere kurveintervall i intervallet 0-30 m (kurver for hver meter). \nOmråder som ikke er sjømålt er også beskrevet i dette datsettet.\n\nDatasettet er grunnlag for offisielle sjøkart og navigasjonsprodukt, men er ikke et navigasjonsprodukt. \n\nDatasettet er også tilgjengelig som WMS og WFS-tjeneste. \nDet finnes en egen WMS-tjeneste som viser datakvalitet på dybdemålingene.",
                "owner": "Kartverket",
                "updated": "2026-03-03T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2751aacf-5472-4850-a208-3532a51c529a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Eiendom"
            ],
            "runOnDataset": {
                "datasetId": "24d7e9d1-87f6-45a0-b38e-3447f8d7f9a1",
                "title": "Matrikkelen - Bygningspunkt",
                "description": "Datasettet Matrikkelen-Bygningspunkt inneholder et lite utdrag av bygningsinformasjonen som er registrert i Matrikkelen, Norges offisielle register over fast eiendom, herunder bygninger.\\\\nDatasettet inneholder representasjonspunkt, bygningstype, bygningsnummer, nåværende bygningsstatus. I tillegg inneholder det ulike id-er for gjenfinning og koblinger (lokal id eller universell uuid) for bygning, og det leveres id(er) for adresse og eiendom pr bygning (hentet fra bruksenhetobjekter i matrikkelsystemet) samt Sefrak-id. \\\\n\\\\nUtgåtte bygninger er ikke med, - heller ikke bygningsendringer som for eksempel påbygg eller tilbygg.\\\\nProduktet inneholder data som er fritt tilgjengelig for alle.\\\\n\\\\nDistribusjoner er satt opp mot en distribusjonsløsning som baserer seg på endringslogg-tjeneste fra Matrikkelsystemet. De ulike distribusjonene har ulik oppdateringsfrekvens, fra 15 minutters forsinkelse på WFS og nedlasting av fritt valgt område fra kart, daglig for kommunevise filer og ukentlig for fylkes- og lands-filer (ny fil kun hvis det er skjedd endringer i Matrikkelen). Ved større endringer/lastinger kan forsinkelsen bli større.",
                "owner": "Kartverket",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/24d7e9d1-87f6-45a0-b38e-3447f8d7f9a1"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "61f2b119-0b47-4f96-b97e-721e191cfcda",
                "title": "N5 Presentasjonsdata",
                "description": "N5 Presentasjonsdata er presentasjonsdata for FKB og andre primærdata tilpasset presentasjon i målestokker omkring 1:5000. N5 Presentasjonsdata inngår som del av produktet N5 Kartdata og benyttes ved produksjon av N5 Raster. \n\nN5 Presentasjonsdata avløser det tidligere produktet FKB-Tekst5000.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/61f2b119-0b47-4f96-b97e-721e191cfcda"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "35c38144-c0a0-4ed9-a66f-21b80bc17fa7",
                "title": "Jordkvalitet",
                "description": "Kartet jordkvalitet viser en vurdering av jordegenskaper som er viktig for den agronomiske bruken av jorda, samt jordbruksarealets hellingsgrad. Jordkvalitetskartet er beregnet uavhengig av klima og forutsetter at jorda er drevet i henhold til god agronomisk praksis. Jordbruksarealene delt inn i tre klasser; 1 - Svært god jordkvalitet; 2 - God jordkvalitet og 3 - Mindre god jordkvalitet.\n\nJordkvalitetskartet bygger på data som er fremskaffet gjennom en detaljert feltkartlegging av jordsmonnet basert på internasjonal metodikk og klassifikasjonssystem.\n\nRundt halvparten av Norges fulldyrka og overflatedyrka jord er jordsmonnskartlagt. Hovedvekten av det kartlagte området finnes på Sør-Østlandet, Trøndelag og Jæren. På enkelte steder er også også innmarksbeite kartlagt.",
                "owner": "Norsk institutt for bioøkonomi",
                "updated": "2022-10-24T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/35c38144-c0a0-4ed9-a66f-21b80bc17fa7"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Høydedata"
            ],
            "runOnDataset": {
                "datasetId": "dddbb667-1303-4ac5-8640-7ec04c0e3918",
                "title": "DTM 10 Terrengmodell (UTM33)",
                "description": "Digital terrengmodell over fastlands-Norge med høyder i et rutenett på 10 x 10 meter. Terrengmodellen er en rutenettsmodell med oppløsning (rutenettstørrelse) på 10 x 10 meter. \n\nNøyaktighet:\n± 2 til 3 meter standardavvik i høyde avhengig av terreng og kartdataenes alder i FKB A – C-området.\n± 4 til 6 meter standardavvik i høyde avhengig av terreng og kartdataenes alder utenfor FKB A – C-området.\n\nArbeidet med ajourhold av dette datasettet blir ikke prioritert. De siste filene som ble oppdatert er fra 2013. Kartverket prioriterer isteden etablering av Nasjonal detaljert høydemodell (hoydedata.no), der nye høydemodeller tilgjengeliggjøres etter hvert som de blir produsert.\nPå hoydedata.no finnes også ferdigproduserte eksporterer av landsdekkende terrengmodeller med 10 meters oppløsning. Disse er generert ut fra detaljerte laserdata der slike finnes. Dette suppleres med høydedata fra 2013-utgaven av DTM10 dersom det er nødvendig for å få full dekning.",
                "owner": "Kartverket",
                "updated": "2018-01-26T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dddbb667-1303-4ac5-8640-7ec04c0e3918"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "d5d1e2d4-7dc0-47ce-8776-ff64b07d788e",
                "title": "Reindrift - Årstidsbeite - Sommerbeite",
                "description": "Sommerbeite er ett av fem datasett som til sammen beskriver reindriftens årstidsbeiter. Sommerbeite beskriver områder som reinen bruker på sommeren, og det skilles mellom høysommerland og lavereliggende sommerland.\n\nHøyereliggende områder og luftingsområder er områder hvor reinen oppholder seg i varme perioder om sommeren for å dekke sitt behov for beite, ro, avkjøling og minske insektsplagen. Reinen finner som regel slike områder høyere til fjells, og derfor kalles dette ofte høysommerland. I vær- og vindeksponerte kystområder kan områder med høysommerland-funksjon også være i lavereliggende terreng. Lavereliggende sommerland er områder i tilknytning til høysommerland. I sommerperioden er reinen var for temperatursvingninger og insektsplage, på grunn av at den røyter de gamle hårene og skal danne nytt hårlag. Reinen har derfor behov for å kunne bevege seg mellom høyereliggende og lavereliggende områder, for å finne ro til å beite.\n \nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Et reindriftsår er inndelt i fem ulike årstider med tilhørende årstidsbeiter. Årlige variasjonene iblant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d5d1e2d4-7dc0-47ce-8776-ff64b07d788e"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "1c64c5ff-0069-4f8e-9a2b-948c7ce3d527",
                "title": "Reindrift - Ekspropriasjonsområde",
                "description": "Datasettet ekspropriasjonsområde avgrenser områder som staten har ekspropriert for at det skal kunne utøves reindrift.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/1c64c5ff-0069-4f8e-9a2b-948c7ce3d527"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "52a55a3c-bcd2-44d7-ac21-2f4550161937",
                "title": "Geologisk arv",
                "description": "Datasettet Geologisk arv viser geologiske lokaliteter av særlig verdi for undervisning, forskning og/eller formidling (geosteder). Det inneholder data innsamlet til ulike formål over lang tid, delvis digitalisert ved NGU fra analoge data, delvis innsamlet i nyere tid. Det inkluderer både geosteder av stor utstrekning (landskapselementer) og små lokaliteter.\n\nBeskrivelsene er innsamlet til ulik tid og med forskjellige metoder og er derfor av varierende kvalitet. Verdivurderinger som er presentert, er alle gjort i henhold til metodikk lansert i KU-veilederen til Miljødirektoratet 2020. \n\n\nI kartinnsyn er dataene ledsaget av faktaark med utførlige beskrivelser av geosteder.\n\n\nFor mer informasjon om hvordan man går fram for å vurdere geologisk mangfold i arealplanlegging og i en konsekvensutredningsprosess;  https://www.ngu.no/emne/geologisk-mangfold-1",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2026-03-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/52a55a3c-bcd2-44d7-ac21-2f4550161937"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Befolkning"
            ],
            "runOnDataset": {
                "datasetId": "843ab449-888c-4b08-bd66-d8b3efc0e529",
                "title": "Tilgjengelighet",
                "description": "Kartverket kartlegger universell utforming og tilgjengelighet i byer, tettsteder og friluftsområder og offentliggjør alle registrerte data. Kartleggingen viser hvordan stedet er utformet med tanke på fremkommelighet for personer med nedsatt bevegelighet og nedsatt syn. Datasettet er et bidrag til å skape bedre folkehelse og å sikre selvstendighet og sikkerhet for alle mennesker med nedsatt funksjonsevne. Målet med nasjonal kartleggingen er å sikre en enhetlig registrering av tettsteder og frilufts-/friområder over hele landet.",
                "owner": "Kartverket",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/843ab449-888c-4b08-bd66-d8b3efc0e529"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "b203e422-5270-4efc-93a5-2073725c43ef",
                "title": "Vannforekomster",
                "description": "Datasettet viser vannforekomster for overflatevann og grunnvann.\n\nEn overflatevannforekomst er en betydelig mengde vann (tilsigsareal for elv og overflateareal for innsjø og kystvann). I tillegg til hydrografiske forhold defineres utstrekningen i henhold til kriterier for vanntype, påvirkninger, økologisk tilstand eller potensial (Sterkt modifiserte vannforekomster) og kjemisk tilstand. En grunnvannsforekomst defineres som en avgrenset forekomst som enten produserer 10m3 per døgn eller som kan forsyne 50 personer. Vannforekomstene utgjør forvaltningsenhetene som skal forvaltes i samsvar med bestemmelsene gitt i vannforskriften, der hovedhensikten er å sikre en helhetlig vannforvaltning fra fjell til fjord. Felles for elementene som inngår i vannforekomster, er at de er homogene med tanke på kjemiske, biologiske og fysiske egenskaper samt antropogene påvirkninger innenfor et nedbørfelt.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b203e422-5270-4efc-93a5-2073725c43ef"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "8944603c-9414-43a7-9421-9a1de9850a96",
                "title": "FKB-Tiltak",
                "description": "FKB-Tiltak er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Tiltak skal inneholde objekter (områder der det skjer utbygging) som er omsøkt/godkjent gjennom saksbehandling i kommunen eller andre offentlige myndigheter. Denne informasjonen viser hvor det skjer endringer i terrenget og kan derfor brukes som metadata for de øvrige FKB-datasettene. I tillegg er målet at dataene i FKB-Tiltak nyttes til å få til en raskere oppdatering av grunnkartet når utbyggingen er ferdig. For objekttypene BygningTiltak/BygningKnekklinje overføres geometrien automatisk til FKB-Bygning når bygningen ferdigstilles (dersom data av bedre kvalitet ikke finnes).\n\nObjekter som er ferdig bygd og registrert i grunnkartet merkes som kartlagt (KARTREG 2) i tiltaksbasen, men vil normalt ikke bli slettet slik at historikken i FKB-Tiltak er tilgjengelig.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/8944603c-9414-43a7-9421-9a1de9850a96"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "63f655ef-f625-43cf-a512-bb8164bf53a4",
                "title": "Reindrift - Årstidsbeite - Vinterbeite",
                "description": "Vinterbeite er ett av fem datasett som til sammen beskriver reindriftens årstidsbeiter. Det viser områder som reinen bruker på vinteren, og det skilles mellom tidlig vinterland og senvinterland.\n\nTidlig vinterland er områder hvor reinen oppholder seg tidlig i vintersesongen. Senvinterland er de deler av vinterområdene som normalt er mest sikre mot store snømengder og nedising på midt- og senvinteren.\n\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Et reindriftsår er inndelt i fem ulike årstider med tilhørende årstidsbeiter. Årlige variasjonene iblant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/63f655ef-f625-43cf-a512-bb8164bf53a4"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "c9e53371-c296-4631-a08d-2e7248a81757",
                "title": "N20 Kartdata",
                "description": "N20 Kartdata er basert på utvalgte og generaliserte FKB data. Informasjonen er ytterligere generalisert i forhold til N5 Kartdata. Temagrupper N20 Kartdata: Høyde:  Høydekurver (ekvidistanse 10 meter) og høydepunkt. Vann: Kyst, sjø, innsjø og vassdrag. Administrative grenser: Administrasjonsgrenser, eiendomsinformasjon, servituttgrenser, verneområder og kulturminner. Markslag: Markslaginformasjon. Areal: Arealbruk. Bygg og anlegg: Utvalgte bygningstyper, bygningsmessige anlegg og  ledninger. Samferdsel: Silt/tynnet VBASE, jernbane, annen samferdsel og lufthavn. Tekst: Utvalgte presentasjonsdata.",
                "owner": "Geovekst",
                "updated": "2026-03-03T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/c9e53371-c296-4631-a08d-2e7248a81757"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "b70c5869-f5b6-40df-b52c-6437c34c928d",
                "title": "Sensitive artsdata",
                "description": "Sensitive artsdata er samlebegrep for en database med utvalgte arter av fugler, pattedyr og lav hvor stedfestet informasjon om artenes hekkeområde, yngleområde eller voksested er skjermet for allment innsyn. Begrunnelsen for at stedfestet informasjon om disse artene bør skjermes, er at åpen tilgang kan føre til at arten eller stedet der den forekommer utsettes for uheldige negative påvirkninger. Det kan være eksempelvis forstyrrelse, etterstrebelse, eller ødeleggelse.\n\nData er publisert gjennom en passordbeskyttet løsning som viser eksakt lokalisering av objektene. Fylkesmannen og Miljødirektoratet kan gi tilgang til denne. Data er også publisert gjennom en åpen løsning som viser maskerte data, i form av ruter med varierende størrelse, avhengig av art.",
                "owner": "Miljødirektoratet",
                "updated": "2019-01-21T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b70c5869-f5b6-40df-b52c-6437c34c928d"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "8b4304ea-4fb0-479c-a24d-fa225e2c6e97",
                "title": "FKB-Bygning",
                "description": "FKB-Bygning er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Bygning inneholder detaljert bygningsinformasjon. Dataene omfatter beskrivelse av alle typer bygninger, takoverbygg, beskrivende bygningslinjer (for eksempel mønelinje) samt bygningsvedheng (for eksempel veranda).\n\nFKB-Bygning benytter samme definisjon/inndeling av en bygning som matrikkelen og har en 1:1 kobling mot matrikkelen ved at bygningsnummer fra matrikkelen legges inn på bygningene i FKB-Bygning.\n\nFKB-Bygning bygger på en 2.5D bygningsmodell. Det innebærer at dataene ikke inneholder volum/3D-objekter, men at høydeverdiene til toppen av objektene registreres. Enkle 3D-modeller kan dermed lages ved å projisere FKB-dataene ned på en terrengmodell.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-07T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/8b4304ea-4fb0-479c-a24d-fa225e2c6e97"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "82cd33ef-52dd-4c83-b2d6-e55a0941b33b",
                "title": "Grunnvannsborehull",
                "description": "Datasettet gir en landsdekkende oversikt over borede grunnvannsbrønner, energibrønner og naturlige oppkommer av grunnvann (tidligere kalt kilder). Datasettet viser lokalisering og tekniske, administrative og geologiske forhold registrert for grunnvanns- og energibrønner. Oftest er de registrert av borefirma iht. oppgaveplikten etter Vannressursloven §46. Dataene er tilgjengelig i GRANADA - Nasjonal grunnvannsdatabase https://geo.ngu.no/kart/granada_mobil/",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2026-03-03T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/82cd33ef-52dd-4c83-b2d6-e55a0941b33b"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "6383f5a8-3a4d-48fc-8c67-f1eeec24fd8b",
                "title": "Reindrift - Årstidsbeite - Høstbeite",
                "description": "Høstbeite er ett av fem datasett som til sammen beskriver reindriftens årstidsbeiter. Det skilles mellom to typer høstbeite: Tidlig høstland og parringsland. \n\nTidlig høstland er områder hvor reinen beiter tidlig på høsten, og hvor reinen på naturlig måte spres på leting etter sopp. Denne tida kalles ofte spredningstid. Parringsland er de deler av høstområdet som brukes i brunstperioden. \n\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Et reindriftsår er inndelt i fem ulike årstider med tilhørende årstidsbeiter. Årlige variasjonene i blant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/6383f5a8-3a4d-48fc-8c67-f1eeec24fd8b"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "3de4ddf6-d6b8-4398-8222-f5c47791a757",
                "title": "Løsmasser",
                "description": "Løsmassedataene viser utbredelsen av løsmassetyper (også benevnt jordarter). Løsmassetypene er klassifisert etter deres dannelsesmåte. Dataene viser hvilken løsmassetype som dominerer i terrengoverflaten, og avspeiler landskapets oppbygning og utvikling. Det er viktig å være klar over at andre løsmassetyper kan opptre i dypet. Dataene viser også arealer med fjell uten løsmassedekke. Datasettet er landsdekkende og representerer de beste løsmasseregistreringene i databasen.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2024-06-22T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/3de4ddf6-d6b8-4398-8222-f5c47791a757"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "63190f80-8692-492a-8e7a-b2cb0a59d27a",
                "title": "Storulykkeanlegg",
                "description": "Datasettet viser alle anlegg i Norge som faller inn under storulykkeforskriften (forskrift om tiltak for å forebygge og begrense skadevirkningene av storulykker i virksomheter der farlige kjemikalier forekommer).  Om lag 350 norske virksomheter er regulert av storulykkeforskriften. Dette er i stor grad prosessindustri, kjemisk industri, tankanlegg og eksplosivlagre. Storulykkeforskriften implementerer de kravene som stilles til virksomheter gjennom EU-direktivet Seveso III, og håndheves av følgende myndigheter: Miljødirektoratet, Direktoratet for Arbeidstilsynet, Direktoratet for samfunnssikkerhet og beredskap (DSB), Petroleumstilsynet og Næringslivets sikkerhetsorganisasjon. Datasettet gis bare ut til bruk i kommunal og regional beredskap, arealplanlegging og byggesaksbehandling og bare ved direkte henvendelse til DSB ved kart@dsb.no. På grunn av restriksjonene på dataene er de bare tilgjengelige for utvalgte brukere.  Dette vil være brukere innenfor arealplanlegging, byggesaksbehandling og samfunnssikkerhet/beredskap.",
                "owner": "Direktoratet for samfunnssikkerhet og beredskap",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/63190f80-8692-492a-8e7a-b2cb0a59d27a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "6bb353c3-2b21-42fe-b296-31e60f64f95d",
                "title": "N5 Kartdata",
                "description": "Informasjon tilsvarende digitalt ØK. N5 Kartdata er basert på utvalgte, generaliserte FKB data.\nTemagrupper:\nHøyde: Høydekurver, 5 m ekv. og høydepunkt.\nVann: Kyst, sjø, innsjø og vassdrag.\nAdministrative grenser: Administrasjonsgrenser, eiendomsinformasjon, servituttgrenser, verneområder og kulturminner.\nMarkslag: Markslaginformasjon.\nAreal: Arealbruk.\nBygg og anlegg: Bygninger, bygningsmessige anlegg og ledninger.\nSamferdsel: Vegsituasjon, jernbane, annen samferdsel og flyplass.\nTekst: Presentasjonsdata. \nDekning: Dekningen varierer, avhengig av hvor det har vært gjennomført Geovekst - prosjekter. For informasjon om dekning ta kontakt med det lokale fylkeskartkontor",
                "owner": "Geovekst",
                "updated": "2026-03-03T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/6bb353c3-2b21-42fe-b296-31e60f64f95d"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "7df9ef08-faf2-4ad3-9ae2-49905f5ea808",
                "title": "SR16 - Skogressurskart 16x16 meter",
                "description": "SR16 er et heldekkende datasett som gir oversikt over utbredelsen og egenskaper ved landets skogressurser. SR16 er delt opp i SR16R som er et rasterkart og SR16V som er et vektorkart. Datasettet er fremstilt gjennom automatiske prosesser som en kombinasjon av eksiterende kart (AR5), terrengmodeller, 3D fjernmålingsdata (fotogrammetri og laser) og landsskogflater. SR16 er fremstilt som et pikselkart (16 x 16 meter) og som et vektorkart som generaliserer pikselkartet til større figurer (polygoner) av relativ homogen skog. De fleste egenskapene i SR16V er beregnet som et gjennomsnitt av verdiene fra pikslene i SR16R.",
                "owner": "Norsk institutt for bioøkonomi",
                "updated": "2021-01-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/7df9ef08-faf2-4ad3-9ae2-49905f5ea808"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Befolkning"
            ],
            "runOnDataset": {
                "datasetId": "25c70158-5841-4801-8bf3-fc3c5adf5329",
                "title": "Befolkning på rutenett 1000 m 2025",
                "description": "Viser bosatte på ruter 1000 m x 1000 m for 2025. Grunnlaget for dataene er folkeregistrert befolkning knyttet mot adressepunkter i Matrikkelen. Dette er summert til rutenett.",
                "owner": "Statistisk sentralbyrå",
                "updated": "2025-10-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/25c70158-5841-4801-8bf3-fc3c5adf5329"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "442cae64-b447-478d-b384-545bc1d9ab48",
                "title": "N250 Kartdata",
                "description": "N250 Kartdata er en generalisering av N50 Kartdata og kartografisk tilpasset målestokk 1:100 000 - 1:300 000. N250 Kartdata dekker fastlands-Norge begrenset av riksgrensen mot nabolandene og territorialgrensen i havet. N250 Kartdata ajourføres kontinuerlig og distribueres ukentlig.",
                "owner": "Kartverket",
                "updated": "2026-03-07T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/442cae64-b447-478d-b384-545bc1d9ab48"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "7ce68b6a-64a8-4cf3-9ca0-0f773483ba92",
                "title": "Kulturlandskap - utvalgte",
                "description": "Datasettet viser områder som er omfattet av satsingen Utvalgte kulturlandskap i jordbruket. Dette er et samarbeid og spleiselag mellom landbruks-, natur- og kulturminneforvaltningen i Norge. Arbeidet er basert på samarbeid mellom grunneiere og drivere og styresmaktene. Utvalgte kulturlandskap i jordbruket er en samling av de mest verdifulle kulturlandskapene i Norge. Formålet med satsingen er å sikre langsiktig forvaltning av et utvalg særegne landskapsområder med store biologiske og kulturhistoriske verdier som er formet av langvarig og kontinuerlig tradisjonell bruk. I utvelgelsen av områdene vektlegges at de i størst mulig grad skal omfatte kulturlandskap i jordbruket med store verdier knyttet til både biologi/naturmangfold og kulturhistorie og at det skal være realistisk å få til langsiktig drift, skjøtsel og vedlikehold.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/7ce68b6a-64a8-4cf3-9ca0-0f773483ba92"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "df5c70a1-e9cf-4b2c-bf9a-7dce453830cd",
                "title": "Verneplan for vassdrag",
                "description": "Database over vassdrag verna mot kraftutbygging. Egenskapsdata er verneplannavn. og id., verneplannr., dato for  vern, areal og vassdragsnr.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/df5c70a1-e9cf-4b2c-bf9a-7dce453830cd"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Eiendom"
            ],
            "runOnDataset": {
                "datasetId": "f7df7a18-b30f-4745-bd64-d0863812350c",
                "title": "Matrikkelen - Adresse",
                "description": "Offisielle fysiske adresser registrert i Matrikkelen (Norges offisielle eiendomsregister). En offisiell adresse er den fullstendige adressen for en bygning, bygningsdel, bruksenhet, eiendom eller et annet objekt. En adresse er enten Vegadresse (Storgata 10) eller Matrikkeladresse (33/2-2). Det er et mål at alle matrikkeladresser skal erstattes av vegadresser.\n\nAdressen inneholder informasjon om kretstilhørighet til post-, valg-, tettsted-, sokn- og grunnkrets. Datasettet har ikke med adressens knytning til eiendom (matrikkelnummer) ned på seksjonsnivå, kun til grunneiendom-/feste-nivå.\n\nDistribusjonen er satt opp mot en løsning som gir noe forsinkelse fra det offisielle Matrikkelsystemet. Fra ca. 15 minutters forsinkelse på WFS og for nedlasting av fritt valgt område fra kart, en dag forsinkelse for kommunefiler og WMS og ukentlig for fylkes-/landsfiler (ny fil genereres kun hvis det har skjedd endringer i kommunen). Ved større endringer/lastinger kan forsinkelse bli større.",
                "owner": "Kartverket",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/f7df7a18-b30f-4745-bd64-d0863812350c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "3d0fe246-ae76-4e88-af1f-c0b0405e83c1",
                "title": "Forsvarets skyte- og øvingsfelt land",
                "description": "Datasettet inneholder den flatemessige utbredelsen av militære skyte- og øvingsfelt avgrenset av Forsvarets eide/leide grunn, og Forsvarets ervervede rettigheter til bruk av arealet til skyte- og øvingsaktivitet, herunder også klausulerte fareområder (sikkerhetssoner). Datasettet beskriver IKKE fare-/restriksjonsområder for luftfarten som kan avvike fra skytefeltets geografiske representasjon på bakken. Datasettet inneholder kun skytefelt som er forvaltet av Forsvarsbygg. Skytefelt i sjø forvaltes primært av Sjøforsvaret, og er ikke med i dette datasettet. Deler av dette datasettet leveres også til Kartverkets N50-serie.",
                "owner": "Forsvarsbygg",
                "updated": "2025-12-19T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/3d0fe246-ae76-4e88-af1f-c0b0405e83c1"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "bd23cc07-45d3-4346-a8cd-e8c9f506656e",
                "title": "N5 Raster",
                "description": "Informasjon lik kartene i Økonomisk kartverk. Symboler, linjer og tekst med samme form som på kartene. Informasjonen forefinnes som et rasterlag pr. kartblad. Datamengde ca. 1 Mb pr. kartblad i TIFF-format.",
                "owner": "Geovekst",
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/bd23cc07-45d3-4346-a8cd-e8c9f506656e"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "54ada9d8-e6fc-48d6-82b0-5477166a4aaa",
                "title": "Aktsomhetskart for snøskred",
                "description": "Aktsomhetskart for snøskred er et GIS-generert landsdekkende datasett som gir en grov oversikt over områder som potensielt kan være snøskredutsatt. Aktsomhetskartet ble ferdigtstilt i 2023 med ny metodikk. Kartet er utviklet av Norges Geotekniske Institutt (NGI) og blir forvaltet av NVE.\n\nNye aktsomhetskart for snøskred 2023 finnes i tre forskjellige utgaver:\n\nAktsomhetskart snøskred S3 til bruk i kommuneplan for å avklare sikkerhet for bygg opp til \nsikkerhetsklasse S3. Kartet er sammensatt av aktsomhetskart for snøskred fra 2010 og \nAktsomhetskart for snøskred S2 uten skog fra 2023.\n\nAktsomhetskart snøskred S2 uten skogeffekt til å avklare sikkerhet for bygg opp til og med \nsikkerhetsklasse S2 uten å måtte båndlegge skog.\n\nAktsomhetskart snøskred S2 med skogeffekt til å avklare sikkerhet for bygg opp til \nsikkerhetsklasse S2, dersom skogen sin sikringseffekt er sikret.\n\nNasjonal høydemodell er brukt som grunnlag for å identifisere områder der snøskred kan løsne. \nKlimadata fra SeNorge og skogdata fra SR16-datasettet til NIBIO er brukt til å estimere \nsnømengder og sannsynlighet for skred. Kartet bruker en dynamisk utløpsmodell som gir \nutløpssoner som er mer tilpasset terrenget og dermed gir mer realistiske utløpssoner enn tidligere \naktsomhetskart.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-02-16T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/54ada9d8-e6fc-48d6-82b0-5477166a4aaa"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "dc0605f3-2301-4abe-a91f-6da42464c281",
                "title": "Radon aktsomhet",
                "description": "Datasettet viser hvilke områder i Norge som trolig er mer radonutsatt enn andre. Datasettet er basert på geologi og inneluftsmålinger av radon. Inneluftsmålinger er fra NRPA sin nasjonale database, og geologi er fra NGU sine berggrunns- og løsmassedatabaser. Berggrunnsdata er av målestokk 1:250.000 og løsmassedata er av varierende målestokk, fra 1:50.000 til 1:1000.000. Inneluftsmålinger er brukt til å identifisere områder med forhøyd aktsomhet for radon, totalt 34563 geo-refererte målepunkt. De er også brukt til å kjennetegne geologi i forhold til aktsomhet for radon, og denne kunnskapen er overført til områder hvor det finnes ingen eller få inneluftsmålinger. Der hvor et område er klassifisert som «høy aktsomhet» er det beregnet at minst 20% av boligene har radonkonsentrasjoner over 200 Bq/m3, med 70% statistisk sikkerhet. Der hvor et område er klassifisert som «middels til lav aktsomhet» er det beregnet at opp til 20% av boligene har radonkonsentrasjoner over 200 Bq/m3, med 70% statistisk sikkerhet. Der hvor det ikke er nok data, eller hvor det ikke er nok statistisk sikkerhet for å beregne aktsomhet for radon, er områder klassifisert som «usikker aktsomhet». Alunskifer er tilknyttet forhøyde radonkonsentrasjoner. Områder hvor det finnes alunskifer er klassifisert som «særlig høy aktsomhet». Med å overføre kunnskap fra områder med inneluftsmålinger til områder uten inneluftsmålinger, er det antatt at radonegenskaper av en geologitype er det samme i hele landet. I praksis kan det forventes noe variasjon i radonegenskaper i polygoner av den samme geologitypen. I tillegg kan det forventes variasjon i radonegenskaper innenfor et polygon.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2021-12-20T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/dc0605f3-2301-4abe-a91f-6da42464c281"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "7f88f401-4e0e-4be6-9e12-265c7b23505d",
                "title": "Reindrift - Avtaleområde",
                "description": "Datasettet avgrenser områder hvor det i utgangspunktet ikke er reinbeiterettigheter, men hvor det er inngått avtale om reinbeite mellom grunneier og reindriftsutøver. Avtaleområder kan ligge både innenfor og utenfor det samiske reinbeiteområdet. Utenfor det samiske reinbeiteområdet er det krav om særskilt tillatelse til å utøve reindrift etter reindriftsloven § 8.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/7f88f401-4e0e-4be6-9e12-265c7b23505d"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "4920b452-75cc-45f2-964c-3378204c3517",
                "title": "FKB-Veg",
                "description": "FKB-Veg er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Veg inneholder detaljert informasjon om alle offentlige og private veganlegg. Spesifikasjonen gjelder for de enkelte vegelementene som beskriver veglegemets geometri. Dataene omfatter beskrivelse av alle typer veger for kjørende, syklende og gående samt et utvalg av tilhørende objekter og avgrensninger.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/4920b452-75cc-45f2-964c-3378204c3517"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Plan"
            ],
            "runOnDataset": {
                "datasetId": "28c28e3a-d88f-4a34-8c60-5efe6d56a44d",
                "title": "Nasjonalt grunnkart for arealanalyse - Årsversjon 2025",
                "description": "Nasjonalt grunnkart for arealanalyse er tilgjengelig som **årsversjon 2025**. \nNå er GML, FGDB og Geopackage filer av årsversjon 2025 tilgjengelig for nedlasting. \n\n**Dersom du ønsker å se på Årsversjon 2025 av Grunnkartet, er den nye WMS-tjenesten tilgjengelig.** Mer informasjon om WMS-tjenesten finner du på https://kartkatalog.geonorge.no/Metadata/c7dc425b-60cd-42f7-a84e-202c7d7b912a. \n\n\n- - -\n\nGrunnkartet er utviklet i samarbeid mellom NIBIO, SSB, Kartverket og Miljødirektoratet, og er ment som et felles datagrunnlag for ulike typer arealanalyser.\n\nDatasettet bygger på eksisterende data fra det offentlige kartgrunnlaget (DOK), som viser arealressurs- og arealbruksdata, og innebærer ingen nykartlegging.  Kildedata som er brukt i denne versjonen var oppdatert per 01.01.2025. I tillegg til arealressurs- og arealbruksdata er det lagt inn økosysteminformasjon i henhold til Eurostats klassifikasjonssystem. Grunnkartet kan kobles med andre datakilder, som for eksempel arealplaner, og benyttes som grunnlag for ulike typer arealanalyser og arealregnskap. Les mer om datainnhold og metode under Prosesshistorie.\n\n\n**Rapporter**\n\n\n* Alle endringer som er implementert i Årsversjon 2025 er samlet i rapporten [Nasjonalt grunnkart for arealanalyse - Årsversjon 2025](https://doi.org/10.21350/4m2k-7z04)\n\n* Alle tilbakemeldinger til Testversjon 2 er samlet i rapporten [Nasjonalt grunnkart for arealanalyse, Testversjon 2 - Tilbakemeldinger og vurderinger](https://www.kartverket.no/globalassets/forskning-og-utvikling/rapporter/nasjonalt-grunnkart-for-arealanalyse-testversjon-2-tilbakemeldinger-og-vurderinger.pdf).\n\n* Alle endringer som er implementert i Testversjon 2 er samlet i rapporten [Testversjon 2 - Nasjonalt grunnkart for bruk i arealregnskap](https://hdl.handle.net/11250/3185743)\n\n* Alle tilbakemeldinger til Testversjon 1 er samlet i rapporten [Grunnkart for bruk i arealregnskap - Tilbakemeldinger, vurderinger og anbefalinger](https://www.kartverket.no/globalassets/forskning-og-utvikling/rapporter/rapport-grunnkart-for-bruk-i-arealregnskap-tilbakemeldinger-vurderinger-og-anbefalinger-2.pdf).\n\n* Les mer om metode og bruk av Grunnkartet i rapporten [Grunnkart for bruk i arealregnskap](https://hdl.handle.net/11250/3120510)",
                "owner": "Statistisk sentralbyrå",
                "updated": "2026-03-05T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/28c28e3a-d88f-4a34-8c60-5efe6d56a44d"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "af2c4a0a-1978-4e62-b08d-ed1f36bd5023",
                "title": "Trafikkmengde",
                "description": "Datasettet gir informasjon om representativ trafikkmengde for en vegstrekning på europa-, riks- eller fylkesveger. Trafikkmengden er beregnet gjennom trafikkdatasystemet, men kan også unntaksvis være subjektivt anslått. Det utgis som et årsdatasett og er sentralt i forvaltning av vegene. Vegnett som har oppstått etter årets ÅDT-beregninger vil kunne mangle data frem til neste års ÅDT-beregning. Datagrunnlaget for ÅDT-beregninger er data fra individuelle målepunkt på vegnettet (trafikkregistreringsstasjoner), disse finnes på http://trafikkdata.no",
                "owner": "Statens vegvesen",
                "updated": "2026-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/af2c4a0a-1978-4e62-b08d-ed1f36bd5023"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "23dfcc33-fb04-4898-aa88-68b49c4bfea7",
                "title": "FKB-Lufthavn",
                "description": "FKB-Lufthavn er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-Lufthavn omfatter et begrenset utvalg av objekttyper for lufthavner som skal registreres og forvaltes i FKB. Avinor har en mer detaljert spesifikasjon som benyttes for datafangst og forvaltning av data for Avinors egne lufthavner. Data etter denne spesifikasjonen skal kunne avledes fra Avinors data.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/23dfcc33-fb04-4898-aa88-68b49c4bfea7"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "86d6201a-4e0b-4f61-a1dc-c94164cfd160",
                "title": "FKB-Grønnstruktur",
                "description": "FKB-Grønnstruktur 1.0 er et datasett som kombinerer informasjon fra fjernmålingsdata og FKB-data. Datasettet viser vegetasjonsdekke inndelt i tre kategorier av sjikt: feltsjikt, busksjikt og tresjikt. I tillegg vises grå arealer som bygninger og infrastruktur, altså områder uten vegetasjon. \n\nPresisjonsnivået for enkelte egenskaper, særlig de grønne strukturene, vil være lavere enn i tradisjonelle FKB-datasett.\n\nGrønnstrukturkartet etableres ved å kombinere detaljerte offentlige kartdata, som til enhver tid omfatter alle relevante data, satellittdata fra Copernicus-programmet (VHR-opptak via Norsk Romsenter) med oppløsning 2–4 meter og høydedata fra NDH (Nasjonal detaljert høydemodell) med romlig oppløsning 1 meter x 1 meter. I tillegg benyttes informasjon fra SSB Arealbruk for å avgrense kartleggingsområdet og FKB-AR5 for å gi informasjon om jordbruksareal innenfor kartleggingsområdet.",
                "owner": "Geovekst",
                "updated": "2024-05-29T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/86d6201a-4e0b-4f61-a1dc-c94164cfd160"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "df2db95d-adbc-4807-bb46-00b729caed7c",
                "title": "Reindrift - Beitehage",
                "description": "Beitehage er områder som er helt eller delvis inngjerdet med trådstengsel. Her samles flokken før den tas inn i et arbeidsgjerde for kalvemerking, uttak av slaktedyr eller i påvente av transport. Der hvor beitehagen er delvis inngjerdet med trådstengsel er det i tillegg naturlige stengsler som berg, innsjø eller elv som avgrenser beitehagen.\n\nKartene er å regne som illustrasjon på hvordan reindriftsnæringen i hovedsak og normalt bruker områdene. Lov om reindrift (reindriftsloven) regulerer hvilke rettigheter og plikter reindriftsutøvere har i forhold til arealbruk.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/df2db95d-adbc-4807-bb46-00b729caed7c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "e4f40b02-7a32-4163-87af-d4121de48e6d",
                "title": "Marine naturtyper (HB19)",
                "description": "Datasettet er tidligere publisert under navnet \"Naturtyper - DN-håndbok 19\". Datasettet viser naturtypelokaliteter som kartlagt etter DN-håndbok 19 Kartlegging av marint biologisk mangfold og som er publisert av Miljødirektoratet. Kartleggingsinstruksen er basert på DN-håndbok 19, revidert i 2007, da feltkartleggingen startet for fullt. Den enkelte lokalitet er registrert med en naturtype, som kan være registrert mer detaljert som utforming. Naturtyper prioritert for kartlegging er beskrevet i DN-håndbok 19. Hver registrert lokalitet er gitt en naturfaglig verdi, basert på størrelse, tilstand og naturmangfold. Lokalitetene har en områdebeskrivelse med vekt på å forklare verdisettingen. Den geografiske presisjonen er jevnt over god for hele datasettet. Forbedring av modeller for prediksjon av naturtyper har også gitt noe bedre presisjon over tid. I datasettet inngår også nøkkellokaliteter for noen arter av skjell, som av praktiske årsaker er etablert som naturtypedata. Kartleggingsprogrammet er gjennomført i samarbeid med Fiskeridirektoratet.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e4f40b02-7a32-4163-87af-d4121de48e6d"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "5442bb1d-b0fb-4271-bf47-d80716699149",
                "title": "Sjøkart - raster Hovedkart",
                "description": "Hovedkartserien dekker norske kysten fra svenskegrensen til Grense-Jakobselv. Hovedkartene består av 143 sjøkart i målestokk 1:50 000 (med noen få unntak). De er ofte utstyrt med kartutsnitt (spesialer) i større målestokker over trange farvann og havner. Hovedkartserien er først og fremst et navigasjonskart for kyststrøkene.",
                "owner": "Kartverket",
                "updated": "2026-03-03T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/5442bb1d-b0fb-4271-bf47-d80716699149"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Befolkning"
            ],
            "runOnDataset": {
                "datasetId": "7192d47e-4dd2-4bfd-aadd-010aa62cdee3",
                "title": "Barnetråkk - aggregert",
                "description": "Barnetråkk inneholder data om barna sitt nærmiljø og er registrert av skoleelever. Data omfatter veier barn bruker til skole- og fritidsaktiviteter, samt informasjon om steder barn bruker til fritidsaktiviteter. Det registreres også steder barn liker eller misliker. Datasettet gir nyttig informasjon til bruk i kommunal og regional planlegging, statistikk, forskning og utdanning. \n\nAggregert datasett er en forenklet versjon av \"Barnetråkk - fullstendig\" og brukes til representasjon av punkt- og linje data fra fullstendig datasett i heksagongrid.\n\nDatasettet Barnetråkk - aggregert er offentlig tilgjengelig uten behov til innlogging med 200 meter oppløsning. Fullstendig datasett er tilgjengelig for autoriserte og registrerte brukere gjennom innlogging hos UiB.",
                "owner": "Universitetet i Bergen",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/7192d47e-4dd2-4bfd-aadd-010aa62cdee3"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "68f6a2e5-8c8a-4976-870c-670add90fff6",
                "title": "Kulturminner - Brannvern",
                "description": "Datasettet inneholder områder som Riksantikvaren definerer som tette trehusmiljøer. Områder der det må tas særskilte brannvernhensyn. I tillegg inneholder det brannsmitteområder, dvs. områder i, eller i nærhet til, et tett trehusmiljø der det er spesielt stor fare for at brann i en bygning skal smitte over på de øvrige.\n\nTett bebyggelse med trehus er spesielt sårbar om det skulle oppstå brann. De største områdene med sammenhengende, gammel trehusbebyggelse har vi i byer, for eksempel i Halden sentrum, gamle Stavanger og i store deler av Trondheim. Tette trehusmiljøer finnes imidlertid også på større gårdstun, som Havråtunet i Hordaland, og i gamle fiskevær, som Sør-Gjæslingan i Nord-Trøndelag.",
                "owner": "Riksantikvaren",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/68f6a2e5-8c8a-4976-870c-670add90fff6"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "d5b180dd-0cef-4c4a-9174-ba5af69c3551",
                "title": "Digitale ortofoto",
                "description": "Ortofoto er flybilder med de samme geometriske egenskaper som et kart og kan knyttes til et referansesystem. Ortofotoene dekker hele landet med varierende oppløsning og nøyaktighet. Bilder over by- og utbyggingsområder har som regel best oppløsning og nøyaktighet. Bildeprosjektene varierer i utstrekning, fra små prosjekter i en kommune, til store prosjekter som kan dekke hele regioner.",
                "owner": "Kartverket",
                "updated": "2017-01-17T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d5b180dd-0cef-4c4a-9174-ba5af69c3551"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "35ef918f-ecb2-47ac-953b-1479dc5579c9",
                "title": "Militære forbudsområder innen sjøforsvaret",
                "description": "Datasett i henhold til Forskrift om militære forbudsområder innen Sjøforsvaret. \nLink til forskriften:\nhttps://lovdata.no/dokument/LTI/forskrift/2024-06-24-1311.\n\nForskriften eies av Forsvarsdepartementet. Forsvarsbygg ivaretar Forsvarets arealbruksinteresser i arealplansammenheng, og det er derfor Forsvarsbygg som distribuerer datasettet i Geonorge.",
                "owner": "Forsvarsbygg",
                "updated": "2024-11-12T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/35ef918f-ecb2-47ac-953b-1479dc5579c9"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "a6368bed-4896-41d3-92aa-cc2b4261adc3",
                "title": "Kulturlandskap - verdifulle",
                "description": "Datasettet består av verdifulle kulturlandskap med registrerte biologiske verdier og/eller kulturminneverdier. Biologiske verdier kan være naturtyper, som f.eks. artsrike slåtteenger eller kystlynghei. Kulturhistoriske verdier kan være f.eks. hus, steinmurer og gravrøyser. Enkeltlokaliteter av kulturbetingete naturtyper er i stor grad rekartlagt etter 2005 og lagt inn i datasettet Naturtyper - DN-håndbok 13.\n\nDatasettet har historikk tilbake til tidlig 1990-tall og prosjektet \"Nasjonal registrering av verdifulle kulturlandskap\". Førstegangs registrering pågikk i 1992-1994. Supplerende registreringer og oppdateringer er gjennomført av fylkesmennene, i varierende omfang.\n\nRegistreringene ble utført både med tanke på å dokumentere verdier og å danne grunnlag for prioritering av offentlig innsats for å stimulere til og støtte ulike forvaltningstiltak for å ivareta verdiene.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/a6368bed-4896-41d3-92aa-cc2b4261adc3"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "041f1e6e-bdbc-4091-b48f-8a5990f3cc5b",
                "title": "Administrative enheter kommuner",
                "description": "Datasettet viser kommuneinndelinga i landet med de mest nøyaktige grensene som er registrert digitalt og som er samlet i ett datasett. Datasettet har referansedato 1.1.2026, og er oppdatert med overføring av to arealer mellom Indre Østfold og Nordre Follo ved Slemmestadveien, og et areal mellom Indre Østfold og Vestby ved Laaskenveien. Det er i tillegg oppdatert med en del mindre kvalitetshevinger, som følge av jordskiftesaker og klarlegging av eksisterende grense på kommune-/fylkesgrenser.\n \nFlatene inneholder egenskaper som forteller om offisielle kommunenumre. De offisielle norske, samiske og kvenske navnene for kommunene er hentet fra SSR. I tillegg finnes informasjon om samiske forvaltningsområder.\n\nGeodataene er fra nasjonal inndelingsbase, som er en del av matrikkelen. Ved overgang til ny forvaltningsløsning, ble det også gjort endringer i UML-modellen.",
                "owner": "Kartverket",
                "updated": "2025-12-10T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/041f1e6e-bdbc-4091-b48f-8a5990f3cc5b"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Eiendom"
            ],
            "runOnDataset": {
                "datasetId": "74340c24-1c8a-4454-b813-bfe498e80f16",
                "title": "Matrikkelen - Eiendomskart Teig",
                "description": "Datasettet Matrikkelen-Eiendomskart Teig inneholder et utdrag av eiendomsinformasjon som er registrert i Matrikkelen, Norges offisielle register over fast eiendom.   Datasettet inneholder teiger (avgrensede arealer/jordstykker) med informasjon om hvilken eiendom (matrikkelenhet) de tilhører. Matrikkelnummeret (kommunenummer-gårdsnummer/bruksnummer eventulet festenummer, seksjonsnummer) identifiserer eiendommen og ligger til datatypen Matrikkelenhet. Matrikkelenhet inneholder også andre nøkkelopplysninger og \"varsel-flagg\" om eiendommen. Grensepunkt, grenser og teigareal med kvalitetsopplysninger er med i datasettet.  Volumer til anleggseiendommer (eiendommer over/under bakken) leveres som et areal, - et plant \"fotavtrykk\", men oppgittVolum kan være registrert.\n\nI tillegg fins ulike id-er for enklere gjenfinning og koblinger (lokal id eller universell uuid). Matrikkelen-Eiendomskart Teig inneholder data som er fritt tilgjengelig for alle (åpne data). Produktet Matrikkelen-Bygningspunkt inneholder id-er for kobling mellom Adresse, Bygning og Eiendom. \n\nDistribusjonen er satt opp mot en distribusjonsløsning som gir noe forsinkelse fra Matrikkelsystemet, - fra 30 minutters forsinkelse ved nedlasting av data i fritt valgt område fra kart, daglig for WMS og WFS, ukentlige for nedlasting av ferdiglagde filer og databaser (ny fil kun hvis det er skjedd endringer i Matrikkelen). Ved større endringer/lastinger kan forsinkelsen være større.",
                "owner": "Kartverket",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/74340c24-1c8a-4454-b813-bfe498e80f16"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "ede5ffb2-ee2a-44a3-852d-369a14d97f2e",
                "title": "FKB-BygnAnlegg",
                "description": "FKB-BygnAnlegg er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-BygnAnlegg beskriver bygningsmessige anlegg som ikke er spesifisert i andre fagspesifikke FKB-datasett som FKB-Bygning eller FKB-Veg. Dette inkluderer objekter som murer, gjerder, kaier, moloer, tanker etc.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/ede5ffb2-ee2a-44a3-852d-369a14d97f2e"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "39e022aa-c352-4351-b172-b980b03c578c",
                "title": "Dybdedata - terrengmodeller 25 meters grid",
                "description": "Datasettet viser terrengvariasjoner på havbunnen. Terrengmodellene har blitt produsert av innsamlede sjømålingsdata av høy kvalitet. Dekningsområdet er avhengig av kartleggingen i forbindelse med MAREANO programmet. MAREANO har kartlagt havområdene utenfor Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Barentshavet øst og ellers utvalgte områder ved Svalbard. Dekningsområdet utvides kontinuerlig etterhvert som nye områder blir kartlagt. Oppløsningen på terrengmodellene er 25m x 25m. Terrengmodellene tilbys i UTM sone 33 og geografisk WGS84. Det innebærer at enkelte kartdata ikke ligger i den UTM-sonen som dekker det aktuelle området.",
                "owner": "Kartverket",
                "updated": "2026-02-26T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/39e022aa-c352-4351-b172-b980b03c578c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "7f854c3d-4c65-4581-ab94-087a76564ee2",
                "title": "Vernskog",
                "description": "I henhold til Skogbruksloven § 12, anses skog som vernskog når den tjener til vern for annen skog eller gir vern mot naturskader. Det samme gjelder områder opp mot fjellet, mot nord eller ut mot havet der skogen er sårbar og kan bli ødelagt ved feil skogbehandling.\n\nDet er Statsforvalterens landbruksavdeling som har ansvar for forskrift og kartlegging av vernskoggrensene. Vernskog er samlet inn og er tilgjengelig for de områdene hvor data er sendt inn digitalt av Statsforvalterens landbruksavdelingen. Landbruksdirektoratet er nasjonal koordinator og fagmyndighet.",
                "owner": "Landbruksdirektoratet",
                "updated": "2014-11-13T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/7f854c3d-4c65-4581-ab94-087a76564ee2"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "2c47f033-b877-4885-a0ea-50333afd8fab",
                "title": "Trafikkulykker",
                "description": "NVDB Trafikkulykker er et datasett som skal beskrive alle trafikkulykker de siste 5 kalenderårene med personskader eller større materielle skader.",
                "owner": "Statens vegvesen",
                "updated": "2025-10-21T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/2c47f033-b877-4885-a0ea-50333afd8fab"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Energi"
            ],
            "runOnDataset": {
                "datasetId": "f587a15a-c72a-4b21-aae9-4132df1bdd27",
                "title": "Vannkraft, Utbygd og ikke utbygd",
                "description": "Dette datasettet inneholder vannkraft systemet slik det forvaltes av NVE. I NVEs forvaltningssystem behandles også dammer til andre formål enn vannkraftproduksjon. Regulerte innsjøer påvirker vassdragene uavhengig av formål, og de er derfor også med i våre forvaltningssystemer. Datasettet innbefatter alle dammer og regulerte innsjøer uavhengig av formål. Spesifikasjonen omfatter både anlegg i drift og ikke i drift. NVE behandler søknader om konsesjon etter energiloven og/eller vassdragslovgivningen til bygging av vannkraft og andre anlegg i vassdragene.  De ikke utbygde anlegg omfatter prosjekter behandlet i vassdragskonsesjonsprosessen og restpotensialet som ikke er konsesjonssøkt.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": "2026-03-09T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/f587a15a-c72a-4b21-aae9-4132df1bdd27"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "697a5338-d92c-49f5-9dba-2e356d9f18d7",
                "title": "Reindrift - Samebyrettsavgjørelse",
                "description": "Samebyrettsavgjørelse viser grenser for svenske reineieres (samebyers) beiteområder i Norge, fastsatt i rettsavgjørelser. Samebyer i Sverige er økonomiske og administrative enheter med eget styre, i likhet med reinbeitedistrikter i Norge.\nDatasettet anbefales brukt sammen med to andre datasett som viser svenske reineieres rettigheter i Norge, “Reindrift - Konvensjonsområde” og “Reindrift - Samebyavtale”.\nReindrift er en nomadisk næring med en syklisk veksling mellom beiter tilpasset reinens krav i den enkelte årstid. Årlige variasjoner i blant annet vær- og beiteforhold gjør at bruken av årstidsbeitene vil variere i både tid og utstrekning fra år til år.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/697a5338-d92c-49f5-9dba-2e356d9f18d7"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Plan"
            ],
            "runOnDataset": {
                "datasetId": "f50f228a-9482-4821-97df-41166c1f5a9b",
                "title": "Statlige planretningslinjer for differensiert forvaltning av strandsonen langs sjøen",
                "description": "Tjenesten/datasettet viser statlige planretningslinjer for differensiert forvaltning av strandsonen langs sjøen. Planretningslinjen gjelder i 100-metersbeltet innenfor kystkonturen. Forbud mot tiltak i strandsonen er utdypet med Statlige planretningslinjer for differensiert forvaltning av strandsonen langs sjøen. Datasettet viser hvor strengt forbudet skal håndheves i den enkelte kommune.\nDatasettet er ikke juridisk, men er et planrelevant datasett og inngår i DOK. Det skal brukes til se hvilken sone den enkelte kommune ligger i når det gjelder håndheving av forbudet mot bygging i strandsonen.",
                "owner": "Kommunal- og distriktsdepartementet",
                "updated": "2025-03-11T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/f50f228a-9482-4821-97df-41166c1f5a9b"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "71240e94-f915-4da0-9225-7840625b6a17",
                "title": "Aktsomhetskart svakhetssoner i fjell",
                "description": "Aktsomhetskart svakhetssoner i fjell viser områder hvor det er sannsynlig eller mindre sannsynlig at det forekommer svakhetssoner i fjellet, som er forårsaket av leiromvandling. Kartet er et hjelpemiddel ved planlegging av tunneler, fjellhaller og lignende anlegg i fjell. Kartet viser fire klasser basert på sannsynlighet for at det skal forekomme svakhetssoner i fjell. \nKartet er utarbeidet ved å samtolke (korrelere) magnetiske data målt fra fly og helikopter og digital terrengmodell. Der begge disse datasettene viser lave verdier, kan det indikere dypforvitrede soner som kan forårsake problemer under anleggsfase og etter ferdigstilling av et utbyggingstiltak. Datasettet er ikke landsdekkende. Det nye aktsomhetskartet dekker kystområdene i Sør-Norge og store deler av Midt-Norge.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2024-09-04T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/71240e94-f915-4da0-9225-7840625b6a17"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Energi"
            ],
            "runOnDataset": {
                "datasetId": "ac249604-cd82-490c-83cc-9cd24fe18088",
                "title": "Vindkraftverk",
                "description": "Datasettet gir en samlet  oversikt over konsesjonspliktige vindkraftverk som NVE har ferdigbehandlet eller som er under behandling. Dataene gir også en oversikt over konsesjonspliktige vindkraftverk som er helt eller delvis bygget og idriftsatt.",
                "owner": "Norges vassdrags- og energidirektorat",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/ac249604-cd82-490c-83cc-9cd24fe18088"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "b7f89a26-75af-4ab8-9c78-8b232cfb4e5c",
                "title": "Forsvarets skyte- og øvingsfelt i sjø",
                "description": "Datasettet Skyte- og øvingsfelt (SØF) i sjø viser skyte- og øvingsområder som Forsvaret bruker til sjøs. Forsvarets skyte- og øvingsfelt er tilrettelagte områder hvor Forsvaret kan skyte, øve og trene operasjoner i alle dimensjoner; luftrom, overflate og under vann. \n\nDatasettet viser eksisterende og nye skyte- og øvingsfelt (SØF) i høringsforslag av 13.sept. 2021 til ny forskrift om skyte- og øvingsfelt i sjø.\n\nDatasettet Forsvarets skyte- og øvingsfelt i sjø – anbefalt avviklet viser skytefelt som i høringsforslag av 13.sept. 2021 har status anbefalt avviklet.\n\nDatasettet inneholder den geografiske avgrensningen av feltene på overflaten. Datasettet beskriver ikke fare-/restriksjonsområder for luftfarten, som kan avvike fra skytefeltets geografiske representasjon på overflaten.",
                "owner": "Forsvarsbygg",
                "updated": "2025-01-30T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/b7f89a26-75af-4ab8-9c78-8b232cfb4e5c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "900206a8-686f-4591-9394-327eb02d0899",
                "title": "Forenklet Elveg 2.0",
                "description": "Forenklet Elveg 2.0 er en forenklet utgave av vegnettsdatasettet Elveg 2.0 og inneholder kun veglenkegeometri og vegsperringer. Dette datasettet erstatter Vbase. Det omfatter alle kjørbare veger som er lengre enn 50 meter, eller er en del av et nettverk, samt gang- og sykkelveger og sykkelveger representert som veglenkegeometri. Fortau, gangveger og gangfelt som tidligere fantes i FKB-TraktorvegSti skal også bli en del av Forenklet Elveg 2.0 i løpet av 2022. Forenklet Elveg 2.0 er en eksport fra Nasjonal vegdatabank (NVDB) og ajourholdes av Statens vegvesen og Kartverket.  Leveranse består av lands-, fylkes- og kommunevise filer. Oppdateres og utgis ukentlig.",
                "owner": "Kartverket",
                "updated": "2026-03-05T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/900206a8-686f-4591-9394-327eb02d0899"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "17adbcac-bbb2-4efc-ab51-756573c8f178",
                "title": "Kulturminner - Kulturmiljøer",
                "description": "Datasettet \"Kulturminner – kulturmiljøer\" dekker freda kulturmiljøer, Kulturmiljø og landskap av lokal interesse,  Kulturmiljøer og landskap av nasjonal interesse, Kulturmiljø og landskap av regional interesse og verdensarvområder.\n\nFor beskrivelser og definisjoner av de ulike kategoriene kulturmilijøer, se https://register.geonorge.no/sosi-kodelister/kulturminner/kulturmilj%C3%B8kategori",
                "owner": "Riksantikvaren",
                "updated": "2026-03-05T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/17adbcac-bbb2-4efc-ab51-756573c8f178"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "05a9cb73-639e-48ab-8533-bd80521a84bf",
                "title": "Reindrift - Restriksjonsområde",
                "description": "Datasettet avgrenser områder innenfor det samiske reinbeiteområdet hvor retten til å drive reindrift er begrenset på grunn av særlige rettsforhold.\n\nReindriftskartene er utarbeidet som et samarbeid mellom Landbruksdirektoratet, Statsforvalteren og det enkelte reinbeitedistrikt. Reindriftens arealbruk er dynamisk slik at datasettet ikke er fullstendig, men gjenstand for fortløpende revisjon.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/05a9cb73-639e-48ab-8533-bd80521a84bf"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Friluftsliv"
            ],
            "runOnDataset": {
                "datasetId": "91e31bb7-356f-4478-bcba-d5c2de6e91bc",
                "title": "Friluftslivsområder - kartlagte",
                "description": "Datasettet viser områder som er kartlagt og verdsatt etter metodikken i Miljødirektoratets Veileder M98-2013 (Tidligere DN håndbok 25 – 2004 Kartlegging og verdsetting av friluftslivsområder). Formålet med datasettet er å gi en oversikt over områder som er viktige for allmennhetens friluftsliv, og at det skal være lett å redegjøre for hvilke vurderinger og kriterier som er lagt til grunn for arbeidet og det ferdige produktet.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/91e31bb7-356f-4478-bcba-d5c2de6e91bc"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "49efb2b2-93e3-4175-b10b-65b509d73c2a",
                "title": "Reindrift - Konsesjonsområde",
                "description": "Datasettet konsesjonsområde avgrenser områder utenfor det samiske reinbeiteområdet der det er gitt en særskilt tillatelse til å utøve reindrift etter reindriftslovens § 8. Dette gjelder både samisk og ikke-samisk reindrift.\nDet er avgrenset konsesjonsområder hvor driftsform er forskjellig mellom konsesjonsområdene i tamreinlag (fire områder), konsesjonsområdet Rendalen renselskap og konsesjonsområdet Trollheimen. Datasettet beskriver ikke den forskjellige driftsformen, men avgrenser kun områdene.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/49efb2b2-93e3-4175-b10b-65b509d73c2a"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Eiendom"
            ],
            "runOnDataset": {
                "datasetId": "e77e6fdc-591d-4b1b-91b2-bd9d13fb33b7",
                "title": "Matrikkelen, Norges offisielle eiendomsregister",
                "description": "Matrikkelen er Norges offisielle register over fast eiendom, herunder bygninger, boliger/bruksenheter og offisielle adresser.\nMatrikkelen er regulert av matrikkelloven som trådte i kraft 1.1.2010 og erstattet den tidligere delingsloven. \n\nMatrikkelen inkluderer også data fra tinglysingen, folkeregisteret, enhetsregisteret, grunnforurensing og kulturminner.",
                "owner": "Kartverket",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e77e6fdc-591d-4b1b-91b2-bd9d13fb33b7"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "cf8ccec7-9505-4d84-94a9-eac9c69971d3",
                "title": "Marin grense",
                "description": "Marin grense angir det høyeste nivået som havet nådde etter siste istid. Informasjon om marin grense er sentral i arbeidet med å avgrense områder med marine leirer i Norge. Marin grense angir høyeste nivået for marint avsatte sedimenter på land. Problemstillinger som involverer slike avsetninger kan utelukkes over marin grense, hvilket er viktig informasjon i bl.a. offentlig planarbeid. For eksempel kan kvikkleire og skred i hav- og fjordavsetninger som marin leire kun forekomme under marin grense. Videre kan grunnvannskvaliteten under marin grense være påvirket av relikt saltvann, og leire kan begrense utbredelsen av akviferer. Informasjon vedrørende tidligere havnivå er også av betydning for forståelsen av landskapsutvikling generelt.\n\nDataene består av punktregistreringer, linjer samt polygoner. Linjer og polygoner er modellert fra punktene og en 10 m terrengmodell. Terrengmodellen som er benyttet i analysen har oppløsning (rutenettstørrelse) på 10x10 meter, og er hentet fra hoydedata.no. Terrengmodellen er generert ut fra de detaljerte laserdata som var tilgjengelig høsten 2020, supplert med høydedata fra 2013-utgaven av DTM10 for områder uten dekning. Datasettet er landsdekkende.",
                "owner": "Norges geologiske undersøkelse",
                "updated": "2024-01-23T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/cf8ccec7-9505-4d84-94a9-eac9c69971d3"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "41f6b000-c394-41c5-8ebb-07a0a3ec914f",
                "title": "Arealressurskart - AR50 - Arealtyper",
                "description": "Arealtype er et kartlag eller egenskap med egne presentasjonsregler i det landsdekkende datasettet AR50. Det viser hovedtyper av arealessurser tilpasset bruk i målestokker fra 1:20 000 til 1:100 000. \nArealtype er en inndeling i åtte arealressursklasser. Egenskap/kolonne i datasettet som skal brukes til å fremstille kartlaget heter ARTYPE i SOSI-format og arealtype i gml og gdb-format. Lovlige egenskapverdier i henhold til kodelisten er: 10 - Bebygd og samferdsel; 20 - Jordbruksareal; 30 - Skog; 50 - Snaumark; 60 - Myr; 70 - SnøIsbre; 81 - Ferskvann; 82 - Hav; 99 - Ikke kartlagt. \n\nFor mer informasjon om datasettet AR50, les om Arealressurskart - AR50 Serie på https://kartkatalog.geonorge.no/metadata/arealressurskart-ar50-serie/4bc2d1e0-f693-4bf2-820d-c11830d849a3",
                "owner": "Norsk institutt for bioøkonomi",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/41f6b000-c394-41c5-8ebb-07a0a3ec914f"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Kyst og fiskeri"
            ],
            "runOnDataset": {
                "datasetId": "31edb985-138e-46a7-a910-a0c1cd9baf4c",
                "title": "Korallrev",
                "description": "Kartet viser dokumenterte og stedfestede korallrev av steinkorallen Lophelia pertusa (Desmophyllum pertusum).\nForekomstene av korallrev er angitt som punkter på kart. Disse utgjør verdifull informasjon som beslutningsgrunnlag ved vurdering av nye oppdrettskonsesjoner, utslipp i sjø, deponering, utbygging av petroleumsrelaterte installasjoner, og regulering av fiskeriaktivitet.\n\nFor mer informasjon om korallrev se: https://www.mareano.no/tema/kaldtvannskoraller/korallrev-1\n\nVisning på MAREANO kartportal: https://kart.mareano.no/mareano/mareanoPolar.html?#maps/7555",
                "owner": "Havforskningsinstituttet",
                "updated": "2026-03-04T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/31edb985-138e-46a7-a910-a0c1cd9baf4c"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Friluftsliv"
            ],
            "runOnDataset": {
                "datasetId": "e08ad2cb-3262-4a78-bc58-2f3b5c5ccfd2",
                "title": "Friluftslivsområder - statlig sikra",
                "description": "Datasettet viser områder som er sikra for allmenne friluftslivsformål ved statlig hjelp. Dette innebærer at staten v/ Miljødirektoratet har skaffet seg råderett over arealet. Råderetten kan ha form av at området er kjøpt av staten, ved at området omfattes av en langsiktig avtale om bruksrett (servituttavtale) eller ved at staten sitter med en tinglyst erklæring om bruk til friluftslivsformål.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e08ad2cb-3262-4a78-bc58-2f3b5c5ccfd2"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Friluftsliv"
            ],
            "runOnDataset": {
                "datasetId": "d1422d17-6d95-4ef1-96ab-8af31744dd63",
                "title": "Turrutebasen",
                "description": "Landsdekkende datasett som viser turruter. Datasettet inneholder fotruter, skiløyper, sykkelruter, andre turruter og tilretteleggingstiltak i friluftslivsområder. Dataene kan brukes i prosesser etter plan- og bygningsloven (kommuneplanlegging og saksbehandlingsom for eksempel byggesak) i kommunene, til analyser, rapportering, oppslag og visualisering av turruter til turplanlegging.",
                "owner": "Kartverket",
                "updated": "2026-03-08T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/d1422d17-6d95-4ef1-96ab-8af31744dd63"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "00828ff6-b1e4-4916-9d65-50199e293c1e",
                "title": "Reindrift - Siidaområde",
                "description": "Datasettet avgrenser siidaer i det samiske reinbeiteområdet. En siida er en gruppe av reineiere som utøver reindrift i fellesskap på bestemte arealer. Det finnes sommersiidaer og vintersiidaer. De siste årene har det vært i underkant av 100 sommersiidaer, og om lag 150 vintersiidaer i det samiske reinbeiteområdet. En siida består av en eller flere siidaandeler, hvor hver siidaandel har en ansvarlig leder.",
                "owner": "Landbruksdirektoratet",
                "updated": "2026-02-02T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/00828ff6-b1e4-4916-9d65-50199e293c1e"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "ceef6c79-27ea-4e3e-895d-33d2a64763bf",
                "title": "Eksplosivanlegg",
                "description": "Datasettet Eksplosivanlegg viser anlegg hvor eksplosive varer tilvirkes eller oppbevares, og  som har tillatelse fra Direktoratet for samfunnssikkerhet og beredskap (DSB) , se §§ 6.1 og 7.1 i Eksplosivforskriften. Merk at dette ikke omfatter Forsvarets anlegg. Datasettet gis bare ut til bruk i kommunal og regional beredskap, arealplanlegging og byggesaksbehandling og bare ved direkte henvendelse til DSB ved kart@dsb.no.",
                "owner": "Direktoratet for samfunnssikkerhet og beredskap",
                "updated": null,
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/ceef6c79-27ea-4e3e-895d-33d2a64763bf"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Friluftsliv"
            ],
            "runOnDataset": {
                "datasetId": "fbdfd588-c24e-4e4c-95ba-e3be9bf401a0",
                "title": "Friluftslivsområder - vernede",
                "description": "Datasettet viser friluftslivsområder som er vernet etter Lov om naturområder i Oslo og nærliggende kommuner (markaloven) § 11.\n\nFormålet med vernet er generelt å bevare naturopplevelsesverdier som gjør områdene særskilt verdifulle for friluftslivet. En forskrift for hvert område beskriver nærmere formål, avgrensning, vernebestemmelser mv.\n\nVernede friluftslivsområder ligger i Oslo og Nordre Follo kommuner.",
                "owner": "Miljødirektoratet",
                "updated": "2021-01-01T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/fbdfd588-c24e-4e4c-95ba-e3be9bf401a0"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "e106adf4-c9d8-4fce-a9b5-7886a4126d23",
                "title": "Norges maritime grenser",
                "description": "Norges maritime grenser er en samlebetegnelse for grenser og soner i havområder som inngår i Norges lover og forskrifter. Grensene og områdene er sammenstilt i et offisielt vektordatasett som dekker områdene Fastlands-Norge, Jan Mayen og Svalbard, samt Bouvetøya.",
                "owner": "Kartverket",
                "updated": "2025-04-11T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/e106adf4-c9d8-4fce-a9b5-7886a4126d23"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
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
                "datasetId": "8e01b0fb-476b-4b7f-8c16-60fcfb2df508",
                "title": "Anadrome laksefisk - Strekninger",
                "description": "Datasettet viser samlet utbredelse av anadrome laksefisk (laks, sjøørret og sjørøye) i vassdrag som har bestander av disse. Datasettet har både flate- og linjegeometri. Flatelaget er sammenstilt med utgangspunkt i bestandsflater for hver av de tre aktuelle artene (laks, sjøørret og sjørøye), i målestokk 1:5000.  For at datasettet skal brukes effektivt i vannforvaltningen er linjelaget produsert med utgangspunkt i NVEs elvenettverk i målestokk 1:50000. På grunn av dette vil de anadrome strekningene se forskjellig ut i kartet, særlig der det er tale om sideelver/sidebekker.  Noen anadrome strekninger vil heller ikke vises i linjelaget.  \n\nAnadrome laksefisk (laks, sjøørret og sjørøye) finnes i mange vassdrag i landet. Vassdragene i dette datasettet anses å føre anadrome laksefisk. Datasettet omfatter hovedelv, sideelver og innsjøer så langt opp som anadrome laksefisk forekommer. \n \nForvaltningen av anadrome laksefisk er bestandsrettet. I datasettet er begrepet bestand brukt for gruppen individ av samme art som lever innenfor et avgrenset område og som tilhører en felles genetisk gruppe, som oftest ett vassdrag. I noen vassdrag vil det være flere bestander av samme art.\n \nDet forekommer anadrome laksefisk i vassdrag som ikke er del av datasettet. Statsforvalteren kan vedta at et vassdrag skal anses for å føre anadrome laksefisk, jf. lakse- og innlandsfiskloven § 31 første ledd, bokstav e.\n\nAlle nasjonale laksevassdrag er fullstendig dekket i datasettet. Oppdatering med data for øvrige vassdrag med anadrome laksefisk vil skje fortløpende.",
                "owner": "Miljødirektoratet",
                "updated": "2022-11-04T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/8e01b0fb-476b-4b7f-8c16-60fcfb2df508"
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
            "runOnInputGeometry": null,
            "buffer": 0,
            "runAlgorithm": [],
            "inputGeometryArea": null,
            "hitArea": null,
            "resultStatus": "NOT-IMPLEMENTED",
            "distanceToObject": 0,
            "rasterResult": {
                "imageUri": null,
                "mapUri": null
            },
            "cartography": null,
            "data": [],
            "themes": [
                "Basis geodata"
            ],
            "runOnDataset": {
                "datasetId": "cc3a2d98-52ac-4699-9947-ed0625903de4",
                "title": "FKB-TraktorvegSti",
                "description": "FKB-TraktorvegSti er en del av Felles Kartdatabase (FKB). FKB er en samling datasett som utgjør en sentral del av grunnkartet. Se metadataoppføring for Felles Kartdatabase for mer info.\n\nFKB-TraktorvegSti er et landsdekkende FKB-datasett som inneholder traktorveger, stier og stitrapp med senterlinjegeometri.\n\nFKB-TraktorvegSti må sees i sammenheng med Elveg 2.0 som inneholder øvrig vegnett og som forvaltes i Nasjonal vegdatabank (NVDB). Sammen med vegnettet fra NVDB skal FKB-TraktorvegSti kunne danne et komplett samferdselsnettverk for kjørende, syklende og gående.\n\nDatagrunnlaget i FKB-TraktorvegSti vil ha svært varierende grad av nettverkstopologi. Man må regne med å gjøre en jobb med sammenknytning av FKB-TraktorvegSti og Elveg 2.0 før dette kan betraktes som ett nettverk og benyttes i nettverksanalyser.\n\nFKB-data er ikke-sensistive og åpne data. FKB-dataene er finansiert gjennom Geovekst-samarbeidet, eller kommunene alene for kommuner som står utenfor Geovekst. FKB-dataene er fritt tilgjengelige for Norge digitalt parter og kan lastes ned gjennom nedlastingsløsningen på Geonorge. Private aktører må kjøpe tilgang til dataene gjennom en forhandler.",
                "owner": "Geovekst",
                "updated": "2026-03-06T00:00:00",
                "datasetDescriptionUri": "https://kartkatalog.geonorge.no/metadata/cc3a2d98-52ac-4699-9947-ed0625903de4"
            },
            "description": null,
            "guidanceText": null,
            "guidanceUri": [],
            "possibleActions": [],
            "qualityMeasurement": [],
            "qualityWarning": []
        }
    ],
    "inputGeometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    253604.27,
                    6649088.55
                ],
                [
                    253595.58,
                    6649107.92
                ],
                [
                    253586.48,
                    6649128.21
                ],
                [
                    253576.21,
                    6649151.44
                ],
                [
                    253570.79,
                    6649169.65
                ],
                [
                    253568.23,
                    6649176.54
                ],
                [
                    253549.54,
                    6649225.2
                ],
                [
                    253513.21,
                    6649208.66
                ],
                [
                    253549.09,
                    6649115.7
                ],
                [
                    253513.68,
                    6649090.96
                ],
                [
                    253528.24,
                    6649069.39
                ],
                [
                    253543.04,
                    6649047.45
                ],
                [
                    253559.81,
                    6649058.19
                ],
                [
                    253570.94,
                    6649061.71
                ],
                [
                    253579.21,
                    6649056.08
                ],
                [
                    253601.8,
                    6649022.94
                ],
                [
                    253603.08,
                    6649021.06
                ],
                [
                    253593.9,
                    6649009.25
                ],
                [
                    253626.7,
                    6649029.3
                ],
                [
                    253610.04,
                    6649025.2
                ],
                [
                    253594.88,
                    6649049.29
                ],
                [
                    253579.83,
                    6649073.12
                ],
                [
                    253604.27,
                    6649088.55
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
    "inputGeometryArea": 8630.86,
    "municipalityNumber": "3201",
    "municipalityName": "Bærum",
    "report": null,
    "factSheetRasterResult": {
        "imageUri": null,
        "mapUri": null
    },
    "factSheetCartography": null,
    "factList": []
}