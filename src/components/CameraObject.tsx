import React from 'react';
import { Group, Circle, Wedge, Text, Rect, Transformer, Path } from 'react-konva';
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

  // SVG paths for camera icons
  const domeCameraPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 10 7 10zm8 0c.83 0 1.5-.67 1.5-1.5S15.83 8 15 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-.5 7.5c3.04 0 5.5-2.46 5.5-5.5H9c0 3.04 2.46 5.5 5.5 5.5z";
  const bulletCameraPath = "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6z";
  const ptzCameraPath = "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6z M12 13.5a0.5 0.5 0 1 0 0-1 0.5 0.5 0 0 0 0 1z";

  const getCameraIcon = () => {
    const scale = camera.width / 24; // Scale factor based on camera width
    
    switch (camera.type) {
      case 'dome':
        return (
          <>
            <Circle
              radius={camera.width / 2}
              fill="#1976d2"
              stroke="#000"
              strokeWidth={1}
              opacity={0.8}
            />
            <Path
              data={domeCameraPath}
              fill="#ffffff"
              scaleX={scale}
              scaleY={scale}
              offsetX={12}
              offsetY={12}
            />
          </>
        );
      case 'bullet':
        return (
          <>
            <Rect
              width={camera.width}
              height={camera.height * 0.7}
              offsetX={camera.width / 2}
              offsetY={camera.height * 0.35}
              fill="#dc004e"
              stroke="#000"
              strokeWidth={1}
              cornerRadius={2}
              opacity={0.8}
            />
            <Path
              data={bulletCameraPath}
              fill="#ffffff"
              scaleX={scale}
              scaleY={scale}
              offsetX={12}
              offsetY={12}
            />
          </>
        );
      case 'ptz':
        return (
          <>
            <Circle
              radius={camera.width / 2}
              fill="#4caf50"
              stroke="#000"
              strokeWidth={1}
              opacity={0.8}
            />
            <Path
              data={ptzCameraPath}
              fill="#ffffff"
              scaleX={scale}
              scaleY={scale}
              offsetX={12}
              offsetY={12}
            />
          </>
        );
      default:
        return (
          <>
            <Circle
              radius={camera.width / 2}
              fill="#1976d2"
              stroke="#000"
              strokeWidth={1}
              opacity={0.8}
            />
            <Path
              data={bulletCameraPath}
              fill="#ffffff"
              scaleX={scale}
              scaleY={scale}
              offsetX={12}
              offsetY={12}
            />
          </>
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
          fill="rgba(255, 255, 0, 0.3)"
          stroke="rgba(255, 255, 0, 0.6)"
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
