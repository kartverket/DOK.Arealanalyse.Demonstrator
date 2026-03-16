import { useAnalyses } from 'context/AnalysesContext';
import { isEmptyObject } from 'utils/helpers';
import { Button, Search } from '@digdir/designsystemet-react';
import ThemeSelector from './ThemeSelector';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import FactInfoIcon from 'assets/gfx/icon-fact-info.svg?react';
import DownloadIcon from 'assets/gfx/icon-download.svg?react';
import styles from './ResultTableHeader.module.scss';

export default function ResultTableHeader({
    result, statusFilters, themes, selectedThemes, searchTerm, onStatusFilterSelected, onThemeSelected, onSearchChange }) {
    const { busy } = useAnalyses();    
    const disabled = busy || isEmptyObject(result);

    function hasFactInfo() {
        return Array.isArray(result.factList) && result.factList.length > 0;
    }

    function hasReport() {
        return typeof result.report === 'string';
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
                        name="mustCheck"
                        checked={statusFilters.includes('mustCheck')}
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
                        name="nearby"
                        checked={statusFilters.includes('nearby')}
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
                        name="notAnalyzed"
                        checked={statusFilters.includes('notAnalyzed')}
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