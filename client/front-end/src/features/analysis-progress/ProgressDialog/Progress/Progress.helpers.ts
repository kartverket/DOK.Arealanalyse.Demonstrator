import type {
    ProgressMessage,
    StateStatus,
    TaskStatus,
} from '@/types/socket.types';

export const STATE_STATUS = {
    STARTING_UP: 'STARTING_UP',
    ANALYZING_DATASETS: 'ANALYZING_DATASETS',
    CREATING_FACT_SHEET: 'CREATING_FACT_SHEET',
    CREATING_MAP_IMAGES: 'CREATING_MAP_IMAGES',
    CREATING_REPORT: 'CREATING_REPORT',
} as const satisfies Record<StateStatus, StateStatus>;

export const TASK_STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
} as const satisfies Record<TaskStatus, TaskStatus>;

export const STATUS_TEXT: Record<StateStatus, string> = {
    [STATE_STATUS.STARTING_UP]: 'Starter opp',
    [STATE_STATUS.ANALYZING_DATASETS]: 'Analyserer datasett',
    [STATE_STATUS.CREATING_FACT_SHEET]: 'Lager faktainformasjon',
    [STATE_STATUS.CREATING_MAP_IMAGES]: 'Lager kartbilder',
    [STATE_STATUS.CREATING_REPORT]: 'Lager rapport',
};

export function getStatusText(
    stateStatus: StateStatus,
    taskStatus: TaskStatus,
    state: ProgressMessage,
): string {
    let text = STATUS_TEXT[stateStatus];

    if (taskStatus != TASK_STATUS.NOT_STARTED) {
        if (stateStatus == STATE_STATUS.ANALYZING_DATASETS) {
            text += ` (${state.analysisCount} av ${state.analysesTotal})`;
        } else if (stateStatus == STATE_STATUS.CREATING_MAP_IMAGES) {
            text += ` (${state.mapImageCount} av ${state.mapImagesTotal})`;
        }
    }

    return text;
}
