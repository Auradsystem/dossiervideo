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
  Tabs
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

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

  // Charger les utilisateurs
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      if (data) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Impossible de charger la liste des utilisateurs');
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
      
      // Créer un nouvel utilisateur
      const success = await register(email, password, isAdmin);
      
      if (success) {
        setSuccess(`L'utilisateur ${email} a été créé`);
        resetForm();
        
        // Recharger la liste des utilisateurs
        await loadUsers();
      } else {
        setError('Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
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

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Administration
      </Typography>
      
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton disabled>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Supprimer">
                          <span>
                            <IconButton disabled>
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
          Note: La gestion complète des utilisateurs nécessite des droits d'administration Supabase.
        </Typography>
      </TabPanel>
    </Box>
  );
};

export default AdminPanel;
