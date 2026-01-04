<?php
require_once 'config.php';

try {
    $pdo = getDbConnection();

    echo "=== Test de la requête API tribus ===\n\n";

    // La requête exacte utilisée par l'API
    $stmt = $pdo->query("
        SELECT t.*, u.username as owner_username,
               (SELECT COUNT(*) FROM tribe_members WHERE tribe_id = t.id AND is_validated = 1) as member_count
        FROM tribes t
        JOIN users u ON t.owner_id = u.id
        WHERE t.is_public = 1 AND t.is_validated = 1
        ORDER BY t.created_at DESC
    ");
    $tribes = $stmt->fetchAll();

    echo "Nombre de tribus trouvées: " . count($tribes) . "\n\n";

    if (empty($tribes)) {
        echo "Aucune tribu trouvée!\n";
        echo "\nVérifions pourquoi...\n";

        // Vérifier sans les filtres
        $stmt2 = $pdo->query("SELECT id, name, is_public, is_validated, owner_id FROM tribes");
        $allTribes = $stmt2->fetchAll();
        echo "\nToutes les tribus (sans filtre):\n";
        foreach($allTribes as $t) {
            echo "- {$t['name']}: is_public={$t['is_public']}, is_validated={$t['is_validated']}, owner_id={$t['owner_id']}\n";
        }

        // Vérifier si owner existe
        echo "\nVérification de l'existence du propriétaire:\n";
        foreach($allTribes as $t) {
            $stmt3 = $pdo->prepare("SELECT id, username FROM users WHERE id = ?");
            $stmt3->execute([$t['owner_id']]);
            $owner = $stmt3->fetch();
            if ($owner) {
                echo "- Tribu '{$t['name']}': propriétaire trouvé (ID {$owner['id']}, username: {$owner['username']})\n";
            } else {
                echo "- Tribu '{$t['name']}': PROPRIÉTAIRE INTROUVABLE (owner_id={$t['owner_id']}) ← PROBLÈME!\n";
            }
        }
    } else {
        foreach($tribes as $t) {
            echo "Tribu: {$t['name']}\n";
            echo "  - ID: {$t['id']}\n";
            echo "  - Propriétaire: {$t['owner_username']}\n";
            echo "  - Membres: {$t['member_count']}\n";
            echo "  - Publique: {$t['is_public']}\n";
            echo "  - Validée: {$t['is_validated']}\n";
            echo "---\n";
        }
    }

} catch (PDOException $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
