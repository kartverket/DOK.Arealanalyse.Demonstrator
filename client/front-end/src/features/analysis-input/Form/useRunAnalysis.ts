import { useEffect, useRef } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import { analyzeStart, analyzeFinish, setToast } from '@/app/appSlice';
import { useAppDispatch, useAppStore } from '@/app/hooks';
import { PATHS } from '@/app/paths';
import { createPayload, isAnalysisJob } from './Form.helpers';
import pollJob, { JobTimeoutError } from '@/features/analysis-progress/pollJob';
import {
    resetProgress,
    setFetchingResults,
    updateJob,
} from '@/features/analysis-progress/progressSlice';
import mapResponse from '@/features/analysis-response/mapResponse';
import {
    setResponse,
    resetResponseState,
} from '@/features/analysis-response/responseSlice';

import type { AnalysisJob, AnalysisResponse } from '@/types/api.types';

export default function useRunAnalysis() {
    const store = useAppStore();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Stopper pollingen av en asynkron jobb når brukeren navigerer bort
        return () => abortControllerRef.current?.abort();
    }, []);

    async function runAnalysis() {
        dispatch(resetResponseState());
        dispatch(resetProgress());

        // Skjemaet leses først her, så komponenten slipper å abonnere på alle feltene
        const { formData, correlationId } = store.getState().app;
        const payload = createPayload(formData, correlationId);
        const controller = new AbortController();
        abortControllerRef.current = controller;

        let resultJobId: string | null = null;

        try {
            dispatch(analyzeStart());

            const { response, jobId } = await apiFetch(api.endpoints.analyze, {
                payload,
                respondAsync: formData.respondAsync,
            });

            // pygeoapi svarer synkront hvis process manageren ikke støtter asynkron kjøring
            const result = isAnalysisJob(response)
                ? await getJobResult(response, controller.signal)
                : response;

            if (result === null) {
                return;
            }

            resultJobId =
                jobId ?? (isAnalysisJob(response) ? response.jobID : null);

            if (resultJobId !== null) {
                // Resultatsiden henter da resultatet fra cachen i stedet for fra pygeoapi
                dispatch(
                    api.util.upsertQueryData(
                        'getJobResults',
                        resultJobId,
                        result,
                    ),
                );
            } else {
                // Uten jobb finnes ingen resultatside, så resultatet vises her
                dispatch(setResponse(mapResponse(result)));
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                console.log(error);
            }
        } finally {
            setTimeout(() => {
                dispatch(analyzeFinish());

                if (resultJobId !== null && !controller.signal.aborted) {
                    navigate(
                        generatePath(PATHS.result, { jobId: resultJobId }),
                    );
                }
            }, 500);
        }
    }

    async function getJobResult(
        job: AnalysisJob,
        signal: AbortSignal,
    ): Promise<AnalysisResponse | null> {
        dispatch(updateJob(job));

        let finishedJob: AnalysisJob;
        try {
            finishedJob = await pollJob(job.jobID, {
                signal,
                onUpdate: (updated) => dispatch(updateJob(updated)),
            });
        } catch (error) {
            if (!signal.aborted) {
                const message =
                    error instanceof JobTimeoutError
                        ? 'DOK-analysen ble ikke ferdig innen tidsfristen'
                        : 'Kunne ikke hente status for DOK-analysen';
                dispatch(setToast({ message }));
            }

            throw error;
        }

        if (finishedJob.status !== 'successful') {
            const message =
                finishedJob.status === 'dismissed'
                    ? 'DOK-analysen ble avbrutt'
                    : 'DOK-analysen feilet';
            dispatch(
                setToast({
                    message: finishedJob.message
                        ? `${message}: ${finishedJob.message}`
                        : message,
                }),
            );
            return null;
        }

        dispatch(setFetchingResults(true));

        return await apiFetch(api.endpoints.getJobResults, job.jobID, false);
    }

    return runAnalysis;
}
