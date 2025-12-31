<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();
    $sql = file_get_contents(__DIR__ . '/migrations/003_add_tribe_customization.sql');

    $pdo->exec($sql);

    echo "✅ Migration 003 exécutée avec succès\n";
    echo "Colonnes ajoutées:\n";
    echo "  - banner_url (VARCHAR 500)\n";
    echo "  - logo_url (VARCHAR 500)\n";
    echo "  - primary_color (VARCHAR 7, défaut: #00f0ff)\n";
    echo "  - secondary_color (VARCHAR 7, défaut: #b842ff)\n";

} catch (Exception $e) {
    echo "❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
}
