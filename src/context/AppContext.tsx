import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/User';
import { Comment } from '../types/Comment';
import { Camera } from '../types/Camera';
import { Project } from '../types/Project';
import { supabaseAuth, supabaseStorage } from '../lib/supabase';

// Interface pour le contexte de l'application
interface AppContextType {
  // État d'authentification
  isAuthenticated: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  isAdminMode: boolean;
  
  // Gestion des projets
  projects: Project[];
  currentProject: Project | null;
  
  // Gestion des PDF
  pdfFile: string | null;
  pdfName: string;
  
  // Gestion des commentaires
  comments: Comment[];
  
  // Gestion des caméras
  cameras: Camera[];
  
  // État de synchronisation
  isSyncing: boolean;
  
  // Fonctions d'authentification
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, isAdmin: boolean) => Promise<boolean>;
  toggleAdminMode: () => void;
  
  // Fonctions de gestion des projets
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string) => Promise<Project | null>;
  
  // Fonctions de gestion des PDF
  setPdfFile: (file: string | null, name?: string) => void;
  uploadPdf: (file: File, projectName: string) => Promise<boolean>;
  
  // Fonctions de gestion des commentaires
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  updateComment: (id: string, text: string) => void;
  deleteComment: (id: string) => void;
  
  // Fonctions de gestion des caméras
  addCamera: (camera: Omit<Camera, 'id'>) => void;
  updateCamera: (id: string, data: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
}

// Valeurs par défaut pour le contexte
const defaultContextValue: AppContextType = {
  isAuthenticated: false,
  currentUser: null,
  isAdmin: false,
  isAdminMode: false,
  projects: [],
  currentProject: null,
  pdfFile: null,
  pdfName: '',
  comments: [],
  cameras: [],
  isSyncing: false,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  toggleAdminMode: () => {},
  setCurrentProject: () => {},
  createProject: async () => null,
  setPdfFile: () => {},
  uploadPdf: async () => false,
  addComment: () => {},
  updateComment: () => {},
  deleteComment: () => {},
  addCamera: () => {},
  updateCamera: () => {},
  deleteCamera: () => {}
};

// Créer le contexte
const AppContext = createContext<AppContextType>(defaultContextValue);

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => useContext(AppContext);

