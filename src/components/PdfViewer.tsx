import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group } from 'react-konva';
import { Box, CircularProgress, Typography, IconButton, Paper, useMediaQuery, useTheme } from '@mui/material';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useAppContext } from '../context/AppContext';
import CameraObject from './CameraObject';
import CommentObject from './CommentObject';
import CommentForm from './CommentForm';

// Workaround for PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    pdfFile,
    cameras,
    addCamera,
    selectedCamera,
    setSelectedCamera,
    scale,
    setScale,
    page,
    setPage,
    totalPages,
    setTotalPages,
    comments,
    addComment,
    selectedComment,
    setSelectedComment,
    isAddingComment,
    setIsAddingComment
  } = useAppContext();

  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentPosition, setCommentPosition] = useState<{ x: number, y: number } | null>(null);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour redimensionner le stage en fonction de la taille du conteneur
  const resizeStage = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Ajuster les dimensions du stage
      if (pdfImage) {
        const imgWidth = pdfImage.width * scale;
        const imgHeight = pdfImage.height * scale;
        
        // Calculer les dimensions pour que l'image s'adapte au conteneur
        const newWidth = Math.min(containerWidth, imgWidth);
        const newHeight = Math.min(containerHeight, imgHeight);
        
        setDimensions({
          width: newWidth,
          height: newHeight
        });
      } else {
        setDimensions({
          width: containerWidth,
          height: containerHeight
        });
      }
    }
  };

  // Effet pour redimensionner le stage lors du chargement et du redimensionnement de la fenêtre
  useEffect(() => {
    resizeStage();
    window.addEventListener('resize', resizeStage);
    
    return () => {
      window.removeEventListener('resize', resizeStage);
    };
  }, [pdfImage, scale]);

  // Effet pour charger le PDF lorsque le fichier change
  useEffect(() => {
    if (pdfFile) {
      loadPdf();
    }
  }, [pdfFile, page]);

  // Fonction pour charger le PDF
  const loadPdf = async () => {
    if (!pdfFile) return;

    setLoading(true);
    setError(null);

    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        try {
          const typedArray = new Uint8Array(this.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument(typedArray);
          const pdf = await loadingTask.promise;
          
          setTotalPages(pdf.numPages);
          
          // Vérifier que la page demandée est valide
          const currentPage = Math.min(Math.max(1, page), pdf.numPages);
          if (currentPage !== page) {
            setPage(currentPage);
          }
          
          const pdfPage = await pdf.getPage(currentPage);
          const viewport = pdfPage.getViewport({ scale: 1.5 });
          
          // Créer un canvas pour le rendu du PDF
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Impossible de créer un contexte 2D');
          }
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Rendre la page PDF sur le canvas
          await pdfPage.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Convertir le canvas en image
          const image = new Image();
          image.src = canvas.toDataURL();
          
          image.onload = () => {
            setPdfImage(image);
            resizeStage();
            setLoading(false);
          };
          
        } catch (err) {
          console.error('Erreur lors du chargement du PDF:', err);
          setError('Erreur lors du chargement du PDF. Veuillez réessayer.');
          setLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setError('Erreur lors de la lecture du fichier. Veuillez réessayer.');
        setLoading(false);
      };
      
      fileReader.readAsArrayBuffer(pdfFile);
      
    } catch (err) {
      console.error('Erreur lors du chargement du PDF:', err);
      setError('Erreur lors du chargement du PDF. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Fonction pour gérer le clic sur le stage
  const handleStageClick = (e: any) => {
    // Obtenir la position du clic
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    // Si on est en mode ajout de commentaire
    if (isAddingComment) {
      setCommentPosition({
        x: pointerPosition.x,
        y: pointerPosition.y
      });
      return;
    }
    
    // Si on a cliqué sur le fond (et non sur une caméra ou un commentaire)
    if (e.target === e.currentTarget) {
      // Désélectionner la caméra et le commentaire actuels
      setSelectedCamera(null);
      setSelectedComment(null);
      
      // Si double-clic, ajouter une caméra
      if (e.evt.detail === 2 && pdfImage) {
        addCamera(pointerPosition.x, pointerPosition.y, 'dome');
      }
    }
  };

  // Fonction pour zoomer
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    setScale(Math.min(Math.max(0.5, scale * factor), 3));
  };

  // Fonction pour réinitialiser le zoom
  const handleResetZoom = () => {
    setScale(1);
  };

  // Fonction pour changer de page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Fonction pour annuler l'ajout de commentaire
  const handleCancelComment = () => {
    setIsAddingComment(false);
    setCommentPosition(null);
  };

  // Fonction pour soumettre un commentaire
  const handleSubmitComment = (text: string) => {
    if (commentPosition && text.trim()) {
      addComment(commentPosition.x, commentPosition.y, text);
      setCommentPosition(null);
    }
  };

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Contrôles de navigation */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 1, 
          mb: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => handlePageChange(page - 1)} 
            disabled={page <= 1 || loading}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <RotateCcw size={isSmallScreen ? 16 : 20} style={{ transform: 'rotate(90deg)' }} />
          </IconButton>
          
          <Typography variant="body2">
            Page {page} / {totalPages || 1}
          </Typography>
          
          <IconButton 
            onClick={() => handlePageChange(page + 1)} 
            disabled={page >= totalPages || loading}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <RotateCcw size={isSmallScreen ? 16 : 20} style={{ transform: 'rotate(-90deg)' }} />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => handleZoom('out')} 
            disabled={loading}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <ZoomOut size={isSmallScreen ? 16 : 20} />
          </IconButton>
          
          <Typography variant="body2" sx={{ minWidth: isSmallScreen ? 40 : 60, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <IconButton 
            onClick={() => handleZoom('in')} 
            disabled={loading}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <ZoomIn size={isSmallScreen ? 16 : 20} />
          </IconButton>
          
          <IconButton 
            onClick={handleResetZoom} 
            disabled={loading}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <RotateCcw size={isSmallScreen ? 16 : 20} />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Conteneur du stage */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'grey.100'
      }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress />
            <Typography variant="body2">Chargement du PDF...</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            maxWidth: '80%'
          }}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        )}
        
        {!pdfFile && !loading && !error && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            maxWidth: '80%'
          }}>
            <Typography variant="body1">
              Veuillez charger un fichier PDF pour commencer.
            </Typography>
          </Box>
        )}
        
        {pdfImage && !loading && (
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            ref={stageRef}
            onClick={handleStageClick}
            style={{ 
              cursor: isAddingComment ? 'crosshair' : 'default',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Layer>
              <KonvaImage
                image={pdfImage}
                width={pdfImage.width * scale}
                height={pdfImage.height * scale}
                x={(dimensions.width - pdfImage.width * scale) / 2}
                y={(dimensions.height - pdfImage.height * scale) / 2}
              />
              
              {/* Groupe pour les caméras */}
              <Group
                x={(dimensions.width - pdfImage.width * scale) / 2}
                y={(dimensions.height - pdfImage.height * scale) / 2}
              >
                {cameras.map((camera) => (
                  <CameraObject
                    key={camera.id}
                    camera={camera}
                    isSelected={camera.id === selectedCamera}
                    scale={scale}
                  />
                ))}
              </Group>
              
              {/* Groupe pour les commentaires */}
              <Group
                x={(dimensions.width - pdfImage.width * scale) / 2}
                y={(dimensions.height - pdfImage.height * scale) / 2}
              >
                {comments.map((comment) => (
                  <CommentObject
                    key={comment.id}
                    comment={comment}
                    isSelected={comment.id === selectedComment}
                    scale={scale}
                  />
                ))}
              </Group>
            </Layer>
          </Stage>
        )}
        
        {/* Formulaire de commentaire */}
        {commentPosition && (
          <CommentForm
            position={commentPosition}
            onSubmit={handleSubmitComment}
            onCancel={handleCancelComment}
            stageOffset={{
              x: (dimensions.width - (pdfImage?.width || 0) * scale) / 2,
              y: (dimensions.height - (pdfImage?.height || 0) * scale) / 2
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default PdfViewer;
