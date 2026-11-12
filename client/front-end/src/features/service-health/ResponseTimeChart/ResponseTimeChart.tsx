import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useGetStatusTimelineQuery } from '@/lib/api/api';
import { formatBucket, formatMs } from '../helpers';
import { Paragraph, Skeleton } from 'dibk-designsystemet';
import styles from './ResponseTimeChart.module.scss';

import type { ChartData, ChartOptions } from 'chart.js';

const DAYS = 7;
const SERIES_COLOR = '#2a78d6';
const SERIES_WASH = 'rgb(42 120 214 / 10%)';
const MUTED_INK = '#898781';
const GRIDLINE = '#e1e0d9';
const BASELINE = '#c3c2b7';

interface ResponseTimeChartProps {
    targetId: string;
}

export default function ResponseTimeChart({
    targetId,
}: ResponseTimeChartProps) {
    const { data: timeline, isLoading } = useGetStatusTimelineQuery({
        dager: DAYS,
        opplosning: 'time',
        mal: targetId,
    });

    const chartData = useMemo<ChartData<
        'line',
        (number | null)[],
        string
    > | null>(() => {
        if (!timeline) {
            return null;
        }

        const byBucket = new Map(
            (timeline.targets[targetId] ?? []).map((entry) => [
                entry.bucket,
                entry.avg_ms,
            ]),
        );

        return {
            labels: timeline.buckets.map((bucket) =>
                formatBucket(bucket, 'hour'),
            ),
            datasets: [
                {
                    label: 'Snitt responstid',
                    data: timeline.buckets.map(
                        (bucket) => byBucket.get(bucket) ?? null,
                    ),
                    borderColor: SERIES_COLOR,
                    backgroundColor: SERIES_WASH,
                    pointHoverBackgroundColor: SERIES_COLOR,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2,
                    fill: true,
                    spanGaps: false,
                },
            ],
        };
    }, [timeline, targetId]);

    const options = useMemo<ChartOptions<'line'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            elements: {
                line: {
                    borderWidth: 2,
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round',
                    tension: 0.2,
                },
                point: { radius: 0, hoverRadius: 5, hitRadius: 8 },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: (item) =>
                            `Snitt responstid: ${formatMs(item.parsed.y)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { color: BASELINE },
                    ticks: {
                        color: MUTED_INK,
                        maxTicksLimit: 8,
                        maxRotation: 0,
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: GRIDLINE },
                    border: { display: false },
                    ticks: {
                        color: MUTED_INK,
                        maxTicksLimit: 5,
                        callback: (value) => formatMs(Number(value)),
                    },
                },
            },
        }),
        [],
    );

    if (isLoading) {
        return <Skeleton height="16rem" />;
    }

    if (!chartData) {
        return <Paragraph>Ingen data om responstid.</Paragraph>;
    }

    return (
        <div className={styles.chart}>
            <Line
                data={chartData}
                options={options}
                aria-label={`Snitt responstid per time, siste ${DAYS} dager`}
                role="img"
            />
        </div>
    );
}
