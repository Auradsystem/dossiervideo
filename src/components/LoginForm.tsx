import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Container,
  CircularProgress,
  Link,
  Tabs,
  Tab
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import { supabase, supabaseAuth } from '../lib/supabase';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { login, isSyncing } = useAppContext();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { user, error: signUpError } = await supabaseAuth.signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (user) {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTabValue(0); // Basculer vers l'onglet de connexion
      } else {
        setSuccess('Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      if (error.message.includes('already registered')) {
        setError('Cet email est déjà utilisé');
      } else {
        setError(error.message || 'Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Appeler la fonction de réinitialisation du mot de passe de Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setResetSent(true);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      setError('Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          borderRadius: 2
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            PlanCam
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gestion de caméras sur plans
          </Typography>
          
          {isSyncing && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Connexion en cours...
              </Typography>
            </Box>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {resetSent && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Un email de réinitialisation a été envoyé à votre adresse email.
          </Alert>
        )}
        
        {isResetMode ? (
          <Box component="form" onSubmit={handleResetPassword}>
            <Typography variant="h6" gutterBottom>
              Réinitialisation du mot de passe
            </Typography>
            
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Envoyer le lien de réinitialisation'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => setIsResetMode(false)}
                underline="hover"
              >
                Retour à la connexion
              </Link>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth tabs" centered>
                <Tab label="Connexion" />
                <Tab label="Inscription" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  disabled={isLoading}
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
                />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  sx={{ mt: 3 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Se connecter'}
                </Button>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={() => setIsResetMode(true)}
                    underline="hover"
                  >
                    Mot de passe oublié ?
                  </Link>
                </Box>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleSignUp}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  disabled={isLoading}
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
                />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  sx={{ mt: 3 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'S\'inscrire'}
                </Button>
              </Box>
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default LoginForm;
