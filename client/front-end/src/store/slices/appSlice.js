import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    correlationId: null,
    selectedResult: null,
    filteredResultIds: [],
    selectedResultId: 0,
    errorMessage: null,
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
        setSelectedResult: (state, action) => {
            return {
                ...state,
                selectedResult: action.payload
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
        // addMapImage: (state, action) => {
        //     return {
        //         ...state,
        //         mapImages: {
        //             ...state.mapImages,
        //             [action.payload.id]: action.payload.imageUri
        //         }
        //     };
        // },
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
    setFilteredResultIds,
    setSelectedResultId,
    setErrorMessage
} = appSlice.actions;

export default appSlice.reducer;