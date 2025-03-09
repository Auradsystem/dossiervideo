import React, { useEffect, useRef } from 'react';
import { Box, Dialog, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PdfPreview: React.FC = () => {
  const { previewUrl, isPreviewOpen, setIsPreviewOpen } = useAppContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ajuster la taille de l'iframe quand le PDF est chargé
    if (iframeRef.current && previewUrl) {
      const iframe = iframeRef.current;
      iframe.onload = () => {
        try {
          // Essayer d'ajuster l'iframe au contenu
          if (iframe.contentWindow) {
            iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`;
          }
        } catch (e) {
          console.error('Erreur lors de l\'ajustement de l\'iframe:', e);
        }
      };
    }
  }, [previewUrl]);

  const handleClose = () => {
    setIsPreviewOpen(false);
  };

  return (
    <Dialog
      open={isPreviewOpen}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        p: 1, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ 
        p: 0, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {previewUrl && (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              flexGrow: 1
            }}
            title="PDF Preview"
          />
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button onClick={handleClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfPreview;
