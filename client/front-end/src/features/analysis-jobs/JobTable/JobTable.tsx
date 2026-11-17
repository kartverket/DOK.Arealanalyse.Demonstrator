import { useState, type MouseEvent } from 'react';
import { generatePath, Link, useNavigate } from 'react-router';
import { formatDateTime, formatDuration } from '../helpers';
import JobStatusDialog from '../JobStatusDialog/JobStatusDialog';
import JobStatusTag from '../JobStatusTag/JobStatusTag';
import { PATHS } from '@/app/paths';
import { Table } from 'dibk-designsystemet';
import styles from './JobTable.module.scss';

import type { AnalysisJob } from '@/types/api.types';

interface JobTableProps {
    jobs: AnalysisJob[];
}

export default function JobTable({ jobs }: JobTableProps) {
    const navigate = useNavigate();

    // Analysen brukeren valgte, hvis resultatet ikke kan vises
    const [unavailableJob, setUnavailableJob] = useState<AnalysisJob | null>(
        null,
    );

    function handleSelect(job: AnalysisJob) {
        if (job.status === 'successful') {
            navigate(getPath(job));
        } else {
            setUnavailableJob(job);
        }
    }

    function handleLinkClick(event: MouseEvent, job: AnalysisJob) {
        event.stopPropagation();

        if (job.status !== 'successful') {
            event.preventDefault();
            setUnavailableJob(job);
        }
    }

    return (
        <div className={styles.tableContainer}>
            <Table
                className={styles.jobTable}
                data-size="sm"
                hover
            >
                <Table.Head>
                    <Table.Row>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Opprettet</Table.HeaderCell>
                        <Table.HeaderCell>Ferdig</Table.HeaderCell>
                        <Table.HeaderCell className={styles.number}>
                            Varighet
                        </Table.HeaderCell>
                        <Table.HeaderCell>Job ID</Table.HeaderCell>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {jobs.map((job) => (
                        // Hele raden er klikkbar; lenken i Job ID-cellen gir tastaturnavigering
                        <Table.Row
                            key={job.jobID}
                            className={styles.row}
                            onClick={() => handleSelect(job)}
                        >
                            <Table.Cell>
                                <JobStatusTag status={job.status} />
                            </Table.Cell>
                            <Table.Cell className={styles.date}>
                                {formatDateTime(job.created)}
                            </Table.Cell>
                            <Table.Cell className={styles.date}>
                                {formatDateTime(job.finished)}
                            </Table.Cell>
                            <Table.Cell className={styles.number}>
                                {formatDuration(job)}
                            </Table.Cell>
                            <Table.Cell>
                                <Link
                                    to={getPath(job)}
                                    className={styles.jobId}
                                    onClick={(event) =>
                                        handleLinkClick(event, job)
                                    }
                                >
                                    {job.jobID}
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>

            <JobStatusDialog
                job={unavailableJob}
                onClose={() => setUnavailableJob(null)}
            />
        </div>
    );
}

function getPath(job: AnalysisJob): string {
    return generatePath(PATHS.result, { jobId: job.jobID });
}
