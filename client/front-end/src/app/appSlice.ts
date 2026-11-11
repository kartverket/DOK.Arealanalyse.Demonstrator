import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CrsGeometry, LonLat } from '@/types/geo.types';

export interface AnalysisFormData {
    inputGeometry: CrsGeometry | null;
    requestedBuffer: string;
    context: string;
    theme: string;
    includeGuidance: boolean;
    includeQualityMeasurement: boolean;
    includeFilterChosenDOK: boolean;
    includeFacts: boolean;
    createBinaries: boolean;
}

export type FormDataField = {
    [K in keyof AnalysisFormData]: { name: K; value: AnalysisFormData[K] };
}[keyof AnalysisFormData];

export interface CurrentLocation {
    coordinates: LonLat | null;
    kommunenummer: string | null;
}

export type ToastType = 'danger' | 'warning' | 'success' | 'info';

export interface Toast {
    message: string;
    type: ToastType;
}

interface AppState {
    correlationId: string | null;
    formData: AnalysisFormData;
    currentLocation: CurrentLocation;
    toast: Toast | null;
    errorMessage: string | null;
    analysisId: number;
    busy: boolean;
    factInfoOpen: boolean;
}

const initialState: AppState = {
    correlationId: null,
    formData: {
        inputGeometry: null,
        requestedBuffer: '0',
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
    analysisId: 0,
    busy: false,
    factInfoOpen: false
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setCorrelationId: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                correlationId: action.payload
            };
        },
        setFormData: (state, action: PayloadAction<FormDataField>) => {
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.name]: action.payload.value
                }
            };
        },
        setCurrentLocation: (state, action: PayloadAction<CurrentLocation>) => {
            return {
                ...state,
                currentLocation: action.payload
            };
        },
        setToast: (state, action: PayloadAction<{ message: string; type?: ToastType } | null>) => {
            let toast: Toast | null = null;

            if (action.payload !== null) {
                toast = {
                    ...action.payload,
                    type: action.payload.type || 'danger'
                };
            }

            return {
                ...state,
                toast
            };
        },
        analyzeStart: (state) => {
            return {
                ...state,
                analysisId: state.analysisId + 1,
                busy: true
            };
        },
        analyzeFinish:  (state) => {
            return {
                ...state,
                busy: false
            };
        },
        toggleFactInfo: (state, action: PayloadAction<boolean>) => {
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
    setToast,
    analyzeStart,
    analyzeFinish,
    toggleFactInfo
} = appSlice.actions;

export default appSlice.reducer;
