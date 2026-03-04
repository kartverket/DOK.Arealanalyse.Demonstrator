import styles from './IndeterminateProgress.module.scss';

export default function IndeterminateProgress() {
    return (
        <div className={styles.progressBar}>
            <div className={styles.progressBarValue}></div>
        </div>
    );
}