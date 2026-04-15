import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config — UiPath Coded App deployment
//
// base: './'
//   All asset URLs in the built index.html use relative paths, which is
//   required when UiPath hosts the app at an arbitrary sub-path.
//
// outDir: 'dist'
//   Standard Vite output directory.
//
// rollupOptions.output
//   Predictable, hash-free file names so the UiPath platform can
//   reference the entry bundle at a stable path (static/js/main.js).
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/main.js',
        chunkFileNames: 'static/js/[name].js',
        assetFileNames: (info) => {
          if (info.name?.endsWith('.css')) return 'static/css/[name][extname]'
          return 'static/media/[name][extname]'
        },
      },
    },
  },
}))
