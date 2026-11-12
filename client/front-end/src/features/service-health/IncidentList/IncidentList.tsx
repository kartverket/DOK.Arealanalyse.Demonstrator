import { useState } from 'react';
import { formatDateTime, formatDuration } from '../helpers';
import StatusTag from '../StatusTag/StatusTag';
import { Button, Paragraph, Table } from 'dibk-designsystemet';
import styles from './IncidentList.module.scss';

import type { Incident } from '@/types/health.types';

const INITIAL_COUNT = 15;

interface IncidentListProps {
    incidents: Incident[];
    total: number;
    getName: (incident: Incident) => string;
    onSelect: (targetId: string) => void;
}

export default function IncidentList({
    incidents,
    total,
    getName,
    onSelect,
}: IncidentListProps) {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? incidents : incidents.slice(0, INITIAL_COUNT);

    if (incidents.length === 0) {
        return <Paragraph>Ingen hendelser i perioden.</Paragraph>;
    }

    return (
        <div className={styles.incidentList}>
            <div className={styles.tableContainer}>
                <Table data-size="sm">
                    <Table.Head>
                        <Table.Row>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Navn</Table.HeaderCell>
                            <Table.HeaderCell>Startet</Table.HeaderCell>
                            <Table.HeaderCell>Varighet</Table.HeaderCell>
                            <Table.HeaderCell>Melding</Table.HeaderCell>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {visible.map((incident) => (
                            <Table.Row
                                key={`${incident.target_id}-${incident.started_at}`}
                            >
                                <Table.Cell>
                                    <StatusTag status={incident.status} />
                                </Table.Cell>
                                <Table.Cell>
                                    <button
                                        type="button"
                                        className={styles.nameButton}
                                        onClick={() =>
                                            onSelect(incident.target_id)
                                        }
                                    >
                                        {getName(incident)}
                                    </button>
                                </Table.Cell>
                                <Table.Cell className={styles.nowrap}>
                                    {formatDateTime(incident.started_at)}
                                </Table.Cell>
                                <Table.Cell className={styles.nowrap}>
                                    {formatDuration(incident.duration_minutes)}
                                </Table.Cell>
                                <Table.Cell>
                                    {incident.message ?? '–'}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>

            {incidents.length > INITIAL_COUNT && (
                <Button
                    variant="secondary"
                    data-size="sm"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? 'Vis færre'
                        : `Vis ${incidents.length < total ? 'de siste' : 'alle'} ${incidents.length} hendelser`}
                </Button>
            )}
        </div>
    );
}
