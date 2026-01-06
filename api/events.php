<?php
/**
 * API REST pour gérer les événements du serveur
 *
 * Endpoints:
 * - GET /api/events.php           Liste paginée des événements (PUBLIC)
 * - GET /api/events.php?id=X      Détail d'un événement avec images (PUBLIC)
 * - POST /api/events.php          Créer un événement (ADMIN)
 * - PUT /api/events.php?id=X      Modifier un événement (ADMIN)
 * - DELETE /api/events.php?id=X   Supprimer un événement (ADMIN)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/utils/security.php';
require_once __DIR__ . '/utils/xss.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

// Protection CSRF pour les méthodes modifiant des données (admin only)
// SAUF pour FormData avec JWT qui est suffisant pour l'authentification
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $isFormData = strpos($contentType, 'multipart/form-data') !== false;
    
    // Si c'est du FormData, le JWT est suffisant (pas besoin de CSRF)
    // Sinon on vérifie le token CSRF
    if (!$isFormData) {
        $input = json_decode(file_get_contents('php://input'), true);
        requireCsrfToken($input);
    }
}

// Router
switch ($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        $user = requireAdmin($pdo);
        if ($user) handlePost($pdo, $user);
        break;
    case 'PUT':
        $user = requireAdmin($pdo);
        if ($user) handlePut($pdo, $user);
        break;
    case 'DELETE':
        $user = requireAdmin($pdo);
        if ($user) handleDelete($pdo, $user);
        break;
    default:
        sendJsonError('Méthode non autorisée', 405);
}

// =====================================================
// GET - Liste ou détail d'un événement
// =====================================================
function handleGet($pdo) {
    // Détail d'un événement par ID
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];

        // Récupérer l'événement
        $stmt = $pdo->prepare("
            SELECT id, title, description, event_date, created_at, updated_at
            FROM events
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        if (!$event) {
            sendJsonError('Événement introuvable', 404);
        }

        // Récupérer les images ordonnées
        $stmt = $pdo->prepare("
            SELECT id, image_url, display_order
            FROM event_images
            WHERE event_id = ?
            ORDER BY display_order ASC
        ");
        $stmt->execute([$id]);
        $images = $stmt->fetchAll();

        sendJsonResponse([
            'id' => (int)$event['id'],
            'title' => $event['title'],
            'description' => $event['description'],
            'event_date' => $event['event_date'],
            'created_at' => $event['created_at'],
            'updated_at' => $event['updated_at'],
            'images' => $images
        ]);
        return;
    }

    // Liste paginée
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Compter le total
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM events");
    $total = $stmt->fetch()['total'];

    // Récupérer les événements avec la première image comme thumbnail
    $stmt = $pdo->prepare("
        SELECT
            e.id,
            e.title,
            e.description,
            e.event_date,
            e.created_at,
            (SELECT image_url FROM event_images WHERE event_id = e.id ORDER BY display_order ASC LIMIT 1) as thumbnail_url,
            (SELECT COUNT(*) FROM event_images WHERE event_id = e.id) as image_count
        FROM events e
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$limit, $offset]);
    $events = $stmt->fetchAll();

    sendJsonResponse([
        'events' => array_map(function($e) {
            return [
                'id' => (int)$e['id'],
                'title' => $e['title'],
                'description' => $e['description'],
                'event_date' => $e['event_date'],
                'created_at' => $e['created_at'],
                'thumbnail_url' => $e['thumbnail_url'],
                'image_count' => (int)$e['image_count']
            ];
        }, $events),
        'pagination' => [
            'current_page' => $page,
            'total_pages' => ceil($total / $limit),
            'total_events' => (int)$total,
            'per_page' => $limit,
            'has_next' => $page < ceil($total / $limit),
            'has_prev' => $page > 1
        ]
    ]);
}

// =====================================================
// POST - Créer un événement OU mettre à jour avec images (si ?id= présent)
// =====================================================
function handlePost($pdo, $user) {
    // Si un ID est fourni en query string, on fait un UPDATE (ajout d'images)
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        return handlePut($pdo, $user);
    }
    
    // Sinon, c'est un ajout classique
    try {
        // Validation des champs texte
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $event_date = $_POST['event_date'] ?? '';

        if (empty($title) || strlen($title) < 3 || strlen($title) > 191) {
            sendJsonError('Le titre doit contenir entre 3 et 191 caractères', 400);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $event_date)) {
            sendJsonError('Date invalide (format: YYYY-MM-DD)', 400);
        }

        // Validation des images
        if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
            sendJsonError('Au moins une image est requise', 400);
        }

        $imageCount = count($_FILES['images']['name']);
        if ($imageCount > 10) {
            sendJsonError('Maximum 10 images par événement', 400);
        }

        // Créer l'événement
        $stmt = $pdo->prepare("
            INSERT INTO events (title, description, event_date, created_by)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$title, $description, $event_date, $user['id']]);
        $eventId = $pdo->lastInsertId();

        // Uploader les images
        $uploadedCount = 0;
        for ($i = 0; $i < $imageCount; $i++) {
            $file = [
                'name' => $_FILES['images']['name'][$i],
                'type' => $_FILES['images']['type'][$i],
                'tmp_name' => $_FILES['images']['tmp_name'][$i],
                'error' => $_FILES['images']['error'][$i],
                'size' => $_FILES['images']['size'][$i]
            ];

            if ($file['error'] !== UPLOAD_ERR_OK) {
                continue;
            }

            try {
                $imageUrl = uploadEventImage($file, $eventId, $i);

                // Sauvegarder dans la DB
                $stmt = $pdo->prepare("
                    INSERT INTO event_images (event_id, image_url, display_order)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$eventId, $imageUrl, $i]);
                $uploadedCount++;
            } catch (Exception $e) {
                // Continue avec les autres images si une échoue
                error_log("Erreur upload image $i: " . $e->getMessage());
            }
        }

        if ($uploadedCount === 0) {
            // Supprimer l'événement si aucune image n'a été uploadée
            $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
            $stmt->execute([$eventId]);
            sendJsonError('Aucune image n\'a pu être uploadée', 500);
        }

        logActivity('Événement créé', 'INFO', ['event_id' => $eventId, 'user_id' => $user['id']]);

        sendJsonResponse([
            'id' => (int)$eventId,
            'title' => $title,
            'message' => 'Événement créé avec succès',
            'images_uploaded' => $uploadedCount
        ], 201);

    } catch (Exception $e) {
        error_log("Erreur création événement: " . $e->getMessage());
        sendJsonError('Erreur lors de la création: ' . $e->getMessage(), 500);
    }
}

// =====================================================
// PUT - Modifier un événement
// =====================================================
function handlePut($pdo, $user) {
    if (!isset($_GET['id'])) {
        sendJsonError('ID événement requis', 400);
    }

    $id = (int)$_GET['id'];

    // Vérifier que l'événement existe
    $stmt = $pdo->prepare("SELECT id FROM events WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        sendJsonError('Événement introuvable', 404);
    }

    // Détecter si c'est du FormData (avec images) ou du JSON
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $isFormData = strpos($contentType, 'multipart/form-data') !== false;

    if ($isFormData) {
        // Lire depuis $_POST pour FormData
        $input = $_POST;
    } else {
        // Lire depuis php://input pour JSON
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            sendJsonError('Corps de requête invalide', 400);
        }
    }

    // Construire la requête de mise à jour dynamiquement
    $fields = [];
    $values = [];

    if (isset($input['title']) && !empty(trim($input['title']))) {
        $title = trim($input['title']);
        if (strlen($title) < 3 || strlen($title) > 191) {
            sendJsonError('Le titre doit contenir entre 3 et 191 caractères', 400);
        }
        $fields[] = "title = ?";
        $values[] = $title;
    }

    if (isset($input['description'])) {
        $fields[] = "description = ?";
        $values[] = trim($input['description']);
    }

    if (isset($input['event_date']) && !empty($input['event_date'])) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['event_date'])) {
            sendJsonError('Date invalide (format: YYYY-MM-DD)', 400);
        }
        $fields[] = "event_date = ?";
        $values[] = $input['event_date'];
    }

    if (empty($fields)) {
        sendJsonError('Aucun champ à mettre à jour', 400);
    }

    // Ajouter l'ID à la fin pour le WHERE
    $values[] = $id;

    // Exécuter la mise à jour
    if (!empty($fields)) {
        $sql = "UPDATE events SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
    }

    // Gérer la suppression sélective d'images
    if (isset($input['imagesToDelete'])) {
        // Décoder si c'est une string JSON (cas FormData)
        $imagesToDelete = $input['imagesToDelete'];
        if (is_string($imagesToDelete)) {
            $imagesToDelete = json_decode($imagesToDelete, true);
        }
        
        if (is_array($imagesToDelete) && !empty($imagesToDelete)) {
            foreach ($imagesToDelete as $imageId) {
                $imageId = (int)$imageId;
                
                // Récupérer le chemin de l'image avant suppression
                $stmt = $pdo->prepare("SELECT image_url FROM event_images WHERE id = ? AND event_id = ?");
                $stmt->execute([$imageId, $id]);
                $imageUrl = $stmt->fetchColumn();
                
                if ($imageUrl) {
                    // Supprimer le fichier physique
                    $imagePath = __DIR__ . $imageUrl;
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                    
                    // Supprimer l'entrée en base de données
                    $stmt = $pdo->prepare("DELETE FROM event_images WHERE id = ? AND event_id = ?");
                    $stmt->execute([$imageId, $id]);
                }
            }
        }
    }

    // Gérer le réordonnancement des images
    if (isset($input['imageOrder']) && is_array($input['imageOrder'])) {
        foreach ($input['imageOrder'] as $imageUpdate) {
            if (isset($imageUpdate['id']) && isset($imageUpdate['display_order'])) {
                $stmt = $pdo->prepare("
                    UPDATE event_images
                    SET display_order = ?
                    WHERE id = ? AND event_id = ?
                ");
                $stmt->execute([
                    (int)$imageUpdate['display_order'],
                    (int)$imageUpdate['id'],
                    $id
                ]);
            }
        }
    }

    // Gérer l'upload de nouvelles images si présentes
    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        // Obtenir le prochain display_order (ajouter après les images existantes)
        $stmt = $pdo->prepare("SELECT COALESCE(MAX(display_order), -1) + 1 FROM event_images WHERE event_id = ?");
        $stmt->execute([$id]);
        $nextOrder = (int)$stmt->fetchColumn();
        
        // Uploader les nouvelles images sans supprimer les existantes
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            $file = [
                'name' => $_FILES['images']['name'][$i],
                'type' => $_FILES['images']['type'][$i],
                'tmp_name' => $_FILES['images']['tmp_name'][$i],
                'error' => $_FILES['images']['error'][$i],
                'size' => $_FILES['images']['size'][$i]
            ];

            try {
                $imageUrl = uploadEventImage($file, $id, $nextOrder);
                
                if ($imageUrl) {
                    $stmt = $pdo->prepare("
                        INSERT INTO event_images (event_id, image_url, display_order)
                        VALUES (?, ?, ?)
                    ");
                    $stmt->execute([$id, $imageUrl, $nextOrder]);
                    $nextOrder++;
                }
            } catch (Exception $e) {
                // Log l'erreur mais continue avec les autres fichiers
                error_log("Erreur upload image événement: " . $e->getMessage());
            }
        }
    }

    logActivity('Événement modifié', 'INFO', ['event_id' => $id, 'user_id' => $user['id']]);

    sendJsonResponse([
        'id' => $id,
        'message' => 'Événement mis à jour avec succès'
    ]);
}

// =====================================================
// DELETE - Supprimer un événement
// =====================================================
function handleDelete($pdo, $user) {
    if (!isset($_GET['id'])) {
        sendJsonError('ID événement requis', 400);
    }

    $id = (int)$_GET['id'];

    // Vérifier que l'événement existe
    $stmt = $pdo->prepare("SELECT id FROM events WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        sendJsonError('Événement introuvable', 404);
    }

    // Supprimer les fichiers physiques
    deleteEventImages($id);

    // Supprimer l'événement (CASCADE supprimera les event_images en DB)
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$id]);

    logActivity('Événement supprimé', 'INFO', ['event_id' => $id, 'user_id' => $user['id']]);

    sendJsonResponse([
        'message' => 'Événement supprimé avec succès'
    ]);
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Uploader une image d'événement
 */
function uploadEventImage($file, $eventId, $order) {
    $uploadDir = __DIR__ . "/uploads/events/{$eventId}/";

    // Créer le dossier si nécessaire
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Valider le type MIME
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Type de fichier non autorisé: ' . $mimeType);
    }

    // Valider la taille (5MB max)
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('Image trop volumineuse (max 5MB)');
    }

    // Générer le nom de fichier
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = "image-{$order}-" . time() . "-" . uniqid() . ".{$extension}";
    $filePath = $uploadDir . $fileName;

    // Déplacer le fichier
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception('Erreur lors de l\'upload du fichier');
    }

    return "/uploads/events/{$eventId}/{$fileName}";
}

/**
 * Supprimer tous les fichiers images d'un événement
 */
function deleteEventImages($eventId) {
    $uploadDir = __DIR__ . "/uploads/events/{$eventId}/";

    if (is_dir($uploadDir)) {
        // Supprimer tous les fichiers du dossier
        $files = glob($uploadDir . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        // Supprimer le dossier
        rmdir($uploadDir);
    }
}
