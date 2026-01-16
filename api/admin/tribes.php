<?php
/**
 * API Admin - Gestion des tribus
 * Endpoints pour approuver, rejeter et gérer les demandes de création de tribus
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/admin-logger.php';

header('Content-Type: application/json');

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user = requireAdmin($pdo);
        if ($user) handleGet($pdo, $user);
        break;

    case 'PUT':
        $user = requireAdmin($pdo);
        if ($user) handlePut($pdo, $user);
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        if ($user) handleDelete($pdo, $user);
        break;

    default:
        sendJsonError('Méthode non autorisée', 405);
}

/**
 * GET - Lister les tribus selon leur statut
 */
function handleGet($pdo, $admin) {
    try {
        $status = $_GET['status'] ?? 'pending';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        // Déterminer le filtre is_validated
        switch ($status) {
            case 'pending':
                $validatedFilter = 0;
                break;
            case 'approved':
                $validatedFilter = 1;
                break;
            case 'all':
                $validatedFilter = null;
                break;
            default:
                sendJsonError('Status invalide. Utilisez: pending, approved ou all', 400);
                return;
        }

        // Construire la requête
        $whereClause = $validatedFilter !== null ? "WHERE t.is_validated = ?" : "";
        $params = $validatedFilter !== null ? [$validatedFilter] : [];

        // Count total
        $countStmt = $pdo->prepare("
            SELECT COUNT(DISTINCT t.id) as total
            FROM tribes t
            $whereClause
        ");
        $countStmt->execute($params);
        $totalCount = (int)$countStmt->fetchColumn();

        // Requête principale
        $queryParams = $params;
        $queryParams[] = $limit;
        $queryParams[] = $offset;

        $stmt = $pdo->prepare("
            SELECT
                t.id,
                t.name,
                t.slug,
                t.description,
                t.is_public,
                t.is_validated,
                t.created_at,
                t.validated_at,
                t.validated_by,
                u.id as owner_id,
                u.username,
                u.email,
                u.email_verified,
                COUNT(DISTINCT tm.id) as member_count,
                (SELECT COUNT(*) FROM dinosaurs d WHERE d.tribe_id = t.id) as dino_count
            FROM tribes t
            JOIN users u ON t.owner_id = u.id
            LEFT JOIN tribe_members tm ON t.id = tm.tribe_id AND tm.is_validated = 1
            $whereClause
            GROUP BY t.id
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        ");

        $stmt->execute($queryParams);
        $tribes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Formater les résultats
        $formattedTribes = array_map(function($tribe) {
            return [
                'id' => (int)$tribe['id'],
                'name' => $tribe['name'],
                'slug' => $tribe['slug'],
                'description' => $tribe['description'],
                'is_public' => (bool)$tribe['is_public'],
                'is_validated' => (bool)$tribe['is_validated'],
                'created_at' => $tribe['created_at'],
                'validated_at' => $tribe['validated_at'],
                'validated_by' => $tribe['validated_by'] ? (int)$tribe['validated_by'] : null,
                'owner' => [
                    'id' => (int)$tribe['owner_id'],
                    'username' => $tribe['username'],
                    'email' => $tribe['email'],
                    'email_verified' => (bool)$tribe['email_verified']
                ],
                'member_count' => (int)$tribe['member_count'],
                'dino_count' => (int)$tribe['dino_count']
            ];
        }, $tribes);

        // Pagination metadata
        $totalPages = ceil($totalCount / $limit);
        $pagination = [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_count' => $totalCount,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ];

        sendJsonResponse([
            'tribes' => $formattedTribes,
            'pagination' => $pagination
        ]);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la récupération des tribus: ' . $e->getMessage(), 500);
    }
}

/**
 * PUT - Approuver ou rejeter une tribu
 */
function handlePut($pdo, $admin) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $tribeId = $input['tribe_id'] ?? null;
        $action = $input['action'] ?? null;
        $rejectionReason = $input['rejection_reason'] ?? null;

        // Validation
        if (!$tribeId || !$action) {
            sendJsonError('tribe_id et action sont requis', 400);
            return;
        }

        if (!in_array($action, ['approve', 'reject'])) {
            sendJsonError('Action invalide. Utilisez: approve ou reject', 400);
            return;
        }

        // Vérifier que la tribu existe
        $stmt = $pdo->prepare("
            SELECT t.*, u.username as owner_username
            FROM tribes t
            JOIN users u ON t.owner_id = u.id
            WHERE t.id = ?
        ");
        $stmt->execute([$tribeId]);
        $tribe = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tribe) {
            sendJsonError('Tribu introuvable', 404);
            return;
        }

        if ($action === 'approve') {
            // Approuver la tribu
            $stmt = $pdo->prepare("
                UPDATE tribes
                SET is_validated = 1,
                    validated_at = NOW(),
                    validated_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$admin['id'], $tribeId]);

            // Logger l'approbation
            logAdminActivity([
                'admin_id' => $admin['id'],
                'action_type' => 'tribe_approved',
                'entity_type' => 'tribe',
                'entity_id' => $tribeId,
                'details' => [
                    'tribe_name' => $tribe['name'],
                    'owner_id' => $tribe['owner_id'],
                    'owner_username' => $tribe['owner_username']
                ]
            ]);

            sendJsonResponse([
                'message' => 'Tribu approuvée avec succès',
                'tribe' => [
                    'id' => (int)$tribeId,
                    'name' => $tribe['name']
                ]
            ]);

        } else if ($action === 'reject') {
            // Rejeter la tribu (suppression)
            // Les foreign keys CASCADE supprimeront automatiquement les entrées dans tribe_members
            $stmt = $pdo->prepare("DELETE FROM tribes WHERE id = ?");
            $stmt->execute([$tribeId]);

            // Logger le rejet
            logAdminActivity([
                'admin_id' => $admin['id'],
                'action_type' => 'tribe_rejected',
                'entity_type' => 'tribe',
                'entity_id' => $tribeId,
                'details' => [
                    'tribe_name' => $tribe['name'],
                    'owner_id' => $tribe['owner_id'],
                    'owner_username' => $tribe['owner_username'],
                    'rejection_reason' => $rejectionReason
                ]
            ]);

            sendJsonResponse([
                'message' => 'Tribu rejetée et supprimée',
                'tribe' => [
                    'id' => (int)$tribeId,
                    'name' => $tribe['name']
                ]
            ]);
        }

    } catch (PDOException $e) {
        sendJsonError('Erreur lors du traitement: ' . $e->getMessage(), 500);
    }
}

