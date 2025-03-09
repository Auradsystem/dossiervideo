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
  const [selectedIconType, setSelectedIconType] = useState<string>("dome");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Caméras de la page courante
  const cameras = pageCameras[page] || [];

  // Journalisation pour le débogage
  useEffect(() => {
    console.log(`Page actuelle: ${page}`);
    console.log(`Nombre de caméras sur cette page: ${cameras.length}`);
  }, [page, cameras]);

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
      width: 30,
      height: 30,
      angle: 45,
      viewDistance: 100,
      opacity: 0.9,
      type: selectedIconType as CameraType,
      iconPath: type === 'custom' ? cameraIcons[selectedIconType]?.path : undefined,
      rotation: 0,
      page: page
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

  // Fonction pour capturer l'état exact du canvas avec les caméras
  const captureCanvas = async (): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      // Trouver le canvas du PDF et le canvas Konva
      const pdfCanvas = document.querySelector('canvas:not(.konvajs-content canvas)');
      const konvaCanvas = document.querySelector('.konvajs-content canvas');
      
      if (!pdfCanvas || !konvaCanvas) {
        console.error('Canvas non trouvés');
        resolve(null);
        return;
      }
      
      // Créer un canvas temporaire pour combiner les deux
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        console.error('Impossible de créer un contexte 2D');
        resolve(null);
        return;
      }
      
      // Définir les dimensions du canvas temporaire
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      
      // Dessiner d'abord le PDF
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Puis dessiner le canvas Konva par-dessus
      ctx.drawImage(konvaCanvas, 0, 0);
      
      // Attendre un peu pour s'assurer que le rendu est terminé
      setTimeout(() => {
        resolve(tempCanvas);
      }, 100);
    });
  };

  // Fonction pour prévisualiser le PDF de la page courante
  const previewPdf = async () => {
    console.log(`Prévisualisation du PDF pour la page ${page}`);
    
    // Nettoyer l'URL précédente si elle existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    try {
      // Capturer le canvas combiné
      const combinedCanvas = await captureCanvas();
      
      if (!combinedCanvas) {
        console.error('Échec de la capture du canvas');
        return;
      }
      
      // Déterminer l'orientation en fonction du ratio largeur/hauteur
      const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
      
      // Créer le PDF avec les dimensions appropriées
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [combinedCanvas.width, combinedCanvas.height],
        hotfixes: ['px_scaling']
      });
      
      // Calculer les dimensions du PDF en points
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Obtenir les données d'image du canvas avec une haute qualité
      const imageData = combinedCanvas.toDataURL('image/jpeg', 1.0);
      
      // Ajouter l'image au PDF
      pdf.addImage({
        imageData: imageData,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE'
      });
      
      // Générer le blob et créer une URL
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      setPreviewUrl(url);
      setIsPreviewOpen(true);
      
      console.log('URL de prévisualisation créée');
    } catch (error) {
      console.error('Erreur lors de la génération de la prévisualisation:', error);
    }
  };

  // Fonction pour exporter le PDF de la page courante
  const exportCurrentPage = async () => {
    console.log(`Export du PDF pour la page ${page}`);
    
    try {
      // Capturer le canvas combiné
      const combinedCanvas = await captureCanvas();
      
      if (!combinedCanvas) {
        console.error('Échec de la capture du canvas');
        return;
      }
      
      // Déterminer l'orientation en fonction du ratio largeur/hauteur
      const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
      
      // Créer le PDF avec les dimensions appropriées
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [combinedCanvas.width, combinedCanvas.height],
        hotfixes: ['px_scaling']
      });
      
      // Calculer les dimensions du PDF en points
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Obtenir les données d'image du canvas avec une haute qualité
      const imageData = combinedCanvas.toDataURL('image/jpeg', 1.0);
      
      // Ajouter l'image au PDF
      pdf.addImage({
        imageData: imageData,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE'
      });
      
      // Télécharger le PDF
      pdf.save(`plancam_page${page}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      console.log('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export du PDF:', error);
    }
  };

  // Nouvelle fonction pour exporter toutes les pages en un seul PDF
  const exportPdf = async () => {
    console.log('Export de toutes les pages en un seul PDF');
    
    if (!pdfFile || totalPages === 0) {
      console.error('Aucun fichier PDF chargé ou nombre de pages invalide');
      return;
    }
    
    try {
      // Sauvegarder la page courante
      const currentPage = page;
      
      // Récupérer les numéros de pages qui contiennent des caméras
      const pageNumbers = Object.keys(pageCameras)
        .map(Number)
        .filter(pageNum => pageNum <= totalPages)
        .sort((a, b) => a - b);
      
      if (pageNumbers.length === 0) {
        alert('Aucune page avec des caméras à exporter');
        return;
      }
      
      // Créer un nouveau PDF
      const mergedPdf = new jsPDF();
      let isFirstPage = true;
      
      // Pour chaque page qui contient des caméras
      for (const pageNum of pageNumbers) {
        console.log(`Traitement de la page ${pageNum} pour l'export complet`);
        
        // Changer de page
        setPage(pageNum);
        
        // Attendre que le rendu de la page soit terminé
        // Cette attente est cruciale pour que le PDF soit correctement rendu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capturer le canvas de cette page
        const combinedCanvas = await captureCanvas();
        
        if (!combinedCanvas) {
          console.error(`Échec de la capture du canvas pour la page ${pageNum}`);
          continue;
        }
        
        // Déterminer l'orientation en fonction du ratio largeur/hauteur
        const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
        
        // Si ce n'est pas la première page, ajouter une nouvelle page au PDF
        if (!isFirstPage) {
          mergedPdf.addPage([combinedCanvas.width, combinedCanvas.height], orientation);
        } else {
          // Pour la première page, définir le format du PDF
          mergedPdf.deletePage(1);
          mergedPdf.addPage([combinedCanvas.width, combinedCanvas.height], orientation);
          isFirstPage = false;
        }
        
        // Obtenir les données d'image du canvas avec une haute qualité
        const imageData = combinedCanvas.toDataURL('image/jpeg', 1.0);
        
        // Ajouter l'image à la page courante du PDF
        const pdfWidth = mergedPdf.internal.pageSize.getWidth();
        const pdfHeight = mergedPdf.internal.pageSize.getHeight();
        
        mergedPdf.addImage({
          imageData: imageData,
          format: 'JPEG',
          x: 0,
          y: 0,
          width: pdfWidth,
          height: pdfHeight,
          compression: 'NONE'
        });
        
        console.log(`Page ${pageNum} ajoutée au PDF`);
      }
      
      // Restaurer la page courante
      setPage(currentPage);
      
      // Télécharger le PDF final
      mergedPdf.save(`plancam_complet_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      console.log('Export complet terminé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export complet:', error);
      alert('Une erreur est survenue lors de l\'export. Veuillez réessayer.');
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
