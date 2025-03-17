import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Tooltip, 
  Badge,
  useMediaQuery,
  useTheme,
  Slide,
  Fade
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronLeft, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle,
  Bell,
  FileText,
  Layers,
  PanelLeft
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ResponsiveHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    currentUser, 
    logout, 
    isAdmin, 
    isAdminMode, 
    setIsAdminMode,
    pdfFile,
    numPages,
    currentPage,
    setCurrentPage
  } = useAppContext();
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [pagesMenuAnchor, setPagesMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };
  
  const handlePagesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPagesMenuAnchor(event.currentTarget);
  };
  
  const handlePagesMenuClose = () => {
    setPagesMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };
  
  const handleAdminModeToggle = () => {
    handleUserMenuClose();
    setIsAdminMode(!isAdminMode);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handlePagesMenuClose();
  };
  
  // Générer les éléments du menu des pages
  const pageMenuItems = [];
  if (numPages > 0) {
    for (let i = 1; i <= numPages; i++) {
      pageMenuItems.push(
        <MenuItem 
          key={i} 
          onClick={() => handlePageChange(i)}
          selected={currentPage === i}
        >
          Page {i}
        </MenuItem>
      );
    }
  }
  
  return (
    <AppBar 
      position="static" 
      color="primary"
      elevation={3}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
        
        <Slide direction="right" in={true} mountOnEnter unmountOnExit>
          <Typography 
            variant={isSmall ? "body1" : "h6"} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PanelLeft size={24} />
            {!isSmall && "PlanCam"}
          </Typography>
        </Slide>
        
        {/* Menu des pages PDF */}
        {pdfFile && numPages > 0 && (
          <Fade in={true}>
            <Box sx={{ mx: 1 }}>
              <Button
                color="inherit"
                onClick={handlePagesMenuOpen}
                startIcon={<Layers size={18} />}
                endIcon={<ChevronLeft style={{ transform: 'rotate(-90deg)' }} size={16} />}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  },
                  borderRadius: 2,
                  px: 2
                }}
              >
                Page {currentPage} / {numPages}
              </Button>
              <Menu
                anchorEl={pagesMenuAnchor}
                open={Boolean(pagesMenuAnchor)}
                onClose={handlePagesMenuClose}
                PaperProps={{
                  sx: {
                    maxHeight: 300,
                    overflow: 'auto'
                  }
                }}
              >
                {pageMenuItems}
              </Menu>
            </Box>
          </Fade>
        )}
        
        {/* Bouton de notification */}
        <Tooltip title="Notifications">
          <IconButton color="inherit" onClick={handleNotificationsOpen}>
            <Badge badgeContent={3} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              width: 320,
              maxWidth: '100%'
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Notifications
            </Typography>
          </Box>
          <MenuItem onClick={handleNotificationsClose}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
              <FileText size={18} style={{ marginRight: 12, marginTop: 2 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Nouveau plan ajouté
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Il y a 5 minutes
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
              <Settings size={18} style={{ marginRight: 12, marginTop: 2 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Mise à jour système
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Il y a 2 heures
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
              <User size={18} style={{ marginRight: 12, marginTop: 2 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Nouvel utilisateur
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hier à 14:30
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Box sx={{ p: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
            <Button size="small" onClick={handleNotificationsClose}>
              Voir toutes les notifications
            </Button>
          </Box>
        </Menu>
        
        {/* Menu utilisateur */}
        <Box sx={{ ml: 1 }}>
          <Tooltip title="Paramètres du compte">
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar 
                alt={currentUser?.email || 'User'} 
                src="/static/avatar.jpg"
                sx={{ 
                  bgcolor: 'secondary.main',
                  border: '2px solid white'
                }}
              >
                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">
                {currentUser?.email || 'Utilisateur'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isAdmin ? 'Administrateur' : 'Utilisateur standard'}
              </Typography>
            </Box>
            <MenuItem onClick={handleUserMenuClose}>
              <User size={18} style={{ marginRight: 8 }} />
              Profil
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <Settings size={18} style={{ marginRight: 8 }} />
              Paramètres
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <HelpCircle size={18} style={{ marginRight: 8 }} />
              Aide
            </MenuItem>
            {isAdmin && (
              <MenuItem onClick={handleAdminModeToggle}>
                <Settings size={18} style={{ marginRight: 8 }} />
                {isAdminMode ? 'Mode normal' : 'Mode admin'}
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <LogOut size={18} style={{ marginRight: 8 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ResponsiveHeader;
