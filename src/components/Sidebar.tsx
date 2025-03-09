import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  Divider, 
  Typography, 
  Button, 
  TextField, 
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Stack
} from '@mui/material';
import { Upload, Download, Eye, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CameraType, cameraIcons } from '../types/Camera';

const drawerWidth = 300;

const Sidebar: React.FC = () => {
  const { 
    pdfFile, 
    setPdfFile, 
    selectedCamera, 
    updateCamera, 
    deleteCamera,
    cameras,
    exportPdf,
    exportCurrentPage,
    previewPdf,
    namingPattern,
    setNamingPattern,
    nextCameraNumber,
    setNextCameraNumber,
    selectedIconType,
    setSelectedIconType
  } = useAppContext();
  
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        console.log(`Fichier PDF chargé: ${file.name}`);
      } else {
        alert('Veuillez sélectionner un fichier PDF');
      }
      // Reset the file input
      setFileInputKey(Date.now());
    }
  };

  const selectedCameraData = selectedCamera 
    ? cameras.find(camera => camera.id === selectedCamera) 
    : null;

  const handleCameraChange = (field: string, value: any) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { [field]: value });
    }
  };

  const handleDeleteCamera = () => {
    if (selectedCamera && window.confirm('Êtes-vous sûr de vouloir supprimer cette caméra ?')) {
      deleteCamera(selectedCamera);
    }
  };

  const handleNamingPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNamingPattern(e.target.value);
  };

  const handleNextNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setNextCameraNumber(value);
    }
  };

  const handleIconTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedIconType(event.target.value as string);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          PlanCam
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Gestion de caméras sur plan
        </Typography>
        
        <Button
          variant="contained"
          component="label"
          fullWidth
          startIcon={<Upload size={16} />}
          sx={{ mt: 2 }}
        >
          Charger PDF
          <input
            key={fileInputKey}
            type="file"
            hidden
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </Button>
        
        {pdfFile && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Fichier: {pdfFile.name}
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Paramètres des caméras
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Préfixe de nommage"
            value={namingPattern}
            onChange={handleNamingPatternChange}
            size="small"
            fullWidth
            margin="dense"
          />
          <TextField
            label="Prochain numéro"
            type="number"
            value={nextCameraNumber}
            onChange={handleNextNumberChange}
            size="small"
            fullWidth
            margin="dense"
            inputProps={{ min: 1 }}
          />
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Type de caméra</InputLabel>
            <Select
              value={selectedIconType}
              onChange={handleIconTypeChange}
              label="Type de caméra"
            >
              <MenuItem value="dome">Dôme</MenuItem>
              <MenuItem value="bullet">Bullet</MenuItem>
              <MenuItem value="ptz">PTZ</MenuItem>
              <MenuItem value="fisheye">Fisheye</MenuItem>
            </Select>
            <FormHelperText>Type par défaut pour les nouvelles caméras</FormHelperText>
          </FormControl>
        </Box>
      </Box>
      
      <Divider />
      
      {selectedCameraData ? (
        <Box sx={{ p: 2, overflow: 'auto' }}>
          <Typography variant="subtitle1" gutterBottom>
            Édition de la caméra
          </Typography>
          
          <TextField
            label="Nom"
            value={selectedCameraData.name}
            onChange={(e) => handleCameraChange('name', e.target.value)}
            fullWidth
            margin="dense"
            size="small"
          />
          
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedCameraData.type}
              onChange={(e) => handleCameraChange('type', e.target.value)}
              label="Type"
            >
              <MenuItem value="dome">Dôme</MenuItem>
              <MenuItem value="bullet">Bullet</MenuItem>
              <MenuItem value="ptz">PTZ</MenuItem>
              <MenuItem value="fisheye">Fisheye</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Angle de vue: {selectedCameraData.angle}°
          </Typography>
          <Slider
            value={selectedCameraData.angle}
            onChange={(_, value) => handleCameraChange('angle', value)}
            min={10}
            max={360}
            step={5}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Distance de vue: {selectedCameraData.viewDistance}
          </Typography>
          <Slider
            value={selectedCameraData.viewDistance}
            onChange={(_, value) => handleCameraChange('viewDistance', value)}
            min={20}
            max={500}
            step={10}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Rotation: {selectedCameraData.rotation || 0}°
          </Typography>
          <Slider
            value={selectedCameraData.rotation || 0}
            onChange={(_, value) => handleCameraChange('rotation', value)}
            min={-180}
            max={180}
            step={5}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Opacité: {selectedCameraData.opacity}
          </Typography>
          <Slider
            value={selectedCameraData.opacity}
            onChange={(_, value) => handleCameraChange('opacity', value)}
            min={0.1}
            max={1}
            step={0.1}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Taille: {Math.round(selectedCameraData.width)}
          </Typography>
          <Slider
            value={selectedCameraData.width}
            onChange={(_, value) => {
              handleCameraChange('width', value);
              handleCameraChange('height', value);
            }}
            min={10}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={handleDeleteCamera}
            fullWidth
            sx={{ mt: 3 }}
          >
            Supprimer la caméra
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
          <Typography variant="body2">
            Sélectionnez une caméra pour l'éditer
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Eye size={16} />}
            onClick={previewPdf}
            fullWidth
            disabled={!pdfFile}
          >
            Prévisualiser
          </Button>
          <Button
            variant="outlined"
            startIcon={<Save size={16} />}
            onClick={exportCurrentPage}
            fullWidth
            disabled={!pdfFile}
          >
            Exporter page
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            onClick={exportPdf}
            fullWidth
            disabled={!pdfFile}
          >
            Exporter tout
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
