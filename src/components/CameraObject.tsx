import React from 'react';
import { Group, Circle, Wedge, Text, Rect, Transformer } from 'react-konva';
import { Camera } from '../types/Camera';
import { useAppContext } from '../context/AppContext';

interface CameraObjectProps {
  camera: Camera;
}

const CameraObject: React.FC<CameraObjectProps> = ({ camera }) => {
  const { 
    selectedCamera, 
    setSelectedCamera, 
    updateCamera 
  } = useAppContext();
  
  const isSelected = selectedCamera === camera.id;
  const transformerRef = React.useRef<any>(null);
  const groupRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const getCameraIcon = () => {
    switch (camera.type) {
      case 'dome':
        return (
          <Circle
            radius={camera.width / 2}
            fill="#1976d2"
            stroke="#000"
            strokeWidth={1}
          />
        );
      case 'bullet':
        return (
          <Rect
            width={camera.width}
            height={camera.height * 0.7}
            offsetX={camera.width / 2}
            offsetY={camera.height * 0.35}
            fill="#dc004e"
            stroke="#000"
            strokeWidth={1}
            cornerRadius={2}
          />
        );
      case 'ptz':
        return (
          <>
            <Circle
              radius={camera.width / 2}
              fill="#4caf50"
              stroke="#000"
              strokeWidth={1}
            />
            <Circle
              radius={camera.width / 4}
              fill="#fff"
              stroke="#000"
              strokeWidth={1}
            />
          </>
        );
      default:
        return (
          <Circle
            radius={camera.width / 2}
            fill="#1976d2"
            stroke="#000"
            strokeWidth={1}
          />
        );
    }
  };

  const handleDragEnd = (e: any) => {
    updateCamera(camera.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  const handleTransformEnd = (e: any) => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and apply it to width and height
    node.scaleX(1);
    node.scaleY(1);
    
    updateCamera(camera.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, camera.width * scaleX),
      height: Math.max(5, camera.height * scaleY)
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={camera.x}
        y={camera.y}
        draggable
        onClick={() => setSelectedCamera(camera.id)}
        onTap={() => setSelectedCamera(camera.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Camera view angle */}
        <Wedge
          radius={camera.viewDistance}
          angle={camera.angle}
          fill="rgba(255, 255, 0, 0.2)"
          stroke="rgba(255, 255, 0, 0.5)"
          strokeWidth={1}
          rotation={-camera.angle / 2}
          opacity={camera.opacity}
        />
        
        {/* Camera icon */}
        {getCameraIcon()}
        
        {/* Camera label */}
        <Text
          text={camera.name}
          fontSize={12}
          fill="#000"
          offsetX={-camera.width / 2}
          offsetY={-camera.height / 2 - 15}
          align="center"
          width={camera.width * 2}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CameraObject;
