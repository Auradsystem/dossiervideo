export interface Comment {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
  color: string;
  fontSize?: number; // Nouvelle propriété pour la taille de police
  cameraId?: string; // Si le commentaire est lié à une caméra
  createdAt: Date;
  updatedAt: Date;
}
