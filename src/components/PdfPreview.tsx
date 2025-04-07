import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogContent, DialogActions, Button, IconButton, Slider, Typography } from '@mui/material';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PdfPreview: React.FC = () => {
  const { previewUrl, isPreviewOpen, setIsPreviewOpen, scale } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

  // Synchroniser l'échelle avec le document de travail à l'ouverture
  useEffect(() => {
    setPreviewScale(scale);
  }, [scale, isPreviewOpen]);

  // Ajuster l'échelle pour respecter les proportions d'origine
  useEffect(() => {
    if (containerRef.current && isPreviewOpen) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Ajuster dynamiquement pour maintenir l'échelle correcte
      setContentSize({
        width: containerWidth,
        height: containerHeight
      });
    }
  }, [isPreviewOpen, previewScale]);

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.1, 0.5));
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
            min={0.5}
            max={3}
            step={0.1}
            onChange={(_, value) => setPreviewScale(value as number)}
            sx={{ width: 100 }}
          />
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomIn size={20} />
          </IconButton>
          <Typography variant="body2">
            {Math.round(previewScale * 100)}%
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>
      
      <DialogContent 
        ref={containerRef}
        sx={{ 
          p: 0, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {previewUrl && (
          <Box sx={{ 
            width: '100%', 
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'auto',
            padding: 2
          }}>
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'center top',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: contentSize.height / previewScale,
                  border: 'none',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
