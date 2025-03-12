import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Supabase
const SUPABASE_URL = 'https://kvoezelnkzfvyikicjyr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'votre_clé_de_service_supabase';

// Créer le client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Route pour vérifier si le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur PlanCam opérationnel' });
});

// Route pour récupérer tous les utilisateurs (nécessite la clé de service)
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    res.json(data.users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer un utilisateur (nécessite la clé de service)
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'L\'email et le mot de passe sont requis' });
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_admin: isAdmin || false }
    });
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erreur lors de la création d\'un utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour un utilisateur (nécessite la clé de service)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, isAdmin } = req.body;
    
    const updates: any = {};
    
    if (email) updates.email = email;
    if (password) updates.password = password;
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      id,
      updates
    );
    
    if (error) throw error;
    
    // Mettre à jour les métadonnées si isAdmin est défini
    if (isAdmin !== undefined) {
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        id,
        { user_metadata: { is_admin: isAdmin } }
      );
      
      if (metadataError) throw metadataError;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'un utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer un utilisateur (nécessite la clé de service)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur PlanCam démarré sur le port ${port}`);
});

export default app;
