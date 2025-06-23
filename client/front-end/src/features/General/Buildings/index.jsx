import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { inPlaceSort } from 'fast-sort';
import { COLOR_MAP, getChartData, chartOptions } from './helpers';
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
            return <p>Ingen data tilgjengelig</p>
        }

        return (
            <div>
                <div className={styles.tableContainer}>
                    <Table size="small" aria-label="Oversikt boligtyper">
                        <TableHead>
                            <TableRow>
                                <TableCell>Boligtype</TableCell>
                                <TableCell align="right">Antall</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {buildings.map(type => (
                                <TableRow key={type.category}>
                                    <TableCell>{type.category}</TableCell>
                                    <TableCell align="right">{type.count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className={styles.chartContainer}>
                    <div className={styles.chart}>
                        <Pie data={chartData} options={chartOptions} />
                    </div>

                    <ul className={styles.labels}>
                        {buildings.map(type => (
                            <li className={styles.label} key={type.category}>
                                <span className={styles.color}
                                    style={{
                                        backgroundColor: COLOR_MAP[type.category] || '#E7E9ED'
                                    }}
                                ></span>
                                <span>{type.category}:&nbsp;&nbsp;{type.count} stk.</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <Paper className={styles.container}>
            <h3>Fordeling av boligtyper</h3>
            {renderContent()}
        </Paper>
    );
}
