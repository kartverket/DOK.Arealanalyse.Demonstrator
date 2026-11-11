import DeterminateProgressBar from './DeterminateProgress/DeterminateProgress';
import IndeterminateProgressBar from './IndeterminateProgress/IndeterminateProgress';
import styles from './ProgressBar.module.scss';

export const PROGRESS_VARIANT = {
    DETERMINATE: 'determinate',
    INDETERMINATE: 'indeterminate',
} as const;

export type ProgressVariant =
    (typeof PROGRESS_VARIANT)[keyof typeof PROGRESS_VARIANT];

interface ProgressBarProps {
    variant?: ProgressVariant;
    value?: number;
}

export default function ProgressBar({
    variant = PROGRESS_VARIANT.INDETERMINATE,
    value = 0,
}: ProgressBarProps) {
    return (
        <div className={styles.container}>
            {variant == PROGRESS_VARIANT.INDETERMINATE ? (
                <IndeterminateProgressBar />
            ) : (
                <DeterminateProgressBar value={value} />
            )}
        </div>
    );
}
