import React, { useRef } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Upload, 
  Download, 
  LogOut, 
  Menu as MenuIcon,
  Info,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { 
    setPdfFile, 
    isAuthenticated, 
    logout,
    exportPdf
  } = useAppContext();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [aboutDialogOpen, setAboutDialogOpen] = React.useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Veuillez sélectionner un fichier PDF');
      }
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleExportClick = () => {
    exportPdf();
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };
  
  const handleAboutClick = () => {
    setAboutDialogOpen(true);
    handleMenuClose();
  };
  
  const handleHelpClick = () => {
    setHelpDialogOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/camera-icon.svg" 
              alt="PlanCam Logo" 
              style={{ height: '32px', marginRight: '12px' }} 
            />
            <Typography variant="h6" component="div">
              PlanCam
            </Typography>
          </Box>
          
          {isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<Upload />}
                onClick={handleUploadClick}
              >
                Charger PDF
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<Download />}
                onClick={handleExportClick}
              >
                Exporter
              </Button>
              <IconButton 
                color="inherit"
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleAboutClick}>
                  <Info size={18} style={{ marginRight: '8px' }} />
                  À propos
                </MenuItem>
                <MenuItem onClick={handleHelpClick}>
                  <HelpCircle size={18} style={{ marginRight: '8px' }} />
                  Aide
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogOut size={18} style={{ marginRight: '8px' }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="application/pdf"
        onChange={handleFileUpload}
      />
      
      <Dialog open={aboutDialogOpen} onClose={() => setAboutDialogOpen(false)}>
        <DialogTitle>À propos de PlanCam</DialogTitle>
        <DialogContent>
          <DialogContentText>
            PlanCam est une application de gestion de caméras de vidéoprotection sur plans PDF.
            <br /><br />
            Version: 1.0.0
            <br />
            © 2023 XCEL Vidéo
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAboutDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
        <DialogTitle>Aide</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Comment utiliser PlanCam:</strong>
            <br /><br />
            1. Chargez un plan PDF avec le bouton "Charger PDF"
            <br />
            2. Cliquez sur le plan pour ajouter des caméras
            <br />
            3. Sélectionnez une caméra pour modifier ses propriétés
            <br />
            4. Utilisez le bouton "Exporter" pour sauvegarder votre plan avec les caméras
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
