<?php
/**
 * API REST pour gérer les dinosaures
 * Endpoints: GET, POST, PUT, DELETE
 */

require_once 'config.php';
require_once 'middleware/auth.php';

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Récupérer la connexion à la base de données
$pdo = getDbConnection();

// Vérifier l'authentification
$user = requireAuth($pdo);
if (!$user) {
    exit;
}

// Router selon la méthode HTTP
switch ($method) {
    case 'GET':
        handleGet($pdo, $user);
        break;
    case 'POST':
        handlePost($pdo, $user);
        break;
    case 'PUT':
        handlePut($pdo, $user);
        break;
    case 'DELETE':
        handleDelete($pdo, $user);
        break;
    default:
        sendJsonError('Méthode non autorisée', 405);
}

/**
 * GET - Récupérer tous les dinosaures
 */
function handleGet($pdo, $user) {
    try {
        // Si ?recent est présent, retourner les 3 derniers modifiés
        if (isset($_GET['recent']) && isset($_GET['tribe_id'])) {
            $tribeId = (int)$_GET['tribe_id'];
            $stmt = $pdo->prepare('SELECT * FROM dinosaurs WHERE tribe_id = ? ORDER BY updated_at DESC LIMIT 3');
            $stmt->execute([$tribeId]);
            $dinosaurs = $stmt->fetchAll();
        } else {
            $stmt = $pdo->query('SELECT * FROM dinosaurs ORDER BY created_at DESC');
            $dinosaurs = $stmt->fetchAll();
        }

        // Transformer les données pour le format attendu par React
        $result = array_map(function($dino) {
            return [
                'id' => (int)$dino['id'],
                'species' => $dino['species'],
                'typeIds' => json_decode($dino['type_ids']),
                'isMutated' => (bool)$dino['is_mutated'],
                'photoUrl' => $dino['photo_url'],
                'stats' => [
                    'health' => (int)$dino['stat_health'],
                    'stamina' => (int)$dino['stat_stamina'],
                    'oxygen' => (int)$dino['stat_oxygen'],
                    'food' => (int)$dino['stat_food'],
                    'weight' => (int)$dino['stat_weight'],
                    'damage' => (int)$dino['stat_damage'],
                    'crafting' => (int)$dino['stat_crafting']
                ],
                'mutatedStats' => [
                    'health' => (int)$dino['mutated_stat_health'],
                    'stamina' => (int)$dino['mutated_stat_stamina'],
                    'oxygen' => (int)$dino['mutated_stat_oxygen'],
                    'food' => (int)$dino['mutated_stat_food'],
                    'weight' => (int)$dino['mutated_stat_weight'],
                    'damage' => (int)$dino['mutated_stat_damage'],
                    'crafting' => (int)$dino['mutated_stat_crafting']
                ],
                'createdAt' => $dino['created_at']
            ];
        }, $dinosaurs);

        sendJsonResponse($result);
    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la récupération des dinosaures: ' . $e->getMessage(), 500);
    }
}

/**
 * POST - Ajouter un nouveau dinosaure
 */
function handlePost($pdo, $user) {
    try {
        // Récupérer la tribu de l'utilisateur
        $stmt = $pdo->prepare("
            SELECT t.id
            FROM tribes t
            JOIN tribe_members tm ON t.id = tm.tribe_id
            WHERE tm.user_id = ? AND tm.is_validated = 1
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $tribe = $stmt->fetch();

        if (!$tribe) {
            sendJsonError('Vous devez être membre d\'une tribu pour ajouter un dinosaure', 403);
            return;
        }

        $tribeId = $tribe['id'];

        // Gérer l'upload de fichier
        $photoUrl = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $photoUrl = uploadPhoto($_FILES['photo'], $_POST['species']);
        }

        // Récupérer les données du formulaire
        $species = $_POST['species'] ?? '';
        $typeIds = $_POST['typeIds'] ?? '[]';
        $isMutated = isset($_POST['isMutated']) ? (int)$_POST['isMutated'] : 0;

        // Stats de base
        $stats = json_decode($_POST['stats'] ?? '{}', true);
        $mutatedStats = json_decode($_POST['mutatedStats'] ?? '{}', true);

        // Préparer la requête d'insertion
        $sql = "INSERT INTO dinosaurs (
            tribe_id, species, type_ids, is_mutated, photo_url, created_by,
            stat_health, stat_stamina, stat_oxygen, stat_food, stat_weight, stat_damage, stat_crafting,
            mutated_stat_health, mutated_stat_stamina, mutated_stat_oxygen, mutated_stat_food,
            mutated_stat_weight, mutated_stat_damage, mutated_stat_crafting
        ) VALUES (
            :tribe_id, :species, :type_ids, :is_mutated, :photo_url, :created_by,
            :stat_health, :stat_stamina, :stat_oxygen, :stat_food, :stat_weight, :stat_damage, :stat_crafting,
            :mutated_stat_health, :mutated_stat_stamina, :mutated_stat_oxygen, :mutated_stat_food,
            :mutated_stat_weight, :mutated_stat_damage, :mutated_stat_crafting
        )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':tribe_id' => $tribeId,
            ':species' => $species,
            ':type_ids' => $typeIds,
            ':is_mutated' => $isMutated,
            ':photo_url' => $photoUrl,
            ':created_by' => $user['id'],
            ':stat_health' => $stats['health'] ?? 0,
            ':stat_stamina' => $stats['stamina'] ?? 0,
            ':stat_oxygen' => $stats['oxygen'] ?? 0,
            ':stat_food' => $stats['food'] ?? 0,
            ':stat_weight' => $stats['weight'] ?? 0,
            ':stat_damage' => $stats['damage'] ?? 0,
            ':stat_crafting' => $stats['crafting'] ?? 0,
            ':mutated_stat_health' => $mutatedStats['health'] ?? 0,
            ':mutated_stat_stamina' => $mutatedStats['stamina'] ?? 0,
            ':mutated_stat_oxygen' => $mutatedStats['oxygen'] ?? 0,
            ':mutated_stat_food' => $mutatedStats['food'] ?? 0,
            ':mutated_stat_weight' => $mutatedStats['weight'] ?? 0,
            ':mutated_stat_damage' => $mutatedStats['damage'] ?? 0,
            ':mutated_stat_crafting' => $mutatedStats['crafting'] ?? 0
        ]);

        $newId = $pdo->lastInsertId();

        // Récupérer le dinosaure créé
        $stmt = $pdo->prepare('SELECT * FROM dinosaurs WHERE id = ?');
        $stmt->execute([$newId]);
        $dino = $stmt->fetch();

        sendJsonResponse([
            'id' => (int)$dino['id'],
            'species' => $dino['species'],
            'typeIds' => json_decode($dino['type_ids']),
            'isMutated' => (bool)$dino['is_mutated'],
            'photoUrl' => $dino['photo_url'],
            'message' => 'Dinosaure ajouté avec succès'
        ], 201);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de l\'ajout du dinosaure: ' . $e->getMessage(), 500);
    }
}

