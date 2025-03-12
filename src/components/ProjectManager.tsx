import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  FolderPlus, 
  Save, 
  Trash2, 
  FileText, 
  Download, 
  RefreshCw,
  Edit,
  Check,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabaseStorage, blobToFile } from '../lib/supabaseStorage';
import { v4 as uuidv4 } from 'uuid';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  initialName?: string;
  initialDescription?: string;
  isEdit?: boolean;
}

// Composant de dialogue pour créer/éditer un projet
const ProjectDialog: React.FC<ProjectDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialName = '', 
  initialDescription = '',
  isEdit = false
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setNameError('');
    }
  }, [open, initialName, initialDescription]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Le nom du projet est requis');
      return;
    }
    onSave(name, description);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isEdit 
            ? 'Modifiez les informations du projet.'
            : 'Créez un nouveau projet pour organiser vos plans.'
          }
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Nom du projet"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError('');
          }}
          error={!!nameError}
          helperText={nameError}
          sx={{ mt: 2 }}
        />
        <TextField
          margin="dense"
          label="Description (optionnelle)"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<X size={18} />}>Annuler</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Check size={18} />}>
          {isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Composant principal de gestion des projets
const ProjectManager: React.FC = () => {
  const { 
    pdfFile, 
    currentUser,
    isAuthenticated
  } = useAppContext();

  // États pour la gestion des projets
  const [projects, setProjects] = useState<string[]>([]);
  const [projectFiles, setProjectFiles] = useState<{[key: string]: any[]}>({});
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fonction pour afficher une notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Fermer la notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Charger la liste des projets
  const loadProjects = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;

    setIsLoading(true);
    try {
      const { projects, error } = await supabaseStorage.listProjects(currentUser.id, true);
      
      if (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors du chargement des projets', 'error');
        return;
      }
      
      setProjects(projects);
      console.log(`${projects.length} projets chargés`);
      
      // Charger les fichiers du premier projet si aucun n'est sélectionné
      if (projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]);
        loadProjectFiles(projects[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      showNotification('Erreur lors du chargement des projets', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser, selectedProject]);

  // Charger les fichiers d'un projet
  const loadProjectFiles = useCallback(async (projectId: string) => {
    if (!isAuthenticated || !currentUser) return;

    setIsLoading(true);
    try {
      const { files, error } = await supabaseStorage.listProjectFiles(currentUser.id, projectId);
      
      if (error) {
        console.error(`Erreur lors du chargement des fichiers du projet ${projectId}:`, error);
        showNotification('Erreur lors du chargement des fichiers', 'error');
        return;
      }
      
      setProjectFiles(prev => ({
        ...prev,
        [projectId]: files
      }));
      console.log(`${files.length} fichiers chargés pour le projet ${projectId}`);
    } catch (error) {
      console.error(`Erreur lors du chargement des fichiers du projet ${projectId}:`, error);
      showNotification('Erreur lors du chargement des fichiers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  // Créer un nouveau projet
  const createProject = async (name: string, description?: string) => {
    if (!isAuthenticated || !currentUser) {
      showNotification('Vous devez être connecté pour créer un projet', 'warning');
      return;
    }

    const projectId = uuidv4();
    
    // Créer un fichier README.md vide pour initialiser le dossier du projet
    const readmeContent = `# ${name}\n${description || ''}\n\nProjet créé le ${new Date().toLocaleDateString()}`;
    const readmeFile = new File([readmeContent], 'README.md', { type: 'text/markdown' });
    
    setIsLoading(true);
    try {
      const { success, error } = await supabaseStorage.uploadPdf(
        currentUser.id,
        readmeFile,
        projectId,
        'README.md'
      );
      
      if (error) {
        console.error('Erreur lors de la création du projet:', error);
        showNotification('Erreur lors de la création du projet', 'error');
        return;
      }
      
      // Recharger la liste des projets
      await loadProjects();
      setSelectedProject(projectId);
      showNotification('Projet créé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      showNotification('Erreur lors de la création du projet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un projet
  const deleteProject = async (projectId: string) => {
    if (!isAuthenticated || !currentUser) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet et tous ses fichiers ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await supabaseStorage.deleteProject(currentUser.id, projectId);
      
      if (error) {
        console.error(`Erreur lors de la suppression du projet ${projectId}:`, error);
        showNotification('Erreur lors de la suppression du projet', 'error');
        return;
      }
      
      // Mettre à jour la liste des projets
      setProjects(prev => prev.filter(p => p !== projectId));
      
      // Si le projet supprimé était sélectionné, sélectionner le premier projet restant
      if (selectedProject === projectId) {
        const remainingProjects = projects.filter(p => p !== projectId);
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      }
      
      // Supprimer les fichiers du projet de l'état local
      setProjectFiles(prev => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      
      showNotification('Projet supprimé avec succès', 'success');
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${projectId}:`, error);
      showNotification('Erreur lors de la suppression du projet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Télécharger un fichier
  const downloadFile = async (projectId: string, filename: string) => {
    if (!isAuthenticated || !currentUser) return;

    setIsLoading(true);
    try {
      const { downloadUrl, error } = await supabaseStorage.downloadPdf(
        currentUser.id,
        projectId,
        filename
      );
      
      if (error || !downloadUrl) {
        console.error(`Erreur lors du téléchargement du fichier ${filename}:`, error);
        showNotification('Erreur lors du téléchargement du fichier', 'error');
        return;
      }
      
      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Téléchargement démarré', 'success');
    } catch (error) {
      console.error(`Erreur lors du téléchargement du fichier ${filename}:`, error);
      showNotification('Erreur lors du téléchargement du fichier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un fichier
  const deleteFile = async (projectId: string, filename: string) => {
    if (!isAuthenticated || !currentUser) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${filename}" ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await supabaseStorage.deleteFile(
        currentUser.id,
        projectId,
        filename
      );
      
      if (error) {
        console.error(`Erreur lors de la suppression du fichier ${filename}:`, error);
        showNotification('Erreur lors de la suppression du fichier', 'error');
        return;
      }
      
      // Mettre à jour la liste des fichiers
      setProjectFiles(prev => ({
        ...prev,
        [projectId]: prev[projectId].filter(file => file.name !== filename)
      }));
      
      showNotification('Fichier supprimé avec succès', 'success');
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${filename}:`, error);
      showNotification('Erreur lors de la suppression du fichier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Enregistrer le PDF actuel
  const savePdf = async (projectId: string, filename: string) => {
    if (!isAuthenticated || !currentUser || !pdfFile) {
      showNotification('Vous devez être connecté et avoir un PDF chargé', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Vérifier si le fichier existe déjà
      const { exists } = await supabaseStorage.fileExists(
        currentUser.id,
        projectId,
        filename
      );
      
      if (exists) {
        if (!window.confirm(`Le fichier "${filename}" existe déjà. Voulez-vous le remplacer ?`)) {
          setIsLoading(false);
          return;
        }
      }
      
      // Télécharger le fichier
      const { success, error } = await supabaseStorage.uploadPdf(
        currentUser.id,
        pdfFile,
        projectId,
        filename
      );
      
      if (error) {
        console.error(`Erreur lors de l'enregistrement du fichier ${filename}:`, error);
        showNotification('Erreur lors de l\'enregistrement du fichier', 'error');
        return;
      }
      
      // Recharger les fichiers du projet
      await loadProjectFiles(projectId);
      showNotification('Fichier enregistré avec succès', 'success');
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement du fichier ${filename}:`, error);
      showNotification('Erreur lors de l\'enregistrement du fichier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger un fichier PDF depuis le stockage
  const loadPdfFromStorage = async (projectId: string, filename: string) => {
    if (!isAuthenticated || !currentUser) return;

    setIsLoading(true);
    try {
      const { file, error } = await supabaseStorage.getPdfFile(
        currentUser.id,
        projectId,
        filename
      );
      
      if (error || !file) {
        console.error(`Erreur lors du chargement du fichier ${filename}:`, error);
        showNotification('Erreur lors du chargement du fichier', 'error');
        return;
      }
      
      // Convertir le Blob en File et le charger dans l'application
      const pdfFile = blobToFile(file, filename);
      
      // Utiliser le contexte pour définir le fichier PDF
      useAppContext().setPdfFile(pdfFile);
      
      showNotification('Fichier chargé avec succès', 'success');
    } catch (error) {
      console.error(`Erreur lors du chargement du fichier ${filename}:`, error);
      showNotification('Erreur lors du chargement du fichier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'enregistrement du PDF
  const handleSavePdf = () => {
    if (!selectedProject) {
      setIsProjectDialogOpen(true);
      return;
    }
    
    setIsSaveDialogOpen(true);
    
    // Proposer un nom de fichier par défaut basé sur le nom du PDF actuel
    if (pdfFile) {
      setCustomFilename(pdfFile.name);
    }
  };

  // Gérer la confirmation d'enregistrement
  const handleConfirmSave = () => {
    if (!selectedProject || !customFilename) return;
    
    // S'assurer que le nom de fichier a l'extension .pdf
    let filename = customFilename;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }
    
    savePdf(selectedProject, filename);
    setIsSaveDialogOpen(false);
  };

  // Charger les projets au montage du composant
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadProjects();
    }
  }, [isAuthenticated, currentUser, loadProjects]);

  // Charger les fichiers du projet sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadProjectFiles(selectedProject);
    }
  }, [selectedProject, loadProjectFiles]);

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Connectez-vous pour gérer vos projets et fichiers.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Barre d'outils */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<FolderPlus size={18} />}
            onClick={() => setIsProjectDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Nouveau projet
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshCw size={18} />}
            onClick={() => loadProjects()}
            disabled={isLoading}
          >
            Actualiser
          </Button>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<Save size={18} />}
          onClick={handleSavePdf}
          disabled={!pdfFile || isLoading}
        >
          Enregistrer le PDF
        </Button>
      </Box>
      
      {/* Liste des projets et fichiers */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Liste des projets */}
        <Paper sx={{ 
          width: { xs: '100%', md: '30%' }, 
          minWidth: { md: 250 },
          maxHeight: 400,
          overflow: 'auto'
        }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            Projets
          </Typography>
          
          {isLoading && projects.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : projects.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Aucun projet trouvé
            </Typography>
          ) : (
            <List>
              {projects.map((projectId) => (
                <ListItem 
                  key={projectId}
                  button
                  selected={selectedProject === projectId}
                  onClick={() => setSelectedProject(projectId)}
                >
                  <ListItemText 
                    primary={`Projet ${projectId.substring(0, 8)}...`} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => deleteProject(projectId)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
        
        {/* Liste des fichiers du projet sélectionné */}
        <Paper sx={{ 
          width: { xs: '100%', md: '70%' },
          maxHeight: 400,
          overflow: 'auto'
        }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            Fichiers
            {selectedProject && ` (Projet ${selectedProject.substring(0, 8)}...)`}
          </Typography>
          
          {!selectedProject ? (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Sélectionnez un projet pour voir ses fichiers
            </Typography>
          ) : isLoading && (!projectFiles[selectedProject] || projectFiles[selectedProject].length === 0) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : !projectFiles[selectedProject] || projectFiles[selectedProject].length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Aucun fichier dans ce projet
            </Typography>
          ) : (
            <List>
              {projectFiles[selectedProject].map((file) => (
                <ListItem key={file.name}>
                  <ListItemText 
                    primary={file.name} 
                    secondary={`Taille: ${(file.metadata?.size / 1024).toFixed(2)} Ko`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Charger">
                      <IconButton 
                        edge="end" 
                        aria-label="load"
                        onClick={() => loadPdfFromStorage(selectedProject, file.name)}
                        sx={{ mr: 1 }}
                      >
                        <FileText size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Télécharger">
                      <IconButton 
                        edge="end" 
                        aria-label="download"
                        onClick={() => downloadFile(selectedProject, file.name)}
                        sx={{ mr: 1 }}
                      >
                        <Download size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => deleteFile(selectedProject, file.name)}
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
      </Box>
      
      {/* Dialogue de création de projet */}
      <ProjectDialog
        open={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        onSave={createProject}
      />
      
      {/* Dialogue d'enregistrement de fichier */}
      <Dialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enregistrer le PDF</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Entrez un nom pour le fichier PDF.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du fichier"
            type="text"
            fullWidth
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            sx={{ mt: 2 }}
            helperText="L'extension .pdf sera ajoutée automatiquement si nécessaire"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveDialogOpen(false)} startIcon={<X size={18} />}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmSave} 
            variant="contained" 
            startIcon={<Save size={18} />}
            disabled={!customFilename}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Indicateur de chargement global */}
      {isLoading && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          zIndex: 9999,
          bgcolor: 'background.paper',
          borderRadius: '50%',
          boxShadow: 3,
          p: 1
        }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default ProjectManager;
