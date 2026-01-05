<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Testing CSRF Endpoint ===\n";

try {
    echo "1. Loading config.php...\n";
    require_once 'api/config.php';
    echo "   ✓ Config loaded\n";
    echo "   DB_NAME: " . DB_NAME . "\n";
    echo "   BASE_URL: " . BASE_URL . "\n";
    
    echo "\n2. Loading security.php...\n";
    require_once 'api/utils/security.php';
    echo "   ✓ Security functions loaded\n";
    
    echo "\n3. Testing generateSecureToken()...\n";
    $token = generateSecureToken(32);
    echo "   ✓ Token generated: " . substr($token, 0, 16) . "...\n";
    
    echo "\n4. Testing generateCSRFToken()...\n";
    $csrf = generateCSRFToken();
    echo "   ✓ CSRF token generated: " . substr($csrf, 0, 16) . "...\n";
    
    echo "\n5. Testing sendJsonResponse()...\n";
    echo "   About to call sendJsonResponse(['csrf_token' => '$csrf'])\n";
    sendJsonResponse(['csrf_token' => $csrf]);
    
} catch (Throwable $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
