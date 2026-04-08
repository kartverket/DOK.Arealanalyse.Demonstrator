import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { inPlaceSort } from 'fast-sort';
import { COLOR_MAP, getChartData, chartOptions } from './helpers';
import { Heading, Paragraph, Table } from '@digdir/designsystemet-react';
import styles from './Buildings.module.scss';

export default function Buildings({ factPart }) {
    const buildings = useMemo(
        () => {
            if (!factPart?.data) {
                return [];
            }

            const _buildings = factPart.data
                .filter(type => type.count > 0);

            inPlaceSort(_buildings).desc(type => type.count);

            return _buildings;
        },
        [factPart]
    );

    const chartData = getChartData(buildings);

    function renderContent() {
        if (buildings.length === 0) {
            return <Paragraph>Ingen data tilgjengelig</Paragraph>;
        }

        return (
            <div>
                <div className={styles.tableContainer}>
                    <Table data-size="sm" aria-label="Oversikt boligtyper">
                        <Table.Head>
                            <Table.Row>
                                <Table.HeaderCell>Boligtype</Table.HeaderCell>
                                <Table.HeaderCell className={styles.right}>Antall</Table.HeaderCell>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {
                                buildings.map(type => (
                                    <Table.Row key={type.category}>
                                        <Table.Cell>{type.category}</Table.Cell>
                                        <Table.Cell className={styles.right}>{type.count}</Table.Cell>
                                    </Table.Row>
                                ))
                            }
                        </Table.Body>
                    </Table>
                </div>

                <div className={styles.chartContainer}>
                    <div className={styles.chart}>
                        <Pie data={chartData} options={chartOptions} />
                    </div>

                    <ul className={styles.labels}>
                        {
                            buildings.map(type => (
                                <li className={styles.label} key={type.category}>
                                    <span className={styles.color}
                                        style={{
                                            backgroundColor: COLOR_MAP[type.category] || '#E7E9ED'
                                        }}
                                    ></span>
                                    <span>{type.category}:&nbsp;&nbsp;{type.count} stk.</span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Heading level={3}>Fordeling av boligtyper</Heading>
            {renderContent()}
        </div>
    );
}
