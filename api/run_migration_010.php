<?php
require_once 'config.php';

echo "=== Exécution migration 010 ===\n\n";

$pdo = getDbConnection();
$sql = file_get_contents(__DIR__ . '/migrations/010_create_dino_tasks_system.sql');

try {
    $pdo->exec($sql);
    echo "✅ Migration 010 exécutée avec succès!\n";
    echo "\nVérification de la table...\n";

    $check = $pdo->query("SHOW TABLES LIKE 'dino_tasks'")->fetch();
    if ($check) {
        echo "✅ Table dino_tasks créée!\n";
    } else {
        echo "❌ Table dino_tasks non trouvée!\n";
    }
} catch (PDOException $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
