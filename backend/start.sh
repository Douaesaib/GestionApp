#!/bin/bash

# Script de démarrage du backend
# Ce script charge nvm et démarre le serveur avec Node.js 20

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utiliser Node.js 20
nvm use 20

# Arrêter les processus existants sur le port 3000
echo "🛑 Arrêt des processus existants sur le port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Arrêter les processus ts-node-dev existants
echo "🛑 Arrêt des processus ts-node-dev..."
pkill -f "ts-node-dev.*server.ts" 2>/dev/null || true
sleep 1

# Vérifier que better-sqlite3 est compilé
echo "🔧 Vérification de better-sqlite3..."
if [ ! -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then
  echo "📦 Compilation de better-sqlite3..."
  npm rebuild better-sqlite3
fi

# Démarrer le serveur
echo "🚀 Démarrage du serveur backend..."
npm run dev

