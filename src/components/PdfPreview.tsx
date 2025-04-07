import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogContent, DialogActions, Button, IconButton, Slider, Typography, CircularProgress } from '@mui/material';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PdfPreview: React.FC = () => {
  const { previewUrl, isPreviewOpen, setIsPreviewOpen, scale } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  // Synchroniser l'échelle avec le document de travail à l'ouverture
  useEffect(() => {
    if (isPreviewOpen) {
      setPreviewScale(scale);
      setIsLoading(true);
    }
  }, [scale, isPreviewOpen]);

  // Gérer le chargement de l'iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    if (iframeRef.current && containerRef.current) {
      try {
        // Accéder au document dans l'iframe pour obtenir les dimensions réelles du PDF
        const iframeDocument = iframeRef.current.contentDocument || 
                              (iframeRef.current.contentWindow?.document);
                              
        if (iframeDocument) {
          const pdfElement = iframeDocument.querySelector('embed') || 
                            iframeDocument.body;
          
          if (pdfElement) {
            // Récupérer les dimensions naturelles
            const naturalWidth = pdfElement.scrollWidth;
            const naturalHeight = pdfElement.scrollHeight;
            
            setPdfDimensions({
              width: naturalWidth,
              height: naturalHeight
            });
            
            // Ajustement automatique pour la meilleure visualisation
            if (containerRef.current) {
              const container = containerRef.current;
              const containerWidth = container.clientWidth - 40; // Soustraire le padding
              const containerHeight = container.clientHeight - 40;
              
              // Calculer le ratio pour s'adapter correctement
              const widthRatio = containerWidth / naturalWidth;
              const heightRatio = containerHeight / naturalHeight;
              const fitRatio = Math.min(widthRatio, heightRatio, 1); // Ne pas agrandir au-delà de 100%
              
              setPreviewScale(fitRatio);
            }
          }
        }
      } catch (e) {
        console.error("Erreur lors de l'accès au contenu de l'iframe:", e);
      }
    }
  };

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFitToScreen = () => {
    if (containerRef.current && pdfDimensions.width > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;
      
      const widthRatio = containerWidth / pdfDimensions.width;
      const heightRatio = containerHeight / pdfDimensions.height;
      const fitRatio = Math.min(widthRatio, heightRatio, 1);
      
      setPreviewScale(fitRatio);
    }
  };

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
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOut size={20} />
          </IconButton>
          <Slider
            value={previewScale}
            min={0.1}
            max={3}
            step={0.05}
            onChange={(_, value) => setPreviewScale(value as number)}
            sx={{ width: 100 }}
          />
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomIn size={20} />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '50px' }}>
            {Math.round(previewScale * 100)}%
          </Typography>
          <IconButton onClick={handleFitToScreen} size="small" title="Ajuster à l'écran">
            <Maximize size={18} />
          </IconButton>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>
      
      <DialogContent 
        ref={containerRef}
        sx={{ 
          p: 2, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {isLoading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {previewUrl && (
          <Box sx={{ 
            width: '100%', 
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto'
          }}>
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'center center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100%',
                minWidth: '100%'
              }}
            >
              <iframe
                ref={iframeRef}
                src={previewUrl}
                onLoad={handleIframeLoad}
                style={{
                  width: pdfDimensions.width > 0 ? pdfDimensions.width : '100%',
                  height: pdfDimensions.height > 0 ? pdfDimensions.height : '100%',
                  border: 'none',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'white'
                }}
                title="PDF Preview"
              />
            </div>
          </Box>
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
