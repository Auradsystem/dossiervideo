import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, useMediaQuery } from '@mui/material';
import PdfViewer from './components/PdfViewer';
import LoginForm from './components/LoginForm';
import PdfPreview from './components/PdfPreview';
import AdminPanel from './components/AdminPanel';
import AIAssistant from './components/AIAssistant';
import AITools from './components/AITools';
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// Main application component that checks authentication
const MainApp: React.FC = () => {
  const { isAuthenticated, isAdmin, isAdminMode } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const openAITools = () => {
    setAiToolsOpen(true);
  };
  
  const closeAITools = () => {
    setAiToolsOpen(false);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ResponsiveHeader 
        toggleSidebar={toggleSidebar} 
        openAITools={openAITools}
      />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {!isAdminMode && (
          <>
            <ResponsiveSidebar 
              open={sidebarOpen} 
              onClose={() => setSidebarOpen(false)}
            />
            
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: { xs: 1, sm: 2 }, 
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                ml: { md: sidebarOpen ? '300px' : 0 },
                transition: theme.transitions.create(['margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
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
      <AIAssistant />
      <AITools open={aiToolsOpen} onClose={closeAITools} />
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
