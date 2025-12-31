<?php
require_once 'config.php';
require_once 'middleware/auth.php';

echo "=== DEBUG AUTHENTIFICATION ===\n\n";

// Afficher les cookies
echo "Cookies:\n";
print_r($_COOKIE);
echo "\n";

// Afficher les headers
echo "Headers:\n";
$headers = getallheaders();
print_r($headers);
echo "\n";

// Tester getAuthToken
echo "Token récupéré: ";
$token = getAuthToken();
var_dump($token);
echo "\n";

if ($token) {
    echo "Tentative de vérification du token...\n";
    $payload = verifyJWT($token, JWT_SECRET);
    echo "Payload décodé: ";
    print_r($payload);
}
