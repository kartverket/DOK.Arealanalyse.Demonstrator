import { useMemo, useState } from 'react';
import { useDebounce } from 'hooks';
import { useAnalyses } from 'context/AnalysesContext';
import { filterResults, getThemes } from './helpers';
import { ResultHeader, ResultTable, ResultTableHeader } from 'features';
import styles from './Result.module.scss';

export default function Result() {
    const analyses = useAnalyses();
    const result = analyses.result || {}
    const resultList = analyses.resultList || {};
    const [statusFilters, setStatusFilters] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState(['Alle', ...getThemes(resultList)]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const themes = useMemo(() => getThemes(resultList), [resultList]);

    const filteredResult = useMemo(
        () => filterResults(result, statusFilters, selectedThemes, debouncedSearchTerm),
        [statusFilters, selectedThemes, debouncedSearchTerm, result]
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