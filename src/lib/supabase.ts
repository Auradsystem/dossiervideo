import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User as AppUser } from '../types/User';

const supabaseUrl = 'https://kvoezelnkzfvyikicjyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b2V6ZWxua3pmdnlpa2ljanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDkwMzIsImV4cCI6MjA1NzM4NTAzMn0.Hf3ohn_zlFRQG8kAiVm58Ng4EGkV2HLTXlpwkkp_CiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface pour les utilisateurs dans Supabase
interface SupabaseUser {
  id: string;
  username: string;
  password: string; // Note: Dans une vraie application, les mots de passe ne devraient pas être stockés en clair
  is_admin: boolean;
  created_at: string;
  last_login?: string;
}

// Fonctions d'authentification
export const supabaseAuth = {
  // Connexion avec email/mot de passe
  login: async (username: string, password: string) => {
    try {
      // D'abord, chercher l'utilisateur dans la table users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error) throw error;
      if (!data) return { user: null, error: { message: 'Identifiants incorrects' } };
      
      // Convertir l'utilisateur Supabase en utilisateur de l'application
      const appUser: AppUser = {
        id: data.id,
        username: data.username,
        password: data.password,
        isAdmin: data.is_admin,
        createdAt: new Date(data.created_at),
        lastLogin: data.last_login ? new Date(data.last_login) : undefined
      };
      
      // Mettre à jour la date de dernière connexion
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);
      
      return { user: appUser, error: null };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return { user: null, error };
    }
  },
  
  // Déconnexion
  logout: async () => {
    // Pas besoin de déconnexion côté serveur pour notre implémentation
    return { error: null };
  }
};

// Fonctions de gestion des utilisateurs
export const supabaseUsers = {
  // Récupérer tous les utilisateurs
  getAll: async (): Promise<{ users: AppUser[], error: any }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convertir les utilisateurs Supabase en utilisateurs de l'application
      const appUsers: AppUser[] = data.map((user: SupabaseUser) => ({
        id: user.id,
        username: user.username,
        password: user.password,
        isAdmin: user.is_admin,
        createdAt: new Date(user.created_at),
        lastLogin: user.last_login ? new Date(user.last_login) : undefined
      }));
      
      return { users: appUsers, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return { users: [], error };
    }
  },
  
  // Ajouter un nouvel utilisateur
  add: async (user: Omit<AppUser, 'id' | 'createdAt'>): Promise<{ user: AppUser | null, error: any }> => {
    try {
      const newUser = {
        username: user.username,
        password: user.password,
        is_admin: user.isAdmin,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertir l'utilisateur Supabase en utilisateur de l'application
      const appUser: AppUser = {
        id: data.id,
        username: data.username,
        password: data.password,
        isAdmin: data.is_admin,
        createdAt: new Date(data.created_at)
      };
      
      return { user: appUser, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un utilisateur:', error);
      return { user: null, error };
    }
  },
  
  // Mettre à jour un utilisateur
  update: async (id: string, updates: Partial<AppUser>): Promise<{ error: any }> => {
    try {
      // Convertir les champs de l'application vers le format Supabase
      const supabaseUpdates: Partial<SupabaseUser> = {};
      
      if (updates.username !== undefined) supabaseUpdates.username = updates.username;
      if (updates.password !== undefined) supabaseUpdates.password = updates.password;
      if (updates.isAdmin !== undefined) supabaseUpdates.is_admin = updates.isAdmin;
      if (updates.lastLogin !== undefined) supabaseUpdates.last_login = updates.lastLogin.toISOString();
      
      const { error } = await supabase
        .from('users')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour d\'un utilisateur:', error);
      return { error };
    }
  },
  
  // Supprimer un utilisateur
  delete: async (id: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression d\'un utilisateur:', error);
      return { error };
    }
  },
  
  // Vérifier si un utilisateur existe
  exists: async (username: string): Promise<{ exists: boolean, error: any }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Erreur lors de la vérification d\'un utilisateur:', error);
      return { exists: false, error };
    }
  }
};

// Fonction pour initialiser la base de données avec les utilisateurs par défaut
export const initializeSupabaseUsers = async (): Promise<void> => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();
    
    if (error) throw error;
    
    // Si aucun utilisateur n'existe, créer les utilisateurs par défaut
    if (data.count === 0) {
      // Créer l'utilisateur admin par défaut
      const adminUser = {
        username: 'Dali',
        password: 'Dali',
        is_admin: true,
        created_at: new Date().toISOString()
      };
      
      // Créer l'utilisateur par défaut
      const defaultUser = {
        username: 'xcel',
        password: 'video',
        is_admin: false,
        created_at: new Date().toISOString()
      };
      
      // Insérer les utilisateurs par défaut
      await supabase.from('users').insert([adminUser, defaultUser]);
      
      console.log('Utilisateurs par défaut créés dans Supabase');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des utilisateurs Supabase:', error);
  }
};

// Fonction pour synchroniser les utilisateurs locaux avec Supabase
export const syncUsersWithSupabase = async (localUsers: AppUser[]): Promise<AppUser[]> => {
  try {
    // Récupérer tous les utilisateurs de Supabase
    const { users: supabaseUsers, error } = await supabaseUsers.getAll();
    
    if (error) throw error;
    
    // Créer un map des utilisateurs Supabase pour une recherche rapide
    const supabaseUserMap = new Map(supabaseUsers.map(user => [user.id, user]));
    
    // Pour chaque utilisateur local
    for (const localUser of localUsers) {
      // Si l'utilisateur existe dans Supabase, le mettre à jour si nécessaire
      if (supabaseUserMap.has(localUser.id)) {
        const supabaseUser = supabaseUserMap.get(localUser.id)!;
        
        // Vérifier si une mise à jour est nécessaire
        if (
          localUser.username !== supabaseUser.username ||
          localUser.password !== supabaseUser.password ||
          localUser.isAdmin !== supabaseUser.isAdmin ||
          (localUser.lastLogin && (!supabaseUser.lastLogin || localUser.lastLogin > supabaseUser.lastLogin))
        ) {
          // Mettre à jour l'utilisateur dans Supabase
          await supabaseUsers.update(localUser.id, {
            username: localUser.username,
            password: localUser.password,
            isAdmin: localUser.isAdmin,
            lastLogin: localUser.lastLogin
          });
        }
        
        // Supprimer l'utilisateur du map pour marquer qu'il a été traité
        supabaseUserMap.delete(localUser.id);
      } else {
        // Si l'utilisateur n'existe pas dans Supabase, le créer
        await supabase.from('users').insert([{
          id: localUser.id,
          username: localUser.username,
          password: localUser.password,
          is_admin: localUser.isAdmin,
          created_at: localUser.createdAt.toISOString(),
          last_login: localUser.lastLogin ? localUser.lastLogin.toISOString() : null
        }]);
      }
    }
    
    // Les utilisateurs restants dans le map sont ceux qui existent dans Supabase mais pas localement
    // Les ajouter à la liste des utilisateurs locaux
    const newUsers: AppUser[] = [];
    
    for (const supabaseUser of supabaseUserMap.values()) {
      newUsers.push(supabaseUser);
    }
    
    // Retourner la liste mise à jour des utilisateurs locaux
    return [...localUsers, ...newUsers];
  } catch (error) {
    console.error('Erreur lors de la synchronisation des utilisateurs avec Supabase:', error);
    return localUsers;
  }
};
