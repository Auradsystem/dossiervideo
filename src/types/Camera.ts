export type CameraType = 'dome' | 'bullet' | 'ptz';

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
}
