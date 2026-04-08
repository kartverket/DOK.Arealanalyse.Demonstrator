export const STATE_STATUS = {
    STARTING_UP: 'STARTING_UP',
    ANALYZING_DATASETS: 'ANALYZING_DATASETS',
    CREATING_FACT_SHEET: 'CREATING_FACT_SHEET',
    CREATING_MAP_IMAGES: 'CREATING_MAP_IMAGES',
    CREATING_REPORT: 'CREATING_REPORT'
};

export const TASK_STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE'
};

export const STATUS_TEXT = {
    [STATE_STATUS.STARTING_UP]: 'Starter opp',
    [STATE_STATUS.ANALYZING_DATASETS]: 'Analyserer datasett',
    [STATE_STATUS.CREATING_FACT_SHEET]: 'Lager faktainformasjon',
    [STATE_STATUS.CREATING_MAP_IMAGES]: 'Lager kartbilder',
    [STATE_STATUS.CREATING_REPORT]: 'Lager rapport'
};


export function getStatusText(stateStatus, taskStatus, state) {
    let text = STATUS_TEXT[stateStatus];

    if (taskStatus != TASK_STATUS.NOT_STARTED) {
        if (stateStatus == STATE_STATUS.ANALYZING_DATASETS) {
            text += ` (${state.analysisCount} av ${state.analysesTotal})`;
        } else if (stateStatus == STATE_STATUS.CREATING_MAP_IMAGES) {
            text += ` (${state.mapImageCount} av ${state.mapImagesTotal})`
        }
    }

    return text;
}
