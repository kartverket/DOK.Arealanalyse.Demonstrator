import type { AnalysisJob } from '@/types/api.types';
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

// Steg som vises når analysen kjøres asynkront og fremdriften hentes fra /jobs/{jobId}
export const JOB_STEP = {
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    FETCHING_RESULTS: 'FETCHING_RESULTS',
} as const;

export type JobStep = (typeof JOB_STEP)[keyof typeof JOB_STEP];

export const JOB_STEP_TEXT: Record<JobStep, string> = {
    [JOB_STEP.QUEUED]: 'Venter i kø',
    [JOB_STEP.RUNNING]: 'Kjører DOK-analyse',
    [JOB_STEP.FETCHING_RESULTS]: 'Henter resultat',
};

const JOB_STEPS: JobStep[] = [
    JOB_STEP.QUEUED,
    JOB_STEP.RUNNING,
    JOB_STEP.FETCHING_RESULTS,
];

export function getJobTasks(
    job: AnalysisJob,
    fetchingResults: boolean,
): [JobStep, TaskStatus][] {
    let current: JobStep = JOB_STEP.FETCHING_RESULTS;

    if (!fetchingResults && job.status === 'accepted') {
        current = JOB_STEP.QUEUED;
    } else if (!fetchingResults && job.status === 'running') {
        current = JOB_STEP.RUNNING;
    }

    const currentIndex = JOB_STEPS.indexOf(current);
    const inProgress = current !== JOB_STEP.FETCHING_RESULTS || fetchingResults;

    return JOB_STEPS.map((step, index) => {
        if (index < currentIndex) {
            return [step, TASK_STATUS.DONE];
        }

        if (index === currentIndex && inProgress) {
            return [step, TASK_STATUS.IN_PROGRESS];
        }

        return [step, TASK_STATUS.NOT_STARTED];
    });
}
