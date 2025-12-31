<?php
/**
 * Endpoint pour renvoyer l'email de vérification - Arki'Family
 *
 * POST /api/auth/resend-verification.php
 *
 * Body (JSON):
 * {
 *   "email": "user@example.com"
 * }
 *
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "message": "Email de vérification renvoyé"
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/mailer.php';

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

    $email = trim($input['email'] ?? '');

    // ===========================
    // VALIDATION
    // ===========================

    if (empty($email)) {
        sendJsonError('L\'email est requis', 400);
    }

    if (!validateEmail($email)) {
        sendJsonError('L\'email est invalide', 400);
    }

    // ===========================
    // RATE LIMITING
    // ===========================

    $clientIp = getClientIP();
    $rateLimit = checkRateLimit($pdo, $email, 'resend_verification', 3, 3600); // 3 fois par heure

    if (!$rateLimit['allowed']) {
        sendJsonError(
            'Trop de demandes de renvoi. Réessayez dans ' . ceil($rateLimit['reset_in'] / 60) . ' minutes.',
            429
        );
    }

    // ===========================
    // TROUVER L'UTILISATEUR
    // ===========================

    $stmt = $pdo->prepare("
        SELECT id, username, email, email_verified, verification_token, created_at
        FROM users
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Toujours retourner succès même si email n'existe pas (sécurité)
    if (!$user) {
        logActivity('Tentative de renvoi vérification pour email inexistant', 'WARNING', [
            'email' => $email,
            'ip' => $clientIp
        ]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Si cet email est enregistré et non vérifié, un nouveau lien a été envoyé.'
        ]);
    }

    // Vérifier si déjà vérifié
    if ($user['email_verified']) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Cet email est déjà vérifié.'
        ]);
    }

    // ===========================
    // GÉNÉRER UN NOUVEAU TOKEN
    // ===========================

    $verificationToken = generateSecureToken(32);

    $stmt = $pdo->prepare("
        UPDATE users
        SET verification_token = ?
        WHERE id = ?
    ");
    $stmt->execute([$verificationToken, $user['id']]);

    // ===========================
    // ENVOYER L'EMAIL
    // ===========================

    $emailSent = sendVerificationEmail($user['email'], $user['username'], $verificationToken);

    // Logger
    logActivity('Renvoi email de vérification', 'INFO', [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'email_sent' => $emailSent
    ]);

    // ===========================
    // RÉPONSE
    // ===========================

    sendJsonResponse([
        'success' => true,
        'message' => 'Un nouveau lien de vérification a été envoyé à ton email.',
        'email_sent' => $emailSent
    ]);

} catch (PDOException $e) {
    logActivity('Erreur BDD lors du renvoi de vérification', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Erreur lors du renvoi', 500);
} catch (Exception $e) {
    logActivity('Erreur lors du renvoi de vérification', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
