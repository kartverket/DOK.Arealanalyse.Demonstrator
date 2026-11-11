import { ResultStatus, StatusFilter } from '../constants';
import { capitalizeFirstLetter } from '@/lib/helpers';
import type { ResultStatus as ResultStatusValue } from '@/types/api.types';
import type { ResultGroupings, ResultItem } from '@/types/analysis.types';

export function getThemes(resultList: ResultGroupings = {}): string[] {
    const themes: string[] = [];

    Object.values(resultList).forEach(resultSet => {
        resultSet.forEach(result => {
            themes.push(...result.themes.map(capitalizeFirstLetter));
        });
    });

    themes.sort();

    return [...new Set(themes)];
}

export function getInitalStatusFilter(resultList: ResultGroupings): StatusFilter[] {
    if (getMustHandleResults(resultList).length) {
        return [StatusFilter.MUST_HANDLE];
    }

    if (getMustCheckResults(resultList).length) {
        return [StatusFilter.MUST_CHECK];
    }

    if (getNearbyResults(resultList).length) {
        return [StatusFilter.NEARBY];
    }

    if (getNotAnalyzedResults(resultList).length) {
        return [StatusFilter.NOT_ANALYZED];
    }

    return [];
}

export function filterResults(resultList: ResultGroupings, statusFilters: StatusFilter[], selectedThemes: string[], searchTerm: string): ResultItem[] {
    let filtered: ResultItem[] = [];

    if (statusFilters.includes(StatusFilter.MUST_HANDLE)) {
        const results = getMustHandleResults(resultList);
        filtered.push(...results)
    }

    if (statusFilters.includes(StatusFilter.MUST_CHECK)) {
        const results = getMustCheckResults(resultList);
        filtered.push(...results)
    }

    if (statusFilters.includes(StatusFilter.NEARBY)) {
        const results = getNearbyResults(resultList);
        filtered.push(...results)
    }

    if (statusFilters.includes(StatusFilter.NOT_ANALYZED)) {
        const results = getNotAnalyzedResults(resultList);
        filtered.push(...results)
    }

    filtered = filtered
        .filter(resultItem => resultItem.themes
            .some(theme => selectedThemes.includes(capitalizeFirstLetter(theme))));

    const normalized = searchTerm.trim().toLowerCase();

    if (normalized !== '') {
        filtered = filtered
            .filter(resultItem => {
                const title = resultItem.title ?? resultItem.datasetTitle ?? '';
                return title.toLowerCase().includes(normalized);
            });
    }

    return filtered;
}

function getResultsByStatuses(resultList: ResultGroupings, statuses: ResultStatusValue[]): ResultItem[] {
    const results: ResultItem[] = [];

    statuses.forEach(status => {
        const grouping = resultList[status];

        if (grouping) {
            results.push(...grouping)
        }
    });

    return results;
}

function getMustHandleResults(resultList: ResultGroupings) {
    return getResultsByStatuses(resultList, [ResultStatus.HIT_RED]);
}

function getMustCheckResults(resultList: ResultGroupings) {
    return getResultsByStatuses(resultList, [
        ResultStatus.HIT_YELLOW,
        ResultStatus.NO_HIT_YELLOW,
        ResultStatus.TIMEOUT,
        ResultStatus.ERROR,
        ResultStatus.NOT_IMPLEMENTED
    ]);
}

function getNearbyResults(resultList: ResultGroupings) {
    return getResultsByStatuses(resultList, [ResultStatus.NO_HIT_GREEN]);
}

function getNotAnalyzedResults(resultList: ResultGroupings) {
    return getResultsByStatuses(resultList, [ResultStatus.NOT_RELEVANT]);
}
