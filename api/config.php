<?php
/**
 * Configuration de la base de données MySQL
 * À modifier avec vos identifiants o2switch
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start output buffering to ensure headers can be sent
if (ob_get_level() === 0) {
    ob_start();
}

// Activer le rapport d'erreurs pour le développement
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ===== CORS HEADERS - DOIT ÊTRE EN TOUT PREMIER =====
// Déterminer l'origine
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://arki-family.swapdevstudio.fr',
];

// Envoyer les headers CORS
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    // Pour le développement local, autoriser tous les origins
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight CORS)
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===== FIN CORS HEADERS =====

// Charger la configuration locale si elle existe
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
} else {
    // Configuration par défaut (production o2switch)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'votre_nom_de_base');
    define('DB_USER', 'votre_utilisateur');
    define('DB_PASS', 'votre_mot_de_passe');
}

// URL de base du serveur (pour les URLs absolues des uploads)
// Défini après config.local.php pour permettre l'override
if (!defined('BASE_URL')) {
    define('BASE_URL', 'http://localhost:8000');
}

// Connexion à la base de données
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
        echo json_encode(['error' => 'Erreur de connexion à la base de données: ' . $e->getMessage()]);
        exit();
    }
}

// Fonction utilitaire pour envoyer une réponse JSON
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Fonction utilitaire pour envoyer une erreur JSON
function sendJsonError($message, $statusCode = 400, $details = null) {
    http_response_code($statusCode);
    $response = ['error' => $message];
    if ($details !== null) {
        $response['details'] = $details;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// Fonction pour convertir une URL relative en URL absolue
function getFullUrl($relativePath) {
    if (!$relativePath) {
        return null;
    }
    // Si déjà une URL absolue (commence par http:// ou https://), retourner tel quel
    if (preg_match('/^https?:\/\//', $relativePath)) {
        return $relativePath;
    }
    // Éviter le double /api/ : si BASE_URL se termine par /api et le chemin commence par /api/
    if (str_ends_with(BASE_URL, '/api') && str_starts_with($relativePath, '/api/')) {
        $relativePath = substr($relativePath, 4); // Enlever '/api' du début
    }
    return BASE_URL . $relativePath;
}
// Inclure les utilitaires de sécurité après avoir défini les fonctions de config
require_once __DIR__ . '/utils/security.php';
?>