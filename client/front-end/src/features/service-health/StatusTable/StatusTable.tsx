import { SERVICE_TYPE_LABELS } from '../constants';
import { formatMs, formatPercent, getDisplayName } from '../helpers';
import StatusStrip from '../StatusStrip/StatusStrip';
import StatusTag from '../StatusTag/StatusTag';
import { Table } from 'dibk-designsystemet';
import styles from './StatusTable.module.scss';

import type {
    CheckResult,
    TargetStatistics,
    Timeline,
} from '@/types/health.types';

interface StatusTableProps {
    results: CheckResult[];
    statistics: Map<string, TargetStatistics>;
    timeline: Timeline | undefined;
    period: number;
    onSelect: (targetId: string) => void;
}

export default function StatusTable({
    results,
    statistics,
    timeline,
    period,
    onSelect,
}: StatusTableProps) {
    function getSubtitle(result: CheckResult) {
        const { target } = result;
        const type = target.service_type
            ? SERVICE_TYPE_LABELS[target.service_type]
            : null;
        return [type, target.meta.group, target.meta.host]
            .filter(Boolean)
            .join(' · ');
    }

    return (
        <div className={styles.tableContainer}>
            <Table
                className={styles.statusTable}
                data-size="sm"
            >
                <Table.Head>
                    <Table.Row>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Navn</Table.HeaderCell>
                        <Table.HeaderCell className={styles.number}>
                            HTTP
                        </Table.HeaderCell>
                        <Table.HeaderCell className={styles.number}>
                            Responstid
                        </Table.HeaderCell>
                        <Table.HeaderCell className={styles.number}>
                            Tilgjengelig ({period} d)
                        </Table.HeaderCell>
                        <Table.HeaderCell className={styles.number}>
                            p95
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Historikk ({period} d)
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {results.map((result) => {
                        const stats = statistics.get(result.target.id);
                        const name = getDisplayName(result.target);

                        return (
                            <Table.Row key={result.target.id}>
                                <Table.Cell>
                                    <StatusTag status={result.status} />
                                </Table.Cell>
                                <Table.Cell>
                                    <div className={styles.name}>
                                        <button
                                            type="button"
                                            className={styles.nameButton}
                                            onClick={() =>
                                                onSelect(result.target.id)
                                            }
                                        >
                                            {name}
                                        </button>
                                        <span className={styles.subtitle}>
                                            {getSubtitle(result)}
                                        </span>
                                        {result.message && (
                                            <span className={styles.message}>
                                                {result.message}
                                            </span>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {result.http_status ?? '–'}
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {formatMs(result.response_ms)}
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {formatPercent(stats?.availability)}
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {formatMs(stats?.p95_ms)}
                                </Table.Cell>
                                <Table.Cell className={styles.historyCell}>
                                    {timeline && (
                                        <StatusStrip
                                            timeline={timeline}
                                            data={
                                                timeline.targets[
                                                    result.target.id
                                                ]
                                            }
                                            label={name}
                                        />
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    );
}
