<?php
/**
 * Middleware d'authentification - Arki'Family
 *
 * Vérifie que l'utilisateur est authentifié avant d'accéder aux endpoints protégés.
 * Utilise JWT (JSON Web Tokens) stockés dans les cookies ou headers.
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/security.php';

// Polyfill pour getallheaders() (FastCGI/PHP-FPM compatibility)
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $header = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
}

// Clé secrète JWT
// JWT_SECRET doit être défini dans config.php ou config.local.php
if (!defined('JWT_SECRET')) {
    http_response_code(500);
    die(json_encode(['error' => 'Configuration JWT manquante']));
}

/**
 * Vérifier l'authentification JWT
 *
 * @param PDO $pdo Connexion à la base de données
 * @param bool $requireAdmin Si true, vérifie que l'utilisateur est admin
 * @return array|false Les infos utilisateur ou false si non authentifié
 */
function requireAuth($pdo, $requireAdmin = false) {
    $token = getAuthToken();

    if (!$token) {
        sendJsonError('Non authentifié', 401);
        return false;
    }

    // Vérifier et décoder le JWT
    $payload = verifyJWT($token, JWT_SECRET);

    if (!$payload) {
        sendJsonError('Token invalide ou expiré', 401);
        return false;
    }

    // Récupérer l'utilisateur depuis la base
    $stmt = $pdo->prepare("
        SELECT id, email, username, is_admin, is_banned, email_verified
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJsonError('Utilisateur introuvable', 401);
        return false;
    }

    // Vérifier si banni
    if ($user['is_banned']) {
        sendJsonError('Compte banni', 403);
        return false;
    }

    // Vérifier si email vérifié (sauf pour certains endpoints)
    if (!$user['email_verified'] && !isExemptFromEmailVerification()) {
        sendJsonError('Email non vérifié', 403, [
            'message' => 'Vérifie ton email avant d\'accéder à cette fonctionnalité'
        ]);
        return false;
    }

    // Vérifier si admin requis
    if ($requireAdmin && !$user['is_admin']) {
        sendJsonError('Accès réservé aux administrateurs', 403);
        return false;
    }

    // Mettre à jour la dernière activité
    updateLastActivity($pdo, $user['id']);

    return $user;
}

/**
 * Récupérer le token d'authentification
 * Cherche dans les headers Authorization (Bearer token) ou dans les cookies
 *
 * @return string|null Le token JWT ou null
 */
function getAuthToken() {
    // 1. Vérifier le header Authorization
    $headers = getallheaders();

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }

    // 2. Vérifier les cookies
    if (isset($_COOKIE['auth_token'])) {
        return $_COOKIE['auth_token'];
    }

    return null;
}

/**
 * Créer un token JWT pour un utilisateur
 *
 * @param int $userId ID de l'utilisateur
 * @param int $expiresIn Durée de validité en secondes (par défaut 7 jours)
 * @return string Le token JWT
 */
function createAuthToken($userId, $expiresIn = 604800) {
    $payload = [
        'user_id' => $userId,
        'created_at' => time()
    ];

    return generateJWT($payload, JWT_SECRET, $expiresIn);
}

/**
 * Définir le token dans un cookie sécurisé
 *
 * @param string $token Le token JWT
 * @param int $expiresIn Durée de validité en secondes
 */
function setAuthCookie($token, $expiresIn = 604800) {
    $isProduction = !defined('DEBUG_MODE') || !DEBUG_MODE;

    setcookie(
        'auth_token',
        $token,
        [
            'expires' => time() + $expiresIn,
            'path' => '/',
            'domain' => '', // Laisser vide pour utiliser le domaine actuel
            'secure' => $isProduction, // HTTPS uniquement en production
            'httponly' => true, // Pas accessible via JavaScript (sécurité XSS)
            'samesite' => 'Lax' // Protection CSRF
        ]
    );
}

/**
 * Supprimer le cookie d'authentification
 */
function clearAuthCookie() {
    setcookie(
        'auth_token',
        '',
        [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]
    );
}

/**
 * Mettre à jour la dernière activité de l'utilisateur
 *
 * @param PDO $pdo Connexion BDD
 * @param int $userId ID utilisateur
 */
