<?php
/**
 * Admin Activity Logger
 * Fonctions pour logger les actions admin dans admin_audit_logs
 */

/**
 * Log une action admin ou utilisateur dans la table audit_logs
 *
 * @param array $params Paramètres du log
 *   - admin_id: ID de l'admin (NULL si action utilisateur)
 *   - action_type: Type d'action (tribe_created, tribe_approved, etc.)
 *   - entity_type: Type d'entité (tribe, event, user)
 *   - entity_id: ID de l'entité (optionnel)
 *   - details: Array de détails supplémentaires (converti en JSON)
 *
 * @return bool True si succès, False si échec
 */
function logAdminActivity($params) {
    global $pdo;

    try {
        $adminId = $params['admin_id'] ?? null;
        $actionType = $params['action_type'];
        $entityType = $params['entity_type'];
        $entityId = $params['entity_id'] ?? null;
        $details = $params['details'] ?? [];

        // Récupérer IP et User-Agent
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $pdo->prepare("
            INSERT INTO admin_audit_logs
            (admin_id, action_type, entity_type, entity_id, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $result = $stmt->execute([
            $adminId,
            $actionType,
            $entityType,
            $entityId,
            json_encode($details, JSON_UNESCAPED_UNICODE),
            $ipAddress,
            $userAgent
        ]);

        return $result;
    } catch (PDOException $e) {
        // Log l'erreur mais ne la propage pas pour ne pas bloquer l'action principale
        error_log("Erreur log admin activity: " . $e->getMessage());
        return false;
    }
}

/**
 * Récupère les dernières actions admin pour le dashboard
 *
 * @param int $limit Nombre d'actions à récupérer (défaut 10)
 * @return array Liste des actions récentes
 */
function getRecentAdminActivity($limit = 10) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            SELECT
                aal.*,
                u.username as admin_username
            FROM admin_audit_logs aal
            LEFT JOIN users u ON aal.admin_id = u.id
            ORDER BY aal.created_at DESC
            LIMIT ?
        ");

        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erreur récupération activity: " . $e->getMessage());
        return [];
    }
}

/**
 * Récupère les actions admin pour une entité spécifique
 *
 * @param string $entityType Type d'entité (tribe, event, user)
 * @param int $entityId ID de l'entité
 * @return array Liste des actions
 */
function getEntityAdminActivity($entityType, $entityId) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            SELECT
                aal.*,
                u.username as admin_username
            FROM admin_audit_logs aal
            LEFT JOIN users u ON aal.admin_id = u.id
            WHERE aal.entity_type = ? AND aal.entity_id = ?
            ORDER BY aal.created_at DESC
        ");

        $stmt->execute([$entityType, $entityId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erreur récupération entity activity: " . $e->getMessage());
        return [];
    }
}
