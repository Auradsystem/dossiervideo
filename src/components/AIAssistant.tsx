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
  Zoom
} from '@mui/material';
import { 
  Send as SendIcon, 
  SmartToy as AIIcon,
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as MagicIcon,
  CameraAlt as CameraIcon,
  Comment as CommentIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

// Types pour les messages
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Types pour les suggestions
interface Suggestion {
  id: string;
  text: string;
  action: () => void;
}

const AIAssistant: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cameras, comments, pdfFile, addCamera, addComment } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
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
          text: 'Bonjour ! Je suis votre assistant IA pour PlanCam. Comment puis-je vous aider aujourd\'hui ?',
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
    const newSuggestions: Suggestion[] = [
      {
        id: '1',
        text: 'Comment ajouter une caméra ?',
        action: () => handleSuggestionClick('Comment ajouter une caméra sur le plan ?')
      },
      {
        id: '2',
        text: 'Analyser la disposition des caméras',
        action: () => handleSuggestionClick('Peux-tu analyser la disposition actuelle des caméras ?')
      }
    ];
    
    // Ajouter des suggestions contextuelles
    if (cameras.length > 0) {
      newSuggestions.push({
        id: '3',
        text: `Optimiser les ${cameras.length} caméras`,
        action: () => handleSuggestionClick(`Comment optimiser la disposition de mes ${cameras.length} caméras ?`)
      });
    }
    
    if (pdfFile) {
      newSuggestions.push({
        id: '4',
        text: 'Analyser le plan actuel',
        action: () => handleSuggestionClick('Peux-tu analyser le plan actuel et suggérer des emplacements pour les caméras ?')
      });
    }
    
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
      // Simuler une réponse de l'IA (à remplacer par l'appel API à GPT-4o)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Générer une réponse basée sur le message
      const aiResponse = generateAIResponse(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Mettre à jour les suggestions après la réponse
      updateSuggestions();
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'IA:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue lors de la communication avec l\'IA. Veuillez réessayer.',
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
    // Option: envoyer automatiquement le message
    // setMessage('');
    // 
    // const userMessage: Message = {
    //   id: Date.now().toString(),
    //   text: suggestionText,
    //   sender: 'user',
    //   timestamp: new Date()
    // };
    // 
    // setMessages(prev => [...prev, userMessage]);
    // handleSendMessage();
  };
  
  // Fonction pour générer une réponse simulée (à remplacer par l'API GPT-4o)
  const generateAIResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('ajouter une caméra')) {
      return 'Pour ajouter une caméra, cliquez simplement sur le plan à l\'endroit où vous souhaitez la placer. Vous pouvez ensuite ajuster ses propriétés comme l\'angle de vue, la distance et le type de caméra dans le panneau latéral.';
    } else if (lowerCaseMessage.includes('analyser') && lowerCaseMessage.includes('caméra')) {
      return `J'ai analysé vos ${cameras.length} caméras actuelles. La couverture semble ${cameras.length > 5 ? 'bonne' : 'limitée'}. Je recommande d'ajouter des caméras supplémentaires aux entrées principales et dans les zones sans surveillance.`;
    } else if (lowerCaseMessage.includes('optimiser')) {
      return 'Pour optimiser la disposition de vos caméras, je recommande de : \n1. Placer les caméras en hauteur (2.5-3m) \n2. Éviter les obstacles dans le champ de vision \n3. Assurer un chevauchement de 15-20% entre les zones couvertes \n4. Utiliser des caméras PTZ pour les grandes zones ouvertes';
    } else if (lowerCaseMessage.includes('plan')) {
      return 'J\'ai analysé votre plan. Je suggère de placer des caméras aux entrées principales, aux intersections de couloirs et dans les espaces ouverts. Voulez-vous que je vous aide à positionner automatiquement quelques caméras ?';
    } else if (lowerCaseMessage.includes('merci') || lowerCaseMessage.includes('super')) {
      return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.';
    } else {
      return 'Je comprends votre demande. Pour vous aider plus efficacement avec PlanCam, pourriez-vous me donner plus de détails sur ce que vous souhaitez faire avec vos plans et caméras ?';
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
              <Typography variant="caption" color={msg.sender === 'user' ? 'white' : 'text.secondary'} sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                {formatTime(msg.timestamp)}
              </Typography>
            </Paper>
          </Box>
        ))}
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
              {showSuggestions ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
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
            disabled={isLoading}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={!message.trim() || isLoading}
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
