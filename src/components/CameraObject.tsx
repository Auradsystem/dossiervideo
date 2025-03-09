import React from 'react';
import { Group, Circle, Wedge, Text, Transformer, Path } from 'react-konva';
import { Camera, cameraIcons } from '../types/Camera';
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
  const wedgeRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const getCameraIcon = () => {
    const scale = camera.width / 24; // Scale factor based on camera width
    
    // Utiliser l'icône personnalisée si disponible
    if (camera.iconPath) {
      return (
        <Path
          data={camera.iconPath}
          fill="#ffffff"
          scaleX={scale}
          scaleY={scale}
          offsetX={12}
          offsetY={12}
        />
      );
    }
    
    // Sinon, utiliser l'icône prédéfinie pour le type de caméra
    const iconData = cameraIcons[camera.type] || cameraIcons.dome;
    
    return (
      <>
        <Circle
          radius={camera.width / 2}
          fill={iconData.color}
          stroke="#000"
          strokeWidth={1}
          opacity={0.9}
        />
        <Path
          data={iconData.path}
          fill="#ffffff"
          scaleX={scale}
          scaleY={scale}
          offsetX={12}
          offsetY={12}
        />
      </>
    );
  };

  const handleDragEnd = (e: any) => {
    console.log(`Caméra déplacée: ${camera.id} à la position (${e.target.x()}, ${e.target.y()})`);
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
    
    console.log(`Caméra redimensionnée: ${camera.id}, nouvelle taille: ${Math.max(5, camera.width * scaleX)} x ${Math.max(5, camera.height * scaleY)}`);
    updateCamera(camera.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, camera.width * scaleX),
      height: Math.max(5, camera.height * scaleY)
    });
  };

  // Fonction pour gérer la rotation du champ de vision
  const handleRotate = (e: any) => {
    if (!wedgeRef.current) return;
    
    const rotation = wedgeRef.current.rotation();
    console.log(`Caméra tournée: ${camera.id}, nouvelle rotation: ${rotation}°`);
    updateCamera(camera.id, {
      rotation: rotation
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={camera.x}
        y={camera.y}
        draggable
        onClick={() => {
          console.log(`Caméra sélectionnée: ${camera.id}`);
          setSelectedCamera(camera.id);
        }}
        onTap={() => setSelectedCamera(camera.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Camera view angle - avec rotation correcte */}
        <Wedge
          ref={wedgeRef}
          radius={camera.viewDistance}
          angle={camera.angle}
          fill="rgba(255, 0, 0, 0.3)"
          stroke="rgba(255, 0, 0, 0.6)"
          strokeWidth={1}
          rotation={camera.rotation || -camera.angle / 2}
          opacity={camera.opacity}
          draggable={isSelected}
          onDragEnd={handleRotate}
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
