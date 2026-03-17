import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import progressReducer from './slices/progressSlice';

export default configureStore({
    reducer: {
        app: appReducer,
        progress: progressReducer
    }
});
