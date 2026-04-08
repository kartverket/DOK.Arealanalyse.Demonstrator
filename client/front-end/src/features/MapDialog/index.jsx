import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@digdir/designsystemet-react';
import { setMapDialogOpen, setMapDialogResultId } from 'store/slices/responseSlice';
import { ResultStatus } from 'utils/constants';
import { ResultMapView, ResultHeading, ResultStatusAndThemes } from 'features';
import { Dialog } from 'components';
import { Legend, MapControl } from 'components/Map';
import { ArrowDownIcon, ArrowUpIcon, XMarkIcon } from '@navikt/aksel-icons';
import styles from './MapDialog.module.scss';

export default function MapDialog() {
    const selectedResultId = useSelector(state => state.response.mapDialog.resultId);
    const selectedResult = useSelector(state => state.response.results.byId[selectedResultId]);
    const filteredResultIds = useSelector(state => state.response.filteredResultIds);
    const mapDialogOpen = useSelector(state => state.response.mapDialog.open);
    const selectedResultIdRef = useRef(null);
    const dispatch = useDispatch();

    useEffect(
        () => {
            selectedResultIdRef.current = selectedResultId;
        },
        [selectedResultId]
    );

    function goPrevious() {
        const index = filteredResultIds.indexOf(selectedResultIdRef.current);
        let prevId;

        if (index === 0) {
            prevId = filteredResultIds[filteredResultIds.length - 1];
        } else {
            prevId = filteredResultIds[index - 1];
        }

        dispatch(setMapDialogResultId(prevId));
    }

    function goNext() {
        const index = filteredResultIds.indexOf(selectedResultIdRef.current);
        let nextId;

        if (index + 1 === filteredResultIds.length) {
            nextId = filteredResultIds[0];
        } else {
            nextId = filteredResultIds[index + 1];
        }

        dispatch(setMapDialogResultId(nextId));
    }

    function close() {
        dispatch(setMapDialogOpen(false));
        dispatch(setMapDialogResultId(null));
    }

    function getStatusClassName() {
        switch (selectedResult.status) {
            case ResultStatus.HIT_RED:
                return styles.mustHandle;
            case ResultStatus.HIT_YELLOW:
            case ResultStatus.NO_HIT_YELLOW:
            case ResultStatus.NOT_IMPLEMENTED:
            case ResultStatus.TIMEOUT:
            case ResultStatus.ERROR:
                return styles.mustCheck;
            case ResultStatus.NO_HIT_GREEN:
                return styles.nearby;
            case ResultStatus.NOT_RELEVANT:
                return styles.notAnalyzed;
            default:
                return null;
        }
    }

    return (
        <Dialog
            open={mapDialogOpen}
            onClose={close}
            className={styles.mapDialog}
            closeButton={false}
        >
            {
                selectedResult !== undefined && (
                    <div className={`${styles.content} ${getStatusClassName()}`}>
                        <div className={styles.top}>
                            <div className={styles.left}>
                                <Button
                                    onClick={goPrevious}
                                    icon
                                    variant="secondary"
                                    title="Forrige"
                                    aria-label="Forrige"
                                >
                                    <ArrowUpIcon aria-hidden />
                                </Button>

                                <Button
                                    onClick={goNext}
                                    icon
                                    variant="secondary"
                                    title="Neste"
                                    aria-label="Neste"
                                >
                                    <ArrowDownIcon aria-hidden />
                                </Button>
                            </div>

                            <div className={styles.right}>
                                <div className={styles.hits}>
                                    {filteredResultIds.indexOf(selectedResultId) + 1} av {filteredResultIds.length} treff
                                </div>

                                <Button
                                    onClick={close}
                                    icon
                                    variant="tertiary"
                                    data-size="lg"
                                    title="Lukk"
                                    aria-label="Lukk"
                                    className={styles.close}
                                >
                                    <XMarkIcon aria-hidden />
                                </Button>
                            </div>
                        </div>

                        <div className={styles.map}>
                            <div className={styles.mapHeading}>
                                <ResultHeading
                                    result={selectedResult}
                                    className={styles.heading}
                                />

                                <ResultStatusAndThemes
                                    result={selectedResult}
                                    statusClassName={styles.status}
                                />
                            </div>

                            <ResultMapView
                                inputGeometry={selectedResult.data.runOnInputGeometry}
                                result={selectedResult.data}
                                controls={[
                                    MapControl.ZOOM,
                                    MapControl.ZOOM_TO_EXTENT
                                ]}
                                className={styles.mapView}
                            />

                            <Legend cartographyUri={selectedResult.data.cartography} />
                        </div>
                    </div>
                )
            }
        </Dialog>
    );
}