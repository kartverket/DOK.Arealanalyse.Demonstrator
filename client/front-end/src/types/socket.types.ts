export type StateStatus =
    | 'STARTING_UP'
    | 'ANALYZING_DATASETS'
    | 'CREATING_FACT_SHEET'
    | 'CREATING_MAP_IMAGES'
    | 'CREATING_REPORT';

export type TaskStatus =
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'DONE';

export interface ProgressMessage {
    status: StateStatus | null;
    analysesTotal: number;
    analysisCount: number;
    mapImagesTotal: number;
    mapImageCount: number;
    tasks: Partial<Record<StateStatus, TaskStatus>> | null;
    recipient: string | null;
}

export interface ServerToClientEvents {
    client_connected: (correlationId: string) => void;
    state_updated: (message: ProgressMessage) => void;
}
