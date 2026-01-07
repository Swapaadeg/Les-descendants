<?php
/**
 * Utilitaires de sécurité - Arki'Family
 *
 * Fonctions pour la gestion sécurisée de l'authentification :
 * - Hashage de mots de passe (Argon2id)
 * - Génération de tokens sécurisés
 * - Validation de données
 * - Protection CSRF
 * - Rate limiting
 */

/**
 * Hasher un mot de passe avec Argon2id (le plus sécurisé)
 *
 * @param string $password Le mot de passe en clair
 * @return string Le hash du mot de passe
 */
function hashPassword($password) {
    // Argon2id est le meilleur algorithme actuellement (2025)
    // Options par défaut recommandées par l'OWASP
    return password_hash($password, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,  // 64 MB
        'time_cost' => 4,        // 4 itérations
        'threads' => 2           // 2 threads parallèles
    ]);
}

/**
 * Vérifier un mot de passe
 *
 * @param string $password Le mot de passe en clair
 * @param string $hash Le hash stocké
 * @return bool True si le mot de passe est correct
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Vérifier si un hash doit être rehashé (algorithme obsolète ou options changées)
 *
 * @param string $hash Le hash actuel
 * @return bool True si le hash doit être recalculé
 */
function needsRehash($hash) {
    return password_needs_rehash($hash, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 2
    ]);
}

/**
 * Valider la force d'un mot de passe
 *
 * Règles :
 * - Minimum 8 caractères
 * - Au moins une majuscule
 * - Au moins une minuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial
 *
 * @param string $password Le mot de passe à valider
 * @return array ['valid' => bool, 'errors' => array]
 */
function validatePasswordStrength($password) {
    $errors = [];

    if (strlen($password) < 8) {
        $errors[] = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = "Le mot de passe doit contenir au moins une majuscule";
    }

    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = "Le mot de passe doit contenir au moins une minuscule";
    }

    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = "Le mot de passe doit contenir au moins un chiffre";
    }

    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)";
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors
    ];
}

/**
 * Générer un token aléatoire sécurisé
 *
 * @param int $length Longueur du token (en bytes, sera converti en hex donc x2)
 * @return string Token hexadécimal
 */
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Générer un token JWT simple (sans lib externe)
 *
 * @param array $payload Les données à encoder
 * @param string $secret La clé secrète
 * @param int $expiresIn Durée de validité en secondes (par défaut 24h)
 * @return string Le token JWT
 */
