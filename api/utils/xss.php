<?php
/**
 * Protection XSS (Cross-Site Scripting)
 * 
 * Fonctions pour échapper et sanitizer les données utilisateur
 * avant de les afficher ou de les stocker.
 */

/**
 * Échapper une chaîne pour l'affichage HTML
 * Protège contre l'injection de code HTML/JavaScript
 * 
 * @param string|null $string La chaîne à échapper
 * @return string La chaîne échappée
 */
function escapeHtml($string) {
    if ($string === null) {
        return '';
    }
    return htmlspecialchars($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Échapper récursivement un tableau ou un objet
 * Utilisé pour sécuriser les réponses JSON
 * 
 * @param mixed $data Les données à échapper
 * @param array $excludeKeys Clés à ne pas échapper (ex: 'html_content')
 * @return mixed Les données échappées
 */
function escapeForOutput($data, $excludeKeys = []) {
    if (is_array($data)) {
        $result = [];
        foreach ($data as $key => $value) {
            // Ne pas échapper certaines clés spécifiques
            if (in_array($key, $excludeKeys)) {
                $result[$key] = $value;
            } else {
                $result[$key] = escapeForOutput($value, $excludeKeys);
            }
        }
        return $result;
    }
    
    if (is_object($data)) {
        $result = new stdClass();
        foreach ($data as $key => $value) {
            if (in_array($key, $excludeKeys)) {
                $result->$key = $value;
            } else {
                $result->$key = escapeForOutput($value, $excludeKeys);
            }
        }
        return $result;
    }
    
    if (is_string($data)) {
        return escapeHtml($data);
    }
    
    // Pour les autres types (int, bool, null, etc.), retourner tel quel
    return $data;
}

/**
 * Nettoyer une chaîne en supprimant les tags HTML
 * Utilisé avant stockage en base de données
 * 
 * @param string $string La chaîne à nettoyer
 * @param array $allowedTags Tags HTML autorisés (ex: ['<p>', '<br>'])
 * @return string La chaîne nettoyée
 */
function stripDangerousTags($string, $allowedTags = []) {
    if (empty($allowedTags)) {
        // Supprimer tous les tags HTML
        return strip_tags($string);
    }
    
    // Supprimer tous les tags sauf ceux autorisés
    return strip_tags($string, implode('', $allowedTags));
}

/**
 * Détecter et bloquer les patterns XSS communs
 * 
 * @param string $string La chaîne à vérifier
 * @return bool True si un pattern XSS est détecté
 */
function detectXssPatterns($string) {
    if (!is_string($string)) {
        return false;
    }
    
    // Patterns XSS courants
    $xssPatterns = [
        // Script tags
        '/<script\b[^>]*>(.*?)<\/script>/is',
        // Event handlers
        '/on\w+\s*=\s*["\'].*?["\']/i',
        '/on\w+\s*=\s*\S+/i',
        // JavaScript protocol
        '/javascript:/i',
        '/vbscript:/i',
        // Data URIs avec script
        '/data:text\/html/i',
        // Import/meta tags dangereux
        '/@import/i',
        // Iframe/embed/object
        '/<iframe\b/i',
        '/<embed\b/i',
        '/<object\b/i',
        // Expression CSS (old IE)
        '/expression\s*\(/i',
        // Link avec javascript
        '/<link[^>]+href[^>]*javascript:/i',
        // Style avec comportement malveillant
        '/<style[^>]*>.*?<\/style>/is',
    ];
    
    foreach ($xssPatterns as $pattern) {
        if (preg_match($pattern, $string)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Sanitizer une chaîne pour un attribut HTML
 * 
 * @param string $string La chaîne à sanitizer
 * @return string La chaîne sécurisée
 */
function sanitizeForAttribute($string) {
    // Supprimer quotes et caractères dangereux
    $string = str_replace(['"', "'", '<', '>', '&'], '', $string);
    return trim($string);
}

/**
 * Nettoyer un nom de fichier
 * Protège contre path traversal et caractères dangereux
 * 
 * @param string $filename Le nom de fichier à nettoyer
 * @return string Le nom de fichier sécurisé
 */
function sanitizeFilename($filename) {
    // Supprimer path traversal
    $filename = basename($filename);
    
    // Supprimer caractères dangereux
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    
    // Limiter la longueur
    if (strlen($filename) > 255) {
        $filename = substr($filename, 0, 255);
    }
    
    return $filename;
}

/**
 * Valider et nettoyer une URL
 * 
 * @param string $url L'URL à valider
 * @param array $allowedSchemes Schémas autorisés (par défaut: http, https)
 * @return string|false L'URL nettoyée ou false si invalide
 */
function sanitizeUrl($url, $allowedSchemes = ['http', 'https']) {
    // Nettoyer l'URL
    $url = filter_var($url, FILTER_SANITIZE_URL);
    
    // Valider l'URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    
    // Vérifier le schéma
    $parsedUrl = parse_url($url);
    if (!isset($parsedUrl['scheme']) || !in_array($parsedUrl['scheme'], $allowedSchemes)) {
        return false;
    }
    
    return $url;
}

/**
 * Nettoyer du texte multi-lignes (description, message, etc.)
 * Autorise les sauts de ligne mais supprime le HTML
 * 
 * @param string $text Le texte à nettoyer
 * @param int $maxLength Longueur maximum
 * @return string Le texte nettoyé
 */
function sanitizeText($text, $maxLength = 5000) {
    // Supprimer tous les tags HTML
    $text = strip_tags($text);
    
    // Normaliser les sauts de ligne
    $text = str_replace(["\r\n", "\r"], "\n", $text);
    
    // Limiter la longueur
    if (strlen($text) > $maxLength) {
        $text = substr($text, 0, $maxLength);
    }
    
    // Trim
    return trim($text);
}

/**
 * Wrapper sécurisé pour json_encode avec échappement
 * 
 * @param mixed $data Les données à encoder
 * @param bool $escapeOutput Si true, échappe les strings HTML
 * @return string Le JSON encodé
 */
function safeJsonEncode($data, $escapeOutput = true) {
    if ($escapeOutput) {
        $data = escapeForOutput($data);
    }
    
    return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/**
 * Logs un tentative XSS détectée
 * 
 * @param string $input L'input malveillant
 * @param string $source La source (endpoint, champ)
 */
function logXssAttempt($input, $source) {
    if (function_exists('logActivity')) {
        logActivity('Tentative XSS bloquée', 'WARNING', [
            'source' => $source,
            'input' => substr($input, 0, 200), // Limiter la taille du log
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    }
}

/**
 * Middleware pour scanner tous les inputs POST/PUT pour XSS
 * À appeler au début des endpoints
 * 
 * @param array $data Les données à scanner
 * @param bool $blockOnDetection Si true, bloque la requête si XSS détecté
 * @return bool True si XSS détecté
 */
function scanInputForXss($data, $blockOnDetection = true) {
    $xssDetected = false;
    
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            if (scanInputForXss($value, $blockOnDetection)) {
                $xssDetected = true;
            }
        } elseif (is_string($value)) {
            if (detectXssPatterns($value)) {
                logXssAttempt($value, "Field: $key");
                $xssDetected = true;
                
                if ($blockOnDetection) {
                    if (function_exists('sendJsonError')) {
                        sendJsonError('Contenu invalide détecté', 400, [
                            'field' => $key,
                            'reason' => 'Caractères ou balises non autorisés'
                        ]);
                    } else {
                        http_response_code(400);
                        header('Content-Type: application/json');
                        echo json_encode(['error' => 'Contenu invalide détecté']);
                        exit();
                    }
                }
            }
        }
    }
    
    return $xssDetected;
}
?>
