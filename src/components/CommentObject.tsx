import React from 'react';
import { Group, Circle, Text, Transformer } from 'react-konva';
import { Comment } from '../types/Comment';
import { useAppContext } from '../context/AppContext';

interface CommentObjectProps {
  comment: Comment;
}

const CommentObject: React.FC<CommentObjectProps> = ({ comment }) => {
  const { updateComment, deleteComment } = useAppContext();
  const [isSelected, setIsSelected] = React.useState(false);
  const groupRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  
  React.useEffect(() => {
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
  
  return (
    <>
      <Group
        ref={groupRef}
        x={comment.x}
        y={comment.y}
        draggable
        onClick={() => setIsSelected(true)}
        onTap={() => setIsSelected(true)}
        onDragEnd={handleDragEnd}
      >
        <Circle
          radius={15}
          fill={comment.resolved ? '#4CAF50' : '#FFC107'}
          stroke="#000"
          strokeWidth={1}
        />
        <Text
          text="!"
          fontSize={16}
          fill="#000"
          align="center"
          verticalAlign="middle"
          width={30}
          height={30}
          offsetX={15}
          offsetY={15}
        />
        <Text
          text={comment.text}
          fontSize={12}
          fill="#000"
          align="left"
          width={200}
          offsetX={-20}
          offsetY={-30}
          padding={5}
          background="#fff"
          visible={isSelected}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
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
