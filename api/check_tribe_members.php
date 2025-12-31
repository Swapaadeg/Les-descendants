<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();
    echo "=== Structure de la table tribe_members ===\n";
    $stmt = $pdo->query('DESCRIBE tribe_members');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-25s %-25s %s\n", $row['Field'], $row['Type'], $row['Null'] === 'NO' ? 'NOT NULL' : 'NULL');
    }
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
