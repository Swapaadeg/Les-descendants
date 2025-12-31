<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();
    $pdo->exec('ALTER TABLE tribe_members ADD COLUMN request_message TEXT NULL AFTER invited_by');
    echo "✅ Colonne request_message ajoutée avec succès\n";
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
