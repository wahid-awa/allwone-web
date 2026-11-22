#!/usr/bin/env bash
# ==============================================================================
# ALLWONE · Script de Déploiement Automatisé vers Home Server via SSH
# ==============================================================================

set -e

# Configuration (modifiez ces valeurs selon votre serveur maison)
SERVER_USER="${SERVER_USER:-wahid}"
SERVER_IP="${SERVER_IP:-192.168.1.50}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/allwone}"

echo "========================================================"
echo "  🚀 ALLWONE — DÉPLOIEMENT VERS SERVEUR SSH ($SERVER_IP)"
echo "========================================================"

# 1. Compilation du projet Vite
echo "📦 1/3 - Compilation de l'application..."
npm run build

# 2. Création du dossier distant si nécessaire
echo "📁 2/3 - Vérification du dossier distant sur le serveur..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_PATH/dist $REMOTE_PATH/deploy"

# 3. Synchronisation des fichiers via rsync
echo "🔄 3/3 - Envoi des fichiers via rsync..."
rsync -avz --delete dist/ "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/dist/"
rsync -avz deploy/docker-compose.yml deploy/nginx.conf "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/deploy/"

# 4. Redémarrage de Docker (si utilisé sur le serveur)
echo "🐳 Redémarrage du conteneur Nginx sur le serveur distant..."
ssh "$SERVER_USER@$SERVER_IP" "cd $REMOTE_PATH/deploy && docker compose up -d --force-recreate" || true

echo "========================================================"
echo "  ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "  Votre site ALLWONE tourne sur votre serveur local !"
echo "========================================================"
