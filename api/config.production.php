<?php
/**
 * Configuration LOCALE pour o2switch - Arki'Family
 * Fichier prêt pour PROD / serveur o2switch
 * Ignorer le .env WAMP local
 */

// ----------------------
// CONFIGURATION BDD
// ----------------------
define('DB_HOST', 'localhost');               // Adresse du serveur MySQL sur o2switch
define('DB_NAME', 'teze5999_arki-family');    // Nom de la base
define('DB_USER', 'teze5999_swap');           // Utilisateur MySQL
define('DB_PASS', 'Nidoking63450');           // Mot de passe MySQL
define('DB_CHARSET', 'utf8mb4');              // Charset

// ----------------------
// URLS
// ----------------------
define('BASE_URL', 'https://arki-family.swapdevstudio.fr/api'); // URL de base de l'API
define('FRONTEND_URL', 'https://arki-family.swapdevstudio.fr'); // URL du frontend (Vite/React)

// ----------------------
// DEBUG
// ----------------------
define('DEBUG_MODE', false); // false en production

// ----------------------
// JWT
// ----------------------
define('JWT_SECRET', 'prod-secret-change-this'); // Clé secrète pour JWT

// ----------------------
// EMAIL / SMTP
// ----------------------
define('EMAIL_MODE', 'smtp');                // 'smtp' pour envoi réel, 'debug' pour logs
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');                 // Ton email d'expéditeur
define('SMTP_PASSWORD', '');                 // Mot de passe ou mot de passe d'application
define('SMTP_ENCRYPTION', 'tls');
define('SMTP_FROM_EMAIL', SMTP_USERNAME);
define('SMTP_FROM_NAME', 'Arki\'Family');

// ----------------------
// NOTE
// ----------------------
// Les headers CORS sont gérés dans config.php
// Ne pas les dupliquer ici
?>
