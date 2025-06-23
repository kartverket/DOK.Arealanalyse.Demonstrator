import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { inPlaceSort } from 'fast-sort';
import { COLOR_MAP, getChartData, chartOptions } from './helpers';
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
            return <p>Ingen data tilgjengelig</p>
        }

        return (
            <div>
                <div className={styles.tableContainer}>
                    <Table size="small" aria-label="Oversikt arealtyper">
                        <TableHead>
                            <TableRow>
                                <TableCell>Arealtype</TableCell>
                                <TableCell align="right">Areal (m²)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {areaTypes.map(type => (
                                <TableRow key={type.areaType}>
                                    <TableCell>{type.areaType}</TableCell>
                                    <TableCell align="right">{type.area.toLocaleString('nb-NO')}</TableCell>
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
                        {areaTypes.map(type => (
                            <li className={styles.label} key={type.areaType}>
                                <span className={styles.color}
                                    style={{
                                        backgroundColor: COLOR_MAP[type.areaType] || '#E7E9ED'
                                    }}
                                ></span>
                                <span>{type.areaType}:&nbsp;&nbsp;{type.area.toLocaleString('nb-NO')} m²</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <Paper className={styles.container}>
            <h3>Fordeling av areal per arealtype</h3>
            {renderContent()}
        </Paper>
    );
}
