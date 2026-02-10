<?php
/**
 * Upload d'images Shiny (admin uniquement)
 * POST /shiny-upload.php?type={key}
 */

require_once 'config.php';
require_once 'middleware/auth.php';
require_once 'utils/security.php';

$pdo = getDbConnection();
$user = requireAuth($pdo, true);

if (!$user) {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonError('Méthode non autorisée', 405);
}

$type = $_GET['type'] ?? '';
if (!$type || !preg_match('/^[a-z0-9-]+$/', $type)) {
    sendJsonError('Type invalide', 400);
}

if (!isset($_FILES['image'])) {
    sendJsonError('Aucun fichier reçu (champ image manquant)', 400);
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    $maxUpload = ini_get('upload_max_filesize');
    $maxPost = ini_get('post_max_size');
    $errorMap = [
        UPLOAD_ERR_INI_SIZE => "Fichier trop volumineux (limite serveur: {$maxUpload})",
        UPLOAD_ERR_FORM_SIZE => 'Fichier trop volumineux (limite formulaire)',
        UPLOAD_ERR_PARTIAL => 'Fichier partiellement uploadé',
        UPLOAD_ERR_NO_FILE => 'Aucun fichier sélectionné',
        UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
        UPLOAD_ERR_CANT_WRITE => 'Écriture disque impossible',
        UPLOAD_ERR_EXTENSION => 'Upload bloqué par une extension PHP',
    ];

    $message = $errorMap[$file['error']] ?? 'Erreur lors de l\'upload';
    sendJsonError($message, 400, [
        'upload_max_filesize' => $maxUpload,
        'post_max_size' => $maxPost
    ]);
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedMimes)) {
    sendJsonError('Format d\'image non supporté. Utilisez JPG, PNG ou WEBP', 400);
}

$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    $maxMB = $maxSize / (1024 * 1024);
    sendJsonError("L'image est trop volumineuse. Taille maximum: {$maxMB}MB", 400);
}

$extension = match($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    default => 'jpg'
};

$storageDir = __DIR__ . '/uploads/shinys';
if (!is_dir($storageDir)) {
    if (!mkdir($storageDir, 0777, true)) {
        sendJsonError('Impossible de créer le dossier de stockage', 500);
    }
}

if (!is_writable($storageDir)) {
    sendJsonError('Dossier de stockage non accessible en écriture', 500);
}

$filename = $type . '.' . $extension;
$filepath = $storageDir . '/' . $filename;

// Supprimer l'ancienne image si elle existe avec un autre format
foreach (['jpg', 'png', 'webp'] as $ext) {
    $candidate = $storageDir . '/' . $type . '.' . $ext;
    if (file_exists($candidate)) {
        unlink($candidate);
    }
}

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    sendJsonError('Erreur lors de la sauvegarde de l\'image', 500);
}

$relativePath = "/uploads/shinys/{$filename}";

$mappingFile = $storageDir . '/shiny-images.json';
$images = [];
if (file_exists($mappingFile)) {
    $content = file_get_contents($mappingFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $images = $decoded;
    }
}

$images[$type] = $relativePath;
file_put_contents($mappingFile, json_encode($images, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

sendJsonResponse([
    'url' => getFullUrl($relativePath),
    'relative_url' => $relativePath,
    'message' => 'Image Shiny uploadée avec succès'
]);
