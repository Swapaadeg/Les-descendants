<?php
require_once 'config.php';

$pdo = getDbConnection();
$stmt = $pdo->query("SELECT id, name, is_validated, is_public FROM tribes");
$tribes = $stmt->fetchAll();

foreach($tribes as $t) {
    $validated = $t['is_validated'] ? 'OUI' : 'NON';
    $public = $t['is_public'] ? 'OUI' : 'NON';
    echo "ID: {$t['id']}\n";
    echo "Nom: {$t['name']}\n";
    echo "Validée: {$validated}\n";
    echo "Publique: {$public}\n";
    echo "---\n";
}
