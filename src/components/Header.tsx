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
  Divider
} from '@mui/material';
import { 
  Upload, 
  Download, 
  LogOut, 
  Eye,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PdfPreview from './PdfPreview';

const Header: React.FC = () => {
  const { 
    setPdfFile, 
    exportPdf, 
    logout,
    previewPdf,
    isPreviewOpen,
    setIsPreviewOpen
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
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
    previewPdf();
  };
  
  const handleExport = () => {
    handleMenuClose();
    exportPdf();
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const handleClosePreview = () => {
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
                Aperçu
              </MenuItem>
              <MenuItem onClick={handleExport} dense>
                <Download size={16} style={{ marginRight: 8 }} />
                Télécharger PDF
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
