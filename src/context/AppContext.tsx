import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera, createDefaultCamera, CameraType } from '../types/Camera';
import { Comment } from '../types/Comment';
import { User } from '../types/User';
import { supabaseAuth } from '../lib/supabase';

// Définir l'interface du contexte
interface AppContextType {
  // État de l'utilisateur
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  
  // Gestion des PDF
  pdfFile: File | string | null;
  setPdfFile: React.Dispatch<React.SetStateAction<File | string | null>>;
  
  // Gestion des caméras
  cameras: Camera[];
  selectedCamera: string | null;
  setSelectedCamera: React.Dispatch<React.SetStateAction<string | null>>;
  addCamera: (camera: Omit<Camera, 'id'>) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  
  // Gestion des commentaires
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id'>) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  
  // Gestion de l'interface
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Authentification
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
}

// Créer le contexte avec une valeur par défaut
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext doit être utilisé à l'intérieur d'un AppProvider');
  }
  return context;
};

// Fournisseur du contexte
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État de l'utilisateur
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Gestion des PDF
  const [pdfFile, setPdfFile] = useState<File | string | null>(null);
  
  // Gestion des caméras
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  
  // Gestion des commentaires
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Gestion de l'interface
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, user } = await supabaseAuth.getSession();
        
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l'authentification:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fonction pour ajouter une caméra
  const addCamera = (camera: Omit<Camera, 'id'>) => {
    const newCamera: Camera = {
      ...camera,
      id: uuidv4()
    };
    
    setCameras(prev => [...prev, newCamera]);
    setSelectedCamera(newCamera.id);
  };
  
  // Fonction pour mettre à jour une caméra
  const updateCamera = (id: string, updates: Partial<Camera>) => {
    setCameras(prev =>
      prev.map(camera =>
        camera.id === id ? { ...camera, ...updates } : camera
      )
    );
  };
  
  // Fonction pour supprimer une caméra
  const deleteCamera = (id: string) => {
    setCameras(prev => prev.filter(camera => camera.id !== id));
    if (selectedCamera === id) {
      setSelectedCamera(null);
    }
  };
  
  // Fonction pour ajouter un commentaire
  const addComment = (comment: Omit<Comment, 'id'>) => {
    const newComment: Comment = {
      ...comment,
      id: uuidv4()
    };
    
    setComments(prev => [...prev, newComment]);
  };
  
  // Fonction pour mettre à jour un commentaire
  const updateComment = (id: string, updates: Partial<Comment>) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id ? { ...comment, ...updates } : comment
      )
    );
  };
  
  // Fonction pour supprimer un commentaire
  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  };
  
  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      const { user, error } = await supabaseAuth.signIn(email, password);
      
      if (error) throw error;
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };
  
  // Fonction de déconnexion
  const logout = async () => {
    try {
      const { error } = await supabaseAuth.signOut();
      
      if (error) throw error;
      
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };
  
  // Fonction d'inscription
  const register = async (email: string, password: string, isAdmin = false) => {
    try {
      const { user, error } = await supabaseAuth.signUp(email, password, { is_admin: isAdmin });
      
      if (error) throw error;
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };
  
  // Valeur du contexte
  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    pdfFile,
    setPdfFile,
    cameras,
    selectedCamera,
    setSelectedCamera,
    addCamera,
    updateCamera,
    deleteCamera,
    comments,
    addComment,
    updateComment,
    deleteComment,
    isSidebarOpen,
    setIsSidebarOpen,
    login,
    logout,
    register
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
