import React, { useState } from 'react';
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
  TextField, 
  Slider, 
  IconButton,
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { 
  Camera, 
  Trash2, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cameraIcons } from '../types/Camera';

const drawerWidth = 280;

const Sidebar: React.FC = () => {
  const { 
    cameras, 
    selectedCamera, 
    updateCamera, 
    deleteCamera,
    selectedIconType,
    setSelectedIconType
  } = useAppContext();
  
  const [open, setOpen] = useState(true);
  
  const selectedCameraData = cameras.find(cam => cam.id === selectedCamera);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { name: e.target.value });
    }
  };
  
  const handleAngleChange = (_: Event, value: number | number[]) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { angle: value as number });
    }
  };
  
  const handleViewDistanceChange = (_: Event, value: number | number[]) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { viewDistance: value as number });
    }
  };
  
  const handleOpacityChange = (_: Event, value: number | number[]) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { opacity: (value as number) / 100 });
    }
  };
  
  const handleDelete = () => {
    if (selectedCamera) {
      deleteCamera(selectedCamera);
    }
  };
  
  const handleRotate = (amount: number) => {
    if (selectedCamera && selectedCameraData) {
      const currentRotation = selectedCameraData.rotation || 0;
      updateCamera(selectedCamera, { rotation: currentRotation + amount });
    }
  };
  
  const handleIconTypeChange = (event: SelectChangeEvent) => {
    setSelectedIconType(event.target.value);
    
    // Si une caméra est sélectionnée, mettre à jour son type
    if (selectedCamera) {
      updateCamera(selectedCamera, { type: event.target.value as any });
    }
  };
  
  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Outils
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Type de caméra
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="camera-type-label">Type de caméra</InputLabel>
            <Select
              labelId="camera-type-label"
              value={selectedIconType}
              label="Type de caméra"
              onChange={handleIconTypeChange}
            >
              <MenuItem value="hikvision">Hikvision</MenuItem>
              <MenuItem value="dahua">Dahua</MenuItem>
              <MenuItem value="axis">Axis</MenuItem>
              <MenuItem value="dome">Dôme</MenuItem>
              <MenuItem value="bullet">Bullet</MenuItem>
              <MenuItem value="ptz">PTZ</MenuItem>
              <MenuItem value="fisheye">Fisheye</MenuItem>
              <MenuItem value="turret">Turret</MenuItem>
              <MenuItem value="multisensor">Multi-capteurs</MenuItem>
              <MenuItem value="thermal">Thermique</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Cliquez sur le plan pour ajouter une caméra
          </Typography>
        </Box>
        
        <Divider />
        
        {selectedCameraData ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Propriétés de la caméra
            </Typography>
            
            <TextField
              label="Nom"
              value={selectedCameraData.name}
              onChange={handleNameChange}
              fullWidth
              margin="normal"
              size="small"
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Angle de vue: {selectedCameraData.angle}°
              </Typography>
              <Slider
                value={selectedCameraData.angle}
                min={10}
                max={360}
                onChange={handleAngleChange}
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Distance de vue: {selectedCameraData.viewDistance}px
              </Typography>
              <Slider
                value={selectedCameraData.viewDistance}
                min={20}
                max={500}
                onChange={handleViewDistanceChange}
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Opacité: {Math.round(selectedCameraData.opacity * 100)}%
              </Typography>
              <Slider
                value={selectedCameraData.opacity * 100}
                min={10}
                max={100}
                onChange={handleOpacityChange}
              />
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Tooltip title="Rotation anti-horaire">
                <IconButton onClick={() => handleRotate(-15)}>
                  <RotateCcw size={20} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Rotation horaire">
                <IconButton onClick={() => handleRotate(15)}>
                  <RotateCw size={20} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Supprimer la caméra">
                <IconButton 
                  color="error" 
                  onClick={handleDelete}
                >
                  <Trash2 />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Sélectionnez une caméra pour modifier ses propriétés
            </Typography>
          </Box>
        )}
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Caméras sur cette page: {cameras.length}
          </Typography>
          
          {cameras.length > 0 ? (
            <List dense>
              {cameras.map(camera => (
                <ListItem 
                  key={camera.id} 
                  disablePadding
                  selected={camera.id === selectedCamera}
                >
                  <ListItemButton 
                    onClick={() => updateCamera(camera.id, {})} // Trick to select without changing
                    dense
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Camera size={18} color={cameraIcons[camera.type]?.color || '#000'} />
                    </ListItemIcon>
                    <ListItemText primary={camera.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              Aucune caméra sur cette page
            </Typography>
          )}
        </Box>
      </Drawer>
      
      {!open && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            left: 0, 
            top: '50%', 
            transform: 'translateY(-50%)',
            zIndex: 1,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: 2
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <ChevronRight />
          </IconButton>
        </Paper>
      )}
    </>
  );
};

export default Sidebar;
