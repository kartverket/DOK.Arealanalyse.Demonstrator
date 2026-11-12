import { useMemo } from 'react';
import { Grid } from 'dibk-designsystemet/layout';
import { formatPercent, formatRelative } from '../helpers';
import { Card, Paragraph } from 'dibk-designsystemet';
import styles from './StatusSummary.module.scss';

import type {
    IncidentList,
    StatusOverview,
    TargetStatistics,
} from '@/types/health.types';

interface StatusSummaryProps {
    overview: StatusOverview;
    statistics: TargetStatistics[] | undefined;
    incidents: IncidentList | undefined;
    period: number;
}

export default function StatusSummary({
    overview,
    statistics,
    incidents,
    period,
}: StatusSummaryProps) {
    const datasets = overview.summary.dataset;
    const working = datasets ? datasets.ok + datasets.slow : 0;

    const availability = useMemo(() => {
        const datasetIds = new Set(
            overview.results
                .filter((result) => result.target.kind === 'dataset')
                .map((result) => result.target.id),
        );
        const values = (statistics ?? [])
            .filter((stat) => datasetIds.has(stat.target_id))
            .map((stat) => stat.availability)
            .filter((value): value is number => value !== null);

        return values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null;
    }, [overview.results, statistics]);

    const run = overview.run;

    return (
        <Grid
            gap="md"
            className={styles.summary}
        >
            <Card className={styles.tile}>
                <Paragraph className={styles.label}>
                    Datasett som fungerer
                </Paragraph>
                <span className={styles.value}>
                    {working} av {datasets?.total ?? 0}
                </span>
                <Paragraph
                    data-size="sm"
                    className={styles.meta}
                >
                    {datasets?.degraded ?? 0} med avvik, {datasets?.down ?? 0}{' '}
                    nede
                </Paragraph>
            </Card>

            <Card className={styles.tile}>
                <Paragraph className={styles.label}>
                    Tilgjengelighet datasett, siste {period} dager
                </Paragraph>
                <span className={styles.value}>
                    {formatPercent(availability)}
                </span>
                <Paragraph
                    data-size="sm"
                    className={styles.meta}
                >
                    Snitt av andel sjekker som ikke var nede
                </Paragraph>
            </Card>

            <Card className={styles.tile}>
                <Paragraph className={styles.label}>
                    Hendelser, siste {period} dager
                </Paragraph>
                <span className={styles.value}>{incidents?.count ?? '–'}</span>
                <Paragraph
                    data-size="sm"
                    className={styles.meta}
                >
                    {incidents?.ongoing ?? 0} pågår nå
                </Paragraph>
            </Card>

            <Card className={styles.tile}>
                <Paragraph className={styles.label}>Sist sjekket</Paragraph>
                <span className={styles.value}>
                    {run ? formatRelative(run.started_at) : '–'}
                </span>
                <Paragraph
                    data-size="sm"
                    className={styles.meta}
                >
                    {run?.config_ref
                        ? `Konfigurasjon: ${run.config_ref}${run.config_commit ? ` (${run.config_commit.slice(0, 7)})` : ''}`
                        : 'Ingen kjøringer ennå'}
                </Paragraph>
            </Card>
        </Grid>
    );
}
