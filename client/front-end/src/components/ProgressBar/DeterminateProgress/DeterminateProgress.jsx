import { useEffect, useRef, useState } from 'react';
import ProgressBar from 'progressbar.js';
import styles from './DeterminateProgress.module.scss';

export default function DeterminateProgress({ value }) {
    const [bar, setBar] = useState(null)
    const containerRef = useRef(null);
    const initRef = useRef(true);

    useEffect(
        () => {
            if (!initRef.current) {
                return;
            }

            initRef.current = false;

            const bar = new ProgressBar.Line(containerRef.current, {
                strokeWidth: 1,
                easing: 'easeInOut',
                duration: 100,
                trailWidth: 1,
                svgStyle: {
                    width: '100%',
                    height: '100%'
                },
                text: {
                    autoStyleContainer: false,
                    className: styles.progressBarText
                },
                step: (_, bar) => {
                    bar.setText(Math.round(bar.value() * 100) + ' %');
                }
            });

            setBar(bar);
        },
        []
    );

    useEffect(
        () => {
            if (bar !== null) {
                bar.animate(value);
            }
        },
        [bar, value]
    );

    return (
        <div ref={containerRef} className={styles.progressBar}></div>
    );
}