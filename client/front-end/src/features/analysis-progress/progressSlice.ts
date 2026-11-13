import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AnalysisJob } from '@/types/api.types';
import type { ProgressMessage } from '@/types/socket.types';

export interface ProgressState extends ProgressMessage {
    // Satt når analysen kjøres asynkront; fremdriften hentes da fra /jobs/{jobId}
    job: AnalysisJob | null;
    fetchingResults: boolean;
}

const initialState: ProgressState = {
    status: null,
    analysesTotal: 0,
    analysisCount: 0,
    mapImagesTotal: 0,
    mapImageCount: 0,
    tasks: null,
    recipient: null,
    job: null,
    fetchingResults: false,
};

export const progressSlice = createSlice({
    name: 'progress',
    initialState,
    reducers: {
        updateProgress: (
            state,
            action: PayloadAction<Partial<ProgressMessage>>,
        ) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        updateJob: (state, action: PayloadAction<AnalysisJob>) => {
            return {
                ...state,
                job: action.payload,
            };
        },
        setFetchingResults: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                fetchingResults: action.payload,
            };
        },
        resetProgress: () => {
            return initialState;
        },
    },
});

export const { updateProgress, updateJob, setFetchingResults, resetProgress } =
    progressSlice.actions;

export default progressSlice.reducer;
