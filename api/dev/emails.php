<?php
/**
 * DEV ONLY - Consulter les emails envoyés en mode développement
 * Accès: http://localhost:8000/dev/emails.php
 */

require_once __DIR__ . '/../config.php';

// Autoriser uniquement en mode DEBUG
if (!defined('DEBUG_MODE') || DEBUG_MODE !== true) {
    http_response_code(403);
    die('Accès interdit - Mode DEBUG désactivé');
}

$logFile = __DIR__ . '/../logs/emails-dev.log';

// Gérer l'action de vidage des logs
if (isset($_GET['action']) && $_GET['action'] === 'clear') {
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
    }
    header('Location: /dev/emails.php');
    exit;
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emails de développement - Arki'Family</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 10px;
            font-size: 2rem;
            background: linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            text-align: center;
            color: rgba(255,255,255,0.6);
            margin-bottom: 30px;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        .btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #ff2a6d 0%, #d81b60 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 42, 109, 0.4);
        }
        .btn-secondary {
            background: linear-gradient(135deg, #00d4ff 0%, #0095ff 100%);
        }
        .email-entry {
            background: rgba(255,255,255,0.05);
            border-left: 4px solid #00d4ff;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
        }
        .email-entry:hover {
            background: rgba(255,255,255,0.08);
            border-left-color: #7b2cbf;
        }
        .email-date {
            color: #00d4ff;
            font-size: 0.9rem;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .email-to {
            color: rgba(255,255,255,0.8);
            margin-bottom: 5px;
        }
        .email-subject {
            color: #fff;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .email-link {
            display: inline-block;
            padding: 10px 15px;
            background: linear-gradient(135deg, #39ff14 0%, #00c853 100%);
            color: #000;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin-top: 10px;
            transition: all 0.2s;
            word-break: break-all;
        }
        .email-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(57, 255, 20, 0.4);
        }
        .empty {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255,255,255,0.5);
            font-size: 1.2rem;
        }
        .count {
            color: rgba(255,255,255,0.7);
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦖 Emails de développement</h1>
        <p class="subtitle">Mode DEBUG - Tous les emails "envoyés" apparaissent ici</p>

        <div class="toolbar">
            <span class="count">
                <?php
                $count = 0;
                if (file_exists($logFile)) {
                    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    $count = count($lines);
                }
                echo $count . ' email' . ($count > 1 ? 's' : '');
                ?>
            </span>
            <div>
                <button onclick="location.reload()" class="btn btn-secondary">🔄 Rafraîchir</button>
                <a href="?action=clear" class="btn" onclick="return confirm('Vider tous les logs ?')">🗑️ Vider</a>
            </div>
        </div>

        <?php
        if (!file_exists($logFile) || filesize($logFile) === 0) {
            echo '<div class="empty">📭 Aucun email envoyé pour le moment</div>';
        } else {
            $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $lines = array_reverse($lines); // Plus récent en premier

            foreach ($lines as $line) {
                // Format: [2024-01-15 10:30:45] À: email@test.com | Sujet: Test | Lien: http://...
                if (preg_match('/\[(.+?)\] À: (.+?) \| Sujet: (.+?)(?:\s*\|\s*Lien:\s*(.+))?$/', $line, $matches)) {
                    $date = $matches[1];
                    $to = $matches[2];
                    $subject = $matches[3];
                    $link = $matches[4] ?? null;

                    echo '<div class="email-entry">';
                    echo '<div class="email-date">📅 ' . htmlspecialchars($date) . '</div>';
                    echo '<div class="email-to">📧 <strong>À:</strong> ' . htmlspecialchars($to) . '</div>';
                    echo '<div class="email-subject">' . htmlspecialchars($subject) . '</div>';

                    if ($link) {
                        // Convertir le lien pour pointer vers le frontend React
                        $frontendLink = str_replace('http://localhost:8000', 'http://localhost:5173', $link);
                        echo '<a href="' . htmlspecialchars($frontendLink) . '" class="email-link" target="_blank">🔗 ' . htmlspecialchars($frontendLink) . '</a>';
                    }

                    echo '</div>';
                }
            }
        }
        ?>
    </div>

    <script>
        // Auto-refresh toutes les 5 secondes
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>
