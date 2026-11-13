import type { AnalysisFormData } from '@/app/appSlice';
import type {
    AnalysisInputs,
    AnalysisJob,
    AnalysisPayload,
    AnalysisResponse,
} from '@/types/api.types';

export function isAnalysisJob(
    response: AnalysisResponse | AnalysisJob,
): response is AnalysisJob {
    return 'jobID' in response;
}

export function createPayload(
    formData: AnalysisFormData,
    correlationId: string | null,
): AnalysisPayload {
    const { respondAsync: _respondAsync, ...fields } = formData;

    const inputs: AnalysisInputs = {
        ...fields,
        requestedBuffer: parseInt(fields.requestedBuffer),
        context: fields.context !== '' ? fields.context : null,
        theme: fields.theme !== '' ? fields.theme : null,
        correlationId,
    };

    return {
        inputs,
    };
}
