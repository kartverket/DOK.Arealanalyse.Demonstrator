import { ResultStatus } from 'utils/constants';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import styles from './StatusAndThemes.module.scss';

export default function StatusAndThemes({ result, statusClassName = '' }) {
    function renderStatus() {
        switch (result.status) {
            case ResultStatus.HIT_RED:
                return (
                    <>
                        <MustHandleIcon />
                        Må håndteres
                    </>
                );
            case ResultStatus.HIT_YELLOW:
            case ResultStatus.NO_HIT_YELLOW:
            case ResultStatus.NOT_IMPLEMENTED:
            case ResultStatus.TIMEOUT:
            case ResultStatus.ERROR:
                return (
                    <>
                        <MustCheckIcon />
                        Må sjekkes
                    </>
                );
            case ResultStatus.NO_HIT_GREEN:
                return (
                    <>
                        <NearbyIcon />
                        I nærheten
                    </>
                );
            case ResultStatus.NOT_RELEVANT:
                return (
                    <>
                        <NotAnalyzedIcon />
                        Ikke analysert
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <div className={styles.statusAndThemes}>
            <span className={`${styles.status} ${statusClassName}`}>
                {renderStatus()}
            </span>

            <span className={styles.themes}>
                {
                    result.themes.map(theme => (
                        <span key={theme} className={styles.theme}>{theme}</span>
                    ))
                }
            </span>
        </div>
    );
}