import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    correlationId: null,
    formData: {
        inputGeometry: null,
        requestedBuffer: 0,
        context: '',
        theme: '',
        includeGuidance: true,
        includeQualityMeasurement: true,
        includeFilterChosenDOK: false,
        includeFacts: true,
        createBinaries: false
    },
    currentLocation: {
        coordinates: null,
        kommunenummer: null
    },
    toast: null,
    errorMessage: null,
    analyzisId: 0,
    busy: false,
    factInfoOpen: false
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
        setFormData: (state, action) => {
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.name]: action.payload.value
                }
            };
        },
        setCurrentLocation: (state, action) => {
            return {
                ...state,
                currentLocation: action.payload
            };
        },        
        setToast: (state, action) => {
            let toast = null;

            if (action.payload !== null) {
                toast = { ...action.payload };
                toast.type = toast.type || 'danger';
            }

            return {
                ...state,
                toast
            };
        },
        analyzeStart: (state) => {
            return {
                ...state,
                analyzisId: state.analyzisId + 1,
                busy: true
            };
        },
        analyzeFinish:  (state) => {
            return {
                ...state,
                busy: false
            };
        },
        toggleFactInfo: (state, action) => {
            return {
                ...state,
                factInfoOpen: action.payload
            };
        }
    }
});

export const {
    setCorrelationId,
    setFormData,
    setCurrentLocation,
    setErrorMessage,
    setToast,
    analyzeStart,
    analyzeFinish,
    toggleFactInfo
} = appSlice.actions;

export default appSlice.reducer;

