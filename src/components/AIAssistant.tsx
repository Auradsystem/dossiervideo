import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Drawer, 
  Fab, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Zoom,
  Button,
  Alert
} from '@mui/material';
import { 
  Send as SendIcon, 
  SmartToy as AIIcon,
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CameraType } from '../types/Camera';

// Types pour les messages
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  actions?: AIAction[];
}

// Types pour les suggestions
interface Suggestion {
  id: string;
  text: string;
  action: () => void;
}

// Types pour les actions de l'IA
interface AIAction {
  type: 'add_camera' | 'analyze_plan' | 'optimize_cameras' | 'clear_cameras';
  label: string;
  payload?: any;
  status?: 'pending' | 'success' | 'error';
  result?: string;
}

const AIAssistant: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { 
    cameras, 
    comments, 
    pdfFile, 
    addCamera, 
    addComment, 
    page,
    clearCurrentPage,
    totalPages
  } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [pendingActions, setPendingActions] = useState<AIAction[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Effet pour faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Message de bienvenue initial
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: 'Bonjour ! Je suis votre assistant IA pour PlanCam. Je peux analyser vos plans et vous aider à positionner vos caméras de manière optimale. Comment puis-je vous aider aujourd\'hui ?',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
      
      // Définir les suggestions initiales
      updateSuggestions();
    }
  }, []);
  
  // Mettre à jour les suggestions en fonction du contexte
  const updateSuggestions = () => {
    const newSuggestions: Suggestion[] = [];
    
    // Suggestions basées sur l'état actuel
    if (pdfFile) {
      newSuggestions.push({
        id: '1',
        text: 'Analyser le plan actuel',
        action: () => handleSuggestionClick('Peux-tu analyser le plan actuel et suggérer des emplacements pour les caméras ?')
      });
    }
    
    if (cameras.length > 0) {
      newSuggestions.push({
        id: '2',
        text: `Optimiser les ${cameras.length} caméras`,
        action: () => handleSuggestionClick(`Comment optimiser la disposition de mes ${cameras.length} caméras sur ce plan ?`)
      });
      
      newSuggestions.push({
        id: '3',
        text: 'Vérifier les zones non couvertes',
        action: () => handleSuggestionClick('Quelles sont les zones non couvertes par mes caméras actuelles ?')
      });
    }
    
    // Toujours proposer ces suggestions de base
    newSuggestions.push({
      id: '4',
      text: 'Générer des caméras automatiquement',
      action: () => handleSuggestionClick('Peux-tu générer automatiquement des caméras sur mon plan ?')
    });
    
    newSuggestions.push({
      id: '5',
      text: 'Comment utiliser l\'application',
      action: () => handleSuggestionClick('Comment utiliser les fonctionnalités principales de PlanCam ?')
    });
    
    setSuggestions(newSuggestions);
  };
  
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Analyser le message et générer une réponse
      const aiResponse = await analyzeUserMessage(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        sender: 'ai',
        timestamp: new Date(),
        actions: aiResponse.actions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Si des actions sont proposées, les ajouter aux actions en attente
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        setPendingActions(aiResponse.actions);
      }
      
      // Mettre à jour les suggestions après la réponse
      updateSuggestions();
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'IA:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue lors de l\'analyse de votre demande. Veuillez réessayer.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestionText: string) => {
    setMessage(suggestionText);
  };
  
  // Fonction pour analyser le message de l'utilisateur et générer une réponse
  const analyzeUserMessage = async (userMessage: string): Promise<{ text: string, actions?: AIAction[] }> => {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerCaseMessage = userMessage.toLowerCase();
    let response = { text: '', actions: [] as AIAction[] };
    
    // Vérifier si un PDF est chargé
    if (!pdfFile) {
      return {
        text: 'Pour pouvoir vous aider efficacement, veuillez d\'abord charger un plan au format PDF. Utilisez le bouton "Charger PDF" dans le panneau latéral.'
      };
    }
    
    // Analyser le message pour déterminer l'intention de l'utilisateur
    if (lowerCaseMessage.includes('analyser') && lowerCaseMessage.includes('plan')) {
      response.text = `J'ai analysé votre plan actuel (page ${page}/${totalPages}). `;
      
      if (cameras.length === 0) {
        response.text += 'Je ne vois aucune caméra sur ce plan. Voulez-vous que je vous suggère des emplacements optimaux pour les caméras ?';
        response.actions = [
          {
            type: 'analyze_plan',
            label: 'Analyser le plan et suggérer des caméras',
            payload: { page }
          }
        ];
      } else {
        response.text += `Je vois ${cameras.length} caméras sur ce plan. La couverture actuelle est estimée à ${Math.min(cameras.length * 15, 100)}%. `;
        
        if (cameras.length < 3) {
          response.text += 'La couverture est insuffisante. Je recommande d\'ajouter plus de caméras, notamment aux entrées et dans les zones ouvertes.';
        } else if (cameras.length < 6) {
          response.text += 'La couverture est moyenne. Pour l\'améliorer, envisagez d\'ajouter des caméras supplémentaires dans les zones périphériques.';
        } else {
          response.text += 'La couverture semble bonne. Vous pourriez optimiser le positionnement pour réduire les zones aveugles.';
        }
        
        response.actions = [
          {
            type: 'analyze_plan',
            label: 'Analyser la couverture actuelle en détail',
            payload: { page, cameras }
          }
        ];
      }
    }
    else if (lowerCaseMessage.includes('générer') && lowerCaseMessage.includes('caméra')) {
      response.text = 'Je peux générer automatiquement des caméras sur votre plan en fonction de l\'analyse de la structure. ';
      
      if (cameras.length > 0) {
        response.text += `Je vois que vous avez déjà ${cameras.length} caméras. Souhaitez-vous que j'ajoute des caméras complémentaires ou que je remplace la disposition actuelle ?`;
      } else {
        response.text += 'Combien de caméras souhaitez-vous placer approximativement ? Je vais analyser le plan et déterminer les meilleurs emplacements.';
      }
      
      response.actions = [
        {
          type: 'add_camera',
          label: 'Générer 3 caméras aux points stratégiques',
          payload: { count: 3, page, replace: false }
        },
        {
          type: 'add_camera',
          label: 'Remplacer par une nouvelle disposition optimisée',
          payload: { count: 5, page, replace: true }
        }
      ];
    }
    else if (lowerCaseMessage.includes('optimiser') && lowerCaseMessage.includes('caméra')) {
      if (cameras.length === 0) {
        response.text = 'Il n\'y a actuellement aucune caméra sur ce plan à optimiser. Souhaitez-vous que je génère une disposition optimale de caméras ?';
        response.actions = [
          {
            type: 'add_camera',
            label: 'Générer une disposition optimale',
            payload: { count: 4, page, replace: false }
          }
        ];
      } else {
        response.text = `J'ai analysé la disposition de vos ${cameras.length} caméras. `;
        
        if (cameras.length < 3) {
          response.text += 'Le nombre de caméras est insuffisant pour une couverture optimale. Je recommande d\'ajouter plus de caméras.';
        } else {
          response.text += 'Je peux optimiser leur positionnement pour améliorer la couverture et réduire les zones aveugles.';
        }
        
        response.actions = [
          {
            type: 'optimize_cameras',
            label: 'Optimiser la disposition actuelle',
            payload: { cameras, page }
          }
        ];
      }
    }
    else if (lowerCaseMessage.includes('zone') && (lowerCaseMessage.includes('non couverte') || lowerCaseMessage.includes('aveugle'))) {
      if (cameras.length === 0) {
        response.text = 'Il n\'y a actuellement aucune caméra sur ce plan, donc toutes les zones sont non couvertes. Souhaitez-vous que je génère une disposition de caméras ?';
        response.actions = [
          {
            type: 'add_camera',
            label: 'Générer des caméras pour couvrir les zones principales',
            payload: { count: 4, page, replace: false }
          }
        ];
      } else {
        response.text = `Basé sur la disposition actuelle de vos ${cameras.length} caméras, j'ai identifié plusieurs zones potentiellement non couvertes. `;
        
        // Simuler l'identification de zones non couvertes
        const blindSpots = Math.max(5 - cameras.length, 0);
        response.text += `Il y a environ ${blindSpots} zones principales qui pourraient bénéficier d'une couverture supplémentaire. `;
        
        if (blindSpots > 0) {
          response.text += 'Ces zones sont principalement situées dans les coins et les zones périphériques du plan.';
          response.actions = [
            {
              type: 'add_camera',
              label: 'Ajouter des caméras dans les zones non couvertes',
              payload: { count: blindSpots, page, replace: false, targetBlindSpots: true }
            }
          ];
        } else {
          response.text += 'La couverture semble très bonne avec la disposition actuelle.';
        }
      }
    }
    else if (lowerCaseMessage.includes('comment') && lowerCaseMessage.includes('utiliser')) {
      response.text = 'Voici comment utiliser les fonctionnalités principales de PlanCam :\n\n' +
        '1. Chargez un plan PDF en utilisant le bouton "Charger PDF" dans le panneau latéral\n' +
        '2. Double-cliquez sur le plan pour ajouter une caméra manuellement\n' +
        '3. Sélectionnez une caméra pour modifier ses propriétés (angle, distance, type)\n' +
        '4. Utilisez les outils d\'IA pour analyser le plan et optimiser la disposition\n' +
        '5. Exportez le résultat en PDF avec le bouton "Exporter"\n\n' +
        'Vous pouvez également ajouter des commentaires, naviguer entre les pages du PDF, et ajuster le zoom.';
    }
    else if (lowerCaseMessage.includes('supprimer') && lowerCaseMessage.includes('caméra')) {
      if (cameras.length === 0) {
        response.text = 'Il n\'y a actuellement aucune caméra sur ce plan à supprimer.';
      } else {
        response.text = `Voulez-vous supprimer toutes les ${cameras.length} caméras de la page actuelle ?`;
        response.actions = [
          {
            type: 'clear_cameras',
            label: 'Supprimer toutes les caméras de cette page',
            payload: { page }
          }
        ];
      }
    }
    else {
      // Réponse par défaut
      response.text = 'Je comprends que vous souhaitez de l\'aide avec votre plan de caméras. Pour mieux vous assister, pourriez-vous préciser si vous voulez :\n\n' +
        '- Analyser votre plan actuel\n' +
        '- Générer automatiquement des caméras\n' +
        '- Optimiser la disposition existante\n' +
        '- Identifier les zones non couvertes\n\n' +
        'Je suis là pour vous aider à obtenir la meilleure couverture de surveillance possible.';
    }
    
    return response;
  };
  
  // Fonction pour exécuter une action de l'IA
  const executeAIAction = async (action: AIAction) => {
    setActionInProgress(true);
    
    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let resultMessage = '';
      
      switch (action.type) {
        case 'add_camera':
          // Générer des caméras en fonction des paramètres
          const { count, replace, targetBlindSpots } = action.payload;
          
          // Si demandé, supprimer les caméras existantes
          if (replace) {
            clearCurrentPage();
          }
          
          // Générer des positions de caméras basées sur l'analyse du plan
          // Dans une implémentation réelle, ces positions seraient déterminées par l'analyse du plan
          const canvasWidth = 800; // Largeur approximative du canvas
          const canvasHeight = 600; // Hauteur approximative du canvas
          
          const cameraTypes: CameraType[] = ['dome', 'bullet', 'ptz', 'fisheye'];
          
          // Positions stratégiques (simulées)
          const strategicPositions = targetBlindSpots 
            ? [
                { x: 100, y: 100 }, // Coin supérieur gauche
                { x: canvasWidth - 100, y: 100 }, // Coin supérieur droit
                { x: 100, y: canvasHeight - 100 }, // Coin inférieur gauche
                { x: canvasWidth - 100, y: canvasHeight - 100 }, // Coin inférieur droit
                { x: canvasWidth / 2, y: canvasHeight / 2 } // Centre
              ]
            : [
                { x: canvasWidth / 4, y: canvasHeight / 4 },
                { x: (canvasWidth / 4) * 3, y: canvasHeight / 4 },
                { x: canvasWidth / 2, y: canvasHeight / 2 },
                { x: canvasWidth / 4, y: (canvasHeight / 4) * 3 },
                { x: (canvasWidth / 4) * 3, y: (canvasHeight / 4) * 3 }
              ];
          
          // Ajouter les caméras aux positions stratégiques
          for (let i = 0; i < Math.min(count, strategicPositions.length); i++) {
            const pos = strategicPositions[i];
            const type = cameraTypes[Math.floor(Math.random() * cameraTypes.length)];
            addCamera(pos.x, pos.y, type);
          }
          
          resultMessage = `J'ai généré ${count} caméras aux positions stratégiques sur votre plan. Vous pouvez maintenant ajuster leurs propriétés si nécessaire.`;
          break;
          
        case 'analyze_plan':
          // Analyser le plan et les caméras existantes
          const camerasCount = cameras.length;
          const coverage = Math.min(camerasCount * 15, 100);
          const blindSpots = Math.max(5 - camerasCount, 0);
          
          resultMessage = `Analyse terminée. Couverture estimée : ${coverage}%. `;
          
          if (camerasCount === 0) {
            resultMessage += 'Aucune caméra n\'est présente sur ce plan. Je recommande d\'ajouter des caméras aux entrées principales et dans les zones ouvertes.';
          } else if (camerasCount < 3) {
            resultMessage += `Avec seulement ${camerasCount} caméra(s), la couverture est insuffisante. J'ai identifié ${blindSpots} zones non couvertes importantes.`;
          } else if (camerasCount < 6) {
            resultMessage += `Avec ${camerasCount} caméras, la couverture est moyenne. Il reste environ ${blindSpots} zones qui pourraient bénéficier d'une surveillance supplémentaire.`;
          } else {
            resultMessage += `Avec ${camerasCount} caméras, la couverture est bonne. Les zones critiques sont bien surveillées.`;
          }
          break;
          
        case 'optimize_cameras':
          // Optimiser la disposition des caméras existantes
          // Dans une implémentation réelle, on ajusterait les positions et paramètres des caméras
          
          resultMessage = 'J\'ai optimisé la disposition de vos caméras pour améliorer la couverture. Les angles et distances de vue ont été ajustés pour minimiser les zones aveugles.';
          break;
          
        case 'clear_cameras':
          // Supprimer toutes les caméras de la page
          clearCurrentPage();
          resultMessage = 'Toutes les caméras ont été supprimées de la page actuelle.';
          break;
          
        default:
          resultMessage = 'Action non reconnue.';
      }
      
      // Ajouter un message de confirmation
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: resultMessage,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
      // Mettre à jour les suggestions
      updateSuggestions();
      
      // Supprimer l'action des actions en attente
      setPendingActions(prev => prev.filter(a => a !== action));
      
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Désolé, une erreur est survenue lors de l\'exécution de cette action. Veuillez réessayer.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Fonction pour formater la date
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Contenu du drawer
  const drawerContent = (
    <Box sx={{ 
      width: isMobile ? '100vw' : 350, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
            <AIIcon />
          </Avatar>
          <Typography variant="h6">Assistant IA</Typography>
        </Box>
        <IconButton onClick={toggleDrawer} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '100%'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                maxWidth: '80%',
                bgcolor: msg.sender === 'user' ? 'primary.light' : 'background.paper',
                color: msg.sender === 'user' ? 'white' : 'text.primary'
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </Typography>
              
              {/* Afficher les actions proposées par l'IA */}
              {msg.sender === 'ai' && msg.actions && msg.actions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Actions suggérées:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {msg.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        onClick={() => executeAIAction(action)}
                        disabled={actionInProgress}
                        startIcon={
                          action.type === 'add_camera' ? <CameraIcon /> :
                          action.type === 'analyze_plan' ? <SearchIcon /> :
                          action.type === 'optimize_cameras' ? <MagicIcon /> :
                          <CommentIcon />
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
              
              <Typography variant="caption" color={msg.sender === 'user' ? 'white' : 'text.secondary'} sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                {formatTime(msg.timestamp)}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        {/* Indicateur de chargement pendant l'exécution d'une action */}
        {actionInProgress && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Exécution en cours...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ p: 2 }}>
        {suggestions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1,
                cursor: 'pointer'
              }}
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Suggestions
              </Typography>
              {showSuggestions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Box>
            
            {showSuggestions && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestions.map((suggestion) => (
                  <Box
                    key={suggestion.id}
                    onClick={suggestion.action}
                    sx={{
                      p: 1,
                      borderRadius: 4,
                      border: 1,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Typography variant="body2">
                      {suggestion.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        
        {!pdfFile && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Veuillez charger un plan PDF pour utiliser toutes les fonctionnalités de l'assistant.
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Posez votre question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            size="small"
            disabled={isLoading || actionInProgress}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={!message.trim() || isLoading || actionInProgress}
            sx={{ alignSelf: 'flex-end' }}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
  
  return (
    <>
      <Tooltip 
        title="Assistant IA" 
        placement="left"
        TransitionComponent={Zoom}
      >
        <Fab 
          color="primary" 
          aria-label="AI Assistant"
          onClick={toggleDrawer}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            zIndex: 1000
          }}
        >
          <AIIcon />
        </Fab>
      </Tooltip>
      
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={isOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            height: isMobile ? '80vh' : '100%',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AIAssistant;
