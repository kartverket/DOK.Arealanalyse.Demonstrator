import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import store from 'store';
import { setToast } from 'store/slices/appSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: [
        'PlanIds',
        'Reguleringsplan',
        'Reguleringsplanforslag',
        'Search'
    ],
    endpoints: (builder) => ({
        getKommuner: builder.query({
            query: () => 'kommuner',
        }),
        getReguleringsplan: builder.query({
            query: ({ kommunenummer, planId }) => `plan/reguleringsplan/${kommunenummer}/${planId}`,
            providesTags: (result, error, { kommunenummer, planId }) => [
                { type: 'Reguleringsplan', kommunenummer, planId }
            ]
        }),
        getReguleringsplanforslag: builder.query({
            query: ({ kommunenummer, planId }) => `plan/reguleringsplanforslag/${kommunenummer}/${planId}`,
            providesTags: (result, error, { kommunenummer, planId }) => [
                { type: 'Reguleringsplanforslag', kommunenummer, planId }
            ]
        }),
        getEiendom: builder.mutation({
            query: ({ geometry }) => ({
                url: 'eiendom',
                body: geometry,
                method: 'POST'
            })
        }),
        search: builder.query({
            query: ({ kommunenummer, query }) => `sok/${kommunenummer}?q=${query}`,
            providesTags: (result, error, { kommunenummer, query }) => [
                { type: 'Search', kommunenummer, query }
            ]
        })
    })
});

export const apiFetch = async (endpoint, params, cache = true) => {
    try {
        const promise = store.dispatch(endpoint.initiate(params));

        if (!cache && promise.unsubscribe) {
            promise.unsubscribe();
        }

        return await promise.unwrap();
    } catch (error) {
        showError(error);
        throw error;
    }
}

function showError(error) {
    const message = error.response.data.detail;
    store.dispatch(setToast({ message }));
}

export const {
    useGetKommunerQuery,
    useGetReguleringsplanQuery,
    useGetReguleringsplanforslagQuery,
    useSearchQuery,
    useGetEiendomMutation
} = api;
