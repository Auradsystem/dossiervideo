import React, { useEffect, useRef } from 'react';
import { Box, Dialog, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import { X, Download, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface PdfPreviewProps {
  open: boolean;
  onClose: () => void;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ open, onClose }) => {
  const { previewUrl, exportPdf } = useAppContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ajuster la taille de l'iframe au contenu
  useEffect(() => {
    if (open && iframeRef.current && previewUrl) {
      const iframe = iframeRef.current;
      iframe.onload = () => {
        try {
          // Essayer d'ajuster la hauteur de l'iframe au contenu
          if (iframe.contentWindow) {
            const height = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = `${height}px`;
          }
        } catch (e) {
          console.error('Erreur lors de l\'ajustement de l\'iframe:', e);
        }
      };
    }
  }, [open, previewUrl]);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    exportPdf();
  };

  if (!previewUrl) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="lg"
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
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6">Aperçu avant impression</Typography>
        <Box>
          <IconButton onClick={handlePrint} title="Imprimer">
            <Printer size={20} />
          </IconButton>
          <IconButton onClick={handleDownload} title="Télécharger">
            <Download size={20} />
          </IconButton>
          <IconButton onClick={onClose} edge="end">
            <X size={20} />
          </IconButton>
        </Box>
      </Box>
      
      <DialogContent sx={{ 
        p: 0, 
        flexGrow: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'auto',
          bgcolor: '#f0f0f0'
        }}>
          <iframe
            ref={iframeRef}
            src={previewUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
            title="Aperçu PDF"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
        <Button onClick={handleDownload} variant="contained" color="primary" startIcon={<Download size={16} />}>
          Télécharger
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfPreview;
