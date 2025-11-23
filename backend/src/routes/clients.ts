import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtenir tous les clients
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const clients = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        nom,
        prenom,
        adresse,
        telephone,
        credit,
        created_at as createdAt,
        updated_at as updatedAt
      FROM clients
      ORDER BY nom, prenom
    `).all();

    res.json({ clients });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un client par ID
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const client = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        nom,
        prenom,
        adresse,
        telephone,
        credit,
        created_at as createdAt,
        updated_at as updatedAt
      FROM clients
      WHERE id = ?
    `).get(req.params.id) as any;

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({ client });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un client
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { nom, prenom, adresse, telephone, credit } = req.body;

    if (!nom || !prenom || !telephone) {
      return res.status(400).json({ error: 'Nom, prénom et téléphone requis' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO clients (id, user_id, nom, prenom, adresse, telephone, credit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.userId,
      nom,
      prenom,
      adresse || null,
      telephone,
      credit || 0,
      now,
      now
    );

    const client = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        nom,
        prenom,
        adresse,
        telephone,
        credit,
        created_at as createdAt,
        updated_at as updatedAt
      FROM clients
      WHERE id = ?
    `).get(id);

    res.status(201).json({ client });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un client
router.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { nom, prenom, adresse, telephone, credit } = req.body;

    const existingClient = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
    if (!existingClient) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE clients
      SET nom = ?, prenom = ?, adresse = ?, telephone = ?, credit = ?, updated_at = ?
      WHERE id = ?
    `).run(
      nom,
      prenom,
      adresse || null,
      telephone,
      credit,
      now,
      req.params.id
    );

    const client = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        nom,
        prenom,
        adresse,
        telephone,
        credit,
        created_at as createdAt,
        updated_at as updatedAt
      FROM clients
      WHERE id = ?
    `).get(req.params.id);

    res.json({ client });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un client
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const transaction = db.transaction(() => {
    const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      throw new Error('Client non trouvé');
    }

    const clientId = req.params.id;

    // 1. Supprimer tous les retours liés à ce client
    db.prepare('DELETE FROM retours WHERE client_id = ?').run(clientId);

    // 2. Récupérer toutes les ventes de ce client
    const ventes = db.prepare('SELECT id FROM ventes WHERE client_id = ?').all(clientId) as { id: string }[];
    
    // 3. Pour chaque vente, supprimer les items (CASCADE automatique via vente_id)
    // Les items sont supprimés automatiquement grâce à ON DELETE CASCADE
    // Mais on doit supprimer les ventes manuellement
    for (const vente of ventes) {
      // Les vente_items seront supprimés automatiquement grâce à ON DELETE CASCADE
      db.prepare('DELETE FROM ventes WHERE id = ?').run(vente.id);
    }

    // 4. Supprimer le client
    db.prepare('DELETE FROM clients WHERE id = ?').run(clientId);

    return { message: 'Client supprimé avec succès' };
  });

  try {
    const result = transaction();
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Client non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

