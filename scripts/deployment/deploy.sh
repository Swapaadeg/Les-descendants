#!/bin/bash

# Script de déploiement automatisé pour Les Descendants / Arki'Family
# Usage: ./deploy.sh [dev|prod]

set -e  # Arrêter en cas d'erreur

ENV=${1:-prod}
BUILD_DIR="dist"
API_DIR="api"

echo "🚀 Déploiement en cours pour l'environnement: $ENV"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonctions
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. Vérifier les prérequis
echo "📋 Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
fi

if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
fi

success "Prérequis OK"

# 2. Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm ci || npm install
success "Dépendances installées"

# 3. Build du projet
echo ""
echo "🔨 Build du projet..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    error "Le dossier $BUILD_DIR n'existe pas après le build"
fi

success "Build terminé"

# 4. Vérifier la taille du build
echo ""
echo "📊 Analyse du build..."
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
echo "Taille totale: $BUILD_SIZE"

# Compter les fichiers JS
JS_COUNT=$(find $BUILD_DIR -name "*.js" | wc -l)
echo "Fichiers JS: $JS_COUNT"

# Plus gros fichiers
echo "Top 5 des plus gros fichiers:"
find $BUILD_DIR -type f -exec du -h {} + | sort -rh | head -5

# 5. Vérifier la configuration API
echo ""
echo "🔧 Vérification de la configuration API..."

if [ ! -f "$API_DIR/config.php" ]; then
    warning "Fichier $API_DIR/config.php manquant"
    echo "Copie de config.example.php..."
    cp $API_DIR/config.example.php $API_DIR/config.php
    warning "⚠️  ATTENTION: Modifier $API_DIR/config.php avec les vrais identifiants!"
else
    success "Configuration API OK"
fi

# 6. Créer l'archive pour le déploiement
echo ""
echo "📦 Création de l'archive de déploiement..."
ARCHIVE_NAME="deploy_$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf $ARCHIVE_NAME \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.idea' \
    --exclude='*.log' \
    --exclude='api/config.local.php' \
    --exclude='api/uploads/*' \
    --exclude='api/logs/*' \
    $BUILD_DIR $API_DIR .htaccess

success "Archive créée: $ARCHIVE_NAME"

# 7. Résumé
echo ""
echo "=================================="
echo "✨ Build prêt pour le déploiement!"
echo "=================================="
echo ""
echo "📦 Archive: $ARCHIVE_NAME"
echo "📂 Contenu: $BUILD_DIR/ + $API_DIR/ + .htaccess"
echo ""
echo "📋 Étapes suivantes:"
echo "  1. Upload l'archive sur le serveur"
echo "  2. Extraire: tar -xzf $ARCHIVE_NAME"
echo "  3. Copier dist/* vers la racine web"
echo "  4. Copier api/ vers /api/"
echo "  5. Configurer les permissions:"
echo "     chmod 755 api/logs api/uploads"
echo "     chmod 400 api/config.php"
echo ""
echo "🔗 Documentation complète: docs/PRODUCTION_CHECKLIST.md"
echo ""

if [ "$ENV" = "prod" ]; then
    warning "⚠️  N'oublie pas de:"
    echo "  - Modifier api/config.php avec les identifiants prod"
    echo "  - Créer un backup de la BDD avant déploiement"
    echo "  - Vérifier les logs après déploiement"
fi
