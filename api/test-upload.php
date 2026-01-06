<?php
// Test simple pour les uploads
error_log("=== TEST UPLOAD PHP CALLED ===");
error_log("METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'NONE'));
error_log("FILES: " . json_encode($_FILES));
error_log("POST: " . json_encode($_POST));

echo json_encode([
    'status' => 'ok',
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'none',
    'files' => $_FILES,
    'post' => $_POST
]);
?>
