<?php
/**
 * Migration: Fix upload URLs
 * Replace /api/uploads/ with /uploads/ in database
 */

require_once __DIR__ . '/../config.php';

try {
    $db = getDbConnection();
    
    echo "Updating upload URLs in database...\n";
    
    // Tables et colonnes à mettre à jour
    $updates = [
        'users' => ['photo_profil'],
        'tribes' => ['logo_url', 'banner_url', 'base_photo_url'],
        'dinosaurs' => ['photo_url'],
    ];
    
    $totalUpdated = 0;
    
    foreach ($updates as $table => $columns) {
        foreach ($columns as $column) {
            $sql = "UPDATE $table SET $column = REPLACE($column, '/api/uploads/', '/uploads/') WHERE $column LIKE '%/api/uploads/%'";
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $count = $stmt->rowCount();
            
            if ($count > 0) {
                echo "✓ Updated $count rows in $table.$column\n";
                $totalUpdated += $count;
            }
        }
    }
    
    echo "\n✓ Migration complete! Updated $totalUpdated total rows.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
