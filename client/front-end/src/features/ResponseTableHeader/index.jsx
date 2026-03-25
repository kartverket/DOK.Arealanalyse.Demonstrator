import { useSelector } from 'react-redux';
import { StatusFilter } from 'utils/constants';
import { Button, Search } from '@digdir/designsystemet-react';
import ThemeSelector from './ThemeSelector';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import FactInfoIcon from 'assets/gfx/icon-fact-info.svg?react';
import DownloadIcon from 'assets/gfx/icon-download.svg?react';
import styles from './ResponseTableHeader.module.scss';

export default function ResponseTableHeader({
    statusFilters, themes, selectedThemes, searchTerm, onStatusFilterSelected, onThemeSelected, onSearchChange }) {
    const busy = useSelector(state => state.app.busy);
    const data = useSelector(state => state.response.data);
    const disabled = busy || data === null;

    function hasFactInfo() {
        return data !== null && Array.isArray(data.factList) && data.factList.length > 0;
    }

    function hasReport() {
        return data !== null && typeof data.report === 'string';
    }

    return (
        <div className={styles.tableHeader}>
            <div className={styles.statusFilters}>
                <div className={styles.filter}>
                    <input
                        id="must-handle-f"
                        type="checkbox"
                        name={StatusFilter.MUST_HANDLE}
                        checked={statusFilters.includes(StatusFilter.MUST_HANDLE)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
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
                        name={StatusFilter.MUST_CHECK}
                        checked={statusFilters.includes(StatusFilter.MUST_CHECK)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
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
                        name={StatusFilter.NEARBY}
                        checked={statusFilters.includes(StatusFilter.NEARBY)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
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
                        name={StatusFilter.NOT_ANALYZED}
                        checked={statusFilters.includes(StatusFilter.NOT_ANALYZED)}
                        onChange={event => onStatusFilterSelected(event.target.name)}
                        disabled={disabled}
                    />

                    <label htmlFor="not-analyzed-f" className={styles.notAnalyzed}>
                        <NotAnalyzedIcon width="14" stroke="#344054" />
                        Ikke analysert
                    </label>
                </div>
            </div>

            <div className={styles.themeAndSearch}>
                <ThemeSelector
                    themes={themes}
                    selectedThemes={selectedThemes}
                    onThemeSelected={onThemeSelected}
                    disabled={disabled}
                />

                <Search>
                    <Search.Input
                        name="search"
                        value={searchTerm}
                        onChange={event => onSearchChange(event.target.value)}
                        aria-label="Søk i tabell"
                        placeholder="Søk i tabell"
                        width={320}
                        className={styles.search}
                        disabled={disabled}
                    />
                    <Search.Clear />
                </Search>
            </div>

            <div className={styles.buttons}>
                <Button
                    data-size="sm"
                    disabled={!hasFactInfo() || disabled}
                >
                    <FactInfoIcon aria-hidden />
                    Faktainformasjon
                </Button>
                <Button
                    variant="secondary"
                    data-size="sm"
                    disabled={!hasReport() || disabled}
                >
                    <DownloadIcon aria-hidden />
                    Last ned rapport
                </Button>
            </div>
        </div>
    )
}