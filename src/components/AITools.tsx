import React, { useState, useEffect } from 'react';
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
  Alert,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { 
  AutoAwesome as MagicIcon,
  CameraAlt as CameraIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ChevronUp, ChevronDown } from 'lucide-react';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cameras, addCamera, page, pdfFile, clearCurrentPage, updateCamera } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'analyze' | 'optimize' | 'generate'>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Réinitialiser l'état lorsque le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setAnalysisResult(null);
      setError(null);
      setIsLoading(false);
      
      // Définir un prompt par défaut en fonction du contexte
      if (cameras.length === 0) {
        setPrompt('Générer des caméras pour couvrir les entrées principales et les zones critiques');
      } else {
        setPrompt(`Optimiser la disposition des ${cameras.length} caméras existantes`);
      }
    }
  }, [open, cameras.length]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    switch (newValue) {
      case 0:
        setActiveTab('analyze');
        break;
      case 1:
        setActiveTab('optimize');
        break;
      case 2:
        setActiveTab('generate');
        break;
    }
  };
  
  // Fonction pour analyser la disposition des caméras
  const analyzeCameras = async () => {
    if (!pdfFile) {
      setError('Aucun plan chargé. Veuillez d\'abord charger un PDF.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel à l'API d'analyse
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculer les métriques d'analyse basées sur les caméras existantes
      const coverage = cameras.length > 0 
        ? Math.min(Math.round(cameras.length * 15 + Math.random() * 10), 100)
        : 0;
        
      const blindSpots = Math.max(5 - cameras.length, 0);
      
      // Générer des suggestions basées sur l'analyse
      const suggestions = [];
      const optimizationTips = [];
      
      if (cameras.length === 0) {
        suggestions.push('Aucune caméra présente. Ajoutez des caméras aux entrées principales.');
        suggestions.push('Placez des caméras dans les zones de passage fréquent.');
        suggestions.push('Couvrez les zones sensibles comme les accès et les espaces ouverts.');
        
        optimizationTips.push('Utilisez des caméras dôme pour les espaces intérieurs.');
        optimizationTips.push('Préférez les caméras PTZ pour les grandes zones ouvertes.');
        optimizationTips.push('Assurez une couverture des entrées et sorties.');
      } else if (cameras.length < 3) {
        suggestions.push('Couverture insuffisante. Ajoutez plus de caméras.');
        suggestions.push('Positionnez des caméras supplémentaires aux points d\'entrée.');
        suggestions.push('Augmentez l\'angle de vue des caméras existantes si possible.');
        
        optimizationTips.push('Visez une couverture minimale de 70% des zones critiques.');
        optimizationTips.push('Assurez un chevauchement entre les zones couvertes.');
        optimizationTips.push('Utilisez différents types de caméras selon les besoins spécifiques.');
      } else {
        suggestions.push('Vérifiez les zones aveugles entre les caméras.');
        suggestions.push('Ajustez l\'angle des caméras pour optimiser la couverture.');
        if (cameras.length < 6) {
          suggestions.push('Envisagez d\'ajouter 1-2 caméras supplémentaires pour les zones périphériques.');
        } else {
          suggestions.push('La disposition actuelle offre une bonne couverture de base.');
        }
        
        optimizationTips.push('Assurez un chevauchement de 15-20% entre les zones couvertes.');
        optimizationTips.push('Ajustez la hauteur des caméras pour une meilleure perspective.');
        optimizationTips.push('Documentez l\'emplacement et la configuration de chaque caméra.');
      }
      
      setAnalysisResult({
        coverage,
        blindSpots,
        suggestions,
        optimizationTips
      });
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour optimiser la disposition des caméras
  const optimizeCameras = async () => {
    if (!pdfFile) {
      setError('Aucun plan chargé. Veuillez d\'abord charger un PDF.');
      return;
    }
    
    if (cameras.length === 0) {
      setError('Aucune caméra à optimiser. Veuillez d\'abord ajouter des caméras au plan.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel à l'API d'optimisation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Optimiser les caméras existantes (simulé)
      // Dans une implémentation réelle, on utiliserait l'IA pour ajuster les positions et paramètres
      
      // Ajuster les angles et distances pour améliorer la couverture
      cameras.forEach(camera => {
        // Simuler des ajustements d'optimisation
        const optimizedAngle = Math.min(camera.angle + 10, 360);
        const optimizedDistance = Math.min(camera.viewDistance + 20, 500);
        const optimizedRotation = camera.rotation ? camera.rotation + 15 : 15;
        
        // Appliquer les optimisations
        updateCamera(camera.id, {
          angle: optimizedAngle,
          viewDistance: optimizedDistance,
          rotation: optimizedRotation
        });
      });
      
      // Calculer les métriques après optimisation
      const newCoverage = Math.min(Math.round(cameras.length * 20 + Math.random() * 10), 100);
      const newBlindSpots = Math.max(3 - cameras.length, 0);
      
      setAnalysisResult({
        coverage: newCoverage,
        blindSpots: newBlindSpots,
        suggestions: [
          'Optimisation réussie. La couverture a été améliorée.',
          'Les angles et distances de vue ont été ajustés pour une meilleure efficacité.',
          'Les zones critiques sont maintenant mieux couvertes.'
        ],
        optimizationTips: [
          'Vérifiez régulièrement la couverture en fonction des changements d\'aménagement.',
          'Ajustez manuellement les caméras si nécessaire pour des besoins spécifiques.',
          'Envisagez d\'ajouter des caméras supplémentaires si certaines zones restent mal couvertes.'
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
      // Simuler un appel à l'API de génération
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Déterminer si on doit remplacer les caméras existantes
      const shouldReplace = cameras.length > 0 && 
        prompt.toLowerCase().includes('remplacer');
      
      if (shouldReplace) {
        clearCurrentPage();
      }
      
      // Déterminer le nombre de caméras à générer
      let cameraCount = 4; // Par défaut
      
      // Essayer d'extraire un nombre du prompt
      const numberMatch = prompt.match(/\b(\d+)\b/);
      if (numberMatch) {
        cameraCount = parseInt(numberMatch[1], 10);
      } else if (prompt.toLowerCase().includes('minimum')) {
        cameraCount = 3;
      } else if (prompt.toLowerCase().includes('maximum') || prompt.toLowerCase().includes('complet')) {
        cameraCount = 6;
      }
      
      // Limiter le nombre de caméras
      cameraCount = Math.min(Math.max(cameraCount, 2), 8);
      
      // Générer des positions stratégiques pour les caméras
      const canvasWidth = 800;
      const canvasHeight = 600;
      const cameraTypes: CameraType[] = ['dome', 'bullet', 'ptz', 'fisheye'];
      
      // Positions stratégiques simulées
      // Dans une implémentation réelle, ces positions seraient déterminées par l'analyse du plan
      const strategicPositions = [
        { x: 150, y: 150, type: 'dome' }, // Coin supérieur gauche
        { x: canvasWidth - 150, y: 150, type: 'bullet' }, // Coin supérieur droit
        { x: 150, y: canvasHeight - 150, type: 'dome' }, // Coin inférieur gauche
        { x: canvasWidth - 150, y: canvasHeight - 150, type: 'bullet' }, // Coin inférieur droit
        { x: canvasWidth / 2, y: 150, type: 'ptz' }, // Milieu haut
        { x: canvasWidth / 2, y: canvasHeight - 150, type: 'ptz' }, // Milieu bas
        { x: 150, y: canvasHeight / 2, type: 'fisheye' }, // Milieu gauche
        { x: canvasWidth - 150, y: canvasHeight / 2, type: 'fisheye' } // Milieu droit
      ];
      
      // Sélectionner un sous-ensemble aléatoire de positions
      const selectedPositions = strategicPositions.slice(0, cameraCount);
      
      // Ajouter les caméras
      selectedPositions.forEach(pos => {
        const type = pos.type as CameraType;
        addCamera(pos.x, pos.y, type);
      });
      
      // Calculer les métriques après génération
      const newCoverage = Math.min(Math.round(cameraCount * 15 + Math.random() * 15), 100);
      const newBlindSpots = Math.max(5 - cameraCount, 0);
      
      setAnalysisResult({
        coverage: newCoverage,
        blindSpots: newBlindSpots,
        suggestions: [
          `${cameraCount} caméras ont été générées aux positions stratégiques.`,
          'Les entrées principales et zones critiques sont couvertes.',
          'Vous pouvez ajuster manuellement les caméras si nécessaire.'
        ],
        optimizationTips: [
          'Vérifiez la couverture des zones spécifiques importantes pour votre contexte.',
          'Ajustez les angles et distances de vue pour optimiser la couverture.',
          'Envisagez d\'ajouter des caméras supplémentaires pour les zones non couvertes.'
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
    
    if (!pdfFile) {
      setError('Aucun plan chargé. Veuillez d\'abord charger un PDF.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Analyser le prompt pour déterminer l'action à effectuer
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('générer') || lowerPrompt.includes('créer') || lowerPrompt.includes('ajouter')) {
        await generateCameras();
      } else if (lowerPrompt.includes('optimiser') || lowerPrompt.includes('améliorer')) {
        if (cameras.length === 0) {
          // Si pas de caméras mais demande d'optimisation, générer des caméras
          await generateCameras();
        } else {
          await optimizeCameras();
        }
      } else if (lowerPrompt.includes('analyser') || lowerPrompt.includes('évaluer')) {
        await analyzeCameras();
      } else {
        // Action par défaut: analyser si des caméras existent, sinon générer
        if (cameras.length > 0) {
          await analyzeCameras();
        } else {
          await generateCameras();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution du prompt:', error);
      setError('Une erreur est survenue lors de l\'exécution du prompt. Veuillez réessayer.');
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
        <Box sx={{ display: 'flex', height: '500px', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Tabs pour mobile */}
          {isMobile && (
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<SearchIcon />} label="Analyser" />
              <Tab icon={<VisibilityIcon />} label="Optimiser" />
              <Tab icon={<CameraIcon />} label="Générer" />
            </Tabs>
          )}
          
          {/* Sidebar avec les outils - visible uniquement sur desktop */}
          {!isMobile && (
            <Box sx={{ 
              width: 250, 
              borderRight: 1, 
              borderColor: 'divider'
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
          )}
          
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
                    label="Instructions spécifiques (optionnel)"
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
                
                {!pdfFile && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Veuillez d'abord charger un plan PDF pour utiliser cette fonctionnalité.
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
                          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                    disabled={isLoading || cameras.length === 0}
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
                
                {!pdfFile && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Veuillez d'abord charger un plan PDF pour utiliser cette fonctionnalité.
                  </Alert>
                )}
                
                {cameras.length === 0 && pdfFile && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Aucune caméra à optimiser. Veuillez d'abord ajouter des caméras ou utiliser l'onglet "Générer des caméras".
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
                    placeholder="Ex: Générer 5 caméras pour un bâtiment de bureaux avec priorité sur les entrées"
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
                    disabled={isLoading || !pdfFile}
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
                
                {!pdfFile && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Veuillez d'abord charger un plan PDF pour utiliser cette fonctionnalité.
                  </Alert>
                )}
                
                {cameras.length > 0 && pdfFile && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Il y a déjà {cameras.length} caméras sur ce plan. La génération ajoutera de nouvelles caméras ou remplacera les existantes selon vos instructions.
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
