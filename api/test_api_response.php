<?php
require_once 'config.php';

$pdo = getDbConnection();

// Simuler une requête GET pour toutes les tribus
$stmt = $pdo->query("
    SELECT t.*, u.username as owner_username,
           (SELECT COUNT(*) FROM tribe_members WHERE tribe_id = t.id AND is_validated = 1) as member_count
    FROM tribes t
    JOIN users u ON t.owner_id = u.id
    WHERE t.is_public = 1 AND t.is_validated = 1
    ORDER BY t.created_at DESC
");
$tribes = $stmt->fetchAll();

$result = array_map(function($tribe) {
    return [
        'id' => (int)$tribe['id'],
        'name' => $tribe['name'],
        'banner_url' => getFullUrl($tribe['banner_url']),
        'logo_url' => getFullUrl($tribe['logo_url']),
    ];
}, $tribes);

echo "=== Test de l'API Tribes ===\n\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
