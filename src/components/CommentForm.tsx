import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Box,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface CommentFormProps {
  position: { x: number, y: number };
  onSubmit: (text: string) => void;
  onCancel: () => void;
  stageOffset: { x: number, y: number };
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  position, 
  onSubmit, 
  onCancel,
  stageOffset
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Calculer la position absolue du formulaire
  const formPosition = {
    x: position.x + stageOffset.x,
    y: position.y + stageOffset.y
  };
  
  // Focus sur le champ de texte lors du montage
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: formPosition.x,
        top: formPosition.y,
        width: isMobile ? 250 : 300,
        p: 2,
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton 
          size="small" 
          onClick={onCancel}
          sx={{ p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <TextField
          inputRef={inputRef}
          multiline
          rows={3}
          placeholder="Ajouter un commentaire..."
          variant="outlined"
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            type="submit"
            disabled={!text.trim()}
          >
            Ajouter
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CommentForm;
