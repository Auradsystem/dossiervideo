import { createClient } from '@supabase/supabase-js';
import { User as AppUser } from '../types/User';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kvoezelnkzfvyikicjyr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b2V6ZWxua3pmdnlpa2ljanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDkwMzIsImV4cCI6MjA1NzM4NTAzMn0.Hf3ohn_zlFRQG8kAiVm58Ng4EGkV2HLTXlpwkkp_CiM';

// Créer le client Supabase avec la clé anonyme pour l'accès client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interface pour les métadonnées utilisateur dans Supabase
interface UserMetadata {
  is_admin?: boolean;
}

// Fonctions d'authentification
export const supabaseAuth = {
  // Inscription d'un nouvel utilisateur
  signUp: async (email: string, password: string, metadata: UserMetadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      return { 
        user: data.user ? mapSupabaseUser(data.user) : null, 
        session: data.session,
        error: null 
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return { user: null, session: null, error };
    }
  },
  
  // Connexion avec email/mot de passe
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { 
        user: data.user ? mapSupabaseUser(data.user) : null, 
        session: data.session,
        error: null 
      };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return { user: null, session: null, error };
    }
  },
  
  // Déconnexion
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
  },
  
  // Récupérer la session courante
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return { 
        session: data.session,
        user: data.session?.user ? mapSupabaseUser(data.session.user) : null,
        error: null 
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la session:', error);
      return { session: null, user: null, error };
    }
  },
  
  // Mettre à jour les métadonnées utilisateur
  updateUserMetadata: async (metadata: UserMetadata) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      
      if (error) throw error;
      
      return { 
        user: data.user ? mapSupabaseUser(data.user) : null,
        error: null 
      };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des métadonnées:', error);
      return { user: null, error };
    }
  },
  
  // Réinitialiser le mot de passe
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { data: null, error };
    }
  }
};

// Fonction pour convertir un utilisateur Supabase en utilisateur de l'application
function mapSupabaseUser(supabaseUser: any): AppUser {
  return {
    id: supabaseUser.id,
    username: supabaseUser.email,
    email: supabaseUser.email,
    isAdmin: supabaseUser.user_metadata?.is_admin || false,
    createdAt: new Date(supabaseUser.created_at),
    lastLogin: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined
  };
}

// Fonction pour initialiser les utilisateurs par défaut
export const initializeDefaultUsers = async (): Promise<void> => {
  try {
    // Vérifier si l'utilisateur admin existe déjà
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@plancam.com')
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'admin:', adminError);
    }
    
    // Si l'admin n'existe pas, le créer
    if (!adminData) {
      const { error } = await supabaseAuth.signUp('admin@plancam.com', 'Dali', { is_admin: true });
      
      if (error) {
        console.error('Erreur lors de la création de l\'admin:', error);
      } else {
        console.log('Utilisateur admin créé avec succès');
      }
    }
    
    // Vérifier si l'utilisateur par défaut existe déjà
    const { data: defaultUserData, error: defaultUserError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'user@plancam.com')
      .single();
    
    if (defaultUserError && defaultUserError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'utilisateur par défaut:', defaultUserError);
    }
    
    // Si l'utilisateur par défaut n'existe pas, le créer
    if (!defaultUserData) {
      const { error } = await supabaseAuth.signUp('user@plancam.com', 'video', { is_admin: false });
      
      if (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
      } else {
        console.log('Utilisateur par défaut créé avec succès');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des utilisateurs par défaut:', error);
  }
};

// Fonction pour obtenir un client Supabase avec la clé de service (pour les opérations admin)
export const getServiceSupabase = () => {
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    console.error('Clé de service Supabase non définie');
    return null;
  }
  return createClient(SUPABASE_URL, serviceKey);
};
