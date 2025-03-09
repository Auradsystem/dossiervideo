import React, { useState } from 'react';
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
  Badge
} from '@mui/material';
import { 
  Upload, 
  Download, 
  LogOut, 
  Eye,
  Settings,
  ChevronDown,
  FileDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PdfPreview from './PdfPreview';

const Header: React.FC = () => {
  const { 
    setPdfFile, 
    exportPdf,
    exportCurrentPage,
    logout,
    previewPdf,
    isPreviewOpen,
    setIsPreviewOpen,
    cameras,
    page
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log(`Chargement du fichier: ${files[0].name}`);
      setPdfFile(files[0]);
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handlePreview = () => {
    handleMenuClose();
    console.log('Demande de prévisualisation');
    previewPdf();
  };
  
  const handleExportCurrentPage = () => {
    handleMenuClose();
    console.log(`Export de la page courante (${page})`);
    exportCurrentPage();
  };
  
  const handleExportAllPages = () => {
    handleMenuClose();
    console.log('Export de toutes les pages');
    exportPdf();
  };
  
  const handleLogout = () => {
    console.log('Déconnexion');
    logout();
  };
  
  const handleClosePreview = () => {
    console.log('Fermeture de la prévisualisation');
    setIsPreviewOpen(false);
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PlanCam
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<Upload size={18} />}
              sx={{ mr: 1 }}
            >
              Charger PDF
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Download size={18} />}
              onClick={handleMenuOpen}
              endIcon={<ChevronDown size={16} />}
              disabled={cameras.length === 0}
            >
              Exporter
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handlePreview} dense>
                <Eye size={16} style={{ marginRight: 8 }} />
                Aperçu de la page courante
              </MenuItem>
              <MenuItem onClick={handleExportCurrentPage} dense>
                <FileDown size={16} style={{ marginRight: 8 }} />
                Exporter la page courante
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleExportAllPages} dense>
                <Download size={16} style={{ marginRight: 8 }} />
                Exporter toutes les pages
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose} dense>
                <Settings size={16} style={{ marginRight: 8 }} />
                Paramètres d'export
              </MenuItem>
            </Menu>
            
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut size={20} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <PdfPreview 
        open={isPreviewOpen} 
        onClose={handleClosePreview} 
      />
    </>
  );
};

export default Header;
