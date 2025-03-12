import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { User } from '../types/User';

const AdminPanel: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    currentUser,
    isAdmin
  } = useAppContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (!isAdmin) {
      setSnackbar({
        open: true,
        message: 'Vous n\'avez pas les droits d\'administration',
        severity: 'error'
      });
    }
  }, [isAdmin]);

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setIsUserAdmin(false);
    setError('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setUsername(user.username);
    setPassword('');
    setConfirmPassword('');
    setIsUserAdmin(user.isAdmin);
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const validateForm = (): boolean => {
    // Vérifier que le nom d'utilisateur n'est pas vide
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est obligatoire');
      return false;
    }

    // Vérifier que le nom d'utilisateur n'existe pas déjà (sauf pour l'édition du même utilisateur)
    const userExists = users.some(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      (!selectedUser || u.id !== selectedUser.id)
    );
    
    if (userExists) {
      setError('Ce nom d\'utilisateur existe déjà');
      return false;
    }

    // Pour l'ajout ou si le mot de passe est modifié lors de l'édition
    if (dialogMode === 'add' || password) {
      // Vérifier que le mot de passe n'est pas vide
      if (!password) {
        setError('Le mot de passe est obligatoire');
        return false;
      }

      // Vérifier que le mot de passe a au moins 4 caractères
      if (password.length < 4) {
        setError('Le mot de passe doit contenir au moins 4 caractères');
        return false;
      }

      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      if (dialogMode === 'add') {
        // Ajouter un nouvel utilisateur
        addUser(username, password, isUserAdmin);
        setSnackbar({
          open: true,
          message: 'Utilisateur ajouté avec succès',
          severity: 'success'
        });
      } else if (selectedUser) {
        // Mettre à jour un utilisateur existant
        const updates: Partial<User> = {
          username,
          isAdmin: isUserAdmin
        };
        
        // N'inclure le mot de passe que s'il a été modifié
        if (password) {
          updates.password = password;
        }
        
        updateUser(selectedUser.id, updates);
        setSnackbar({
          open: true,
          message: 'Utilisateur mis à jour avec succès',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'utilisateur:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      try {
        deleteUser(user.id);
        setSnackbar({
          open: true,
          message: 'Utilisateur supprimé avec succès',
          severity: 'success'
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression de l\'utilisateur',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Formater la date pour l'affichage
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleString('fr-FR');
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Vous n'avez pas les droits d'accès à cette page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des utilisateurs
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nom d'utilisateur</TableCell>
                <TableCell>Administrateur</TableCell>
                <TableCell>Créé le</TableCell>
                <TableCell>Dernière connexion</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.username === 'Dali' || (currentUser && user.id === currentUser.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogue d'ajout/modification d'utilisateur */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Ajouter un utilisateur' : 'Modifier un utilisateur'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Nom d'utilisateur"
            type="text"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={dialogMode === 'edit' ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            required={dialogMode === 'add'}
          />
          <TextField
            margin="dense"
            label="Confirmer le mot de passe"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
            required={dialogMode === 'add' || password.length > 0}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isUserAdmin}
                onChange={(e) => setIsUserAdmin(e.target.checked)}
                disabled={selectedUser?.username === 'Dali'} // Empêcher de modifier le statut admin de l'utilisateur principal
              />
            }
            label="Administrateur"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Ajouter' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
