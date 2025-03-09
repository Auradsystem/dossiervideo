import React, { useState, useRef } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Button, 
  Typography, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Upload, 
  Download, 
  Eye, 
  Camera, 
  Settings, 
  Edit3, 
  Trash2,
  Save
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Largeur du sidebar
const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const { 
    pdfFile, 
    setPdfFile, 
    selectedCamera, 
    updateCamera, 
    deleteCamera,
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
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer le chargement d'un fichier PDF
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        console.log('PDF chargé:', file.name);
      } else {
        alert('Veuillez sélectionner un fichier PDF valide.');
      }
    }
  };

  // Déclencher le clic sur l'input file caché
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gérer la mise à jour du nom de la caméra sélectionnée
  const handleCameraNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { name: event.target.value });
    }
  };

  // Gérer la mise à jour de l'angle de vue de la caméra
  const handleViewAngleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      const angle = Number(event.target.value);
      if (!isNaN(angle) && angle >= 0 && angle <= 360) {
        updateCamera(selectedCamera, { angle });
      }
    }
  };

  // Gérer la mise à jour de la distance de vue de la caméra
  const handleViewDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      const viewDistance = Number(event.target.value);
      if (!isNaN(viewDistance) && viewDistance >= 0) {
        updateCamera(selectedCamera, { viewDistance });
      }
    }
  };

  // Gérer la mise à jour de l'opacité de la caméra
  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCamera) {
      const opacity = Number(event.target.value);
      if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
        updateCamera(selectedCamera, { opacity });
      }
    }
  };

  // Gérer la mise à jour du type de caméra
  const handleCameraTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (selectedCamera) {
      updateCamera(selectedCamera, { type: event.target.value as any });
    }
  };

  // Gérer la suppression de la caméra sélectionnée
  const handleDeleteCamera = () => {
    if (selectedCamera && window.confirm('Êtes-vous sûr de vouloir supprimer cette caméra ?')) {
      deleteCamera(selectedCamera);
    }
  };

  // Ouvrir la boîte de dialogue des paramètres
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // Fermer la boîte de dialogue des paramètres
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // Sauvegarder les paramètres
  const handleSaveSettings = () => {
    setIsSettingsOpen(false);
    // Les paramètres sont déjà sauvegardés via les états React
  };

  // Obtenir les détails de la caméra sélectionnée
  const getSelectedCameraDetails = () => {
    if (!selectedCamera) return null;
    
    const camera = useAppContext().cameras.find(cam => cam.id === selectedCamera);
    return camera;
  };

  const selectedCameraDetails = getSelectedCameraDetails();

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                PlanCam
              </Typography>
            </ListItem>
            
            <Divider />
            
            {/* Section Fichier */}
            <ListItem>
              <Typography variant="subtitle2" color="text.secondary">
                FICHIER
              </Typography>
            </ListItem>
            
            <ListItem>
              <Button
                variant="outlined"
                startIcon={<Upload size={16} />}
                onClick={handleUploadClick}
                fullWidth
                size="small"
              >
                Charger PDF
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                style={{ display: 'none' }}
              />
            </ListItem>
            
            {pdfFile && (
              <>
                <ListItem>
                  <Button
                    variant="outlined"
                    startIcon={<Eye size={16} />}
                    onClick={previewPdf}
                    fullWidth
                    size="small"
                    disabled={!pdfFile}
                  >
                    Prévisualiser
                  </Button>
                </ListItem>
                
                <ListItem>
                  <Button
                    variant="outlined"
                    startIcon={<Download size={16} />}
                    onClick={exportCurrentPage}
                    fullWidth
                    size="small"
                    disabled={!pdfFile}
                  >
                    Exporter page
                  </Button>
                </ListItem>
                
                <ListItem>
                  <Button
                    variant="contained"
                    startIcon={<Save size={16} />}
                    onClick={exportPdf}
                    fullWidth
                    size="small"
                    disabled={!pdfFile}
                  >
                    Exporter tout
                  </Button>
                </ListItem>
              </>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            {/* Section Caméra */}
            <ListItem>
              <Typography variant="subtitle2" color="text.secondary">
                CAMÉRA
              </Typography>
            </ListItem>
            
            <ListItem>
              <FormControl fullWidth size="small">
                <InputLabel id="camera-type-label">Type de caméra</InputLabel>
                <Select
                  labelId="camera-type-label"
                  value={selectedIconType}
                  label="Type de caméra"
                  onChange={(e) => setSelectedIconType(e.target.value)}
                >
                  <MenuItem value="dome">Dôme</MenuItem>
                  <MenuItem value="bullet">Bullet</MenuItem>
                  <MenuItem value="ptz">PTZ</MenuItem>
                  <MenuItem value="fisheye">Fisheye</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            
            <ListItem>
              <Button
                variant="outlined"
                startIcon={<Settings size={16} />}
                onClick={handleOpenSettings}
                fullWidth
                size="small"
              >
                Paramètres
              </Button>
            </ListItem>
            
            {selectedCameraDetails && (
              <>
                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <Typography variant="subtitle2" color="text.secondary">
                    ÉDITION
                  </Typography>
                </ListItem>
                
                <ListItem>
                  <TextField
                    label="Nom"
                    value={selectedCameraDetails.name}
                    onChange={handleCameraNameChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControl fullWidth size="small">
                    <InputLabel id="camera-edit-type-label">Type</InputLabel>
                    <Select
                      labelId="camera-edit-type-label"
                      value={selectedCameraDetails.type}
                      label="Type"
                      onChange={handleCameraTypeChange}
                    >
                      <MenuItem value="dome">Dôme</MenuItem>
                      <MenuItem value="bullet">Bullet</MenuItem>
                      <MenuItem value="ptz">PTZ</MenuItem>
                      <MenuItem value="fisheye">Fisheye</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                
                <ListItem>
                  <TextField
                    label="Angle de vue (°)"
                    type="number"
                    value={selectedCameraDetails.angle}
                    onChange={handleViewAngleChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0, max: 360 }}
                  />
                </ListItem>
                
                <ListItem>
                  <TextField
                    label="Distance de vue"
                    type="number"
                    value={selectedCameraDetails.viewDistance}
                    onChange={handleViewDistanceChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                  />
                </ListItem>
                
                <ListItem>
                  <TextField
                    label="Opacité"
                    type="number"
                    value={selectedCameraDetails.opacity}
                    onChange={handleOpacityChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </ListItem>
                
                <ListItem>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={handleDeleteCamera}
                    fullWidth
                    size="small"
                  >
                    Supprimer
                  </Button>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
      
      {/* Boîte de dialogue des paramètres */}
      <Dialog open={isSettingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>Paramètres</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Modèle de nommage"
              value={namingPattern}
              onChange={(e) => setNamingPattern(e.target.value)}
              fullWidth
              margin="normal"
              helperText="Préfixe utilisé pour nommer les caméras (ex: CAM-)"
            />
            
            <TextField
              label="Prochain numéro"
              type="number"
              value={nextCameraNumber}
              onChange={(e) => setNextCameraNumber(Number(e.target.value))}
              fullWidth
              margin="normal"
              inputProps={{ min: 1 }}
              helperText="Numéro qui sera utilisé pour la prochaine caméra"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Annuler</Button>
          <Button onClick={handleSaveSettings} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
