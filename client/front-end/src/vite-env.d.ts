/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_WS_BASE_URL: string;
    readonly VITE_DATAFUNN_URL: string;
    readonly VITE_PYGEOAPI_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
