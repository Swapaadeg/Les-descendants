@echo off
echo ========================================
echo NETTOYAGE AVANT MISE EN PRODUCTION
echo ========================================
echo.
echo Ce script va supprimer tous les fichiers de test et documentation
echo.
pause

echo.
echo Suppression des fichiers de test dans api/...
del /Q "api\check_*.php" 2>nul
del /Q "api\test_*.php" 2>nul
del /Q "api\debug_*.php" 2>nul

echo Suppression des scripts de test...
del /Q "api\scripts\check_*.php" 2>nul
del /Q "api\scripts\test_*.php" 2>nul
del /Q "api\scripts\debug_*.php" 2>nul

echo Suppression du dossier docs/...
rmdir /S /Q "docs" 2>nul

echo Suppression de README.md...
del /Q "README.md" 2>nul

echo Suppression des fichiers temporaires...
del /Q "NUL" 2>nul
del /Q "ADMIN_DEBUG.md" 2>nul

echo Suppression des fichiers .example (sauf config necessaire)...
del /Q "api\config.local.example.php" 2>nul

echo.
echo ========================================
echo NETTOYAGE TERMINE
echo ========================================
echo.
echo Fichiers conserves (necessaires):
echo - api/config.example.php (template pour installation)
echo - api/vendor/ (librairies)
echo.
pause
