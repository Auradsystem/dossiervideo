import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  Box
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

interface CommentFormProps {
  open: boolean;
  onClose: () => void;
  position: { x: number, y: number } | null;
}

const CommentForm: React.FC<CommentFormProps> = ({ open, onClose, position }) => {
  const { 
    addComment, 
    updateComment, 
    selectedComment, 
    comments,
    selectedCamera
  } = useAppContext();
  
  const [text, setText] = useState('');
  const [attachToCamera, setAttachToCamera] = useState(false);
  const [fontSize, setFontSize] = useState(14); // Taille de police par défaut
  
  // Si un commentaire est sélectionné, charger son texte et sa taille de police
  useEffect(() => {
    if (selectedComment) {
      const comment = comments.find(c => c.id === selectedComment);
      if (comment) {
        setText(comment.text);
        setAttachToCamera(!!comment.cameraId);
        setFontSize(comment.fontSize || 14);
      }
    } else {
      setText('');
      setAttachToCamera(!!selectedCamera);
      setFontSize(14);
    }
  }, [selectedComment, comments, selectedCamera]);

  const handleSubmit = () => {
    if (text.trim() === '') return;
    
    if (selectedComment) {
      // Mise à jour d'un commentaire existant
      updateComment(selectedComment, {
        text,
        fontSize,
        cameraId: attachToCamera ? selectedCamera : undefined
      });
    } else if (position) {
      // Création d'un nouveau commentaire
      addComment(
        position.x, 
        position.y, 
        text,
        attachToCamera ? selectedCamera : undefined,
        fontSize
      );
    }
    
    onClose();
  };

  const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
    setFontSize(newValue as number);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {selectedComment ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Texte du commentaire"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
        />
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography gutterBottom>
            Taille de police: {fontSize}px
          </Typography>
          <Slider
            value={fontSize}
            onChange={handleFontSizeChange}
            aria-labelledby="font-size-slider"
            step={1}
            marks
            min={10}
            max={24}
            valueLabelDisplay="auto"
          />
        </Box>
        
        {selectedCamera && (
          <FormControlLabel
            control={
              <Checkbox
                checked={attachToCamera}
                onChange={(e) => setAttachToCamera(e.target.checked)}
                color="primary"
              />
            }
            label="Attacher à la caméra sélectionnée"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {selectedComment ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentForm;
