import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Collapse,
  Alert
} from '@mui/material';
import { 
  AutoAwesome as MagicIcon,
  CameraAlt as CameraIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { CameraType } from '../types/Camera';

interface AIToolsProps {
  onClose: () => void;
  open: boolean;
}

interface AnalysisResult {
  coverage: number;
  blindSpots: number;
  suggestions: string[];
  optimizationTips: string[];
}

const AITools: React.FC<AIToolsProps> = ({ onClose, open }) => {
  const { cameras, addCamera, page, pdfFile } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'analyze' | 'optimize' | 'generate'>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour analyser la disposition des caméras
  const analyzeCameras = async () => {
    if (cameras.length === 0) {
      setError('Aucune caméra à analyser. Veuillez d\'abord ajouter des caméras au plan.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel à l'API GPT-4o
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Résultat simulé (à remplacer par la réponse de l'API)
      const result: AnalysisResult = {
        coverage: Math.min(Math.round(cameras.length * 15 + Math.random() * 20), 100),
        blindSpots: Math.max(5 - cameras.length, 0),
        suggestions: [
          'Ajouter une caméra dans le coin supérieur droit pour améliorer la couverture',
          'Augmenter l\'angle de vue des caméras aux entrées principales',
          'Repositionner la caméra CAM-002 pour réduire les zones aveugles'
        ],
        optimizationTips: [
          'Utiliser des caméras PTZ pour les grandes zones ouvertes',
          'Assurer un chevauchement de 15-20% entre les zones couvertes',
          'Placer les caméras en hauteur (2.5-3m) pour une meilleure couverture'
        ]
      };
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour optimiser la disposition des caméras
  const optimizeCameras = async () => {
    if (cameras.length === 0) {
      setError('Aucune caméra à optimiser. Veuillez d\'abord ajouter des caméras au plan.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel à l'API GPT-4o
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler l'optimisation (à remplacer par la réponse de l'API)
      // Dans une implémentation réelle, on utiliserait les suggestions de GPT-4o
      // pour ajuster les positions et paramètres des caméras
      
      setAnalysisResult({
        coverage: Math.min(Math.round(cameras.length * 20 + Math.random() * 15), 100),
        blindSpots: Math.max(3 - cameras.length, 0),
        suggestions: [
          'Disposition optimisée avec succès',
          'La couverture a été améliorée de 15%',
          'Les zones aveugles ont été réduites'
        ],
        optimizationTips: [
          'Vérifier régulièrement la couverture des caméras',
          'Ajuster les angles en fonction des changements d\'aménagement',
          'Envisager l\'ajout de caméras supplémentaires pour les zones critiques'
        ]
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      setError('Une erreur est survenue lors de l\'optimisation. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour générer des caméras basées sur l'analyse du plan
  const generateCameras = async () => {
    if (!pdfFile) {
      setError('Aucun plan chargé. Veuillez d\'abord charger un PDF.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel à l'API GPT-4o
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simuler la génération de caméras (à remplacer par la réponse de l'API)
      // Dans une implémentation réelle, on utiliserait les suggestions de GPT-4o
      // pour placer automatiquement des caméras aux endroits stratégiques
      
      // Générer quelques positions aléatoires pour les caméras
      const canvasWidth = 800; // Largeur approximative du canvas
      const canvasHeight = 600; // Hauteur approximative du canvas
      
      const cameraTypes: CameraType[] = ['dome', 'bullet', 'ptz', 'fisheye'];
      
      // Générer 3 caméras aléatoires
      for (let i = 0; i < 3; i++) {
        const x = 100 + Math.random() * (canvasWidth - 200);
        const y = 100 + Math.random() * (canvasHeight - 200);
        const type = cameraTypes[Math.floor(Math.random() * cameraTypes.length)];
        
        // Ajouter la caméra (dans une implémentation réelle, ces positions seraient
        // déterminées par l'analyse du plan par GPT-4o)
        addCamera(x, y, type);
      }
      
      setAnalysisResult({
        coverage: 65 + Math.random() * 15,
        blindSpots: 2,
        suggestions: [
          '3 caméras ont été placées automatiquement',
          'Les entrées principales sont couvertes',
          'Envisager d\'ajouter des caméras supplémentaires pour les zones de stockage'
        ],
        optimizationTips: [
          'Ajuster les angles des caméras pour une couverture optimale',
          'Vérifier les zones de chevauchement pour éviter la redondance',
          'Ajouter des caméras supplémentaires si nécessaire'
        ]
      });
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      setError('Une erreur est survenue lors de la génération. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour exécuter une action basée sur un prompt personnalisé
  const executeCustomPrompt = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer un prompt.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel à l'API GPT-4o
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une réponse (à remplacer par la réponse de l'API)
      setAnalysisResult({
        coverage: cameras.length > 0 ? Math.min(Math.round(cameras.length * 18 + Math.random() * 15), 100) : 0,
        blindSpots: Math.max(4 - cameras.length, 0),
        suggestions: [
          'Analyse basée sur votre prompt personnalisé',
          'Considérer les points d\'entrée comme prioritaires',
          'Utiliser des caméras à grand angle pour les espaces ouverts'
        ],
        optimizationTips: [
          'Adapter la hauteur des caméras en fonction de l\'espace',
          'Vérifier les angles morts potentiels',
          'Documenter l\'emplacement et la configuration de chaque caméra'
        ]
      });
    } catch (error) {
      console.error('Erreur lors de l\'exécution du prompt:', error);
      setError('Une erreur est survenue lors de l\'exécution du prompt. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MagicIcon sx={{ mr: 1 }} />
          Outils d'IA pour PlanCam
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '500px' }}>
          {/* Sidebar avec les outils */}
          <Box sx={{ 
            width: 250, 
            borderRight: 1, 
            borderColor: 'divider',
            display: { xs: 'none', sm: 'block' }
          }}>
            <List component="nav">
              <ListItem 
                button 
                selected={activeTab === 'analyze'}
                onClick={() => setActiveTab('analyze')}
              >
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Analyser les caméras" />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'optimize'}
                onClick={() => setActiveTab('optimize')}
              >
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText primary="Optimiser la couverture" />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'generate'}
                onClick={() => setActiveTab('generate')}
              >
                <ListItemIcon>
                  <CameraIcon />
                </ListItemIcon>
                <ListItemText primary="Générer des caméras" />
              </ListItem>
              
              <Divider sx={{ my: 2 }} />
              
              <ListItem>
                <ListItemText 
                  primary="Statistiques" 
                  secondary={`${cameras.length} caméras sur la page ${page}`} 
                />
              </ListItem>
            </List>
          </Box>
          
          {/* Contenu principal */}
          <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
            {/* Onglet d'analyse */}
            {activeTab === 'analyze' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Analyser la disposition des caméras
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Utilisez l'IA pour analyser la disposition actuelle des caméras et obtenir des recommandations pour améliorer la couverture.
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Prompt personnalisé (optionnel)"
                    placeholder="Ex: Analyser la couverture des entrées principales"
                    variant="outlined"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    margin="normal"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<SearchIcon />}
                      onClick={analyzeCameras}
                      disabled={isLoading}
                    >
                      Analyser
                    </Button>
                    
                    {prompt && (
                      <Button 
                        variant="outlined"
                        onClick={executeCustomPrompt}
                        disabled={isLoading}
                      >
                        Exécuter le prompt
                      </Button>
                    )}
                  </Box>
                </Box>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {analysisResult && !isLoading && (
                  <Box>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Résultats de l'analyse
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Couverture estimée
                            </Typography>
                            <Typography variant="h4" color={analysisResult.coverage > 70 ? 'success.main' : 'warning.main'}>
                              {Math.round(analysisResult.coverage)}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Zones aveugles identifiées
                            </Typography>
                            <Typography variant="h4" color={analysisResult.blindSpots < 3 ? 'success.main' : 'error.main'}>
                              {analysisResult.blindSpots}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={() => setShowDetails(!showDetails)}
                        >
                          <Typography variant="subtitle1">
                            Détails et recommandations
                          </Typography>
                          {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                        
                        <Collapse in={showDetails}>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Suggestions d'amélioration:
                            </Typography>
                            <List dense>
                              {analysisResult.suggestions.map((suggestion, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <InfoIcon color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={suggestion} />
                                </ListItem>
                              ))}
                            </List>
                            
                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                              Conseils d'optimisation:
                            </Typography>
                            <List dense>
                              {analysisResult.optimizationTips.map((tip, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckIcon color="success" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={tip} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Collapse>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Onglet d'optimisation */}
            {activeTab === 'optimize' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Optimiser la couverture des caméras
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Utilisez l'IA pour optimiser automatiquement la disposition des caméras et maximiser la couverture.
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Instructions spécifiques (optionnel)"
                    placeholder="Ex: Prioriser la couverture des entrées et minimiser les zones aveugles"
                    variant="outlined"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    onClick={optimizeCameras}
                    disabled={isLoading}
                    sx={{ mt: 2 }}
                  >
                    Optimiser automatiquement
                  </Button>
                </Box>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {analysisResult && !isLoading && (
                  <Box>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Optimisation terminée avec succès !
                    </Alert>
                    
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Résultats de l'optimisation
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Nouvelle couverture
                            </Typography>
                            <Typography variant="h4" color="success.main">
                              {Math.round(analysisResult.coverage)}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Zones aveugles restantes
                            </Typography>
                            <Typography variant="h4" color={analysisResult.blindSpots < 2 ? 'success.main' : 'warning.main'}>
                              {analysisResult.blindSpots}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Modifications effectuées:
                        </Typography>
                        <List dense>
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={suggestion} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Onglet de génération */}
            {activeTab === 'generate' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Générer des caméras automatiquement
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Utilisez l'IA pour analyser votre plan et placer automatiquement des caméras aux endroits stratégiques.
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Instructions pour la génération"
                    placeholder="Ex: Générer des caméras pour un bâtiment de bureaux avec priorité sur les entrées et les zones communes"
                    variant="outlined"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<CameraIcon />}
                    onClick={generateCameras}
                    disabled={isLoading}
                    sx={{ mt: 2 }}
                  >
                    Générer des caméras
                  </Button>
                </Box>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {analysisResult && !isLoading && (
                  <Box>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Génération de caméras terminée !
                    </Alert>
                    
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Caméras générées avec succès
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2">
                          Couverture estimée: <strong>{Math.round(analysisResult.coverage)}%</strong>
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Détails:
                        </Typography>
                        <List dense>
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <InfoIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={suggestion} />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Prochaines étapes recommandées:
                        </Typography>
                        <List dense>
                          {analysisResult.optimizationTips.map((tip, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={tip} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AITools;
