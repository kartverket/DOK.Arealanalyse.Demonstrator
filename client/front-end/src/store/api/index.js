import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import store from 'store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: [
        'PlanIds',
        'Eiendommer'
    ],
    endpoints: (builder) => ({
        getKommuner: builder.query({
            query: () => 'kommuner',
        }),
        getPlanIds: builder.query({
            query: ({ kommunenummer }) => `reguleringsplaner/planids/${kommunenummer}`,
            providesTags: (result, error, arg) => [
                { type: 'PlanIds', kommunenummer: arg }
            ]
        }),
        search: builder.query({
            query: ({ kommunenummer, query }) => `eiendom/${kommunenummer}/sok?q=${query}`,
            providesTags: (result, error, { kommunenummer, query }) => [
                { type: 'Eiendommer', kommunenummer, query }
            ]
        })
    })
});

export const apiFetch = async func => {
    const promise = store.dispatch(func());
    promise.unsubscribe()

    return await promise.unwrap()    
}

export const {
    useGetKommunerQuery,
    useGetPlanIdsQuery,
    useSearchQuery
} = api;
