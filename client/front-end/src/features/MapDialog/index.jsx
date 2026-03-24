import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dialog, Heading } from '@digdir/designsystemet-react';
import styles from './MapDialog.module.scss';
import { setMapDialogOpen, setMapDialogResultId } from 'store/slices/responseSlice';
import { ArrowDownIcon, ArrowUpIcon, XMarkIcon } from '@navikt/aksel-icons';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import { RESULT_STATUS } from 'utils/constants';
import { MapView } from 'features';

export default function MapDialog() {
    const selectedResultId = useSelector(state => state.response.mapDialog.resultId);
    const selectedResult = useSelector(state => state.response.results.byId[selectedResultId]);
    const filteredResultIds = useSelector(state => state.response.filteredResultIds);
    const mapDialogOpen = useSelector(state => state.response.mapDialog.open);
    const selectedResultIdRef = useRef(null);
    const dispatch = useDispatch();
    const hitAreaOrDistance = getHitAreaOrDistance();

    useEffect(
        () => {
            selectedResultIdRef.current = selectedResultId;
        },
        [selectedResultId]
    );

    const goPrevious = useCallback(
        () => {
            const index = filteredResultIds.indexOf(selectedResultIdRef.current);
            let prevId;

            if (index === 0) {
                prevId = filteredResultIds[filteredResultIds.length - 1];
            } else {
                prevId = filteredResultIds[index - 1];
            }

            dispatch(setMapDialogResultId(prevId));
        },
        [dispatch, filteredResultIds]
    );

    const goNext = useCallback(
        () => {
            const index = filteredResultIds.indexOf(selectedResultIdRef.current);
            let nextId;

            if (index + 1 === filteredResultIds.length) {
                nextId = filteredResultIds[0];
            } else {
                nextId = filteredResultIds[index + 1];
            }

            dispatch(setMapDialogResultId(nextId));
        },
        [dispatch, filteredResultIds]
    );

    const close = useCallback(
        () => {
            dispatch(setMapDialogOpen(false));
            dispatch(setMapDialogResultId(null));
        },
        [dispatch]
    );

    function renderTitle() {
        return (
            <div className={styles.title}>
                {
                    selectedResult.title !== null ?
                        <>
                            <Heading level={5}>{selectedResult.datasetTitle}</Heading>
                            <Heading level={2} className={styles.title}>{selectedResult.title}</Heading>
                        </> :
                        <Heading level={2} className={styles.title}>{selectedResult.datasetTitle}</Heading>
                }
            </div>
        );
    }

    function renderStatus() {
        switch (selectedResult.status) {
            case RESULT_STATUS.HIT_RED:
                return (
                    <span className={styles.status}>
                        <MustHandleIcon />
                        Må håndteres
                    </span>
                );
            case RESULT_STATUS.HIT_YELLOW:
            case RESULT_STATUS.NO_HIT_YELLOW:
            case RESULT_STATUS.NOT_IMPLEMENTED:
            case RESULT_STATUS.TIMEOUT:
            case RESULT_STATUS.ERROR:
                return (
                    <span className={styles.status}>
                        <MustCheckIcon />
                        Må sjekkes
                    </span>
                );
            case RESULT_STATUS.NO_HIT_GREEN:
                return (
                    <span className={styles.status}>
                        <NearbyIcon />
                        I nærheten
                    </span>
                );
            case RESULT_STATUS.NOT_RELEVANT:
                return (
                    <span className={styles.status}>
                        <NotAnalyzedIcon />
                        Ikke analysert
                    </span>
                );
            default:
                return null;
        }
    }

    function getHitAreaOrDistance() {
        if (selectedResult === undefined) {
            return null;
        } else if (selectedResult.hitArea.formatted !== null) {
            return selectedResult.hitArea.formatted;
        } else if (selectedResult.distance.formatted !== null) {
            return selectedResult.distance.formatted;
        }

        return null;
    }

    return (
        <Dialog
            open={mapDialogOpen}
            onClose={close}
            className={styles.mapDialog}
            closeButton={false}
        >
            {/* <Heading>
                Kartvisning
            </Heading> */}

            {
                selectedResult !== undefined && (
                    <div className={styles.content}>
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

                        <div className={styles.heading}>
                            {renderTitle()}

                            {
                                hitAreaOrDistance !== null && (
                                    <div className={styles.hitAreaOrDistance}>
                                        {hitAreaOrDistance}
                                    </div>
                                )
                            }
                        </div>

                        <div className={styles.statusAndThemes}>
                            {renderStatus()}

                            <span className={styles.themes}>
                                {
                                    selectedResult.themes.map(theme => (
                                        <span key={theme} className={styles.theme}>{theme}</span>
                                    ))
                                }
                            </span>
                        </div>

                        <div className={styles.map}>
                            <MapView inputGeometry={selectedResult.data.runOnInputGeometry} result={selectedResult.data} />
                        </div>

                    </div>
                )
            }

        </Dialog>
    );
}