import { createClient } from '@supabase/supabase-js';
import { User as AppUser } from '../types/User';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kvoezelnkzfvyikicjyr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b2V6ZWxua3pmdnlpa2ljanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDkwMzIsImV4cCI6MjA1NzM4NTAzMn0.Hf3ohn_zlFRQG8kAiVm58Ng4EGkV2HLTXlpwkkp_CiM';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Créer le client Supabase avec la clé anonyme pour l'accès client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Créer le client Supabase avec la clé de service pour l'accès admin
export const getServiceSupabase = () => {
  if (!SUPABASE_SERVICE_KEY) {
    console.error('La clé de service Supabase n\'est pas définie');
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

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

// Fonctions pour gérer le stockage des fichiers PDF
export const supabaseStorage = {
  // Télécharger un fichier PDF
  uploadPdf: async (file: File, projectName: string) => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Vous devez être connecté pour télécharger un fichier');
      }
      
      const userId = sessionData.session.user.id;
      
      // Créer un nom de fichier unique avec le nom du projet et la date
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${projectName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      
      // Chemin du fichier dans le bucket: users/{user_id}/projects/{project_name}/{file_name}
      const filePath = `users/${userId}/projects/${projectName.replace(/\s+/g, '_')}/${fileName}`;
      
      console.log(`Téléchargement du fichier ${fileName} vers ${filePath}`);
      
      // Télécharger le fichier
      const { data, error } = await supabase.storage
        .from('plancam-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Récupérer l'URL publique du fichier
      const { data: urlData } = await supabase.storage
        .from('plancam-files')
        .getPublicUrl(filePath);
      
      return { 
        data: {
          path: data.path,
          url: urlData.publicUrl,
          projectName,
          fileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      return { data: null, error };
    }
  },
  
  // Récupérer tous les fichiers PDF d'un utilisateur
  listUserFiles: async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Vous devez être connecté pour lister vos fichiers');
      }
      
      const userId = sessionData.session.user.id;
      
      // Chemin des fichiers de l'utilisateur
      const path = `users/${userId}/projects`;
      
      console.log(`Listage des fichiers dans ${path}`);
      
      // Lister les fichiers
      const { data, error } = await supabase.storage
        .from('plancam-files')
        .list(path, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) throw error;
      
      // Récupérer les URLs publiques pour chaque fichier
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('plancam-files')
            .getPublicUrl(`${path}/${file.name}`);
          
          // Extraire le nom du projet à partir du chemin
          const pathParts = file.name.split('/');
          const projectName = pathParts[pathParts.length - 2] || 'Sans nom';
          
          return {
            ...file,
            url: urlData.publicUrl,
            projectName: projectName.replace(/_/g, ' ')
          };
        })
      );
      
      return { data: filesWithUrls, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return { data: null, error };
    }
  },
  
  // Récupérer tous les fichiers PDF d'un projet spécifique
  listProjectFiles: async (projectName: string) => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Vous devez être connecté pour lister les fichiers du projet');
      }
      
      const userId = sessionData.session.user.id;
      
      // Chemin des fichiers du projet
      const path = `users/${userId}/projects/${projectName.replace(/\s+/g, '_')}`;
      
      console.log(`Listage des fichiers du projet ${projectName} dans ${path}`);
      
      // Lister les fichiers
      const { data, error } = await supabase.storage
        .from('plancam-files')
        .list(path, {
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) throw error;
      
      // Récupérer les URLs publiques pour chaque fichier
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('plancam-files')
            .getPublicUrl(`${path}/${file.name}`);
          
          return {
            ...file,
            url: urlData.publicUrl,
            projectName: projectName
          };
        })
      );
      
      return { data: filesWithUrls, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des fichiers du projet:', error);
      return { data: null, error };
    }
  },
  
  // Supprimer un fichier PDF
  deleteFile: async (filePath: string) => {
    try {
      console.log(`Suppression du fichier ${filePath}`);
      
      const { error } = await supabase.storage
        .from('plancam-files')
        .remove([filePath]);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { success: false, error };
    }
  },
  
  // Récupérer les projets d'un utilisateur
  listUserProjects: async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Vous devez être connecté pour lister vos projets');
      }
      
      const userId = sessionData.session.user.id;
      
      // Chemin des projets de l'utilisateur
      const path = `users/${userId}/projects`;
      
      console.log(`Listage des projets dans ${path}`);
      
      // Lister les dossiers (projets)
      const { data, error } = await supabase.storage
        .from('plancam-files')
        .list(path, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) throw error;
      
      // Filtrer pour ne garder que les dossiers
      const projects = data
        .filter(item => item.id === null) // Les dossiers ont un id null
        .map(folder => ({
          name: folder.name.replace(/_/g, ' '),
          path: `${path}/${folder.name}`,
          createdAt: folder.created_at
        }));
      
      return { data: projects, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets:', error);
      return { data: null, error };
    }
  }
};

// Initialiser les utilisateurs par défaut (si nécessaire)
export const initializeDefaultUsers = async (): Promise<void> => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Erreur lors de la vérification des utilisateurs existants:', error);
      return;
    }
    
    // Si des utilisateurs existent déjà, ne pas créer les utilisateurs par défaut
    if (data && data.users.length > 0) {
      console.log('Des utilisateurs existent déjà, pas besoin de créer les utilisateurs par défaut');
      return;
    }
    
    console.log('Aucun utilisateur trouvé, création des utilisateurs par défaut...');
    
    // Créer l'utilisateur admin
    const { error: adminError } = await supabaseAuth.signUp(
      'admin@plancam.com',
      'Dali',
      { is_admin: true }
    );
    
    if (adminError) {
      console.error('Erreur lors de la création de l\'admin:', adminError);
    } else {
      console.log('Utilisateur admin créé avec succès');
    }
    
    // Créer l'utilisateur par défaut
    const { error: userError } = await supabaseAuth.signUp(
      'user@plancam.com',
      'video',
      { is_admin: false }
    );
    
    if (userError) {
      console.error('Erreur lors de la création de l\'utilisateur par défaut:', userError);
    } else {
      console.log('Utilisateur par défaut créé avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des utilisateurs par défaut:', error);
  }
};
