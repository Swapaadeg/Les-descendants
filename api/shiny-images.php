<?php
/**
 * Récupération des images Shiny
 * GET /shiny-images.php
 */

require_once 'config.php';

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonError('Méthode non autorisée', 405);
}

$storageDir = __DIR__ . '/uploads/shinys';
$mappingFile = $storageDir . '/shiny-images.json';

$images = [];
if (file_exists($mappingFile)) {
    $content = file_get_contents($mappingFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $images = $decoded;
    }
}

$fullImages = [];
foreach ($images as $key => $relativePath) {
    $fullImages[$key] = getFullUrl($relativePath);
}

sendJsonResponse([
    'images' => $fullImages,
    'relative_images' => $images
]);
