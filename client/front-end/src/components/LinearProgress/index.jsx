import DeterminateProgressBar from './DeterminateProgress';
import IndeterminateProgressBar from './IndeterminateProgress';
import styles from './ProgressBar.module.scss';

export const PROGRESS_VARIANT = {
    DETERMINATE: 'determinate',
    INDETERMINATE: 'indeterminate'
};

export default function ProgressBar({ variant = PROGRESS_VARIANT.INDETERMINATE, value = 0, className = '' }) {
    return (
        <div className={styles.container}>
            {
                variant == PROGRESS_VARIANT.INDETERMINATE ?
                    <IndeterminateProgressBar className={className} /> :
                    <DeterminateProgressBar value={value} className={className} />
            }
        </div>
    );
}