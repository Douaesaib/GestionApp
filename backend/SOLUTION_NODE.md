# 🔧 Solution : Problème Node.js Version

## Le problème

Vous utilisez **Node.js 25** mais `better-sqlite3` a été compilé pour **Node.js 20**.

## ✅ Solution : Utiliser Node.js 20

### Dans votre terminal, avant de lancer `npm run dev` :

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Utiliser Node.js 20
nvm use 20

# 3. Vérifier la version
node --version
# Devrait afficher: v20.19.5

# 4. Recompiler better-sqlite3 (si nécessaire)
npm rebuild better-sqlite3

# 5. Démarrer le serveur
npm run dev
```

## 🚀 Solution permanente : Ajouter nvm à votre shell

Ajoutez ces lignes à votre `~/.zshrc` :

```bash
# Charger nvm automatiquement
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Puis rechargez :
```bash
source ~/.zshrc
```

## 📝 Commande complète pour démarrer

```bash
cd backend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm run dev
```

OU utilisez le script :
```bash
cd backend
./start.sh
```

