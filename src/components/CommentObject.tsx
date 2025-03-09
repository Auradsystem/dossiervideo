import React from 'react';
import { Group, Text, Rect, Circle, Transformer } from 'react-konva';
import { Comment } from '../types/Comment';
import { useAppContext } from '../context/AppContext';

interface CommentObjectProps {
  comment: Comment;
}

const CommentObject: React.FC<CommentObjectProps> = ({ comment }) => {
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
  const textWidth = comment.text.length * 7; // Approximation
  const width = Math.max(100, textWidth + 20);
  const height = 40;

  return (
    <>
      <Group
        ref={groupRef}
        x={comment.x}
        y={comment.y}
        draggable
        onClick={() => {
          console.log(`Commentaire sélectionné: ${comment.id}`);
          setSelectedComment(comment.id);
          // Désélectionner la caméra si un commentaire est sélectionné
          if (selectedCamera) {
            setSelectedCamera(null);
          }
        }}
        onTap={() => setSelectedComment(comment.id)}
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
        {isSelected && (
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
              fontSize={14}
              fill="#000"
              width={width - 20}
              height={height - 20}
              wrap="word"
            />
          </>
        )}
      </Group>
      
      {isSelected && (
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
