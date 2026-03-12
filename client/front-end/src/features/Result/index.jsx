import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'hooks';
import { getResultsByStatuses, getThemes, mapResultList } from './helpers';
import { ResultHeader, ResultTable, ResultTableHeader } from 'features';
import styles from './Result.module.scss';

export default function Result({ result }) {
    const [statusFilters, setStatusFilters] = useState(['mustHandle']);
    const [selectedThemes, setSelectedThemes] = useState(['Alle', ...getThemes(result.resultList)]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const themes = useMemo(() => getThemes(result.resultList), [result.resultList]);
    const mappedResults = useMemo(() => mapResultList(result.resultList), [result.resultList]);

    const filteredResult = useMemo(
        () => {
            let filtered = [];

            if (statusFilters.includes('mustHandle')) {
                const results = getResultsByStatuses(mappedResults, ['HIT-RED']);
                filtered.push(...results)
            }

            if (statusFilters.includes('mustCheck')) {
                const results = getResultsByStatuses(mappedResults, [
                    'HIT-YELLOW',
                    'NO-HIT-YELLOW',
                    'TIMEOUT',
                    'ERROR',
                    'NOT-IMPLEMENTED'
                ]);

                filtered.push(...results)
            }

            if (statusFilters.includes('nearby')) {
                const results = getResultsByStatuses(mappedResults, ['NO-HIT-GREEN']);
                filtered.push(...results)
            }

            if (statusFilters.includes('notAnalyzed')) {
                const results = getResultsByStatuses(mappedResults, ['NOT-RELEVANT']);
                filtered.push(...results)
            }

            filtered = filtered
                .filter(resultItem => resultItem.themes
                    .some(theme => selectedThemes.includes(theme)));

            const searchTerm = debouncedSearchTerm.trim().toLowerCase();

            if (searchTerm !== '') {
                filtered = filtered
                    .filter(resultItem => resultItem.description.toLowerCase().includes(searchTerm));
            }

            return filtered;
        },
        [statusFilters, selectedThemes, debouncedSearchTerm, mappedResults]
    );

    function handleStatusFilterSelected(filter) {
        const index = statusFilters.indexOf(filter);

        if (index === -1) {
            setStatusFilters([...statusFilters, filter]);
        } else {
            const clone = [...statusFilters]
            clone.splice(index, 1);
            setStatusFilters(clone);
        }
    }

    return (
        <div className={styles.result}>
            <ResultHeader
                result={result}
                statusFilters={statusFilters}
                onStatusFilterSelected={handleStatusFilterSelected}
            />

            <ResultTableHeader
                statusFilters={statusFilters}
                themes={themes}
                selectedThemes={selectedThemes}
                searchTerm={searchTerm}
                onStatusFilterSelected={handleStatusFilterSelected}
                onThemeSelected={setSelectedThemes}
                onSearchChange={setSearchTerm}
            />

            <ResultTable result={filteredResult} />
        </div>
    );
}