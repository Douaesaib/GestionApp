# Backend API - Application de Gestion de Stock

Backend REST API pour l'application mobile de gestion de stock avec support multi-utilisateurs.

## 🚀 Installation

1. Installer les dépendances:
```bash
cd backend
npm install
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

Éditer le fichier `.env` et configurer:
- `PORT`: Port du serveur (défaut: 3000)
- `JWT_SECRET`: Clé secrète pour JWT (changez-la en production!)
- `DB_PATH`: Chemin vers la base de données SQLite
- `CORS_ORIGIN`: Origines autorisées pour CORS

3. Initialiser la base de données:
```bash
npm run migrate
```

## 📦 Démarrage

### Mode développement:
```bash
npm run dev
```

### Mode production:
```bash
npm run build
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## 🔐 Authentification

### Utilisateur par défaut
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `commercial`

⚠️ **Important**: Changez le mot de passe par défaut en production!

### Créer un nouvel utilisateur

Seul le commercial peut créer des utilisateurs. Utilisez l'endpoint `/api/auth/register` avec un token d'authentification.

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Créer un utilisateur (commercial uniquement)
- `GET /api/auth/me` - Obtenir le profil de l'utilisateur connecté
- `GET /api/auth/users` - Lister tous les utilisateurs (commercial uniquement)

### Produits
- `GET /api/products` - Liste tous les produits
- `GET /api/products/:id` - Obtenir un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Mettre à jour un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Clients
- `GET /api/clients` - Liste tous les clients
- `GET /api/clients/:id` - Obtenir un client
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Mettre à jour un client
- `DELETE /api/clients/:id` - Supprimer un client

### Ventes
- `GET /api/ventes` - Liste toutes les ventes
- `GET /api/ventes/:id` - Obtenir une vente
- `POST /api/ventes` - Créer une vente
- `PATCH /api/ventes/:id/print` - Marquer une vente comme imprimée

### Retours
- `GET /api/retours` - Liste tous les retours
- `GET /api/retours/:id` - Obtenir un retour
- `POST /api/retours` - Créer un retour
- `DELETE /api/retours/:id` - Supprimer un retour

## 🔑 Authentification JWT

Toutes les routes (sauf `/api/auth/login`) nécessitent un token JWT dans le header:
```
Authorization: Bearer <token>
```

## 👥 Rôles

- **commercial**: Accès complet, peut créer des utilisateurs
- **vendeur**: Accès aux opérations de vente et consultation

## 🗄️ Base de données

La base de données SQLite est créée automatiquement au premier démarrage dans le chemin spécifié dans `DB_PATH`.

### Structure
- `users` - Utilisateurs (commercial et vendeurs)
- `products` - Produits
- `clients` - Clients
- `ventes` - Ventes
- `vente_items` - Items de vente
- `retours` - Retours

## 📝 Exemples de requêtes

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Créer un produit (avec token)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Produit Test",
    "priceGros": 10.50,
    "priceDetail": 15.00,
    "stock": 100,
    "stockCritique": 20
  }'
```

## 🛠️ Technologies

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **SQLite** (better-sqlite3) - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe

