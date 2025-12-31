<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query('SHOW TABLES');
    echo "=== Tables dans la base de données ===\n";
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "- " . $row[0] . "\n";
    }
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
