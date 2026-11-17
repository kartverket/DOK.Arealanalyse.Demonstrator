import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ProgressMessage } from '@/types/socket.types';

export interface ProgressState extends ProgressMessage {
    // Jobbene som er startet tidligere i økten. Socketen er felles for alle kjøringene,
    // så meldinger om disse jobbene skal ikke blandes inn i den aktive analysen.
    previousJobIds: string[];
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
        resetProgress: (state) => {
            return {
                ...initialState,
                previousJobIds:
                    state.jobId !== null
                        ? [...state.previousJobIds, state.jobId]
                        : state.previousJobIds,
            };
        },
    },
});

function isActiveJob(state: ProgressState, jobId: string): boolean {
    return state.jobId !== null
        ? state.jobId === jobId
        : !state.previousJobIds.includes(jobId);
}

export const { updateProgress, setJobId, resetProgress } =
    progressSlice.actions;

export default progressSlice.reducer;
