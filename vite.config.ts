import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
    esbuildOptions: {
      // Augmenter la limite de mémoire pour esbuild
      target: 'es2020',
      // Désactiver la minification pendant le développement
      minify: false,
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Réduire la charge sur esbuild
    minify: 'terser',
    terserOptions: {
      compress: {
        // Réduire l'agressivité de la compression
        passes: 1
      }
    }
  },
  server: {
    hmr: {
      overlay: true,
    },
    // Augmenter le timeout pour éviter les arrêts inattendus
    watch: {
      usePolling: true,
      interval: 1000,
    }
  },
})
