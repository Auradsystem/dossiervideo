import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  exportPdf: () => void;
  namingPattern: string;
  setNamingPattern: (pattern: string) => void;
  nextCameraNumber: number;
  setNextCameraNumber: (num: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [namingPattern, setNamingPattern] = useState<string>("CAM-");
  const [nextCameraNumber, setNextCameraNumber] = useState<number>(1);

  // Check for existing authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem('plancam_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'xcel' && password === 'video') {
      setIsAuthenticated(true);
      localStorage.setItem('plancam_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('plancam_auth');
  };

  const addCamera = (x: number, y: number, type: CameraType) => {
    // Generate camera name based on pattern and next number
    const paddedNumber = String(nextCameraNumber).padStart(3, '0');
    const newCameraName = `${namingPattern}${paddedNumber}`;
    
    const newCamera: Camera = {
      id: uuidv4(),
      name: newCameraName,
      x,
      y,
      width: 50,
      height: 50,
      angle: 45,
      viewDistance: 100,
      opacity: 0.7, // More opaque by default
      type
    };
    
    setCameras([...cameras, newCamera]);
    setSelectedCamera(newCamera.id);
    
    // Increment the next camera number
    setNextCameraNumber(nextCameraNumber + 1);
  };

  const updateCamera = (id: string, updates: Partial<Camera>) => {
    setCameras(cameras.map(camera => {
      if (camera.id === id) {
        // If the name is being updated, check if it follows the pattern
        if (updates.name && updates.name !== camera.name) {
          const nameMatch = updates.name.match(/^(.+?)(\d+)$/);
          if (nameMatch) {
            const newPattern = nameMatch[1];
            const newNumber = parseInt(nameMatch[2], 10);
            
            // Update the pattern and next number if this is the highest number
            if (newPattern !== namingPattern) {
              setNamingPattern(newPattern);
            }
            
            if (newNumber >= nextCameraNumber) {
              setNextCameraNumber(newNumber + 1);
            }
          }
        }
        
        return { ...camera, ...updates };
      }
      return camera;
    }));
  };

  const deleteCamera = (id: string) => {
    setCameras(cameras.filter(camera => camera.id !== id));
    if (selectedCamera === id) {
      setSelectedCamera(null);
    }
  };

  const exportPdf = async () => {
    if (!pdfFile) return;
    
    try {
      // Create a canvas to render the PDF with cameras
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get the PDF viewer canvas
      const pdfCanvas = document.querySelector('canvas');
      if (!pdfCanvas) return;
      
      // Set canvas dimensions
      canvas.width = pdfCanvas.width;
      canvas.height = pdfCanvas.height;
      
      // Draw the PDF
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Draw cameras (simplified representation)
      cameras.forEach(camera => {
        ctx.save();
        ctx.translate(camera.x, camera.y);
        
        // Draw view angle
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, camera.viewDistance, 
                -Math.PI * camera.angle / 360, 
                Math.PI * camera.angle / 360, 
                false);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.stroke();
        
        // Draw camera icon
        ctx.beginPath();
        ctx.arc(0, 0, camera.width / 2, 0, Math.PI * 2);
        
        switch (camera.type) {
          case 'dome':
            ctx.fillStyle = 'rgba(25, 118, 210, 0.8)';
            break;
          case 'bullet':
            ctx.fillStyle = 'rgba(220, 0, 78, 0.8)';
            break;
          case 'ptz':
            ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
            break;
          default:
            ctx.fillStyle = 'rgba(25, 118, 210, 0.8)';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        // Draw camera name
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(camera.name, 0, -camera.height / 2 - 5);
        
        ctx.restore();
      });
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plancam_export_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
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
      setTotalPages,
      isAuthenticated,
      login,
      logout,
      exportPdf,
      namingPattern,
      setNamingPattern,
      nextCameraNumber,
      setNextCameraNumber
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
