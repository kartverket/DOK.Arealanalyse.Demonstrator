import { useEffect, useRef } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { api, useGetDokTemaQuery } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import {
    analyzeStart,
    analyzeFinish,
    setFormData,
    setToast,
    type FormDataField,
} from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
import {
    Button,
    Checkbox,
    Field,
    Input,
    Label,
    Select,
} from 'dibk-designsystemet';
import styles from './Form.module.scss';

import type { AnalysisJob, AnalysisResponse } from '@/types/api.types';
import type { ChangeEvent } from 'react';

export default function Form() {
    const correlationId = useAppSelector((state) => state.app.correlationId);
    const formData = useAppSelector((state) => state.app.formData);
    const busy = useAppSelector((state) => state.app.busy);
    const { data: themes = [] } = useGetDokTemaQuery();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Stopper pollingen av en asynkron jobb når brukeren navigerer bort
        return () => abortControllerRef.current?.abort();
    }, []);

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) {
        const name = event.target.name;

        let value =
            event.target.type === 'checkbox'
                ? (event.target as HTMLInputElement).checked
                : event.target.value;
        if (name === 'requestedBuffer' && Number(value) < 0) {
            value = '0';
        }

        dispatch(setFormData({ name, value } as FormDataField));
    }

    function canSubmit() {
        return !busy && formData.inputGeometry !== null;
    }

    function resetState() {
        dispatch(resetResponseState());
        dispatch(resetProgress());
    }

    async function runAnalyses() {
        resetState();

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

    return (
        <section className={styles.form}>
            <div className={styles.input}>
                <div className={styles.row}>
                    <Field className={styles.buffer}>
                        <Label>Buffer</Label>
                        <Field.Affixes>
                            <Input
                                type="number"
                                min={0}
                                name="requestedBuffer"
                                value={formData.requestedBuffer}
                                onChange={handleChange}
                            />
                            <Field.Affix>meter</Field.Affix>
                        </Field.Affixes>
                    </Field>

                    <Field>
                        <Label>Bruksområde</Label>
                        <Select
                            name="context"
                            value={formData.context}
                            onChange={handleChange}
                        >
                            <Select.Option value="">
                                Velg bruksområde
                            </Select.Option>
                            <Select.Option value="Reguleringsplan">
                                Reguleringsplan
                            </Select.Option>
                            <Select.Option value="Kommuneplan">
                                Kommuneplan
                            </Select.Option>
                            <Select.Option value="Byggesak">
                                Byggesak
                            </Select.Option>
                        </Select>
                    </Field>

                    <Field>
                        <Label>Tema</Label>
                        <Select
                            name="theme"
                            value={formData.theme}
                            onChange={handleChange}
                        >
                            <Select.Option value="">Velg tema</Select.Option>
                            {themes.map((theme) => (
                                <Select.Option
                                    key={theme}
                                    value={theme}
                                >
                                    {theme}
                                </Select.Option>
                            ))}
                        </Select>
                    </Field>

                    <div className={styles.checkboxes}>
                        <Checkbox
                            name="includeGuidance"
                            checked={formData.includeGuidance}
                            onChange={handleChange}
                            label="Inkluder veiledning"
                        />

                        <Checkbox
                            name="includeFilterChosenDOK"
                            checked={formData.includeFilterChosenDOK}
                            onChange={handleChange}
                            label="Inkluder kun kommunens valgte DOK-data"
                        />

                        <Checkbox
                            name="includeQualityMeasurement"
                            checked={formData.includeQualityMeasurement}
                            onChange={handleChange}
                            label="Inkluder kvalitetsinformasjon"
                        />

                        <Checkbox
                            name="createBinaries"
                            checked={formData.createBinaries}
                            onChange={handleChange}
                            label="Lag kartbilder og PDF-rapport"
                        />

                        <Checkbox
                            name="includeFacts"
                            checked={formData.includeFacts}
                            onChange={handleChange}
                            label="Inkluder faktainformasjon"
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.submit}>
                        <Button
                            onClick={runAnalyses}
                            variant="primary"
                            disabled={!canSubmit()}
                        >
                            Start DOK-analyse
                        </Button>

                        <Checkbox
                            name="respondAsync"
                            checked={formData.respondAsync}
                            onChange={handleChange}
                            label="Kjør asynkront"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
