#!/bin/bash

echo "========================================"
echo "NETTOYAGE AVANT MISE EN PRODUCTION"
echo "========================================"
echo ""
echo "Ce script va supprimer tous les fichiers de test et documentation"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

echo ""
echo "Suppression des fichiers de test dans api/..."
rm -f api/check_*.php
rm -f api/test_*.php
rm -f api/debug_*.php

echo "Suppression des scripts de test..."
rm -f api/scripts/check_*.php
rm -f api/scripts/test_*.php
rm -f api/scripts/debug_*.php

echo "Suppression du dossier docs/..."
rm -rf docs/

echo "Suppression de README.md..."
rm -f README.md

echo "Suppression des fichiers temporaires..."
rm -f NUL
rm -f ADMIN_DEBUG.md

echo "Suppression des fichiers .example (sauf config necessaire)..."
rm -f api/config.local.example.php

echo ""
echo "========================================"
echo "NETTOYAGE TERMINE"
echo "========================================"
echo ""
echo "Fichiers conserves (necessaires):"
echo "- api/config.example.php (template pour installation)"
echo "- api/vendor/ (librairies)"
echo ""

# Afficher ce qui a été supprimé
echo "Verification des fichiers restants:"
echo ""
find api -name "test_*.php" -o -name "check_*.php" -o -name "debug_*.php" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Des fichiers de test restent!"
else
    echo "✓ Tous les fichiers de test ont été supprimés"
fi

echo ""
read -p "Appuyez sur Entrée pour quitter..."
