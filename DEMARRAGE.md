# 🚀 Guide de Démarrage Rapide

## Démarrage du Backend

### Option 1 : Utiliser le script (Recommandé)
```bash
cd backend
./start.sh
```

### Option 2 : Commande manuelle
```bash
cd backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utiliser Node.js 20
nvm use 20

# Recompiler better-sqlite3 si nécessaire
npm rebuild better-sqlite3

# Démarrer le serveur
npm run dev
```

### Option 3 : Si nvm n'est pas chargé automatiquement

Ajoutez ces lignes à votre `~/.zshrc` :
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Puis rechargez :
```bash
source ~/.zshrc
```

## Démarrage du Frontend

Dans un **nouveau terminal** :
```bash
cd "/Users/macbook/Desktop/app-gestion copy 2"
npm run dev
```

## Vérification

1. **Backend** : Ouvrez `http://localhost:3000` → Devrait afficher la page d'accueil de l'API
2. **Frontend** : Ouvrez `http://localhost:5173` → Devrait afficher la page de connexion

## Connexion

- **Username** : `admin`
- **Password** : `admin123`

## Problèmes courants

### Erreur "better-sqlite3 not found"
```bash
cd backend
nvm use 20
npm rebuild better-sqlite3
```

### Erreur "nvm: command not found"
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
```

### Le backend ne démarre pas
Vérifiez les logs dans le terminal. Les erreurs courantes :
- Port 3000 déjà utilisé → Arrêtez l'autre processus
- better-sqlite3 non compilé → `npm rebuild better-sqlite3`

