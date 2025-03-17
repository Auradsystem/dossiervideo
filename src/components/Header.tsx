import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  AdminPanelSettings as AdminIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { 
    isAuthenticated, 
    logout, 
    currentUser, 
    isAdmin, 
    isAdminMode, 
    setIsAdminMode,
    syncWithCloud,
    isSyncing,
    syncError
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    logout();
  };
  
  const handleToggleAdminMode = () => {
    handleClose();
    setIsAdminMode(!isAdminMode);
  };
  
  const handleSync = async () => {
    try {
      await syncWithCloud();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PlanCam
        </Typography>
        
        {isAuthenticated && (
          <>
            <Tooltip title="Synchroniser avec le cloud">
              <IconButton 
                color="inherit" 
                onClick={handleSync}
                disabled={isSyncing}
                sx={{ mr: 1 }}
              >
                {isSyncing ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  <Badge color={syncError ? "error" : "default"} variant="dot">
                    <SyncIcon />
                  </Badge>
                )}
              </IconButton>
            </Tooltip>
            
            {isAdmin && (
              <Tooltip title={isAdminMode ? "Mode normal" : "Mode administrateur"}>
                <IconButton 
                  color={isAdminMode ? "secondary" : "inherit"} 
                  onClick={handleToggleAdminMode}
                  sx={{ mr: 1 }}
                >
                  <AdminIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Box>
              <Button 
                color="inherit" 
                onClick={handleMenu}
                startIcon={<AccountCircle />}
              >
                {currentUser?.username || 'Utilisateur'}
              </Button>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {isAdmin && (
                  <MenuItem onClick={handleToggleAdminMode}>
                    {isAdminMode ? "Quitter le mode admin" : "Mode administrateur"}
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Se déconnecter</MenuItem>
              </Menu>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
