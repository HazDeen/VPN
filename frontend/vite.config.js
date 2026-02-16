import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/VPN/', // 👈 ВАЖНО! Имя твоего репозитория
});
