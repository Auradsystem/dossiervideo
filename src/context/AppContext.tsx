import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { Camera, CameraType, cameraIcons } from '../types/Camera';

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
  selectedIconType: string;
  setSelectedIconType: (type: string) => void;
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
  const [selectedIconType, setSelectedIconType] = useState<string>("hikvision");

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
      width: 30, // Taille réduite par défaut
      height: 30, // Taille réduite par défaut
      angle: 45,
      viewDistance: 100,
      opacity: 0.9, // Plus opaque par défaut
      type: selectedIconType as CameraType, // Utiliser le type d'icône sélectionné
      iconPath: type === 'custom' ? cameraIcons[selectedIconType]?.path : undefined
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
      // Get the PDF viewer canvas
      const pdfCanvas = document.querySelector('canvas');
      if (!pdfCanvas) return;
      
      // Create a temporary canvas to render the PDF with cameras
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions to match the PDF canvas exactly
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      
      // Draw the PDF exactly as it appears in the viewer
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Draw cameras with the same orientation as in the viewer
      cameras.forEach(camera => {
        ctx.save();
        ctx.translate(camera.x, camera.y);
        
        // Draw view angle in red with proper orientation
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, camera.viewDistance, 
                (Math.PI * (-camera.angle / 2)) / 180, 
                (Math.PI * (camera.angle / 2)) / 180, 
                false);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.stroke();
        
        // Draw camera icon
        ctx.beginPath();
        ctx.arc(0, 0, camera.width / 2, 0, Math.PI * 2);
        
        // Use the color corresponding to the camera type
        const iconData = cameraIcons[camera.type] || cameraIcons.dome;
        ctx.fillStyle = iconData.color;
        
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
      
      // Get the image data from the canvas
      const imageData = tempCanvas.toDataURL('image/png');
      
      // Create a new PDF with the same dimensions as the canvas
      // Determine orientation based on width/height ratio
      const orientation = tempCanvas.width > tempCanvas.height ? 'landscape' : 'portrait';
      
      // Create PDF with appropriate dimensions
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [tempCanvas.width, tempCanvas.height]
      });
      
      // Add the image to the PDF, preserving the exact dimensions and orientation
      pdf.addImage(
        imageData, 
        'PNG', 
        0, 
        0, 
        tempCanvas.width, 
        tempCanvas.height
      );
      
      // Save the PDF
      pdf.save(`plancam_export_${new Date().toISOString().slice(0, 10)}.pdf`);
      
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
      setNextCameraNumber,
      selectedIconType,
      setSelectedIconType
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
