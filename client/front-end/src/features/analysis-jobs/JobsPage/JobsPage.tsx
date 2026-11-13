import { useSearchParams } from 'react-router';
import { Stack } from 'dibk-designsystemet/layout';
import { api, useGetJobsQuery } from '@/lib/api/api';
import { JOBS_PER_PAGE } from '../constants';
import { isFinalJobStatus } from '../helpers';
import JobTable from '../JobTable/JobTable';
import {
    Alert,
    DibkSectionHeader,
    Pagination,
    Paragraph,
    Skeleton,
    usePagination,
} from 'dibk-designsystemet';
import styles from './JobsPage.module.scss';

const PAGE_PARAM = 'side';
const POLLING_INTERVAL = 5_000;

export default function JobsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get(PAGE_PARAM)) || 1);
    const args = { limit: JOBS_PER_PAGE, offset: (page - 1) * JOBS_PER_PAGE };

    // Listen oppdateres så lenge noen av analysene på siden ikke er ferdige
    const { data: current } = api.endpoints.getJobs.useQueryState(args);
    const hasActiveJobs =
        current?.jobs.some((job) => !isFinalJobStatus(job.status)) ?? false;

    const { data, isLoading, isError } = useGetJobsQuery(args, {
        pollingInterval: hasActiveJobs ? POLLING_INTERVAL : 0,
    });

    const totalPages = Math.max(
        1,
        Math.ceil((data?.numberMatched ?? 0) / JOBS_PER_PAGE),
    );

    const { pages, prevButtonProps, nextButtonProps } = usePagination({
        currentPage: page,
        totalPages,
        setCurrentPage: (value) =>
            setSearchParams(value > 1 ? { [PAGE_PARAM]: String(value) } : {}),
    });

    function renderContent() {
        if (isLoading) {
            return <Skeleton height="24rem" />;
        }

        if (isError || !data) {
            return (
                <Alert data-color="danger">
                    Kunne ikke hente DOK-analysene.
                </Alert>
            );
        }

        if (data.jobs.length === 0) {
            return <Paragraph>Ingen DOK-analyser er kjørt ennå.</Paragraph>;
        }

        return (
            <Stack gap="md">
                <JobTable jobs={data.jobs} />

                {totalPages > 1 && (
                    <Pagination aria-label="Sidenavigering">
                        <Pagination.List>
                            <Pagination.Item>
                                <Pagination.Button {...prevButtonProps}>
                                    Forrige
                                </Pagination.Button>
                            </Pagination.Item>
                            {pages.map((item) => (
                                <Pagination.Item key={item.itemKey}>
                                    {typeof item.page === 'number' && (
                                        <Pagination.Button
                                            {...item.buttonProps}
                                            aria-label={`Side ${item.page}`}
                                        >
                                            {item.page}
                                        </Pagination.Button>
                                    )}
                                </Pagination.Item>
                            ))}
                            <Pagination.Item>
                                <Pagination.Button {...nextButtonProps}>
                                    Neste
                                </Pagination.Button>
                            </Pagination.Item>
                        </Pagination.List>
                    </Pagination>
                )}
            </Stack>
        );
    }

    return (
        <Stack
            gap="lg"
            className={styles.jobsPage}
        >
            <DibkSectionHeader
                title="Resultater"
                description="DOK-analyser som er kjørt, med den nyeste først. Velg en analyse for å se resultatet."
            />

            {renderContent()}
        </Stack>
    );
}
