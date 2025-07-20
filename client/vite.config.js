import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8081,
        proxy: {
            '/api': {
                target: 'http://localhost:3100',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, '/api'),
            },
        },
    },
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src',
                import.meta.url)),
        },
    },
});