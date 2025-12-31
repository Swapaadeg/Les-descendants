<?php
/**
 * Configuration LOCALE pour WAMP
 *
 * Instructions:
 * 1. Copie ce fichier en "config.local.php"
 * 2. Modifie les valeurs selon ta config WAMP
 * 3. Le fichier config.local.php est automatiquement ignoré par Git
 */

// Configuration BDD locale WAMP
define('DB_HOST', 'localhost');
define('DB_NAME', 'ark_tracker_local');      // Nom de ta base locale
define('DB_USER', 'root');                    // Utilisateur WAMP (généralement 'root')
define('DB_PASS', '');                        // Mot de passe WAMP (généralement vide)

// URL de base locale
define('BASE_URL', 'http://localhost/les-descendants');

// Mode debug activé en local
define('DEBUG_MODE', true);

// CORS pour React en développement
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Répondre aux requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Affichage des erreurs en mode debug
ini_set('display_errors', 1);
error_reporting(E_ALL);
?>
