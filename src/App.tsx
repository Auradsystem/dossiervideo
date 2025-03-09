import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PdfViewer from './components/PdfViewer';
import { Camera } from './types/Camera';
import { AppProvider } from './context/AppContext';

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

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header />
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            <Sidebar />
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
          </Box>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
