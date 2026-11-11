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
        updateProgress: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },
        resetProgress: () => {
            return initialState;
        }
    }
});

export const { 
    updateProgress, 
    resetProgress 
} = progressSlice.actions;

export default progressSlice.reducer;