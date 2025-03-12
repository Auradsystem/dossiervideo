import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Tooltip,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Save as SaveIcon,
  LogOut as LogOutIcon,
  User as UserIcon
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabaseStorage } from '../lib/supabaseStorage';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { 
    isAuthenticated, 
    logout, 
    currentUser,
    pdfFile
  } = useAppContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filename, setFilename] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleSaveClick = async () => {
    if (!isAuthenticated || !currentUser || !pdfFile) return;
    
    setLoading(true);
    try {
      // Charger la liste des projets
      const { projects, error } = await supabaseStorage.listProjects(currentUser.id, true);
      
      if (error) {
        console.error('Erreur lors du chargement des projets:', error);
        alert('Erreur lors du chargement des projets');
        return;
      }
      
      setProjects(projects);
      
      // Si aucun projet n'existe, en créer un par défaut
      if (projects.length === 0) {
        const defaultProjectId = await createDefaultProject();
        if (defaultProjectId) {
          setProjects([defaultProjectId]);
          setProjectId(defaultProjectId);
        }
      } else {
        setProjectId(projects[0]);
      }
      
      // Proposer un nom de fichier par défaut basé sur le nom du PDF actuel
      setFilename(pdfFile.name);
      
      // Ouvrir la boîte de dialogue
      setSaveDialogOpen(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProject = async (): Promise<string | null> => {
    if (!currentUser) return null;
    
    try {
      const projectId = crypto.randomUUID();
      const readmeContent = `# Projet par défaut\nCréé le ${new Date().toLocaleDateString()}`;
      const readmeFile = new File([readmeContent], 'README.md', { type: 'text/markdown' });
      
      const { success, error } = await supabaseStorage.uploadPdf(
        currentUser.id,
        readmeFile,
        projectId,
        'README.md'
      );
      
      if (error) {
        console.error('Erreur lors de la création du projet par défaut:', error);
        return null;
      }
      
      return projectId;
    } catch (error) {
      console.error('Erreur lors de la création du projet par défaut:', error);
      return null;
    }
  };

  const handleSaveConfirm = async () => {
    if (!currentUser || !pdfFile || !projectId) return;
    
    setLoading(true);
    try {
      // S'assurer que le nom de fichier a l'extension .pdf
      let finalFilename = filename;
      if (!finalFilename.toLowerCase().endsWith('.pdf')) {
        finalFilename += '.pdf';
      }
      
      // Vérifier si le fichier existe déjà
      const { exists } = await supabaseStorage.fileExists(
        currentUser.id,
        projectId,
        finalFilename
      );
      
      if (exists) {
        if (!window.confirm(`Le fichier "${finalFilename}" existe déjà. Voulez-vous le remplacer ?`)) {
          return;
        }
      }
      
      // Télécharger le fichier
      const { success, error } = await supabaseStorage.uploadPdf(
        currentUser.id,
        pdfFile,
        projectId,
        finalFilename
      );
      
      if (error) {
        console.error(`Erreur lors de l'enregistrement du fichier:`, error);
        alert('Erreur lors de l\'enregistrement du fichier');
        return;
      }
      
      alert('Fichier enregistré avec succès');
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PlanCam
          </Typography>
          
          {isAuthenticated && pdfFile && (
            <Tooltip title="Enregistrer le plan">
              <IconButton 
                color="inherit" 
                onClick={handleSaveClick}
                disabled={loading}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {isAuthenticated ? (
            <>
              <Tooltip title={currentUser?.email || 'Utilisateur'}>
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  aria-controls="user-menu"
                  aria-haspopup="true"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  {currentUser?.email || 'Utilisateur'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogOutIcon size={16} style={{ marginRight: 8 }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" href="/login">
              Connexion
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Dialogue d'enregistrement */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Enregistrer le plan</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nom du fichier"
              type="text"
              fullWidth
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              helperText="L'extension .pdf sera ajoutée automatiquement si nécessaire"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleSaveConfirm} 
            variant="contained"
            disabled={!filename.trim() || loading}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
