import { useDispatch, useSelector } from 'react-redux';
import { setStatusFilter } from 'store/slices/appSlice';
import PointIcon from 'assets/gfx/icon-point.svg?react';
import AreaIcon from 'assets/gfx/icon-area.svg?react'
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react'
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react'
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react'
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed-2.svg?react'
import styles from './ResultHeader.module.scss';

export default function ResultHeader({ result }) {
    const statusFilters = useSelector(state => state.app.statusFilters);
    const dispatch = useDispatch();

    function getCount(restultStatuses) {
        return restultStatuses.reduce((accumulator, resultStatus) => {
            const grouping = result.resultList[resultStatus];
            return grouping ? accumulator + grouping.length : accumulator + 0;
        }, 0);
    }

    function handleFilterChecked(event) {
        const { name } = event.target;
        dispatch(setStatusFilter(name));
    }

    return (
        <div className={styles.resultHeader}>
            <div className={styles.inputArea}>
                <span>Analyseområde</span>
                <h2>{result.municipalityName}</h2>

                <div>
                    <span>
                        <PointIcon />
                        {result.municipalityNumber}
                    </span>
                    <span>
                        <AreaIcon />
                        {Math.round(result.inputGeometryArea).toLocaleString('nb-NO')} m²
                    </span>
                </div>
            </div>

            <div className={styles.cards}>
                <div className={styles.card}>
                    <input
                        id="must-handle"
                        type="checkbox"
                        name="mustHandle"
                        checked={statusFilters.includes('mustHandle')}
                        onChange={handleFilterChecked}
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
                        onChange={handleFilterChecked}
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
                        onChange={handleFilterChecked}
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
                        onChange={handleFilterChecked}
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