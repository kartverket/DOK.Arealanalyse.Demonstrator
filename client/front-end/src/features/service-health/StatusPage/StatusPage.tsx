import { useMemo, useState } from 'react';
import { Cluster, Stack } from 'dibk-designsystemet/layout';
import {
    useGetStatusIncidentsQuery,
    useGetStatusQuery,
    useGetStatusStatisticsQuery,
    useGetStatusTimelineQuery,
} from '@/lib/api/api';
import { KIND_LABELS, PERIODS, STATUS_ORDER, type Period } from '../constants';
import { getDisplayName } from '../helpers';
import IncidentList from '../IncidentList/IncidentList';
import StatusLegend from '../StatusLegend/StatusLegend';
import StatusSummary from '../StatusSummary/StatusSummary';
import StatusTable from '../StatusTable/StatusTable';
import TargetDialog from '../TargetDialog/TargetDialog';
import {
    Alert,
    Checkbox,
    DibkSectionHeader,
    Field,
    Heading,
    Label,
    Paragraph,
    Select,
    Skeleton,
    Textfield,
    ToggleGroup,
} from 'dibk-designsystemet';
import styles from './StatusPage.module.scss';

import type { CheckResult, Incident, TargetKind } from '@/types/health.types';

const KINDS = Object.keys(KIND_LABELS) as TargetKind[];
const POLLING_INTERVAL = 60_000;

