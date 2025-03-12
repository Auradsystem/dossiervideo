export interface Project {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ProjectFile {
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  projectName: string;
  uploadedAt: Date;
}
