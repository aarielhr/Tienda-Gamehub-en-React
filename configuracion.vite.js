
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Usar la carpeta donde está este archivo como raíz.
const raizProyecto = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: raizProyecto,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [
      fileURLToPath(
        new URL('./src/configuracionPruebas.js', import.meta.url)
      )
    ],
    clearMocks: true,
    include: ['src/**/*.pruebas.{js,jsx}']
  }
});
