// Serveur Express simple pour l'API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://votre-domaine-production.com'],
  credentials: true
}));
app.use(bodyParser.json());

// Dossier pour stocker les données
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Créer le dossier de données s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fonction pour lire les utilisateurs
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des utilisateurs:', error);
    return [];
  }
};

// Fonction pour écrire les utilisateurs
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture des utilisateurs:', error);
    return false;
  }
};

// Fonction pour hacher un mot de passe
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

// Fonction pour vérifier un mot de passe
const verifyPassword = (password, salt, hash) => {
  const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return passwordHash === hash;
};

// Initialiser les utilisateurs par défaut si nécessaire
app.post('/api/users/init', (req, res) => {
  const { users } = req.body;
  
  if (!users || !Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'Données d\'utilisateurs invalides' });
  }
  
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(USERS_FILE)) {
    return res.status(200).json({ message: 'Les utilisateurs sont déjà initialisés' });
  }
  
  // Sécuriser les mots de passe avant de les stocker
  const secureUsers = users.map(user => {
    const { salt, hash } = hashPassword(user.password);
    return {
      ...user,
      password: undefined, // Ne pas stocker le mot de passe en clair
      passwordHash: hash,
      salt
    };
  });
  
  // Écrire les utilisateurs dans le fichier
  if (writeUsers(secureUsers)) {
    res.status(201).json({ message: 'Utilisateurs initialisés avec succès' });
  } else {
    res.status(500).json({ message: 'Erreur lors de l\'initialisation des utilisateurs' });
  }
});

// Récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  const users = readUsers();
  
  // Ne pas renvoyer les informations sensibles
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }));
  
  res.json(safeUsers);
});

// Ajouter un nouvel utilisateur
app.post('/api/users', (req, res) => {
  const { username, password, isAdmin } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
  }
  
  const users = readUsers();
  
  // Vérifier si l'utilisateur existe déjà
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ message: 'Ce nom d\'utilisateur existe déjà' });
  }
  
  // Hacher le mot de passe
  const { salt, hash } = hashPassword(password);
  
  // Créer le nouvel utilisateur
  const newUser = {
    id: req.body.id || crypto.randomUUID(),
    username,
    passwordHash: hash,
    salt,
    isAdmin: !!isAdmin,
    createdAt: new Date().toISOString()
  };
  
  // Ajouter l'utilisateur à la liste
  users.push(newUser);
  
  // Sauvegarder la liste mise à jour
  if (writeUsers(users)) {
    // Renvoyer une version sécurisée de l'utilisateur
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json(safeUser);
  } else {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'utilisateur' });
  }
});

// Mettre à jour un utilisateur
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, password, isAdmin } = req.body;
  
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  // Vérifier si le nouveau nom d'utilisateur existe déjà
  if (username && username !== users[userIndex].username) {
    const usernameExists = users.some(u => 
      u.id !== id && u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (usernameExists) {
      return res.status(409).json({ message: 'Ce nom d\'utilisateur existe déjà' });
    }
  }
  
  // Mettre à jour l'utilisateur
  const updatedUser = { ...users[userIndex] };
  
  if (username) {
    updatedUser.username = username;
  }
  
  if (password) {
    const { salt, hash } = hashPassword(password);
    updatedUser.passwordHash = hash;
    updatedUser.salt = salt;
  }
  
  if (isAdmin !== undefined) {
    updatedUser.isAdmin = !!isAdmin;
  }
  
  // Mettre à jour la liste des utilisateurs
  users[userIndex] = updatedUser;
  
  // Sauvegarder la liste mise à jour
  if (writeUsers(users)) {
    // Renvoyer une version sécurisée de l'utilisateur
    const safeUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin
    };
    
    res.json(safeUser);
  } else {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  // Empêcher la suppression de l'utilisateur admin principal
  if (users[userIndex].username === 'Dali') {
    return res.status(403).json({ message: 'Impossible de supprimer l\'administrateur principal' });
  }
  
  // Supprimer l'utilisateur
  users.splice(userIndex, 1);
  
  // Sauvegarder la liste mise à jour
  if (writeUsers(users)) {
    res.status(204).send();
  } else {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Connexion
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ message: 'Identifiants incorrects' });
  }
  
  // Mettre à jour la date de dernière connexion
  user.lastLogin = new Date().toISOString();
  writeUsers(users);
  
  // Créer un token simple (à remplacer par JWT dans un environnement de production)
  const token = crypto.randomBytes(32).toString('hex');
  
  // Renvoyer une version sécurisée de l'utilisateur
  const safeUser = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
  
  res.json({ user: safeUser, token });
});

// Vérifier la session
app.get('/api/auth/check', (req, res) => {
  // Dans une implémentation réelle, vérifiez le token JWT ici
  // Pour cet exemple simple, nous renvoyons toujours valide
  res.json({ valid: true });
});

// Déconnexion
app.post('/api/auth/logout', (req, res) => {
  // Dans une implémentation réelle, invalidez le token JWT ici
  res.status(200).json({ message: 'Déconnecté avec succès' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur le port ${PORT}`);
});
