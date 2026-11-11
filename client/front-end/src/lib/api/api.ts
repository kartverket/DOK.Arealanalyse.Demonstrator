import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CrsGeometry } from '@/types/geo.types';
import type {
    AnalysisPayload,
    AnalysisResponse,
    AreaFeature,
    EiendomArgs,
    KommuneByPointArgs,
    KommuneFeature,
    KommuneFeatureCollection,
    OmrådeArgs,
    PlanArgs,
    Sample,
    SearchArgs,
    SearchFeatureCollection
} from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        analyze: builder.mutation<AnalysisResponse, { payload: AnalysisPayload }>({
            query: ({ payload }) => ({
                url: 'pygeoapi',
                body: payload,
                method: 'POST'
            })
        }),
        getDokTema: builder.query<string[], void>({
            query: () => 'doktema'
        }),
        getEksempler: builder.query<Sample[], void>({
            query: () => 'eksempler'
        }),
        getKommuner: builder.query<KommuneFeatureCollection, void>({
            query: () => 'kommuner'
        }),
        getKommuneByPoint: builder.query<KommuneFeature | null, KommuneByPointArgs>({
            query: ({ coordinates }) => `kommuner/punkt/${coordinates[0]}/${coordinates[1]}`
        }),
        getOmråde: builder.mutation<CrsGeometry | null, OmrådeArgs>({
            query: ({ file, epsg }) => {
                const formData = new FormData();

                formData.append('file', file);
                formData.append('out_epsg', String(epsg));

                return {
                    url: 'omrade',
                    body: formData,
                    method: 'POST'
                }
            }
        }),
        getEiendom: builder.mutation<AreaFeature | null, EiendomArgs>({
            query: ({ geometry }) => ({
                url: 'eiendom',
                body: geometry,
                method: 'POST'
            })
        }),
        getReguleringsplan: builder.query<AreaFeature | null, PlanArgs>({
            query: ({ kommunenummer, planId }) => `plan/reguleringsplan/${kommunenummer}/${planId}`
        }),
        getReguleringsplanforslag: builder.query<AreaFeature | null, PlanArgs>({
            query: ({ kommunenummer, planId }) => `plan/reguleringsplanforslag/${kommunenummer}/${planId}`
        }),
        search: builder.query<SearchFeatureCollection, SearchArgs>({
            query: ({ kommunenummer, query }) => `sok/${kommunenummer}?q=${query}`
        })
    })
});

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
    useGetOmrådeMutation
} = api;
