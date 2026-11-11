import store, { type RootState } from './store';

import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';

interface Initiatable<TArg, TResult> {
    initiate: (arg: TArg) => ThunkAction<
        {
            unwrap: () => Promise<TResult>;
            unsubscribe?: () => void;
        },
        RootState,
        unknown,
        UnknownAction
    >;
}

export const apiFetch = async <TArg, TResult>(
    endpoint: Initiatable<TArg, TResult>,
    params: TArg,
    cache = true,
): Promise<TResult> => {
    const promise = store.dispatch(endpoint.initiate(params));
    if (!cache && promise.unsubscribe) {
        promise.unsubscribe();
    }

    return await promise.unwrap();
};
