import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/VPN/', // Это всё ещё нужно для путей к файлам
});
