import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import progressReducer from './slices/progressSlice';
import datasetReducer from './slices/datasetSlice';

export default configureStore({
    reducer: {
        app: appReducer,
        progress: progressReducer,
        dataset: datasetReducer
    }
});
