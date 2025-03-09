export type CameraType = 'dome' | 'bullet' | 'ptz' | 'fisheye' | 'turret' | 'multisensor' | 'thermal' | 'custom';

export interface Camera {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  viewDistance: number;
  opacity: number;
  type: CameraType;
  iconPath?: string; // Pour les icônes personnalisées
  rotation?: number; // Rotation explicite de la caméra
  page?: number;     // Page à laquelle appartient cette caméra
}

// Banque d'icônes prédéfinies
export const cameraIcons = {
  dome: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 10 7 10zm8 0c.83 0 1.5-.67 1.5-1.5S15.83 8 15 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-.5 7.5c3.04 0 5.5-2.46 5.5-5.5H9c0 3.04 2.46 5.5 5.5 5.5z",
    color: "#1976d2"
  },
  bullet: {
    path: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
    color: "#dc004e"
  },
  ptz: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 10 7 10zm8 0c.83 0 1.5-.67 1.5-1.5S15.83 8 15 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-.5 7.5c3.04 0 5.5-2.46 5.5-5.5H9c0 3.04 2.46 5.5 5.5 5.5z",
    color: "#4caf50"
  },
  fisheye: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
    color: "#ff9800"
  },
  turret: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
    color: "#9c27b0"
  },
  multisensor: {
    path: "M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h6v6H9V9zm1 1v4h4v-4h-4z",
    color: "#795548"
  },
  thermal: {
    path: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
    color: "#f44336"
  },
  hikvision: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7zm0 3c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z",
    color: "#e91e63"
  },
  dahua: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7zm-3 7c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z",
    color: "#3f51b5"
  },
  axis: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 10 7 10zm8 0c.83 0 1.5-.67 1.5-1.5S15.83 8 15 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-.5 7.5c3.04 0 5.5-2.46 5.5-5.5H9c0 3.04 2.46 5.5 5.5 5.5z",
    color: "#ffc107"
  }
};
