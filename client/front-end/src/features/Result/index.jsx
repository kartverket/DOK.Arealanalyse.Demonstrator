import { useDispatch } from 'react-redux';
import { setSelectedResultId } from 'store/slices/appSlice';
import { RESULT_STATUS } from 'utils/constants';
import { Button } from '@digdir/designsystemet-react';
import { ArrowDownIcon, ArrowUpIcon, ChevronRightDoubleIcon } from '@navikt/aksel-icons';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import styles from './Result.module.scss';


export default function Result({ result, resultIds }) {
    const dispatch = useDispatch();

    function getResultIndex() {
        return resultIds.indexOf(result.id);
    }

    function close() {
        dispatch(setSelectedResultId(0));
    }

    function goNext() {
        const index = getResultIndex();
        let nextId;

        if (index + 1 === resultIds.length) {
            nextId = resultIds[0];
        } else {
            nextId = resultIds[index + 1];
        }

        dispatch(setSelectedResultId(nextId));
    }

    function goPrevious() {
        const index = getResultIndex();
        let prevId;

        if (index === 0) {
            prevId = resultIds[resultIds.length - 1];
        } else {
            prevId = resultIds[index - 1];
        }

        dispatch(setSelectedResultId(prevId));
    }

    function renderTitle() {
        if (result.title !== null) {
            return (
                <>
                    <h5>{result.datasetTitle}</h5>
                    <h2 className={styles.title}>{result.title}</h2>
                </>
            );
        }

        return <h2 className={styles.title}>{result.datasetTitle}</h2>;
    }

    function renderStatus() {
        switch (result.status) {
            case RESULT_STATUS.HIT_RED:
                return (
                    <span className={`${styles.status} ${styles.mustHandle}`}>
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
                    <span className={`${styles.status} ${styles.mustCheck}`}>
                        <MustCheckIcon />
                        Må sjekkes
                    </span>
                );
            case RESULT_STATUS.NO_HIT_GREEN:
                return (
                    <span className={`${styles.status} ${styles.nearby}`}>
                        <NearbyIcon />
                        I nærheten
                    </span>
                );
            case RESULT_STATUS.NOT_RELEVANT:
                return (
                    <span className={`${styles.status} ${styles.notAnalyzed}`}>
                        <NotAnalyzedIcon />
                        Ikke analysert
                    </span>
                );
            default:
                return null;
        }
    }

    return (
        <div className={styles.result}>
            <div className={styles.top}>
                <div className={styles.navigation}>
                    <Button
                        onClick={close}
                        icon
                        variant="secondary"
                        aria-label="Lukk"
                    >
                        <ChevronRightDoubleIcon aria-hidden />
                    </Button>

                    <span className={styles.divider}></span>

                    <Button
                        onClick={goPrevious}
                        icon
                        variant="secondary"
                        aria-label="Forrige"
                    >
                        <ArrowUpIcon aria-hidden />
                    </Button>

                    <Button
                        onClick={goNext}
                        icon
                        variant="secondary"
                        aria-label="Neste"
                    >
                        <ArrowDownIcon aria-hidden />
                    </Button>
                </div>

                <div className={styles.hits}>
                    {getResultIndex() + 1} av {resultIds.length} treff
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.heading}>
                    {renderTitle()}
                    <div className={styles.areaOrDistance}></div>
                </div>

                <div className={styles.statusAndThemes}>
                    {renderStatus()}

                    <span className={styles.themes}>
                        {
                            result.themes.map(theme => (
                                <span key={theme} className={styles.theme}>{theme}</span>
                            ))
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}