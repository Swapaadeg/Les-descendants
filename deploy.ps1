#!/bin/bash

# Script PowerShell pour Windows - Déploiement Les Descendants
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

$ENV = "prod"
$BUILD_DIR = "dist"
$API_DIR = "api"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$ARCHIVE_NAME = "deploy_$TIMESTAMP.zip"

Write-Host "🚀 Déploiement en cours..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Node.js
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

try {
    $null = node --version
    Write-Host "✅ Node.js installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}

# 2. Installer dépendances
Write-Host ""
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dépendances installées" -ForegroundColor Green

# 3. Build
Write-Host ""
Write-Host "🔨 Build du projet..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "❌ Le dossier $BUILD_DIR n'existe pas" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build terminé" -ForegroundColor Green

# 4. Analyse du build
Write-Host ""
Write-Host "📊 Analyse du build..." -ForegroundColor Yellow
$buildSize = (Get-ChildItem $BUILD_DIR -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Taille totale: $([Math]::Round($buildSize, 2)) MB"

$jsFiles = (Get-ChildItem $BUILD_DIR -Recurse -Filter "*.js").Count
Write-Host "Fichiers JS: $jsFiles"

# 5. Vérifier config API
Write-Host ""
Write-Host "🔧 Vérification config API..." -ForegroundColor Yellow

if (-not (Test-Path "$API_DIR\config.php")) {
    Write-Host "⚠️  config.php manquant, copie de config.example.php" -ForegroundColor Yellow
    Copy-Item "$API_DIR\config.example.php" "$API_DIR\config.php"
    Write-Host "⚠️  MODIFIER api\config.php avec les vrais identifiants!" -ForegroundColor Red
} else {
    Write-Host "✅ Configuration API OK" -ForegroundColor Green
}

# 6. Créer archive
Write-Host ""
Write-Host "📦 Création de l'archive..." -ForegroundColor Yellow

$filesToZip = @(
    $BUILD_DIR,
    "$API_DIR\*.php",
    "$API_DIR\auth",
    "$API_DIR\admin",
    "$API_DIR\middleware",
    "$API_DIR\migrations",
    "$API_DIR\services",
    "$API_DIR\utils",
    "$API_DIR\.htaccess",
    "$API_DIR\composer.json",
    ".htaccess"
)

Compress-Archive -Path $filesToZip -DestinationPath $ARCHIVE_NAME -Force

Write-Host "✅ Archive créée: $ARCHIVE_NAME" -ForegroundColor Green

# 7. Résumé
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✨ Build prêt pour le déploiement!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Archive: $ARCHIVE_NAME"
Write-Host "📂 Taille: $([Math]::Round((Get-Item $ARCHIVE_NAME).Length / 1MB, 2)) MB"
Write-Host ""
Write-Host "📋 Étapes suivantes:" -ForegroundColor Yellow
Write-Host "  1. Upload $ARCHIVE_NAME sur le serveur"
Write-Host "  2. Extraire l'archive"
Write-Host "  3. Copier dist/* vers la racine web"
Write-Host "  4. Copier api/ vers /api/"
Write-Host "  5. Configurer permissions (755 pour logs/uploads)"
Write-Host ""
Write-Host "⚠️  N'oublie pas:" -ForegroundColor Red
Write-Host "  - Modifier api/config.php avec identifiants prod"
Write-Host "  - Backup BDD avant déploiement"
Write-Host "  - Tester après déploiement"
Write-Host ""
Write-Host "🔗 Documentation: docs\PRODUCTION_CHECKLIST.md" -ForegroundColor Cyan
