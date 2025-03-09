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
  IconButton,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import { Camera, CameraOff, Maximize, Minimize, RotateCcw, Eye, Trash2, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CameraType, cameraIcons } from '../types/Camera';

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
    setNextCameraNumber,
    selectedIconType,
    setSelectedIconType
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

  const handleIconSelect = (iconType: string) => {
    setSelectedIconType(iconType);
    if (selectedCamera) {
      updateCamera(selectedCamera, { 
        type: iconType as CameraType,
        iconPath: cameraIcons[iconType]?.path
      });
    }
  };

  // Composant pour afficher une icône de caméra dans la banque d'icônes
  const CameraIconPreview = ({ type, name }: { type: string, name: string }) => {
    const iconData = cameraIcons[type as keyof typeof cameraIcons];
    const isSelected = selectedIconType === type;
    
    return (
      <Tooltip title={name}>
        <Paper 
          elevation={isSelected ? 8 : 1}
          sx={{ 
            p: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            cursor: 'pointer',
            border: isSelected ? `2px solid ${iconData.color}` : '2px solid transparent',
            bgcolor: isSelected ? 'rgba(0,0,0,0.05)' : 'white'
          }}
          onClick={() => handleIconSelect(type)}
        >
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              bgcolor: iconData.color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              mb: 0.5
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d={iconData.path} fill="white" />
            </svg>
          </Box>
          <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem' }}>
            {name}
          </Typography>
        </Paper>
      </Tooltip>
    );
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
            <ListItemButton onClick={() => addCamera(100, 100, selectedIconType as CameraType)}>
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
        
        {/* Banque d'icônes */}
        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Banque d'icônes
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <CameraIconPreview type="hikvision" name="Hikvision" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="dahua" name="Dahua" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="axis" name="Axis" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="dome" name="Dôme" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="bullet" name="Bullet" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="ptz" name="PTZ" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="fisheye" name="Fisheye" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="turret" name="Turret" />
            </Grid>
            <Grid item xs={4}>
              <CameraIconPreview type="thermal" name="Thermique" />
            </Grid>
          </Grid>
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
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: cameraIcons[camera.type]?.color || '#1976d2',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d={cameraIcons[camera.type]?.path || cameraIcons.dome.path} fill="white" />
                    </svg>
                  </Box>
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
              <MenuItem value="hikvision">Hikvision</MenuItem>
              <MenuItem value="dahua">Dahua</MenuItem>
              <MenuItem value="axis">Axis</MenuItem>
              <MenuItem value="dome">Dôme</MenuItem>
              <MenuItem value="bullet">Bullet</MenuItem>
              <MenuItem value="ptz">PTZ</MenuItem>
              <MenuItem value="fisheye">Fisheye</MenuItem>
              <MenuItem value="turret">Turret</MenuItem>
              <MenuItem value="thermal">Thermique</MenuItem>
              <MenuItem value="multisensor">Multi-capteurs</MenuItem>
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
