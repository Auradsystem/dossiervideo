import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type pour les utilisateurs
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}
