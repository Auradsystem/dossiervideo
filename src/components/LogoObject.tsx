import React from 'react';
import { Group, Image, Transformer } from 'react-konva';
import { Logo, useAppContext } from '../context/AppContext';
import useImage from 'use-image';

interface LogoObjectProps {
  logo: Logo;
  isSelected: boolean;
}

const LogoObject: React.FC<LogoObjectProps> = ({ logo, isSelected }) => {
  const { updateLogo, setSelectedLogo, selectedCamera, setSelectedCamera, selectedComment, setSelectedComment } = useAppContext();
  const [image] = useImage(logo.url);
  
  const groupRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    updateLogo(logo.id, {
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
    
    updateLogo(logo.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={logo.x}
        y={logo.y}
        width={logo.width}
        height={logo.height}
        rotation={logo.rotation || 0}
        draggable
        onClick={() => {
          setSelectedLogo(logo.id);
          // Désélectionner les autres éléments
          if (selectedCamera) setSelectedCamera(null);
          if (selectedComment) setSelectedComment(null);
        }}
        onTap={() => setSelectedLogo(logo.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {image && (
          <Image
            image={image}
            width={logo.width}
            height={logo.height}
            opacity={0.9}
          />
        )}
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limiter la taille minimale
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default LogoObject;
