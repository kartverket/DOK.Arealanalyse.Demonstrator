import { inPlaceSort } from 'fast-sort';
import { capitalizeFirstLetter } from 'utils/helpers';

export function getThemes(resultList) {
    const themes = [];

    Object.values(resultList).forEach(resultSet => {
        resultSet.forEach(result => {
            themes.push(...result.themes.map(capitalizeFirstLetter));
        });
    });

    themes.sort();

    return [... new Set(themes)];
}

export function mapResultList(resultList) {
    const mappedResultList = {};

    for (const [status, results] of Object.entries(resultList)) {
        const mappedResults = results.map(resultItem => {            
            return {
                _id: resultItem._tempId,
                status,
                themes: resultItem.themes,
                description: getDescription(resultItem),
                distance: {
                    value: resultItem.distanceToObject,
                    formatted: getDistanceFormatted(resultItem)
                },
                hitArea: {
                    value: resultItem.hitArea,
                    formatted: getHitAreaPercentFormatted(resultItem)
                },
                result: resultItem
            };
        });

        if (['HIT-RED', 'HIT-YELLOW'].includes(status)) {
            inPlaceSort(mappedResults).desc([
                result => result.hitArea.value || 0,
                result => result.themes[0]
            ]);
        } else if (['NO-HIT-YELLOW', 'NO-HIT-GREEN'].includes(status)) {
            inPlaceSort(mappedResults).asc([
                result => result.distance.value,
                result => result.themes[0]
            ]);
        } else if (['NOT-RELEVANT', 'NOT-IMPLEMENTED', 'TIMEOUT', 'ERROR'].includes(status)) {
            inPlaceSort(mappedResults).asc([
                result => result.themes[0],
                result => result.description
            ]);
        }

        mappedResultList[status] = mappedResults;
    }

    return mappedResultList;
}

export function getResultsByStatuses(resultList, statuses) {
    const results = [];

    statuses.forEach(status => {
        const grouping = resultList[status];

        if (grouping) {
            results.push(...grouping)
        }
    });

    return results;
}

export function getDescription(result) {
    const datasetTitle = result.runOnDataset ?
        `${result.runOnDataset.title}${result.title !== null ? `\r\n(${result.title})` : ''}` :
        result.title

    switch (result.resultStatus) {
        case 'TIMEOUT':
            return `Tidsavbrudd: ${datasetTitle}`;
        case 'ERROR':
            return `En feil har oppstått: ${datasetTitle}`;
        case 'NOT-IMPLEMENTED':
            return `Ikke implementert: ${datasetTitle}`;
        default:
            return datasetTitle;
    }
}

export function getDistanceFormatted(result) {
    if (result.distanceToObject === 0) {
        return null;
    }
    
    let distance = result.distanceToObject;

    if (distance >= 20_000) {
        distance = 20_000;
        return `> ${distance.toLocaleString('nb-NO')} m`
    }

    return `${distance.toLocaleString('nb-NO')} m`
}

export function getHitAreaPercentFormatted(result) {
    if (result.hitArea === null || result.hitArea === 0) {
        return null;
    }

    const percent = (result.hitArea / result.inputGeometryArea) * 100;
    const rounded = Math.round((percent + Number.EPSILON) * 100) / 100;

    return `${rounded.toLocaleString('nb-NO')} %`
}

