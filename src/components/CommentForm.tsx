import React, { useState } from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';

interface CommentFormProps {
  position: { x: number; y: number };
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ position, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };
  
  return (
    <Paper
      sx={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: 300,
        p: 2,
        zIndex: 1000,
        boxShadow: 3
      }}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Ajouter un commentaire..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
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
