export interface Camera {
  id: string;
  name: string;
  type: CameraType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  rotation: number;
  viewDistance: number;
  opacity: number;
  iconPath?: string;
}

export type CameraType = 'dome' | 'bullet' | 'ptz' | 'fisheye' | 'thermal' | 'custom';

// Icônes SVG pour les différents types de caméras
export const cameraIcons: Record<CameraType, { path: string; color: string }> = {
  dome: {
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
    color: '#4CAF50'
  },
  bullet: {
    path: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z',
    color: '#2196F3'
  },
  ptz: {
    path: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z',
    color: '#FF9800'
  },
  fisheye: {
    path: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    color: '#9C27B0'
  },
  thermal: {
    path: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
    color: '#F44336'
  },
  custom: {
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    color: '#607D8B'
  }
};

// Fonction pour créer une nouvelle caméra avec des valeurs par défaut
export const createDefaultCamera = (type: CameraType = 'dome', x = 100, y = 100): Omit<Camera, 'id'> => ({
  name: `Caméra ${type}`,
  type,
  x,
  y,
  width: 30,
  height: 30,
  angle: 60,
  rotation: 0,
  viewDistance: 150,
  opacity: 0.5
});
