<?php
/**
 * Endpoint pour récupérer les infos de l'utilisateur connecté - Arki'Family
 *
 * GET /api/auth/me.php
 *
 * Headers:
 * Authorization: Bearer <token>
 *
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "user": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "username": "MonPseudo",
 *     "is_admin": false,
 *     "email_verified": true,
 *     "created_at": "2025-01-15 10:30:00",
 *     "last_login": "2025-01-20 15:45:00",
 *     "tribes": [...]  // Liste des tribus dont l'utilisateur est membre
 *   }
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

// Autoriser uniquement GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonError('Méthode non autorisée', 405);
}

try {
    $pdo = getDbConnection();

    // Vérifier l'authentification
    $user = requireAuth($pdo);

    if (!$user) {
        exit; // requireAuth a déjà envoyé l'erreur
    }

    // ===========================
    // RÉCUPÉRER LES INFOS COMPLÈTES
    // ===========================

    $stmt = $pdo->prepare("
        SELECT id, email, username, is_admin, email_verified, is_banned,
               created_at, last_login
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);
    $userComplete = $stmt->fetch();

    // Récupérer les tribus de l'utilisateur
    $stmt = $pdo->prepare("
        SELECT
            t.id,
            t.name,
            t.slug,
            t.description,
            t.base_photo_url,
            tm.role,
            tm.joined_at,
            (SELECT COUNT(*) FROM dinosaurs WHERE tribe_id = t.id) as dino_count
        FROM tribes t
        INNER JOIN tribe_members tm ON t.id = tm.tribe_id
        WHERE tm.user_id = ? AND tm.is_validated = TRUE AND t.is_validated = TRUE
        ORDER BY tm.role DESC, tm.joined_at ASC
    ");
    $stmt->execute([$user['id']]);
    $tribes = $stmt->fetchAll();

    // ===========================
    // RÉPONSE
    // ===========================

    sendJsonResponse([
        'success' => true,
        'user' => [
            'id' => (int)$userComplete['id'],
            'email' => $userComplete['email'],
            'username' => $userComplete['username'],
            'is_admin' => (bool)$userComplete['is_admin'],
            'email_verified' => (bool)$userComplete['email_verified'],
            'is_banned' => (bool)$userComplete['is_banned'],
            'created_at' => $userComplete['created_at'],
            'last_login' => $userComplete['last_login'],
            'tribes' => array_map(function($tribe) {
                return [
                    'id' => (int)$tribe['id'],
                    'name' => $tribe['name'],
                    'slug' => $tribe['slug'],
                    'description' => $tribe['description'],
                    'base_photo_url' => $tribe['base_photo_url'],
                    'role' => $tribe['role'],
                    'joined_at' => $tribe['joined_at'],
                    'dino_count' => (int)$tribe['dino_count']
                ];
            }, $tribes)
        ]
    ]);

} catch (PDOException $e) {
    logActivity('Erreur BDD lors de la récupération du profil', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Erreur lors de la récupération du profil', 500);
} catch (Exception $e) {
    logActivity('Erreur lors de la récupération du profil', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
