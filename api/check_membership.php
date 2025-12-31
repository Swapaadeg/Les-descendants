<?php
require_once __DIR__ . '/config.php';

$userEmail = 'marie.rivier23@gmail.com';

try {
    $pdo = getDbConnection();

    // Récupérer l'utilisateur
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->execute([$userEmail]);
    $user = $stmt->fetch();

    if (!$user) {
        echo "❌ Utilisateur introuvable\n";
        exit(1);
    }

    echo "=== Vérification du membership ===\n";
    echo "Utilisateur: {$user['username']} (ID: {$user['id']})\n\n";

    // Vérifier tous les enregistrements tribe_members pour cet utilisateur
    $stmt = $pdo->prepare("
        SELECT tm.*, t.name as tribe_name
        FROM tribe_members tm
        JOIN tribes t ON tm.tribe_id = t.id
        WHERE tm.user_id = ?
    ");
    $stmt->execute([$user['id']]);
    $memberships = $stmt->fetchAll();

    if (empty($memberships)) {
        echo "❌ Aucun membership trouvé dans tribe_members\n";
    } else {
        echo "Memberships trouvés:\n";
        foreach ($memberships as $m) {
            echo "  - Tribu: {$m['tribe_name']} (ID: {$m['tribe_id']})\n";
            echo "    Role: {$m['role']}\n";
            echo "    is_validated: {$m['is_validated']}\n";
            echo "    joined_at: {$m['joined_at']}\n\n";
        }
    }

    // Tester la requête exacte de l'API
    echo "\n=== Test de la requête API ===\n";
    $stmt = $pdo->prepare("
        SELECT t.*, tm.role, tm.is_validated
        FROM tribe_members tm
        JOIN tribes t ON tm.tribe_id = t.id
        WHERE tm.user_id = ? AND tm.is_validated = 1
        LIMIT 1
    ");
    $stmt->execute([$user['id']]);
    $result = $stmt->fetch();

    if ($result) {
        echo "✅ La requête API retourne bien une tribu:\n";
        echo "   Tribu: {$result['name']} (ID: {$result['id']})\n";
        echo "   Role: {$result['role']}\n";
        echo "   is_validated: {$result['is_validated']}\n";
    } else {
        echo "❌ La requête API ne retourne aucune tribu\n";
        echo "   Vérifier que is_validated = 1 dans tribe_members\n";
    }

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
