import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import {
    getJobTasks,
    getStatusText,
    JOB_STEP,
    JOB_STEP_TEXT,
    STATE_STATUS,
    TASK_STATUS,
    type JobStep,
} from './Progress.helpers';
import ProgressBar, {
    PROGRESS_VARIANT,
    type ProgressVariant,
} from '@/components/ProgressBar/ProgressBar';
import { Heading, Spinner } from 'dibk-designsystemet';
import styles from './Progress.module.scss';

import type { StateStatus, TaskStatus } from '@/types/socket.types';

const TASK_STATUSES: Record<TaskStatus, string> = {
    [TASK_STATUS.NOT_STARTED]: styles.notStarted,
    [TASK_STATUS.IN_PROGRESS]: styles.inProgress,
    [TASK_STATUS.DONE]: styles.done,
};

export default function Progress() {
    const progress = useAppSelector((state) => state.progress);

    function getStatusCssClass(taskStatus: TaskStatus) {
        return TASK_STATUSES[taskStatus] || '';
    }

    function renderProgressBar(step: StateStatus | JobStep) {
        let variant: ProgressVariant = PROGRESS_VARIANT.DETERMINATE;
        let value = 0;
        const jobProgress = progress.job?.progress ?? 0;
        if (
            step === JOB_STEP.RUNNING &&
            jobProgress > 10 &&
            jobProgress < 100
        ) {
            // pygeoapi setter 10 når jobben starter; høyere verdier gir en reell fremdrift
            value = jobProgress / 100;
        } else if (progress.job !== null) {
            variant = PROGRESS_VARIANT.INDETERMINATE;
        } else if (progress.status === STATE_STATUS.ANALYZING_DATASETS) {
            value = progress.analysisCount / progress.analysesTotal;
        } else if (progress.status === STATE_STATUS.CREATING_MAP_IMAGES) {
            value = progress.mapImageCount / progress.mapImagesTotal;
        } else {
            variant = PROGRESS_VARIANT.INDETERMINATE;
        }

        return (
            <ProgressBar
                variant={variant}
                value={value}
            />
        );
    }

    const progressItems = useMemo(() => {
        if (progress.job !== null) {
            return getJobTasks(progress.job, progress.fetchingResults).map(
                ([step, taskStatus], index) => ({
                    number: index + 1,
                    step,
                    cssClass: getStatusCssClass(taskStatus),
                    text: JOB_STEP_TEXT[step],
                    taskStatus,
                }),
            );
        }

        if (progress.tasks === null) {
            return [];
        }

        return (
            Object.entries(progress.tasks) as [StateStatus, TaskStatus][]
        ).map(([stateStatus, taskStatus], index) => ({
            number: index + 1,
            step: stateStatus as StateStatus | JobStep,
            cssClass: getStatusCssClass(taskStatus),
            text: getStatusText(stateStatus, taskStatus, progress),
            taskStatus,
        }));
    }, [progress]);

    return (
        <div className={styles.progress}>
            {progressItems.length > 0 ? (
                <>
                    <Heading level={3}>Status</Heading>

                    <div className={styles.statuses}>
                        {progressItems.map((item) => (
                            <div
                                key={item.number}
                                className={`${styles.status} ${item.cssClass}`}
                            >
                                <span className={styles.icon}>
                                    {item.taskStatus !== TASK_STATUS.DONE
                                        ? item.number
                                        : ''}
                                </span>
                                <div>
                                    <span>{item.text}</span>
                                    <div className={styles.progressBar}>
                                        {item.taskStatus ===
                                            TASK_STATUS.IN_PROGRESS &&
                                            renderProgressBar(item.step)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <Spinner
                    data-size="lg"
                    aria-label="Laster"
                />
            )}
        </div>
    );
}
