import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { inPlaceSort } from 'fast-sort';
import { getChartData, chartOptions } from './helpers';
import { Heading, Paragraph, Table } from '@digdir/designsystemet-react';
import styles from './Roads.module.scss';

export default function Roads({ factPart }) {
    const roads = useMemo(
        () => {
            if (!factPart?.data) {
                return [];
            }

            const _roads = factPart.data
                .filter(type => type.length > 0)
                .map(type => ({
                    ...type,
                    length: Math.round(type.length)
                }));

            inPlaceSort(_roads).desc(type => type.length);

            return _roads;
        },
        [factPart]
    );

    const chartData = getChartData(roads);

    function renderContent() {
        if (roads.length === 0) {
            return <Paragraph>Ingen data tilgjengelig</Paragraph>;
        }

        return (
            <div>
                <div className={styles.tableContainer}>
                    <Table data-size="small" aria-label="Oversikt vegtyper">
                        <Table.Head>
                            <Table.Row>
                                <Table.Cell>Vegtype</Table.Cell>
                                <Table.Cell className={styles.right}>Lengde (m)</Table.Cell>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {roads.map(road => (
                                <Table.Row key={road.roadType}>
                                    <Table.Cell>{road.roadType}</Table.Cell>
                                    <Table.Cell  className={styles.right}>{road.length.toLocaleString('nb-NO')}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>

                <div className={styles.chartContainer}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Heading level={3}>Fordeling av vegtyper</Heading>
            {renderContent()}
        </div>
    );
}
