<?php
require_once __DIR__ . '/../config.php';

try {
    $pdo = getDbConnection();
    echo "=== Vérification de la structure de la table users ===\n\n";

    // Vérifier les colonnes existantes
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Colonnes existantes:\n";
    foreach ($columns as $col) {
        echo "  - $col\n";
    }

    // Colonnes à ajouter
    $columnsToAdd = [
        'nom' => "ALTER TABLE users ADD COLUMN nom VARCHAR(100) DEFAULT NULL AFTER username",
        'prenom' => "ALTER TABLE users ADD COLUMN prenom VARCHAR(100) DEFAULT NULL AFTER nom",
        'photo_profil' => "ALTER TABLE users ADD COLUMN photo_profil VARCHAR(500) DEFAULT NULL AFTER prenom",
        'email_verified_at' => "ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL DEFAULT NULL AFTER email_verified"
    ];

    echo "\n=== Ajout des colonnes manquantes ===\n\n";

    foreach ($columnsToAdd as $colName => $sql) {
        if (!in_array($colName, $columns)) {
            try {
                $pdo->exec($sql);
                echo "✓ Colonne '$colName' ajoutée\n";
            } catch (PDOException $e) {
                echo "✗ Erreur pour '$colName': " . $e->getMessage() . "\n";
            }
        } else {
            echo "⚠ Colonne '$colName' existe déjà\n";
        }
    }

    echo "\n=== Terminé ===\n";

} catch (Exception $e) {
    echo "ERREUR: " . $e->getMessage() . "\n";
}
