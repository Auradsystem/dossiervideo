import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { Camera, CameraOff, Maximize, Minimize, RotateCcw, Eye, Trash2, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CameraType } from '../types/Camera';

const drawerWidth = 280;

const Sidebar: React.FC = () => {
  const { 
    cameras, 
    selectedCamera, 
    setSelectedCamera, 
    addCamera,
    updateCamera,
    deleteCamera,
    namingPattern,
    setNamingPattern,
    nextCameraNumber,
    setNextCameraNumber
  } = useAppContext();

  const selectedCameraData = cameras.find(cam => cam.id === selectedCamera);

  const handleCameraTypeChange = (event: any) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { type: event.target.value as CameraType });
    }
  };

  const handleAngleChange = (event: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { angle: newValue as number });
    }
  };

  const handleDistanceChange = (event: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { viewDistance: newValue as number });
    }
  };

  const handleOpacityChange = (event: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { opacity: (newValue as number) / 100 });
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { name: event.target.value });
    }
  };

  const handlePatternChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNamingPattern(event.target.value);
  };

  const handleNextNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setNextCameraNumber(value);
    }
  };

  const handleDeleteCamera = () => {
    if (selectedCamera) {
      deleteCamera(selectedCamera);
    }
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
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Outils
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addCamera(100, 100, 'dome')}>
              <ListItemIcon>
                <Camera size={20} />
              </ListItemIcon>
              <ListItemText primary="Ajouter une caméra" />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Séquence de nommage
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label="Préfixe"
              value={namingPattern}
              onChange={handlePatternChange}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              size="small"
              label="Prochain #"
              type="number"
              value={nextCameraNumber}
              onChange={handleNextNumberChange}
              sx={{ width: '80px' }}
              inputProps={{ min: 1 }}
            />
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Caméras
        </Typography>
        <List>
          {cameras.map((camera) => (
            <ListItem 
              key={camera.id} 
              disablePadding
              secondaryAction={
                selectedCamera === camera.id && (
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={handleDeleteCamera}
                    sx={{ color: 'error.main' }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )
              }
            >
              <ListItemButton 
                selected={selectedCamera === camera.id}
                onClick={() => setSelectedCamera(camera.id)}
              >
                <ListItemIcon>
                  <Camera size={20} />
                </ListItemIcon>
                <ListItemText primary={camera.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Divider />
      
      {selectedCameraData && (
        <Box sx={{ p: 2, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Propriétés
            </Typography>
            <IconButton size="small">
              <Settings size={18} />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            label="Nom"
            variant="outlined"
            size="small"
            margin="normal"
            value={selectedCameraData.name}
            onChange={handleNameChange}
          />
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Type de caméra</InputLabel>
            <Select
              value={selectedCameraData.type}
              label="Type de caméra"
              onChange={handleCameraTypeChange}
            >
              <MenuItem value="dome">Dôme</MenuItem>
              <MenuItem value="bullet">Bullet</MenuItem>
              <MenuItem value="ptz">PTZ</MenuItem>
            </Select>
          </FormControl>
          
          <Typography gutterBottom sx={{ mt: 2 }}>
            Angle de vue: {selectedCameraData.angle}°
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RotateCcw size={16} />
            <Slider
              value={selectedCameraData.angle}
              onChange={handleAngleChange}
              min={10}
              max={360}
              sx={{ mx: 1 }}
            />
            <RotateCcw size={16} />
          </Box>
          
          <Typography gutterBottom sx={{ mt: 2 }}>
            Distance de vue: {selectedCameraData.viewDistance}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Minimize size={16} />
            <Slider
              value={selectedCameraData.viewDistance}
              onChange={handleDistanceChange}
              min={10}
              max={500}
              sx={{ mx: 1 }}
            />
            <Maximize size={16} />
          </Box>
          
          <Typography gutterBottom sx={{ mt: 2 }}>
            Opacité: {Math.round(selectedCameraData.opacity * 100)}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CameraOff size={16} />
            <Slider
              value={selectedCameraData.opacity * 100}
              onChange={handleOpacityChange}
              min={10}
              max={100}
              sx={{ mx: 1 }}
            />
            <Eye size={16} />
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
