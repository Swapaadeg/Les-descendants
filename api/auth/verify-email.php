<?php
/**
 * Endpoint de vérification d'email - Arki'Family
 *
 * POST /api/auth/verify-email.php
 *
 * Body (JSON):
 * {
 *   "token": "abc123..."
 * }
 *
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "message": "Email vérifié avec succès",
 *   "user": {...}
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/mailer.php';
require_once __DIR__ . '/../middleware/auth.php';

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoriser POST et GET (GET pour lien direct depuis email)
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonError('Méthode non autorisée', 405);
}

try {
    $pdo = getDbConnection();

    // Récupérer le token (POST ou GET)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
    } else {
        $token = $_GET['token'] ?? '';
    }

    // Valider le token
    if (empty($token)) {
        sendJsonError('Token de vérification requis', 400);
    }

    // ===========================
    // TROUVER L'UTILISATEUR
    // ===========================

    $stmt = $pdo->prepare("
        SELECT id, email, username, email_verified, verification_token, created_at
        FROM users
        WHERE verification_token = ?
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJsonError('Token de vérification invalide', 400);
    }

    // Vérifier si déjà vérifié
    if ($user['email_verified']) {
        sendJsonError('Email déjà vérifié', 400);
    }

    // Vérifier l'expiration du token (24h)
    $createdAt = strtotime($user['created_at']);
    $now = time();
    $expirationTime = 86400; // 24 heures

    if ($now - $createdAt > $expirationTime) {
        sendJsonError('Token expiré. Demandez un nouveau lien de vérification.', 400);
    }

    // ===========================
    // VÉRIFIER L'EMAIL
    // ===========================

    $stmt = $pdo->prepare("
        UPDATE users
        SET email_verified = TRUE, verification_token = NULL
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);

    // Logger la vérification
    logActivity('Email vérifié', 'INFO', [
        'user_id' => $user['id'],
        'email' => $user['email']
    ]);

    // Envoyer un email de bienvenue
    sendWelcomeEmail($user['email'], $user['username']);

    // Créer un token d'authentification pour connecter l'utilisateur
    $authToken = createAuthToken($user['id']);
    setAuthCookie($authToken);

    // ===========================
    // RÉPONSE SUCCÈS
    // ===========================

    sendJsonResponse([
        'success' => true,
        'message' => 'Email vérifié avec succès ! Bienvenue dans Arki\'Family 🎉',
        'token' => $authToken,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'email_verified' => true
        ]
    ]);

} catch (PDOException $e) {
    logActivity('Erreur BDD lors de la vérification email', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Erreur lors de la vérification', 500);
} catch (Exception $e) {
    logActivity('Erreur lors de la vérification email', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
