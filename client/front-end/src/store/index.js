import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import analysisReducer from './slices/analysisSlice';
import datasetReducer from './slices/datasetSlice';

export default configureStore({
    reducer: {
        app: appReducer,
        analysis: analysisReducer,
        dataset: datasetReducer
    }
});
