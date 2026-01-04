<?php
require_once 'config.php';

// Simuler exactement ce que fait l'API
$pdo = getDbConnection();

try {
    $stmt = $pdo->query("
        SELECT t.*, u.username as owner_username,
               (SELECT COUNT(*) FROM tribe_members WHERE tribe_id = t.id AND is_validated = 1) as member_count
        FROM tribes t
        JOIN users u ON t.owner_id = u.id
        WHERE t.is_public = 1 AND t.is_validated = 1
        ORDER BY t.created_at DESC
    ");
    $tribes = $stmt->fetchAll();

    echo "Nombre de tribus trouvées: " . count($tribes) . "\n\n";

    if (count($tribes) > 0) {
        echo "Avant transformation:\n";
        print_r($tribes[0]);

        $result = array_map(function($tribe) {
            return [
                'id' => (int)$tribe['id'],
                'name' => $tribe['name'],
                'slug' => $tribe['slug'],
                'description' => $tribe['description'],
                'owner_username' => $tribe['owner_username'],
                'base_photo_url' => $tribe['base_photo_url'],
                'banner_url' => getFullUrl($tribe['banner_url']),
                'logo_url' => getFullUrl($tribe['logo_url']),
                'primary_color' => $tribe['primary_color'] ?? '#00f0ff',
                'secondary_color' => $tribe['secondary_color'] ?? '#b842ff',
                'member_count' => (int)$tribe['member_count'],
                'created_at' => $tribe['created_at']
            ];
        }, $tribes);

        echo "\nAprès transformation:\n";
        print_r($result[0]);

        echo "\n\nRéponse JSON complète:\n";
        echo json_encode(['tribes' => $result], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
