<?php
/**
 * Script pour exécuter la migration 009 - Featured dinosaurs
 */

require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();

    echo "Exécution de la migration 009 - Featured dinosaurs...\n";

    $sql = file_get_contents(__DIR__ . '/migrations/009_add_featured_dinosaurs.sql');

    $pdo->exec($sql);

    echo "✓ Migration 009 exécutée avec succès!\n";
    echo "  - Colonne is_featured ajoutée à la table dinosaurs\n";
    echo "  - Index créé pour optimiser les requêtes\n";

} catch (PDOException $e) {
    echo "✗ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
}
