<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();

    echo "=== Vérification de la tribu 'Les Descendants' ===\n\n";

    // Vérifier l'état de la tribu
    $stmt = $pdo->prepare("SELECT * FROM tribes WHERE name = 'Les Descendants'");
    $stmt->execute();
    $tribe = $stmt->fetch();

    if (!$tribe) {
        echo "❌ Tribu 'Les Descendants' introuvable\n";
        exit(1);
    }

    echo "Informations de la tribu:\n";
    echo "  ID: {$tribe['id']}\n";
    echo "  Nom: {$tribe['name']}\n";
    echo "  Slug: {$tribe['slug']}\n";
    echo "  Owner ID: {$tribe['owner_id']}\n";
    echo "  is_public: {$tribe['is_public']}\n";
    echo "  is_validated: {$tribe['is_validated']}\n";
    echo "  created_at: {$tribe['created_at']}\n\n";

    // Vérifier les membres
    $stmt = $pdo->prepare("
        SELECT tm.*, u.username, u.email
        FROM tribe_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.tribe_id = ?
    ");
    $stmt->execute([$tribe['id']]);
    $members = $stmt->fetchAll();

    echo "Membres de la tribu:\n";
    foreach ($members as $m) {
        echo "  - {$m['username']} ({$m['email']})\n";
        echo "    Role: {$m['role']}\n";
        echo "    is_validated: {$m['is_validated']}\n";
        echo "    joined_at: {$m['joined_at']}\n\n";
    }

    // Test de la requête exacte utilisée par l'API
    echo "=== Test requête API pour user_id = 1 ===\n";
    $stmt = $pdo->prepare("
        SELECT t.*, tm.role, tm.is_validated
        FROM tribe_members tm
        JOIN tribes t ON tm.tribe_id = t.id
        WHERE tm.user_id = ? AND tm.is_validated = 1
        LIMIT 1
    ");
    $stmt->execute([1]);
    $result = $stmt->fetch();

    if ($result) {
        echo "✅ Requête API retourne:\n";
        echo "   Tribu: {$result['name']}\n";
        echo "   Role: {$result['role']}\n";
        echo "   is_validated (membre): {$result['is_validated']}\n";
        echo "   is_validated (tribu): {$result['is_validated']}\n";
    } else {
        echo "❌ Requête API ne retourne rien\n";
    }

    // Vérifier si is_validated de la tribu est à 1
    if ($tribe['is_validated'] == 0) {
        echo "\n⚠️ PROBLÈME TROUVÉ: is_validated de la tribu = 0\n";
        echo "La tribu doit être validée pour apparaître dans l'API\n";
    }

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
