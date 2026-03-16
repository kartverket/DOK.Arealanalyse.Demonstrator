import { inPlaceSort } from 'fast-sort';
import groupBy from 'lodash.groupby';

export function mapResponse(response) {
    const { resultList } = response;

    return {
        ...response,
        resultList: mapResultList(resultList)
    };
}

function mapResultList(resultList) {
    const grouped = groupBy(resultList, result => result.resultStatus);
    const mappedResultList = {};
    let index = 1;

    for (const [status, results] of Object.entries(grouped)) {
        const mappedResults = results.map(resultItem => {
            return {
                id: index++,
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

function getDescription(result) {
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

function getDistanceFormatted(result) {
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

function getHitAreaPercentFormatted(result) {
    if (result.hitArea === null || result.hitArea === 0) {
        return null;
    }

    const percent = (result.hitArea / result.inputGeometryArea) * 100;
    const rounded = Math.round((percent + Number.EPSILON) * 100) / 100;

    return `${rounded.toLocaleString('nb-NO')} %`
}

function createRandomId() {
    return `_${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`;
}
