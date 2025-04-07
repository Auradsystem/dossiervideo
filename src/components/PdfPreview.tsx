import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogContent, DialogActions, Button, IconButton, Slider, Typography, CircularProgress, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { X, ZoomIn, ZoomOut, Maximize, Link, LinkOff, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PdfPreview: React.FC = () => {
  const { previewUrl, isPreviewOpen, setIsPreviewOpen, scale, setScale } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(true);
  const [scaleChanged, setScaleChanged] = useState<boolean>(false);

  // Synchroniser l'échelle du document de travail vers la prévisualisation à l'ouverture
  useEffect(() => {
    if (isPreviewOpen) {
      setPreviewScale(scale);
      setIsLoading(true);
      setScaleChanged(false);
    }
  }, [scale, isPreviewOpen]);

  // Synchroniser l'échelle de la prévisualisation vers le document de travail
  useEffect(() => {
    if (isPreviewOpen && isSyncEnabled && !isLoading && previewScale !== scale) {
      setScale(previewScale);
      setScaleChanged(true);
      
      // Réinitialiser l'indicateur de changement après 2 secondes
      const timer = setTimeout(() => {
        setScaleChanged(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [previewScale, isSyncEnabled, isPreviewOpen, isLoading]);

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
            
            // Nous ne faisons plus d'ajustement automatique initial
            // pour garantir que la prévisualisation corresponde exactement au document de travail
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

  const toggleSync = () => {
    setIsSyncEnabled(!isSyncEnabled);
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
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '70px' }}>
            <Typography variant="body2">
              {Math.round(previewScale * 100)}%
            </Typography>
            {scaleChanged && (
              <Tooltip title="Échelle appliquée au document de travail">
                <AlertCircle size={16} color="green" style={{ marginLeft: 4 }} />
              </Tooltip>
            )}
          </Box>
          <IconButton onClick={handleFitToScreen} size="small" title="Ajuster à l'écran">
            <Maximize size={18} />
          </IconButton>
          <FormControlLabel
            control={
              <Switch
                checked={isSyncEnabled}
                onChange={toggleSync}
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', ml: -1 }}>
                {isSyncEnabled ? (
                  <Tooltip title="Synchronisation activée">
                    <Link size={16} style={{ marginRight: 4 }} />
                  </Tooltip>
                ) : (
                  <Tooltip title="Synchronisation désactivée">
                    <LinkOff size={16} style={{ marginRight: 4 }} />
                  </Tooltip>
                )}
                <Typography variant="body2">Sync</Typography>
              </Box>
            }
            sx={{ ml: 1 }}
          />
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
      
      <DialogActions sx={{ 
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Typography variant="body2" color={isSyncEnabled ? 'primary' : 'text.secondary'} sx={{ ml: 2 }}>
          {isSyncEnabled 
            ? "Les modifications d'échelle sont synchronisées avec le document de travail" 
            : "Mode de prévisualisation indépendant"}
        </Typography>
        <Button onClick={handleClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfPreview;
