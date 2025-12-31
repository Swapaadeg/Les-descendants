<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();

    echo "=== Structure de la table tribes ===\n";
    $stmt = $pdo->query('DESCRIBE tribes');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-20s %s\n", $row['Field'], $row['Type'], $row['Null'] === 'NO' ? 'NOT NULL' : 'NULL');
    }

    echo "\n=== Structure de la table tribe_members ===\n";
    $stmt = $pdo->query('DESCRIBE tribe_members');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-20s %s\n", $row['Field'], $row['Type'], $row['Null'] === 'NO' ? 'NOT NULL' : 'NULL');
    }

    echo "\n=== Structure de la table users (colonnes tribe) ===\n";
    $stmt = $pdo->query('DESCRIBE users');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (strpos($row['Field'], 'tribe') !== false || strpos($row['Field'], 'current') !== false) {
            echo sprintf("%-20s %-20s %s\n", $row['Field'], $row['Type'], $row['Null'] === 'NO' ? 'NOT NULL' : 'NULL');
        }
    }

    echo "\n=== Structure de la table dinosaurs (colonne tribe_id) ===\n";
    $stmt = $pdo->query('DESCRIBE dinosaurs');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($row['Field'] === 'tribe_id' || $row['Field'] === 'id') {
            echo sprintf("%-20s %-20s %s\n", $row['Field'], $row['Type'], $row['Null'] === 'NO' ? 'NOT NULL' : 'NULL');
        }
    }

} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
