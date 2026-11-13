import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Cluster, Stack } from 'dibk-designsystemet/layout';
import { api, useGetJobQuery, useGetJobResultsQuery } from '@/lib/api/api';
import { useAppDispatch } from '@/app/hooks';
import { PATHS } from '@/app/paths';
import {
    formatDateTime,
    formatDuration,
    isFinalJobStatus,
} from '@/features/analysis-jobs/helpers';
import JobStatusTag from '@/features/analysis-jobs/JobStatusTag/JobStatusTag';
import Drawer from '@/features/analysis-response/Drawer/Drawer';
import MapDialog from '@/features/analysis-response/MapDialog/MapDialog';
import mapResponse from '@/features/analysis-response/mapResponse';
import Response from '@/features/analysis-response/Response/Response';
import {
    resetResponseState,
    setResponse,
} from '@/features/analysis-response/responseSlice';
import FactInfo from '@/features/fact-info/FactInfo/FactInfo';
import { Alert, Paragraph, Skeleton, Spinner } from 'dibk-designsystemet';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import styles from './ResultPage.module.scss';

import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const POLLING_INTERVAL = 2_000;

export default function ResultPage() {
    const { jobId = '' } = useParams();
    const dispatch = useAppDispatch();

    // Jobben hentes på nytt til den er ferdig, f.eks. hvis brukeren åpner en analyse som kjører
    const { data: current } = api.endpoints.getJob.useQueryState(jobId);
    const running = current !== undefined && !isFinalJobStatus(current.status);

    const {
        data: job,
        error: jobError,
        isLoading: jobLoading,
    } = useGetJobQuery(jobId, {
        pollingInterval: running ? POLLING_INTERVAL : 0,
    });

    const {
        data: result,
        isLoading: resultLoading,
        isError: resultError,
    } = useGetJobResultsQuery(jobId, {
        skip: job?.status !== 'successful',
    });

    useEffect(() => {
        if (result) {
            dispatch(setResponse(mapResponse(result)));
        }

        // Resultatet skal ikke bli liggende igjen på forsiden
        return () => {
            dispatch(resetResponseState());
        };
    }, [result, dispatch]);

    function renderContent() {
        if (jobLoading || resultLoading) {
            return <Skeleton height="24rem" />;
        }

        if (jobError || !job) {
            return (
                <Alert data-color="danger">
                    {isNotFound(jobError)
                        ? 'Fant ikke DOK-analysen.'
                        : 'Kunne ikke hente DOK-analysen.'}
                </Alert>
            );
        }

        if (!isFinalJobStatus(job.status)) {
            return (
                <Alert data-color="info">
                    <div className={styles.pending}>
                        <Spinner
                            data-size="sm"
                            aria-hidden
                        />
                        DOK-analysen er ikke ferdig ennå. Resultatet vises når
                        den er ferdig.
                    </div>
                </Alert>
            );
        }

        if (job.status !== 'successful') {
            return (
                <Alert data-color="danger">
                    {job.status === 'dismissed'
                        ? 'DOK-analysen ble avbrutt.'
                        : 'DOK-analysen feilet.'}
                    {job.message && <Paragraph>{job.message}</Paragraph>}
                </Alert>
            );
        }

        if (resultError || !result) {
            return (
                <Alert data-color="danger">
                    Kunne ikke hente resultatet av DOK-analysen.
                </Alert>
            );
        }

        return (
            <>
                <Response key={jobId} />
                <Drawer />
                <MapDialog />
                <FactInfo />
            </>
        );
    }

    return (
        <Stack
            gap="lg"
            className={styles.resultPage}
        >
            <Cluster
                gap="md"
                align="baseline"
                justify="between"
                className={styles.header}
            >
                <Link
                    to={PATHS.results}
                    className={styles.backLink}
                >
                    <ArrowLeftIcon aria-hidden />
                    Alle resultater
                </Link>

                {job && (
                    <Cluster
                        gap="md"
                        align="baseline"
                        className={styles.meta}
                    >
                        <JobStatusTag status={job.status} />
                        <span>Opprettet {formatDateTime(job.created)}</span>
                        <span>Varighet {formatDuration(job)}</span>
                        <span className={styles.jobId}>{job.jobID}</span>
                    </Cluster>
                )}
            </Cluster>

            {renderContent()}
        </Stack>
    );
}

function isNotFound(
    error: FetchBaseQueryError | SerializedError | undefined,
): boolean {
    // Web-API-et svarer 422 hvis jobId ikke er en gyldig UUID
    return (
        error !== undefined &&
        'status' in error &&
        (error.status === 404 || error.status === 422)
    );
}
