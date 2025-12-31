<?php
/**
 * Endpoint de déconnexion - Arki'Family
 *
 * POST /api/auth/logout.php
 *
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "message": "Déconnexion réussie"
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

// Autoriser uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonError('Méthode non autorisée', 405);
}

try {
    $pdo = getDbConnection();

    // Vérifier l'authentification (optionnel car on déconnecte quand même)
    $user = getOptionalAuth($pdo);

    // Supprimer le cookie d'authentification
    clearAuthCookie();

    // Logger la déconnexion si user authentifié
    if ($user) {
        logActivity('Déconnexion', 'INFO', [
            'user_id' => $user['id'],
            'username' => $user['username']
        ]);
    }

    // Réponse succès
    sendJsonResponse([
        'success' => true,
        'message' => 'Déconnexion réussie'
    ]);

} catch (Exception $e) {
    logActivity('Erreur lors de la déconnexion', 'ERROR', [
        'error' => $e->getMessage()
    ]);
    sendJsonError('Une erreur est survenue', 500);
}
?>
