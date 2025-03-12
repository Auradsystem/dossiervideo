import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Rendre les variables d'environnement disponibles dans l'application
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_SUPABASE_SERVICE_KEY': JSON.stringify(env.SUPABASE_SERVICE_KEY || '')
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
