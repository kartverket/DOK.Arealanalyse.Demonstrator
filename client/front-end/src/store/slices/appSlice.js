import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    correlationId: null,
    selectedResult: null,
    selectedResultId: null,
    errorMessage: null
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
        }
    }
});

export const {
    setCorrelationId,
    setSelectedResult,
    setSelectedResultId,    
    setErrorMessage
} = appSlice.actions;

export default appSlice.reducer;