/**
 * DELETE - Supprimer une tribu (admin uniquement)
 */
function handleDelete($pdo, $admin) {
    try {
        $tribeId = $_GET['id'] ?? null;

        if (!$tribeId) {
            sendJsonError('ID de tribu requis', 400);
            return;
        }

        // Vérifier que la tribu existe
        $stmt = $pdo->prepare("
            SELECT t.*, u.username as owner_username
            FROM tribes t
            JOIN users u ON t.owner_id = u.id
            WHERE t.id = ?
        ");
        $stmt->execute([$tribeId]);
        $tribe = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tribe) {
            sendJsonError('Tribu introuvable', 404);
            return;
        }

        // Supprimer la tribu (CASCADE supprimera tribe_members et dinosaurs)
        $stmt = $pdo->prepare("DELETE FROM tribes WHERE id = ?");
        $stmt->execute([$tribeId]);

        // Logger la suppression
        logAdminActivity([
            'admin_id' => $admin['id'],
            'action_type' => 'tribe_deleted',
            'entity_type' => 'tribe',
            'entity_id' => $tribeId,
            'details' => [
                'tribe_name' => $tribe['name'],
                'owner_id' => $tribe['owner_id'],
                'owner_username' => $tribe['owner_username'],
                'was_validated' => (bool)$tribe['is_validated']
            ]
        ]);

        sendJsonResponse([
            'message' => 'Tribu supprimée avec succès',
            'tribe' => [
                'id' => (int)$tribeId,
                'name' => $tribe['name']
            ]
        ]);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la suppression: ' . $e->getMessage(), 500);
    }
}