// Fournisseur du contexte
export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // État des projets
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // État du PDF
  const [pdfFile, setPdfFileState] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState('');
  
  // État des commentaires et caméras
  const [comments, setComments] = useState<Comment[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  
  // État de synchronisation
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, user } = await supabaseAuth.getSession();
        
        if (session && user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setIsAdmin(user.isAdmin);
          
          // Charger les projets de l'utilisateur
          loadUserProjects();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      }
    };
    
    checkAuth();
  }, []);
  
  // Charger les projets de l'utilisateur
  const loadUserProjects = async () => {
    try {
      setIsSyncing(true);
      
      const { data, error } = await supabaseStorage.listUserProjects();
      
      if (error) {
        console.error('Erreur lors du chargement des projets:', error);
        return;
      }
      
      if (data) {
        const projectsList: Project[] = data.map(project => ({
          id: project.path,
          name: project.name,
          createdAt: new Date(project.createdAt || Date.now())
        }));
        
        setProjects(projectsList);
        
        // Si un projet courant n'est pas défini et qu'il y a des projets, définir le premier comme courant
        if (!currentProject && projectsList.length > 0) {
          setCurrentProject(projectsList[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, error } = await supabaseAuth.signIn(email, password);
      
      if (error) {
        console.error('Erreur de connexion:', error);
        return false;
      }
      
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setIsAdmin(user.isAdmin);
        
        // Charger les projets de l'utilisateur
        await loadUserProjects();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };
  
  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabaseAuth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return;
      }
      
      // Réinitialiser l'état
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
      setIsAdminMode(false);
      setProjects([]);
      setCurrentProject(null);
      setPdfFileState(null);
      setPdfName('');
      setComments([]);
      setCameras([]);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  // Fonction d'inscription
  const register = async (email: string, password: string, isAdmin: boolean): Promise<boolean> => {
    try {
      const { user, error } = await supabaseAuth.signUp(email, password, { is_admin: isAdmin });
      
      if (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return false;
      }
      
      return !!user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };
  
  // Fonction pour basculer le mode admin
  const toggleAdminMode = () => {
    if (isAdmin) {
      setIsAdminMode(!isAdminMode);
    }
  };
  
  // Fonction pour définir le PDF courant
  const setPdfFile = (file: string | null, name = '') => {
    setPdfFileState(file);
    if (name) {
      setPdfName(name);
    }
  };
  
  // Fonction pour télécharger un PDF
  const uploadPdf = async (file: File, projectName: string): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      // Créer le projet s'il n'existe pas
      let projectExists = projects.some(p => p.name === projectName);
      
      if (!projectExists) {
        const newProject = await createProject(projectName);
        if (!newProject) {
          throw new Error('Impossible de créer le projet');
        }
      }
      
      // Télécharger le fichier
      const { data, error } = await supabaseStorage.uploadPdf(file, projectName);
      
      if (error) {
        console.error('Erreur lors du téléchargement du PDF:', error);
        return false;
      }
      
      if (data) {
        // Mettre à jour le PDF courant
        setPdfFile(data.url, data.fileName);
        
        // Recharger les projets pour mettre à jour la liste
        await loadUserProjects();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Fonction pour créer un projet
  const createProject = async (name: string): Promise<Project | null> => {
    try {
      // Vérifier si le projet existe déjà
      const projectExists = projects.some(p => p.name === name);
      
      if (projectExists) {
        // Si le projet existe, le retourner
        const existingProject = projects.find(p => p.name === name);
        if (existingProject) {
          return existingProject;
        }
      }
      
      // Créer un nouveau projet (dossier) dans Supabase Storage
      // Note: Supabase Storage ne permet pas de créer des dossiers vides directement
      // Nous allons donc créer un fichier placeholder pour créer le dossier
      
      // Créer un fichier placeholder
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      const placeholderFile = new File([placeholderContent], '.placeholder', { type: 'text/plain' });
      
      // Télécharger le fichier placeholder pour créer le dossier
      const { data, error } = await supabaseStorage.uploadPdf(placeholderFile, name);
      
      if (error) {
        console.error('Erreur lors de la création du projet:', error);
        return null;
      }
      
      // Créer l'objet projet
      const newProject: Project = {
        id: `users/${currentUser?.id}/projects/${name.replace(/\s+/g, '_')}`,
        name,
        createdAt: new Date()
      };
      
      // Mettre à jour la liste des projets
      setProjects(prev => [...prev, newProject]);
      
      // Définir le nouveau projet comme projet courant
      setCurrentProject(newProject);
      
      return newProject;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      return null;
    }
  };
  
  // Fonction pour ajouter un commentaire
  const addComment = (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setComments(prev => [...prev, newComment]);
  };
  
  // Fonction pour mettre à jour un commentaire
  const updateComment = (id: string, text: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === id ? { ...comment, text } : comment
      )
    );
  };
  
  // Fonction pour supprimer un commentaire
  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  };
  
  // Fonction pour ajouter une caméra
  const addCamera = (camera: Omit<Camera, 'id'>) => {
    const newCamera: Camera = {
      ...camera,
      id: Date.now().toString()
    };
    
    setCameras(prev => [...prev, newCamera]);
  };
  
  // Fonction pour mettre à jour une caméra
  const updateCamera = (id: string, data: Partial<Camera>) => {
    setCameras(prev => 
      prev.map(camera => 
        camera.id === id ? { ...camera, ...data } : camera
      )
    );
  };
  
  // Fonction pour supprimer une caméra
  const deleteCamera = (id: string) => {
    setCameras(prev => prev.filter(camera => camera.id !== id));
  };
  
  // Valeur du contexte
  const contextValue: AppContextType = {
    isAuthenticated,
    currentUser,
    isAdmin,
    isAdminMode,
    projects,
    currentProject,
    pdfFile,
    pdfName,
    comments,
    cameras,
    isSyncing,
    login,
    logout,
    register,
    toggleAdminMode,
    setCurrentProject,
    createProject,
    setPdfFile,
    uploadPdf,
    addComment,
    updateComment,
    deleteComment,
    addCamera,
    updateCamera,
    deleteCamera
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
