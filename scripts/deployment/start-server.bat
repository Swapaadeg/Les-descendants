@echo off
echo Demarrage du serveur PHP sur le port 8000...
cd /d "%~dp0"
php -S localhost:8000
