import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouvel utilisateur (seulement pour le commercial)
router.post('/register', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'commercial') {
      return res.status(403).json({ error: 'Seul le commercial peut créer des utilisateurs' });
    }

    const { username, password, role, nom, prenom } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password et role requis' });
    }

    if (role !== 'commercial' && role !== 'vendeur') {
      return res.status(400).json({ error: 'Role doit être "commercial" ou "vendeur"' });
    }

    // Vérifier si l'username existe déjà
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, username, password, role, nom, prenom)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, username, hashedPassword, role, nom || null, prenom || null);

    res.status(201).json({ message: 'Utilisateur créé avec succès', userId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le profil de l'utilisateur connecté
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, username, role, nom, prenom, created_at FROM users WHERE id = ?').get(req.userId) as any;
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lister tous les utilisateurs (seulement pour le commercial)
router.get('/users', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'commercial') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const users = db.prepare(`
      SELECT id, username, role, nom, prenom, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

