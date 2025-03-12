import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Folder as FolderIcon, 
  Description as FileIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { supabaseStorage } from '../lib/supabase';
import { Project } from '../types/Project';

interface ProjectFile {
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  projectName: string;
  uploadedAt: Date;
}

const ProjectManager: React.FC = () => {
  const { setPdfFile, currentUser } = useAppContext();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour les dialogues
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  
  // États pour les formulaires
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Charger les projets au montage
  useEffect(() => {
    loadProjects();
  }, [currentUser]);
  
  // Charger les fichiers du projet sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadProjectFiles(selectedProject.name);
    }
  }, [selectedProject]);
  
  // Fonction pour charger les projets
  const loadProjects = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseStorage.listUserProjects();
      
      if (error) throw error;
      
      if (data) {
        const projectsList: Project[] = data.map(project => ({
          id: project.path,
          name: project.name,
          createdAt: new Date(project.createdAt || Date.now())
        }));
        
        setProjects(projectsList);
        
        // Si aucun projet n'est sélectionné et qu'il y a des projets, sélectionner le premier
        if (!selectedProject && projectsList.length > 0) {
          setSelectedProject(projectsList[0]);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des projets:', error);
      setError('Impossible de charger les projets: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour charger les fichiers d'un projet
  const loadProjectFiles = async (projectName: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseStorage.listProjectFiles(projectName);
      
      if (error) throw error;
      
      if (data) {
        const filesList: ProjectFile[] = data.map(file => ({
          name: file.name,
          path: file.path,
          url: file.url,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'application/pdf',
          projectName: projectName,
          uploadedAt: new Date(file.created_at || Date.now())
        }));
        
        setProjectFiles(filesList);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des fichiers du projet:', error);
      setError('Impossible de charger les fichiers: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour créer un nouveau projet
  const handleCreateProject = async () => {
    if (!currentUser) return;
    
    if (!newProjectName.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser la fonction createProject du service supabaseStorage
      const { data, error } = await supabaseStorage.createProject(newProjectName);
      
      if (error) throw error;
      
      if (data) {
        // Créer un nouvel objet projet
        const newProject: Project = {
          id: data.path,
          name: data.name,
          createdAt: new Date(data.createdAt)
        };
        
        // Ajouter le projet à la liste
        setProjects(prev => [...prev, newProject]);
        
        // Sélectionner le nouveau projet
        setSelectedProject(newProject);
        
        setSuccess(`Projet "${newProjectName}" créé avec succès`);
        setNewProjectName('');
        setNewProjectDescription('');
        setNewProjectDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du projet:', error);
      setError('Impossible de créer le projet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour télécharger un fichier
  const handleUploadFile = async () => {
    if (!currentUser || !selectedProject || !selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseStorage.uploadPdf(selectedFile, selectedProject.name);
      
      if (error) throw error;
      
      setSuccess(`Fichier "${selectedFile.name}" téléchargé avec succès`);
      setSelectedFile(null);
      setUploadFileDialogOpen(false);
      
      // Recharger les fichiers du projet
      await loadProjectFiles(selectedProject.name);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      setError('Impossible de télécharger le fichier: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour supprimer un fichier
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, error } = await supabaseStorage.deleteFile(fileToDelete.path);
      
      if (error) throw error;
      
      if (success) {
        setSuccess(`Fichier "${fileToDelete.name}" supprimé avec succès`);
        setFileToDelete(null);
        setDeleteConfirmDialogOpen(false);
        
        // Recharger les fichiers du projet
        if (selectedProject) {
          await loadProjectFiles(selectedProject.name);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du fichier:', error);
      setError('Impossible de supprimer le fichier: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour charger un fichier PDF dans l'application
  const handleLoadPdf = async (file: ProjectFile) => {
    try {
      setIsLoading(true);
      
      // Télécharger le fichier depuis l'URL
      const response = await fetch(file.url);
      const blob = await response.blob();
      
      // Créer un objet File à partir du Blob
      const pdfFile = new File([blob], file.name, { type: 'application/pdf' });
      
      // Définir le fichier PDF dans le contexte de l'application
      setPdfFile(pdfFile);
      
      setSuccess(`Fichier "${file.name}" chargé avec succès`);
    } catch (error: any) {
      console.error('Erreur lors du chargement du fichier PDF:', error);
      setError('Impossible de charger le fichier PDF: ' + error.message);
    } finally {
      setIsLoading(false);
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
  
  // Fonction pour formater la date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Gestionnaire de projets
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Liste des projets */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Projets
              </Typography>
              
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={loadProjects}
                  disabled={isLoading}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Actualiser
                </Button>
                
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setNewProjectDialogOpen(true)}
                  disabled={isLoading}
                  size="small"
                >
                  Nouveau
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {isLoading && projects.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {projects.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="Aucun projet" 
                      secondary="Créez un nouveau projet pour commencer" 
                    />
                  </ListItem>
                ) : (
                  projects.map((project) => (
                    <ListItem 
                      key={project.id}
                      button
                      selected={selectedProject?.id === project.id}
                      onClick={() => setSelectedProject(project)}
                    >
                      <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary={project.name} 
                        secondary={`Créé le ${formatDate(project.createdAt)}`} 
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Fichiers du projet sélectionné */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedProject ? `Fichiers: ${selectedProject.name}` : 'Fichiers'}
              </Typography>
              
              {selectedProject && (
                <Button 
                  variant="contained" 
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadFileDialogOpen(true)}
                  disabled={isLoading || !selectedProject}
                >
                  Télécharger un PDF
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {!selectedProject ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Sélectionnez un projet pour voir ses fichiers
                </Typography>
              </Box>
            ) : isLoading && projectFiles.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {projectFiles.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Aucun fichier dans ce projet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Téléchargez un PDF pour commencer
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  projectFiles.map((file) => (
                    <Grid item xs={12} sm={6} md={4} key={file.path}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FileIcon sx={{ mr: 1, color: 'error.main' }} />
                            <Typography variant="subtitle1" noWrap title={file.name}>
                              {file.name}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            Taille: {formatFileSize(file.size)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Ajouté: {formatDate(file.uploadedAt)}
                          </Typography>
                        </CardContent>
                        
                        <CardActions>
                          <Button 
                            size="small" 
                            onClick={() => handleLoadPdf(file)}
                            disabled={isLoading}
                          >
                            Charger
                          </Button>
                          
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setFileToDelete(file);
                              setDeleteConfirmDialogOpen(true);
                            }}
                            disabled={isLoading}
                          >
                            Supprimer
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogue pour créer un nouveau projet */}
      <Dialog open={newProjectDialogOpen} onClose={() => setNewProjectDialogOpen(false)}>
        <DialogTitle>Nouveau projet</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Créez un nouveau projet pour organiser vos fichiers PDF.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Nom du projet"
            type="text"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            disabled={isLoading}
          />
          
          <TextField
            margin="dense"
            label="Description (optionnelle)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialogOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained" 
            disabled={isLoading || !newProjectName.trim()}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue pour télécharger un fichier */}
      <Dialog open={uploadFileDialogOpen} onClose={() => setUploadFileDialogOpen(false)}>
        <DialogTitle>Télécharger un PDF</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sélectionnez un fichier PDF à télécharger dans le projet {selectedProject?.name}.
          </DialogContentText>
          
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="upload-file-button"
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              disabled={isLoading}
            />
            <label htmlFor="upload-file-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={isLoading}
              >
                Sélectionner un fichier
              </Button>
            </label>
            
            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
                  onDelete={() => setSelectedFile(null)}
                  disabled={isLoading}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadFileDialogOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleUploadFile} 
            variant="contained" 
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Télécharger'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteConfirmDialogOpen} onClose={() => setDeleteConfirmDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le fichier "{fileToDelete?.name}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteFile} 
            color="error" 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;
