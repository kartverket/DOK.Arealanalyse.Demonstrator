import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import store from 'store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        analyze: builder.mutation({
            query: ({ payload }) => ({
                url: 'pygeoapi',
                body: payload,
                method: 'POST'
            })
        }),
        getDokTema: builder.query({
            query: () => 'doktema'
        }),
        getEksempler: builder.query({
            query: () => 'eksempler'
        }),
        getKommuner: builder.query({
            query: () => 'kommuner'
        }),
        getKommuneByPoint: builder.query({
            query: ({ coordinates }) => `kommuner/punkt/${coordinates[0]}/${coordinates[1]}`
        }),
        getOmråde: builder.mutation({
            query: ({ file, epsg }) => {
                const formData = new FormData();

                formData.append('file', file);
                formData.append('out_epsg', epsg);

                return {
                    url: 'omrade',
                    body: formData,
                    method: 'POST'
                }
            }
        }),
        getEiendom: builder.mutation({
            query: ({ geometry }) => ({
                url: 'eiendom',
                body: geometry,
                method: 'POST'
            })
        }),
        getReguleringsplan: builder.query({
            query: ({ kommunenummer, planId }) => `plan/reguleringsplan/${kommunenummer}/${planId}`
        }),
        getReguleringsplanforslag: builder.query({
            query: ({ kommunenummer, planId }) => `plan/reguleringsplanforslag/${kommunenummer}/${planId}`
        }),
        search: builder.query({
            query: ({ kommunenummer, query }) => `sok/${kommunenummer}?q=${query}`
        }),
        validate: builder.mutation({
            query: ({ geometry }) => ({
                url: 'valider',
                body: geometry,
                method: 'POST'
            })
        })    
    })
});

export const apiFetch = async (endpoint, params, cache = true) => {
    const promise = store.dispatch(endpoint.initiate(params));

    if (!cache && promise.unsubscribe) {
        promise.unsubscribe();
    }

    return await promise.unwrap();
}

export const {
    useGetDokTemaQuery,
    useGetEksemplerQuery,
    useGetKommunerQuery,
    useGetKommuneByPointQuery,
    useGetReguleringsplanQuery,
    useGetReguleringsplanforslagQuery,
    useSearchQuery,
    useAnalyzeMutation,
    useGetEiendomMutation,
    useGetOmrådeMutation,
    useValidateMutation
} = api;
