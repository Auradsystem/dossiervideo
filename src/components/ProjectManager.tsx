import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  Skeleton,
  Tooltip,
  Snackbar
} from '@mui/material';
import { Folder, File, Trash2, Download, Upload, Plus, RefreshCw, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabaseStorage } from '../lib/supabaseStorage';

interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
}

interface ProjectFile {
  name: string;
  size: number;
  created_at: string;
}

const ProjectManager: React.FC = () => {
  const { currentUser, setPdfFile } = useAppContext();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Fonction pour charger les projets avec debounce
  const loadProjects = useCallback(async (forceRefresh = false) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { projects, error } = await supabaseStorage.listProjects(currentUser.id, forceRefresh);
      
      if (error) throw error;
      
      // Transformer les IDs de projet en objets projet
      const projectObjects = projects.map(projectId => ({
        id: projectId,
        name: `Projet ${projectId.substring(0, 8)}`,
        files: []
      }));
      
      setProjects(projectObjects);
      
      if (projectObjects.length > 0 && !selectedProject) {
        setSelectedProject(projectObjects[0].id);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des projets:', err);
      setError('Impossible de charger les projets. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedProject]);
  
  // Fonction pour charger les fichiers d'un projet avec debounce
  const loadProjectFiles = useCallback(async (projectId: string, forceRefresh = false) => {
    if (!currentUser) return;
    
    setLoadingFiles(true);
    setError(null);
    
    try {
      const { files, error } = await supabaseStorage.listProjectFiles(currentUser.id, projectId, forceRefresh);
      
      if (error) throw error;
      
      setProjectFiles(files);
    } catch (err: any) {
      console.error('Erreur lors du chargement des fichiers:', err);
      setError('Impossible de charger les fichiers. Veuillez réessayer.');
    } finally {
      setLoadingFiles(false);
    }
  }, [currentUser]);
  
  // Charger les projets au chargement du composant
  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser, loadProjects]);
  
  // Charger les fichiers du projet sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadProjectFiles(selectedProject);
    } else {
      setProjectFiles([]);
    }
  }, [selectedProject, loadProjectFiles]);
  
  // Fonction pour créer un nouveau projet
  const createNewProject = async () => {
    if (!currentUser || !newProjectName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Générer un nouvel ID de projet
      const projectId = crypto.randomUUID();
      
      // Créer un fichier vide pour initialiser le dossier du projet
      const emptyFile = new File([""], ".project", { type: "text/plain" });
      
      const { success, error } = await supabaseStorage.uploadPdf(
        currentUser.id,
        emptyFile,
        projectId,
        ".project"
      );
      
      if (error) throw error;
      
      // Ajouter le nouveau projet à la liste
      const newProject = {
        id: projectId,
        name: newProjectName,
        files: []
      };
      
      setProjects([...projects, newProject]);
      setSelectedProject(projectId);
      setSuccess('Projet créé avec succès');
      
      // Fermer le dialogue
      setNewProjectDialogOpen(false);
      setNewProjectName('');
      
      // Rafraîchir la liste des projets
      await loadProjects(true);
    } catch (err: any) {
      console.error('Erreur lors de la création du projet:', err);
      setError('Impossible de créer le projet. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour télécharger un fichier
  const uploadPdfToProject = async () => {
    if (!currentUser || !selectedProject || !uploadFile) return;
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Simuler la progression du téléchargement
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      const { success, error } = await supabaseStorage.uploadPdf(
        currentUser.id,
        uploadFile,
        selectedProject
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) throw error;
      
      // Recharger les fichiers du projet
      await loadProjectFiles(selectedProject, true);
      
      setSuccess('Fichier téléchargé avec succès');
      
      // Fermer le dialogue après un court délai pour montrer 100%
      setTimeout(() => {
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadProgress(0);
      }, 500);
    } catch (err: any) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      setError('Impossible de télécharger le fichier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour télécharger un fichier
  const downloadFile = async (filename: string) => {
    if (!currentUser || !selectedProject) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { downloadUrl, error } = await supabaseStorage.downloadPdf(
        currentUser.id,
        selectedProject,
        filename
      );
      
      if (error) throw error;
      
      // Ouvrir l'URL de téléchargement dans un nouvel onglet
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      setError('Impossible de télécharger le fichier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour prévisualiser un fichier
  const previewFile = async (filename: string) => {
    if (!currentUser || !selectedProject) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Précharger le fichier pour améliorer les performances
      await supabaseStorage.preloadPdf(currentUser.id, selectedProject, filename);
      
      const { downloadUrl, error } = await supabaseStorage.downloadPdf(
        currentUser.id,
        selectedProject,
        filename
      );
      
      if (error) throw error;
      
      // Ouvrir l'URL de prévisualisation dans un nouvel onglet
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Erreur lors de la prévisualisation du fichier:', err);
      setError('Impossible de prévisualiser le fichier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour charger un fichier dans l'éditeur
  const loadFileInEditor = async (filename: string) => {
    if (!currentUser || !selectedProject) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { file, error } = await supabaseStorage.getPdfFile(
        currentUser.id,
        selectedProject,
        filename
      );
      
      if (error) throw error;
      
      if (file) {
        // Convertir le Blob en File
        const pdfFile = new File([file], filename, { type: 'application/pdf' });
        
        // Charger le fichier dans l'éditeur
        setPdfFile(pdfFile);
        
        setSuccess('Fichier chargé dans l\'éditeur');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du fichier:', err);
      setError('Impossible de charger le fichier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour supprimer un fichier
  const deleteFile = async (filename: string) => {
    if (!currentUser || !selectedProject) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${filename}" ?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await supabaseStorage.deleteFile(
        currentUser.id,
        selectedProject,
        filename
      );
      
      if (error) throw error;
      
      // Recharger les fichiers du projet
      await loadProjectFiles(selectedProject, true);
      
      setSuccess('Fichier supprimé avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la suppression du fichier:', err);
      setError('Impossible de supprimer le fichier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour supprimer un projet
  const deleteProject = async (projectId: string) => {
    if (!currentUser) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce projet et tous ses fichiers ?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await supabaseStorage.deleteProject(
        currentUser.id,
        projectId
      );
      
      if (error) throw error;
      
      // Supprimer le projet de la liste
      setProjects(projects.filter(project => project.id !== projectId));
      
      // Si le projet supprimé était sélectionné, sélectionner le premier projet restant
      if (selectedProject === projectId) {
        const remainingProjects = projects.filter(project => project.id !== projectId);
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0].id : null);
      }
      
      // Rafraîchir la liste des projets
      await loadProjects(true);
      
      setSuccess('Projet supprimé avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la suppression du projet:', err);
      setError('Impossible de supprimer le projet. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Fonction pour gérer le changement de fichier
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Vérifier si le fichier est un PDF
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      
      // Vérifier la taille du fichier (max 50 Mo)
      if (file.size > 50 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 50 Mo)');
        return;
      }
      
      setUploadFile(file);
    }
  };
  
  // Afficher un message si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Veuillez vous connecter pour accéder au gestionnaire de projets.
        </Alert>
      </Box>
    );
  }
  
  // Rendu des squelettes de chargement pour les projets
  const renderProjectSkeletons = () => (
    Array(3).fill(0).map((_, index) => (
      <ListItem key={`project-skeleton-${index}`}>
        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
        <ListItemText
          primary={<Skeleton width="80%" />}
          secondary={<Skeleton width="40%" />}
        />
      </ListItem>
    ))
  );
  
  // Rendu des squelettes de chargement pour les fichiers
  const renderFileSkeletons = () => (
    Array(5).fill(0).map((_, index) => (
      <ListItem key={`file-skeleton-${index}`}>
        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
        <ListItemText
          primary={<Skeleton width="70%" />}
          secondary={<Skeleton width="50%" />}
        />
        <ListItemSecondaryAction>
          <Skeleton variant="circular" width={30} height={30} sx={{ mr: 1 }} />
          <Skeleton variant="circular" width={30} height={30} />
        </ListItemSecondaryAction>
      </ListItem>
    ))
  );
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Gestionnaire de Projets
      </Typography>
      
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={2}>
        {/* Liste des projets */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Projets
              </Typography>
              <Box>
                <Tooltip title="Rafraîchir">
                  <IconButton 
                    size="small" 
                    onClick={() => loadProjects(true)}
                    disabled={loading}
                  >
                    <RefreshCw size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Nouveau projet">
                  <Button
                    startIcon={<Plus size={18} />}
                    variant="contained"
                    size="small"
                    onClick={() => setNewProjectDialogOpen(true)}
                    disabled={loading}
                    sx={{ ml: 1 }}
                  >
                    Nouveau
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {loading && projects.length === 0 ? (
              <List dense>
                {renderProjectSkeletons()}
              </List>
            ) : projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                Aucun projet trouvé
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {projects.map((project) => (
                  <ListItem
                    key={project.id}
                    button
                    selected={selectedProject === project.id}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <Folder size={20} style={{ marginRight: 8 }} />
                    <ListItemText 
                      primary={project.name} 
                      secondary={`ID: ${project.id.substring(0, 8)}...`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Supprimer le projet">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          disabled={loading}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Fichiers du projet sélectionné */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedProject 
                  ? `Fichiers - ${projects.find(p => p.id === selectedProject)?.name || selectedProject}` 
                  : 'Fichiers'}
              </Typography>
              <Box>
                <Tooltip title="Rafraîchir">
                  <IconButton 
                    size="small" 
                    onClick={() => selectedProject && loadProjectFiles(selectedProject, true)}
                    disabled={loadingFiles || !selectedProject}
                  >
                    <RefreshCw size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Télécharger un fichier">
                  <Button
                    startIcon={<Upload size={18} />}
                    variant="contained"
                    size="small"
                    onClick={() => setUploadDialogOpen(true)}
                    disabled={loading || !selectedProject}
                    sx={{ ml: 1 }}
                  >
                    Télécharger
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {!selectedProject ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                Sélectionnez un projet pour voir ses fichiers
              </Typography>
            ) : loadingFiles ? (
              <List dense>
                {renderFileSkeletons()}
              </List>
            ) : projectFiles.length === 0 || (projectFiles.length === 1 && projectFiles[0].name === '.project') ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                Aucun fichier dans ce projet
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {projectFiles
                  .filter(file => file.name !== '.project') // Filtrer le fichier de projet caché
                  .map((file) => (
                    <ListItem
                      key={file.name}
                      button
                      onClick={() => loadFileInEditor(file.name)}
                    >
                      <File size={20} style={{ marginRight: 8 }} />
                      <ListItemText 
                        primary={file.name} 
                        secondary={`${formatFileSize(file.size)} • ${new Date(file.created_at).toLocaleString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Prévisualiser">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              previewFile(file.name);
                            }}
                            disabled={loading}
                            sx={{ mr: 1 }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(file.name);
                            }}
                            disabled={loading}
                            sx={{ mr: 1 }}
                          >
                            <Download size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFile(file.name);
                            }}
                            disabled={loading}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogue pour créer un nouveau projet */}
      <Dialog open={newProjectDialogOpen} onClose={() => setNewProjectDialogOpen(false)}>
        <DialogTitle>Nouveau Projet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du projet"
            type="text"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={createNewProject} 
            disabled={!newProjectName.trim() || loading}
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue pour télécharger un fichier */}
      <Dialog open={uploadDialogOpen} onClose={() => !loading && setUploadDialogOpen(false)}>
        <DialogTitle>Télécharger un fichier PDF</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="upload-file-button"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-file-button">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                disabled={loading}
              >
                Sélectionner un fichier PDF
              </Button>
            </label>
            
            {uploadFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Fichier sélectionné: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </Typography>
                
                {loading && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Téléchargement: {Math.round(uploadProgress)}%
                    </Typography>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#e0e0e0',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `${uploadProgress}%`,
                          bgcolor: 'primary.main',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={loading}>Annuler</Button>
          <Button 
            onClick={uploadPdfToProject} 
            disabled={!uploadFile || loading}
            variant="contained"
          >
            {loading ? 'Téléchargement...' : 'Télécharger'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;
