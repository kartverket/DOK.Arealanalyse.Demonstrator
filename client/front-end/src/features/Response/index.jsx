import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'hooks';
import { selectResults, setFilteredResultIds } from 'store/slices/responseSlice';
import { isEmptyObject } from 'utils/helpers';
import { filterResults, getInitalStatusFilter, getThemes } from './helpers';
import { ResponseHeader, ResponseTable, ResponseTableHeader } from 'features';
import styles from './Response.module.scss';

export default function Response() {
    const results = useSelector(selectResults);
    const [statusFilters, setStatusFilters] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const themes = useMemo(() => getThemes(results), [results]);
    const dispatch = useDispatch();

    const filteredResult = useMemo(
        () => filterResults(results, statusFilters, selectedThemes, debouncedSearchTerm),
        [statusFilters, selectedThemes, debouncedSearchTerm, results]
    );

    useEffect(
        () => {
            const ids = filteredResult.map(result => result.id);
            dispatch(setFilteredResultIds(ids));
        },
        [filteredResult, dispatch]
    );

    useEffect(
        () => {
            if (!isEmptyObject(results)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedThemes(['Alle', ...getThemes(results)]);
                setStatusFilters(getInitalStatusFilter(results));
            }
        },
        [results]
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
            <ResponseHeader
                statusFilters={statusFilters}
                onStatusFilterSelected={handleStatusFilterSelected}
            />

            <ResponseTableHeader
                statusFilters={statusFilters}
                themes={themes}
                selectedThemes={selectedThemes}
                searchTerm={searchTerm}
                onStatusFilterSelected={handleStatusFilterSelected}
                onThemeSelected={setSelectedThemes}
                onSearchChange={setSearchTerm}
            />

            <ResponseTable 
                resultList={filteredResult} 
            />
        </div>
    );
}