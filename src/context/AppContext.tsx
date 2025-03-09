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

  // Fonction pour capturer l'état exact du canvas Konva
  const captureKonvaStage = (): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      // Trouver le stage Konva
      const stage = document.querySelector('.konvajs-content canvas');
      if (!stage) {
        console.error('Stage Konva non trouvé');
        resolve(null);
        return;
      }

      // Créer un canvas temporaire pour combiner le PDF et le stage Konva
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        console.error('Impossible de créer un contexte 2D');
        resolve(null);
        return;
      }

      // Obtenir le canvas du PDF
      const pdfCanvas = document.querySelector('canvas:not(.konvajs-content canvas)');
      if (!pdfCanvas) {
        console.error('Canvas PDF non trouvé');
        resolve(null);
        return;
      }

      // Définir les dimensions du canvas temporaire
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;

      // Dessiner d'abord le PDF
      ctx.drawImage(pdfCanvas, 0, 0);

      // Puis dessiner le stage Konva par-dessus
      ctx.drawImage(stage, 0, 0);

      resolve(tempCanvas);
    });
  };

  // Fonction pour générer le PDF d'une page spécifique
  const generatePagePdf = async (pageNumber: number): Promise<Blob | null> => {
    if (!pdfFile) return null;
    
    try {
      console.log(`Génération du PDF pour la page ${pageNumber}`);
      
      // Capturer l'état exact du canvas Konva
      const combinedCanvas = await captureKonvaStage();
      if (!combinedCanvas) {
        console.error('Échec de la capture du canvas');
        return null;
      }
      
      // Déterminer l'orientation en fonction du ratio largeur/hauteur
      const orientation = combinedCanvas.width > combinedCanvas.height ? 'landscape' : 'portrait';
      console.log(`Orientation détectée: ${orientation}`);
      
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
      
      // Ajouter l'image au PDF, en préservant les dimensions et l'orientation exactes
      pdf.addImage({
        imageData: imageData,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE'
      });
      
      // Retourner le PDF sous forme de blob
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
      const mergedPdf = new jsPDF();
      let isFirstPage = true;
      
      // Pour chaque page qui contient des caméras
      const pageNumbers = Object.keys(pageCameras).map(Number).sort((a, b) => a - b);
      
      if (pageNumbers.length === 0) {
        console.error('Aucune page avec des caméras à exporter');
        return;
      }
      
      for (let i = 0; i < pageNumbers.length; i++) {
        const pageNum = pageNumbers[i];
        if (pageNum > totalPages) continue;
        
        console.log(`Traitement de la page ${pageNum} pour l'export complet`);
        
        // Changer de page temporairement pour générer le PDF de cette page
        setPage(pageNum);
        
        // Attendre que le rendu de la page soit terminé
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Générer le PDF pour cette page
        const pageBlob = await generatePagePdf(pageNum);
        
        if (pageBlob) {
          // Convertir le blob en base64
          const reader = new FileReader();
          
          await new Promise<void>((resolve) => {
            reader.onloadend = function() {
              // Ajouter une nouvelle page si ce n'est pas la première
              if (!isFirstPage) {
                mergedPdf.addPage();
              } else {
                isFirstPage = false;
              }
              
              // Extraire la base64 data
              const base64data = reader.result as string;
              const base64Clean = base64data.split(',')[1];
              
              // Créer un PDF temporaire à partir du blob
              const tempPdf = new jsPDF();
              tempPdf.loadFile(base64Clean);
              
              // Obtenir les dimensions du PDF temporaire
              const pageWidth = tempPdf.internal.pageSize.getWidth();
              const pageHeight = tempPdf.internal.pageSize.getHeight();
              
              // Ajouter l'image au PDF fusionné
              mergedPdf.addImage(base64data, 'JPEG', 0, 0, pageWidth, pageHeight);
              
              resolve();
            };
            reader.readAsDataURL(pageBlob);
          });
        }
      }
      
      // Restaurer la page courante
      setPage(currentPage);
      
      // Télécharger le PDF final
      mergedPdf.save(`plancam_complet_${new Date().toISOString().slice(0, 10)}.pdf`);
      
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
