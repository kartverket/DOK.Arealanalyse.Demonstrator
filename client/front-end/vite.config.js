import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import jsconfigPaths from 'vite-jsconfig-paths';
import { fileURLToPath } from 'url';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        jsconfigPaths()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