/**
 * PUT - Mettre à jour un dinosaure
 */
function handlePut($pdo, $user) {
    try {
        // Récupérer les données JSON
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id'])) {
            sendJsonError('ID du dinosaure manquant', 400);
        }

        $id = $input['id'];
        $updates = [];
        $params = [':id' => $id];

        // Construire la requête de mise à jour dynamiquement
        if (isset($input['stats'])) {
            foreach ($input['stats'] as $statKey => $statValue) {
                $column = 'stat_' . $statKey;
                $updates[] = "$column = :$column";
                $params[":$column"] = $statValue;
            }
        }

        if (isset($input['mutatedStats'])) {
            foreach ($input['mutatedStats'] as $statKey => $statValue) {
                $column = 'mutated_stat_' . $statKey;
                $updates[] = "$column = :$column";
                $params[":$column"] = $statValue;
            }
        }

        if (empty($updates)) {
            sendJsonError('Aucune donnée à mettre à jour', 400);
        }

        $sql = "UPDATE dinosaurs SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        sendJsonResponse(['message' => 'Dinosaure mis à jour avec succès']);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la mise à jour: ' . $e->getMessage(), 500);
    }
}

/**
 * DELETE - Supprimer un dinosaure
 */
function handleDelete($pdo, $user) {
    try {
        // Récupérer l'ID depuis les paramètres GET
        $id = $_GET['id'] ?? null;

        if (!$id) {
            sendJsonError('ID du dinosaure manquant', 400);
        }

        // Récupérer le dinosaure pour supprimer sa photo
        $stmt = $pdo->prepare('SELECT photo_url FROM dinosaurs WHERE id = ?');
        $stmt->execute([$id]);
        $dino = $stmt->fetch();

        if ($dino && $dino['photo_url']) {
            deletePhoto($dino['photo_url']);
        }

        // Supprimer le dinosaure
        $stmt = $pdo->prepare('DELETE FROM dinosaurs WHERE id = ?');
        $stmt->execute([$id]);

        sendJsonResponse(['message' => 'Dinosaure supprimé avec succès']);

    } catch (PDOException $e) {
        sendJsonError('Erreur lors de la suppression: ' . $e->getMessage(), 500);
    }
}

/**
 * Upload d'une photo
 */
function uploadPhoto($file, $species) {
    $uploadDir = __DIR__ . '/uploads/';

    // Créer le dossier uploads s'il n'existe pas
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Vérifier le type de fichier
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        sendJsonError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WEBP.', 400);
    }

    // Vérifier la taille (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendJsonError('Fichier trop volumineux. Maximum 5MB.', 400);
    }

    // Générer un nom de fichier unique
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = preg_replace('/[^a-zA-Z0-9]/', '-', $species) . '-' . time() . '.' . $extension;
    $filePath = $uploadDir . $fileName;

    // Déplacer le fichier uploadé
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        sendJsonError('Erreur lors de l\'upload de la photo', 500);
    }

    // Retourner l'URL relative
    return '/api/uploads/' . $fileName;
}

/**
 * Supprimer une photo
 */
function deletePhoto($photoUrl) {
    if (empty($photoUrl)) {
        return;
    }

    // Extraire le nom du fichier de l'URL
    $fileName = basename($photoUrl);
    $filePath = __DIR__ . '/uploads/' . $fileName;

    if (file_exists($filePath)) {
        unlink($filePath);
    }
}
