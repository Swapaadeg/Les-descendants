<?php
/**
 * Endpoint de réinitialisation de mot de passe - Arki'Family
 *
 * Deux actions:
 * 1. Demander un reset (POST avec email)
 * 2. Réinitialiser le mot de passe (POST avec token + nouveau mot de passe)
 *
 * === Action 1: Demander un reset ===
 * POST /api/auth/reset-password.php
 * {
 *   "action": "request",
 *   "email": "user@example.com"
 * }
 *
 * === Action 2: Réinitialiser ===
 * POST /api/auth/reset-password.php
 * {
 *   "action": "reset",
 *   "token": "abc123...",
 *   "password": "NouveauMotDePasse123!",
 *   "password_confirm": "NouveauMotDePasse123!"
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/mailer.php';

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

    $action = $input['action'] ?? '';

    // ===========================
    // ACTION 1: DEMANDER UN RESET
    // ===========================

    if ($action === 'request') {
        $email = trim($input['email'] ?? '');

        // Validation
        if (empty($email)) {
            sendJsonError('L\'email est requis', 400);
        }

        if (!validateEmail($email)) {
            sendJsonError('L\'email est invalide', 400);
        }

        // Rate limiting (3 demandes par heure max par IP)
        $clientIp = getClientIP();
        $rateLimit = checkRateLimit($pdo, $clientIp, 'password_reset_request', 3, 3600);

        if (!$rateLimit['allowed']) {
            sendJsonError(
                'Trop de demandes de réinitialisation. Réessayez dans ' . ceil($rateLimit['reset_in'] / 60) . ' minutes.',
                429
            );
        }

        // Trouver l'utilisateur
        $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Toujours retourner succès même si email n'existe pas (sécurité)
        // Évite de révéler si un email est enregistré ou non
        if (!$user) {
            logActivity('Demande reset password pour email inexistant', 'WARNING', [
                'email' => $email,
                'ip' => $clientIp
            ]);

            // Retourner succès quand même
            sendJsonResponse([
                'success' => true,
                'message' => 'Si cet email est enregistré, un lien de réinitialisation a été envoyé.'
            ]);
        }

        // Générer un token de reset
        $resetToken = generateSecureToken(32);
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 heure

        // Enregistrer le token
        $stmt = $pdo->prepare("
            UPDATE users
            SET reset_token = ?, reset_token_expires = ?
            WHERE id = ?
        ");
        $stmt->execute([$resetToken, $expiresAt, $user['id']]);

        // Envoyer l'email
        $emailSent = sendPasswordResetEmail($user['email'], $user['username'], $resetToken);

        // Logger la demande
        logActivity('Demande de réinitialisation de mot de passe', 'INFO', [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'ip' => $clientIp,
            'email_sent' => $emailSent
        ]);

        // Réponse
        sendJsonResponse([
            'success' => true,
            'message' => 'Si cet email est enregistré, un lien de réinitialisation a été envoyé.',
            'email_sent' => $emailSent
        ]);
    }

    // ===========================
    // ACTION 2: RÉINITIALISER LE MOT DE PASSE
    // ===========================

    elseif ($action === 'reset') {
        $token = $input['token'] ?? '';
        $password = $input['password'] ?? '';
        $passwordConfirm = $input['password_confirm'] ?? '';

        // Validation
        if (empty($token)) {
            sendJsonError('Token requis', 400);
        }

        if (empty($password)) {
            sendJsonError('Le nouveau mot de passe est requis', 400);
        }

        if ($password !== $passwordConfirm) {
            sendJsonError('Les mots de passe ne correspondent pas', 400);
        }

        // Valider la force du mot de passe
        $passwordValidation = validatePasswordStrength($password);
        if (!$passwordValidation['valid']) {
            sendJsonError('Mot de passe trop faible', 400, $passwordValidation['errors']);
        }

        // Trouver l'utilisateur avec ce token
        $stmt = $pdo->prepare("
            SELECT id, username, email, reset_token_expires
            FROM users
            WHERE reset_token = ?
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            sendJsonError('Token de réinitialisation invalide', 400);
        }

        // Vérifier l'expiration
        if (strtotime($user['reset_token_expires']) < time()) {
            sendJsonError('Token expiré. Demandez un nouveau lien de réinitialisation.', 400);
        }

        // Hasher le nouveau mot de passe
        $passwordHash = hashPassword($password);

        // Mettre à jour le mot de passe et supprimer le token
        $stmt = $pdo->prepare("
            UPDATE users
            SET password_hash = ?,
                reset_token = NULL,
                reset_token_expires = NULL
            WHERE id = ?
        ");
        $stmt->execute([$passwordHash, $user['id']]);

        // Logger la réinitialisation
        logActivity('Mot de passe réinitialisé', 'INFO', [
            'user_id' => $user['id'],
            'email' => $user['email']
        ]);

        // Réponse
        sendJsonResponse([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès ! Tu peux maintenant te connecter.'
        ]);
    }

    // ===========================
    // ACTION INVALIDE
    // ===========================

    else {
        sendJsonError('Action invalide. Utilisez "request" ou "reset"', 400);
    }

} catch (PDOException $e) {
    logActivity('Erreur BDD lors du reset password', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Erreur lors de la réinitialisation', 500);
} catch (Exception $e) {
    logActivity('Erreur lors du reset password', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
