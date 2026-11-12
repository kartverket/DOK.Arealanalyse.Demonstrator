import { KIND_LABELS, SERVICE_TYPE_LABELS } from '../constants';
import {
    formatDateTime,
    formatMs,
    formatPercent,
    getDisplayName,
} from '../helpers';
import ResponseTimeChart from '../ResponseTimeChart/ResponseTimeChart';
import StatusTag from '../StatusTag/StatusTag';
import {
    Dialog,
    Heading,
    Link,
    List,
    Paragraph,
    Table,
} from 'dibk-designsystemet';
import styles from './TargetDialog.module.scss';

import type {
    CheckResult,
    LayerDetails,
    ServiceDetails,
    TargetStatistics,
} from '@/types/health.types';

interface TargetDialogProps {
    result: CheckResult | undefined;
    statistics: TargetStatistics | undefined;
    period: number;
    onClose: () => void;
}

export default function TargetDialog({
    result,
    statistics,
    period,
    onClose,
}: TargetDialogProps) {
    function renderService(
        label: string,
        service: ServiceDetails | null | undefined,
    ) {
        if (!service) {
            return null;
        }

        return (
            <Table.Row>
                <Table.Cell>{label}</Table.Cell>
                <Table.Cell>
                    <StatusTag status={service.status} />
                </Table.Cell>
                <Table.Cell className={styles.number}>
                    {service.http_status ?? '–'}
                </Table.Cell>
                <Table.Cell className={styles.number}>
                    {formatMs(service.response_ms)}
                </Table.Cell>
                <Table.Cell className={styles.url}>
                    {service.message ?? service.url}
                </Table.Cell>
            </Table.Row>
        );
    }

    function renderMissing(layer: LayerDetails) {
        const missing = [
            ...layer.missing_properties.map((name) => `egenskap «${name}»`),
            ...layer.missing_filter_fields.map(
                (name) => `filterfelt «${name}»`,
            ),
            ...layer.missing_wms_layers.map((name) => `WMS-lag «${name}»`),
            ...(layer.geom_field_missing ? ['geometrifelt'] : []),
        ];

        if (missing.length) {
            return missing.join(', ');
        }

        return layer.schema_verified
            ? 'Ingen'
            : (layer.schema_note ?? 'Ikke kontrollert');
    }

    function renderLayers(layers: LayerDetails[]) {
        return (
            <div className={styles.tableContainer}>
                <Table data-size="sm">
                    <Table.Head>
                        <Table.Row>
                            <Table.HeaderCell>Lag</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell className={styles.number}>
                                HTTP
                            </Table.HeaderCell>
                            <Table.HeaderCell className={styles.number}>
                                Spørring
                            </Table.HeaderCell>
                            <Table.HeaderCell className={styles.number}>
                                Treff
                            </Table.HeaderCell>
                            <Table.HeaderCell>Mangler</Table.HeaderCell>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {layers.map((layer, index) => (
                            <Table.Row key={`${layer.name}-${index}`}>
                                <Table.Cell>{layer.name ?? '–'}</Table.Cell>
                                <Table.Cell>
                                    <StatusTag status={layer.status} />
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {layer.query?.http_status ?? '–'}
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {formatMs(layer.query?.response_ms)}
                                </Table.Cell>
                                <Table.Cell className={styles.number}>
                                    {layer.query?.hit_count ?? '–'}
                                </Table.Cell>
                                <Table.Cell>
                                    {layer.exists === false
                                        ? 'Laget finnes ikke'
                                        : renderMissing(layer)}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        );
    }

    function renderContent(result: CheckResult) {
        const { target, details } = result;
        const issues = details.issues ?? [];
        const type = target.service_type
            ? SERVICE_TYPE_LABELS[target.service_type]
            : null;

        return (
            <div className={styles.content}>
                <div className={styles.header}>
                    <Heading
                        level={2}
                        data-size="sm"
                    >
                        {getDisplayName(target)}
                    </Heading>
                    <div className={styles.meta}>
                        <StatusTag status={result.status} />
                        <span>
                            {[KIND_LABELS[target.kind], type]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                        <span>Sjekket {formatDateTime(result.checked_at)}</span>
                    </div>
                    {target.url && (
                        <Link
                            href={target.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.url}
                        >
                            {target.url}
                        </Link>
                    )}
                    {target.meta.file_name && (
                        <Paragraph data-size="sm">
                            Konfigurasjon: {target.meta.file_name}
                        </Paragraph>
                    )}
                </div>

                <dl className={styles.facts}>
                    <div>
                        <dt>HTTP-status</dt>
                        <dd>{result.http_status ?? '–'}</dd>
                    </div>
                    <div>
                        <dt>Responstid</dt>
                        <dd>{formatMs(result.response_ms)}</dd>
                    </div>
                    <div>
                        <dt>Tilgjengelig ({period} d)</dt>
                        <dd>{formatPercent(statistics?.availability)}</dd>
                    </div>
                    <div>
                        <dt>Uten avvik ({period} d)</dt>
                        <dd>{formatPercent(statistics?.healthy)}</dd>
                    </div>
                    <div>
                        <dt>Median / p95</dt>
                        <dd>
                            {formatMs(statistics?.p50_ms)} /{' '}
                            {formatMs(statistics?.p95_ms)}
                        </dd>
                    </div>
                </dl>

                {(issues.length > 0 || (!details.issues && result.message)) && (
                    <section className={styles.section}>
                        <Heading
                            level={3}
                            data-size="2xs"
                        >
                            Avvik
                        </Heading>
                        <List.Unordered>
                            {(issues.length ? issues : [result.message]).map(
                                (issue) => (
                                    <List.Item key={issue}>{issue}</List.Item>
                                ),
                            )}
                        </List.Unordered>
                    </section>
                )}

                {(details.feature_service || details.wms) && (
                    <section className={styles.section}>
                        <Heading
                            level={3}
                            data-size="2xs"
                        >
                            Tjenester
                        </Heading>
                        <div className={styles.tableContainer}>
                            <Table data-size="sm">
                                <Table.Body>
                                    {renderService(
                                        'Datatjeneste',
                                        details.feature_service,
                                    )}
                                    {renderService('WMS', details.wms)}
                                </Table.Body>
                            </Table>
                        </div>
                    </section>
                )}

                {details.layers && details.layers.length > 0 && (
                    <section className={styles.section}>
                        <Heading
                            level={3}
                            data-size="2xs"
                        >
                            Lag
                        </Heading>
                        {renderLayers(details.layers)}
                    </section>
                )}

                {details.datasets && details.datasets.length > 0 && (
                    <section className={styles.section}>
                        <Heading
                            level={3}
                            data-size="2xs"
                        >
                            Brukes av datasett
                        </Heading>
                        <Paragraph data-size="sm">
                            {details.datasets.join(', ')}
                        </Paragraph>
                    </section>
                )}

                {target.meta.used_by && (
                    <Paragraph data-size="sm">
                        Brukes av: {target.meta.used_by.join(', ')}
                    </Paragraph>
                )}

                <section className={styles.section}>
                    <Heading
                        level={3}
                        data-size="2xs"
                    >
                        Snitt responstid per time, siste 7 dager
                    </Heading>
                    <ResponseTimeChart targetId={target.id} />
                </section>
            </div>
        );
    }

    return (
        <Dialog
            open={result !== undefined}
            onClose={onClose}
            closedby="any"
            closeButton="Lukk"
            placement="right"
            className={styles.dialog}
        >
            {result && renderContent(result)}
        </Dialog>
    );
}
