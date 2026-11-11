import { useEffect, useRef, useState } from 'react';
import ProgressBar from 'progressbar.js';
import styles from './DeterminateProgress.module.scss';

type Line = InstanceType<typeof ProgressBar.Line>;

interface DeterminateProgressProps {
    value: number;
}

export default function DeterminateProgress({
    value,
}: DeterminateProgressProps) {
    const [bar, setBar] = useState<Line | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const initRef = useRef(true);

    useEffect(() => {
        if (!initRef.current) {
            return;
        }

        initRef.current = false;

        const bar = new ProgressBar.Line(containerRef.current!, {
            strokeWidth: 1,
            easing: 'easeInOut',
            duration: 100,
            trailWidth: 1,
            svgStyle: {
                width: '100%',
                height: '100%',
            },
            text: {
                autoStyleContainer: false,
                className: styles.progressBarText,
            },
            // @types/progressbar.js angir Path, men progressbar.js sender selve Line-instansen
            step: (_, shape) => {
                const bar = shape as unknown as Line;
                bar.setText(Math.round(bar.value() * 100) + ' %');
            },
        });

        setBar(bar);
    }, []);

    useEffect(() => {
        if (bar !== null) {
            bar.animate(value);
        }
    }, [bar, value]);

    return (
        <div
            ref={containerRef}
            className={styles.progressBar}
        ></div>
    );
}
