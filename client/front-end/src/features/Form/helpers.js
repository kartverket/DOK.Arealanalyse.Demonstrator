import { createRandomId } from 'utils/helpers';
import { ResultStatus } from 'utils/constants';

export function mapResponse(response) {
    const { resultList } = response;

    return {
        id: createRandomId(),
        ...response,
        resultList: mapResultList(resultList)
    };
}

export function mapResultList(resultList) {
    return resultList.map(result => {
        return {
            id: createRandomId(),
            status: result.resultStatus,
            themes: result.themes,
            title: result.title,
            datasetTitle: result.runOnDataset?.title || null,
            preTitle: getPreTitle(result),
            distance: {
                value: result.distanceToObject,
                formatted: getDistanceFormatted(result)
            },
            hitArea: {
                value: result.hitArea,
                formatted: getHitAreaPercentFormatted(result)
            },
            data: result
        };
    });
}

function getPreTitle(result) {
    switch (result.resultStatus) {
        case ResultStatus.ERROR:
            return `Feil (${result.meta.statusCode})`;
        case ResultStatus.NOT_IMPLEMENTED:
            return 'Ikke implementert';
        default:
            return null;
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
