import db from './db';
import bcrypt from 'bcryptjs';

export function runMigrations() {
  console.log('Running database migrations...');

  // Table des utilisateurs (commercial et vendeurs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('commercial', 'vendeur')),
      nom TEXT,
      prenom TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des produits
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price_gros REAL NOT NULL,
      price_detail REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      stock_critique INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des clients
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      adresse TEXT,
      telephone TEXT NOT NULL,
      credit REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des ventes
  db.exec(`
    CREATE TABLE IF NOT EXISTS ventes (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      total REAL NOT NULL,
      montant_paye REAL NOT NULL,
      credit REAL NOT NULL DEFAULT 0,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      printed INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des items de vente
  db.exec(`
    CREATE TABLE IF NOT EXISTS vente_items (
      id TEXT PRIMARY KEY,
      vente_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      mode_vente TEXT NOT NULL CHECK(mode_vente IN ('gros', 'detail')),
      FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Table des retours
  db.exec(`
    CREATE TABLE IF NOT EXISTS retours (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      vente_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (vente_id) REFERENCES ventes(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Migration: Ajouter user_id aux tables existantes si elles n'ont pas cette colonne
  try {
    // Vérifier si la colonne user_id existe dans products
    const productsColumns = db.prepare("PRAGMA table_info(products)").all() as any[];
    const hasUserIdInProducts = productsColumns.some(col => col.name === 'user_id');
    
    if (!hasUserIdInProducts) {
      console.log('Adding user_id column to products table...');
      db.exec(`
        ALTER TABLE products ADD COLUMN user_id TEXT;
        UPDATE products SET user_id = (SELECT id FROM users WHERE role = 'commercial' LIMIT 1);
        CREATE TABLE products_new (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          price_gros REAL NOT NULL,
          price_detail REAL NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          stock_critique INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        INSERT INTO products_new SELECT * FROM products;
        DROP TABLE products;
        ALTER TABLE products_new RENAME TO products;
      `);
    }

    // Vérifier si la colonne user_id existe dans clients
    const clientsColumns = db.prepare("PRAGMA table_info(clients)").all() as any[];
    const hasUserIdInClients = clientsColumns.some(col => col.name === 'user_id');
    
    if (!hasUserIdInClients) {
      console.log('Adding user_id column to clients table...');
      db.exec(`
        ALTER TABLE clients ADD COLUMN user_id TEXT;
        UPDATE clients SET user_id = (SELECT id FROM users WHERE role = 'commercial' LIMIT 1);
        CREATE TABLE clients_new (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          nom TEXT NOT NULL,
          prenom TEXT NOT NULL,
          adresse TEXT,
          telephone TEXT NOT NULL,
          credit REAL NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        INSERT INTO clients_new SELECT * FROM clients;
        DROP TABLE clients;
        ALTER TABLE clients_new RENAME TO clients;
      `);
    }
  } catch (error: any) {
    // Ignorer les erreurs si les colonnes existent déjà
    if (!error.message.includes('duplicate column')) {
      console.log('Migration note:', error.message);
    }
  }

  // Créer un utilisateur commercial par défaut si aucun n'existe
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (id, username, password, role, nom, prenom)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      '1',
      'admin',
      defaultPassword,
      'commercial',
      'Admin',
      'Commercial'
    );
    
    console.log('Default commercial user created: username=admin, password=admin123');
  }

  console.log('Migrations completed successfully!');
}

// Exécuter les migrations si ce fichier est exécuté directement
// Note: Cette vérification fonctionne avec ts-node-dev
const isMainModule = process.argv[1] && process.argv[1].endsWith('migrate.ts');
if (isMainModule) {
  runMigrations();
  db.close();
}

