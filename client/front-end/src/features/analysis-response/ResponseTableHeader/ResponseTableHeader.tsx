import { StatusFilter } from '../constants';
import ThemeSelector from './ThemeSelector/ThemeSelector';
import { toggleFactInfo } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button, Search } from '@digdir/designsystemet-react';
import DownloadIcon from '@/assets/gfx/icon-download.svg?react';
import FactInfoIcon from '@/assets/gfx/icon-fact-info.svg?react';
import MustCheckIcon from '@/assets/gfx/icon-must-check.svg?react';
import MustHandleIcon from '@/assets/gfx/icon-must-handle.svg?react';
import NearbyIcon from '@/assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from '@/assets/gfx/icon-not-analyzed.svg?react';
import styles from './ResponseTableHeader.module.scss';

interface ResponseTableHeaderProps {
    statusFilters: StatusFilter[];
    themes: string[];
    selectedThemes: string[];
    searchTerm: string;
    onStatusFilterSelected: (filter: StatusFilter) => void;
    onThemeSelected: (themes: string[]) => void;
    onSearchChange: (searchTerm: string) => void;
}

export default function ResponseTableHeader({
    statusFilters,
    themes,
    selectedThemes,
    searchTerm,
    onStatusFilterSelected,
    onThemeSelected,
    onSearchChange,
}: ResponseTableHeaderProps) {
    const busy = useAppSelector((state) => state.app.busy);
    const data = useAppSelector((state) => state.response.data);
    const dispatch = useAppDispatch();
    const disabled = busy || data === null;

    function hasFactInfo() {
        return (
            data !== null &&
            Array.isArray(data.factList) &&
            data.factList.length > 0
        );
    }

    function hasReport() {
        return data !== null && typeof data.report === 'string';
    }

    function openFactInfo() {
        dispatch(toggleFactInfo(true));
    }

    return (
        <div className={styles.tableHeader}>
            <div className={styles.statusFilters}>
                <div className={styles.filter}>
                    <input
                        id="must-handle-f"
                        type="checkbox"
                        name={StatusFilter.MUST_HANDLE}
                        checked={statusFilters.includes(
                            StatusFilter.MUST_HANDLE,
                        )}
                        onChange={() =>
                            onStatusFilterSelected(StatusFilter.MUST_HANDLE)
                        }
                        disabled={disabled}
                    />

                    <label
                        htmlFor="must-handle-f"
                        className={styles.mustHandle}
                    >
                        <MustHandleIcon
                            width="14"
                            stroke="#F04438"
                        />
                        Må håndteres
                    </label>
                </div>

                <div className={styles.filter}>
                    <input
                        id="must-check-f"
                        type="checkbox"
                        name={StatusFilter.MUST_CHECK}
                        checked={statusFilters.includes(
                            StatusFilter.MUST_CHECK,
                        )}
                        onChange={() =>
                            onStatusFilterSelected(StatusFilter.MUST_CHECK)
                        }
                        disabled={disabled}
                    />

                    <label
                        htmlFor="must-check-f"
                        className={styles.mustCheck}
                    >
                        <MustCheckIcon
                            width="14"
                            stroke="#F79009"
                        />
                        Må sjekkes
                    </label>
                </div>

                <div className={styles.filter}>
                    <input
                        id="nearby-f"
                        type="checkbox"
                        name={StatusFilter.NEARBY}
                        checked={statusFilters.includes(StatusFilter.NEARBY)}
                        onChange={() =>
                            onStatusFilterSelected(StatusFilter.NEARBY)
                        }
                        disabled={disabled}
                    />

                    <label
                        htmlFor="nearby-f"
                        className={styles.nearby}
                    >
                        <NearbyIcon
                            width="14"
                            stroke="#12B76A"
                        />
                        I nærheten
                    </label>
                </div>

                <div className={styles.filter}>
                    <input
                        id="not-analyzed-f"
                        type="checkbox"
                        name={StatusFilter.NOT_ANALYZED}
                        checked={statusFilters.includes(
                            StatusFilter.NOT_ANALYZED,
                        )}
                        onChange={() =>
                            onStatusFilterSelected(StatusFilter.NOT_ANALYZED)
                        }
                        disabled={disabled}
                    />

                    <label
                        htmlFor="not-analyzed-f"
                        className={styles.notAnalyzed}
                    >
                        <NotAnalyzedIcon
                            width="14"
                            stroke="#344054"
                        />
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
                        onChange={(event) => onSearchChange(event.target.value)}
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
                    onClick={openFactInfo}
                    disabled={!hasFactInfo() || disabled}
                >
                    <FactInfoIcon aria-hidden />
                    Faktainformasjon
                </Button>

                <div
                    className={!hasReport() || disabled ? styles.disabled : ''}
                >
                    <Button
                        variant="secondary"
                        data-size="sm"
                        asChild
                    >
                        <a
                            href={data?.report ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                        >
                            <DownloadIcon aria-hidden />
                            Last ned rapport
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
