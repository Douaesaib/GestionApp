# Guide de Débogage - Frontend

## Vérifications à faire

### 1. Vérifier que les serveurs tournent

**Backend :**
```bash
curl http://localhost:3000/api/health
# Devrait retourner: {"status":"OK","message":"API is running"}
```

**Frontend :**
```bash
curl http://localhost:5173
# Devrait retourner du HTML
```

### 2. Vérifier dans le navigateur (F12)

Ouvrez la console du navigateur (F12) et vérifiez :

1. **Onglet Console** - Cherchez les erreurs en rouge
2. **Onglet Network** - Vérifiez les requêtes vers `/api/`

### 3. Erreurs courantes

#### Erreur CORS
Si vous voyez : `Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution :** Vérifiez que le backend accepte les requêtes depuis `http://localhost:5173`

#### Erreur 401 (Non autorisé)
Si vous voyez : `401 Unauthorized`

**Solution :** Vérifiez que vous êtes connecté avec un token valide

#### Erreur 404 (Not Found)
Si vous voyez : `404 Not Found`

**Solution :** Vérifiez que l'URL de l'API est correcte dans `src/utils/api.ts`

#### Erreur de connexion
Si vous voyez : `Failed to fetch` ou `Network Error`

**Solution :** Vérifiez que le backend tourne sur le port 3000

### 4. Test manuel de l'API

```bash
# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Devrait retourner un token
```

### 5. Vérifier la configuration

Dans `src/utils/api.ts`, l'URL devrait être :
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### 6. Redémarrer les serveurs

**Arrêter tous les processus :**
```bash
# Trouver les processus
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Redémarrer le backend
cd backend
npm run dev

# Redémarrer le frontend (dans un autre terminal)
cd "/Users/macbook/Desktop/app-gestion copy 2"
npm run dev
```

