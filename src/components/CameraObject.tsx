import React, { useEffect, useRef } from 'react';
import { Group, Circle, Wedge, Text, Transformer, Path, Label, Tag } from 'react-konva';
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
  const transformerRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const labelRef = useRef<any>(null);
  
  // État de transformation pour suivre les changements
  const transformState = useRef({
    initialWidth: camera.width,
    initialHeight: camera.height,
    initialViewDistance: camera.viewDistance,
    initialRotation: camera.rotation || 0,
    scaleX: 1,
    scaleY: 1
  });
  
  // Mettre à jour le transformer quand la caméra est sélectionnée
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Mettre à jour la position du label quand la caméra change
  useEffect(() => {
    updateLabelPosition();
  }, [camera.x, camera.y, camera.width, camera.height, camera.rotation]);

  // Fonction pour mettre à jour la position du label
  const updateLabelPosition = () => {
    if (!labelRef.current) return;
    
    labelRef.current.position({
      x: camera.x,
      y: camera.y - camera.height/2 - 20
    });
    
    const textNode = labelRef.current.findOne('Text');
    if (textNode) {
      textNode.fontSize(Math.max(10, Math.min(16, camera.width * 0.4)));
      textNode.width(camera.width * 2);
      textNode.offsetX(camera.width);
    }
    
    labelRef.current.getLayer()?.batchDraw();
  };

  // Générer l'icône de caméra en fonction du type
  const getCameraIcon = () => {
    const scale = camera.width / 24;
    
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

  // Gestionnaires d'événements pour le déplacement
  const handleDragMove = (e: any) => {
    if (labelRef.current) {
      labelRef.current.position({
        x: e.target.x(),
        y: e.target.y() - camera.height/2 - 20
      });
      labelRef.current.getLayer()?.batchDraw();
    }
  };

  const handleDragEnd = (e: any) => {
    updateCamera(camera.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // Gestionnaires d'événements pour la transformation
  const handleTransformStart = () => {
    if (groupRef.current) {
      transformState.current = {
        initialWidth: camera.width,
        initialHeight: camera.height,
        initialViewDistance: camera.viewDistance,
        initialRotation: camera.rotation || 0,
        scaleX: 1,
        scaleY: 1
      };
    }
  };

  const handleTransform = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    
    transformState.current.scaleX = scaleX;
    transformState.current.scaleY = scaleY;
    
    // Mettre à jour le label pendant la transformation
    if (labelRef.current) {
      const newWidth = camera.width * scaleX;
      
      labelRef.current.position({
        x: node.x(),
        y: node.y() - (camera.height * scaleY)/2 - 20
      });
      
      const textNode = labelRef.current.findOne('Text');
      if (textNode) {
        textNode.fontSize(Math.max(10, Math.min(16, newWidth * 0.4)));
        textNode.width(newWidth * 2);
        textNode.offsetX(newWidth);
      }
      
      labelRef.current.getLayer()?.batchDraw();
    }
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    
    // Calculer les nouvelles dimensions
    const newWidth = Math.max(10, camera.width * scaleX);
    const newHeight = Math.max(10, camera.height * scaleY);
    const newViewDistance = camera.viewDistance * scaleX;
    
    // Réinitialiser l'échelle
    node.scaleX(1);
    node.scaleY(1);
    
    // Mettre à jour la caméra
    updateCamera(camera.id, {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      viewDistance: newViewDistance,
      rotation: rotation
    });
  };

  // Taille de police proportionnelle
  const fontSize = Math.max(10, Math.min(16, camera.width * 0.4));

  return (
    <>
      {/* Groupe principal pour la caméra et son champ de vision */}
      <Group
        ref={groupRef}
        x={camera.x}
        y={camera.y}
        draggable
        rotation={camera.rotation || 0}
        onClick={() => setSelectedCamera(camera.id)}
        onTap={() => setSelectedCamera(camera.id)}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformStart={handleTransformStart}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
      >
        {/* Champ de vision */}
        <Wedge
          x={0}
          y={0}
          radius={camera.viewDistance}
          angle={camera.angle}
          fill="rgba(255, 0, 0, 0.3)"
          stroke="rgba(255, 0, 0, 0.6)"
          strokeWidth={1}
          rotation={-camera.angle / 2}
          opacity={camera.opacity}
        />
        
        {/* Icône de caméra */}
        {getCameraIcon()}
      </Group>
      
      {/* Label séparé pour le texte - toujours horizontal */}
      <Label
        ref={labelRef}
        x={camera.x}
        y={camera.y - camera.height/2 - 20}
        onClick={() => setSelectedCamera(camera.id)}
        onTap={() => setSelectedCamera(camera.id)}
      >
        <Tag
          fill="transparent"
          pointerDirection="down"
          pointerWidth={10}
          pointerHeight={10}
          lineJoin="round"
        />
        <Text
          text={camera.name}
          fontSize={fontSize}
          fill="#000"
          padding={2}
          align="center"
          width={camera.width * 2}
          offsetX={camera.width}
        />
      </Label>
      
      {/* Transformer pour redimensionner et faire pivoter la caméra */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          keepRatio={true}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            // Limiter la taille min/max
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            if (newBox.width > 100 || newBox.height > 100) {
              return {
                ...newBox,
                width: Math.min(newBox.width, 100),
                height: Math.min(newBox.height, 100)
              };
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CameraObject;
