import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { User } from '../types/User';

const AdminPanel: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    currentUser, 
    syncWithCloud,
    isSyncing,
    lastSyncTime,
    syncError
  } = useAppContext();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setIsAdmin(false);
    setEditingUser(null);
    setIsEditing(false);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      if (!username) {
        setError('Le nom d\'utilisateur est requis');
        setIsLoading(false);
        return;
      }
      
      if (!isEditing && !password) {
        setError('Le mot de passe est requis');
        setIsLoading(false);
        return;
      }
      
      // Vérifier si le nom d'utilisateur existe déjà (sauf pour l'édition)
      if (!isEditing && users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Ce nom d\'utilisateur existe déjà');
        setIsLoading(false);
        return;
      }
      
      if (isEditing && editingUser) {
        // Mettre à jour l'utilisateur existant
        const updates: Partial<User> = { 
          username,
          isAdmin
        };
        
        // Ne mettre à jour le mot de passe que s'il a été modifié
        if (password) {
          updates.password = password;
        }
        
        await updateUser(editingUser.id, updates);
        setSuccess(`L'utilisateur ${username} a été mis à jour`);
      } else {
        // Créer un nouvel utilisateur
        await addUser(username, password, isAdmin);
        setSuccess(`L'utilisateur ${username} a été créé`);
      }
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'utilisateur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'édition d'un utilisateur
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(''); // Ne pas afficher le mot de passe actuel
    setIsAdmin(user.isAdmin);
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (userToDelete) {
      setIsLoading(true);
      try {
        await deleteUser(userToDelete.id);
        setSuccess(`L'utilisateur ${userToDelete.username} a été supprimé`);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
      } finally {
        setIsLoading(false);
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      }
    }
  };

  // Gérer la synchronisation manuelle
  const handleSync = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      await syncWithCloud();
      setSuccess('Synchronisation réussie');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setError('Erreur lors de la synchronisation');
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Jamais';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gestion des utilisateurs
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<SyncIcon />}
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
        </Button>
      </Box>
      
      {syncError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur de synchronisation: {syncError}
        </Alert>
      )}
      
      {lastSyncTime && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Dernière synchronisation: {formatDate(lastSyncTime)}
        </Typography>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nom d'utilisateur"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          
          <TextField
            label={isEditing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEditing}
            disabled={isLoading}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Administrateur"
            sx={{ mt: 1 }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            
            {isEditing && (
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={isLoading}
              >
                Annuler
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Liste des utilisateurs ({users.length})
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Créé le</TableCell>
              <TableCell>Dernière connexion</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ 
                backgroundColor: user.id === currentUser?.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
              }}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.isAdmin ? 'Administrateur' : 'Utilisateur'}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{formatDate(user.lastLogin)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Modifier">
                    <IconButton 
                      onClick={() => handleEdit(user)}
                      disabled={isLoading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Supprimer">
                    <span>
                      <IconButton 
                        onClick={() => handleDeleteClick(user)}
                        disabled={
                          isLoading || 
                          user.username === 'Dali' || // Empêcher la suppression de l'admin principal
                          user.id === currentUser?.id // Empêcher la suppression de soi-même
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.username}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
