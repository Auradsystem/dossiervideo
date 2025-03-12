export interface Comment {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: Date;
  createdBy: string;
  resolved: boolean;
}
