import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import { analyzeStart, analyzeFinish, setToast } from '@/app/appSlice';
import { useAppDispatch, useAppStore } from '@/app/hooks';
import { createPayload, isAnalysisJob } from './Form.helpers';
import {
    closeProgressDialog,
    setJobId,
    startProgress,
} from '@/features/analysis-progress/progressSlice';
import { resetResponseState } from '@/features/analysis-response/responseSlice';

export default function useRunAnalysis() {
    const store = useAppStore();
    const dispatch = useAppDispatch();

    // Status-dialogen på forsiden følger analysen, og sender brukeren til resultatet når den er ferdig
    async function runAnalysis() {
        dispatch(resetResponseState());
        dispatch(startProgress());

        // Skjemaet leses først her, så komponenten slipper å abonnere på alle feltene
        const { formData, area, correlationId } = store.getState().app;
        const payload = createPayload(formData, area, correlationId);

        try {
            dispatch(analyzeStart());

            const { response, jobId: responseJobId } = await apiFetch(
                api.endpoints.analyze,
                {
                    payload,
                    respondAsync: formData.respondAsync,
                },
            );

            // Asynkron kjøring: status-dialogen henter status og resultat for jobben
            if (isAnalysisJob(response)) {
                dispatch(setJobId(response.jobID));
                return;
            }

            // Synkron kjøring: jobId kommer med fremdriften fra Socket.IO,
            // og med svaret hvis process manageren i pygeoapi lagrer jobber
            const resultJobId =
                responseJobId ?? store.getState().progress.jobId;
            if (resultJobId === null) {
                dispatch(closeProgressDialog());
                dispatch(
                    setToast({
                        message:
                            'Resultatet kan ikke vises, fordi pygeoapi ikke lagrer jobber',
                        type: 'warning',
                    }),
                );

                return;
            }

            // Resultatsiden henter da resultatet fra cachen i stedet for fra pygeoapi
            dispatch(
                api.util.upsertQueryData(
                    'getJobResults',
                    resultJobId,
                    response,
                ),
            );

            dispatch(setJobId(resultJobId));
        } catch (error) {
            // Feilen vises som toast
            dispatch(closeProgressDialog());
            console.log(error);
        } finally {
            dispatch(analyzeFinish());
        }
    }

    return runAnalysis;
}
