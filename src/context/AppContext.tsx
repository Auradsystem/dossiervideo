import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { Camera, CameraType, cameraIcons } from '../types/Camera';
import { Comment } from '../types/Comment';
import { User } from '../types/User';
import { supabase, supabaseAuth, initializeDefaultUsers, getServiceSupabase } from '../lib/supabase';

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
  login: (email: string, password: string) => Promise<boolean>;
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
  // Fonctionnalités pour les commentaires
  comments: Comment[];
  addComment: (x: number, y: number, text: string, cameraId?: string) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  selectedComment: string | null;
  setSelectedComment: (id: string | null) => void;
  isAddingComment: boolean;
  setIsAddingComment: (isAdding: boolean) => void;
  // Fonctionnalités pour la gestion des utilisateurs
  currentUser: User | null;
  isAdmin: boolean;
  register: (email: string, password: string, isAdmin: boolean) => Promise<boolean>;
  isAdminMode: boolean;
  setIsAdminMode: (isAdmin: boolean) => void;
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
  
  // États pour les commentaires
  const [pageComments, setPageComments] = useState<PageComments>({});
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);

  // États pour la gestion des utilisateurs
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

  // Initialiser Supabase au démarrage
  useEffect(() => {
    const initApp = async () => {
      try {
        // Vérifier s'il y a une session active
        const { session, user, error } = await supabaseAuth.getSession();
        
        if (session && user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setIsAdmin(user.isAdmin);
          console.log('Session restaurée:', user);
        } else {
          // Initialiser les utilisateurs par défaut si nécessaire
          await initializeDefaultUsers();
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
      }
    };
    
    initApp();
    
    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Événement d\'authentification:', event);
        
        if (event === 'SIGNED_IN' && session) {
          // Récupérer les informations utilisateur complètes
          const { user, error } = await supabaseAuth.getSession();
          
          if (user && !error) {
            setIsAuthenticated(true);
            setCurrentUser(user);
            setIsAdmin(user.isAdmin);
            console.log('Utilisateur connecté:', user);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsAdmin(false);
          setIsAdminMode(false);
          console.log('Utilisateur déconnecté');
        }
      }
    );
    
    // Nettoyer l'écouteur
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      // Connexion via Supabase
      const { user, error } = await supabaseAuth.signIn(email, password);
      
      if (error) {
        console.error('Erreur de connexion:', error);
        return false;
      }
      
      if (user) {
        // L'authentification est gérée par l'écouteur onAuthStateChange
        console.log('Connexion réussie');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = async () => {
    try {
      setIsSyncing(true);
      
      // Déconnexion de Supabase
      await supabaseAuth.signOut();
      
      // La déconnexion est gérée par l'écouteur onAuthStateChange
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fonction pour inscrire un nouvel utilisateur
  const register = async (email: string, password: string, isAdmin: boolean): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      // Utiliser l'API standard de Supabase pour l'inscription
      const { user, error } = await supabaseAuth.signUp(email, password, { is_admin: isAdmin });
      
      if (error) {
        console.error('Erreur d\'inscription:', error);
        return false;
      }
      
      if (user) {
        console.log('Inscription réussie via l\'API standard');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    } finally {
      setIsSyncing(false);
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

  // Fonctions pour gérer les commentaires
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

  // Fonction pour exporter toutes les pages en un seul PDF
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
      // Valeurs pour les commentaires
      comments,
      addComment,
      updateComment,
      deleteComment,
      selectedComment,
      setSelectedComment,
      isAddingComment,
      setIsAddingComment,
      // Valeurs pour la gestion des utilisateurs
      currentUser,
      isAdmin,
      register,
      isAdminMode,
      setIsAdminMode,
      // Valeurs pour la synchronisation
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
