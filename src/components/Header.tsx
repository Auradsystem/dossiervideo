import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider,
  Box,
  Tooltip,
  Avatar,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { 
    logout, 
    isAdmin, 
    currentUser, 
    isAdminMode, 
    setIsAdminMode 
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    logout();
  };
  
  const handleAdminMode = () => {
    handleClose();
    setIsAdminMode(!isAdminMode);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {toggleSidebar && (
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
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PlanCam
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAdminMode && isAdmin && (
            <Button 
              color="inherit" 
              onClick={() => setIsAdminMode(false)}
              sx={{ mr: 2 }}
            >
              Quitter le mode admin
            </Button>
          )}
          
          <Tooltip title="Paramètres du compte">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: isAdmin ? 'secondary.main' : 'primary.main' }}>
                {currentUser?.username.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AccountIcon fontSize="small" />
            </ListItemIcon>
            {currentUser?.username || 'Utilisateur'}
            {isAdmin && ' (Admin)'}
          </MenuItem>
          
          <Divider />
          
          {isAdmin && !isAdminMode && (
            <MenuItem onClick={handleAdminMode}>
              <ListItemIcon>
                <AdminIcon fontSize="small" />
              </ListItemIcon>
              Mode administrateur
            </MenuItem>
          )}
          
          {isAdmin && isAdminMode && (
            <MenuItem onClick={handleAdminMode}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Mode normal
            </MenuItem>
          )}
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