function generateJWT($payload, $secret, $expiresIn = 86400) {
    $header = [
        'typ' => 'JWT',
        'alg' => 'HS256'
    ];

    $payload['iat'] = time();
    $payload['exp'] = time() + $expiresIn;

    $base64UrlHeader = base64UrlEncode(json_encode($header));
    $base64UrlPayload = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac(
        'sha256',
        $base64UrlHeader . "." . $base64UrlPayload,
        $secret,
        true
    );
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Vérifier et décoder un token JWT
 *
 * @param string $jwt Le token JWT
 * @param string $secret La clé secrète
 * @return array|false Les données décodées ou false si invalide
 */
function verifyJWT($jwt, $secret) {
    $parts = explode('.', $jwt);

    if (count($parts) !== 3) {
        return false;
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    // Vérifier la signature
    $signature = base64UrlDecode($base64UrlSignature);
    $expectedSignature = hash_hmac(
        'sha256',
        $base64UrlHeader . "." . $base64UrlPayload,
        $secret,
        true
    );

    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }

    // Décoder le payload
    $payload = json_decode(base64UrlDecode($base64UrlPayload), true);

    // Vérifier l'expiration
    if (isset($payload['exp']) && time() > $payload['exp']) {
        return false;
    }

    return $payload;
}

/**
 * Encoder en Base64 URL-safe
 */
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Décoder depuis Base64 URL-safe
 */
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Valider un email
 *
 * @param string $email L'email à valider
 * @return bool True si valide
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Valider un username
 *
 * Règles :
 * - 3-50 caractères
 * - Lettres, chiffres, underscore, tiret uniquement
 * - Pas d'espaces
 *
 * @param string $username Le username à valider
 * @return array ['valid' => bool, 'error' => string|null]
 */
function validateUsername($username) {
    if (strlen($username) < 3) {
        return ['valid' => false, 'error' => 'Le pseudo doit contenir au moins 3 caractères'];
    }

    if (strlen($username) > 50) {
        return ['valid' => false, 'error' => 'Le pseudo ne peut pas dépasser 50 caractères'];
    }

    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
        return ['valid' => false, 'error' => 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores'];
    }

    return ['valid' => true, 'error' => null];
}

/**
 * Protection contre les attaques par force brute (rate limiting simple)
 *
 * @param PDO $pdo Connexion à la base de données
 * @param string $identifier Identifiant unique (IP, email, etc.)
 * @param string $action Type d'action ('login', 'register', etc.)
 * @param int $maxAttempts Nombre max de tentatives
 * @param int $timeWindow Fenêtre de temps en secondes
 * @return array ['allowed' => bool, 'remaining' => int, 'reset_in' => int]
 */
function checkRateLimit($pdo, $identifier, $action, $maxAttempts = 5, $timeWindow = 300) {
    $cacheKey = hash('sha256', $action . ':' . $identifier);

    // Nettoyer les anciennes tentatives
    $stmt = $pdo->prepare("
        DELETE FROM activity_logs
        WHERE action = 'rate_limit'
        AND JSON_EXTRACT(details, '$.cache_key') = ?
        AND created_at < DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");
    $stmt->execute([$cacheKey, $timeWindow]);

    // Compter les tentatives récentes
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count,
               MIN(created_at) as first_attempt
        FROM activity_logs
        WHERE action = 'rate_limit'
        AND JSON_EXTRACT(details, '$.cache_key') = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");
    $stmt->execute([$cacheKey, $timeWindow]);
    $result = $stmt->fetch();

    $attempts = $result['count'];
    $allowed = $attempts < $maxAttempts;

    // Enregistrer cette tentative
    if (!$allowed) {
        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (action, entity_type, details, ip_address)
            VALUES ('rate_limit', ?, ?, ?)
        ");
        $stmt->execute([
            $action,
            json_encode(['cache_key' => $cacheKey, 'identifier' => $identifier]),
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    }

    $resetIn = 0;
    if (!$allowed && $result['first_attempt']) {
        $firstAttempt = strtotime($result['first_attempt']);
        $resetIn = max(0, $timeWindow - (time() - $firstAttempt));
    }

    return [
        'allowed' => $allowed,
        'remaining' => max(0, $maxAttempts - $attempts),
        'reset_in' => $resetIn
    ];
}

/**
 * Générer un token CSRF
 *
 * @return string Le token CSRF
 */
function generateCSRFToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $token = generateSecureToken(32);
    $_SESSION['csrf_token'] = $token;
    $_SESSION['csrf_token_time'] = time();

    return $token;
}

/**
 * Vérifier un token CSRF
 *
 * @param string $token Le token à vérifier
 * @param int $maxAge Durée de validité max en secondes (défaut 1h)
 * @return bool True si valide
 */
function verifyCSRFToken($token, $maxAge = 3600) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
        return false;
    }

    // Vérifier que le token n'est pas null
    if ($token === null || $token === '') {
        return false;
    }

    // Vérifier l'expiration
    if (time() - $_SESSION['csrf_token_time'] > $maxAge) {
        return false;
    }

    // Comparaison sécurisée (protection timing attacks)
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Nettoyer et valider les inputs
 *
 * @param mixed $data Les données à nettoyer
 * @param string $type Type de validation ('email', 'string', 'int', etc.)
 * @return mixed Les données nettoyées
 */
function sanitizeAndValidate($data, $type = 'string') {
    switch ($type) {
        case 'email':
            $data = filter_var($data, FILTER_SANITIZE_EMAIL);
            return validateEmail($data) ? $data : false;

        case 'int':
            return filter_var($data, FILTER_VALIDATE_INT);

        case 'float':
            return filter_var($data, FILTER_VALIDATE_FLOAT);

        case 'url':
            $data = filter_var($data, FILTER_SANITIZE_URL);
            return filter_var($data, FILTER_VALIDATE_URL) ? $data : false;

        case 'string':
        default:
            return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }
}

/**
 * Obtenir l'adresse IP réelle du client (même derrière un proxy)
 *
 * @return string L'adresse IP
 */
function getClientIP() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    // Vérifier si derrière un proxy
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }

    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'unknown';
}

