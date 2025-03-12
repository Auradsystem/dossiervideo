export interface Project {
  id?: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  files?: ProjectFile[];
}

export interface ProjectFile {
  id?: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  projectId?: string;
  projectName: string;
  uploadedAt: Date;
}
