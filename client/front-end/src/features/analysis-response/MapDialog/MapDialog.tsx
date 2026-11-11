import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@digdir/designsystemet-react';
import { setMapDialogOpen, setMapDialogResultId } from '../responseSlice';
import { ResultStatus } from '../constants';
import ResultMapView from '../Result/MapView/MapView';
import ResultHeading from '../Result/Heading/Heading';
import ResultStatusAndThemes from '../Result/StatusAndThemes/StatusAndThemes';
import Dialog from '@/components/Dialog/Dialog';
import Legend from '@/components/Map/Legend/Legend';
import { MapControl } from '@/components/Map/Map.constants';
import { ArrowDownIcon, ArrowUpIcon, XMarkIcon } from '@navikt/aksel-icons';
import type { ResultStatus as ResultStatusValue } from '@/types/api.types';
import styles from './MapDialog.module.scss';

export default function MapDialog() {
    const selectedResultId = useAppSelector(state => state.response.mapDialog.resultId);
    const selectedResult = useAppSelector(state => selectedResultId !== null ? state.response.results.byId[selectedResultId] : undefined);
    const filteredResultIds = useAppSelector(state => state.response.filteredResultIds);
    const mapDialogOpen = useAppSelector(state => state.response.mapDialog.open);
    const selectedResultIdRef = useRef<string | null>(null);
    const dispatch = useAppDispatch();

    useEffect(
        () => {
            selectedResultIdRef.current = selectedResultId;
        },
        [selectedResultId]
    );

    function goPrevious() {
        const index = filteredResultIds.indexOf(selectedResultIdRef.current!);
        let prevId;

        if (index === 0) {
            prevId = filteredResultIds[filteredResultIds.length - 1];
        } else {
            prevId = filteredResultIds[index - 1];
        }

        dispatch(setMapDialogResultId(prevId));
    }

    function goNext() {
        const index = filteredResultIds.indexOf(selectedResultIdRef.current!);
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

    function getStatusClassName(status: ResultStatusValue) {
        switch (status) {
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
                    <div className={`${styles.content} ${getStatusClassName(selectedResult.status)}`}>
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
                                    {filteredResultIds.indexOf(selectedResult.id) + 1} av {filteredResultIds.length} treff
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