/**
 * Générer une clé secrète JWT (à appeler une seule fois lors du setup)
 *
 * @return string La clé secrète (à stocker dans config.php)
 */
function generateJWTSecret() {
    return base64_encode(random_bytes(64));
}

/**
 * Logger une activité dans la base de données
 *
 * @param string $action Description de l'action
 * @param string $level Niveau de log ('INFO', 'WARNING', 'ERROR', 'DEBUG')
 * @param array $details Détails supplémentaires (sera encodé en JSON)
 * @param string|null $entityType Type d'entité concernée (optionnel)
 * @param int|null $entityId ID de l'entité concernée (optionnel)
 * @return bool True si enregistré avec succès
 */
function logActivity($action, $level = 'INFO', $details = [], $entityType = null, $entityId = null) {
    try {
        // Obtenir la connexion DB si elle existe
        if (!function_exists('getDbConnection')) {
            // Si pas de connexion DB disponible, écrire dans un fichier de log
            $logFile = __DIR__ . '/../logs/activity.log';
            $logDir = dirname($logFile);
            if (!is_dir($logDir)) {
                mkdir($logDir, 0777, true);
            }

            $logEntry = sprintf(
                "[%s] [%s] %s | %s\n",
                date('Y-m-d H:i:s'),
                $level,
                $action,
                json_encode($details, JSON_UNESCAPED_UNICODE)
            );
            file_put_contents($logFile, $logEntry, FILE_APPEND);
            return true;
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (action, level, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        return $stmt->execute([
            $action,
            $level,
            $entityType,
            $entityId,
            json_encode($details, JSON_UNESCAPED_UNICODE),
            getClientIP()
        ]);

    } catch (Exception $e) {
        // En cas d'erreur, écrire dans un fichier de log de secours
        $logFile = __DIR__ . '/../logs/activity.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }

        $logEntry = sprintf(
            "[%s] [ERROR] Failed to log activity: %s | Original: [%s] %s\n",
            date('Y-m-d H:i:s'),
            $e->getMessage(),
            $level,
            $action
        );
        file_put_contents($logFile, $logEntry, FILE_APPEND);
        return false;
    }
}

/**
 * ===========================
 * WRAPPERS POUR COMPATIBILITÉ
 * ===========================
 * Compatibilité avec les appels utilisant les noms minuscules
 */

if (!function_exists('generateCsrfToken')) {
    function generateCsrfToken() {
        return generateCSRFToken();
    }
}

if (!function_exists('verifyCsrfToken')) {
    function verifyCsrfToken($token, $maxAge = 3600) {
        return verifyCSRFToken($token, $maxAge);
    }
}

if (!function_exists('getCsrfTokenFromRequest')) {
    function getCsrfTokenFromRequest($input = null) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Chercher dans JSON body
        if (is_array($input) && isset($input['csrf_token'])) {
            return $input['csrf_token'];
        }
        
        // Chercher dans $_POST
        if (isset($_POST['csrf_token'])) {
            return $_POST['csrf_token'];
        }
        
        // Chercher dans les headers
        $headers = getallheaders();
        if (isset($headers['X-CSRF-Token'])) {
            return $headers['X-CSRF-Token'];
        }
        
        return null;
    }
}

if (!function_exists('requireCsrfToken')) {
    function requireCsrfToken($input = null) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = getCsrfTokenFromRequest($input);
        
        if (!verifyCsrfToken($token)) {
            sendJsonError('Token CSRF invalide ou expiré', 403);
            exit;
        }
    }
}

if (!function_exists('sendSecureJsonResponse')) {
    function sendSecureJsonResponse($data) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;
    }
}

/**
 * Générer un token CSRF et le servir en JSON
 * Utilisé par l'endpoint /api/auth/csrf-token.php
 */
function serveCsrfToken() {
    $token = generateCSRFToken();
    sendJsonResponse(['csrf_token' => $token]);
}
?>
