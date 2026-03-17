import { RESULT_STATUS, STATUS_FILTER } from 'utils/constants';
import { capitalizeFirstLetter } from 'utils/helpers';

export function getThemes(resultList = {}) {
    const themes = [];

    Object.values(resultList).forEach(resultSet => {
        resultSet.forEach(result => {
            themes.push(...result.themes.map(capitalizeFirstLetter));
        });
    });

    themes.sort();

    return [...new Set(themes)];
}

export function getInitalStatusFilter(resultList) {
    if (getMustHandleResults(resultList).length) {
        return [STATUS_FILTER.MUST_HANDLE];
    }

    if (getMustCheckResults(resultList).length) {
        return [STATUS_FILTER.MUST_CHECK];
    }

    if (getNearbyResults(resultList).length) {
        return [STATUS_FILTER.NEARBY];
    }

    if (getNotAnalyzedResults(resultList).length) {
        return [STATUS_FILTER.NOT_ANALYZED];
    }

    return [];
}

export function filterResults(resultList, statusFilters, selectedThemes, searchTerm) {
    let filtered = [];

    if (statusFilters.includes(STATUS_FILTER.MUST_HANDLE)) {
        const results = getMustHandleResults(resultList);
        filtered.push(...results)
    }

    if (statusFilters.includes(STATUS_FILTER.MUST_CHECK)) {
        const results = getMustCheckResults(resultList);
        filtered.push(...results)
    }

    if (statusFilters.includes(STATUS_FILTER.NEARBY)) {
        const results = getNearbyResults(resultList);
        filtered.push(...results)
    }

    if (statusFilters.includes(STATUS_FILTER.NOT_ANALYZED)) {
        const results = getNotAnalyzedResults(resultList);
        filtered.push(...results)
    }

    filtered = filtered
        .filter(resultItem => resultItem.themes
            .some(theme => selectedThemes.includes(theme)));

    const normalized = searchTerm.trim().toLowerCase();

    if (normalized !== '') {
        filtered = filtered
            .filter(resultItem => resultItem.description.toLowerCase().includes(normalized));
    }

    return filtered;
}

function getResultsByStatuses(resultList, statuses) {
    const results = [];

    statuses.forEach(status => {
        const grouping = resultList[status];

        if (grouping) {
            results.push(...grouping)
        }
    });

    return results;
}

function getMustHandleResults(resultList) {
    return getResultsByStatuses(resultList, [RESULT_STATUS.HIT_RED]);
}

function getMustCheckResults(resultList) {
    return getResultsByStatuses(resultList, [
        RESULT_STATUS.HIT_YELLOW,
        RESULT_STATUS.NO_HIT_YELLOW,
        RESULT_STATUS.TIMEOUT,
        RESULT_STATUS.ERROR,
        RESULT_STATUS.NOT_IMPLEMENTED
    ]);
}

function getNearbyResults(resultList) {
    return getResultsByStatuses(resultList, [RESULT_STATUS.NO_HIT_GREEN]);
}

function getNotAnalyzedResults(resultList) {
    return getResultsByStatuses(resultList, [RESULT_STATUS.NOT_ANALYZED]);
}
