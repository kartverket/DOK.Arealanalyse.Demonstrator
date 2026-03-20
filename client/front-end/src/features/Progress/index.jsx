import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useResponse } from 'context/ResponseContext';
import { Card, Spinner } from '@digdir/designsystemet-react';
import { getStatusText, STATE_STATUS, TASK_STATUS } from './helpers';
import { ProgressBar, PROGRESS_VARIANT } from 'components';
import styles from './Progress.module.scss';


const TASK_STATUSES = {
    [TASK_STATUS.NOT_STARTED]: styles.notStarted,
    [TASK_STATUS.IN_PROGRESS]: styles.inProgress,
    [TASK_STATUS.DONE]: styles.done
}

export default function Progress() {
    const { busy } = useResponse();
    const progress = useSelector(state => state.progress);

    function getStatusCssClass(taskStatus) {
        return TASK_STATUSES[taskStatus] || '';
    }

    function renderProgressBar() {
        let variant = PROGRESS_VARIANT.DETERMINATE;
        let value = 0;

        if (progress.status === STATE_STATUS.ANALYZING_DATASETS) {
            value = progress.analysisCount / progress.analysesTotal;
        } else if (progress.status === STATE_STATUS.CREATING_MAP_IMAGES) {
            value = progress.mapImageCount / progress.mapImagesTotal;
        } else {
            variant = PROGRESS_VARIANT.INDETERMINATE;
        }

        return <ProgressBar variant={variant} value={value} />;
    }

    const progressItems = useMemo(
        () => {
            if (progress.tasks === null) {
                return [];
            }

            return Object.entries(progress.tasks)
                .map(([stateStatus, taskStatus], index) => ({
                    number: index + 1,
                    cssClass: getStatusCssClass(taskStatus),
                    text: getStatusText(stateStatus, taskStatus, progress),
                    taskStatus
                }));
        },
        [progress]
    );

    return (
        <div className={styles.progressContainer}>
            {
                busy && (
                    <Card className={styles.progress}>
                        {
                            progressItems.length > 0 ?
                                <>
                                    <h3>Status</h3>
                                    <div className={styles.statuses}>
                                        {
                                            progressItems.map(item => (
                                                <div key={item.number} className={`${styles.status} ${item.cssClass}`}>
                                                    <span className={styles.icon}>
                                                        {item.taskStatus !== TASK_STATUS.DONE ? item.number : ''}
                                                    </span>
                                                    <div>
                                                        <span>{item.text}</span>
                                                        <div className={styles.progressBar}>
                                                            {item.taskStatus === TASK_STATUS.IN_PROGRESS && renderProgressBar()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </> :
                                <Spinner data-size="lg" />
                        }
                    </Card>
                )
            }
        </div>
    );
}

const _progress = {
    "status": "CREATING_FACT_SHEET",
    "analysesTotal": 53,
    "analysisCount": 53,
    "mapImagesTotal": 12,
    "mapImageCount": 12,
    "recipient": "2de14343-18d8-4805-9a02-58bf9a6b9afe",
    "tasks": {
        "STARTING_UP": "DONE",
        "ANALYZING_DATASETS": "DONE",
        "CREATING_FACT_SHEET": "IN_PROGRESS",
        "CREATING_MAP_IMAGES": "IN_PROGRESS",
        "CREATING_REPORT": "NOT_STARTED"
    }
}