<?php
require_once 'config.php';

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT id, name, is_validated, created_at FROM tribes ORDER BY created_at DESC");
    $tribes = $stmt->fetchAll();

    echo "=== Toutes les tribus ===\n\n";

    if (empty($tribes)) {
        echo "Aucune tribu trouvée dans la base de données.\n";
    } else {
        foreach($tribes as $t) {
            $validated = $t['is_validated'] ? 'OUI' : 'NON';
            echo "ID: {$t['id']}\n";
            echo "Nom: {$t['name']}\n";
            echo "Validée: {$validated}\n";
            echo "Créée le: {$t['created_at']}\n";
            echo "---\n";
        }
    }
} catch (PDOException $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
