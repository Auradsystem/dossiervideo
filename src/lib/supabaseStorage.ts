import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Cache pour les résultats des requêtes
const cache = {
  projects: new Map<string, { data: any, timestamp: number }>(),
  files: new Map<string, { data: any, timestamp: number }>(),
  // Durée de validité du cache en millisecondes (5 minutes)
  ttl: 5 * 60 * 1000
};

/**
 * Service pour gérer le stockage des fichiers PDF avec Supabase Storage
 */
export const supabaseStorage = {
  /**
   * Télécharge un fichier PDF vers Supabase Storage
   * @param userId - ID de l'utilisateur
   * @param file - Fichier PDF à télécharger
   * @param projectId - ID du projet (optionnel, généré si non fourni)
   * @param customFilename - Nom de fichier personnalisé (optionnel)
   * @returns Informations sur le fichier téléchargé
   */
  uploadPdf: async (
    userId: string,
    file: File,
    projectId?: string,
    customFilename?: string
  ) => {
    try {
      // Générer un ID de projet si non fourni
      const projectIdToUse = projectId || uuidv4();
      
      // Construire le chemin de stockage
      const filename = customFilename || file.name;
      const filePath = `users/${userId}/projects/${projectIdToUse}/${filename}`;
      
      console.log(`Téléchargement du fichier vers ${filePath}`);
      
      // Vérifier si le fichier est trop volumineux (limite à 50 Mo)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Le fichier est trop volumineux (limite: 50 Mo)');
      }
      
      // Télécharger le fichier avec compression si c'est un PDF
      const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Écraser si le fichier existe déjà pour éviter les doublons
        });
      
      if (error) throw error;
      
      // Invalider le cache des fichiers pour ce projet
      invalidateCache('files', `${userId}:${projectIdToUse}`);
      
      return {
        path: data.path,
        projectId: projectIdToUse,
        filename,
        fullPath: filePath,
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      return {
        path: null,
        projectId: null,
        filename: null,
        fullPath: null,
        success: false,
        error
      };
    }
  },
  
  /**
   * Télécharge un fichier PDF existant depuis Supabase Storage
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param filename - Nom du fichier
   * @returns URL de téléchargement du fichier
   */
  downloadPdf: async (userId: string, projectId: string, filename: string) => {
    try {
      const filePath = `users/${userId}/projects/${projectId}/${filename}`;
      console.log(`Téléchargement du fichier depuis ${filePath}`);
      
      // Générer une URL signée pour le téléchargement
      const { data, error } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(filePath, 300); // URL valide pendant 5 minutes
      
      if (error) throw error;
      
      return {
        downloadUrl: data.signedUrl,
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du fichier:', error);
      return {
        downloadUrl: null,
        success: false,
        error
      };
    }
  },
  
  /**
   * Récupère un fichier PDF et le charge directement
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param filename - Nom du fichier
   * @returns Blob du fichier PDF
   */
  getPdfFile: async (userId: string, projectId: string, filename: string) => {
    try {
      const filePath = `users/${userId}/projects/${projectId}/${filename}`;
      console.log(`Récupération du fichier depuis ${filePath}`);
      
      // Télécharger le fichier avec un timeout de 30 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(filePath, {
          signal: controller.signal
        });
      
      clearTimeout(timeoutId);
      
      if (error) throw error;
      
      return {
        file: data,
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du fichier:', error);
      return {
        file: null,
        success: false,
        error
      };
    }
  },
  
  /**
   * Liste tous les projets d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param forceRefresh - Forcer le rafraîchissement du cache
   * @returns Liste des projets
   */
  listProjects: async (userId: string, forceRefresh = false) => {
    try {
      // Vérifier si les données sont en cache
      const cacheKey = `projects:${userId}`;
      const cachedData = !forceRefresh ? getCachedData('projects', cacheKey) : null;
      
      if (cachedData) {
        console.log(`Utilisation des données en cache pour les projets de l'utilisateur ${userId}`);
        return cachedData;
      }
      
      const prefix = `users/${userId}/projects/`;
      console.log(`Listage des projets pour ${prefix}`);
      
      // Lister les fichiers avec le préfixe spécifié
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) throw error;
      
      // Extraire les IDs de projet uniques
      const projectIds = new Set<string>();
      data.forEach(item => {
        const parts = item.name.split('/');
        if (parts.length > 0) {
          projectIds.add(parts[0]);
        }
      });
      
      const result = {
        projects: Array.from(projectIds),
        success: true,
        error: null
      };
      
      // Mettre en cache les résultats
      setCachedData('projects', cacheKey, result);
      
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des projets:', error);
      return {
        projects: [],
        success: false,
        error
      };
    }
  },
  
  /**
   * Liste tous les fichiers d'un projet
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param forceRefresh - Forcer le rafraîchissement du cache
   * @returns Liste des fichiers
   */
  listProjectFiles: async (userId: string, projectId: string, forceRefresh = false) => {
    try {
      // Vérifier si les données sont en cache
      const cacheKey = `${userId}:${projectId}`;
      const cachedData = !forceRefresh ? getCachedData('files', cacheKey) : null;
      
      if (cachedData) {
        console.log(`Utilisation des données en cache pour les fichiers du projet ${projectId}`);
        return cachedData;
      }
      
      const prefix = `users/${userId}/projects/${projectId}`;
      console.log(`Listage des fichiers pour ${prefix}`);
      
      // Lister les fichiers avec le préfixe spécifié
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) throw error;
      
      const result = {
        files: data,
        success: true,
        error: null
      };
      
      // Mettre en cache les résultats
      setCachedData('files', cacheKey, result);
      
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return {
        files: [],
        success: false,
        error
      };
    }
  },
  
  /**
   * Supprime un fichier
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param filename - Nom du fichier
   * @returns Statut de la suppression
   */
  deleteFile: async (userId: string, projectId: string, filename: string) => {
    try {
      const filePath = `users/${userId}/projects/${projectId}/${filename}`;
      console.log(`Suppression du fichier ${filePath}`);
      
      // Supprimer le fichier
      const { error } = await supabase.storage
        .from('pdfs')
        .remove([filePath]);
      
      if (error) throw error;
      
      // Invalider le cache des fichiers pour ce projet
      invalidateCache('files', `${userId}:${projectId}`);
      
      return {
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return {
        success: false,
        error
      };
    }
  },
  
  /**
   * Supprime un projet entier et tous ses fichiers
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @returns Statut de la suppression
   */
  deleteProject: async (userId: string, projectId: string) => {
    try {
      // D'abord, lister tous les fichiers du projet
      const { files, error: listError } = await supabaseStorage.listProjectFiles(userId, projectId, true);
      
      if (listError) throw listError;
      
      if (files && files.length > 0) {
        // Construire les chemins complets pour tous les fichiers
        const filePaths = files.map(file => 
          `users/${userId}/projects/${projectId}/${file.name}`
        );
        
        console.log(`Suppression du projet ${projectId} avec ${filePaths.length} fichiers`);
        
        // Supprimer tous les fichiers
        const { error } = await supabase.storage
          .from('pdfs')
          .remove(filePaths);
        
        if (error) throw error;
      }
      
      // Invalider les caches
      invalidateCache('files', `${userId}:${projectId}`);
      invalidateCache('projects', `projects:${userId}`);
      
      return {
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du projet:', error);
      return {
        success: false,
        error
      };
    }
  },
  
  /**
   * Vérifie si un fichier existe
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param filename - Nom du fichier
   * @returns Statut de l'existence du fichier
   */
  fileExists: async (userId: string, projectId: string, filename: string) => {
    try {
      const filePath = `users/${userId}/projects/${projectId}/${filename}`;
      
      // Récupérer les métadonnées du fichier
      const { data, error } = await supabase.storage
        .from('pdfs')
        .getPublicUrl(filePath);
      
      // Si nous obtenons une URL, le fichier existe
      return {
        exists: !error && !!data,
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('Erreur lors de la vérification du fichier:', error);
      return {
        exists: false,
        success: false,
        error
      };
    }
  },
  
  /**
   * Génère une URL publique pour un fichier
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param filename - Nom du fichier
   * @returns URL publique du fichier
   */
  getPublicUrl: (userId: string, projectId: string, filename: string) => {
    const filePath = `users/${userId}/projects/${projectId}/${filename}`;
    const { data } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },
  
  /**
   * Précharge un fichier PDF pour améliorer les performances
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param filename - Nom du fichier
   */
  preloadPdf: async (userId: string, projectId: string, filename: string) => {
    try {
      // Créer une URL signée
      const { downloadUrl, error } = await supabaseStorage.downloadPdf(userId, projectId, filename);
      
      if (error || !downloadUrl) return;
      
      // Précharger le PDF en créant une requête en arrière-plan
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.href = downloadUrl;
      document.head.appendChild(preloadLink);
      
      // Nettoyer après 5 minutes
      setTimeout(() => {
        document.head.removeChild(preloadLink);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('Erreur lors du préchargement du PDF:', error);
    }
  }
};

/**
 * Récupère des données en cache
 * @param cacheType - Type de cache ('projects' ou 'files')
 * @param key - Clé de cache
 * @returns Données en cache ou null si non trouvées ou expirées
 */
function getCachedData(cacheType: 'projects' | 'files', key: string) {
  const cacheMap = cache[cacheType];
  const cachedItem = cacheMap.get(key);
  
  if (!cachedItem) return null;
  
  // Vérifier si les données sont expirées
  const now = Date.now();
  if (now - cachedItem.timestamp > cache.ttl) {
    cacheMap.delete(key);
    return null;
  }
  
  return cachedItem.data;
}

/**
 * Met des données en cache
 * @param cacheType - Type de cache ('projects' ou 'files')
 * @param key - Clé de cache
 * @param data - Données à mettre en cache
 */
function setCachedData(cacheType: 'projects' | 'files', key: string, data: any) {
  const cacheMap = cache[cacheType];
  cacheMap.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Limiter la taille du cache (max 100 entrées)
  if (cacheMap.size > 100) {
    // Supprimer l'entrée la plus ancienne
    const oldestKey = cacheMap.keys().next().value;
    cacheMap.delete(oldestKey);
  }
}

/**
 * Invalide une entrée de cache
 * @param cacheType - Type de cache ('projects' ou 'files')
 * @param key - Clé de cache à invalider
 */
function invalidateCache(cacheType: 'projects' | 'files', key: string) {
  const cacheMap = cache[cacheType];
  cacheMap.delete(key);
}

/**
 * Convertit un Blob en File
 * @param blob - Blob à convertir
 * @param filename - Nom du fichier
 * @returns Objet File
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type });
};

/**
 * Convertit un File en Blob
 * @param file - File à convertir
 * @returns Promise avec le Blob
 */
export const fileToBlob = async (file: File): Promise<Blob> => {
  return new Blob([await file.arrayBuffer()], { type: file.type });
};

/**
 * Compresse un fichier PDF pour réduire sa taille
 * Note: Cette fonction est un placeholder - la compression PDF réelle
 * nécessiterait une bibliothèque spécialisée comme pdf-lib
 * @param file - Fichier PDF à compresser
 * @returns Promise avec le fichier compressé
 */
export const compressPdf = async (file: File): Promise<File> => {
  // Placeholder - dans une implémentation réelle, vous utiliseriez
  // une bibliothèque comme pdf-lib pour compresser le PDF
  console.log('Compression du PDF (simulation)');
  return file;
};
