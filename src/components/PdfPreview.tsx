import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogContent, DialogActions, Button, IconButton, Slider, Typography, CircularProgress, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { X, ZoomIn, ZoomOut, Maximize, Link, AlertCircle, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PdfPreview: React.FC = () => {
  const { previewUrl, isPreviewOpen, setIsPreviewOpen, scale, setScale, exportCurrentPage } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(true);
  const [scaleChanged, setScaleChanged] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Observer pour détecter les changements de taille du conteneur
  useEffect(() => {
    if (!containerRef.current || !isPreviewOpen) return;

    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    // Mettre à jour la taille initiale
    updateContainerSize();

    // Créer un ResizeObserver pour surveiller les changements de taille
    const resizeObserver = new ResizeObserver(updateContainerSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isPreviewOpen]);

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
  }, [previewScale, isSyncEnabled, isPreviewOpen, isLoading, scale, setScale]);

  // Gérer le chargement de l'iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    if (iframeRef.current && containerRef.current) {
      try {
        // Accéder au document dans l'iframe pour obtenir les dimensions réelles du PDF
        const iframeDocument = iframeRef.current.contentDocument || 
                              (iframeRef.current.contentWindow?.document);
                              
        if (iframeDocument) {
          // Modifier le style du document pour supprimer les marges
          const style = iframeDocument.createElement('style');
          style.textContent = `
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              width: 100% !important;
              height: 100% !important;
              background-color: white !important;
            }
            embed, object, iframe {
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
            }
          `;
          iframeDocument.head.appendChild(style);
          
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
            
            // Appliquer automatiquement l'ajustement à l'écran
            setTimeout(handleFitToScreen, 100);
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
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
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

  const handleExport = () => {
    exportCurrentPage();
  };

  return (
    <Dialog
      open={isPreviewOpen}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '95vh',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          m: 0,
          borderRadius: 0
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
                <Tooltip title={isSyncEnabled ? "Synchronisation activée" : "Synchronisation désactivée"}>
                  <Link 
                    size={16} 
                    style={{ 
                      marginRight: 4,
                      opacity: isSyncEnabled ? 1 : 0.4,
                      color: isSyncEnabled ? undefined : '#999'
                    }} 
                  />
                </Tooltip>
                <Typography variant="body2">Sync</Typography>
              </Box>
            }
            sx={{ ml: 1 }}
          />
          <Button
            startIcon={<Download size={16} />}
            variant="outlined"
            size="small"
            onClick={handleExport}
            sx={{ ml: 2 }}
          >
            Exporter
          </Button>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>
      
      <DialogContent 
        ref={containerRef}
        sx={{ 
          p: 0,
          m: 0,
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: '#ffffff',
          width: '100%',
          height: '100%'
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
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'center center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%'
              }}
            >
              <iframe
                ref={iframeRef}
                src={previewUrl}
                onLoad={handleIframeLoad}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'white',
                  display: 'block'
                }}
                title="PDF Preview"
                frameBorder="0"
                scrolling="no"
              />
            </div>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        p: 1
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
