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
  const [serviceKeyMissing, setServiceKeyMissing] = useState(true); // Définir à true par défaut puisque nous n'utilisons plus l'API admin
  const [useAdminApi, setUseAdminApi] = useState(false); // Définir à false par défaut
  const [confirmPassword, setConfirmPassword] = useState('');

  // Charger les utilisateurs
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Puisque nous n'utilisons plus l'API admin, nous pouvons simplement afficher un message
      setServiceKeyMissing(true);
      setError('La gestion des utilisateurs via l\'API Admin n\'est pas disponible. Utilisez le dashboard Supabase pour gérer les utilisateurs.');
      setIsLoadingUsers(false);
      return;
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
      
      // Utiliser l'API standard de Supabase
      const success = await register(email, password, isAdmin);
      
      if (success) {
        setSuccess(`L'utilisateur ${email} a été créé avec succès. Un email de confirmation a été envoyé.`);
        resetForm();
      } else {
        setError('Erreur lors de la création de l\'utilisateur');
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
      setError('La suppression d\'utilisateurs via l\'API n\'est pas disponible. Utilisez le dashboard Supabase pour gérer les utilisateurs.');
      setIsLoading(false);
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
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Pour une gestion complète des utilisateurs, veuillez utiliser le dashboard Supabase. 
        Cette interface permet uniquement de créer de nouveaux utilisateurs.
      </Alert>
      
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
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Un email de confirmation sera envoyé à l'utilisateur.
          </Alert>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Liste des utilisateurs
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          La gestion des utilisateurs via l'API n'est pas disponible. Veuillez utiliser le dashboard Supabase pour gérer les utilisateurs.
        </Alert>
        
        <Button 
          variant="contained" 
          href="https://app.supabase.com/project/kvoezelnkzfvyikicjyr/auth/users" 
          target="_blank"
          rel="noopener noreferrer"
        >
          Ouvrir le dashboard Supabase
        </Button>
      </TabPanel>
    </Box>
  );
};

export default AdminPanel;
