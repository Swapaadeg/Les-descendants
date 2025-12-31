<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils/security.php';

$email = 'marie.rivier23@gmail.com';
$newPassword = 'Admin2025!';

try {
    $pdo = getDbConnection();

    // Vérifier que le compte existe
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo "❌ Compte introuvable pour $email\n";
        exit(1);
    }

    // Hasher le nouveau mot de passe
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Mettre à jour le mot de passe
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
    $stmt->execute([$hashedPassword, $email]);

    echo "✅ Mot de passe mis à jour avec succès !\n";
    echo "==========================================\n";
    echo "Email: $email\n";
    echo "Username: {$user['username']}\n";
    echo "Nouveau mot de passe: $newPassword\n";
    echo "==========================================\n";
    echo "\nNote: Change ce mot de passe après ta première connexion !\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
