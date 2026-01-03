<?php
/**
 * API Admin - Statistiques
 * Fournit les statistiques pour le dashboard admin
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/admin-logger.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonError('Méthode non autorisée', 405);
    exit;
}

$pdo = getDbConnection();
$user = requireAdmin($pdo);
if (!$user) exit;

try {
    // Statistiques des tribus
    $stmt = $pdo->query("SELECT COUNT(*) FROM tribes WHERE is_validated = 0");
    $pendingTribes = (int)$stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM tribes WHERE is_validated = 1");
    $totalTribes = (int)$stmt->fetchColumn();

    // Statistiques des utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE is_banned = 0");
    $totalUsers = (int)$stmt->fetchColumn();

    // Statistiques des événements
    $stmt = $pdo->query("SELECT COUNT(*) FROM events");
    $totalEvents = (int)$stmt->fetchColumn();

    // Statistiques des dinosaures
    $stmt = $pdo->query("SELECT COUNT(*) FROM dinosaurs");
    $totalDinosaurs = (int)$stmt->fetchColumn();

    // Activité récente (dernières 10 actions admin)
    $recentActivity = getRecentAdminActivity(10);

    // Formater les détails JSON
    $formattedActivity = array_map(function($activity) {
        $details = json_decode($activity['details'], true);
        return [
            'id' => (int)$activity['id'],
            'admin_username' => $activity['admin_username'] ?? 'Système',
            'action_type' => $activity['action_type'],
            'entity_type' => $activity['entity_type'],
            'entity_id' => $activity['entity_id'] ? (int)$activity['entity_id'] : null,
            'details' => $details,
            'created_at' => $activity['created_at']
        ];
    }, $recentActivity);

    sendJsonResponse([
        'stats' => [
            'pending_tribes' => $pendingTribes,
            'total_tribes' => $totalTribes,
            'total_users' => $totalUsers,
            'total_events' => $totalEvents,
            'total_dinosaurs' => $totalDinosaurs,
            'recent_activity' => $formattedActivity
        ]
    ]);

} catch (PDOException $e) {
    sendJsonError('Erreur lors de la récupération des statistiques: ' . $e->getMessage(), 500);
}
