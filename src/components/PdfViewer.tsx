import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useAppContext } from '../context/AppContext';
import CameraObject from './CameraObject';
import CommentObject from './CommentObject';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import CommentForm from './CommentForm';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoObject from './LogoObject';
import LogoSelector from './LogoSelector';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer: React.FC = () => {
  const {
    pdfFile,
    cameras,
    scale,
    setScale,
    page,
    setPage,
    totalPages,
    setTotalPages,
    selectedCamera,
    setSelectedCamera,
    addCamera,
    selectedIconType,
    comments,
    selectedComment,
    setSelectedComment,
    isAddingComment,
    setIsAddingComment,
    deleteComment,
    logos,
    selectedLogo,
    setSelectedLogo,
    addLogo
  } = useAppContext();

  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [commentFormOpen, setCommentFormOpen] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number, y: number } | null>(null);
  const [logoSelectorOpen, setLogoSelectorOpen] = useState(false);
  const [logoPosition, setLogoPosition] = useState<{ x: number, y: number } | null>(null);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && pdfDimensions.width > 0) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = containerWidth / pdfDimensions.width * 0.9;
        setScale(Math.min(newScale, 1));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDimensions, setScale]);

  // Fonction pour gérer le chargement réussi d'une page PDF
  const handlePageLoadSuccess = (page: any) => {
    const viewport = page._transport._pageInfo.view;
    const width = viewport[2];
    const height = viewport[3];
    
    setPdfDimensions({ width, height });
    
    // Ajuster l'échelle en fonction de la taille du conteneur
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const newScale = containerWidth / width * 0.9;
      setScale(Math.min(newScale, 1));
    }
    
    // Capturer l'image du canvas PDF
    setTimeout(() => {
      const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      if (canvas) {
        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => setImage(img);
      }
    }, 100);
  };

  // Fonction pour gérer le clic sur le stage
  const handleStageClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      // Si on est en mode ajout de commentaire
      if (isAddingComment) {
        const pointerPosition = stageRef.current.getPointerPosition();
        setCommentPosition({
          x: pointerPosition.x / scale,
          y: pointerPosition.y / scale
        });
        setCommentFormOpen(true);
        return;
      }
      
      setSelectedCamera(null);
      setSelectedComment(null);
      setSelectedLogo(null);
    }
  };

  // Fonction pour gérer le double-clic sur le stage
  const handleStageDblClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();
      
      // Convertir les coordonnées en tenant compte de l'échelle
      const x = pointerPosition.x / scale;
      const y = pointerPosition.y / scale;
      
      addCamera(x, y, selectedIconType);
    }
  };

  // Fonction pour gérer la touche Suppr
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedComment) {
        deleteComment(selectedComment);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComment, deleteComment]);

  // Fonction pour ajouter un logo
  const handleAddLogo = () => {
    if (stageRef.current) {
      const pointerPosition = stageRef.current.getPointerPosition();
      setLogoPosition({
        x: pointerPosition.x / scale,
        y: pointerPosition.y / scale
      });
      setLogoSelectorOpen(true);
    }
  };

  // Fonction pour sélectionner un logo
  const handleLogoSelect = (logoId: string) => {
    if (logoPosition) {
      addLogo(logoId, logoPosition.x, logoPosition.y);
      setLogoSelectorOpen(false);
      setLogoPosition(null);
    }
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', overflow: 'auto', position: 'relative' }}>
      {pdfFile ? (
        <>
          <Document
            file={pdfFile}
            onLoadSuccess={(pdf) => setTotalPages(pdf.numPages)}
            options={{
              cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/cmaps/',
              cMapPacked: true,
            }}
          >
            <Page
              pageNumber={page}
              onLoadSuccess={handlePageLoadSuccess}
              width={pdfDimensions.width * scale}
              height={pdfDimensions.height * scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          
          {image && (
            <Stage
              ref={stageRef}
              width={pdfDimensions.width * scale}
              height={pdfDimensions.height * scale}
              onClick={handleStageClick}
              onDblClick={handleStageDblClick}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'auto'
              }}
              scaleX={scale}
              scaleY={scale}
            >
              <Layer>
                <KonvaImage
                  image={image}
                  width={pdfDimensions.width}
                  height={pdfDimensions.height}
                  listening={false}
                />
                
                {/* Afficher les logos */}
                {logos.map(logo => (
                  <LogoObject
                    key={logo.id}
                    logo={logo}
                    isSelected={selectedLogo === logo.id}
                  />
                ))}
                
                {/* Afficher les caméras */}
                {cameras.map(camera => (
                  <CameraObject
                    key={camera.id}
                    camera={camera}
                    isSelected={selectedCamera === camera.id}
                  />
                ))}
                
                {/* Afficher les commentaires */}
                {comments.map(comment => (
                  <CommentObject
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </Layer>
            </Stage>
          )}
          
          {/* Contrôles flottants */}
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
            <Tooltip title="Ajouter un commentaire">
              <IconButton
                color={isAddingComment ? "primary" : "default"}
                onClick={() => setIsAddingComment(!isAddingComment)}
                sx={{ bgcolor: 'background.paper' }}
              >
                <AddCommentIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Ajouter un logo">
              <IconButton
                onClick={handleAddLogo}
                sx={{ bgcolor: 'background.paper' }}
              >
                <img 
                  src="/logo-icon.svg" 
                  alt="Logo" 
                  style={{ width: 24, height: 24 }} 
                />
              </IconButton>
            </Tooltip>
            
            {selectedComment && (
              <Tooltip title="Supprimer le commentaire">
                <IconButton
                  color="error"
                  onClick={() => deleteComment(selectedComment)}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {/* Formulaire de commentaire */}
          <CommentForm
            open={commentFormOpen}
            onClose={() => {
              setCommentFormOpen(false);
              setIsAddingComment(false);
            }}
            position={commentPosition}
          />
          
          {/* Sélecteur de logo */}
          <LogoSelector
            open={logoSelectorOpen}
            onClose={() => setLogoSelectorOpen(false)}
            onSelect={handleLogoSelect}
          />
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <p>Veuillez charger un fichier PDF</p>
        </Box>
      )}
    </Box>
  );
};

export default PdfViewer;
