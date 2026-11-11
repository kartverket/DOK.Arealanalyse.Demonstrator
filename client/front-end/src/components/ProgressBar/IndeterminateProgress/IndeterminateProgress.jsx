import styles from './IndeterminateProgress.module.scss';

export default function IndeterminateProgress() {
    return (
        <div className={styles.progressBar}>
            <div>
                <div className={styles.progressBarValue}></div>
            </div>
        </div>
    );
}