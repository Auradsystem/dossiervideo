import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Camera, Save, FileUp, FileDown, HelpCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { setPdfFile } = useAppContext();

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
          >
            Exporter
          </Button>
          
          <Tooltip title="Aide">
            <IconButton color="inherit">
              <HelpCircle size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
