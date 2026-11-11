import { useEffect, useMemo, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { isEmptyObject } from '@/lib/helpers';
import ResponseHeader from '../ResponseHeader/ResponseHeader';
import { selectResults, setFilteredResultIds } from '../responseSlice';
import ResponseTable from '../ResponseTable/ResponseTable';
import ResponseTableHeader from '../ResponseTableHeader/ResponseTableHeader';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
    filterResults,
    getInitalStatusFilter,
    getThemes,
} from './Response.helpers';
import styles from './Response.module.scss';

import type { StatusFilter } from '../constants';

export default function Response() {
    const results = useAppSelector(selectResults);
    const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const themes = useMemo(() => getThemes(results), [results]);
    const dispatch = useAppDispatch();

    const filteredResult = useMemo(
        () =>
            filterResults(
                results,
                statusFilters,
                selectedThemes,
                debouncedSearchTerm,
            ),
        [statusFilters, selectedThemes, debouncedSearchTerm, results],
    );

    useEffect(() => {
        const ids = filteredResult.map((result) => result.id);
        dispatch(setFilteredResultIds(ids));
    }, [filteredResult, dispatch]);

    useEffect(() => {
        if (!isEmptyObject(results)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedThemes(['Alle', ...getThemes(results)]);
            setStatusFilters(getInitalStatusFilter(results));
        }
    }, [results]);

    function handleStatusFilterSelected(filter: StatusFilter) {
        const index = statusFilters.indexOf(filter);
        if (index === -1) {
            setStatusFilters([...statusFilters, filter]);
        } else {
            const clone = [...statusFilters];
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

            <ResponseTable resultList={filteredResult} />
        </div>
    );
}
