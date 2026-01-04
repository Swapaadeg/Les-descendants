<?php
require_once 'config.php';

$pdo = getDbConnection();

// Test simple : modifier la stat_health d'un dino
$dinoId = 2; // Allosaurus

// 1. Lire la valeur actuelle
$stmt = $pdo->prepare('SELECT id, species, stat_health FROM dinosaurs WHERE id = ?');
$stmt->execute([$dinoId]);
$before = $stmt->fetch();

echo "=== AVANT UPDATE ===\n";
echo "ID: {$before['id']}\n";
echo "Espèce: {$before['species']}\n";
echo "Vie (stat_health): {$before['stat_health']}\n\n";

// 2. Faire un UPDATE simple
$newValue = ((int)$before['stat_health']) + 10;
echo "Tentative UPDATE vers: $newValue\n\n";

$stmt = $pdo->prepare('UPDATE dinosaurs SET stat_health = ? WHERE id = ?');
$result = $stmt->execute([$newValue, $dinoId]);

echo "UPDATE réussi: " . ($result ? "OUI" : "NON") . "\n";
echo "Lignes affectées: " . $stmt->rowCount() . "\n\n";

// 3. Relire la valeur
$stmt = $pdo->prepare('SELECT stat_health FROM dinosaurs WHERE id = ?');
$stmt->execute([$dinoId]);
$after = $stmt->fetch();

echo "=== APRÈS UPDATE ===\n";
echo "Vie (stat_health): {$after['stat_health']}\n\n";

if ($after['stat_health'] == $newValue) {
    echo "✅ UPDATE FONCTIONNE !\n";
} else {
    echo "❌ UPDATE NE FONCTIONNE PAS - valeur non modifiée\n";
}
