import React, { useState, useRef } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  User as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Camera as CameraIcon
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  width: number;
  isOpen: boolean;
  onToggle: () => void;
  onOpenProjectManager: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ width, isOpen, onToggle, onOpenProjectManager }) => {
  const { 
    pdfFile, 
    setPdfFile, 
    exportPdf, 
    exportCurrentPage, 
    previewPdf,
    currentUser,
    logout,
    isAdmin,
    isAdminMode,
    setIsAdminMode
  } = useAppContext();
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Veuillez sélectionner un fichier PDF');
      }
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };
  
  const handleToggleAdminMode = () => {
    handleUserMenuClose();
    setIsAdminMode(!isAdminMode);
  };
  
  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getUserInitials = () => {
    if (!currentUser) return '?';
    
    const email = currentUser.email;
    if (!email) return '?';
    
    // Utiliser la première lettre de l'email
    return email.charAt(0).toUpperCase();
  };
  
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open={isOpen}
      sx={{
        width: isOpen ? width : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? width : 64,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'space-between' : 'center',
        p: 2
      }}>
        {isOpen && (
          <Typography variant="h6" noWrap component="div">
            PlanCam
          </Typography>
        )}
        
        <IconButton onClick={onToggle}>
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Informations utilisateur */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 2
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            isAdmin ? (
              <Tooltip title="Administrateur">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    border: '2px solid white'
                  }}
                />
              </Tooltip>
            ) : null
          }
        >
          <Avatar 
            sx={{ 
              width: isOpen ? 56 : 40, 
              height: isOpen ? 56 : 40,
              cursor: 'pointer',
              bgcolor: isAdmin ? 'primary.main' : 'secondary.main'
            }}
            onClick={handleUserMenuOpen}
          >
            {getUserInitials()}
          </Avatar>
        </Badge>
        
        {isOpen && currentUser && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="subtitle1" noWrap>
              {currentUser.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {isAdmin ? 'Administrateur' : 'Utilisateur'}
            </Typography>
            {isAdmin && isAdminMode && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'inline-block', 
                  mt: 0.5, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                Mode Admin
              </Typography>
            )}
          </Box>
        )}
        
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <UserIcon size={18} />
            </ListItemIcon>
            <ListItemText>Mon profil</ListItemText>
          </MenuItem>
          
          {isAdmin && (
            <MenuItem onClick={handleToggleAdminMode}>
              <ListItemIcon>
                <SettingsIcon size={18} />
              </ListItemIcon>
              <ListItemText>{isAdminMode ? 'Quitter le mode admin' : 'Mode admin'}</ListItemText>
            </MenuItem>
          )}
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogOutIcon size={18} />
            </ListItemIcon>
            <ListItemText>Déconnexion</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      
      <Divider />
      
      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
            }}
            onClick={onOpenProjectManager}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <FolderIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Projets" 
              sx={{ opacity: isOpen ? 1 : 0 }} 
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
            }}
            onClick={handleUploadClick}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <UploadIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Charger PDF" 
              sx={{ opacity: isOpen ? 1 : 0 }} 
            />
          </ListItemButton>
        </ListItem>
        
        <input
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
            }}
            onClick={previewPdf}
            disabled={!pdfFile}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : 'auto',
                justifyContent: 'center',
                color: !pdfFile ? 'action.disabled' : 'inherit'
              }}
            >
              <EyeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Prévisualiser" 
              sx={{ opacity: isOpen ? 1 : 0 }} 
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
            }}
            onClick={exportCurrentPage}
            disabled={!pdfFile}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : 'auto',
                justifyContent: 'center',
                color: !pdfFile ? 'action.disabled' : 'inherit'
              }}
            >
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Exporter page" 
              sx={{ opacity: isOpen ? 1 : 0 }} 
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
            }}
            onClick={exportPdf}
            disabled={!pdfFile}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : 'auto',
                justifyContent: 'center',
                color: !pdfFile ? 'action.disabled' : 'inherit'
              }}
            >
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Exporter tout" 
              sx={{ opacity: isOpen ? 1 : 0 }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        {isOpen ? (
          <Typography variant="caption" color="text.secondary" align="center">
            PlanCam v1.0.0
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" align="center">
            v1.0
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
