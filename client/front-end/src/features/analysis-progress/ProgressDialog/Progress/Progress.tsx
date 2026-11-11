import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Heading, Spinner } from '@digdir/designsystemet-react';
import { getStatusText, STATE_STATUS, TASK_STATUS } from './Progress.helpers';
import ProgressBar, { PROGRESS_VARIANT, type ProgressVariant } from '@/components/ProgressBar/ProgressBar';
import type { StateStatus, TaskStatus } from '@/types/socket.types';
import styles from './Progress.module.scss';

const TASK_STATUSES: Record<TaskStatus, string> = {
    [TASK_STATUS.NOT_STARTED]: styles.notStarted,
    [TASK_STATUS.IN_PROGRESS]: styles.inProgress,
    [TASK_STATUS.DONE]: styles.done
}

export default function Progress() {
    const progress = useAppSelector(state => state.progress);

    function getStatusCssClass(taskStatus: TaskStatus) {
        return TASK_STATUSES[taskStatus] || '';
    }

    function renderProgressBar() {
        let variant: ProgressVariant = PROGRESS_VARIANT.DETERMINATE;
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

            return (Object.entries(progress.tasks) as [StateStatus, TaskStatus][])
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
        <div className={styles.progress}>
            {
                progressItems.length > 0 ?
                    <>
                        <Heading level={3}>Status</Heading>

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
                    <Spinner data-size="lg" aria-label="Laster" />
            }
        </div>
    );
}
