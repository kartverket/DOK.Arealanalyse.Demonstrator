import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'hooks';
import { useResponse } from 'context';
import { setFilteredResultIds } from 'store/slices/appSlice';
import { isEmptyObject } from 'utils/helpers';
import { filterResults, getInitalStatusFilter, getThemes } from './helpers';
import { ResponseHeader, ResponseTable, ResponseTableHeader } from 'features';
import styles from './Response.module.scss';

export default function Response() {
    const analyses = useResponse();
    const response = analyses.response || {}
    const resultList = response.resultList || {};
    const busy = analyses.busy;
    const [statusFilters, setStatusFilters] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const themes = useMemo(() => getThemes(resultList), [resultList]);
    const dispatch = useDispatch();

    const filteredResult = useMemo(
        () => filterResults(resultList, statusFilters, selectedThemes, debouncedSearchTerm),
        [statusFilters, selectedThemes, debouncedSearchTerm, resultList]
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
            if (!isEmptyObject(resultList)) {
                setSelectedThemes(['Alle', ...getThemes(resultList)]);
                setStatusFilters(getInitalStatusFilter(resultList));
            }
        },
        [resultList]
    );

    useEffect(
        () => {
            if (busy) {
                setSelectedThemes([]);
                setStatusFilters([]);
                setSearchTerm('');
            }
        },
        [busy]
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
                response={response}
                statusFilters={statusFilters}
                onStatusFilterSelected={handleStatusFilterSelected}
            />

            <ResponseTableHeader
                response={response}
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