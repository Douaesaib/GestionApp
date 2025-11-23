import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtenir tous les retours
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const retours = db.prepare(`
      SELECT 
        r.id,
        r.client_id as clientId,
        c.nom || ' ' || c.prenom as clientName,
        r.vente_id as venteId,
        r.product_id as productId,
        r.product_name as productName,
        r.quantity,
        r.date,
        r.created_at as createdAt
      FROM retours r
      JOIN clients c ON r.client_id = c.id
      ORDER BY r.date DESC
    `).all();

    res.json({ retours });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un retour par ID
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const retour = db.prepare(`
      SELECT 
        r.id,
        r.client_id as clientId,
        c.nom || ' ' || c.prenom as clientName,
        r.vente_id as venteId,
        r.product_id as productId,
        r.product_name as productName,
        r.quantity,
        r.date,
        r.created_at as createdAt
      FROM retours r
      JOIN clients c ON r.client_id = c.id
      WHERE r.id = ?
    `).get(req.params.id) as any;

    if (!retour) {
      return res.status(404).json({ error: 'Retour non trouvé' });
    }

    res.json({ retour });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un retour
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { clientId, venteId, productId, productName, quantity } = req.body;

    if (!clientId || !venteId || !productId || !productName || !quantity) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier que le client existe
    const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Vérifier que la vente existe
    const vente = db.prepare('SELECT id FROM ventes WHERE id = ?').get(venteId);
    if (!vente) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    // Vérifier que le produit existe
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Créer le retour et mettre à jour le stock
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO retours (id, client_id, vente_id, product_id, product_name, quantity, date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, clientId, venteId, productId, productName, quantity, now, now);

      // Remettre le produit en stock
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(quantity, productId);
    });

    transaction();

    const retour = db.prepare(`
      SELECT 
        r.id,
        r.client_id as clientId,
        c.nom || ' ' || c.prenom as clientName,
        r.vente_id as venteId,
        r.product_id as productId,
        r.product_name as productName,
        r.quantity,
        r.date,
        r.created_at as createdAt
      FROM retours r
      JOIN clients c ON r.client_id = c.id
      WHERE r.id = ?
    `).get(id);

    res.status(201).json({ retour });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un retour
router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const retour = db.prepare('SELECT id, product_id, quantity FROM retours WHERE id = ?').get(req.params.id) as any;
    if (!retour) {
      return res.status(404).json({ error: 'Retour non trouvé' });
    }

    // Supprimer le retour et ajuster le stock
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM retours WHERE id = ?').run(req.params.id);
      // Retirer le produit du stock (inverse du retour)
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(retour.quantity, retour.product_id);
    });

    transaction();

    res.json({ message: 'Retour supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

