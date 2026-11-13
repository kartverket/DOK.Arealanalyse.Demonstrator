import { generatePath, Link, useNavigate } from 'react-router';
import { formatDateTime, formatDuration } from '../helpers';
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
                    {jobs.map((job) => {
                        const path = generatePath(PATHS.result, {
                            jobId: job.jobID,
                        });

                        return (
                            // Hele raden er klikkbar; lenken i Job ID-cellen gir tastaturnavigering
                            <Table.Row
                                key={job.jobID}
                                className={styles.row}
                                onClick={() => navigate(path)}
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
                                        to={path}
                                        className={styles.jobId}
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        {job.jobID}
                                    </Link>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    );
}
