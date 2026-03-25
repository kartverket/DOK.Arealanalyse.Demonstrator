import { useSelector } from 'react-redux';
import { selectResults } from 'store/slices/responseSlice';
import { isEmptyObject } from 'utils/helpers';
import { ResultStatus, StatusFilter } from 'utils/constants';
import PointIcon from 'assets/gfx/icon-point.svg?react';
import AreaIcon from 'assets/gfx/icon-area.svg?react'
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react'
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react'
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react'
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed-2.svg?react'
import styles from './ResponseHeader.module.scss';

export default function ResponseHeader({ statusFilters, onStatusFilterSelected }) {
    const busy = useSelector(state => state.app.busy);
    const data = useSelector(state => state.response.data);
    const results = useSelector(selectResults);
    const disabled = busy || isEmptyObject(results);

    function getCount(resultStatuses) {
        if (disabled) {
            return '-';
        }

        return resultStatuses.reduce((accumulator, resultStatus) => {
            const grouping = results[resultStatus];
            return grouping ? accumulator + grouping.length : accumulator + 0;
        }, 0);
    }

    return (
        <div className={styles.responseHeader}>
            {
                !disabled && (
                    <div className={styles.inputArea}>
                        <span>Analyseområde</span>
                        <h2>{data.municipalityName}</h2>

                        <div>
                            <span>
                                <PointIcon />
                                {data.municipalityNumber}
                            </span>
                            <span>
                                <AreaIcon />
                                {Math.round(data.inputGeometryArea).toLocaleString('nb-NO')} m²
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
                        name={StatusFilter.MUST_HANDLE}
                        checked={statusFilters.includes(StatusFilter.MUST_HANDLE)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="must-handle" className={styles.mustHandle}>
                        <div className={styles.heading}>
                            <MustHandleIcon />
                            Må håndteres
                        </div>
                        <span className={styles.count}>{getCount([ResultStatus.HIT_RED])}</span>
                    </label>
                </div>

                <div className={styles.card}>
                    <input
                        id="must-check"
                        type="checkbox"
                        name={StatusFilter.MUST_CHECK}
                        checked={statusFilters.includes(StatusFilter.MUST_CHECK)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="must-check" className={styles.mustCheck}>
                        <div className={styles.heading}>
                            <MustCheckIcon />
                            Må sjekkes
                        </div>
                        <span className={styles.count}>
                            {
                                getCount([
                                    ResultStatus.HIT_YELLOW,
                                    ResultStatus.NO_HIT_YELLOW,
                                    ResultStatus.ERROR,
                                    ResultStatus.TIMEOUT,
                                    ResultStatus.NOT_IMPLEMENTED
                                ])
                            }
                        </span>
                    </label>
                </div>

                <div className={styles.card}>
                    <input
                        id="nearby"
                        type="checkbox"
                        name={StatusFilter.NEARBY}
                        checked={statusFilters.includes(StatusFilter.NEARBY)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="nearby" className={styles.nearby}>
                        <div className={styles.heading}>
                            <NearbyIcon />
                            I nærheten
                        </div>
                        <span className={styles.count}>{getCount([ResultStatus.NO_HIT_GREEN])}</span>
                    </label>
                </div>

                <div className={styles.card}>
                    <input
                        id="not-analyzed"
                        type="checkbox"
                        name={StatusFilter.NOT_ANALYZED}
                        checked={statusFilters.includes(StatusFilter.NOT_ANALYZED)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="not-analyzed" className={styles.notAnalyzed}>
                        <div className={styles.heading}>
                            <NotAnalyzedIcon />
                            Ikke analysert
                        </div>
                        <span className={styles.count}>{getCount([ResultStatus.NOT_RELEVANT])}</span>
                    </label>
                </div>
            </div>
        </div >
    );
}