function updateLastActivity($pdo, $userId) {
    // Ne mettre à jour que toutes les 5 minutes pour éviter trop de requêtes
    static $lastUpdate = [];

    if (isset($lastUpdate[$userId]) && time() - $lastUpdate[$userId] < 300) {
        return;
    }

    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$userId]);

    $lastUpdate[$userId] = time();
}

/**
 * Vérifier si l'endpoint actuel est exempté de la vérification d'email
 *
 * @return bool True si exempté
 */
function isExemptFromEmailVerification() {
    $exemptPaths = [
        '/api/auth/verify-email.php',
        '/api/auth/resend-verification.php',
        '/api/auth/logout.php',
        '/api/auth/me.php' // Pour récupérer les infos de profil
    ];

    $currentPath = $_SERVER['SCRIPT_NAME'] ?? '';

    foreach ($exemptPaths as $path) {
        if (strpos($currentPath, $path) !== false) {
            return true;
        }
    }

    return false;
}

/**
 * Vérifier si l'utilisateur est membre d'une tribu
 *
 * @param PDO $pdo Connexion BDD
 * @param int $userId ID utilisateur
 * @param int $tribeId ID tribu
 * @return array|false Les infos de membre ou false
 */
function isTribeMember($pdo, $userId, $tribeId) {
    $stmt = $pdo->prepare("
        SELECT * FROM tribe_members
        WHERE user_id = ? AND tribe_id = ? AND is_validated = TRUE
    ");
    $stmt->execute([$userId, $tribeId]);
    return $stmt->fetch();
}

/**
 * Vérifier si l'utilisateur est propriétaire d'une tribu
 *
 * @param PDO $pdo Connexion BDD
 * @param int $userId ID utilisateur
 * @param int $tribeId ID tribu
 * @return bool True si propriétaire
 */
function isTribeOwner($pdo, $userId, $tribeId) {
    $stmt = $pdo->prepare("
        SELECT role FROM tribe_members
        WHERE user_id = ? AND tribe_id = ? AND role = 'owner'
    ");
    $stmt->execute([$userId, $tribeId]);
    return $stmt->fetch() !== false;
}

/**
 * Middleware: Vérifier que l'utilisateur est membre de la tribu
 *
 * @param PDO $pdo Connexion BDD
 * @param int $tribeId ID tribu
 * @return array Les infos utilisateur et membre
 */
function requireTribeMember($pdo, $tribeId) {
    $user = requireAuth($pdo);

    if (!$user) {
        return false;
    }

    $member = isTribeMember($pdo, $user['id'], $tribeId);

    if (!$member) {
        sendJsonError('Vous n\'êtes pas membre de cette tribu', 403);
        return false;
    }

    return ['user' => $user, 'member' => $member];
}

/**
 * Middleware: Vérifier que l'utilisateur est propriétaire de la tribu
 *
 * @param PDO $pdo Connexion BDD
 * @param int $tribeId ID tribu
 * @return array Les infos utilisateur
 */
function requireTribeOwner($pdo, $tribeId) {
    $user = requireAuth($pdo);

    if (!$user) {
        return false;
    }

    if (!isTribeOwner($pdo, $user['id'], $tribeId)) {
        sendJsonError('Accès réservé au propriétaire de la tribu', 403);
        return false;
    }

    return $user;
}

/**
 * Middleware: Vérifier que l'utilisateur est admin
 *
 * @param PDO $pdo Connexion BDD
 * @return array Les infos utilisateur admin
 */
function requireAdmin($pdo) {
    return requireAuth($pdo, true);
}

/**
 * Obtenir les infos de l'utilisateur connecté (optionnel)
 * Ne bloque pas si non connecté
 *
 * @param PDO $pdo Connexion BDD
 * @return array|null Les infos utilisateur ou null
 */
function getOptionalAuth($pdo) {
    $token = getAuthToken();

    if (!$token) {
        return null;
    }

    $payload = verifyJWT($token, JWT_SECRET);

    if (!$payload) {
        return null;
    }

    $stmt = $pdo->prepare("
        SELECT id, email, username, is_admin, is_banned, email_verified
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$payload['user_id']]);

    return $stmt->fetch() ?: null;
}
?>
