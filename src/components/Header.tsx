import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { Camera, Save, FileUp, FileDown, HelpCircle, LogOut, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { 
    setPdfFile, 
    exportPdf, 
    isAuthenticated, 
    logout 
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Veuillez sélectionner un fichier PDF valide.');
      }
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Camera size={24} />
        <Typography variant="h6" component="div" sx={{ ml: 2, flexGrow: 1 }}>
          PlanCam
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<FileUp size={18} />}
            color="primary"
            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
          >
            Charger PDF
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Save size={18} />}
            color="primary"
            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
          >
            Sauvegarder
          </Button>
          
          <Button
            variant="contained"
            startIcon={<FileDown size={18} />}
            color="primary"
            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
            onClick={exportPdf}
          >
            Exporter
          </Button>
          
          <Tooltip title="Aide">
            <IconButton color="inherit">
              <HelpCircle size={20} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Profil">
            <IconButton 
              color="inherit" 
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                <User size={20} />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2">Connecté en tant que xcel</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: 8 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
