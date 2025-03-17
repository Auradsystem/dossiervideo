import React from 'react';
import { 
  Box, 
  Drawer, 
  Typography, 
  IconButton,
  Fab,
  Tooltip,
  Zoom,
  Button
} from '@mui/material';
import { 
  SmartToy as AIIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { pdfFile } = useAppContext();
  
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      <Tooltip 
        title="Assistant" 
        placement="left"
        TransitionComponent={Zoom}
      >
        <Fab 
          color="primary" 
          aria-label="Assistant"
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
        anchor="right"
        open={isOpen}
        onClose={toggleDrawer}
      >
        <Box sx={{ 
          width: 300,
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
            <Typography variant="h6">Assistant</Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h6" gutterBottom>
              Fonctionnalité en développement
            </Typography>
            <Typography variant="body1" paragraph>
              L'assistant sera disponible dans une prochaine version.
            </Typography>
            {!pdfFile && (
              <Typography variant="body2" color="text.secondary">
                Veuillez d'abord charger un plan PDF pour utiliser cette fonctionnalité.
              </Typography>
            )}
          </Box>
          
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={toggleDrawer}
            >
              Fermer
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;
