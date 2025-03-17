import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Rect, Text } from 'react-konva';
import { Box, CircularProgress, IconButton, Tooltip, Paper, Zoom, Slider, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, ChevronsUpDown, MousePointer, Camera, StickyNote, Image } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CameraObject from './CameraObject';
import LogoObject from './LogoObject';
import CommentObject from './CommentObject';
import PDFComponents from './PDFComponents';
import LogoSelector from './LogoSelector';

const PdfViewer: React.FC = () => {
  const { 
    pdfFile, 
    numPages, 
    setNumPages, 
    currentPage, 
    setCurrentPage,
    cameras,
    logos,
    comments,
    selectedCamera,
    selectedLogo,
    selectedComment,
    addCamera,
    addLogo,
    addComment,
    namingPattern,
    nextCameraNumber,
    setNextCameraNumber,
    selectedIconType
  } = useAppContext();
  
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [tool, setTool] = useState<'select' | 'camera' | 'comment' | 'logo'>('select');
  const [showLogoSelector, setShowLogoSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(50);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfLayerRef = useRef<any>(null);
  
  // Effet pour animer l'entrée des caméras
  useEffect(() => {
    if (cameras.length > 0 && !showAnimation) {
      setShowAnimation(true);
    }
  }, [cameras.length]);
  
  // Fonction pour gérer le redimensionnement de la fenêtre
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      // Ajuster la taille du stage en fonction de la taille du conteneur
      if (stageRef.current) {
        stageRef.current.width(width);
        stageRef.current.height(height);
        stageRef.current.batchDraw();
      }
    }
  }, []);
  
  // Ajouter un écouteur de redimensionnement
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  // Fonction pour gérer le chargement réussi du PDF
  const handleDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    setLoading(false);
  };
  
  // Fonction pour gérer le chargement réussi d'une page
  const handlePageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfDimensions({
      width: viewport.width,
      height: viewport.height
    });
    
    // Centrer le PDF dans la vue
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const scaleX = width / viewport.width;
      const scaleY = height / viewport.height;
      const newScale = Math.min(scaleX, scaleY) * 0.9;
      
      setScale(newScale);
      setPosition({
        x: (width - viewport.width * newScale) / 2,
        y: (height - viewport.height * newScale) / 2
      });
    }
  };
  
  // Fonction pour gérer les erreurs de chargement du PDF
  const handleDocumentLoadError = (error: Error) => {
    console.error('Erreur lors du chargement du PDF:', error);
    setLoading(false);
  };
  
  // Fonction pour gérer le zoom
  const handleZoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = Math.max(0.1, Math.min(5, prevScale + delta));
      
      // Ajuster la position pour zoomer vers le centre
      if (containerRef.current && pdfDimensions.width > 0) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        
        const mousePointTo = {
          x: (centerX - position.x) / prevScale,
          y: (centerY - position.y) / prevScale
        };
        
        const newPos = {
          x: centerX - mousePointTo.x * newScale,
          y: centerY - mousePointTo.y * newScale
        };
        
        setPosition(newPos);
      }
      
      return newScale;
    });
  };
  
  // Fonction pour gérer le déplacement du PDF
  const handleDragStart = () => {
    if (tool === 'select') {
      setIsDragging(true);
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragMove = (e: any) => {
    if (isDragging && tool === 'select') {
      setPosition({
        x: e.target.x(),
        y: e.target.y()
      });
    }
  };
  
  // Fonction pour gérer les clics sur le stage
  const handleStageClick = (e: any) => {
    // Ignorer les clics sur les objets existants
    if (e.target !== e.currentTarget && e.target !== pdfLayerRef.current) {
      return;
    }
    
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    const x = (pointerPosition.x - position.x) / scale;
    const y = (pointerPosition.y - position.y) / scale;
    
    if (tool === 'camera') {
      // Ajouter une nouvelle caméra
      const newCamera = {
        id: crypto.randomUUID(),
        name: `${namingPattern}${nextCameraNumber}`,
        x,
        y,
        width: 30,
        height: 30,
        angle: 90,
        viewDistance: 150,
        opacity: 0.7,
        type: selectedIconType
      };
      
      addCamera(newCamera);
      setNextCameraNumber(nextCameraNumber + 1);
      setTool('select');
    } else if (tool === 'comment') {
      // Ajouter un nouveau commentaire
      const newComment = {
        id: crypto.randomUUID(),
        text: 'Nouveau commentaire',
        x,
        y,
        width: 200,
        height: 50,
        color: '#FFD700',
        anchorX: x,
        anchorY: y + 50
      };
      
      addComment(newComment);
      setTool('select');
    } else if (tool === 'logo') {
      // Ouvrir le sélecteur de logo
      setShowLogoSelector(true);
    }
  };
  
  // Fonction pour ajouter un logo après sélection
  const handleLogoSelect = (logoUrl: string) => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    const x = (pointerPosition.x - position.x) / scale;
    const y = (pointerPosition.y - position.y) / scale;
    
    const newLogo = {
      id: crypto.randomUUID(),
      url: logoUrl,
      x,
      y,
      width: 100,
      height: 50
    };
    
    addLogo(newLogo);
    setShowLogoSelector(false);
    setTool('select');
  };
  
  // Fonction pour dessiner la grille
  const renderGrid = () => {
    if (!showGrid || !pdfDimensions.width || !pdfDimensions.height) return null;
    
    const gridLines = [];
    const scaledGridSize = gridSize;
    
    // Lignes verticales
    for (let x = 0; x <= pdfDimensions.width; x += scaledGridSize) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, pdfDimensions.height]}
          stroke="rgba(0, 0, 255, 0.2)"
          strokeWidth={0.5}
        />
      );
    }
    
    // Lignes horizontales
    for (let y = 0; y <= pdfDimensions.height; y += scaledGridSize) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, pdfDimensions.width, y]}
          stroke="rgba(0, 0, 255, 0.2)"
          strokeWidth={0.5}
        />
      );
    }
    
    return gridLines;
  };
  
  // Effet d'animation pour les caméras
  const [cameraOpacity, setCameraOpacity] = useState(0);
  
  useEffect(() => {
    if (showAnimation) {
      let opacity = 0;
      const interval = setInterval(() => {
        opacity += 0.05;
        setCameraOpacity(opacity);
        
        if (opacity >= 1) {
          clearInterval(interval);
          setShowAnimation(false);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [showAnimation]);
  
  // Rendu conditionnel pour le chargement ou l'absence de PDF
  if (!pdfFile) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          bgcolor: '#f5f5f5'
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucun plan PDF chargé
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Utilisez le menu latéral pour charger un plan PDF
        </Typography>
      </Box>
    );
  }
  
  if (loading) {
    return (
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
    );
  }
  
  // Composant pour les lignes de la grille
  const Line = ({ points, stroke, strokeWidth }: any) => (
    <KonvaImage
      image={(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const [x1, y1, x2, y2] = points;
        const width = Math.abs(x2 - x1) || 1;
        const height = Math.abs(y2 - y1) || 1;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.beginPath();
        ctx.moveTo(x1 < x2 ? 0 : width, y1 < y2 ? 0 : height);
        ctx.lineTo(x1 < x2 ? width : 0, y1 < y2 ? height : 0);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
        
        const img = new window.Image();
        img.src = canvas.toDataURL();
        return img;
      })()}
      x={Math.min(points[0], points[2])}
      y={Math.min(points[1], points[3])}
      width={Math.abs(points[2] - points[0]) || 1}
      height={Math.abs(points[3] - points[1]) || 1}
    />
  );
  
  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        bgcolor: '#f0f0f0',
        '&:hover .controls': {
          opacity: 1
        }
      }}
    >
      <Stage
        ref={stageRef}
        width={containerRef.current?.clientWidth || window.innerWidth}
        height={containerRef.current?.clientHeight || window.innerHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          <Group
            ref={pdfLayerRef}
            x={position.x}
            y={position.y}
            scaleX={scale}
            scaleY={scale}
            draggable={tool === 'select'}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
          >
            {/* Fond du PDF */}
            <Rect
              width={pdfDimensions.width}
              height={pdfDimensions.height}
              fill="#ffffff"
              shadowColor="rgba(0, 0, 0, 0.3)"
              shadowBlur={10}
              shadowOffsetX={5}
              shadowOffsetY={5}
              cornerRadius={5}
            />
            
            {/* Grille */}
            {renderGrid()}
            
            {/* Contenu du PDF */}
            {pdfFile && (
              <PDFComponents
                file={pdfFile}
                pageNumber={currentPage}
                onLoadSuccess={handleDocumentLoadSuccess}
                onPageLoadSuccess={handlePageLoadSuccess}
                onLoadError={handleDocumentLoadError}
                width={pdfDimensions.width}
              />
            )}
            
            {/* Logos */}
            {logos.map(logo => (
              <LogoObject
                key={logo.id}
                logo={logo}
                isSelected={selectedLogo === logo.id}
              />
            ))}
            
            {/* Caméras avec animation */}
            <Group opacity={showAnimation ? cameraOpacity : 1}>
              {cameras.map(camera => (
                <CameraObject
                  key={camera.id}
                  camera={camera}
                />
              ))}
            </Group>
            
            {/* Commentaires */}
            {comments.map(comment => (
              <CommentObject
                key={comment.id}
                comment={comment}
                isSelected={selectedComment === comment.id}
              />
            ))}
          </Group>
        </Layer>
      </Stage>
      
      {/* Contrôles flottants */}
      <Paper 
        elevation={3} 
        className="controls"
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          p: 1,
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 1000
        }}
      >
        <Tooltip title="Sélectionner" placement="left">
          <IconButton 
            color={tool === 'select' ? 'primary' : 'default'} 
            onClick={() => setTool('select')}
          >
            <MousePointer size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ajouter une caméra" placement="left">
          <IconButton 
            color={tool === 'camera' ? 'primary' : 'default'} 
            onClick={() => setTool('camera')}
          >
            <Camera size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ajouter un commentaire" placement="left">
          <IconButton 
            color={tool === 'comment' ? 'primary' : 'default'} 
            onClick={() => setTool('comment')}
          >
            <StickyNote size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ajouter un logo" placement="left">
          <IconButton 
            color={tool === 'logo' ? 'primary' : 'default'} 
            onClick={() => setTool('logo')}
          >
            <Image size={20} />
          </IconButton>
        </Tooltip>
        
        <Divider sx={{ my: 0.5 }} />
        
        <Tooltip title="Zoom avant" placement="left">
          <IconButton onClick={() => handleZoom(0.1)}>
            <ZoomIn size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom arrière" placement="left">
          <IconButton onClick={() => handleZoom(-0.1)}>
            <ZoomOut size={20} />
          </IconButton>
        </Tooltip>
        
        <Divider sx={{ my: 0.5 }} />
        
        <Tooltip title="Afficher/masquer la grille" placement="left">
          <IconButton 
            color={showGrid ? 'primary' : 'default'} 
            onClick={() => setShowGrid(!showGrid)}
          >
            <ChevronsUpDown size={20} />
          </IconButton>
        </Tooltip>
      </Paper>
      
      {/* Contrôle de la taille de la grille */}
      {showGrid && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            p: 2,
            width: 200,
            zIndex: 1000
          }}
        >
          <Typography variant="body2" gutterBottom>
            Taille de la grille: {gridSize}
          </Typography>
          <Slider
            value={gridSize}
            onChange={(_, value) => setGridSize(value as number)}
            min={10}
            max={100}
            step={5}
            valueLabelDisplay="auto"
          />
        </Paper>
      )}
      
      {/* Sélecteur de logo */}
      <LogoSelector
        open={showLogoSelector}
        onClose={() => setShowLogoSelector(false)}
        onSelect={handleLogoSelect}
      />
    </Box>
  );
};

export default PdfViewer;
