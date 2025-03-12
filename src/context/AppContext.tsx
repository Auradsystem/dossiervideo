import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { Camera, CameraType, cameraIcons } from '../types/Camera';
import { Comment } from '../types/Comment';
import { User } from '../types/User';

// Interface pour stocker les caméras par page
interface PageCameras {
  [pageNumber: number]: Camera[];
}

// Interface pour stocker les commentaires par page
interface PageComments {
  [pageNumber: number]: Comment[];
}

interface AppContextType {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  cameras: Camera[];
  addCamera: (x: number, y: number, type: CameraType) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  selectedCamera: string | null;
  setSelectedCamera: (id: string | null) => void;
  scale: number;
  setScale: (scale: number) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  exportPdf: () => void;
  exportCurrentPage: () => void;
  previewPdf: () => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (isOpen: boolean) => void;
  namingPattern: string;
  setNamingPattern: (pattern: string) => void;
  nextCameraNumber: number;
  setNextCameraNumber: (num: number) => void;
  selectedIconType: string;
  setSelectedIconType: (type: string) => void;
  clearCurrentPage: () => void;
  // Nouvelles fonctionnalités pour les commentaires
  comments: Comment[];
  addComment: (x: number, y: number, text: string, cameraId?: string) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  selectedComment: string | null;
  setSelectedComment: (id: string | null) => void;
  isAddingComment: boolean;
  setIsAddingComment: (isAdding: boolean) => void;
  // Nouvelles fonctionnalités pour la gestion des utilisateurs
  currentUser: User | null;
  isAdmin: boolean;
  users: User[];
  addUser: (username: string, password: string, isAdmin: boolean) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  isAdminMode: boolean;
  setIsAdminMode: (isAdmin: boolean) => void;
  syncWithCloud: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Fonction utilitaire pour gérer localStorage de manière sécurisée
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'écriture dans le localStorage:', error);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du localStorage:', error);
      return false;
    }
  }
};

// Fonction pour sérialiser les dates correctement
const serializeWithDates = (obj: any): string => {
  return JSON.stringify(obj, (key, value) => {
    if (value instanceof Date) {
      return {
        __type: 'Date',
        iso: value.toISOString()
      };
    }
    return value;
  });
};

// Fonction pour désérialiser les dates correctement
const deserializeWithDates = (json: string): any => {
  return JSON.parse(json, (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.iso);
    }
    // Compatibilité avec l'ancien format de date
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

// Clé pour le stockage IndexedDB
const DB_NAME = 'plancam_db';
const DB_VERSION = 1;
const USERS_STORE = 'users';
const SYNC_STORE = 'sync_data';

// Fonction pour ouvrir la base de données IndexedDB
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Erreur lors de l\'ouverture de la base de données:', event);
      reject(new Error('Impossible d\'ouvrir la base de données'));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Créer le magasin d'utilisateurs s'il n'existe pas
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        userStore.createIndex('username', 'username', { unique: true });
      }
      
      // Créer le magasin de données de synchronisation s'il n'existe pas
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Fonction pour lire tous les utilisateurs de la base de données
const getAllUsers = async (): Promise<User[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readonly');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Erreur lors de la lecture des utilisateurs:', event);
        reject(new Error('Impossible de lire les utilisateurs'));
      };
    });
  } catch (error) {
    console.error('Erreur lors de l\'accès à la base de données:', error);
    return [];
  }
};

// Fonction pour ajouter ou mettre à jour un utilisateur dans la base de données
const saveUser = async (user: User): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.put(user);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Erreur lors de la sauvegarde de l\'utilisateur:', event);
        reject(new Error('Impossible de sauvegarder l\'utilisateur'));
      };
    });
  } catch (error) {
    console.error('Erreur lors de l\'accès à la base de données:', error);
    throw error;
  }
};

// Fonction pour supprimer un utilisateur de la base de données
const deleteUserFromDB = async (id: string): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Erreur lors de la suppression de l\'utilisateur:', event);
        reject(new Error('Impossible de supprimer l\'utilisateur'));
      };
    });
  } catch (error) {
    console.error('Erreur lors de l\'accès à la base de données:', error);
    throw error;
  }
};

