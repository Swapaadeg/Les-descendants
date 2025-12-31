<?php
require_once __DIR__ . '/config.php';

$userEmail = 'marie.rivier23@gmail.com';
$tribeName = 'Les Descendants';

try {
    $pdo = getDbConnection();

    // Récupérer l'utilisateur
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->execute([$userEmail]);
    $user = $stmt->fetch();

    if (!$user) {
        echo "❌ Utilisateur introuvable pour $userEmail\n";
        exit(1);
    }

    echo "👤 Utilisateur trouvé: {$user['username']} (ID: {$user['id']})\n";

    // Récupérer la tribu
    $stmt = $pdo->prepare("SELECT id, name, owner_id FROM tribes WHERE name = ?");
    $stmt->execute([$tribeName]);
    $tribe = $stmt->fetch();

    if (!$tribe) {
        echo "❌ Tribu '$tribeName' introuvable\n";
        exit(1);
    }

    echo "🏕️  Tribu trouvée: {$tribe['name']} (ID: {$tribe['id']})\n";
    echo "   Ancien owner ID: {$tribe['owner_id']}\n";

    // Vérifier si l'utilisateur est déjà membre
    $stmt = $pdo->prepare("SELECT id, role, is_validated FROM tribe_members WHERE tribe_id = ? AND user_id = ?");
    $stmt->execute([$tribe['id'], $user['id']]);
    $membership = $stmt->fetch();

    if ($membership) {
        echo "   L'utilisateur est déjà membre (role: {$membership['role']}, validated: {$membership['is_validated']})\n";

        // Mettre à jour le rôle en 'owner'
        $stmt = $pdo->prepare("UPDATE tribe_members SET role = 'owner', is_validated = 1 WHERE id = ?");
        $stmt->execute([$membership['id']]);
        echo "   ✅ Rôle mis à jour en 'owner'\n";
    } else {
        echo "   L'utilisateur n'est pas encore membre\n";

        // Ajouter l'utilisateur comme owner
        $stmt = $pdo->prepare("
            INSERT INTO tribe_members (tribe_id, user_id, role, is_validated, joined_at)
            VALUES (?, ?, 'owner', 1, NOW())
        ");
        $stmt->execute([$tribe['id'], $user['id']]);
        echo "   ✅ Utilisateur ajouté comme owner\n";
    }

    // Mettre à jour le owner_id de la tribu
    $stmt = $pdo->prepare("UPDATE tribes SET owner_id = ? WHERE id = ?");
    $stmt->execute([$user['id'], $tribe['id']]);
    echo "   ✅ owner_id de la tribu mis à jour\n";

    echo "\n==========================================\n";
    echo "✅ Succès ! {$user['username']} est maintenant owner de '{$tribe['name']}'\n";
    echo "==========================================\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
