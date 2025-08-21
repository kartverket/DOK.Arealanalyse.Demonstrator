import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: 'Starter opp...',
    step: 0,
    totalSteps: 4
};

export const datasetSlice = createSlice({
    name: 'dataset',
    initialState,
    reducers: {
        setStatus: (state, action) => {
            return {
                ...state,
                status: action.payload
            };
        },
        setTotalSteps: (state, action) => {
            return {
                ...state,
                totalSteps: state.totalSteps + action.payload
            };
        },
        addStep: (state) => {
            return {
                ...state,
                step: state.step + 1
            };
        },
        resetProgress: () => {
            return initialState
        }
    }
});

export const { setStatus, setTotalSteps, addStep, resetProgress } = datasetSlice.actions;

export default datasetSlice.reducer;