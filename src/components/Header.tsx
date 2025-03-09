import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { LogOut, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { logout } = useAppContext();

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
          PlanCam
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="À propos">
            <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
              <Info size={20} />
            </IconButton>
          </Tooltip>
          
          <Button 
            color="inherit" 
            onClick={logout}
            startIcon={<LogOut size={18} />}
            size="small"
          >
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
