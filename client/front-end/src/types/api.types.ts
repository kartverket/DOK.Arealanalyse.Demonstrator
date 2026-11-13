import type { CrsGeometry, LonLat } from './geo.types';
import type { Feature, FeatureCollection, Geometry, MultiPoint } from 'geojson';

// Analyse (pygeoapi-prosessen «dokanalyse»)

export type ResultStatus =
    | 'HIT-RED'
    | 'HIT-YELLOW'
    | 'NO-HIT-YELLOW'
    | 'NO-HIT-GREEN'
    | 'NOT-RELEVANT'
    | 'NOT-IMPLEMENTED'
    | 'TIMEOUT'
    | 'ERROR';

export interface AnalysisInputs {
    inputGeometry: CrsGeometry | null;
    requestedBuffer: number;
    context: string | null;
    theme: string | null;
    includeGuidance: boolean;
    includeQualityMeasurement: boolean;
    includeFilterChosenDOK: boolean;
    includeFacts: boolean;
    createBinaries: boolean;
    correlationId: string | null;
}

export interface AnalysisPayload {
    inputs: AnalysisInputs;
}

export interface AnalysisResponse {
    resultList: AnalysisResult[];
    inputGeometry: CrsGeometry;
    inputGeometryArea: number;
    municipalityNumber: string;
    municipalityName: string;
    report: string | null;
    factSheetRasterResult: RasterResult;
    factSheetCartography: string | null;
    factList: FactPart[];
}

// Asynkron kjøring (OGC API - Processes, /jobs/{jobId})
export type JobStatus =
    | 'accepted'
    | 'running'
    | 'successful'
    | 'failed'
    | 'dismissed';

export interface AnalysisJob {
    jobID: string;
    status: JobStatus;
    message?: string | null;
    progress?: number | null;
    created?: string | null;
    started?: string | null;
    finished?: string | null;
    updated?: string | null;
}

export interface AnalysisJobList {
    jobs: AnalysisJob[];
    numberMatched: number;
}

export interface JobListArgs {
    limit: number;
    offset: number;
}

export interface AnalyzeArgs {
    payload: AnalysisPayload;
    respondAsync: boolean;
}

export interface AnalyzeResult {
    response: AnalysisResponse | AnalysisJob;

    // Fra headeren «X-Job-Id»; null hvis process manageren i pygeoapi ikke lagrer jobber
    jobId: string | null;
}

export interface AnalysisResult {
    title: string | null;
    runOnInputGeometry: CrsGeometry;
    buffer: number;
    runAlgorithm: string[];
    inputGeometryArea: number;
    hitArea: number | null;
    resultStatus: ResultStatus;
    distanceToObject: number;
    rasterResult: RasterResult;
    cartography: string | null;
    data: Record<string, unknown>[];
    themes: string[];
    runOnDataset: Dataset | null;
    description: string | null;
    guidanceText: string | null;
    guidanceUri: GuidanceUri[];
    possibleActions: string[];
    qualityMeasurement: QualityMeasurement[];
    qualityWarning: string[];

    meta: {
        statusCode: number;
        duration: number;
        log: string | null;
    };
}

export interface RasterResult {
    imageUri: string | null;
    mapUri: string | null;
}

export interface Dataset {
    datasetId: string;
    title: string;
    description: string;
    owner: string;
    updated: string | null;
    datasetDescriptionUri: string;
}

export interface GuidanceUri {
    href: string;
    title: string;
}

export interface QualityMeasurement {
    qualityDimensionId: string;
    qualityDimensionName: string;
    value: string | number | boolean;
    comment: string | null;
}

export interface FactPart<TData = unknown> {
    runOnInputGeometry: CrsGeometry;
    buffer: number;
    runOnDataset: Dataset | null;
    runAlgorithm: string[];
    data: TData;
    dataTemplate: string | null;
}

export interface AreaTypesData {
    inputArea: number;
    areaTypes: AreaType[];
}

export interface AreaType {
    areaType: string;
    area: number;
}

export interface BuildingCount {
    category: string;
    count: number;
}

export interface RoadLength {
    roadType: string;
    length: number;
}

// Web-API (client/api)

export interface Sample {
    name: string;
    description: string | null;
    fileName: string;
    geoJson: CrsGeometry;
}

export interface KommuneProperties {
    kommunenummer: string;
    kommunenavn: string;
}

export type KommuneFeature = Feature<MultiPoint, KommuneProperties>;
export type KommuneFeatureCollection = FeatureCollection<
    MultiPoint,
    KommuneProperties
>;

export interface KommuneByPointArgs {
    coordinates: LonLat;
}

export interface AreaProperties {
    tittel: string;
    [key: string]: unknown;
}

export type AreaFeature = Feature<CrsGeometry, AreaProperties>;

export interface OmrådeArgs {
    file: File;
    epsg: number;
}

export interface EiendomArgs {
    geometry: Geometry;
}

export interface PlanArgs {
    kommunenummer: string;
    planId: string;
}

export interface SearchArgs {
    kommunenummer: string;
    query: string;
}

export type SearchProperties =
    | {
          type: 'Eiendom';
          value: string;

          data: {
              matrikkelnummer: string;
              kommunenummer: string;
              kommunenavn: string | null;
          };
      }
    | {
          type: 'Vegadresse';
          value: string;

          data: {
              matrikkelnummer: string;
              adressetekst: string;
              kommunenummer: string;
              kommunenavn: string | null;
          };
      }
    | {
          type: 'Reguleringsplan' | 'Reguleringsplanforslag';
          value: string;

          data: {
              planId: string;
          };
      };

export type SearchFeature = Feature<Geometry | null, SearchProperties> & {
    id: number;
};

export interface SearchFeatureCollection {
    type: 'FeatureCollection';
    features: SearchFeature[];
}
