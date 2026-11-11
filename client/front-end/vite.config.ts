import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_API_PROXY_TARGET = 'http://127.0.0.1:5001';
const DEFAULT_SIO_PROXY_TARGET = 'http://127.0.0.1:5002';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, '');

    return {
        plugins: [react(), svgr()],
        resolve: {
            tsconfigPaths: true
        },
        server: {
            port: 5173,
            strictPort: true,
            proxy: {
                '/api': {
                    target: env.VITE_API_BASE_URL || DEFAULT_API_PROXY_TARGET,
                    changeOrigin: false,
                },
                '/ws': {
                    target: env.VITE_WS_BASE_URL || DEFAULT_SIO_PROXY_TARGET,
                    ws: true,
                    changeOrigin: false
                }
            }
        }
    }
});
