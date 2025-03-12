/**
 * Interface représentant un projet
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  files: ProjectFile[];
}

/**
 * Interface représentant un fichier de projet
 */
export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

/**
 * Interface pour les métadonnées d'un projet
 */
export interface ProjectMetadata {
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}
