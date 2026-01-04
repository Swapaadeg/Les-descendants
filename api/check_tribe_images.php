<?php
require_once 'config.php';

$pdo = getDbConnection();
$stmt = $pdo->query("SELECT id, name, banner_url, logo_url FROM tribes WHERE id = 1");
$tribe = $stmt->fetch();

echo "=== Tribu: {$tribe['name']} ===\n\n";
echo "Banner URL: " . ($tribe['banner_url'] ?: 'NULL') . "\n";
echo "Logo URL: " . ($tribe['logo_url'] ?: 'NULL') . "\n";
