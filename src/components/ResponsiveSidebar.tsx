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
  SwipeableDrawer,
  Collapse,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Upload, 
  Download, 
  Eye, 
  Save, 
  Trash2, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ResponsiveSidebarProps {
  open: boolean;
  onClose: () => void;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    setSelectedIconType,
    clearCurrentPage
  } = useAppContext();
  
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [openSection, setOpenSection] = useState<string | null>('general');
  
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

  // Fonction pour gérer le changement de taille de la caméra
  const handleCameraSizeChange = (event: any, newValue: number | number[]) => {
    if (selectedCamera) {
      const size = newValue as number;
      updateCamera(selectedCamera, { 
        width: size,
        height: size
      });
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
  
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  const drawerContent = (
    <Box sx={{ 
      width: isMobile ? '100%' : 300,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* En-tête du sidebar */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6">
          PlanCam
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose}>
            <ChevronLeft size={24} />
          </IconButton>
        )}
      </Box>
      
      {/* Contenu principal */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Section Plan */}
        <Box sx={{ p: 2 }}>
          <ListItemButton onClick={() => toggleSection('general')}>
            <ListItemText primary="Gestion du plan" />
            {openSection === 'general' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </ListItemButton>
          
          <Collapse in={openSection === 'general'} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2, pr: 2, pt: 1 }}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                startIcon={<Upload size={16} />}
                sx={{ mt: 1 }}
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
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={16} />}
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les caméras de cette page ?')) {
                    clearCurrentPage();
                  }
                }}
                fullWidth
                sx={{ mt: 2 }}
              >
                Effacer la page
              </Button>
            </Box>
          </Collapse>
          
          <Divider sx={{ my: 2 }} />
        </Box>
        
        {/* Section Caméras */}
        <Box sx={{ p: 2 }}>
          {selectedCameraData ? (
            <>
              <ListItemButton onClick={() => toggleSection('camera')}>
                <ListItemText primary="Édition de la caméra" />
                {openSection === 'camera' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </ListItemButton>
              
              <Collapse in={openSection === 'camera'} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pt: 1 }}>
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
                    onChange={handleCameraSizeChange}
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
              </Collapse>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Sélectionnez une caméra pour l'éditer
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
        </Box>
        
        {/* Section Paramètres */}
        <Box sx={{ p: 2 }}>
          <ListItemButton onClick={() => toggleSection('settings')}>
            <ListItemText primary="Paramètres des caméras" />
            {openSection === 'settings' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </ListItemButton>
          
          <Collapse in={openSection === 'settings'} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2, pr: 2, pt: 1 }}>
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
          </Collapse>
        </Box>
      </Box>
      
      {/* Boutons d'action en bas */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
        </Box>
      </Box>
    </Box>
  );
  
  // Utiliser SwipeableDrawer sur mobile pour permettre de fermer en glissant
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor={isSmallScreen ? 'bottom' : 'left'}
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            width: isSmallScreen ? '100%' : 300,
            height: isSmallScreen ? '80vh' : '100%',
            borderTopLeftRadius: isSmallScreen ? 16 : 0,
            borderTopRightRadius: isSmallScreen ? 16 : 0
          }
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }
  
  // Utiliser Drawer standard sur desktop
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 300,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 300,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default ResponsiveSidebar;
