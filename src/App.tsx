import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import PdfViewer from './components/PdfViewer';
import ResponsiveSidebar from './components/ResponsiveSidebar';
import PdfPreview from './components/PdfPreview';
import LoginForm from './components/LoginForm';
import { useAppContext } from './context/AppContext';

// Créer un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    isPreviewOpen, 
    setIsPreviewOpen, 
    previewUrl 
  } = useAppContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      
      <Header onMenuToggle={toggleSidebar} />
      
      <ResponsiveSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${sidebarOpen ? 300 : 0}px)` },
          ml: { sm: sidebarOpen ? '300px' : 0 },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          height: 'calc(100vh - 64px)',
          mt: '64px',
          overflow: 'hidden',
        }}
      >
        <PdfViewer />
      </Box>
      
      {/* Prévisualisation du PDF */}
      <PdfPreview 
        open={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        url={previewUrl} 
      />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
