import { useResponse } from 'context';
import { isEmptyObject } from 'utils/helpers';
import PointIcon from 'assets/gfx/icon-point.svg?react';
import AreaIcon from 'assets/gfx/icon-area.svg?react'
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react'
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react'
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react'
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed-2.svg?react'
import styles from './ResponseHeader.module.scss';

export default function ResponseHeader({ response, statusFilters, onStatusFilterSelected }) {
    const { busy } = useResponse();
    const resultList = response.resultList || {};
    const disabled = busy || isEmptyObject(response);

    function getCount(resultStatuses) {
        if (disabled) {
            return '-';
        }

        return resultStatuses.reduce((accumulator, resultStatus) => {
            const grouping = resultList[resultStatus];
            return grouping ? accumulator + grouping.length : accumulator + 0;
        }, 0);
    }

    return (
        <div className={styles.responseHeader}>
            {
                !disabled && (
                    <div className={styles.inputArea}>
                        <span>Analyseområde</span>
                        <h2>{response.municipalityName}</h2>

                        <div>
                            <span>
                                <PointIcon />
                                {response.municipalityNumber}
                            </span>
                            <span>
                                <AreaIcon />
                                {Math.round(response.inputGeometryArea).toLocaleString('nb-NO')} m²
                            </span>
                        </div>
                    </div>
                )
            }

            <div className={styles.cards}>
                <div className={styles.card}>
                    <input
                        id="must-handle"
                        type="checkbox"
                        name="mustHandle"
                        checked={statusFilters.includes('mustHandle')}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="must-handle" className={styles.mustHandle}>
                        <div className={styles.heading}>
                            <MustHandleIcon />
                            Må håndteres
                        </div>
                        <span className={styles.count}>{getCount(['HIT-RED'])}</span>
                    </label>
                </div>

                <div className={styles.card}>
                    <input
                        id="must-check"
                        type="checkbox"
                        name="mustCheck"
                        checked={statusFilters.includes('mustCheck')}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="must-check" className={styles.mustCheck}>
                        <div className={styles.heading}>
                            <MustCheckIcon />
                            Må sjekkes
                        </div>
                        <span className={styles.count}>{getCount(['HIT-YELLOW', 'NO-HIT-YELLOW', 'ERROR', 'NOT-IMPLEMENTED'])}</span>
                    </label>
                </div>

                <div className={styles.card}>
                    <input
                        id="nearby"
                        type="checkbox"
                        name="nearby"
                        checked={statusFilters.includes('nearby')}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="nearby" className={styles.nearby}>
                        <div className={styles.heading}>
                            <NearbyIcon />
                            I nærheten
                        </div>
                        <span className={styles.count}>{getCount(['NO-HIT-GREEN'])}</span>
                    </label>
                </div>

                <div className={styles.card}>
                    <input
                        id="not-analyzed"
                        type="checkbox"
                        name="notAnalyzed"
                        checked={statusFilters.includes('notAnalyzed')}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="not-analyzed" className={styles.notAnalyzed}>
                        <div className={styles.heading}>
                            <NotAnalyzedIcon />
                            Ikke analysert
                        </div>
                        <span className={styles.count}>{getCount(['NOT-RELEVANT'])}</span>
                    </label>
                </div>
            </div>
        </div >
    );
}