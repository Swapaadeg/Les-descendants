<?php
require_once 'config.php';

$pdo = getDbConnection();
$dinoId = 2;
$userId = 1; // User Swap

// Simuler l'input du frontend
$input = [
    'stats' => [
        'health' => 105 // On veut passer à 105
    ]
];

echo "=== TEST COMPLET UPDATE AVEC TASKS ===\n\n";

// 1. AVANT: Récupérer les valeurs actuelles
$stmt = $pdo->prepare('SELECT
    tribe_id,
    stat_health, stat_stamina, stat_oxygen, stat_food, stat_weight, stat_damage, stat_crafting,
    mutated_stat_health, mutated_stat_stamina, mutated_stat_oxygen, mutated_stat_food,
    mutated_stat_weight, mutated_stat_damage, mutated_stat_crafting
    FROM dinosaurs WHERE id = ?');
$stmt->execute([$dinoId]);
$oldStats = $stmt->fetch();

echo "Anciennes stats récupérées:\n";
echo "- tribe_id: {$oldStats['tribe_id']}\n";
echo "- stat_health: {$oldStats['stat_health']}\n\n";

// 2. Construire l'UPDATE
$updates = [];
$params = [':id' => $dinoId];

if (isset($input['stats'])) {
    foreach ($input['stats'] as $statKey => $statValue) {
        $column = 'stat_' . $statKey;
        $updates[] = "$column = :$column";
        $params[":$column"] = $statValue;
    }
}

echo "UPDATE SQL: UPDATE dinosaurs SET " . implode(', ', $updates) . " WHERE id = :id\n";
echo "Paramètres: ";
print_r($params);
echo "\n";

// 3. Exécuter l'UPDATE
$sql = "UPDATE dinosaurs SET " . implode(', ', $updates) . " WHERE id = :id";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute($params);

echo "UPDATE exécuté: " . ($result ? "OUI" : "NON") . "\n";
echo "Lignes affectées: " . $stmt->rowCount() . "\n\n";

// 4. Vérifier la nouvelle valeur
$stmt = $pdo->prepare('SELECT stat_health FROM dinosaurs WHERE id = ?');
$stmt->execute([$dinoId]);
$newValue = $stmt->fetch();

echo "Nouvelle valeur en BDD: {$newValue['stat_health']}\n\n";

// 5. Test création de tâches
echo "=== TEST CRÉATION TÂCHE ===\n";
if ($oldStats && isset($input['stats'])) {
    $tribeId = $oldStats['tribe_id'];
    foreach ($input['stats'] as $statKey => $newVal) {
        $oldValue = $oldStats['stat_' . $statKey];
        echo "Stat: $statKey - Ancien: $oldValue - Nouveau: $newVal\n";

        if ($oldValue != $newVal) {
            echo "→ Création tâche...\n";
            try {
                $stmt = $pdo->prepare('INSERT INTO dino_tasks
                    (tribe_id, dino_id, created_by, stat_name, stat_type, old_value, new_value)
                    VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$tribeId, $dinoId, $userId, $statKey, 'base', $oldValue, $newVal]);
                echo "→ Tâche créée avec succès (ID: " . $pdo->lastInsertId() . ")\n";
            } catch (Exception $e) {
                echo "→ ERREUR création tâche: " . $e->getMessage() . "\n";
            }
        }
    }
}

echo "\n✅ TEST TERMINÉ\n";
