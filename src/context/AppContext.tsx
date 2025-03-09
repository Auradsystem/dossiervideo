import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraType } from '../types/Camera';

interface AppContextType {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  cameras: Camera[];
  addCamera: (x: number, y: number, type: CameraType) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  selectedCamera: string | null;
  setSelectedCamera: (id: string | null) => void;
  scale: number;
  setScale: (scale: number) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const addCamera = (x: number, y: number, type: CameraType) => {
    const newCamera: Camera = {
      id: uuidv4(),
      name: `CAM-${String(cameras.length + 1).padStart(3, '0')}`,
      x,
      y,
      width: 50,
      height: 50,
      angle: 45,
      viewDistance: 100,
      opacity: 0.5,
      type
    };
    setCameras([...cameras, newCamera]);
    setSelectedCamera(newCamera.id);
  };

  const updateCamera = (id: string, updates: Partial<Camera>) => {
    setCameras(cameras.map(camera => 
      camera.id === id ? { ...camera, ...updates } : camera
    ));
  };

  const deleteCamera = (id: string) => {
    setCameras(cameras.filter(camera => camera.id !== id));
    if (selectedCamera === id) {
      setSelectedCamera(null);
    }
  };

  return (
    <AppContext.Provider value={{
      pdfFile,
      setPdfFile,
      cameras,
      addCamera,
      updateCamera,
      deleteCamera,
      selectedCamera,
      setSelectedCamera,
      scale,
      setScale,
      page,
      setPage,
      totalPages,
      setTotalPages
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
