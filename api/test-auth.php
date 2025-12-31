<?php
/**
 * Test endpoint to debug authentication
 */

require_once 'config.php';
require_once 'middleware/auth.php';

echo json_encode([
    'cookies' => $_COOKIE,
    'headers' => getallheaders(),
    'token_from_function' => getAuthToken(),
    'localStorage_note' => 'Check browser console for localStorage.getItem("authToken")',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
