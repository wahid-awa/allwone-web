<#
.SYNOPSIS
    Script de déploiement automatique Windows PowerShell pour ALLWONE
.DESCRIPTION
    Compile l'application React/Vite et synchronise les fichiers vers votre serveur maison en SSH.
.EXAMPLE
    .\deploy.ps1 -ServerUser "wahid" -ServerIP "192.168.1.50" -RemotePath "/var/www/allwone"
#>

param (
    [string]$ServerUser = "wahid",
    [string]$ServerIP = "192.168.1.50",
    [string]$RemotePath = "/var/www/allwone"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🚀 ALLWONE — DÉPLOIEMENT VERS SERVEUR SSH ($ServerIP)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Compilation
Write-Host "📦 1/3 - Compilation de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "La compilation a échoué. Arrêt du déploiement."
    exit $LASTEXITCODE
}

# 2. Création des dossiers distants
Write-Host "📁 2/3 - Préparation du serveur distant..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no "$ServerUser@$ServerIP" "mkdir -p $RemotePath/dist $RemotePath/deploy"

# 3. Copie des fichiers via SCP
Write-Host "🔄 3/3 - Envoi des fichiers compilés via SCP..." -ForegroundColor Yellow
scp -r dist/* "$ServerUser@$ServerIP`:$RemotePath/dist/"
scp deploy/docker-compose.yml deploy/nginx.conf "$ServerUser@$ServerIP`:$RemotePath/deploy/"

# 4. Redémarrage conteneur optionnel
Write-Host "🐳 Redémarrage Docker..." -ForegroundColor Yellow
ssh "$ServerUser@$ServerIP" "cd $RemotePath/deploy && docker compose up -d --force-recreate"

Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
