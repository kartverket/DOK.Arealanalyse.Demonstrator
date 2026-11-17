import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ProgressMessage } from '@/types/socket.types';

export interface ProgressState extends ProgressMessage {
    // Jobbene som er startet tidligere i økten. Socketen er felles for alle kjøringene,
    // så meldinger om disse jobbene skal ikke blandes inn i den aktive analysen.
    previousJobIds: string[];

    // Status-dialogen er åpen fra analysen startes til brukeren går til resultatet eller lukker den
    dialogOpen: boolean;
}

const initialState: ProgressState = {
    status: null,
    analysesTotal: 0,
    analysisCount: 0,
    mapImagesTotal: 0,
    mapImageCount: 0,
    tasks: null,
    recipient: null,
    jobId: null,
    previousJobIds: [],
    dialogOpen: false,
};

export const progressSlice = createSlice({
    name: 'progress',
    initialState,
    reducers: {
        updateProgress: (
            state,
            action: PayloadAction<Partial<ProgressMessage>>,
        ) => {
            const jobId = action.payload.jobId ?? null;
            if (jobId !== null && !isActiveJob(state, jobId)) {
                return state;
            }

            return {
                ...state,
                ...action.payload,
                jobId: jobId ?? state.jobId,
            };
        },
        setJobId: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                jobId: action.payload,
            };
        },
        startProgress: (state) => {
            return {
                ...initialState,
                previousJobIds:
                    state.jobId !== null
                        ? [...state.previousJobIds, state.jobId]
                        : state.previousJobIds,
                dialogOpen: true,
            };
        },
        closeProgressDialog: (state) => {
            return {
                ...state,
                dialogOpen: false,
            };
        },
    },
});

function isActiveJob(state: ProgressState, jobId: string): boolean {
    return state.jobId !== null
        ? state.jobId === jobId
        : !state.previousJobIds.includes(jobId);
}

export const { updateProgress, setJobId, startProgress, closeProgressDialog } =
    progressSlice.actions;

export default progressSlice.reducer;
