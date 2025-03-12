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
});

// Main application component that checks authentication
const MainApp: React.FC = () => {
  const { isAuthenticated, isAdmin, isAdminMode } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {!isAdminMode && (
          <>
            {sidebarOpen && <Sidebar />}
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: 2, 
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
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
