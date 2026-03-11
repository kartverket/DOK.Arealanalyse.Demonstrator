import { useDispatch, useSelector } from 'react-redux';
import { setStatusFilter } from 'store/slices/appSlice';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react'
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react'
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react'
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react'
import styles from './TableHeader.module.scss';

export default function TableHeader({ result }) {
    const statusFilters = useSelector(state => state.app.statusFilters);
    const dispatch = useDispatch();

    function handleFilterChecked(event) {
        const { name } = event.target;
        dispatch(setStatusFilter(name));
    }

    return (
        <div className={styles.tableHeader}>
            <div className={styles.statusFilters}>
                <div className={styles.filter}>
                    <input
                        id="must-handle-f"
                        type="checkbox"
                        name="mustHandle"
                        checked={statusFilters.includes('mustHandle')}
                        onChange={handleFilterChecked}
                    />

                    <label htmlFor="must-handle-f" className={styles.mustHandle}>
                        <MustHandleIcon width="14" stroke="#F04438" />
                        Må håndteres
                    </label>
                </div>

                <div className={styles.filter}>
                    <input
                        id="must-check-f"
                        type="checkbox"
                        name="mustCheck"
                        checked={statusFilters.includes('mustCheck')}
                        onChange={handleFilterChecked}
                    />

                    <label htmlFor="must-check-f" className={styles.mustCheck}>
                        <MustCheckIcon width="14" stroke="#F79009" />
                        Må sjekkes
                    </label>
                </div>

                <div className={styles.filter}>
                    <input
                        id="nearby-f"
                        type="checkbox"
                        name="nearby"
                        checked={statusFilters.includes('nearby')}
                        onChange={handleFilterChecked}
                    />

                    <label htmlFor="nearby-f" className={styles.nearby}>
                        <NearbyIcon width="14" stroke="#12B76A" />
                        I nærheten
                    </label>
                </div>

                <div className={styles.filter}>
                    <input
                        id="not-analyzed-f"
                        type="checkbox"
                        name="notAnalyzed"
                        checked={statusFilters.includes('notAnalyzed')}
                        onChange={handleFilterChecked}
                    />

                    <label htmlFor="not-analyzed-f" className={styles.notAnalyzed}>
                        <NotAnalyzedIcon width="14" stroke="#344054" />
                        Ikke analysert
                    </label>
                </div>
            </div>

            <div className={styles.themeFilter}>

            </div>

            <div className={styles.tableSearch}>

            </div>
        </div>
    )
}