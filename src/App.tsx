import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useAppContext } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PdfViewer from './components/PdfViewer';
import PdfPreview from './components/PdfPreview';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import ProjectManager from './components/ProjectManager';

// Créer un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const { isAuthenticated, isAdmin, isAdminMode, pdfFile } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProjectManager, setShowProjectManager] = useState(false);
  
  const sidebarWidth = 240;
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const openProjectManager = () => {
    setShowProjectManager(true);
  };
  
  const closeProjectManager = () => {
    setShowProjectManager(false);
  };
  
  // Si l'utilisateur n'est pas authentifié, afficher le formulaire de connexion
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginForm />
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar 
          width={sidebarWidth} 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          onOpenProjectManager={openProjectManager}
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            ml: sidebarOpen ? `${sidebarWidth}px` : '64px',
            transition: theme => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Header />
          
          {isAdmin && isAdminMode ? (
            <AdminPanel />
          ) : showProjectManager ? (
            <ProjectManager />
          ) : (
            <PdfViewer />
          )}
        </Box>
        
        <PdfPreview />
      </Box>
    </ThemeProvider>
  );
};

export default App;
