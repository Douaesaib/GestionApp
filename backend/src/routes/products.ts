import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Tous les endpoints nécessitent une authentification
router.use(authenticateToken);

// Obtenir tous les produits
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const products = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        name,
        price_gros as priceGros,
        price_detail as priceDetail,
        stock,
        stock_critique as stockCritique,
        created_at as createdAt,
        updated_at as updatedAt
      FROM products
      ORDER BY name
    `).all();

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un produit par ID
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const product = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        name,
        price_gros as priceGros,
        price_detail as priceDetail,
        stock,
        stock_critique as stockCritique,
        created_at as createdAt,
        updated_at as updatedAt
      FROM products
      WHERE id = ?
    `).get(req.params.id) as any;

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un produit
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { name, priceGros, priceDetail, stock, stockCritique } = req.body;

    if (!name || priceGros === undefined || priceDetail === undefined) {
      return res.status(400).json({ error: 'Nom, prix gros et prix détail requis' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO products (id, user_id, name, price_gros, price_detail, stock, stock_critique, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.userId,
      name,
      priceGros,
      priceDetail,
      stock || 0,
      stockCritique || 0,
      now,
      now
    );

    const product = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        name,
        price_gros as priceGros,
        price_detail as priceDetail,
        stock,
        stock_critique as stockCritique,
        created_at as createdAt,
        updated_at as updatedAt
      FROM products
      WHERE id = ?
    `).get(id);

    res.status(201).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit
router.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { name, priceGros, priceDetail, stock, stockCritique } = req.body;

    const existingProduct = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products
      SET name = ?, price_gros = ?, price_detail = ?, stock = ?, stock_critique = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name,
      priceGros,
      priceDetail,
      stock,
      stockCritique,
      now,
      req.params.id
    );

    const product = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        name,
        price_gros as priceGros,
        price_detail as priceDetail,
        stock,
        stock_critique as stockCritique,
        created_at as createdAt,
        updated_at as updatedAt
      FROM products
      WHERE id = ?
    `).get(req.params.id);

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const transaction = db.transaction(() => {
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const productId = req.params.id;

    // 1. Supprimer tous les retours liés à ce produit
    db.prepare('DELETE FROM retours WHERE product_id = ?').run(productId);

    // 2. Supprimer tous les items de vente liés à ce produit
    // Note: Les items de vente ne sont pas supprimés automatiquement en cascade
    // car la contrainte FOREIGN KEY (product_id) n'a pas ON DELETE CASCADE
    db.prepare('DELETE FROM vente_items WHERE product_id = ?').run(productId);

    // 3. Supprimer le produit
    db.prepare('DELETE FROM products WHERE id = ?').run(productId);

    return { message: 'Produit supprimé avec succès' };
  });

  try {
    const result = transaction();
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Produit non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

