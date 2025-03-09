import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { Camera, CameraType, cameraIcons } from '../types/Camera';

interface PageCameras {
  [pageNumber: number]: Camera[];
}

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
  previewPdf: () => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (isOpen: boolean) => void;
  namingPattern: string;
  setNamingPattern: (pattern: string) => void;
  nextCameraNumber: number;
  setNextCameraNumber: (num: number) => void;
  selectedIconType: string;
  setSelectedIconType: (type: string) => void;
  pageCameras: PageCameras;
  clearCamerasOnCurrentPage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCameras, setPageCameras] = useState<PageCameras>({});
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [namingPattern, setNamingPattern] = useState<string>("CAM-");
  const [nextCameraNumber, setNextCameraNumber] = useState<number>(1);
  const [selectedIconType, setSelectedIconType] = useState<string>("hikvision");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Dérivez les caméras de la page actuelle à partir de pageCameras
  const cameras = pageCameras[page] || [];

  // Réinitialiser les caméras lors du changement de PDF
  useEffect(() => {
    if (pdfFile === null) {
      setPageCameras({});
      setSelectedCamera(null);
    }
  }, [pdfFile]);

  // Check for existing authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem('plancam_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Désélectionner la caméra lors du changement de page
  useEffect(() => {
    setSelectedCamera(null);
  }, [page]);

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
      iconPath: type === 'custom' ? cameraIcons[selectedIconType]?.path : undefined,
      rotation: 0, // Ajout d'une propriété de rotation explicite
      page: page // Stocker la page à laquelle appartient cette caméra
    };
    
    // Ajouter la caméra à la page actuelle
    setPageCameras(prev => ({
      ...prev,
      [page]: [...(prev[page] || []), newCamera]
    }));
    
    setSelectedCamera(newCamera.id);
    
    // Increment the next camera number
    setNextCameraNumber(nextCameraNumber + 1);
  };

  const updateCamera = (id: string, updates: Partial<Camera>) => {
    setPageCameras(prev => {
      const updatedPageCameras = { ...prev };
      
      // Mettre à jour la caméra dans la page actuelle
      if (updatedPageCameras[page]) {
        updatedPageCameras[page] = updatedPageCameras[page].map(camera => {
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
        });
      }
      
      return updatedPageCameras;
    });
  };

  const deleteCamera = (id: string) => {
    setPageCameras(prev => {
      const updatedPageCameras = { ...prev };
      
      // Supprimer la caméra de la page actuelle
      if (updatedPageCameras[page]) {
        updatedPageCameras[page] = updatedPageCameras[page].filter(camera => camera.id !== id);
      }
      
      return updatedPageCameras;
    });
    
    if (selectedCamera === id) {
      setSelectedCamera(null);
    }
  };

  // Fonction pour effacer toutes les caméras de la page actuelle
  const clearCamerasOnCurrentPage = () => {
    setPageCameras(prev => {
      const updatedPageCameras = { ...prev };
      updatedPageCameras[page] = [];
      return updatedPageCameras;
    });
    setSelectedCamera(null);
  };

  // Fonction commune pour générer le PDF
  const generatePdf = async (): Promise<Blob | null> => {
    if (!pdfFile) return null;
    
    try {
      // Get the PDF viewer canvas
      const pdfCanvas = document.querySelector('canvas');
      if (!pdfCanvas) return null;
      
      // Create a temporary canvas to render the PDF with cameras
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return null;
      
      // Set canvas dimensions to match the PDF canvas exactly
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      
      // Draw the PDF exactly as it appears in the viewer
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Dessiner uniquement les caméras de la page actuelle
      const currentPageCameras = pageCameras[page] || [];
      
      // Nouvelle approche: utiliser les transformations du canvas pour dessiner les caméras
      // avec leur orientation exacte comme dans l'interface
      currentPageCameras.forEach(camera => {
        ctx.save();
        
        // Translate to camera position
        ctx.translate(camera.x, camera.y);
        
        // Draw view angle in red with proper orientation
        ctx.beginPath();
        
        // Calculer l'angle de départ et de fin en tenant compte de la rotation de la caméra
        const cameraRotation = camera.rotation || 0;
        const halfAngle = camera.angle / 2;
        
        // Convertir les angles en radians
        const startAngle = ((270 - halfAngle + cameraRotation) % 360) * Math.PI / 180;
        const endAngle = ((270 + halfAngle + cameraRotation) % 360) * Math.PI / 180;
        
        // Dessiner l'arc de cercle représentant le champ de vision
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, camera.viewDistance, startAngle, endAngle);
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
      
      // Determine orientation based on width/height ratio
      const orientation = tempCanvas.width > tempCanvas.height ? 'landscape' : 'portrait';
      
      // Create PDF with appropriate dimensions
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [tempCanvas.width, tempCanvas.height],
        hotfixes: ['px_scaling']
      });
      
      // Calculate the PDF dimensions in points
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Get the image data from the canvas with high quality
      const imageData = tempCanvas.toDataURL('image/jpeg', 1.0);
      
      // Add the image to the PDF, preserving the exact dimensions and orientation
      pdf.addImage({
        imageData: imageData,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE'
      });
      
      // Return the PDF as a blob
      return pdf.output('blob');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  // Fonction pour prévisualiser le PDF
  const previewPdf = async () => {
    // Nettoyer l'URL précédente si elle existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    const pdfBlob = await generatePdf();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    }
  };

  // Fonction pour exporter le PDF
  const exportPdf = async () => {
    const pdfBlob = await generatePdf();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      
      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement('a');
      link.href = url;
      link.download = `plancam_export_page${page}_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      
      // Nettoyer l'URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
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
      previewPdf,
      previewUrl,
      setPreviewUrl,
      isPreviewOpen,
      setIsPreviewOpen,
      namingPattern,
      setNamingPattern,
      nextCameraNumber,
      setNextCameraNumber,
      selectedIconType,
      setSelectedIconType,
      pageCameras,
      clearCamerasOnCurrentPage
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
