import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PdfViewer from './components/PdfViewer';
import LoginForm from './components/LoginForm';
import PdfPreview from './components/PdfPreview';
import AdminPanel from './components/AdminPanel';
import ResponsiveHeader from './components/ResponsiveHeader';
import ResponsiveSidebar from './components/ResponsiveSidebar';
import { AppProvider, useAppContext } from './context/AppContext';

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
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Main application component that checks authentication
const MainApp: React.FC = () => {
  const { isAuthenticated, isAdmin, isAdminMode } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [useResponsiveLayout, setUseResponsiveLayout] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Détecter si l'écran est petit pour utiliser le layout responsive
  React.useEffect(() => {
    const handleResize = () => {
      setUseResponsiveLayout(window.innerWidth < 1024);
    };
    
    handleResize(); // Vérifier au chargement
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {useResponsiveLayout ? (
        <ResponsiveHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      ) : (
        <Header toggleSidebar={toggleSidebar} />
      )}
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {!isAdminMode && (
          <>
            {useResponsiveLayout ? (
              <ResponsiveSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            ) : (
              sidebarOpen && <Sidebar />
            )}
            
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: 0, 
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              <PdfViewer />
            </Box>
          </>
        )}
        
        {isAdminMode && isAdmin && (
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <AdminPanel />
          </Box>
        )}
      </Box>
      <PdfPreview />
    </Box>
  );
};

// Root component that provides context
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
