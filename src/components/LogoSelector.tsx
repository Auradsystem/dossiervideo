import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardActionArea, 
  Typography, 
  Box, 
  TextField, 
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { Upload, Search, X } from 'lucide-react';

// Logos prédéfinis
const predefinedLogos = [
  { id: 'logo1', url: '/logo-xcel-security.png', name: 'Xcel Security' },
  { id: 'logo2', url: '/logo-icon.svg', name: 'Logo Icon' },
  { id: 'logo3', url: '/camera-icon.svg', name: 'Camera Icon' },
  // Ajoutez d'autres logos prédéfinis ici
];

interface LogoSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (logoUrl: string) => void;
}

const LogoSelector: React.FC<LogoSelectorProps> = ({ open, onClose, onSelect }) => {
  const [tab, setTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
  
  // Effet pour nettoyer l'URL de l'image téléchargée lors de la fermeture
  useEffect(() => {
    if (!open) {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
      setUploadedImageUrl(null);
      setUploadedFile(null);
      setCustomLogoUrl('');
      setSearchTerm('');
    }
  }, [open]);
  
  // Filtrer les logos en fonction du terme de recherche
  const filteredLogos = predefinedLogos.filter(logo => 
    logo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Gérer le changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  
  // Gérer le téléchargement de fichier
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Vérifier si le fichier est une image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      setUploadedFile(file);
      
      // Créer une URL pour l'aperçu
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    }
  };
  
  // Simuler le chargement lors de l'utilisation d'une URL personnalisée
  const handleCustomUrlLoad = () => {
    if (!customLogoUrl.trim()) return;
    
    setLoading(true);
    
    // Simuler un délai de chargement
    setTimeout(() => {
      setLoading(false);
      onSelect(customLogoUrl);
      onClose();
    }, 1000);
  };
  
  // Gérer la sélection d'un logo
  const handleLogoSelect = (logoUrl: string) => {
    onSelect(logoUrl);
    onClose();
  };
  
  // Gérer la sélection du logo téléchargé
  const handleUploadedLogoSelect = () => {
    if (uploadedImageUrl) {
      onSelect(uploadedImageUrl);
      onClose();
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Sélectionner un logo</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Logos prédéfinis" />
          <Tab label="URL personnalisée" />
          <Tab label="Télécharger" />
        </Tabs>
      </Box>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Onglet des logos prédéfinis */}
        {tab === 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Search size={20} sx={{ mr: 1, color: 'text.secondary' }} />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Rechercher un logo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            
            {filteredLogos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucun logo ne correspond à votre recherche
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredLogos.map((logo) => (
                  <Grid item xs={6} sm={4} md={3} key={logo.id}>
                    <Card 
                      elevation={hoveredLogo === logo.id ? 6 : 1}
                      sx={{ 
                        transition: 'all 0.3s ease',
                        transform: hoveredLogo === logo.id ? 'scale(1.05)' : 'scale(1)',
                        border: hoveredLogo === logo.id ? '2px solid #1976d2' : 'none'
                      }}
                      onMouseEnter={() => setHoveredLogo(logo.id)}
                      onMouseLeave={() => setHoveredLogo(null)}
                    >
                      <CardActionArea onClick={() => handleLogoSelect(logo.url)}>
                        <CardMedia
                          component="img"
                          height="100"
                          image={logo.url}
                          alt={logo.name}
                          sx={{ 
                            objectFit: 'contain',
                            p: 2,
                            bgcolor: '#f5f5f5'
                          }}
                        />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                          <Typography variant="body2" noWrap>
                            {logo.name}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
        
        {/* Onglet URL personnalisée */}
        {tab === 1 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="body2" gutterBottom>
              Entrez l'URL d'une image en ligne:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="https://exemple.com/image.png"
                value={customLogoUrl}
                onChange={(e) => setCustomLogoUrl(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="contained"
                sx={{ ml: 2, minWidth: 100 }}
                onClick={handleCustomUrlLoad}
                disabled={!customLogoUrl.trim() || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Utiliser'}
              </Button>
            </Box>
            
            {customLogoUrl && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>
                  Aperçu:
                </Typography>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <img 
                    src={customLogoUrl} 
                    alt="Aperçu" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200,
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFsZXJ0LXRyaWFuZ2xlIj48cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40NiAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTNaIi8+PHBhdGggZD0iTTEyIDl2NCIvPjxwYXRoIGQ9Ik0xMiAxN2guMDEiLz48L3N2Zz4=';
                      (e.target as HTMLImageElement).style.padding = '20px';
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
        
        {/* Onglet téléchargement */}
        {tab === 2 && (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="logo-upload-button"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="logo-upload-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload size={18} />}
              >
                Sélectionner une image
              </Button>
            </label>
            
            {uploadedImageUrl && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" gutterBottom>
                  Image sélectionnée:
                </Typography>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 3, 
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <img 
                    src={uploadedImageUrl} 
                    alt="Logo téléchargé" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200,
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={handleUploadedLogoSelect}
                >
                  Utiliser ce logo
                </Button>
              </Box>
            )}
            
            {!uploadedImageUrl && (
              <Box sx={{ 
                mt: 4, 
                p: 4, 
                border: '2px dashed #ccc',
                borderRadius: 2,
                bgcolor: '#f9f9f9'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Glissez-déposez une image ici ou cliquez sur le bouton ci-dessus
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoSelector;
