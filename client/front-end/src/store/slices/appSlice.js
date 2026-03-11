import { createSlice } from '@reduxjs/toolkit';
import { clone } from 'ol/extent';

const initialState = {
    correlationId: null,
    selectedResult: null,
    errorMessage: null,
    statusFilters: ['mustHandle']
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setCorrelationId: (state, action) => {
            return {
                ...state,
                correlationId: action.payload
            };
        },
        setSelectedResult: (state, action) => {
            return {
                ...state,
                selectedResult: action.payload
            };
        },
        setStatusFilter: (state, action) => {
            const status = action.payload;
            const index = state.statusFilters.indexOf(status);

            if (index === -1) {
                return {
                    ...state,
                    statusFilters: [
                        ...state.statusFilters,
                        status
                    ]
                };
            }

            const clone = [...state.statusFilters]
            clone.splice(index, 1);

            return {
                ...state,
                statusFilters: clone
            }
        },
        setErrorMessage: (state, action) => {
            return {
                ...state,
                errorMessage: action.payload
            };
        }
    }
});

export const {
    setCorrelationId,
    setSelectedResult,
    setStatusFilter,
    setErrorMessage
} = appSlice.actions;

export default appSlice.reducer;