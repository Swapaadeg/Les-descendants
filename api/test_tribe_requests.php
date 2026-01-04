<?php
/**
 * Test script to check tribe-members.php GET endpoint
 */

// Simulate being user ID 1 (the owner)
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer test';

// Mock the auth to return user ID 1
function requireAuth($pdo) {
    return ['id' => 1, 'username' => 'test_user'];
}

require_once 'config.php';

$pdo = getDbConnection();

// Test getting pending requests
echo "Testing GET /tribe-members.php\n\n";

try {
    // Check user's membership
    $stmt = $pdo->prepare("
        SELECT tribe_id, role FROM tribe_members
        WHERE user_id = ? AND is_validated = 1
    ");
    $stmt->execute([1]);
    $membership = $stmt->fetch();
    
    echo "User membership: ";
    print_r($membership);
    echo "\n";
    
    if ($membership && $membership['role'] === 'owner') {
        echo "User is owner of tribe " . $membership['tribe_id'] . "\n\n";
        
        // Get pending requests
        $stmt = $pdo->prepare("
            SELECT tm.id, tm.user_id, tm.requested_at, tm.request_message,
                   u.username, u.email
            FROM tribe_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.tribe_id = ? AND tm.is_validated = 0
            ORDER BY tm.requested_at ASC
        ");
        $stmt->execute([$membership['tribe_id']]);
        $requests = $stmt->fetchAll();
        
        echo "Pending requests: " . count($requests) . "\n";
        print_r($requests);
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
