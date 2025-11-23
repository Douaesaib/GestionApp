import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtenir toutes les ventes
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const ventes = db.prepare(`
      SELECT 
        v.id,
        v.client_id as clientId,
        c.nom || ' ' || c.prenom as clientName,
        v.user_id as userId,
        v.total,
        v.montant_paye as montantPaye,
        v.credit,
        v.date,
        v.printed,
        v.created_at as createdAt
      FROM ventes v
      JOIN clients c ON v.client_id = c.id
      ORDER BY v.date DESC
    `).all();

    // Pour chaque vente, récupérer les items
    const ventesWithItems = ventes.map((vente: any) => {
      const items = db.prepare(`
        SELECT 
          product_id as productId,
          product_name as productName,
          quantity,
          price,
          mode_vente as modeVente
        FROM vente_items
        WHERE vente_id = ?
      `).all(vente.id);

      return {
        ...vente,
        items,
      };
    });

    res.json({ ventes: ventesWithItems });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une vente par ID
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const vente = db.prepare(`
      SELECT 
        v.id,
        v.client_id as clientId,
        c.nom || ' ' || c.prenom as clientName,
        v.user_id as userId,
        v.total,
        v.montant_paye as montantPaye,
        v.credit,
        v.date,
        v.printed,
        v.created_at as createdAt
      FROM ventes v
      JOIN clients c ON v.client_id = c.id
      WHERE v.id = ?
    `).get(req.params.id) as any;

    if (!vente) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    const items = db.prepare(`
      SELECT 
        product_id as productId,
        product_name as productName,
        quantity,
        price,
        mode_vente as modeVente
      FROM vente_items
      WHERE vente_id = ?
    `).all(vente.id);

    res.json({ vente: { ...vente, items } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une vente
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { clientId, items, total, montantPaye, credit } = req.body;

    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Client et items requis' });
    }

    // Vérifier que le client existe
    const client = db.prepare('SELECT id, nom, prenom FROM clients WHERE id = ?').get(clientId) as any;
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Vérifier le stock pour chaque produit
    for (const item of items) {
      const product = db.prepare('SELECT stock, name FROM products WHERE id = ?').get(item.productId) as any;
      if (!product) {
        return res.status(404).json({ error: `Produit ${item.productId} non trouvé` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
      }
    }

    const venteId = uuidv4();
    const now = new Date().toISOString();

    // Créer la transaction
    const transaction = db.transaction(() => {
      // Créer la vente
      db.prepare(`
        INSERT INTO ventes (id, client_id, user_id, total, montant_paye, credit, date, printed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        venteId,
        clientId,
        req.userId,
        total,
        montantPaye || 0,
        credit || 0,
        now,
        0
      );

      // Créer les items de vente
      const insertItem = db.prepare(`
        INSERT INTO vente_items (id, vente_id, product_id, product_name, quantity, price, mode_vente)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        const itemId = uuidv4();
        insertItem.run(
          itemId,
          venteId,
          item.productId,
          item.productName,
          item.quantity,
          item.price,
          item.modeVente
        );

        // Mettre à jour le stock
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.productId);
      }

      // Mettre à jour le crédit du client
      db.prepare('UPDATE clients SET credit = credit + ? WHERE id = ?').run(credit || 0, clientId);
    });

    transaction();

    // Récupérer la vente créée
    const vente = db.prepare(`
      SELECT 
        v.id,
        v.client_id as clientId,
        c.nom || ' ' || c.prenom as clientName,
        v.user_id as userId,
        v.total,
        v.montant_paye as montantPaye,
        v.credit,
        v.date,
        v.printed,
        v.created_at as createdAt
      FROM ventes v
      JOIN clients c ON v.client_id = c.id
      WHERE v.id = ?
    `).get(venteId) as any;

    const venteItems = db.prepare(`
      SELECT 
        product_id as productId,
        product_name as productName,
        quantity,
        price,
        mode_vente as modeVente
      FROM vente_items
      WHERE vente_id = ?
    `).all(venteId);

    res.status(201).json({ vente: { ...vente, items: venteItems } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Marquer une vente comme imprimée
router.patch('/:id/print', (req: AuthRequest, res: Response) => {
  try {
    const vente = db.prepare('SELECT id FROM ventes WHERE id = ?').get(req.params.id);
    if (!vente) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    db.prepare('UPDATE ventes SET printed = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Vente marquée comme imprimée' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

