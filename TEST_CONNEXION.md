# Guide de Test - Problème "Load failed"

## 🔍 Diagnostic du problème "Load failed"

### Étape 1 : Vérifier que le backend tourne

```bash
# Dans un terminal
curl http://localhost:3000/api/health
```

**Résultat attendu :** `{"status":"OK","message":"API is running"}`

Si ça ne fonctionne pas :
```bash
cd backend
npm run dev
```

### Étape 2 : Vérifier dans le navigateur

1. Ouvrez `http://localhost:5173`
2. Appuyez sur **F12** pour ouvrir la console
3. Allez dans l'onglet **Console**
4. Regardez les messages :
   - `🔗 API URL: http://localhost:3000/api` (doit apparaître)
   - Messages d'erreur en rouge

### Étape 3 : Tester la connexion depuis le navigateur

Dans la console du navigateur (F12), tapez :

```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ Erreur:', err))
```

### Étape 4 : Tester le login depuis le navigateur

Dans la console du navigateur, tapez :

```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
  .then(r => r.json())
  .then(data => console.log('✅ Login réussi:', data))
  .catch(err => console.error('❌ Erreur login:', err))
```

## 🛠️ Solutions aux problèmes courants

### Problème : "Failed to fetch" ou "Load failed"

**Causes possibles :**
1. Le backend n'est pas démarré
2. Le backend tourne sur un autre port
3. Problème de firewall
4. Le backend a crashé

**Solutions :**
```bash
# 1. Vérifier que le backend tourne
lsof -ti:3000

# 2. Redémarrer le backend
cd backend
npm run dev

# 3. Vérifier les logs du backend pour voir les erreurs
```

### Problème : Erreur CORS

Si vous voyez : `Access to fetch... blocked by CORS policy`

**Solution :** Le backend accepte déjà toutes les origines. Si le problème persiste, vérifiez le fichier `.env` du backend.

### Problème : Erreur 401

**Solution :** Les identifiants sont incorrects ou le token a expiré. Utilisez : `admin` / `admin123`

## 📋 Checklist de vérification

- [ ] Backend démarré sur le port 3000
- [ ] Frontend démarré sur le port 5173
- [ ] Pas d'erreur dans la console du navigateur
- [ ] Le test `fetch` dans la console fonctionne
- [ ] Les identifiants sont corrects : `admin` / `admin123`

## 🚀 Commandes pour redémarrer

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd "/Users/macbook/Desktop/app-gestion copy 2"
npm run dev
```

Puis ouvrez `http://localhost:5173` dans votre navigateur.

