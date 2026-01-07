<?php
/**
 * Endpoint de connexion - Arki'Family
 *
 * POST /api/auth/login.php
 *
 * Body (JSON):
 * {
 *   "login": "email@example.com ou pseudo",
 *   "password": "MotDePasse123!",
 *   "remember": true  // Optionnel: rester connecté (7 jours au lieu de 24h)
 * }
 *
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "message": "Connexion réussie",
 *   "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
 *   "user": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "username": "MonPseudo",
 *     "is_admin": false,
 *     "email_verified": true
 *   }
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../middleware/auth.php';

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoriser uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonError('Méthode non autorisée', 405);
}

try {
    $pdo = getDbConnection();

    // Récupérer et parser le JSON
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendJsonError('Données JSON invalides', 400);
    }

    // Récupérer les champs
    $login = trim($input['login'] ?? '');
    $password = $input['password'] ?? '';
    $remember = $input['remember'] ?? false;

    // ===========================
    // VALIDATION
    // ===========================

    if (empty($login)) {
        sendJsonError('L\'email ou le pseudo est requis', 400, ['field' => 'login']);
    }

    if (empty($password)) {
        sendJsonError('Le mot de passe est requis', 400, ['field' => 'password']);
    }

    // ===========================
    // RATE LIMITING
    // ===========================

    $clientIp = getClientIP();
    $rateLimit = checkRateLimit($pdo, $clientIp, 'login', 5, 900); // 5 tentatives par 15 min

    if (!$rateLimit['allowed']) {
        logActivity('Trop de tentatives de connexion', 'WARNING', [
            'ip' => $clientIp,
            'login' => $login
        ]);

        sendJsonError(
            'Trop de tentatives de connexion. Réessayez dans ' . ceil($rateLimit['reset_in'] / 60) . ' minutes.',
            429
        );
    }

    // ===========================
    // TROUVER L'UTILISATEUR
    // ===========================

    // Chercher par email OU username
    $stmt = $pdo->prepare("
        SELECT id, email, username, password_hash, is_admin, is_banned, email_verified, photo_profil
        FROM users
        WHERE email = ? OR username = ?
    ");
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();

    if (!$user) {
        // Ne pas révéler si l'user existe ou non (sécurité)
        logActivity('Tentative de connexion échouée', 'WARNING', [
            'login' => $login,
            'reason' => 'user_not_found',
            'ip' => $clientIp
        ]);

        sendJsonError('Email/pseudo ou mot de passe incorrect', 401);
    }

    // ===========================
    // VÉRIFIER LE MOT DE PASSE
    // ===========================

    if (!verifyPassword($password, $user['password_hash'])) {
        logActivity('Tentative de connexion échouée', 'WARNING', [
            'user_id' => $user['id'],
            'login' => $login,
            'reason' => 'wrong_password',
            'ip' => $clientIp
        ]);

        sendJsonError('Email/pseudo ou mot de passe incorrect', 401);
    }

    // ===========================
    // VÉRIFICATIONS DE SÉCURITÉ
    // ===========================

    // Vérifier si le compte est banni
    if ($user['is_banned']) {
        logActivity('Tentative de connexion compte banni', 'WARNING', [
            'user_id' => $user['id'],
            'ip' => $clientIp
        ]);

        sendJsonError('Votre compte a été banni. Contactez un administrateur.', 403);
    }

    // ===========================
    // REHASH SI NÉCESSAIRE
    // ===========================

    // Si l'algorithme de hash est obsolète, le mettre à jour
    if (needsRehash($user['password_hash'])) {
        $newHash = hashPassword($password);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$newHash, $user['id']]);

        logActivity('Mot de passe rehashé', 'INFO', ['user_id' => $user['id']]);
    }

    // ===========================
    // CRÉER LE TOKEN JWT
    // ===========================

    // Durée de validité: 24h normal, 7 jours si "remember me"
    $expiresIn = $remember ? 604800 : 86400;
    $token = createAuthToken($user['id'], $expiresIn);

    // Définir le cookie
    setAuthCookie($token, $expiresIn);

    // ===========================
    // METTRE À JOUR LAST_LOGIN
    // ===========================

    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Logger la connexion réussie
    logActivity('Connexion réussie', 'INFO', [
        'user_id' => $user['id'],
        'username' => $user['username'],
        'ip' => $clientIp,
        'remember' => $remember
    ]);

    // ===========================
    // RÉPONSE SUCCÈS
    // ===========================

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'token' => $token,
        'expires_in' => $expiresIn,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'is_admin' => (bool)$user['is_admin'],
            'email_verified' => (bool)$user['email_verified'],
            'photo_profil' => $user['photo_profil']
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    logActivity('Erreur BDD lors de la connexion', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Erreur lors de la connexion', 500);
} catch (Exception $e) {
    logActivity('Erreur lors de la connexion', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
