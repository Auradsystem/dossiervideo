import React from 'react';
import { Group, Text, Rect, Circle, Transformer } from 'react-konva';
import { Comment } from '../types/Comment';
import { useAppContext } from '../context/AppContext';

interface CommentObjectProps {
  comment: Comment;
  forExport?: boolean;
}

const CommentObject: React.FC<CommentObjectProps> = ({ comment, forExport = false }) => {
  const { 
    selectedComment, 
    setSelectedComment, 
    updateComment,
    selectedCamera,
    setSelectedCamera
  } = useAppContext();
  
  const isSelected = selectedComment === comment.id;
  const transformerRef = React.useRef<any>(null);
  const groupRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    console.log(`Commentaire déplacé: ${comment.id} à la position (${e.target.x()}, ${e.target.y()})`);
    updateComment(comment.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // Calculer la largeur du texte pour dimensionner correctement le rectangle
  const fontSize = comment.fontSize || 14; // Utiliser la taille de police du commentaire ou 14 par défaut
  const textWidth = comment.text.length * (fontSize / 2); // Ajuster en fonction de la taille de police
  const width = Math.max(100, textWidth + 20);
  const height = Math.max(40, fontSize * 2.5); // Ajuster la hauteur en fonction de la taille de police

  // Toujours afficher le commentaire complet lors de l'export
  const shouldShowFull = isSelected || forExport;

  return (
    <>
      <Group
        ref={groupRef}
        x={comment.x}
        y={comment.y}
        draggable={!forExport}
        onClick={() => {
          if (forExport) return; // Désactiver les interactions lors de l'export
          console.log(`Commentaire sélectionné: ${comment.id}`);
          setSelectedComment(comment.id);
          // Désélectionner la caméra si un commentaire est sélectionné
          if (selectedCamera) {
            setSelectedCamera(null);
          }
        }}
        onTap={() => !forExport && setSelectedComment(comment.id)}
        onDragEnd={handleDragEnd}
      >
        {/* Indicateur de commentaire */}
        <Circle
          radius={10}
          fill={comment.color}
          stroke="#000"
          strokeWidth={1}
          opacity={0.9}
        />
        
        {/* Bulle de commentaire */}
        {shouldShowFull && (
          <>
            <Rect
              x={15}
              y={-height / 2}
              width={width}
              height={height}
              fill="#fff"
              stroke={comment.color}
              strokeWidth={2}
              cornerRadius={5}
              shadowColor="rgba(0,0,0,0.3)"
              shadowBlur={5}
              shadowOffsetX={2}
              shadowOffsetY={2}
            />
            <Text
              x={25}
              y={-height / 2 + 10}
              text={comment.text}
              fontSize={fontSize}
              fill="#000"
              width={width - 20}
              height={height - 20}
              wrap="word"
            />
          </>
        )}
      </Group>
      
      {isSelected && !forExport && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[]}
          boundBoxFunc={(oldBox, newBox) => {
            // Empêcher le redimensionnement
            return oldBox;
          }}
        />
      )}
    </>
  );
};

export default CommentObject;
