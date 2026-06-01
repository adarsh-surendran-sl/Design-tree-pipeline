import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../public/remotion-preview'),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/design-preview.jsx'),
      name: 'DesignPreview',
      formats: ['es'],
      fileName: () => 'design-preview.js',
    },
    rollupOptions: {
      external: [],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})
