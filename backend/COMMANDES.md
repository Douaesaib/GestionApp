# 📝 Commandes Utiles - Backend

## 🚀 Démarrer le backend

### Méthode 1 : Script automatique (Recommandé)
```bash
cd backend
./start.sh
```

### Méthode 2 : Commande manuelle
```bash
cd backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utiliser Node.js 20
nvm use 20

# Arrêter les processus existants
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Démarrer
npm run dev
```

## 🛑 Arrêter le backend

```bash
# Arrêter tous les processus sur le port 3000
lsof -ti:3000 | xargs kill -9

# Ou arrêter ts-node-dev
pkill -f "ts-node-dev.*server.ts"
```

## 🔧 Réparer better-sqlite3

Si vous avez une erreur de version Node.js :

```bash
cd backend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm rebuild better-sqlite3
```

## ✅ Vérifier que le backend fonctionne

```bash
curl http://localhost:3000/api/health
```

Devrait retourner : `{"status":"OK","message":"API is running"}`

## 🧪 Tester le login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

