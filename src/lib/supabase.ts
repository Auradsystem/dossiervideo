import { createClient } from '@supabase/supabase-js';
import { User as AppUser } from '../types/User';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kvoezelnkzfvyikicjyr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b2V6ZWxua3pmdnlpa2ljanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDkwMzIsImV4cCI6MjA1NzM4NTAzMn0.Hf3ohn_zlFRQG8kAiVm58Ng4EGkV2HLTXlpwkkp_CiM';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Options de configuration pour améliorer les performances
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'plancam-auth',
    detectSessionInUrl: false, // Désactive la détection de session dans l'URL pour accélérer le chargement
    flowType: 'implicit', // Utilise le flow implicite qui est plus rapide
    timeout: 10000, // Timeout à 10 secondes pour éviter les attentes infinies
  }
};

// Créer le client Supabase avec la clé anonyme pour l'accès client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);

// Cache des réponses d'authentification pour améliorer les performances
const authCache = new Map();

// Interface pour les métadonnées utilisateur dans Supabase
interface UserMetadata {
  is_admin?: boolean;
}

// Fonctions d'authentification
export const supabaseAuth = {
  // Inscription d'un nouvel utilisateur
  signUp: async (email: string, password: string, metadata: UserMetadata = {}) => {
    try {
      console.log('Tentative d\'inscription avec l\'API standard de Supabase');
      
      // Utiliser l'API standard de Supabase pour l'inscription
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
  
  // Connexion avec email/mot de passe - optimisée
  signIn: async (email: string, password: string) => {
    try {
      // Vérification des entrées pour éviter les appels inutiles
      if (!email || !password) {
        return { user: null, session: null, error: new Error('Email et mot de passe requis') };
      }
      
      // Définition d'un timeout pour la requête
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de connexion dépassé')), 15000);
      });
      
      // Vérification du cache pour les connexions récentes
      const cacheKey = `${email}:${password}`;
      const cachedResult = authCache.get(cacheKey);
      
      if (cachedResult && Date.now() - cachedResult.timestamp < 60000) {
        console.log('Utilisation du cache d\'authentification');
        return cachedResult.result;
      }
      
      console.log('Tentative de connexion à Supabase');
      
      // Essayer de se connecter avec un timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise])
        .catch(err => {
          console.error('Erreur de connexion:', err);
          return { data: null, error: err };
        }) as any;
      
      if (error) throw error;
      
      const result = { 
        user: data.user ? mapSupabaseUser(data.user) : null, 
        session: data.session,
        error: null 
      };
      
      // Mettre en cache le résultat pour les futures demandes
      authCache.set(cacheKey, { 
        result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return { user: null, session: null, error };
    }
  },
  
  // Déconnexion - optimisée
  signOut: async () => {
    try {
      // Nettoyer le cache lors de la déconnexion
      authCache.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
  },
  
  // Récupérer la session courante - optimisée
  getSession: async () => {
    try {
      // Vérifier d'abord en mémoire pour éviter un appel API
      const session = supabase.auth.session();
      if (session) {
        return { 
          session,
          user: session.user ? mapSupabaseUser(session.user) : null,
          error: null 
        };
      }
      
      // Si pas en mémoire, faire l'appel
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

// Fonction pour initialiser les utilisateurs par défaut - optimisée
export const initializeDefaultUsers = async (): Promise<void> => {
  try {
    // Vérifier si les utilisateurs existent déjà en utilisant un cache local
    const DEFAULT_USERS_INITIALIZED_KEY = 'default-users-initialized';
    if (localStorage.getItem(DEFAULT_USERS_INITIALIZED_KEY) === 'true') {
      console.log('Utilisateurs par défaut déjà initialisés (vérifié en cache local)');
      return;
    }
    
    // Vérifier si la clé de service est disponible
    const serviceClient = getServiceSupabase();
    if (!serviceClient) {
      console.warn('Clé de service non disponible, impossible d\'initialiser les utilisateurs par défaut');
      return;
    }
    
    // Vérifier si des utilisateurs existent déjà
    const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers({
      perPage: 1 // Ne récupérer qu'un seul utilisateur pour la vérification
    });
    
    if (usersError) {
      console.error('Erreur lors de la vérification des utilisateurs existants:', usersError);
      return;
    }
    
    // Si des utilisateurs existent déjà, ne pas créer les utilisateurs par défaut
    if (usersData && usersData.users.length > 0) {
      console.log('Des utilisateurs existent déjà, pas besoin de créer les utilisateurs par défaut');
      localStorage.setItem(DEFAULT_USERS_INITIALIZED_KEY, 'true');
      return;
    }
    
    // Créer l'utilisateur admin
    const { error: adminError } = await serviceClient.auth.admin.createUser({
      email: 'admin@plancam.com',
      password: 'Dali',
      email_confirm: true,
      user_metadata: { is_admin: true }
    });
    
    if (adminError) {
      console.error('Erreur lors de la création de l\'admin:', adminError);
    } else {
      console.log('Utilisateur admin créé avec succès');
    }
    
    // Créer l'utilisateur par défaut
    const { error: userError } = await serviceClient.auth.admin.createUser({
      email: 'user@plancam.com',
      password: 'video',
      email_confirm: true,
      user_metadata: { is_admin: false }
    });
    
    if (userError) {
      console.error('Erreur lors de la création de l\'utilisateur par défaut:', userError);
    } else {
      console.log('Utilisateur par défaut créé avec succès');
      
      // Marquer comme initialisé après succès
      localStorage.setItem(DEFAULT_USERS_INITIALIZED_KEY, 'true');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des utilisateurs par défaut:', error);
  }
};

// Fonction pour obtenir un client Supabase avec la clé de service (pour les opérations admin)
export const getServiceSupabase = () => {
  if (!SUPABASE_SERVICE_KEY) {
    console.warn('Clé de service Supabase non définie');
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, supabaseOptions);
};
