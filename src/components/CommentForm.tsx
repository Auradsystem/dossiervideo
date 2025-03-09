import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  FormControlLabel,
  Checkbox
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
  
  // Si un commentaire est sélectionné, charger son texte
  useEffect(() => {
    if (selectedComment) {
      const comment = comments.find(c => c.id === selectedComment);
      if (comment) {
        setText(comment.text);
        setAttachToCamera(!!comment.cameraId);
      }
    } else {
      setText('');
      setAttachToCamera(!!selectedCamera);
    }
  }, [selectedComment, comments, selectedCamera]);

  const handleSubmit = () => {
    if (text.trim() === '') return;
    
    if (selectedComment) {
      // Mise à jour d'un commentaire existant
      updateComment(selectedComment, {
        text,
        cameraId: attachToCamera ? selectedCamera : undefined
      });
    } else if (position) {
      // Création d'un nouveau commentaire
      addComment(
        position.x, 
        position.y, 
        text,
        attachToCamera ? selectedCamera : undefined
      );
    }
    
    onClose();
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
