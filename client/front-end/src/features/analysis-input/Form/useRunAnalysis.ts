import { useEffect, useRef } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import { analyzeStart, analyzeFinish, setToast } from '@/app/appSlice';
import { useAppDispatch, useAppSelector, useAppStore } from '@/app/hooks';
import { PATHS } from '@/app/paths';
import { createPayload, isAnalysisJob } from './Form.helpers';
import {
    resetProgress,
    setJobId,
} from '@/features/analysis-progress/progressSlice';
import { resetResponseState } from '@/features/analysis-response/responseSlice';

export default function useRunAnalysis() {
    const store = useAppStore();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const jobId = useAppSelector((state) => state.progress.jobId);

    // Satt fra brukeren starter en analyse til brukeren er sendt til siden for den
    const navigationPendingRef = useRef(false);

    useEffect(() => {
        if (jobId !== null && navigationPendingRef.current) {
            navigationPendingRef.current = false;
            navigate(generatePath(PATHS.result, { jobId }));
        }
    }, [jobId, navigate]);

    // Kjøringen er ikke knyttet til komponenten, så den fortsetter når brukeren sendes videre
    async function runAnalysis() {
        dispatch(resetResponseState());
        dispatch(resetProgress());
        navigationPendingRef.current = true;

        // Skjemaet leses først her, så komponenten slipper å abonnere på alle feltene
        const { formData, correlationId } = store.getState().app;
        const payload = createPayload(formData, correlationId);

        try {
            dispatch(analyzeStart());

            const { response, jobId: responseJobId } = await apiFetch(
                api.endpoints.analyze,
                {
                    payload,
                    respondAsync: formData.respondAsync,
                },
            );

            // Asynkron kjøring: resultatsiden henter status og resultat for jobben
            if (isAnalysisJob(response)) {
                dispatch(setJobId(response.jobID));
                return;
            }

            // Synkron kjøring: jobId kommer med fremdriften fra Socket.IO,
            // og med svaret hvis process manageren i pygeoapi lagrer jobber
            const resultJobId =
                responseJobId ?? store.getState().progress.jobId;
            if (resultJobId === null) {
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
            console.log(error);
        } finally {
            dispatch(analyzeFinish());
        }
    }

    return runAnalysis;
}
