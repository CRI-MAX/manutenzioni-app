#!/bin/bash

echo "📦 Stato del progetto:"
git status

# Aggiunge tutte le modifiche
echo "➕ Aggiungo modifiche..."
git add .

# Chiede il messaggio di commit
read -p "✏️ Inserisci il messaggio di commit: " commitMsg
git commit -m "$commitMsg"

# Push sul ramo corrente
currentBranch=$(git rev-parse --abbrev-ref HEAD)
echo "🚀 Carico su ramo: $currentBranch"
git push origin "$currentBranch"

# Aggiorna pacchetti npm
echo "📦 Aggiorno dipendenze..."
npm install

# Mostra pacchetti obsoleti (opzionale)
echo "🔍 Controllo pacchetti obsoleti..."
npm outdated || echo "✅ Tutto aggiornato!"

echo "🎉 Progetto sincronizzato con Git e npm!"