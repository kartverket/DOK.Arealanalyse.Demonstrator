import { api } from '@/lib/api/api';
import store from '@/app/store';

import type { AnalysisJob, JobStatus } from '@/types/api.types';

const POLL_INTERVAL_MS = 1500;
const MAX_DURATION_MS = 30 * 60 * 1000;
const MAX_CONSECUTIVE_ERRORS = 3;
const FINAL_STATUSES: JobStatus[] = ['successful', 'failed', 'dismissed'];

interface PollJobOptions {
    signal: AbortSignal;
    onUpdate: (job: AnalysisJob) => void;
}

export class JobTimeoutError extends Error {}

// Henter jobbstatusen via web-API-et til jobben er ferdig, har feilet eller er avbrutt
export default async function pollJob(
    jobId: string,
    { signal, onUpdate }: PollJobOptions,
): Promise<AnalysisJob> {
    const deadline = Date.now() + MAX_DURATION_MS;
    let errorCount = 0;

    while (true) {
        await wait(POLL_INTERVAL_MS, signal);

        try {
            const job = await store
                .dispatch(
                    api.endpoints.getJob.initiate(jobId, {
                        subscribe: false,
                        forceRefetch: true,
                    }),
                )
                .unwrap();

            signal.throwIfAborted();
            errorCount = 0;
            onUpdate(job);

            if (FINAL_STATUSES.includes(job.status)) {
                return job;
            }
        } catch (error) {
            signal.throwIfAborted();

            // Enkeltstående feil (f.eks. nettverksbrudd) skal ikke stoppe analysen
            if (++errorCount >= MAX_CONSECUTIVE_ERRORS) {
                throw error;
            }
        }

        if (Date.now() > deadline) {
            throw new JobTimeoutError(
                `Jobben ${jobId} ble ikke ferdig innen tidsfristen`,
            );
        }
    }
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(signal.reason);
            return;
        }

        const timeoutId = setTimeout(() => {
            signal.removeEventListener('abort', handleAbort);
            resolve();
        }, ms);

        function handleAbort() {
            clearTimeout(timeoutId);
            reject(signal.reason);
        }

        signal.addEventListener('abort', handleAbort, { once: true });
    });
}
