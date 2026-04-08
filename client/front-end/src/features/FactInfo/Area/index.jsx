import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { inPlaceSort } from 'fast-sort';
import { COLOR_MAP, getChartData, chartOptions } from './helpers';
import { Heading, Paragraph, Table } from '@digdir/designsystemet-react';
import styles from './Area.module.scss';

export default function Area({ factPart }) {
    const areaTypes = useMemo(
        () => {
            if (!factPart?.data) {
                return [];
            }

            const _areaTypes = factPart.data.areaTypes
                .filter(type => type.area > 0)
                .map(type => ({
                    ...type,
                    area: Math.round(type.area)
                }))

            inPlaceSort(_areaTypes).desc(type => type.area);

            return _areaTypes;
        },
        [factPart]
    );

    const chartData = getChartData(areaTypes);

    function renderContent() {
        if (areaTypes.length === 0) {
            return <Paragraph>Ingen data tilgjengelig</Paragraph>;
        }

        return (
            <div>
                <div className={styles.tableContainer}>
                    <Table data-size="sm" aria-label="Oversikt arealtyper">
                        <Table.Head>
                            <Table.Row>
                                <Table.HeaderCell>Arealtype</Table.HeaderCell>
                                <Table.HeaderCell className={styles.right}>Areal (m²)</Table.HeaderCell>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {
                                areaTypes.map(type => (
                                    <Table.Row key={type.areaType}>
                                        <Table.Cell>{type.areaType}</Table.Cell>
                                        <Table.Cell className={styles.right}>{type.area.toLocaleString('nb-NO')}</Table.Cell>
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
                            areaTypes.map(type => (
                                <li className={styles.label} key={type.areaType}>
                                    <span className={styles.color}
                                        style={{
                                            backgroundColor: COLOR_MAP[type.areaType] || '#E7E9ED'
                                        }}
                                    ></span>
                                    <span>{type.areaType}:&nbsp;&nbsp;{type.area.toLocaleString('nb-NO')} m²</span>
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
            <Heading level={3}>Fordeling av areal per arealtype</Heading>
            {renderContent()}
        </div>
    );
}
