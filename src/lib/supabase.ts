import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service d'authentification
export const supabaseAuth = {
  // Obtenir la session actuelle
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return {
      session: data.session,
      user: data.session?.user ? {
        id: data.session.user.id,
        email: data.session.user.email || '',
        isAdmin: data.session.user.user_metadata?.is_admin || false
      } : null
    };
  },

  // Connexion avec email et mot de passe
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        isAdmin: data.user.user_metadata?.is_admin || false
      } : null,
      error: null
    };
  },

  // Inscription avec email et mot de passe
  signUp: async (email: string, password: string, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      throw error;
    }
    
    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        isAdmin: data.user.user_metadata?.is_admin || false
      } : null,
      error: null
    };
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};

// Service de stockage
export const supabaseStorage = {
  // Lister les projets de l'utilisateur
  listUserProjects: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const userId = session.user.id;
      const bucketName = 'projects';
      const folderPath = `${userId}/`;
      
      // Lister les dossiers dans le bucket
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      // Filtrer pour ne garder que les dossiers
      const projects = data
        .filter(item => item.id !== '.emptyFolderPlaceholder')
        .map(item => ({
          name: item.name,
          path: `${folderPath}${item.name}`,
          createdAt: item.created_at
        }));
      
      return { data: projects, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets:', error);
      return { data: null, error };
    }
  },
  
  // Lister les fichiers d'un projet
  listProjectFiles: async (projectName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const userId = session.user.id;
      const bucketName = 'projects';
      const folderPath = `${userId}/${projectName}/`;
      
      // Lister les fichiers dans le dossier du projet
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      // Filtrer pour ne garder que les fichiers (pas les dossiers)
      const files = await Promise.all(
        data
          .filter(item => !item.id.endsWith('/') && item.name !== '.emptyFolderPlaceholder')
          .map(async item => {
            // Obtenir l'URL publique du fichier
            const { data: urlData } = await supabase
              .storage
              .from(bucketName)
              .getPublicUrl(`${folderPath}${item.name}`);
            
            return {
              name: item.name,
              path: `${folderPath}${item.name}`,
              url: urlData.publicUrl,
              created_at: item.created_at,
              metadata: {
                size: item.metadata?.size || 0,
                mimetype: item.metadata?.mimetype || 'application/pdf'
              }
            };
          })
      );
      
      return { data: files, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des fichiers du projet:', error);
      return { data: null, error };
    }
  },
  
  // Télécharger un fichier PDF
  uploadPdf: async (file: File, projectName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const userId = session.user.id;
      const bucketName = 'projects';
      const filePath = `${userId}/${projectName}/${file.name}`;
      
      // Créer le dossier du projet s'il n'existe pas
      // Note: Supabase Storage crée automatiquement les dossiers lors du téléchargement
      
      // Télécharger le fichier
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Obtenir l'URL publique du fichier
      const { data: urlData } = await supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return {
        data: {
          path: filePath,
          url: urlData.publicUrl,
          fileName: file.name
        },
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      return { data: null, error };
    }
  },
  
  // Supprimer un fichier
  deleteFile: async (filePath: string) => {
    try {
      const bucketName = 'projects';
      
      const { error } = await supabase
        .storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { success: false, error };
    }
  },
  
  // Créer un projet (dossier)
  createProject: async (projectName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const userId = session.user.id;
      const bucketName = 'projects';
      
      // Créer un fichier placeholder pour créer le dossier
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      const placeholderFile = new File([placeholderContent], '.emptyFolderPlaceholder', { type: 'text/plain' });
      
      const filePath = `${userId}/${projectName}/.emptyFolderPlaceholder`;
      
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, placeholderFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      return {
        data: {
          name: projectName,
          path: `${userId}/${projectName}`,
          createdAt: new Date().toISOString()
        },
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors de la création du projet:', error);
      return { data: null, error };
    }
  }
};

export default supabase;
