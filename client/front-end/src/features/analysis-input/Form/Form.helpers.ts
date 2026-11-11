import { createRandomId } from '@/lib/helpers';
import { ResultStatus } from '@/features/analysis-response/constants';
import type { AnalysisFormData } from '@/app/appSlice';
import type { AnalysisInputs, AnalysisPayload, AnalysisResponse, AnalysisResult } from '@/types/api.types';
import type { MappedAnalysisResponse, ResultItem } from '@/types/analysis.types';

export function mapResponse(response: AnalysisResponse): MappedAnalysisResponse {
    const { resultList } = response;

    return {
        id: createRandomId(),
        ...response,
        resultList: mapResultList(resultList)
    };
}

export function createPayload(formData: AnalysisFormData, correlationId: string | null): AnalysisPayload {
    const inputs: AnalysisInputs = {
        ...formData,
        requestedBuffer: parseInt(formData.requestedBuffer),
        context: formData.context !== '' ? formData.context : null,
        theme: formData.theme !== '' ? formData.theme : null,
        correlationId
    };

    return {
        inputs
    };
}

function mapResultList(resultList: AnalysisResult[]): ResultItem[] {
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



function getPreTitle(result: AnalysisResult): string | null {
    switch (result.resultStatus) {
        case ResultStatus.ERROR:
            return `Feil (${result.meta.statusCode})`;
        case ResultStatus.NOT_IMPLEMENTED:
            return 'Ikke implementert';
        default:
            return null;
    }
}

function getDistanceFormatted(result: AnalysisResult): string | null {
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

function getHitAreaPercentFormatted(result: AnalysisResult): string | null {
    if (result.hitArea === null || result.hitArea === 0) {
        return null;
    }

    const percent = (result.hitArea / result.inputGeometryArea) * 100;
    const rounded = Math.round((percent + Number.EPSILON) * 100) / 100;

    return `${rounded.toLocaleString('nb-NO')} %`
}
