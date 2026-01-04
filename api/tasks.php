<?php
/**
 * API REST pour gérer les tâches de dinosaures
 * Endpoints: GET, PUT
 */

require_once 'config.php';
require_once 'middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$user = requireAuth($pdo);

if (!$user) {
    exit;
}

switch ($method) {
    case 'GET':
        handleGet($pdo, $user);
        break;
    case 'PUT':
        handlePut($pdo, $user);
        break;
    default:
        sendJsonError('Méthode non autorisée', 405);
}

/**
 * GET - Récupérer les tâches de la tribu
 */
function handleGet($pdo, $user) {
    try {
        // Get user's tribe
        $stmt = $pdo->prepare("
            SELECT tm.tribe_id
            FROM tribe_members tm
            WHERE tm.user_id = ? AND tm.is_validated = 1
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $membership = $stmt->fetch();

        if (!$membership) {
            sendJsonResponse([]);
            return;
        }

        $tribeId = $membership['tribe_id'];

        // Get status filter (default: pending only)
        $status = $_GET['status'] ?? 'pending';

        // Get tasks with dinosaur and user info
        if ($status === 'all') {
            $statusFilter = '';
        } else {
            $statusFilter = 'AND dt.status = :status';
        }

        $sql = "SELECT
                dt.*,
                d.species as dino_species,
                d.photo_url as dino_photo,
                u.username as created_by_username,
                cu.username as completed_by_username
            FROM dino_tasks dt
            JOIN dinosaurs d ON dt.dino_id = d.id
            JOIN users u ON dt.created_by = u.id
            LEFT JOIN users cu ON dt.completed_by = cu.id
            WHERE dt.tribe_id = :tribe_id $statusFilter
            ORDER BY dt.created_at DESC
            LIMIT 100";

        $stmt = $pdo->prepare($sql);
        $params = [':tribe_id' => $tribeId];
        if ($status !== 'all') {
            $params[':status'] = $status;
        }
        $stmt->execute($params);
        $tasks = $stmt->fetchAll();

        // Format response
        $result = array_map(function($task) {
            return [
                'id' => (int)$task['id'],
                'dinoId' => (int)$task['dino_id'],
                'dinoSpecies' => $task['dino_species'],
                'dinoPhoto' => getFullUrl($task['dino_photo']),
                'statName' => $task['stat_name'],
                'statType' => $task['stat_type'],
                'oldValue' => (int)$task['old_value'],
                'newValue' => (int)$task['new_value'],
                'status' => $task['status'],
                'createdBy' => [
                    'id' => (int)$task['created_by'],
                    'username' => $task['created_by_username']
                ],
                'completedBy' => $task['completed_by'] ? [
                    'id' => (int)$task['completed_by'],
                    'username' => $task['completed_by_username']
                ] : null,
                'createdAt' => $task['created_at'],
                'completedAt' => $task['completed_at']
            ];
        }, $tasks);

        sendJsonResponse($result);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la récupération des tâches: ' . $e->getMessage(), 500);
    }
}

/**
 * PUT - Marquer une tâche comme complète
 */
function handlePut($pdo, $user) {
    try {
        $taskId = $_GET['id'] ?? null;
        if (!$taskId) {
            sendJsonError('ID de tâche manquant', 400);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        // Verify user is in the tribe
        $stmt = $pdo->prepare("
            SELECT dt.tribe_id
            FROM dino_tasks dt
            WHERE dt.id = ?
        ");
        $stmt->execute([$taskId]);
        $task = $stmt->fetch();

        if (!$task) {
            sendJsonError('Tâche introuvable', 404);
        }

        $stmt = $pdo->prepare("
            SELECT 1 FROM tribe_members
            WHERE tribe_id = ? AND user_id = ? AND is_validated = 1
        ");
        $stmt->execute([$task['tribe_id'], $user['id']]);

        if (!$stmt->fetch()) {
            sendJsonError('Permission refusée', 403);
        }

        // Update task status
        if (isset($input['status']) && $input['status'] === 'completed') {
            $stmt = $pdo->prepare('UPDATE dino_tasks
                SET status = ?, completed_by = ?, completed_at = NOW()
                WHERE id = ?');
            $stmt->execute(['completed', $user['id'], $taskId]);
        }

        sendJsonResponse(['message' => 'Tâche mise à jour avec succès']);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la mise à jour: ' . $e->getMessage(), 500);
    }
}
