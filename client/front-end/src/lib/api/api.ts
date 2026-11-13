import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
    AnalysisJob,
    AnalysisJobList,
    AnalysisResponse,
    AnalyzeArgs,
    AnalyzeResult,
    EiendomArgs,
    KommuneByPointArgs,
    KommuneFeature,
    JobListArgs,
    KommuneFeatureCollection,
    OmrådeArgs,
    PlanArgs,
    Sample,
    SearchArgs,
    SearchFeatureCollection,
} from '@/types/api.types';
import type { CrsGeometry } from '@/types/geo.types';
import type {
    DaysArgs,
    IncidentArgs,
    IncidentList,
    StatusOverview,
    TargetStatistics,
    Timeline,
    TimelineArgs,
} from '@/types/health.types';
import type { MultiPolygon, Polygon } from 'geojson';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        analyze: builder.mutation<AnalyzeResult, AnalyzeArgs>({
            query: ({ payload, respondAsync }) => ({
                url: 'pygeoapi',
                body: payload,
                method: 'POST',
                headers: respondAsync ? { Prefer: 'respond-async' } : undefined,
            }),
            transformResponse: (
                response: AnalysisResponse | AnalysisJob,
                meta,
            ) => ({
                response,
                jobId: meta?.response?.headers.get('X-Job-Id') ?? null,
            }),
        }),
        getJobs: builder.query<AnalysisJobList, JobListArgs>({
            query: (params) => ({ url: 'pygeoapi/jobs', params }),
        }),
        getJob: builder.query<AnalysisJob, string>({
            query: (jobId) => `pygeoapi/jobs/${jobId}`,
        }),
        getJobResults: builder.query<AnalysisResponse, string>({
            query: (jobId) => `pygeoapi/jobs/${jobId}/results`,
        }),
        getDokTema: builder.query<string[], void>({
            query: () => 'doktema',
        }),
        getEksempler: builder.query<Sample[], void>({
            query: () => 'eksempler',
        }),
        getKommuner: builder.query<KommuneFeatureCollection, void>({
            query: () => 'kommuner',
        }),
        getKommuneByPoint: builder.query<
            KommuneFeature | null,
            KommuneByPointArgs
        >({
            query: ({ coordinates }) =>
                `kommuner/punkt/${coordinates[0]}/${coordinates[1]}`,
        }),
        getOmråde: builder.mutation<CrsGeometry | null, OmrådeArgs>({
            query: ({ file, epsg }) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('out_epsg', String(epsg));

                return {
                    url: 'omrade',
                    body: formData,
                    method: 'POST',
                };
            },
        }),
        getEiendom: builder.query<Polygon | MultiPolygon | null, EiendomArgs>({
            query: ({ kommunenummer, gardsnummer, bruksnummer, festenummer }) =>
                `eiendom/${kommunenummer}/${gardsnummer}/${bruksnummer}/${festenummer}`,
        }),
        getReguleringsplan: builder.query<CrsGeometry | null, PlanArgs>({
            query: ({ kommunenummer, planId }) =>
                `plan/reguleringsplan/${kommunenummer}/${planId}`,
        }),
        getReguleringsplanforslag: builder.query<CrsGeometry | null, PlanArgs>({
            query: ({ kommunenummer, planId }) =>
                `plan/reguleringsplanforslag/${kommunenummer}/${planId}`,
        }),
        search: builder.query<SearchFeatureCollection, SearchArgs>({
            query: ({ kommunenummer, query }) =>
                `sok/${kommunenummer}?q=${query}`,
        }),
        getStatus: builder.query<StatusOverview, void>({
            query: () => 'status',
        }),
        getStatusStatistics: builder.query<TargetStatistics[], DaysArgs>({
            query: (params) => ({ url: 'status/statistikk', params }),
        }),
        getStatusTimeline: builder.query<Timeline, TimelineArgs>({
            query: (params) => ({ url: 'status/tidslinje', params }),
        }),
        getStatusIncidents: builder.query<IncidentList, IncidentArgs>({
            query: (params) => ({ url: 'status/hendelser', params }),
        }),
    }),
});

export const {
    useGetDokTemaQuery,
    useGetEksemplerQuery,
    useGetKommunerQuery,
    useGetKommuneByPointQuery,
    useGetReguleringsplanQuery,
    useGetReguleringsplanforslagQuery,
    useSearchQuery,
    useGetStatusQuery,
    useGetStatusStatisticsQuery,
    useGetStatusTimelineQuery,
    useGetStatusIncidentsQuery,
    useGetJobsQuery,
    useGetJobQuery,
    useGetJobResultsQuery,
    useAnalyzeMutation,
    useGetEiendomQuery,
    useGetOmrådeMutation,
} = api;
