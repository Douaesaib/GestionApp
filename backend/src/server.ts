import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database/db';
import { runMigrations } from './database/migrate';

// Routes
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import clientsRoutes from './routes/clients';
import ventesRoutes from './routes/ventes';
import retoursRoutes from './routes/retours';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Initialiser la base de données
runMigrations();

// Route racine - Page HTML
app.get('/', (req, res) => {
  // Si l'utilisateur demande du JSON
  if (req.headers.accept?.includes('application/json')) {
    return res.json({
      message: 'API de Gestion de Stock',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          me: 'GET /api/auth/me',
          users: 'GET /api/auth/users'
        },
        products: {
          list: 'GET /api/products',
          get: 'GET /api/products/:id',
          create: 'POST /api/products',
          update: 'PUT /api/products/:id',
          delete: 'DELETE /api/products/:id'
        },
        clients: {
          list: 'GET /api/clients',
          get: 'GET /api/clients/:id',
          create: 'POST /api/clients',
          update: 'PUT /api/clients/:id',
          delete: 'DELETE /api/clients/:id'
        },
        ventes: {
          list: 'GET /api/ventes',
          get: 'GET /api/ventes/:id',
          create: 'POST /api/ventes',
          print: 'PATCH /api/ventes/:id/print'
        },
        retours: {
          list: 'GET /api/retours',
          get: 'GET /api/retours/:id',
          create: 'POST /api/retours',
          delete: 'DELETE /api/retours/:id'
        }
      },
      documentation: 'Voir README.md pour plus d\'informations'
    });
  }
  
  // Sinon, afficher une page HTML
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API de Gestion de Stock</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 2.5em;
        }
        .version {
          color: #666;
          margin-bottom: 30px;
          font-size: 1.1em;
        }
        .status {
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          display: inline-block;
          margin-bottom: 30px;
          font-weight: bold;
        }
        .section {
          margin-bottom: 40px;
        }
        .section h2 {
          color: #667eea;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .endpoint {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .method {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.85em;
          margin-right: 10px;
        }
        .get { background: #3b82f6; color: white; }
        .post { background: #10b981; color: white; }
        .put { background: #f59e0b; color: white; }
        .delete { background: #ef4444; color: white; }
        .patch { background: #8b5cf6; color: white; }
        .endpoint-path {
          font-family: 'Courier New', monospace;
          color: #1f2937;
          font-weight: 500;
        }
        .info {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .info strong {
          color: #1e40af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 API de Gestion de Stock</h1>
        <div class="version">Version 1.0.0</div>
        <div class="status">✅ Serveur en ligne</div>
        
        <div class="section">
          <h2>🔐 Authentification</h2>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/auth/login</span>
            <p style="margin-top: 8px; color: #666;">Connexion utilisateur</p>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/auth/register</span>
            <p style="margin-top: 8px; color: #666;">Créer un utilisateur (commercial uniquement)</p>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/auth/me</span>
            <p style="margin-top: 8px; color: #666;">Profil utilisateur connecté</p>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/auth/users</span>
            <p style="margin-top: 8px; color: #666;">Liste tous les utilisateurs (commercial uniquement)</p>
          </div>
        </div>
        
        <div class="section">
          <h2>🏷️ Produits</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/products</span>
            <p style="margin-top: 8px; color: #666;">Liste tous les produits</p>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/products/:id</span>
            <p style="margin-top: 8px; color: #666;">Obtenir un produit</p>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/products</span>
            <p style="margin-top: 8px; color: #666;">Créer un produit</p>
          </div>
          <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="endpoint-path">/api/products/:id</span>
            <p style="margin-top: 8px; color: #666;">Mettre à jour un produit</p>
          </div>
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <span class="endpoint-path">/api/products/:id</span>
            <p style="margin-top: 8px; color: #666;">Supprimer un produit</p>
          </div>
        </div>
        
        <div class="section">
          <h2>👥 Clients</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/clients</span>
            <p style="margin-top: 8px; color: #666;">Liste tous les clients</p>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/clients/:id</span>
            <p style="margin-top: 8px; color: #666;">Obtenir un client</p>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/clients</span>
            <p style="margin-top: 8px; color: #666;">Créer un client</p>
          </div>
          <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="endpoint-path">/api/clients/:id</span>
            <p style="margin-top: 8px; color: #666;">Mettre à jour un client</p>
          </div>
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <span class="endpoint-path">/api/clients/:id</span>
            <p style="margin-top: 8px; color: #666;">Supprimer un client</p>
          </div>
        </div>
        
        <div class="section">
          <h2>🛒 Ventes</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/ventes</span>
            <p style="margin-top: 8px; color: #666;">Liste toutes les ventes</p>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/ventes/:id</span>
            <p style="margin-top: 8px; color: #666;">Obtenir une vente</p>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/ventes</span>
            <p style="margin-top: 8px; color: #666;">Créer une vente</p>
          </div>
          <div class="endpoint">
            <span class="method patch">PATCH</span>
            <span class="endpoint-path">/api/ventes/:id/print</span>
            <p style="margin-top: 8px; color: #666;">Marquer une vente comme imprimée</p>
          </div>
        </div>
        
        <div class="section">
          <h2>↩️ Retours</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/retours</span>
            <p style="margin-top: 8px; color: #666;">Liste tous les retours</p>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/retours/:id</span>
            <p style="margin-top: 8px; color: #666;">Obtenir un retour</p>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/retours</span>
            <p style="margin-top: 8px; color: #666;">Créer un retour</p>
          </div>
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <span class="endpoint-path">/api/retours/:id</span>
            <p style="margin-top: 8px; color: #666;">Supprimer un retour</p>
          </div>
        </div>
        
        <div class="info">
          <strong>ℹ️ Informations:</strong><br>
          • Utilisateur par défaut: <code>admin</code> / <code>admin123</code><br>
          • Toutes les routes (sauf /api/auth/login) nécessitent un token JWT dans le header: <code>Authorization: Bearer &lt;token&gt;</code><br>
          • Endpoint de santé: <a href="/api/health">/api/health</a><br>
          • Documentation complète: Voir README.md
        </div>
      </div>
    </body>
    </html>
  `);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/ventes', ventesRoutes);
app.use('/api/retours', retoursRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Gestion des erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue' });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`🌐 Accessible depuis: http://localhost:${PORT}`);
  console.log(`📊 Base de données: ${process.env.DB_PATH || './database/gestion.db'}`);
  console.log(`🔐 Utilisateur par défaut: admin / admin123`);
  console.log(`🔗 API disponible sur: http://localhost:${PORT}/api`);
});

// Fermer la base de données à l'arrêt du serveur
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

