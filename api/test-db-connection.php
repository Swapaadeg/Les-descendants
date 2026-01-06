<?php
// Test de connexion à la base de données
header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST DE CONNEXION BASE DE DONNÉES ===\n\n";

// Charger la config
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
    echo "✓ config.local.php chargé\n";
} else {
    echo "✗ config.local.php INTROUVABLE\n";
    exit;
}

echo "\nConfiguration:\n";
echo "DB_HOST: " . (defined('DB_HOST') ? DB_HOST : 'NON DÉFINI') . "\n";
echo "DB_NAME: " . (defined('DB_NAME') ? DB_NAME : 'NON DÉFINI') . "\n";
echo "DB_USER: " . (defined('DB_USER') ? DB_USER : 'NON DÉFINI') . "\n";
echo "DB_PASS: " . (defined('DB_PASS') ? (DB_PASS ? '****** (' . strlen(DB_PASS) . ' caractères)' : 'VIDE') : 'NON DÉFINI') . "\n";

echo "\n=== TEST DE CONNEXION ===\n";

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    echo "✓ CONNEXION RÉUSSIE!\n";

    // Test de requête simple
    $stmt = $pdo->query("SELECT VERSION() as version");
    $result = $stmt->fetch();
    echo "✓ MySQL version: " . $result['version'] . "\n";

    // Vérifier si la table users existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Table 'users' existe\n";

        // Compter les utilisateurs
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "✓ Nombre d'utilisateurs: " . $result['count'] . "\n";
    } else {
        echo "✗ Table 'users' introuvable\n";
    }

    echo "\n=== TOUT EST OK ===\n";

} catch (PDOException $e) {
    echo "✗ ERREUR DE CONNEXION:\n";
    echo "Code d'erreur: " . $e->getCode() . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . "\n";
    echo "Ligne: " . $e->getLine() . "\n";
}
?>
