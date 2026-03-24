import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    correlationId: null,

    filteredResultIds: [],
    selectedResultId: 0,

    selectedResult: null,
    

    errorMessage: null,
    busy: false
    // mapImages: {}
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
        setResponse: (state, action) => {
            return {
                ...state,
                response: action.payload
            };
        },
        setFilteredResultIds: (state, action) => {
            return {
                ...state,
                filteredResultIds: action.payload
            };
        },
        setSelectedResultId: (state, action) => {
            return {
                ...state,
                selectedResultId: action.payload
            };
        },
        setErrorMessage: (state, action) => {
            return {
                ...state,
                errorMessage: action.payload
            };
        },
        setSelectedResult: (state, action) => {
            return {
                ...state,
                selectedResult: action.payload
            };
        },
        setBusy: (state, action) => {
            return {
                ...state,
                busy: action.payload
            };
        }
    }
});

export const {
    setCorrelationId,
    setSelectedResult,
    setFilteredResultIds,
    setSelectedResultId,
    setErrorMessage,
    setBusy
} = appSlice.actions;

export default appSlice.reducer;