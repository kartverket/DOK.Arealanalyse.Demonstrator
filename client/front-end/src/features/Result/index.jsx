import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'hooks';
import { filterResults, getResultsByStatuses, getThemes, mapResultList } from './helpers';
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
        () => filterResults(mappedResults, statusFilters, selectedThemes, debouncedSearchTerm),
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
                result={result}
                statusFilters={statusFilters}
                themes={themes}
                selectedThemes={selectedThemes}
                searchTerm={searchTerm}
                onStatusFilterSelected={handleStatusFilterSelected}
                onThemeSelected={setSelectedThemes}
                onSearchChange={setSearchTerm}
            />

            <ResultTable 
                result={filteredResult} 
            />
        </div>
    );
}