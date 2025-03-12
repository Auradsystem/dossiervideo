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
  Link
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, isSyncing } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
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
          <Box component="form" onSubmit={handleSubmit}>
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
        )}
      </Paper>
    </Container>
  );
};

export default LoginForm;