export default function StatusPage() {
    const [period, setPeriod] = useState<Period>(30);
    const [kind, setKind] = useState<TargetKind>('dataset');
    const [query, setQuery] = useState('');
    const [onlyProblems, setOnlyProblems] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const {
        data: overview,
        isLoading,
        isError,
    } = useGetStatusQuery(undefined, { pollingInterval: POLLING_INTERVAL });
    const { data: statistics } = useGetStatusStatisticsQuery({ dager: period });
    const { data: timeline } = useGetStatusTimelineQuery({
        dager: period,
        opplosning: 'dag',
    });
    const { data: allIncidents } = useGetStatusIncidentsQuery({
        dager: period,
        maks: 1,
    });
    const { data: incidents } = useGetStatusIncidentsQuery({
        dager: period,
        type: kind,
    });

    const statisticsById = useMemo(
        () => new Map((statistics ?? []).map((stat) => [stat.target_id, stat])),
        [statistics],
    );

    const resultsById = useMemo(
        () =>
            new Map(
                (overview?.results ?? []).map((result) => [
                    result.target.id,
                    result,
                ]),
            ),
        [overview],
    );

    const filteredResults = useMemo(() => {
        const search = query.trim().toLowerCase();

        return (overview?.results ?? [])
            .filter((result) => result.target.kind === kind)
            .filter(
                (result) =>
                    !onlyProblems ||
                    result.status === 'degraded' ||
                    result.status === 'down',
            )
            .filter((result) => !search || matches(result, search))
            .sort(
                (a, b) =>
                    STATUS_ORDER.indexOf(a.status) -
                        STATUS_ORDER.indexOf(b.status) ||
                    getDisplayName(a.target).localeCompare(
                        getDisplayName(b.target),
                        'nb',
                    ),
            );
    }, [overview, kind, onlyProblems, query]);

    function getIncidentName(incident: Incident) {
        const result = resultsById.get(incident.target_id);
        return result ? getDisplayName(result.target) : incident.name;
    }

    function renderHeader() {
        return (
            <DibkSectionHeader
                title="Tjenestestatus"
                description="Helsesjekk av datasettene, tjenestene og registrene som DOK-analysen er avhengig av. Datasettene sjekkes mot konfigurasjonen i GitHub: at tjenesten svarer, at lagene og egenskapene finnes, og at en intersect-spørring mot et testområde fungerer."
            />
        );
    }

    if (isLoading) {
        return (
            <Stack gap="lg">
                {renderHeader()}
                <Skeleton height="8rem" />
                <Skeleton height="24rem" />
            </Stack>
        );
    }

    if (isError || !overview) {
        return (
            <Stack gap="lg">
                {renderHeader()}
                <Alert data-color="danger">
                    Kunne ikke hente tjenestestatus.
                </Alert>
            </Stack>
        );
    }

    if (overview.run === null) {
        return (
            <Stack gap="lg">
                {renderHeader()}
                <Alert data-color="info">
                    Ingen helsesjekker er kjørt ennå. Sett{' '}
                    <code>HEALTHCHECK_ENABLED=true</code> for API-et, eller kjør{' '}
                    <code>
                        python -m dokanalyse-web-api.services.healthcheck
                    </code>
                    .
                </Alert>
            </Stack>
        );
    }

    return (
        <Stack
            gap="lg"
            className={styles.statusPage}
        >
            {renderHeader()}

            <StatusSummary
                overview={overview}
                statistics={statistics}
                incidents={allIncidents}
                period={period}
            />

            <Cluster
                gap="md"
                align="baseline"
                justify="between"
                className={styles.filters}
            >
                <ToggleGroup
                    value={kind}
                    onChange={(value) => setKind(value as TargetKind)}
                    aria-label="Type"
                    data-size="sm"
                >
                    {KINDS.map((value) => (
                        <ToggleGroup.Item
                            key={value}
                            value={value}
                        >
                            {KIND_LABELS[value]} (
                            {overview.summary[value]?.total ?? 0})
                        </ToggleGroup.Item>
                    ))}
                </ToggleGroup>

                <Cluster
                    gap="md"
                    align="baseline"
                >
                    <Textfield
                        label="Søk"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        data-size="sm"
                        className={styles.search}
                    />
                    <Field data-size="sm">
                        <Label>Periode</Label>
                        <Select
                            value={period}
                            onChange={(event) =>
                                setPeriod(Number(event.target.value) as Period)
                            }
                        >
                            {PERIODS.map((days) => (
                                <Select.Option
                                    key={days}
                                    value={days}
                                >
                                    Siste {days} dager
                                </Select.Option>
                            ))}
                        </Select>
                    </Field>
                    <Checkbox
                        label="Bare avvik og nede"
                        checked={onlyProblems}
                        onChange={(event) =>
                            setOnlyProblems(event.target.checked)
                        }
                        data-size="sm"
                    />
                </Cluster>
            </Cluster>

            <Stack gap="sm">
                <Cluster
                    justify="between"
                    align="baseline"
                >
                    <Heading
                        level={2}
                        data-size="xs"
                    >
                        {KIND_LABELS[kind]}
                    </Heading>
                    <StatusLegend />
                </Cluster>

                {filteredResults.length ? (
                    <StatusTable
                        results={filteredResults}
                        statistics={statisticsById}
                        timeline={timeline}
                        period={period}
                        onSelect={setSelectedId}
                    />
                ) : (
                    <Paragraph>Ingen treff.</Paragraph>
                )}
            </Stack>

            <Stack gap="sm">
                <Heading
                    level={2}
                    data-size="xs"
                >
                    Hendelser, siste {period} dager ({incidents?.count ?? 0})
                </Heading>
                <IncidentList
                    key={`${kind}-${period}`}
                    incidents={incidents?.items ?? []}
                    total={incidents?.count ?? 0}
                    getName={getIncidentName}
                    onSelect={setSelectedId}
                />
            </Stack>

            <TargetDialog
                result={selectedId ? resultsById.get(selectedId) : undefined}
                statistics={
                    selectedId ? statisticsById.get(selectedId) : undefined
                }
                period={period}
                onClose={() => setSelectedId(null)}
            />
        </Stack>
    );
}

function matches(result: CheckResult, search: string): boolean {
    const { target } = result;

    return [
        target.name,
        target.meta.title,
        target.meta.host,
        target.meta.file_name,
        target.url,
    ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));
}