// Fonction pour sauvegarder les données de synchronisation
const saveSyncData = async (data: any): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_STORE);
      const request = store.put({ id: 'lastSync', ...data });
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Erreur lors de la sauvegarde des données de synchronisation:', event);
        reject(new Error('Impossible de sauvegarder les données de synchronisation'));
      };
    });
  } catch (error) {
    console.error('Erreur lors de l\'accès à la base de données:', error);
    throw error;
  }
};

// Fonction pour lire les données de synchronisation
const getSyncData = async (): Promise<any> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_STORE, 'readonly');
      const store = transaction.objectStore(SYNC_STORE);
      const request = store.get('lastSync');
      
      request.onsuccess = () => {
        resolve(request.result || { timestamp: null });
      };
      
      request.onerror = (event) => {
        console.error('Erreur lors de la lecture des données de synchronisation:', event);
        reject(new Error('Impossible de lire les données de synchronisation'));
      };
    });
  } catch (error) {
    console.error('Erreur lors de l\'accès à la base de données:', error);
    return { timestamp: null };
  }
};

// Fonction pour synchroniser avec le cloud (simulée)
const syncWithCloudService = async (users: User[]): Promise<User[]> => {
  // Simuler une communication avec un service cloud
  return new Promise((resolve) => {
    // Simuler un délai réseau
    setTimeout(() => {
      // Dans une implémentation réelle, cette fonction enverrait les données
      // à un service cloud comme Firebase, Supabase, etc.
      console.log('Synchronisation avec le cloud simulée:', users.length, 'utilisateurs');
      
      // Pour l'instant, nous retournons simplement les mêmes utilisateurs
      // Dans une vraie implémentation, nous recevrions les utilisateurs mis à jour du cloud
      resolve(users);
    }, 1000);
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  // Stockage des caméras par page
  const [pageCameras, setPageCameras] = useState<PageCameras>({});
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [namingPattern, setNamingPattern] = useState<string>("CAM-");
  const [nextCameraNumber, setNextCameraNumber] = useState<number>(1);
  const [selectedIconType, setSelectedIconType] = useState<string>("dome");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  
  // Nouveaux états pour les commentaires
  const [pageComments, setPageComments] = useState<PageComments>({});
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);

  // Nouveaux états pour la gestion des utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  
  // États pour la synchronisation
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Caméras de la page courante
  const cameras = pageCameras[page] || [];
  
  // Commentaires de la page courante
  const comments = pageComments[page] || [];

  // Fonction pour sauvegarder les utilisateurs dans IndexedDB et localStorage
  const saveUsers = useCallback(async (updatedUsers: User[]) => {
    if (updatedUsers.length > 0) {
      try {
        // Sauvegarder dans IndexedDB
        for (const user of updatedUsers) {
          await saveUser(user);
        }
        
        // Sauvegarder aussi dans localStorage pour compatibilité
        const serialized = serializeWithDates(updatedUsers);
        const success = safeLocalStorage.setItem('plancam_users', serialized);
        
        console.log('Utilisateurs sauvegardés:', { 
          count: updatedUsers.length,
          usersList: updatedUsers.map(u => u.username)
        });
        
        return true;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Fonction pour synchroniser les utilisateurs avec le cloud
  const syncWithCloud = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      console.log('Début de la synchronisation avec le cloud...');
      
      // Récupérer les utilisateurs du cloud
      const cloudUsers = await syncWithCloudService(users);
      
      if (Array.isArray(cloudUsers)) {
        // Fusionner les utilisateurs locaux avec ceux du cloud
        const mergedUsers = [...users];
        
        // Mettre à jour les utilisateurs existants et ajouter les nouveaux
        for (const cloudUser of cloudUsers) {
          const existingUserIndex = mergedUsers.findIndex(u => u.id === cloudUser.id);
          
          if (existingUserIndex >= 0) {
            // Mettre à jour l'utilisateur existant
            mergedUsers[existingUserIndex] = {
              ...mergedUsers[existingUserIndex],
              ...cloudUser,
              // Conserver le mot de passe local si le cloud n'en fournit pas
              password: cloudUser.password || mergedUsers[existingUserIndex].password
            };
          } else {
            // Ajouter le nouvel utilisateur
            mergedUsers.push(cloudUser);
          }
        }
        
        // Mettre à jour l'état local
        setUsers(mergedUsers);
        
        // Sauvegarder dans IndexedDB et localStorage
        await saveUsers(mergedUsers);
        
        // Mettre à jour la date de dernière synchronisation
        const now = new Date();
        setLastSyncTime(now);
        await saveSyncData({ timestamp: now.toISOString() });
        
        console.log('Synchronisation réussie, utilisateurs mis à jour:', mergedUsers.length);
      } else {
        throw new Error('Format de données invalide reçu du cloud');
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec le cloud:', error);
      setSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, users, saveUsers]);

  // Initialisation des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Essayer de charger depuis IndexedDB d'abord
        const dbUsers = await getAllUsers();
        
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
          console.log('Utilisateurs chargés depuis IndexedDB:', dbUsers);
          
          // Charger les données de synchronisation
          const syncData = await getSyncData();
          if (syncData && syncData.timestamp) {
            setLastSyncTime(new Date(syncData.timestamp));
          }
          
          return;
        }
        
        // Fallback au localStorage si IndexedDB est vide
        const storedUsers = safeLocalStorage.getItem('plancam_users');
        if (storedUsers) {
          // Utiliser la fonction de désérialisation améliorée
          const parsedUsers = deserializeWithDates(storedUsers);
          setUsers(parsedUsers);
          console.log('Utilisateurs chargés depuis localStorage:', parsedUsers);
          
          // Sauvegarder dans IndexedDB pour la prochaine fois
          await saveUsers(parsedUsers);
          return;
        }
        
        // Si aucune donnée n'est trouvée, initialiser les utilisateurs par défaut
        initializeDefaultUsers();
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        // Réinitialiser si erreur
        initializeDefaultUsers();
      }
    };
    
    loadUsers();
  }, [saveUsers]);

  // Fonction pour initialiser les utilisateurs par défaut
  const initializeDefaultUsers = async () => {
    // Créer l'utilisateur admin par défaut si aucun utilisateur n'existe
    const adminUser: User = {
      id: uuidv4(),
      username: 'Dali',
      password: 'Dali',
      isAdmin: true,
      createdAt: new Date()
    };
    
    // Ajouter l'utilisateur par défaut (xcel/video)
    const defaultUser: User = {
      id: uuidv4(),
      username: 'xcel',
      password: 'video',
      isAdmin: false,
      createdAt: new Date()
    };
    
    const initialUsers = [adminUser, defaultUser];
    setUsers(initialUsers);
    await saveUsers(initialUsers);
    console.log('Utilisateurs initialisés:', initialUsers);
  };

  // Journalisation pour le débogage
  useEffect(() => {
    console.log(`Page actuelle: ${page}`);
    console.log(`Nombre de caméras sur cette page: ${cameras.length}`);
    console.log(`Nombre de commentaires sur cette page: ${comments.length}`);
  }, [page, cameras, comments]);

  // Réinitialiser la sélection lors du changement de page
  useEffect(() => {
    setSelectedCamera(null);
    setSelectedComment(null);
  }, [page]);

  // Check for existing authentication on mount
  useEffect(() => {
    const auth = safeLocalStorage.getItem('plancam_auth');
    if (auth) {
      try {
        // Utiliser la fonction de désérialisation améliorée
        const authData = deserializeWithDates(auth);
        setIsAuthenticated(true);
        setCurrentUser(authData.user);
        setIsAdmin(authData.user.isAdmin);
        console.log('Authentification restaurée:', authData.user);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'authentification:', error);
        safeLocalStorage.removeItem('plancam_auth');
      }
    }
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Sauvegarder les utilisateurs dans IndexedDB et localStorage à chaque modification
  useEffect(() => {
    if (users.length > 0) {
      saveUsers(users);
    }
  }, [users, saveUsers]);

  // Synchronisation périodique avec le cloud (toutes les 5 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      const syncInterval = setInterval(() => {
        syncWithCloud().catch(err => {
          console.warn('Échec de la synchronisation périodique:', err);
        });
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(syncInterval);
    }
  }, [isAuthenticated, syncWithCloud]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Rechercher l'utilisateur localement
      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
      
      if (user) {
        // Mettre à jour la date de dernière connexion
        const updatedUser = {
          ...user,
          lastLogin: new Date()
        };
        
        // Mettre à jour l'utilisateur dans la liste
        const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
        setUsers(updatedUsers);
        
        // Définir l'utilisateur courant et l'état d'authentification
        setCurrentUser(updatedUser);
        setIsAuthenticated(true);
        setIsAdmin(updatedUser.isAdmin);
        
        // Stocker l'authentification dans le localStorage avec sérialisation améliorée
        safeLocalStorage.setItem('plancam_auth', serializeWithDates({
          user: updatedUser
        }));
        
        // Sauvegarder les utilisateurs mis à jour
        await saveUsers(updatedUsers);
        
        // Tenter une synchronisation avec le cloud après la connexion
        syncWithCloud().catch(err => {
          console.warn('Échec de la synchronisation après connexion:', err);
        });
        
        console.log('Utilisateur connecté:', updatedUser);
        return true;
      }
      
      console.log('Échec de connexion pour:', username);
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const logout = () => {
    // Déconnexion locale
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setIsAdminMode(false);
    safeLocalStorage.removeItem('plancam_auth');
    console.log('Utilisateur déconnecté');
  };

  // Fonctions de gestion des utilisateurs
  const addUser = async (username: string, password: string, isAdmin: boolean): Promise<User> => {
    try {
      // Créer le nouvel utilisateur
      const newUser: User = {
        id: uuidv4(),
        username,
        password,
        isAdmin,
        createdAt: new Date()
      };
      
      console.log('Création d\'un nouvel utilisateur:', { 
        username: newUser.username, 
        isAdmin: newUser.isAdmin,
        id: newUser.id
      });
      
      // Mettre à jour l'état des utilisateurs avec le nouvel utilisateur
      const updatedUsers = [...users, newUser];
      
      // Mettre à jour l'état immédiatement (important pour la vérification)
      setUsers(updatedUsers);
      
      // Sauvegarder immédiatement dans IndexedDB et localStorage
      await saveUsers(updatedUsers);
      
      // Tenter une synchronisation avec le cloud
      syncWithCloud().catch(err => {
        console.warn('Échec de la synchronisation après ajout d\'utilisateur:', err);
      });
      
      return newUser;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un utilisateur:', error);
      throw new Error('Erreur lors de l\'ajout d\'un utilisateur');
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    try {
      // Créer une nouvelle liste d'utilisateurs avec les mises à jour
      const updatedUsers = users.map(user => {
        if (user.id === id) {
          const updatedUser = { ...user, ...updates };
          console.log('Utilisateur mis à jour:', updatedUser);
          return updatedUser;
        }
        return user;
      });
      
      // Mettre à jour l'état
      setUsers(updatedUsers);
      
      // Sauvegarder dans IndexedDB et localStorage
      await saveUsers(updatedUsers);
      
      // Si l'utilisateur courant est mis à jour, mettre à jour également l'utilisateur courant
      if (currentUser && currentUser.id === id) {
        const updatedCurrentUser = { ...currentUser, ...updates };
        setCurrentUser(updatedCurrentUser);
        setIsAdmin(updatedCurrentUser.isAdmin);
        
        // Mettre à jour le localStorage avec sérialisation améliorée
        safeLocalStorage.setItem('plancam_auth', serializeWithDates({
          user: updatedCurrentUser
        }));
      }
      
      // Tenter une synchronisation avec le cloud
      syncWithCloud().catch(err => {
        console.warn('Échec de la synchronisation après mise à jour d\'utilisateur:', err);
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      // Empêcher la suppression de l'utilisateur admin principal
      const userToDelete = users.find(u => u.id === id);
      if (userToDelete && userToDelete.username === 'Dali') {
        alert('Impossible de supprimer l\'administrateur principal');
        return;
      }
      
      // Empêcher la suppression de l'utilisateur courant
      if (currentUser && currentUser.id === id) {
        alert('Impossible de supprimer votre propre compte');
        return;
      }
      
      // Filtrer l'utilisateur à supprimer
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      
      // Supprimer de IndexedDB
      await deleteUserFromDB(id);
      
      // Sauvegarder dans localStorage
      const serialized = serializeWithDates(updatedUsers);
      safeLocalStorage.setItem('plancam_users', serialized);
      
      console.log('Utilisateur supprimé, ID:', id);
      
      // Tenter une synchronisation avec le cloud
      syncWithCloud().catch(err => {
        console.warn('Échec de la synchronisation après suppression d\'utilisateur:', err);
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  };

  const addCamera = (x: number, y: number, type: CameraType) => {
    // Generate camera name based on pattern and next number
    const paddedNumber = String(nextCameraNumber).padStart(3, '0');
    const newCameraName = `${namingPattern}${paddedNumber}`;
    
    const newCamera: Camera = {
      id: uuidv4(),
      name: newCameraName,
      x,
      y,
      width: 30,
      height: 30,
      angle: 45,
      viewDistance: 100,
      opacity: 0.9,
      type: selectedIconType as CameraType,
      iconPath: type === 'custom' ? cameraIcons[selectedIconType]?.path : undefined,
      rotation: 0,
      page: page
    };
    
    // Ajouter la caméra à la page courante
    const currentPageCameras = [...(pageCameras[page] || []), newCamera];
    setPageCameras({
      ...pageCameras,
      [page]: currentPageCameras
    });
    
    setSelectedCamera(newCamera.id);
    
    // Increment the next camera number
    setNextCameraNumber(nextCameraNumber + 1);
    
    console.log(`Caméra ajoutée à la page ${page}:`, newCamera);
  };

  const updateCamera = (id: string, updates: Partial<Camera>) => {
    // Mettre à jour la caméra uniquement sur la page courante
    const updatedPageCameras = (pageCameras[page] || []).map(camera => {
      if (camera.id === id) {
        // If the name is being updated, check if it follows the pattern
        if (updates.name && updates.name !== camera.name) {
          const nameMatch = updates.name.match(/^(.+?)(\d+)$/);
          if (nameMatch) {
            const newPattern = nameMatch[1];
            const newNumber = parseInt(nameMatch[2], 10);
            
            // Update the pattern and next number if this is the highest number
            if (newPattern !== namingPattern) {
              setNamingPattern(newPattern);
            }
            
            if (newNumber >= nextCameraNumber) {
              setNextCameraNumber(newNumber + 1);
            }
          }
        }
        
        const updatedCamera = { ...camera, ...updates };
        console.log(`Caméra mise à jour sur la page ${page}:`, updatedCamera);
        return updatedCamera;
      }
      return camera;
    });
    
    setPageCameras({
      ...pageCameras,
      [page]: updatedPageCameras
    });
  };

  const deleteCamera = (id: string) => {
    // Supprimer la caméra uniquement de la page courante
    const filteredCameras = (pageCameras[page] || []).filter(camera => camera.id !== id);
    
    setPageCameras({
      ...pageCameras,
      [page]: filteredCameras
    });
    
    if (selectedCamera === id) {
      setSelectedCamera(null);
    }
    
    // Supprimer également les commentaires associés à cette caméra
    const filteredComments = (pageComments[page] || []).filter(comment => comment.cameraId !== id);
    
    setPageComments({
      ...pageComments,
      [page]: filteredComments
    });
    
    console.log(`Caméra supprimée de la page ${page}, ID: ${id}`);
  };

  // Fonction pour effacer toutes les caméras de la page courante
  const clearCurrentPage = () => {
    const updatedPageCameras = { ...pageCameras };
    delete updatedPageCameras[page];
    
    setPageCameras(updatedPageCameras);
    setSelectedCamera(null);
    
    // Supprimer également tous les commentaires de la page
    const updatedPageComments = { ...pageComments };
    delete updatedPageComments[page];
    
    setPageComments(updatedPageComments);
    setSelectedComment(null);
    
    console.log(`Toutes les caméras et commentaires de la page ${page} ont été supprimés`);
  };

  // Nouvelles fonctions pour gérer les commentaires
  const addComment = (x: number, y: number, text: string, cameraId?: string) => {
    const newComment: Comment = {
      id: uuidv4(),
      text,
      x,
      y,
      page,
      color: getRandomColor(),
      cameraId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Ajouter le commentaire à la page courante
    const currentPageComments = [...(pageComments[page] || []), newComment];
    setPageComments({
      ...pageComments,
      [page]: currentPageComments
    });
    
    setSelectedComment(newComment.id);
    setIsAddingComment(false);
    
    console.log(`Commentaire ajouté à la page ${page}:`, newComment);
  };

  const updateComment = (id: string, updates: Partial<Comment>) => {
    // Mettre à jour le commentaire uniquement sur la page courante
    const updatedPageComments = (pageComments[page] || []).map(comment => {
      if (comment.id === id) {
        const updatedComment = { 
          ...comment, 
          ...updates,
          updatedAt: new Date()
        };
        console.log(`Commentaire mis à jour sur la page ${page}:`, updatedComment);
        return updatedComment;
      }
      return comment;
    });
    
    setPageComments({
      ...pageComments,
      [page]: updatedPageComments
    });
  };

  const deleteComment = (id: string) => {
    // Supprimer le commentaire uniquement de la page courante
    const filteredComments = (pageComments[page] || []).filter(comment => comment.id !== id);
    
    setPageComments({
      ...pageComments,
      [page]: filteredComments
    });
    
    if (selectedComment === id) {
      setSelectedComment(null);
    }
    
    console.log(`Commentaire supprimé de la page ${page}, ID: ${id}`);
  };

  // Fonction pour générer une couleur aléatoire pour les commentaires
  const getRandomColor = () => {
    const colors = [
      '#FF5252', // Rouge
      '#4CAF50', // Vert
      '#2196F3', // Bleu
      '#FFC107', // Jaune
      '#9C27B0', // Violet
      '#FF9800', // Orange
      '#00BCD4', // Cyan
      '#795548', // Marron
      '#607D8B'  // Bleu-gris
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Fonction pour capturer l'état exact du canvas avec les caméras
  const captureCanvas = async (): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      // Trouver le canvas du PDF et le canvas Konva
      const pdfCanvas = document.querySelector('canvas:not(.konvajs-content canvas)');
      const konvaCanvas = document.querySelector('.konvajs-content canvas');
      
      if (!pdfCanvas || !konvaCanvas) {
        console.error('Canvas non trouvés');
        resolve(null);
        return;
      }
      
      // Créer un canvas temporaire pour combiner les deux
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        console.error('Impossible de créer un contexte 2D');
        resolve(null);
        return;
      }
      
      // Définir les dimensions du canvas temporaire
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      
      // Dessiner d'abord le PDF
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Puis dessiner le canvas Konva par-dessus
      ctx.drawImage(konvaCanvas, 0, 0);
      
      // Attendre un peu pour s'assurer que le rendu est terminé
      setTimeout(() => {
        resolve(tempCanvas);
      }, 100);
    });
  };

  // Fonction pour prévisualiser le PDF de la page courante
  const previewPdf = async () => {
    console.log(`Prévisualisation du PDF pour la page ${page}`);
    
    // Nettoyer l'URL précédente si elle existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    try {
      // Capturer le canvas combiné
      const combinedCanvas = await captureCanvas();
      
      if (!combinedCanvas) {
        console.error('Échec de la capture du canvas');
        return;
      }
      
      // Déterminer l'orientation en fonction du ratio largeur/hauteur
      const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
      
      // Créer le PDF avec les dimensions appropriées
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [combinedCanvas.width, combinedCanvas.height],
        hotfixes: ['px_scaling']
      });
      
      // Calculer les dimensions du PDF en points
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Obtenir les données d'image du canvas avec une haute qualité
      const imageData = combinedCanvas.toDataURL('image/jpeg', 1.0);
      
      // Ajouter l'image au PDF
      pdf.addImage({
        imageData: imageData,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE'
      });
      
      // Générer le blob et créer une URL
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      setPreviewUrl(url);
      setIsPreviewOpen(true);
      
      console.log('URL de prévisualisation créée');
    } catch (error) {
      console.error('Erreur lors de la génération de la prévisualisation:', error);
    }
  };

  // Fonction pour exporter le PDF de la page courante
  const exportCurrentPage = async () => {
    console.log(`Export du PDF pour la page ${page}`);
    
    try {
      // Capturer le canvas combiné
      const combinedCanvas = await captureCanvas();
      
      if (!combinedCanvas) {
        console.error('Échec de la capture du canvas');
        return;
      }
      
      // Déterminer l'orientation en fonction du ratio largeur/hauteur
      const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
      
      // Créer le PDF avec les dimensions appropriées
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [combinedCanvas.width, combinedCanvas.height],
        hotfixes: ['px_scaling']
      });
      
      // Calculer les dimensions du PDF en points
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Obtenir les données d'image du canvas avec une haute qualité
      const imageData = combinedCanvas.toDataURL('image/jpeg', 1.0);
      
      // Ajouter l'image au PDF
      pdf.addImage({
        imageData: imageData,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE'
      });
      
      // Télécharger le PDF
      pdf.save(`plancam_page${page}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      console.log('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export du PDF:', error);
    }
  };

  // Nouvelle fonction pour exporter toutes les pages en un seul PDF
  const exportPdf = async () => {
    console.log('Export de toutes les pages en un seul PDF');
    
    if (!pdfFile || totalPages === 0) {
      console.error('Aucun fichier PDF chargé ou nombre de pages invalide');
      return;
    }
    
    try {
      // Sauvegarder la page courante
      const currentPage = page;
      
      // Récupérer les numéros de pages qui contiennent des caméras
      const pageNumbers = Object.keys(pageCameras)
        .map(Number)
        .filter(pageNum => pageNum <= totalPages)
        .sort((a, b) => a - b);
      
      if (pageNumbers.length === 0) {
        alert('Aucune page avec des caméras à exporter');
        return;
      }
      
      // Créer un nouveau PDF
      const mergedPdf = new jsPDF();
      let isFirstPage = true;
      
      // Pour chaque page qui contient des caméras
      for (const pageNum of pageNumbers) {
        console.log(`Traitement de la page ${pageNum} pour l'export complet`);
        
        // Changer de page
        setPage(pageNum);
        
        // Attendre que le rendu de la page soit terminé
        // Cette attente est cruciale pour que le PDF soit correctement rendu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capturer le canvas de cette page
        const combinedCanvas = await captureCanvas();
        
        if (!combinedCanvas) {
          console.error(`Échec de la capture du canvas pour la page ${pageNum}`);
          continue;
        }
        
        // Déterminer l'orientation en fonction du ratio largeur/hauteur
        const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
        
        // Si ce n'est pas la première page, ajouter une nouvelle page au PDF
        if (!isFirstPage) {
          mergedPdf.addPage([combinedCanvas.width, combinedCanvas.height], orientation);
        } else {
          // Pour la première page, définir le format du PDF
          mergedPdf.deletePage(1);
          mergedPdf.addPage([combinedCanvas.width, combinedCanvas.height], orientation);
          isFirstPage = false;
        }
        
        // Obtenir les données d'image du canvas avec une haute qualité
        const imageData = combinedCanvas.toDataURL('image/jpeg', 1.0);
        
        // Ajouter l'image à la page courante du PDF
        const pdfWidth = mergedPdf.internal.pageSize.getWidth();
        const pdfHeight = mergedPdf.internal.pageSize.getHeight();
        
        mergedPdf.addImage({
          imageData: imageData,
          format: 'JPEG',
          x: 0,
          y: 0,
          width: pdfWidth,
          height: pdfHeight,
          compression: 'NONE'
        });
        
        console.log(`Page ${pageNum} ajoutée au PDF`);
      }
      
      // Restaurer la page courante
      setPage(currentPage);
      
      // Télécharger le PDF final
      mergedPdf.save(`plancam_complet_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      console.log('Export complet terminé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export complet:', error);
      alert('Une erreur est survenue lors de l\'export. Veuillez réessayer.');
    }
  };

  return (
    <AppContext.Provider value={{
      pdfFile,
      setPdfFile,
      cameras,
      addCamera,
      updateCamera,
      deleteCamera,
      selectedCamera,
      setSelectedCamera,
      scale,
      setScale,
      page,
      setPage,
      totalPages,
      setTotalPages,
      isAuthenticated,
      login,
      logout,
      exportPdf,
      exportCurrentPage,
      previewPdf,
      previewUrl,
      setPreviewUrl,
      isPreviewOpen,
      setIsPreviewOpen,
      namingPattern,
      setNamingPattern,
      nextCameraNumber,
      setNextCameraNumber,
      selectedIconType,
      setSelectedIconType,
      clearCurrentPage,
      // Nouvelles valeurs pour les commentaires
      comments,
      addComment,
      updateComment,
      deleteComment,
      selectedComment,
      setSelectedComment,
      isAddingComment,
      setIsAddingComment,
      // Nouvelles valeurs pour la gestion des utilisateurs
      currentUser,
      isAdmin,
      users,
      addUser,
      updateUser,
      deleteUser,
      isAdminMode,
      setIsAdminMode,
      // Nouvelles valeurs pour la synchronisation
      syncWithCloud,
      isSyncing,
      lastSyncTime,
      syncError
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
