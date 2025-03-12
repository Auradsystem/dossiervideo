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
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  AutoAwesome as MagicIcon,
  CameraAlt as CameraIcon,
  PictureAsPdf as PdfIcon,
  Comment as CommentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

interface ResponsiveHeaderProps {
  toggleSidebar?: () => void;
  openAITools: () => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ toggleSidebar, openAITools }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    logout, 
    isAdmin, 
    currentUser, 
    isAdminMode, 
    setIsAdminMode,
    cameras,
    comments
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };
  
  const handleOpenAITools = () => {
    openAITools();
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile ? (
            // Mobile header
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMobileMenu}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                PlanCam
              </Typography>
              
              <Tooltip title="Assistant IA">
                <IconButton color="inherit" onClick={handleOpenAITools}>
                  <MagicIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Paramètres du compte">
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: isAdmin ? 'secondary.main' : 'primary.main' }}>
                    {currentUser?.username.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </>
          ) : (
            // Desktop header
            <>
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
                <Button 
                  color="inherit" 
                  startIcon={<MagicIcon />}
                  onClick={handleOpenAITools}
                  sx={{ mr: 2 }}
                >
                  Assistant IA
                </Button>
                
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
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Menu utilisateur */}
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
      
      {/* Menu mobile */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={toggleMobileMenu}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List>
            <ListItem button onClick={toggleSidebar}>
              <ListItemIcon>
                <PdfIcon />
              </ListItemIcon>
              <ListItemText primary="Gestion du plan" />
            </ListItem>
            
            <ListItem button onClick={handleOpenAITools}>
              <ListItemIcon>
                <MagicIcon />
              </ListItemIcon>
              <ListItemText primary="Assistant IA" />
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem>
              <ListItemIcon>
                <Badge badgeContent={cameras.length} color="primary">
                  <CameraIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Caméras" secondary={`${cameras.length} sur le plan`} />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Badge badgeContent={comments.length} color="secondary">
                  <CommentIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Commentaires" secondary={`${comments.length} sur le plan`} />
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            {isAdmin && !isAdminMode && (
              <ListItem button onClick={handleAdminMode}>
                <ListItemIcon>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText primary="Mode administrateur" />
              </ListItem>
            )}
            
            {isAdmin && isAdminMode && (
              <ListItem button onClick={handleAdminMode}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Mode normal" />
              </ListItem>
            )}
            
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default ResponsiveHeader;
