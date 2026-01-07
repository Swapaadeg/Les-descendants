<?php
/**
 * Endpoint d'inscription - Arki'Family
 *
 * POST /api/auth/register.php
 *
 * Body (JSON):
 * {
 *   "email": "user@example.com",
 *   "username": "MonPseudo",
 *   "password": "MotDePasse123!",
 *   "password_confirm": "MotDePasse123!"
 * }
 *
 * Réponse succès (201):
 * {
 *   "success": true,
 *   "message": "Compte créé avec succès",
 *   "user": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "username": "MonPseudo"
 *   }
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

    // Récupérer les champs
    $email = $input['email'] ?? '';
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $passwordConfirm = $input['password_confirm'] ?? '';

    // ===========================
    // VALIDATION DES DONNÉES
    // ===========================

    $errors = [];

    // Validation email
    if (empty($email)) {
        $errors['email'] = 'L\'email est requis';
    } elseif (!validateEmail($email)) {
        $errors['email'] = 'L\'email est invalide';
    }

    // Validation username
    if (empty($username)) {
        $errors['username'] = 'Le pseudo est requis';
    } else {
        $usernameValidation = validateUsername($username);
        if (!$usernameValidation['valid']) {
            $errors['username'] = $usernameValidation['error'];
        }
    }

    // Validation mot de passe
    if (empty($password)) {
        $errors['password'] = 'Le mot de passe est requis';
    } else {
        $passwordValidation = validatePasswordStrength($password);
        if (!$passwordValidation['valid']) {
            $errors['password'] = $passwordValidation['errors'];
        }
    }

    // Vérifier que les mots de passe correspondent
    if ($password !== $passwordConfirm) {
        $errors['password_confirm'] = 'Les mots de passe ne correspondent pas';
    }

    // Si des erreurs de validation, les retourner
    if (!empty($errors)) {
        sendJsonError('Erreurs de validation', 400, $errors);
    }

    // ===========================
    // VÉRIFIER LES DOUBLONS
    // ===========================

    // Vérifier email déjà utilisé
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendJsonError('Erreurs de validation', 409, ['email' => 'Cet email est déjà utilisé']);
    }

    // Vérifier username déjà utilisé
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendJsonError('Erreurs de validation', 409, ['username' => 'Ce pseudo est déjà pris']);
    }

    // ===========================
    // RATE LIMITING
    // ===========================

    $clientIp = getClientIP();
    $rateLimit = checkRateLimit($pdo, $clientIp, 'register', 3, 3600); // 3 inscriptions par heure max

    if (!$rateLimit['allowed']) {
        sendJsonError(
            'Trop de tentatives d\'inscription. Réessayez dans ' . ceil($rateLimit['reset_in'] / 60) . ' minutes.',
            429
        );
    }

    // ===========================
    // CRÉER L'UTILISATEUR
    // ===========================

    // Hasher le mot de passe
    $passwordHash = hashPassword($password);

    // Insérer l'utilisateur avec email_verified = TRUE (vérification désactivée)
    $stmt = $pdo->prepare("
        INSERT INTO users (email, username, password_hash, email_verified, created_at)
        VALUES (?, ?, ?, TRUE, NOW())
    ");

    $stmt->execute([
        $email,
        $username,
        $passwordHash
    ]);

    $userId = $pdo->lastInsertId();

    // Logger l'inscription
    logActivity('Nouvelle inscription', 'INFO', [
        'user_id' => $userId,
        'username' => $username,
        'email' => $email
    ]);

    // ===========================
    // RÉPONSE SUCCÈS
    // ===========================

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Compte créé avec succès ! Tu peux maintenant te connecter.',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'username' => $username,
            'email_verified' => true
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    logActivity('Erreur BDD lors de l\'inscription', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Erreur lors de la création du compte', 500);
} catch (Exception $e) {
    logActivity('Erreur lors de l\'inscription', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
