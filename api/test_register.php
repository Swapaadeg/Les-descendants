<?php
/**
 * Script de test pour l'inscription
 * Simule une inscription pour vérifier que tout fonctionne
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TEST D'INSCRIPTION ===\n\n";

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$testData = [
    'email' => 'test@example.com',
    'username' => 'TestUser',
    'password' => 'Password123',
    'password_confirm' => 'Password123'
];

// Mettre les données dans php://input simulé
$GLOBALS['HTTP_RAW_POST_DATA'] = json_encode($testData);

echo "Données de test:\n";
print_r($testData);
echo "\n";

// Capturer la sortie
ob_start();

try {
    // Inclure le fichier d'inscription
    include __DIR__ . '/auth/register.php';

    $output = ob_get_clean();
    echo "Réponse de l'API:\n";
    echo $output . "\n";

} catch (Exception $e) {
    ob_end_clean();
    echo "ERREUR: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
