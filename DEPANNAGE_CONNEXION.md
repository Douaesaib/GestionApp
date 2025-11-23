# 🔧 Dépannage : Impossible de se connecter au serveur

## ✅ Vérifications rapides

### 1. Vérifier que le backend est démarré

```bash
# Vérifier si le port 3000 est utilisé
lsof -ti:3000

# Ou tester directement
curl http://localhost:3000/api/health
```

**Résultat attendu :** `{"status":"OK","message":"API is running"}`

### 2. Vérifier que le frontend est démarré

```bash
# Vérifier si le port 5173 est utilisé
lsof -ti:5173
```

**Résultat attendu :** Un numéro de processus (PID)

### 3. Tester la connexion backend depuis le terminal

```bash
# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Résultat attendu :** Un JSON avec un `token` et un `user`

## 🔄 Redémarrer proprement

### Option 1 : Utiliser le script de démarrage (recommandé)

```bash
cd backend
./start.sh
```

### Option 2 : Démarrage manuel

```bash
# 1. Arrêter tous les processus backend existants
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 2. Aller dans le dossier backend
cd backend

# 3. Charger nvm et utiliser Node.js 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# 4. Démarrer le backend
npm run dev
```

## 🐛 Problèmes courants

### Problème 1 : "Port 3000 déjà utilisé"

**Solution :**
```bash
# Trouver et arrêter le processus
lsof -ti:3000 | xargs kill -9
```

### Problème 2 : "better-sqlite3 module not found"

**Solution :**
```bash
cd backend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm rebuild better-sqlite3
```

### Problème 3 : "Failed to fetch" dans le navigateur

**Causes possibles :**
1. Le backend n'est pas démarré
2. L'URL de l'API est incorrecte
3. Problème de CORS

**Solutions :**
1. Vérifier que le backend tourne : `curl http://localhost:3000/api/health`
2. Vérifier l'URL dans `src/utils/api.ts` : doit être `http://localhost:3000/api`
3. Vérifier la console du navigateur (F12) pour voir l'erreur exacte

### Problème 4 : "Impossible de se connecter au serveur"

**Vérifications :**
1. Ouvrir la console du navigateur (F12) → onglet Console
2. Vérifier les messages d'erreur
3. Vérifier l'onglet Network pour voir si la requête est envoyée

**Solution :**
```bash
# Redémarrer le backend proprement
cd backend
./start.sh
```

## 📋 Checklist de démarrage

- [ ] Backend démarré sur le port 3000
- [ ] Frontend démarré sur le port 5173
- [ ] Test de connexion backend réussi (`curl http://localhost:3000/api/health`)
- [ ] Test de login réussi (`curl -X POST http://localhost:3000/api/auth/login ...`)
- [ ] URL de l'API correcte dans `src/utils/api.ts`
- [ ] Console du navigateur sans erreurs CORS

## 🔍 Commandes utiles

```bash
# Voir tous les processus Node.js
ps aux | grep node

# Voir les ports utilisés
lsof -i :3000
lsof -i :5173

# Tester le backend
curl http://localhost:3000/api/health

# Tester le login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 💡 Astuce

Si le problème persiste, redémarrez complètement :
1. Arrêtez tous les processus (backend + frontend)
2. Attendez 2-3 secondes
3. Redémarrez le backend avec `./start.sh`
4. Redémarrez le frontend avec `npm run dev`

