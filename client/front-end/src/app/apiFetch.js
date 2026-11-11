import store from './store';

export const apiFetch = async (endpoint, params, cache = true) => {
    const promise = store.dispatch(endpoint.initiate(params));

    if (!cache && promise.unsubscribe) {
        promise.unsubscribe();
    }

    return await promise.unwrap();
}
