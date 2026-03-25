import { forwardRef, useImperativeHandle, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setErrorMessage } from 'store/slices/appSlice';
import { convert, validate } from 'utils/api';
import { getFileType, parseJsonFile } from './helpers';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from '@mui/material';
import { HiddenInput, TabPanel } from 'components';
import MapView from './MapView';
import GeoJson from './GeoJson';
import styles from './GeometryDialog.module.scss';
import { useFetcher } from 'hooks';

const GeometryDialog = forwardRef(({ onOk }, ref) => {
    const [open, setOpen] = useState(false);
    const [geometry, setGeometry] = useState(null);
    const [selectedSample, setSelectedSample] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const { data: samples = [] } = useFetcher('/sample')
    const dispatch = useDispatch();

    useImperativeHandle(ref, () => ({
        reset: () => {
            setGeometry(null);
        }
    }));

    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose(event, reason) {
        if (reason && reason === 'backdropClick') {
            return;
        }

        setOpen(false);
    }

    function handleOk() {
        onOk(geometry);
        setOpen(false);
    }

    function handleTabChange(event, newValue) {
        setSelectedTab(newValue);
    }

    async function handleSampleSelect(event) {
        const value = event.target.value;
        setSelectedSample(value);

        const sample = samples.find(sample => sample.fileName === value);
        setGeometry(sample.geoJson);
        setSelectedFileName(sample.fileName);
    }

    async function handleAddFileChange(event) {
        const file = [...event.target.files][0];

        if (!file) {
            return;
        }

        const fileType = getFileType(file);
        let geoJson = null;

        if (fileType !== 'geojson') {
            geoJson = await convert(file, fileType);
        } else {
            geoJson = await parseJsonFile(file);
        }

        if (geoJson === null) {
            dispatch(setErrorMessage(`Kunne ikke prosessere «${file.name}»`));
            return;
        }

        const isValid = geoJson !== null && await validate(geoJson);

        if (!isValid) {
            dispatch(setErrorMessage(`Geometrien i «${file.name}» er ugyldig`));
        } else {
            setSelectedSample('');
            setSelectedFileName(file.name);
            setGeometry(geoJson);
        }
    }

    return (
        <div>
            <Button
                onClick={handleClickOpen}
                variant="outlined"
            >
                Analyseområde
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                sx={{
                    '& .MuiDialog-container': {
                        '& .MuiPaper-root': {
                            width: '100%',
                            maxWidth: '720px',
                        },
                    }
                }}
            >
                <DialogTitle>Analyseområde {selectedFileName !== '' ? `- ${selectedFileName}` : ''}</DialogTitle>

                <DialogContent>
                    <div className={styles.dialogContent}>
                        <div className={styles.contentTop}>
                            <div className={styles.uploadButton}>
                                <Button
                                    component="label"
                                    variant="contained"
                                    sx={{
                                        width: 200
                                    }}
                                >
                                    Legg til fil
                                    <HiddenInput type="file" onChange={handleAddFileChange} accept=".json, .geojson, .sos, .sosi, .gml" />
                                </Button>
                            </div>

                            <div className={styles.fileSelect}>
                                <FormControl fullWidth>
                                    <InputLabel id="select-file-label">Velg eksempel</InputLabel>
                                    <Select
                                        labelId="select-file-label"
                                        value={selectedSample}
                                        MenuProps={{
                                            sx: {
                                                '& .MuiMenuItem-root > div > span:last-child': {
                                                    maxWidth: '480px',
                                                    textWrap: 'auto'
                                                }
                                            }
                                        }}
                                        label="Velg eksempel"
                                        onChange={handleSampleSelect}
                                    >
                                        {
                                            samples.map(sample => (
                                                <MenuItem key={sample.fileName} value={sample.fileName}>
                                                    <div className={styles.menuItem}>
                                                        <span>{sample.name}</span>
                                                        <span>{sample.description}</span>
                                                    </div>
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        <Box className={styles.tabs}>
                            <Tabs value={selectedTab} onChange={handleTabChange}>
                                <Tab label="Kart" disabled={geometry === null} />
                                <Tab label="GeoJSON" disabled={geometry === null} />
                            </Tabs>
                        </Box>

                        <TabPanel value={selectedTab} index={0} className={styles.tabPanel}>
                            <MapView geometry={geometry} />
                        </TabPanel>

                        <TabPanel value={selectedTab} index={1} className={styles.tabPanel}>
                            <GeoJson data={geometry} />
                        </TabPanel>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Avbryt</Button>
                    <Button onClick={handleOk} disabled={geometry === null}>OK</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
});

GeometryDialog.displayName = 'GeometryDialog';

export default GeometryDialog;