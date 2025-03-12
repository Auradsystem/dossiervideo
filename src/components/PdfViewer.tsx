import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Stage, Layer, Image as KonvaImage, Group } from 'react-konva';
import { ZoomIn, ZoomOut, Add as AddIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import CameraObject from './CameraObject';
import CommentForm from './CommentForm';
import { createDefaultCamera } from '../types/Camera';

// Déclaration pour pdfjsLib qui est chargé globalement
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PdfViewer: React.FC = () => {
  const { pdfFile, cameras, addCamera } = useAppContext();
  
  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour charger le PDF sous forme d'image
  useEffect(() => {
    if (!pdfFile) return;
    
    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Si pdfFile est une chaîne (URL), la convertir en File
        let file: File;
        if (typeof pdfFile === 'string') {
          const response = await fetch(pdfFile);
          const blob = await response.blob();
          file = new File([blob], 'document.pdf', { type: 'application/pdf' });
        } else {
          file = pdfFile;
        }
        
        // Convertir le PDF en image
        const pdfUrl = URL.createObjectURL(file);
        
        // Vérifier si pdfjsLib est disponible
        if (!window.pdfjsLib) {
          throw new Error("PDF.js n'est pas chargé. Veuillez vous assurer que la bibliothèque est correctement importée.");
        }
        
        // Utiliser un canvas pour rendre la première page du PDF
        const pdfjsLib = window.pdfjsLib;
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error("Impossible de créer un contexte de canvas 2D");
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Créer une image à partir du canvas
        const image = new Image();
        image.src = canvas.toDataURL();
        
        image.onload = () => {
          setPdfImage(image);
          setIsLoading(false);
        };
      } catch (error: any) {
        console.error('Erreur lors du chargement du PDF:', error);
        setError('Impossible de charger le PDF: ' + error.message);
        setIsLoading(false);
      }
    };
    
    loadPdf();
  }, [pdfFile]);
  
  // Ajuster la taille du stage en fonction de la taille du conteneur
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  // Fonction pour zoomer
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setScale(prev => Math.min(prev + 0.1, 3));
    } else {
      setScale(prev => Math.max(prev - 0.1, 0.5));
    }
  };
  
  // Fonction pour ajouter une caméra
  const handleAddCamera = () => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    
    if (pointerPosition) {
      const { x, y } = pointerPosition;
      
      // Créer une nouvelle caméra à la position du clic
      const newCamera = createDefaultCamera('dome', x, y);
      
      // Ajouter la caméra au contexte
      addCamera(newCamera);
    }
  };
  
  // Fonction pour gérer le clic sur le stage
  const handleStageClick = (e: any) => {
    // Si l'utilisateur a cliqué sur un élément (caméra, commentaire, etc.), ne pas ajouter de commentaire
    if (e.target !== e.currentTarget) {
      return;
    }
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointerPosition = stage.getPointerPosition();
    
    if (pointerPosition) {
      setCommentPosition(pointerPosition);
      setShowCommentForm(true);
    }
  };
  
  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Barre d'outils */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 2,
          p: 0.5
        }}
      >
        <Tooltip title="Zoomer">
          <IconButton onClick={() => handleZoom('in')} size="small">
            <ZoomIn />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Dézoomer">
          <IconButton onClick={() => handleZoom('out')} size="small">
            <ZoomOut />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Ajouter une caméra">
          <IconButton onClick={handleAddCamera} size="small" color="primary">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Affichage du PDF */}
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'error.main'
          }}
        >
          {error}
        </Box>
      ) : !pdfFile ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'text.secondary'
          }}
        >
          Aucun PDF sélectionné. Veuillez charger un PDF depuis le gestionnaire de projets.
        </Box>
      ) : (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scale={{ x: scale, y: scale }}
          draggable
          onClick={handleStageClick}
        >
          <Layer>
            {pdfImage && (
              <KonvaImage
                image={pdfImage}
                x={(stageSize.width / scale - pdfImage.width) / 2}
                y={(stageSize.height / scale - pdfImage.height) / 2}
              />
            )}
            
            {/* Afficher les caméras */}
            <Group>
              {cameras.map(camera => (
                <CameraObject key={camera.id} camera={camera} />
              ))}
            </Group>
            
            {/* Afficher les commentaires */}
            <Group>
              {/* Ici, vous pouvez ajouter les commentaires */}
            </Group>
          </Layer>
        </Stage>
      )}
      
      {/* Formulaire de commentaire */}
      {showCommentForm && (
        <CommentForm
          position={commentPosition}
          onClose={() => setShowCommentForm(false)}
          onSubmit={(text) => {
            // Ajouter le commentaire
            console.log('Nouveau commentaire:', text, commentPosition);
            setShowCommentForm(false);
          }}
        />
      )}
    </Box>
  );
};

export default PdfViewer;
