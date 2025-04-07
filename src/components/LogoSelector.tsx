import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  Typography
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

interface LogoSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (logoId: string) => void;
}

const LogoSelector: React.FC<LogoSelectorProps> = ({ open, onClose, onSelect }) => {
  const { availableLogos } = useAppContext();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Sélectionner un logo</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {availableLogos.map((logo) => (
            <Grid item xs={6} sm={4} key={logo.id}>
              <Card>
                <CardActionArea onClick={() => onSelect(logo.id)}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={logo.url}
                    alt={logo.name}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                  <Typography variant="body2" align="center" sx={{ pb: 1 }}>
                    {logo.name}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoSelector;
