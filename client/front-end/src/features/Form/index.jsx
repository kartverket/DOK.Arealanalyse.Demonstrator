import { useRef, useState } from 'react';
import { Button, Checkbox, CircularProgress, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Paper, Select } from '@mui/material';
import { GeometryDialog } from 'features';
import { IntegerField } from 'components';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './Form.module.scss';

export default function Form({ fetching, onSubmit }) {
    const [state, setState] = useState(getDefaultValues());
    const geometryDialogRef = useRef(null);

    function getDefaultValues() {
        return {
            inputGeometry: null,
            requestedBuffer: 0,
            context: '',
            theme: '',
            includeGuidance: true,
            includeQualityMeasurement: true,
            includeFilterChosenDOK: false,
            includeFacts: true
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

    function handleSubmit() {
        const payload = getPayload();
        onSubmit(payload);
    }

    function canSubmit() {
        return !fetching && state.inputGeometry !== null;
    }

    function getPayload() {
        const inputs = { ...state };

        if (inputs.context === '') {
            inputs.context = null;
        }

        if (inputs.theme === '') {
            inputs.theme = null;
        }

        return {
            inputs
        };
    }

    return (
        <Paper sx={{ marginBottom: '24px' }}>
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
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!canSubmit()}
                        >
                            Start DOK-analyse
                        </Button>
                        {
                            fetching && <CircularProgress size={30} />
                        }
                    </div>
                </div>
            </div>
        </Paper>
    );
}