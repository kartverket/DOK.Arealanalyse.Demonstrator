import { createSlice } from '@reduxjs/toolkit';
import { getStatusText, STATUS, STATUS_TEXT } from 'utils/progress';

const initialState = {
    status: null,
    statusText: STATUS_TEXT[STATUS.STARTING_UP],
    analysesTotal: 0,
    analysisCount: 0,
    mapImagesTotal: 0,
    mapImageCount: 0,
    recipient: null
};

export const analysisSlice = createSlice({
    name: 'analysis',
    initialState,
    reducers: {
        updateState: (_, action) => {
            return {
                ...action.payload,
                statusText: getStatusText(action.payload)
            };
        },
        resetState: () => {
            return initialState;
        }
    }
});

export const { updateState, resetState } = analysisSlice.actions;

export default analysisSlice.reducer;