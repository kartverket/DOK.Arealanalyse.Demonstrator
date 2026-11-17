import { useCallback, useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { skipToken } from '@reduxjs/toolkit/query';
import { api, useGetJobQuery, useGetJobResultsQuery } from '@/lib/api/api';
import { closeProgressDialog } from '../progressSlice';
import Progress from './Progress/Progress';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PATHS } from '@/app/paths';
import { JOB_UNAVAILABLE_TEXTS } from '@/features/analysis-jobs/constants';
import { isFinalJobStatus } from '@/features/analysis-jobs/helpers';
import Dialog from '@/components/Dialog/Dialog';
import { Alert, Button, Paragraph } from 'dibk-designsystemet';
import styles from './ProgressDialog.module.scss';

const POLLING_INTERVAL = 2_000;
const REDIRECT_SECONDS = 5;

// Følger analysen brukeren har startet, til resultatet kan vises
export default function ProgressDialog() {
    const dispatch = useAppDispatch();
    const open = useAppSelector((state) => state.progress.dialogOpen);
    const busy = useAppSelector((state) => state.app.busy);
    const jobId = useAppSelector((state) => state.progress.jobId);

    // Ved synkron kjøring hentes jobben når svaret er kommet.
    // Ved asynkron kjøring hentes den på nytt til den er ferdig.
    const jobArg = open && !busy && jobId !== null ? jobId : skipToken;
    const { data: current } = api.endpoints.getJob.useQueryState(jobArg);
    const running = current !== undefined && !isFinalJobStatus(current.status);

    const { data: job, isError: jobError } = useGetJobQuery(jobArg, {
        pollingInterval: running ? POLLING_INTERVAL : 0,
    });

    // Hentes før brukeren sendes videre, så resultatsiden kan vises med en gang.
    // Ved synkron kjøring ligger resultatet allerede i cachen.
    const {
        data: result,
        isLoading: resultLoading,
        isError: resultError,
    } = useGetJobResultsQuery(
        jobArg !== skipToken && job?.status === 'successful'
            ? jobArg
            : skipToken,
    );

    function handleClose() {
        dispatch(closeProgressDialog());
    }

    function renderFooter() {
        if (jobError || resultError) {
            return renderError(
                jobError
                    ? 'Kunne ikke hente status for DOK-analysen.'
                    : 'Kunne ikke hente resultatet av DOK-analysen.',
            );
        }

        if (job === undefined || !isFinalJobStatus(job.status)) {
            return null;
        }

        if (job.status !== 'successful') {
            return renderError(JOB_UNAVAILABLE_TEXTS[job.status], job.message);
        }

        return result && <ShowResultButton jobId={job.jobID} />;
    }

    function renderError(text: string, message?: string | null) {
        return (
            <>
                <Alert
                    data-color="danger"
                    className={styles.alert}
                >
                    {text}
                    {message && <Paragraph>{message}</Paragraph>}
                </Alert>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Lukk
                </Button>
            </>
        );
    }

    const footer = open ? renderFooter() : null;

    return (
        <Dialog
            open={open}
            closeButton={false}
            className={styles.progressDialog}
            aria-label="Status"
        >
            {open && (
                <>
                    <Progress
                        job={job}
                        fetchingResults={resultLoading}
                    />
                    {footer && <div className={styles.footer}>{footer}</div>}
                </>
            )}
        </Dialog>
    );
}

interface ShowResultButtonProps {
    jobId: string;
}

// Sender brukeren til resultatet når nedtellingen er ferdig, eller når knappen trykkes
function ShowResultButton({ jobId }: ShowResultButtonProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(REDIRECT_SECONDS);

    const showResult = useCallback(() => {
        dispatch(closeProgressDialog());
        navigate(generatePath(PATHS.result, { jobId }));
    }, [dispatch, navigate, jobId]);

    useEffect(() => {
        if (seconds === 0) {
            showResult();
            return;
        }

        const timeout = setTimeout(() => setSeconds(seconds - 1), 1_000);
        return () => clearTimeout(timeout);
    }, [seconds, showResult]);

    return <Button onClick={showResult}>Vis resultat ({seconds})</Button>;
}
