import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/lib/api/api';
import { rtkQueryErrorCatcher } from './middleware';
import appReducer from './appSlice';
import progressReducer from '@/features/analysis-progress/progressSlice';
import responseReducer from '@/features/analysis-response/responseSlice';

export default configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        app: appReducer,
        progress: progressReducer,
        response: responseReducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({ serializableCheck: false })
            .concat(api.middleware)
            .concat(rtkQueryErrorCatcher);
    }
});
