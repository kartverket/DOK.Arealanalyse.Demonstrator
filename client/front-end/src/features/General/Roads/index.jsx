import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { inPlaceSort } from 'fast-sort';
import { getChartData, chartOptions } from './helpers';
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
            return <p>Ingen data tilgjengelig</p>
        }

        return (
            <div>
                <div className={styles.tableContainer}>
                    <Table size="small" aria-label="Oversikt vegtyper">
                        <TableHead>
                            <TableRow>
                                <TableCell>Vegtype</TableCell>
                                <TableCell align="right">Lengde (m)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roads.map(road => (
                                <TableRow key={road.roadType}>
                                    <TableCell>{road.roadType}</TableCell>
                                    <TableCell align="right">{road.length.toLocaleString('nb-NO')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className={styles.chartContainer}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        );
    }

    return (
        <Paper className={styles.container}>
            <h3>Fordeling av vegtyper</h3>
            {renderContent()}
        </Paper>
    );
}
