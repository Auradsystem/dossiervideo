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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@mui/material';
import { 
  Camera, 
  Sliders, 
  Trash2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Layers
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CameraType, cameraIcons } from '../types/Camera';

const drawerWidth = 280;

const Sidebar: React.FC = () => {
  const { 
    cameras, 
    selectedCamera, 
    setSelectedCamera, 
    updateCamera, 
    deleteCamera,
    selectedIconType,
    setSelectedIconType,
    page,
    totalPages
  } = useAppContext();
  
  const [open, setOpen] = useState(true);
  
  const selectedCameraObj = cameras.find(cam => cam.id === selectedCamera);
  
  const handleToggleDrawer = () => {
    setOpen(!open);
  };
  
  const handleCameraTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newType = event.target.value as string;
    console.log(`Type d'icône sélectionné: ${newType}`);
    setSelectedIconType(newType);
    
    // Si une caméra est sélectionnée, mettre à jour son type
    if (selectedCamera) {
      updateCamera(selectedCamera, {
        type: newType as CameraType,
        iconPath: cameraIcons[newType]?.path
      });
    }
  };
  
  const handleDeleteCamera = () => {
    if (selectedCamera && window.confirm('Êtes-vous sûr de vouloir supprimer cette caméra ?')) {
      console.log(`Suppression de la caméra: ${selectedCamera}`);
      deleteCamera(selectedCamera);
    }
  };
  
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      console.log(`Nom de la caméra modifié: ${event.target.value}`);
      updateCamera(selectedCamera, { name: event.target.value });
    }
  };
  
  const handleAngleChange = (_: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      const angle = newValue as number;
      console.log(`Angle de la caméra modifié: ${angle}°`);
      updateCamera(selectedCamera, { angle });
    }
  };
  
  const handleViewDistanceChange = (_: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      const viewDistance = newValue as number;
      console.log(`Distance de vue modifiée: ${viewDistance}`);
      updateCamera(selectedCamera, { viewDistance });
    }
  };
  
  const handleOpacityChange = (_: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      const opacity = newValue as number;
      console.log(`Opacité modifiée: ${opacity}`);
      updateCamera(selectedCamera, { opacity });
    }
  };
  
  const handleRotationChange = (_: Event, newValue: number | number[]) => {
    if (selectedCamera) {
      const rotation = newValue as number;
      console.log(`Rotation modifiée: ${rotation}°`);
      updateCamera(selectedCamera, { rotation });
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
          <IconButton onClick={handleToggleDrawer}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Type de caméra
          </Typography>
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel id="camera-type-label">Type</InputLabel>
            <Select
              labelId="camera-type-label"
              value={selectedIconType}
              label="Type"
              onChange={handleCameraTypeChange as any}
            >
              {Object.entries(cameraIcons).map(([type, data]) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: data.color,
                        mr: 1
                      }} 
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
            Cliquez sur le plan pour ajouter une caméra
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Badge 
              badgeContent={cameras.length} 
              color="primary"
              sx={{ mr: 1 }}
            >
              <Layers size={20} />
            </Badge>
            <Typography variant="subtitle2">
              Caméras sur la page {page}
            </Typography>
          </Box>
          
          {cameras.length > 0 ? (
            <List dense disablePadding>
              {cameras.map(camera => (
                <ListItem 
                  key={camera.id} 
                  disablePadding
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => {
                        console.log(`Sélection de la caméra: ${camera.id}`);
                        setSelectedCamera(camera.id);
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                  }
                >
                  <ListItemButton 
                    selected={selectedCamera === camera.id}
                    onClick={() => {
                      console.log(`Sélection de la caméra: ${camera.id}`);
                      setSelectedCamera(camera.id);
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          bgcolor: cameraIcons[camera.type]?.color || '#1976d2'
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={camera.name} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        noWrap: true
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
              Aucune caméra sur cette page
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        {selectedCameraObj ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">
                Propriétés de la caméra
              </Typography>
              <IconButton 
                size="small" 
                color="error" 
                onClick={handleDeleteCamera}
                title="Supprimer la caméra"
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
            
            <TextField
              label="Nom"
              value={selectedCameraObj.name}
              onChange={handleNameChange}
              fullWidth
              margin="dense"
              size="small"
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom display="flex" alignItems="center">
                <RotateCw size={16} style={{ marginRight: 8 }} />
                Rotation: {selectedCameraObj.rotation || 0}°
              </Typography>
              <Slider
                value={selectedCameraObj.rotation || 0}
                min={0}
                max={360}
                step={5}
                onChange={handleRotationChange}
                size="small"
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Angle de vue: {selectedCameraObj.angle}°
              </Typography>
              <Slider
                value={selectedCameraObj.angle}
                min={10}
                max={120}
                step={5}
                onChange={handleAngleChange}
                size="small"
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Distance de vue: {selectedCameraObj.viewDistance}
              </Typography>
              <Slider
                value={selectedCameraObj.viewDistance}
                min={20}
                max={300}
                step={10}
                onChange={handleViewDistanceChange}
                size="small"
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Opacité: {selectedCameraObj.opacity.toFixed(1)}
              </Typography>
              <Slider
                value={selectedCameraObj.opacity}
                min={0.1}
                max={1}
                step={0.1}
                onChange={handleOpacityChange}
                size="small"
              />
            </Box>
            
            <Paper variant="outlined" sx={{ p: 1, mt: 2 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Position
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="X"
                  value={Math.round(selectedCameraObj.x)}
                  size="small"
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">X:</InputAdornment>,
                  }}
                  variant="outlined"
                  sx={{ width: '50%' }}
                />
                <TextField
                  label="Y"
                  value={Math.round(selectedCameraObj.y)}
                  size="small"
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">Y:</InputAdornment>,
                  }}
                  variant="outlined"
                  sx={{ width: '50%' }}
                />
              </Box>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Sélectionnez une caméra pour modifier ses propriétés
            </Typography>
          </Box>
        )}
      </Drawer>
      
      {!open && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          <IconButton
            onClick={handleToggleDrawer}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '0 4px 4px 0',
              boxShadow: 1,
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default Sidebar;
