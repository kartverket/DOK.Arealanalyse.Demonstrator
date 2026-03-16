import { useSelector } from 'react-redux';
import { useAnalyses } from 'context/AnalysesContext';
import { Card } from '@digdir/designsystemet-react';
import { getStatusText, STATE_STATUS, TASK_STATUS } from 'utils/progress';
import ProgressBar from './LinearProgress';
import styles from './Progress.module.scss';
import { useMemo } from 'react';


const TASK_STATUSES = {
    [TASK_STATUS.NOT_STARTED]: styles.notStarted,
    [TASK_STATUS.IN_PROGRESS]: styles.inProgress,
    [TASK_STATUS.DONE]: styles.done
}

export default function Progress() {
    const { busy } = useAnalyses();
    const progress = useSelector(state => state.progress);

    function getStatusCssClass(taskStatus) {
        return TASK_STATUSES[taskStatus] || '';
    }

    function renderProgressBar() {
        let variant = PROGRESS_VARIANT.DETERMINATE;
        let value = 0;

        if (state.status === STATE_STATUS.ANALYZING_DATASETS) {
            value = 1 / state.analysesTotal;
        } else if (state.status === STATE_STATUS.DATASET_ANALYZED) {
            value = state.analysisCount / state.analysesTotal;
        } else if (state.status === STATE_STATUS.CREATING_MAP_IMAGES) {
            value = 1 / state.mapImagesTotal;
        } else if (state.status === STATE_STATUS.MAP_IMAGE_CREATED) {
            value = state.mapImageCount / state.mapImagesTotal;
        } else {
            variant = PROGRESS_VARIANT.INDETERMINATE;
        }

        return <Linea variant={variant} value={value} />;
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
                true && (
                    <Card className={styles.progress}>
                        <div className={styles.statuses}>
                            {
                                progressItems.map(item => (
                                    <div key={item.number} className={`${styles.status} ${item.cssClass}`}>
                                        <span className={styles.icon}>
                                            {item.taskStatus !== TASK_STATUS.DONE ? item.number : ''}
                                        </span>
                                        <div>
                                            <span>{item.text}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </Card>
                )
            }
        </div>
    )
}