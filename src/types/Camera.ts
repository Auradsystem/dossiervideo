export type CameraType = 'dome' | 'bullet' | 'ptz' | 'fisheye' | 'custom';

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
  iconPath?: string;
  rotation?: number;
  page?: number;
}

// Icônes simplifiées pour les caméras
export const cameraIcons: Record<string, { path: string, color: string }> = {
  dome: {
    path: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    color: '#FF5252'
  },
  bullet: {
    path: 'M3 9h18v6H3z',
    color: '#2196F3'
  },
  ptz: {
    path: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 7V4 M12 20v-3 M7 12H4 M20 12h-3',
    color: '#4CAF50'
  },
  fisheye: {
    path: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M7 9l-3-3 M17 9l3-3 M7 15l-3 3 M17 15l3 3',
    color: '#FFC107'
  }
};
