# Application de Gestion - Stock, Ventes et Clients

Application complète de gestion de stock, ventes et clients avec interface moderne.

## Fonctionnalités

### 🔐 Authentification
- Écran de connexion avec code PIN
- Code PIN par défaut: `0000`

### 📊 Dashboard
- Interface principale avec 5 modules accessibles

### 🏷️ Produits / Stock
- Ajouter, modifier, supprimer des produits
- Gestion du stock avec alerte de stock critique
- Prix gros et détail
- Mode de vente (gros/détail)
- Visualisation du stock actuel

### 👥 Clients
- Ajouter, modifier, supprimer des clients
- Informations: Nom, Prénom, Adresse (optionnel), Téléphone
- Suivi du crédit client
- Historique des achats

### 🛒 Ventes / Factures
- Sélection du client
- Ajout de produits avec mode gros/détail
- Calcul automatique du total
- Gestion du paiement et crédit
- Impression de factures

### ↩️ Retours
- Sélection du client et de la vente
- Retour de produits
- Ajustement automatique du stock
- Ajustement du crédit client

### 🧾 Historique
- Visualisation de toutes les factures
- Liste des retours
- Crédits en cours
- Export des données (JSON)
- Réimpression de factures

## Installation

```bash
# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la version de production
npm run preview
```

## Technologies utilisées

- React 18
- TypeScript
- React Router
- Vite
- LocalStorage pour la persistance des données

## Structure du projet

```
app-gestion/
├── src/
│   ├── components/      # Composants React
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilitaires (stockage)
│   ├── App.tsx         # Composant principal
│   └── main.tsx        # Point d'entrée
├── index.html
├── package.json
└── vite.config.ts
```

## Utilisation

1. **Connexion**: Utilisez le code PIN par défaut `0000` pour vous connecter
2. **Produits**: Ajoutez vos produits avec leurs prix (gros/détail) et seuil de stock critique
3. **Clients**: Enregistrez vos clients
4. **Ventes**: Créez des factures en sélectionnant un client et des produits
5. **Retours**: Gérez les retours de produits
6. **Historique**: Consultez toutes les factures et crédits

## Notes

- Les données sont stockées localement dans le navigateur (LocalStorage)
- Pour changer le code PIN, modifiez-le dans le code ou via les outils de développement
- Les factures peuvent être imprimées directement depuis le navigateur

# GestionApp
