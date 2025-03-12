import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Supabase
const supabaseUrl = 'https://kvoezelnkzfvyikicjyr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b2V6ZWxua3pmdnlpa2ljanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDkwMzIsImV4cCI6MjA1NzM4NTAzMn0.Hf3ohn_zlFRQG8kAiVm58Ng4EGkV2HLTXlpwkkp_CiM';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Route pour vérifier si le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur PlanCam opérationnel' });
});

// Route pour récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer un utilisateur
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Le nom d\'utilisateur et le mot de passe sont requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      return res.status(409).json({ error: 'Ce nom d\'utilisateur existe déjà' });
    }
    
    // Créer l'utilisateur
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username,
        password, // Note: Dans une vraie application, le mot de passe devrait être haché
        is_admin: isAdmin || false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erreur lors de la création d\'un utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour un utilisateur
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, isAdmin } = req.body;
    
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (password !== undefined && password !== '') updates.password = password;
    if (isAdmin !== undefined) updates.is_admin = isAdmin;
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'un utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer un utilisateur
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si c'est l'admin principal
    const { data: user } = await supabase
      .from('users')
      .select('username')
      .eq('id', id)
      .single();
    
    if (user && user.username === 'Dali') {
      return res.status(403).json({ error: 'Impossible de supprimer l\'administrateur principal' });
    }
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour l'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Le nom d\'utilisateur et le mot de passe sont requis' });
    }
    
    // Rechercher l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    // Mettre à jour la date de dernière connexion
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Convertir les champs pour correspondre au format de l'application
    const appUser = {
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };
    
    res.json({ user: appUser });
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur PlanCam démarré sur le port ${port}`);
});

export default app;
