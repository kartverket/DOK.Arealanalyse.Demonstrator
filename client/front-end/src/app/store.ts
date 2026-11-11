import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/lib/api/api';
import appReducer from './appSlice';
import { rtkQueryErrorCatcher } from './middleware';
import progressReducer from '@/features/analysis-progress/progressSlice';
import responseReducer from '@/features/analysis-response/responseSlice';

const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        app: appReducer,
        progress: progressReducer,
        response: responseReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({ serializableCheck: false })
            .concat(api.middleware)
            .concat(rtkQueryErrorCatcher);
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
