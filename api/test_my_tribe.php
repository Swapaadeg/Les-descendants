<?php
require_once 'config.php';

$pdo = getDbConnection();

// Test pour l'utilisateur ID 1 (Swap)
$userId = 1;

$stmt = $pdo->prepare("
    SELECT t.*, tm.role, tm.is_validated
    FROM tribe_members tm
    JOIN tribes t ON tm.tribe_id = t.id
    WHERE tm.user_id = ? AND tm.is_validated = 1
    LIMIT 1
");
$stmt->execute([$userId]);
$tribe = $stmt->fetch();

echo "=== Test endpoint 'Ma Tribu' ===\n\n";

if (!$tribe) {
    echo "Aucune tribu trouvée\n";
} else {
    echo "Données brutes:\n";
    echo "- banner_url: " . ($tribe['banner_url'] ?: 'NULL') . "\n";
    echo "- logo_url: " . ($tribe['logo_url'] ?: 'NULL') . "\n\n";

    $result = [
        'id' => (int)$tribe['id'],
        'name' => $tribe['name'],
        'banner_url' => getFullUrl($tribe['banner_url']),
        'logo_url' => getFullUrl($tribe['logo_url']),
    ];

    echo "Après transformation:\n";
    print_r($result);
}
