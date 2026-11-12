import { useMemo, useState, type MouseEvent } from 'react';
import { STATUS_LABELS } from '../constants';
import {
    formatBucket,
    formatMs,
    formatPercent,
    getAvailability,
    getBucketStatus,
} from '../helpers';
import styles from './StatusStrip.module.scss';

import type { Timeline, TimelineBucket } from '@/types/health.types';

const TOOLTIP_MIN_SPACE_ABOVE = 160;

interface Hovered {
    index: number;
    rect: DOMRect;
}

interface StatusStripProps {
    timeline: Timeline;
    data: TimelineBucket[] | undefined;
    label: string;
}

export default function StatusStrip({
    timeline,
    data,
    label,
}: StatusStripProps) {
    const [hovered, setHovered] = useState<Hovered | null>(null);
    const byBucket = useMemo(
        () => new Map((data ?? []).map((entry) => [entry.bucket, entry])),
        [data],
    );
    const { buckets, resolution } = timeline;

    function handleMouseEnter(
        event: MouseEvent<HTMLSpanElement>,
        index: number,
    ) {
        setHovered({
            index,
            rect: event.currentTarget.getBoundingClientRect(),
        });
    }

    function renderTooltip({ index, rect }: Hovered) {
        const bucket = buckets[index];
        const entry = byBucket.get(bucket);
        const below = rect.top < TOOLTIP_MIN_SPACE_ABOVE;
        const left = Math.min(
            Math.max(rect.left + rect.width / 2, 170),
            window.innerWidth - 170,
        );

        return (
            <div
                className={styles.tooltip}
                data-placement={below ? 'below' : 'above'}
                style={{ left, top: below ? rect.bottom : rect.top }}
            >
                <strong>{formatBucket(bucket, resolution)}</strong>
                {entry ? (
                    <>
                        <span>{STATUS_LABELS[getBucketStatus(entry)]}</span>
                        <span>
                            Tilgjengelighet:{' '}
                            {formatPercent(getAvailability(entry))}
                        </span>
                        <span>
                            {entry.checks} sjekker: {entry.ok} OK, {entry.slow}{' '}
                            treg, {entry.degraded} avvik, {entry.down} nede
                        </span>
                        <span>Snitt responstid: {formatMs(entry.avg_ms)}</span>
                    </>
                ) : (
                    <span>Ingen data</span>
                )}
            </div>
        );
    }

    return (
        <div
            className={styles.strip}
            role="img"
            aria-label={`Historikk for ${label}`}
            onMouseLeave={() => setHovered(null)}
        >
            {buckets.map((bucket, index) => {
                const entry = byBucket.get(bucket);

                return (
                    <span
                        key={bucket}
                        className={styles.cell}
                        data-status={entry ? getBucketStatus(entry) : 'none'}
                        data-hovered={hovered?.index === index || undefined}
                        onMouseEnter={(event) => handleMouseEnter(event, index)}
                    />
                );
            })}
            {hovered !== null && renderTooltip(hovered)}
        </div>
    );
}
