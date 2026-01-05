<?php
/**
 * Endpoint pour gérer le profil utilisateur - Arki'Family
 *
 * PUT /api/auth/profile.php
 * Content-Type: application/json
 * Body: {
 *   "action": "update_email",
 *   "newEmail": "newemail@example.com",
 *   "password": "currentpassword"
 * }
 * OU
 * Body: {
 *   "action": "update_password",
 *   "currentPassword": "oldpass",
 *   "newPassword": "newpass"
 * }
 *
 * POST /api/auth/profile.php
 * Content-Type: multipart/form-data
 * Body: {
 *   "action": "upload_avatar",
 *   "avatar": <file>
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/security.php';

header('Content-Type: application/json');

// ===========================
// GESTION DES MÉTHODES
// ===========================

$method = $_SERVER['REQUEST_METHOD'];

// Protection CSRF pour les méthodes modifiant des données
if (in_array($method, ['POST', 'PUT'])) {
    if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'upload_avatar') {
        // Pour les uploads, le token peut être dans $_POST
        requireCsrfToken($_POST);
    } else {
        // Pour les autres requêtes JSON
        $input = json_decode(file_get_contents('php://input'), true);
        requireCsrfToken($input);
    }
}

if ($method === 'PUT') {
    handlePut();
} elseif ($method === 'POST') {
    handlePost();
} else {
    sendJsonError('Méthode non autorisée', 405);
}

// ===========================
// HANDLER PUT
// ===========================

function handlePut() {
    global $pdo;

    try {
        $pdo = getDbConnection();
        $user = requireAuth($pdo);

        if (!$user) {
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['action'])) {
            sendJsonError('Action manquante', 400);
            return;
        }

        $action = $input['action'];

        if ($action === 'update_email') {
            updateEmail($pdo, $user, $input);
        } elseif ($action === 'update_password') {
            updatePassword($pdo, $user, $input);
        } else {
            sendJsonError('Action non reconnue', 400);
        }

    } catch (PDOException $e) {
        logActivity('Erreur BDD lors de la mise à jour du profil', 'ERROR', [
            'error' => $e->getMessage()
        ]);
        sendJsonError('Erreur lors de la mise à jour du profil', 500);
    } catch (Exception $e) {
        logActivity('Erreur lors de la mise à jour du profil', 'ERROR', [
            'error' => $e->getMessage()
        ]);
        sendJsonError('Une erreur est survenue', 500);
    }
}

// ===========================
// HANDLER POST
// ===========================

function handlePost() {
    global $pdo;

    try {
        $pdo = getDbConnection();
        $user = requireAuth($pdo);

        if (!$user) {
            exit;
        }

        $action = $_POST['action'] ?? null;

        if (!$action) {
            sendJsonError('Action manquante', 400);
            return;
        }

        if ($action === 'upload_avatar') {
            uploadAvatar($pdo, $user);
        } else {
            sendJsonError('Action non reconnue', 400);
        }

    } catch (PDOException $e) {
        logActivity('Erreur BDD lors de l\'upload d\'avatar', 'ERROR', [
            'error' => $e->getMessage()
        ]);
        sendJsonError('Erreur lors de l\'upload d\'avatar', 500);
    } catch (Exception $e) {
        logActivity('Erreur lors de l\'upload d\'avatar', 'ERROR', [
            'error' => $e->getMessage()
        ]);
        sendJsonError('Une erreur est survenue', 500);
    }
}

// ===========================
// UPDATE EMAIL
// ===========================

function updateEmail($pdo, $user, $input) {
    // Validation
    if (!isset($input['newEmail']) || !isset($input['password'])) {
        sendJsonError('Email et mot de passe requis', 400);
        return;
    }

    $newEmail = trim($input['newEmail']);
    $password = $input['password'];

    // Valider l'email
    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        sendJsonError('Email invalide', 400);
        return;
    }

    // Vérifier que l'email n'est pas déjà utilisé
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$newEmail, $user['id']]);
    if ($stmt->fetch()) {
        sendJsonError('Cet email est déjà utilisé', 400);
        return;
    }

    // Vérifier le mot de passe actuel
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $userData = $stmt->fetch();

    if (!password_verify($password, $userData['password_hash'])) {
        sendJsonError('Mot de passe incorrect', 401);
        return;
    }

    // Mettre à jour l'email
    $stmt = $pdo->prepare("UPDATE users SET email = ?, email_verified = FALSE WHERE id = ?");
    $stmt->execute([$newEmail, $user['id']]);

    logActivity('Email mis à jour', 'INFO', ['user_id' => $user['id']]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Email mis à jour avec succès. Vous devez vérifier votre nouvel email.',
        'newEmail' => $newEmail
    ]);
}

// ===========================
// UPDATE PASSWORD
// ===========================

function updatePassword($pdo, $user, $input) {
    // Validation
    if (!isset($input['currentPassword']) || !isset($input['newPassword'])) {
        sendJsonError('Mots de passe requis', 400);
        return;
    }

    $currentPassword = $input['currentPassword'];
    $newPassword = $input['newPassword'];

    // Valider le nouveau mot de passe
    if (strlen($newPassword) < 8) {
        sendJsonError('Le mot de passe doit contenir au moins 8 caractères', 400);
        return;
    }

    // Vérifier le mot de passe actuel
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $userData = $stmt->fetch();

    if (!password_verify($currentPassword, $userData['password_hash'])) {
        sendJsonError('Mot de passe actuel incorrect', 401);
        return;
    }

    // Hasher le nouveau mot de passe
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    // Mettre à jour le mot de passe
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$newPasswordHash, $user['id']]);

    logActivity('Mot de passe mis à jour', 'INFO', ['user_id' => $user['id']]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Mot de passe mis à jour avec succès'
    ]);
}

// ===========================
// UPLOAD AVATAR
// ===========================

function uploadAvatar($pdo, $user) {
    // Vérifier qu'un fichier a été uploadé
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        sendJsonError('Aucun fichier valide n\'a été uploadé', 400);
        return;
    }

    $file = $_FILES['avatar'];

    // Vérifier le type de fichier
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        sendJsonError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP', 400);
        return;
    }

    // Vérifier la taille (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendJsonError('Le fichier est trop volumineux (max 5MB)', 400);
        return;
    }

    // Créer le dossier uploads/avatars s'il n'existe pas
    $uploadDir = __DIR__ . '/../uploads/avatars';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Générer un nom de fichier unique
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . $user['id'] . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . '/' . $filename;

    // Déplacer le fichier
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        sendJsonError('Erreur lors de l\'upload du fichier', 500);
        return;
    }

    // Supprimer l'ancien avatar s'il existe
    $stmt = $pdo->prepare("SELECT photo_profil FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $oldData = $stmt->fetch();

    if ($oldData && $oldData['photo_profil']) {
        $oldPath = __DIR__ . '/..' . parse_url($oldData['photo_profil'], PHP_URL_PATH);
        if (file_exists($oldPath)) {
            unlink($oldPath);
        }
    }

    // Mettre à jour la base de données
    $avatarUrl = '/uploads/avatars/' . $filename;
    $stmt = $pdo->prepare("UPDATE users SET photo_profil = ? WHERE id = ?");
    $stmt->execute([$avatarUrl, $user['id']]);

    logActivity('Avatar mis à jour', 'INFO', ['user_id' => $user['id']]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Photo de profil mise à jour avec succès',
        'avatar_url' => $avatarUrl
    ]);
}
?>
