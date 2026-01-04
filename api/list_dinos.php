<?php
require_once 'config.php';

$pdo = getDbConnection();
$stmt = $pdo->query('SELECT id, species, stat_health FROM dinosaurs LIMIT 10');

echo "=== DINOSAURES EXISTANTS ===\n\n";
while ($row = $stmt->fetch()) {
    echo "ID: {$row['id']} - {$row['species']} - Vie: {$row['stat_health']}\n";
}
