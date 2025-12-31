<?php
/**
 * Configuration principale - Arki'Family
 *
 * Ce fichier détecte automatiquement l'environnement (local WAMP ou production o2switch)
 * et charge la configuration appropriée.
 *
 * INSTRUCTIONS:
 * 1. Copie ce fichier en "config.php"
 * 2. Modifie les valeurs de production (section PRODUCTION)
 * 3. Pour le développement local, crée "config.local.php" (voir config.local.example.php)
 */

// Détection automatique de l'environnement
$isLocal = (
    isset($_SERVER['HTTP_HOST']) && (
        $_SERVER['HTTP_HOST'] === 'localhost' ||
        strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false ||
        strpos($_SERVER['HTTP_HOST'], 'localhost:') !== false
    )
);

// Charger la configuration selon l'environnement
if ($isLocal && file_exists(__DIR__ . '/config.local.php')) {
    // ===========================
    // ENVIRONNEMENT LOCAL (WAMP)
    // ===========================
    require_once __DIR__ . '/config.local.php';

} else {
    // ===========================
    // ENVIRONNEMENT PRODUCTION (o2switch)
    // ===========================

    // Configuration BDD production
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'sc5jewe1253_ark-tracker');
    define('DB_USER', 'sc5jewe1253_swap');
    define('DB_PASS', 'Nidoking63450'); // ⚠️ À MODIFIER avec tes vrais identifiants

    // URL de base production
    define('BASE_URL', 'https://les-descendants.sc5jewe1253.universe.wf');

    // Mode debug désactivé en production
    define('DEBUG_MODE', false);

    // CORS pour production
    header('Access-Control-Allow-Origin: https://les-descendants.sc5jewe1253.universe.wf');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');

    // Répondre aux requêtes OPTIONS (preflight CORS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // Désactiver l'affichage des erreurs en production
    ini_set('display_errors', 0);
    error_reporting(0);
}

// ===========================
// CONFIGURATION COMMUNE
// ===========================

// Timezone
date_default_timezone_set('Europe/Paris');

// Content-Type JSON par défaut
header('Content-Type: application/json; charset=utf-8');

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Obtenir une connexion PDO à la base de données
 */
function getDbConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);

        // En mode debug, afficher le message détaillé
        $message = defined('DEBUG_MODE') && DEBUG_MODE
            ? $e->getMessage()
            : 'Erreur de connexion à la base de données';

        echo json_encode([
            'error' => $message,
            'environment' => defined('DEBUG_MODE') && DEBUG_MODE ? 'development' : 'production'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

/**
 * Envoyer une réponse JSON
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Envoyer une erreur JSON
 */
function sendJsonError($message, $statusCode = 400, $details = null) {
    http_response_code($statusCode);

    $response = ['error' => $message];

    // Ajouter des détails uniquement en mode debug
    if (defined('DEBUG_MODE') && DEBUG_MODE && $details !== null) {
        $response['details'] = $details;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Valider et nettoyer les entrées utilisateur
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Vérifier si une requête est en AJAX
 */
function isAjaxRequest() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

/**
 * Logger une activité (pour debug ou audit)
 */
function logActivity($message, $level = 'INFO', $context = []) {
    $debugMode = defined('DEBUG_MODE') && DEBUG_MODE;

    if (!$debugMode && $level === 'DEBUG') {
        return; // Ne pas logger les DEBUG en production
    }

    $logDir = __DIR__ . '/../logs';
    if (!file_exists($logDir)) {
        @mkdir($logDir, 0755, true);
    }

    $logFile = $logDir . '/app_' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';

    $logLine = "[$timestamp] [$level] $message$contextStr" . PHP_EOL;
    @file_put_contents($logFile, $logLine, FILE_APPEND);
}
?>
