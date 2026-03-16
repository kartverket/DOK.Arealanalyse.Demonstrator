import { inPlaceSort } from 'fast-sort';
import { capitalizeFirstLetter } from 'utils/helpers';

export function getThemes(resultList = {}) {
    const themes = [];

    Object.values(resultList).forEach(resultSet => {
        resultSet.forEach(result => {
            themes.push(...result.themes.map(capitalizeFirstLetter));
        });
    });

    themes.sort();

    return [... new Set(themes)];
}

export function filterResults(results, statusFilters, selectedThemes, searchTerm) {
    let filtered = [];

    if (statusFilters.includes('mustHandle')) {
        const resultsByStatus = getResultsByStatuses(results, ['HIT-RED']);
        filtered.push(...resultsByStatus)
    }

    if (statusFilters.includes('mustCheck')) {
        const resultsByStatus = getResultsByStatuses(results, [
            'HIT-YELLOW',
            'NO-HIT-YELLOW',
            'TIMEOUT',
            'ERROR',
            'NOT-IMPLEMENTED'
        ]);

        filtered.push(...resultsByStatus)
    }

    if (statusFilters.includes('nearby')) {
        const resultsByStatus = getResultsByStatuses(results, ['NO-HIT-GREEN']);
        filtered.push(...resultsByStatus)
    }

    if (statusFilters.includes('notAnalyzed')) {
        const resultsByStatus = getResultsByStatuses(results, ['NOT-RELEVANT']);
        filtered.push(...resultsByStatus)
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
