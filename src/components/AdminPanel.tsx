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
  Divider,
  Tab,
  Tabs,
  Switch
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { supabase, getServiceSupabase } from '../lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const { 
    register,
    currentUser, 
    isSyncing
  } = useAppContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [serviceKeyMissing, setServiceKeyMissing] = useState(false);
  const [useAdminApi, setUseAdminApi] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Charger les utilisateurs
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Utiliser le client avec la clé de service pour les opérations admin
      const serviceClient = getServiceSupabase();
      
      if (!serviceClient) {
        setServiceKeyMissing(true);
        setError('Clé de service Supabase manquante. Impossible de charger les utilisateurs.');
        setIsLoadingUsers(false);
        return;
      }
      
      const { data, error } = await serviceClient.auth.admin.listUsers();
      
      if (error) throw error;
      
      if (data) {
        setUsers(data.users);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Impossible de charger la liste des utilisateurs: ' + error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Charger les utilisateurs au montage
  useEffect(() => {
    loadUsers();
  }, []);

  // Gérer le changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsAdmin(false);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      if (!email) {
        setError('L\'email est requis');
        setIsLoading(false);
        return;
      }
      
      if (!password) {
        setError('Le mot de passe est requis');
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setIsLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        setIsLoading(false);
        return;
      }
      
      if (useAdminApi) {
        // Utiliser le client avec la clé de service pour créer un utilisateur
        const serviceClient = getServiceSupabase();
        
        if (!serviceClient) {
          setServiceKeyMissing(true);
          setError('Clé de service Supabase manquante. Impossible de créer un utilisateur avec l\'API Admin.');
          setIsLoading(false);
          return;
        }
        
        // Créer un nouvel utilisateur avec le client de service
        const { data, error: createError } = await serviceClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Confirmer automatiquement l'email
          user_metadata: { is_admin: isAdmin }
        });
        
        if (createError) throw createError;
        
        if (data.user) {
          setSuccess(`L'utilisateur ${email} a été créé avec succès`);
          resetForm();
          
          // Recharger la liste des utilisateurs
          await loadUsers();
        } else {
          setError('Erreur lors de la création de l\'utilisateur: Aucune donnée retournée');
        }
      } else {
        // Utiliser l'API standard de Supabase
        const success = await register(email, password, isAdmin);
        
        if (success) {
          setSuccess(`L'utilisateur ${email} a été créé avec succès. Un email de confirmation a été envoyé.`);
          resetForm();
          
          // Recharger la liste des utilisateurs
          await loadUsers();
        } else {
          setError('Erreur lors de la création de l\'utilisateur');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Jamais';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Utiliser le client avec la clé de service pour supprimer un utilisateur
      const serviceClient = getServiceSupabase();
      
      if (!serviceClient) {
        setServiceKeyMissing(true);
        setError('Clé de service Supabase manquante. Impossible de supprimer l\'utilisateur.');
        setIsLoading(false);
        return;
      }
      
      const { error } = await serviceClient.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      setSuccess('Utilisateur supprimé avec succès');
      
      // Recharger la liste des utilisateurs
      await loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      setError(error.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Administration
      </Typography>
      
      {serviceKeyMissing && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          La clé de service Supabase n'est pas configurée. Certaines fonctionnalités d'administration ne seront pas disponibles.
          Veuillez ajouter la clé de service dans le fichier .env (SUPABASE_SERVICE_KEY).
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Ajouter un utilisateur" />
          <Tab label="Gérer les utilisateurs" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Ajouter un utilisateur
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
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              API Standard
            </Typography>
            <Switch
              checked={useAdminApi}
              onChange={(e) => setUseAdminApi(e.target.checked)}
              inputProps={{ 'aria-label': 'toggle API mode' }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              API Admin
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <TextField
              label="Mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
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
            
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Ajouter'}
            </Button>
          </Box>
          
          {!useAdminApi && (
            <Alert severity="info" sx={{ mt: 2 }}>
              En utilisant l'API standard, un email de confirmation sera envoyé à l'utilisateur.
            </Alert>
          )}
          
          {useAdminApi && (
            <Alert severity="info" sx={{ mt: 2 }}>
              En utilisant l'API Admin, l'utilisateur sera créé avec l'email déjà confirmé et pourra se connecter immédiatement.
            </Alert>
          )}
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Liste des utilisateurs
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            disabled={isLoadingUsers}
          >
            Actualiser
          </Button>
        </Box>
        
        {isLoadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Créé le</TableCell>
                  <TableCell>Dernière connexion</TableCell>
                  <TableCell>Email confirmé</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} sx={{ 
                      backgroundColor: user.id === currentUser?.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                    }}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.user_metadata?.is_admin ? 'Administrateur' : 'Utilisateur'}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                      <TableCell>{user.email_confirmed_at ? 'Oui' : 'Non'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton disabled>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Supprimer">
                          <span>
                            <IconButton 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id || isLoading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Note: Vous ne pouvez pas supprimer votre propre compte.
        </Typography>
      </TabPanel>
    </Box>
  );
};

export default AdminPanel;
