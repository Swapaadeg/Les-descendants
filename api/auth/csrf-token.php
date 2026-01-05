<?php
/**
 * Endpoint pour récupérer un token CSRF
 * GET /api/auth/csrf-token.php
 * 
 * Utilisé par le frontend pour obtenir un token CSRF
 * avant de faire des requêtes POST/PUT/DELETE
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/security.php';

// Gérer les requêtes OPTIONS
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoriser uniquement GET
if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonError('Méthode non autorisée', 405);
}

// Générer et retourner le token
serveCsrfToken();