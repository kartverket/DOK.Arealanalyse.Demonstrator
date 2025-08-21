import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LinearProgress } from '@mui/material';
import styles from './ProgressBar.module.scss';

export default function ProgressBar() {
    const totalSteps = useSelector(state => state.dataset.totalSteps);
    const currentStep = useSelector(state => state.dataset.step);

    const progress = useMemo(() => totalSteps !== 0 ? Math.round((currentStep / totalSteps) * 100) : 0, [totalSteps, currentStep]);

    return (
        <div className={styles.progressBar}>
            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1 }} />
            <span className={styles.percent}>{progress} %</span>
        </div>
    );
}