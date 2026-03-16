import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: null,    
    analysesTotal: 0,
    analysisCount: 0,
    mapImagesTotal: 0,
    mapImageCount: 0,
    tasks: null,
    recipient: null
};

export const progressSlice = createSlice({
    name: 'progress',
    initialState,
    reducers: {
        updateState: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },
        resetState: () => {
            return initialState;
        }
    }
});

export const { updateState, resetState } = progressSlice.actions;

export default progressSlice.reducer;