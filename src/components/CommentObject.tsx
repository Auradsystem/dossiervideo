import React, { useRef, useEffect } from 'react';
import { Group, Text, Rect, Circle, Line, Transformer } from 'react-konva';
import { useAppContext } from '../context/AppContext';
import { Comment } from '../types/Comment';

interface CommentObjectProps {
  comment: Comment;
  isSelected: boolean;
}

const CommentObject: React.FC<CommentObjectProps> = ({ comment, isSelected }) => {
  const { updateComment, setSelectedComment, selectedCamera, setSelectedCamera, selectedLogo, setSelectedLogo } = useAppContext();
  
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  
  // Calculer la largeur du texte pour dimensionner le rectangle
  const [textWidth, setTextWidth] = React.useState(200);
  const [textHeight, setTextHeight] = React.useState(30);
  
  useEffect(() => {
    if (textRef.current) {
      const textNode = textRef.current;
      const newWidth = Math.max(200, textNode.width() + 40);
      const newHeight = Math.max(30, textNode.height() + 20);
      setTextWidth(newWidth);
      setTextHeight(newHeight);
    }
  }, [comment.text]);
  
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    updateComment(comment.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  const handleTransformEnd = (e: any) => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Réinitialiser l'échelle et mettre à jour les dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    updateComment(comment.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(100, textWidth * scaleX),
      height: Math.max(30, textHeight * scaleY),
      rotation: node.rotation()
    });
  };

  // Effet de pulsation pour les commentaires non sélectionnés
  const [scale, setScale] = React.useState(1);
  const [increasing, setIncreasing] = React.useState(true);
  
  useEffect(() => {
    if (!isSelected) {
      const interval = setInterval(() => {
        setScale(prevScale => {
          if (prevScale >= 1.05) {
            setIncreasing(false);
            return prevScale - 0.005;
          } else if (prevScale <= 0.95) {
            setIncreasing(true);
            return prevScale + 0.005;
          } else {
            return increasing ? prevScale + 0.005 : prevScale - 0.005;
          }
        });
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setScale(1);
    }
  }, [isSelected, increasing]);

  // Couleurs et styles
  const bgColor = comment.color || '#FFD700';
  const textColor = '#000000';
  const shadowColor = 'rgba(0, 0, 0, 0.3)';
  const shadowBlur = 5;
  const shadowOffset = { x: 2, y: 2 };
  const cornerRadius = 8;
  
  // Calculer la position de la ligne et du point d'ancrage
  const anchorX = comment.anchorX || comment.x;
  const anchorY = comment.anchorY || comment.y + textHeight;
  
  return (
    <>
      <Group
        ref={groupRef}
        x={comment.x}
        y={comment.y}
        draggable
        rotation={comment.rotation || 0}
        onClick={() => {
          setSelectedComment(comment.id);
          // Désélectionner les autres éléments
          if (selectedCamera) setSelectedCamera(null);
          if (selectedLogo) setSelectedLogo(null);
        }}
        onTap={() => setSelectedComment(comment.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        scaleX={isSelected ? 1 : scale}
        scaleY={isSelected ? 1 : scale}
      >
        {/* Ligne reliant le commentaire à son point d'ancrage */}
        <Line
          points={[textWidth / 2, textHeight, anchorX - comment.x, anchorY - comment.y]}
          stroke="#555"
          strokeWidth={1.5}
          dash={[5, 2]}
        />
        
        {/* Point d'ancrage */}
        <Circle
          x={anchorX - comment.x}
          y={anchorY - comment.y}
          radius={5}
          fill={bgColor}
          stroke="#555"
          strokeWidth={1}
        />
        
        {/* Fond du commentaire avec ombre */}
        <Rect
          width={textWidth}
          height={textHeight}
          fill={bgColor}
          cornerRadius={cornerRadius}
          shadowColor={shadowColor}
          shadowBlur={shadowBlur}
          shadowOffsetX={shadowOffset.x}
          shadowOffsetY={shadowOffset.y}
          opacity={0.9}
        />
        
        {/* Texte du commentaire */}
        <Text
          ref={textRef}
          text={comment.text}
          fontSize={14}
          fontFamily="Arial"
          fill={textColor}
          width={textWidth - 20}
          height={textHeight - 10}
          align="center"
          verticalAlign="middle"
          padding={10}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limiter la taille minimale
            if (newBox.width < 100 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CommentObject;
