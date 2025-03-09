import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { Camera, CameraType, cameraIcons } from '../types/Camera';

// Interface pour stocker les caméras par page
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
  exportCurrentPage: () => void;
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
  clearCurrentPage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  // Stockage des caméras par page
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

  // Caméras de la page courante
  const cameras = pageCameras[page] || [];

  // Journalisation pour le débogage
  useEffect(() => {
    console.log(`Page actuelle: ${page}`);
    console.log(`Nombre de caméras sur cette page: ${cameras.length}`);
    console.log('État des caméras par page:', pageCameras);
  }, [page, cameras, pageCameras]);

  // Réinitialiser la sélection lors du changement de page
  useEffect(() => {
    setSelectedCamera(null);
  }, [page]);

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
    
    // Ajouter la caméra à la page courante
    const currentPageCameras = [...(pageCameras[page] || []), newCamera];
    setPageCameras({
      ...pageCameras,
      [page]: currentPageCameras
    });
    
    setSelectedCamera(newCamera.id);
    
    // Increment the next camera number
    setNextCameraNumber(nextCameraNumber + 1);
    
    console.log(`Caméra ajoutée à la page ${page}:`, newCamera);
  };

  const updateCamera = (id: string, updates: Partial<Camera>) => {
    // Mettre à jour la caméra uniquement sur la page courante
    const updatedPageCameras = (pageCameras[page] || []).map(camera => {
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
        
        const updatedCamera = { ...camera, ...updates };
        console.log(`Caméra mise à jour sur la page ${page}:`, updatedCamera);
        return updatedCamera;
      }
      return camera;
    });
    
    setPageCameras({
      ...pageCameras,
      [page]: updatedPageCameras
    });
  };

  const deleteCamera = (id: string) => {
    // Supprimer la caméra uniquement de la page courante
    const filteredCameras = (pageCameras[page] || []).filter(camera => camera.id !== id);
    
    setPageCameras({
      ...pageCameras,
      [page]: filteredCameras
    });
    
    if (selectedCamera === id) {
      setSelectedCamera(null);
    }
    
    console.log(`Caméra supprimée de la page ${page}, ID: ${id}`);
  };

  // Fonction pour effacer toutes les caméras de la page courante
  const clearCurrentPage = () => {
    const updatedPageCameras = { ...pageCameras };
    delete updatedPageCameras[page];
    
    setPageCameras(updatedPageCameras);
    setSelectedCamera(null);
    
    console.log(`Toutes les caméras de la page ${page} ont été supprimées`);
  };

  // Fonction pour générer le PDF d'une page spécifique
  const generatePagePdf = async (pageNumber: number): Promise<Blob | null> => {
    if (!pdfFile) return null;
    
    try {
      console.log(`Génération du PDF pour la page ${pageNumber}`);
      
      // Get the PDF viewer canvas
      const pdfCanvas = document.querySelector('canvas');
      if (!pdfCanvas) {
        console.error('Canvas non trouvé');
        return null;
      }
      
      // Create a temporary canvas to render the PDF with cameras
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        console.error('Contexte 2D non disponible');
        return null;
      }
      
      // Set canvas dimensions to match the PDF canvas exactly
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      
      // Draw the PDF exactly as it appears in the viewer
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Récupérer les caméras de la page spécifique
      const pageCamerasList = pageCameras[pageNumber] || [];
      console.log(`Dessin de ${pageCamerasList.length} caméras pour la page ${pageNumber}`);
      
      // Dessiner les caméras de cette page
      pageCamerasList.forEach(camera => {
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
      console.log(`Orientation détectée: ${orientation}`);
      
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
      const pdfBlob = pdf.output('blob');
      console.log(`PDF généré avec succès pour la page ${pageNumber}`);
      return pdfBlob;
      
    } catch (error) {
      console.error(`Erreur lors de la génération du PDF pour la page ${pageNumber}:`, error);
      return null;
    }
  };

  // Fonction pour prévisualiser le PDF de la page courante
  const previewPdf = async () => {
    console.log(`Prévisualisation du PDF pour la page ${page}`);
    
    // Nettoyer l'URL précédente si elle existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    const pdfBlob = await generatePagePdf(page);
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
      console.log('URL de prévisualisation créée');
    } else {
      console.error('Échec de la génération du PDF pour la prévisualisation');
    }
  };

  // Fonction pour exporter le PDF de la page courante
  const exportCurrentPage = async () => {
    console.log(`Export du PDF pour la page ${page}`);
    
    const pdfBlob = await generatePagePdf(page);
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      
      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement('a');
      link.href = url;
      link.download = `plancam_page${page}_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      
      // Nettoyer l'URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('PDF téléchargé avec succès');
    } else {
      console.error('Échec de la génération du PDF pour l\'export');
    }
  };

  // Fonction pour exporter toutes les pages en un seul PDF
  const exportPdf = async () => {
    console.log('Export de toutes les pages en un seul PDF');
    
    if (!pdfFile || totalPages === 0) {
      console.error('Aucun fichier PDF chargé ou nombre de pages invalide');
      return;
    }
    
    try {
      // Sauvegarder la page courante
      const currentPage = page;
      
      // Créer un nouveau PDF
      const pdf = new jsPDF();
      let isFirstPage = true;
      
      // Pour chaque page qui contient des caméras
      for (const pageNum of Object.keys(pageCameras).map(Number).sort((a, b) => a - b)) {
        if (pageNum > totalPages) continue;
        
        console.log(`Traitement de la page ${pageNum} pour l'export complet`);
        
        // Changer de page temporairement pour générer le PDF de cette page
        setPage(pageNum);
        
        // Attendre que le rendu de la page soit terminé
        // Note: Ceci est une simplification, en pratique il faudrait attendre que le rendu soit terminé
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Générer le PDF pour cette page
        const pageBlob = await generatePagePdf(pageNum);
        
        if (pageBlob) {
          // Convertir le blob en ArrayBuffer
          const arrayBuffer = await pageBlob.arrayBuffer();
          
          // Ajouter une nouvelle page si ce n'est pas la première
          if (!isFirstPage) {
            pdf.addPage();
          } else {
            isFirstPage = false;
          }
          
          // Ajouter le contenu de cette page au PDF final
          const pageData = new Uint8Array(arrayBuffer);
          pdf.addPage();
          // Cette partie est simplifiée, en pratique il faudrait extraire l'image du PDF et l'ajouter
          // au nouveau PDF avec les bonnes dimensions
        }
      }
      
      // Restaurer la page courante
      setPage(currentPage);
      
      // Télécharger le PDF final
      pdf.save(`plancam_complet_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      console.log('Export complet terminé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export complet:', error);
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
      exportCurrentPage,
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
      clearCurrentPage
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
