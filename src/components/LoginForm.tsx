import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Container,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardMedia,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  AutoAwesome as MagicIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const LoginForm: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    const success = login(username, password);
    if (!success) {
      setError('Identifiants incorrects');
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Card 
        elevation={5} 
        sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Section image/info */}
        <Box 
          sx={{ 
            flex: '1 1 40%', 
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MagicIcon sx={{ fontSize: 40, mr: 1 }} />
            <Typography variant="h4" component="h1">
              PlanCam
            </Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Gestion intelligente de caméras sur plans
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
            Optimisez le placement de vos caméras de surveillance avec notre assistant IA intégré.
            Importez vos plans, positionnez vos caméras et exportez le résultat en quelques clics.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Nouvelles fonctionnalités :
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2">Assistant IA avec GPT-4o</Typography>
              <Typography component="li" variant="body2">Interface responsive</Typography>
              <Typography component="li" variant="body2">Analyse automatique des plans</Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Formulaire de connexion */}
        <Box 
          sx={{ 
            flex: '1 1 60%', 
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Connexion
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Veuillez vous connecter pour accéder à l'application
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
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
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
              startIcon={<LoginIcon />}
              sx={{ mt: 3, mb: 2 }}
            >
              Se connecter
            </Button>
            
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Utilisateur par défaut : xcel / video
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default LoginForm;
