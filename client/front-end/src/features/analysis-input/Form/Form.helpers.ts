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

// Tomt felt eller ugyldig verdi gir 0, og negative verdier tillates ikke
export function parseRequestedBuffer(value: string): number {
    return Math.max(0, parseInt(value) || 0);
}

export function createPayload(
    formData: AnalysisFormData,
    correlationId: string | null,
): AnalysisPayload {
    const { respondAsync: _respondAsync, ...fields } = formData;

    const inputs: AnalysisInputs = {
        ...fields,
        requestedBuffer: parseRequestedBuffer(fields.requestedBuffer),
        context: fields.context !== '' ? fields.context : null,
        theme: fields.theme !== '' ? fields.theme : null,
        correlationId,
    };

    return {
        inputs,
    };
}
