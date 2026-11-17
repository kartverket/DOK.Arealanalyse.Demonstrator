import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Cluster, Stack } from 'dibk-designsystemet/layout';
import { useGetJobQuery, useGetJobResultsQuery } from '@/lib/api/api';
import { useAppDispatch } from '@/app/hooks';
import { PATHS } from '@/app/paths';
import { JOB_UNAVAILABLE_TEXTS } from '@/features/analysis-jobs/constants';
import {
    formatDateTime,
    formatDuration,
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
import { Alert, Paragraph, Skeleton } from 'dibk-designsystemet';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import styles from './ResultPage.module.scss';

import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export default function ResultPage() {
    const { jobId = '' } = useParams();
    const dispatch = useAppDispatch();

    // Brukeren sendes hit når analysen er ferdig, så jobben trenger ikke å følges
    const {
        data: job,
        error: jobError,
        isLoading: jobLoading,
    } = useGetJobQuery(jobId);

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

        // F.eks. hvis brukeren åpner adressen til en analyse som ikke er fullført
        if (job.status !== 'successful') {
            return (
                <Alert data-color="warning">
                    {JOB_UNAVAILABLE_TEXTS[job.status]}
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
                    to={PATHS.analysis}
                    className={styles.backLink}
                >
                    <ArrowLeftIcon aria-hidden />
                    Til forsiden
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
