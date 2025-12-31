<?php
/**
 * API pour transférer la propriété d'une tribu
 * Endpoint: POST /tribe-transfer-ownership.php
 */

require_once 'config.php';
require_once 'middleware/auth.php';

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonError('Méthode non autorisée', 405);
    exit;
}

// Connexion DB
$pdo = getDbConnection();

// Vérifier l'authentification
$user = requireAuth($pdo);

if (!$user) {
    exit;
}

try {
    // Récupérer les données
    $input = json_decode(file_get_contents('php://input'), true);
    $newOwnerId = $input['new_owner_id'] ?? null;

    if (!$newOwnerId) {
        sendJsonError('ID du nouveau propriétaire manquant', 400);
        exit;
    }

    // Récupérer la tribu de l'utilisateur actuel
    $stmt = $pdo->prepare("
        SELECT tm.tribe_id, tm.role, tm.id as member_id
        FROM tribe_members tm
        WHERE tm.user_id = ? AND tm.is_validated = 1
    ");
    $stmt->execute([$user['id']]);
    $currentMember = $stmt->fetch();

    if (!$currentMember) {
        sendJsonError('Vous n\'êtes pas membre d\'une tribu', 403);
        exit;
    }

    if ($currentMember['role'] !== 'owner') {
        sendJsonError('Seul le propriétaire peut transférer la propriété', 403);
        exit;
    }

    $tribeId = $currentMember['tribe_id'];

    // Vérifier que le nouveau propriétaire est un membre validé de la tribu
    $stmt = $pdo->prepare("
        SELECT tm.id as member_id, tm.user_id, tm.role, u.username
        FROM tribe_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.user_id = ? AND tm.tribe_id = ? AND tm.is_validated = 1
    ");
    $stmt->execute([$newOwnerId, $tribeId]);
    $newOwner = $stmt->fetch();

    if (!$newOwner) {
        sendJsonError('Le nouveau propriétaire n\'est pas membre de cette tribu', 400);
        exit;
    }

    // Vérifier que ce n'est pas le même utilisateur
    if ($newOwnerId == $user['id']) {
        sendJsonError('Vous êtes déjà le propriétaire', 400);
        exit;
    }

    // Commencer une transaction
    $pdo->beginTransaction();

    try {
        // Mettre à jour l'ancien propriétaire en membre
        $stmt = $pdo->prepare("
            UPDATE tribe_members
            SET role = 'member'
            WHERE id = ?
        ");
        $stmt->execute([$currentMember['member_id']]);

        // Mettre à jour le nouveau propriétaire
        $stmt = $pdo->prepare("
            UPDATE tribe_members
            SET role = 'owner'
            WHERE id = ?
        ");
        $stmt->execute([$newOwner['member_id']]);

        // Mettre à jour la table tribes
        $stmt = $pdo->prepare("
            UPDATE tribes
            SET owner_id = ?
            WHERE id = ?
        ");
        $stmt->execute([$newOwnerId, $tribeId]);

        // Valider la transaction
        $pdo->commit();

        sendJsonResponse([
            'message' => 'La propriété de la tribu a été transférée avec succès',
            'new_owner' => [
                'id' => (int)$newOwner['user_id'],
                'username' => $newOwner['username']
            ]
        ]);

    } catch (Exception $e) {
        // Annuler la transaction en cas d'erreur
        $pdo->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    sendJsonError('Erreur lors du transfert de propriété: ' . $e->getMessage(), 500);
}
?>
