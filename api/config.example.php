<?php
/**
 * Configuration de la base de données MySQL
 *
 * INSTRUCTIONS:
 * 1. Copiez ce fichier et renommez-le en "config.php"
 * 2. Remplacez les valeurs par vos vrais identifiants
 */

// Configuration selon l'environnement
$isProduction = $_SERVER['HTTP_HOST'] !== 'localhost';

if ($isProduction) {
    // Production - Désactiver l'affichage des erreurs
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    // Développement - Afficher les erreurs
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de la base de données
// REMPLACEZ CES VALEURS PAR VOS VRAIS IDENTIFIANTS
define('DB_HOST', 'localhost');
define('DB_NAME', 'votre_nom_de_base');      // À remplacer
define('DB_USER', 'votre_utilisateur');       // À remplacer
define('DB_PASS', 'votre_mot_de_passe');      // À remplacer

// Connexion à la base de données
function getDbConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de connexion à la base de données']);
        exit();
    }
}

// Fonction utilitaire pour envoyer une réponse JSON
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Fonction utilitaire pour envoyer une erreur JSON
function sendJsonError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}
