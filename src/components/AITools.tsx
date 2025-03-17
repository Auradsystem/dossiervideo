import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

interface AIToolsProps {
  onClose: () => void;
  open: boolean;
}

const AITools: React.FC<AIToolsProps> = ({ onClose, open }) => {
  const { pdfFile } = useAppContext();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          Outils d'analyse
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Fonctionnalité en développement
          </Typography>
          <Typography variant="body1" paragraph>
            Les outils d'analyse avancés seront disponibles dans une prochaine version.
          </Typography>
          {!pdfFile && (
            <Typography variant="body2" color="text.secondary">
              Veuillez d'abord charger un plan PDF pour utiliser cette fonctionnalité.
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AITools;
