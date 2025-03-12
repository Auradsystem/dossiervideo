import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, IconButton, Slider, Button } from '@mui/material';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Trash2, MessageSquare } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Stage, Layer } from 'react-konva';
import { useAppContext } from '../context/AppContext';
import CameraObject from './CameraObject';
import CommentObject from './CommentObject';
import CommentForm from './CommentForm';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer: React.FC = () => {
  const { 
    pdfFile, 
    cameras, 
    addCamera, 
    scale, 
    setScale,
    page,
    setPage,
    totalPages,
    setTotalPages,
    clearCurrentPage,
    comments,
    isAddingComment,
    setIsAddingComment,
    selectedComment,
    setSelectedComment,
    deleteComment
  } = useAppContext();
  
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfPageRendered, setPdfPageRendered] = useState<HTMLCanvasElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number, y: number } | null>(null);
  const [commentFormOpen, setCommentFormOpen] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<any>(null);

  // Load PDF document when file changes
  useEffect(() => {
    if (!pdfFile) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        console.log('Chargement du PDF...');
        const fileArrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setPage(1);
        console.log(`PDF chargé avec ${pdf.numPages} pages`);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfFile, setTotalPages, setPage]);

  // Render PDF page when page or scale changes
  useEffect(() => {
    if (!pdfDocument) return;

    const renderPage = async () => {
      try {
        setIsLoading(true);
        console.log(`Rendu de la page ${page} avec échelle ${scale}`);
        const pdfPage = await pdfDocument.getPage(page);
        const viewport = pdfPage.getViewport({ scale });
        
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await pdfPage.render({
          canvasContext: context,
          viewport,
        }).promise;
        
        setPdfPageRendered(canvas);
        setStageSize({
          width: viewport.width,
          height: viewport.height
        });
        console.log(`Page ${page} rendue avec succès`);
      } catch (error) {
        console.error(`Erreur lors du rendu de la page ${page}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    renderPage();
  }, [pdfDocument, page, scale]);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setStageSize(prev => ({
          ...prev,
          containerWidth: width,
          containerHeight: height
        }));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handlePrevPage = () => {
    if (page > 1) {
      console.log(`Navigation vers la page ${page - 1}`);
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      console.log(`Navigation vers la page ${page + 1}`);
      setPage(page + 1);
    }
  };

  const handleStageClick = (e: any) => {
    // Récupérer la cible du clic
    const clickTarget = e.target;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    // Si on est en mode ajout de commentaire
    if (isAddingComment && pointerPosition) {
      console.log(`Ajout d'un commentaire à la position (${pointerPosition.x}, ${pointerPosition.y})`);
      setCommentPosition(pointerPosition);
      setCommentFormOpen(true);
      return;
    }
    
    // Si on clique directement sur le stage (pas sur une caméra ou un commentaire)
    if (clickTarget === stage) {
      if (pointerPosition) {
        console.log(`Ajout d'une caméra à la position (${pointerPosition.x}, ${pointerPosition.y}) sur la page ${page}`);
        addCamera(pointerPosition.x, pointerPosition.y, 'dome');
      }
      // Désélectionner le commentaire
      if (selectedComment) {
        setSelectedComment(null);
      }
    }
  };

  const handleClearPage = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les caméras et commentaires de la page ${page} ?`)) {
      console.log(`Suppression de toutes les caméras et commentaires de la page ${page}`);
      clearCurrentPage();
    }
  };

  const handleAddComment = () => {
    setIsAddingComment(true);
  };

  const handleDeleteComment = () => {
    if (selectedComment && window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      deleteComment(selectedComment);
    }
  };

  const handleEditComment = () => {
    if (selectedComment) {
      setCommentFormOpen(true);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        position: 'relative'
      }}
    >
      {!pdfFile ? (
        <Paper 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 4
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
              alt="Blueprint" 
              style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px', borderRadius: '8px' }}
            />
            <Typography variant="h5" gutterBottom>
              Aucun plan chargé
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Utilisez le bouton "Charger PDF" pour importer un plan
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          <Box 
            ref={containerRef}
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              position: 'relative',
              bgcolor: '#e0e0e0'
            }}
          >
            {isLoading && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 10
                }}
              >
                <Typography variant="h6">Chargement...</Typography>
              </Box>
            )}
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100%',
                p: 2
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <canvas ref={canvasRef} style={{ display: 'block' }} />
                {pdfPageRendered && (
                  <Stage 
                    ref={stageRef}
                    width={stageSize.width} 
                    height={stageSize.height}
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0,
                      pointerEvents: 'auto',
                      cursor: isAddingComment ? 'crosshair' : 'default'
                    }}
                    onClick={handleStageClick}
                    className="konvajs-content"
                  >
                    <Layer>
                      {cameras.map(camera => (
                        <CameraObject 
                          key={camera.id} 
                          camera={camera} 
                        />
                      ))}
                      {comments.map(comment => (
                        <CommentObject
                          key={comment.id}
                          comment={comment}
                        />
                      ))}
                    </Layer>
                  </Stage>
                )}
              </Box>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1, 
              borderTop: 1, 
              borderColor: 'divider',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut size={20} />
              </IconButton>
              <Slider
                value={scale}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(_, value) => setScale(value as number)}
                sx={{ width: 100, mx: 1 }}
              />
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn size={20} />
              </IconButton>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {Math.round(scale * 100)}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Button
                startIcon={<MessageSquare size={16} />}
                color="primary"
                variant={isAddingComment ? "contained" : "outlined"}
                size="small"
                onClick={handleAddComment}
                sx={{ mr: 1 }}
              >
                {isAddingComment ? "Placer commentaire" : "Ajouter commentaire"}
              </Button>
              
              {selectedComment && (
                <>
                  <Button
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={handleEditComment}
                    sx={{ mr: 1 }}
                  >
                    Modifier
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    onClick={handleDeleteComment}
                    sx={{ mr: 1 }}
                  >
                    Supprimer
                  </Button>
                </>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Button
                startIcon={<Trash2 size={16} />}
                color="error"
                variant="outlined"
                size="small"
                onClick={handleClearPage}
                sx={{ mr: 2 }}
                disabled={cameras.length === 0 && comments.length === 0}
              >
                Effacer la page
              </Button>
              
              <IconButton 
                onClick={handlePrevPage} 
                disabled={page <= 1}
                size="small"
              >
                <ChevronLeft size={20} />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                Page {page} / {totalPages}
              </Typography>
              <IconButton 
                onClick={handleNextPage} 
                disabled={page >= totalPages}
                size="small"
              >
                <ChevronRight size={20} />
              </IconButton>
            </Box>
          </Paper>
          
          {/* Formulaire d'ajout/modification de commentaire */}
          <CommentForm
            open={commentFormOpen}
            onClose={() => {
              setCommentFormOpen(false);
              setIsAddingComment(false);
            }}
            position={commentPosition}
          />
        </>
      )}
    </Box>
  );
};

export default PdfViewer;
