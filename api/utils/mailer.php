<?php
/**
 * Utilitaire d'envoi d'emails - Arki'Family
 *
 * Gère l'envoi d'emails pour :
 * - Vérification d'email
 * - Réinitialisation de mot de passe
 * - Notifications de tribu
 * - Notifications admin
 */

/**
 * Configuration email
 * À adapter selon ton hébergeur (o2switch utilise généralement mail() PHP)
 */
define('EMAIL_FROM', 'noreply@les-descendants.sc5jewe1253.universe.wf');
define('EMAIL_FROM_NAME', 'Arki\'Family');
// Utiliser FRONTEND_URL pour les liens dans les emails (pages React)
define('SITE_URL', defined('FRONTEND_URL') ? FRONTEND_URL : 'https://les-descendants.sc5jewe1253.universe.wf');

// Charger PHPMailer
require_once __DIR__ . '/../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Envoyer un email (fonction de base)
 *
 * @param string $to Destinataire
 * @param string $subject Sujet
 * @param string $htmlBody Corps HTML
 * @param string $textBody Corps texte brut (fallback)
 * @return bool True si envoyé avec succès
 */
function sendEmail($to, $subject, $htmlBody, $textBody = '') {
    // Déterminer le mode d'envoi
    $emailMode = defined('EMAIL_MODE') ? EMAIL_MODE : 'debug';

    // MODE DEBUG : Afficher l'email dans les logs au lieu de l'envoyer
    if ($emailMode === 'debug' || (defined('DEBUG_MODE') && DEBUG_MODE === true && $emailMode !== 'smtp')) {
        $textContent = strip_tags($htmlBody);

        // Extraire le lien de vérification/reset s'il existe
        preg_match('/href="([^"]+verify-email[^"]+)"/', $htmlBody, $verifyMatches);
        preg_match('/href="([^"]+reset-password[^"]+)"/', $htmlBody, $resetMatches);

        $link = $verifyMatches[1] ?? $resetMatches[1] ?? null;

        echo "\n";
        echo "================== EMAIL DEBUG ==================\n";
        echo "À: $to\n";
        echo "Sujet: $subject\n";
        if ($link) {
            echo "LIEN IMPORTANT: $link\n";
        }
        echo "=================================================\n";
        echo "\n";

        // Logger aussi dans un fichier pour consultation ultérieure
        $logFile = __DIR__ . '/../logs/emails-dev.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }

        $logEntry = sprintf(
            "[%s] À: %s | Sujet: %s%s\n",
            date('Y-m-d H:i:s'),
            $to,
            $subject,
            $link ? " | Lien: $link" : ""
        );
        file_put_contents($logFile, $logEntry, FILE_APPEND);

        if (function_exists('logActivity')) {
            logActivity('Email DEBUG affiché', 'INFO', [
                'to' => $to,
                'subject' => $subject,
                'link' => $link
            ]);
        }

        return true; // Toujours succès en mode debug
    }

    // MODE SMTP : Envoi réel via PHPMailer
    try {
        $mail = new PHPMailer(true);

        // Configuration SMTP
        $mail->isSMTP();
        $mail->Host = defined('SMTP_HOST') ? SMTP_HOST : 'localhost';
        $mail->SMTPAuth = true;
        $mail->Username = defined('SMTP_USERNAME') ? SMTP_USERNAME : '';
        $mail->Password = defined('SMTP_PASSWORD') ? SMTP_PASSWORD : '';
        $mail->SMTPSecure = defined('SMTP_ENCRYPTION') ? SMTP_ENCRYPTION : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = defined('SMTP_PORT') ? SMTP_PORT : 587;
        $mail->CharSet = 'UTF-8';

        // Expéditeur
        $fromEmail = defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : EMAIL_FROM;
        $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : EMAIL_FROM_NAME;
        $mail->setFrom($fromEmail, $fromName);
        $mail->addReplyTo($fromEmail, $fromName);

        // Destinataire
        $mail->addAddress($to);

        // Contenu
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = getEmailTemplate($htmlBody);
        $mail->AltBody = empty($textBody) ? strip_tags($htmlBody) : $textBody;

        // Envoi
        $success = $mail->send();

        if (function_exists('logActivity')) {
            logActivity('Email envoyé via SMTP', 'INFO', [
                'to' => $to,
                'subject' => $subject,
                'smtp_host' => $mail->Host
            ]);
        }

        return $success;

    } catch (Exception $e) {
        if (function_exists('logActivity')) {
            logActivity('Erreur envoi email SMTP', 'ERROR', [
                'to' => $to,
                'subject' => $subject,
                'error' => $mail->ErrorInfo ?? $e->getMessage()
            ]);
        }

        // En cas d'erreur SMTP, afficher dans les logs pour debug
        echo "\n⚠️ ERREUR SMTP: " . ($mail->ErrorInfo ?? $e->getMessage()) . "\n";

        return false;
    }
}

/**
 * Template HTML pour les emails
 */
function getEmailTemplate($content) {
    return '
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arki\'Family</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #fff;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .content {
            padding: 40px 30px;
            background: #fff;
        }
        .content p {
            margin: 15px 0;
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 20px 0;
            background: linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%);
            color: #fff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,212,255,0.3);
        }
        .button:hover {
            box-shadow: 0 6px 20px rgba(0,212,255,0.5);
        }
        .footer {
            background: #1a1a2e;
            color: #888;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #00d4ff;
            text-decoration: none;
        }
        .code {
            background: #f0f0f0;
            border: 2px dashed #00d4ff;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #7b2cbf;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🦖 Arki\'Family</h1>
        </div>
        <div class="content">
            ' . $content . '
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par Arki\'Family</p>
            <p><a href="' . SITE_URL . '">Accéder au site</a></p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Envoyer un email de vérification
 *
 * @param string $to Email du destinataire
 * @param string $username Pseudo de l'utilisateur
 * @param string $token Token de vérification
 * @return bool True si envoyé
 */
function sendVerificationEmail($to, $username, $token) {
    $verificationUrl = SITE_URL . '/verify-email?token=' . urlencode($token);

    $subject = '🦖 Vérifie ton email - Arki\'Family';

    $content = '
        <p>Salut <strong>' . htmlspecialchars($username) . '</strong> ! 👋</p>
        <p>Bienvenue dans <strong>Arki\'Family</strong> ! Pour finaliser ton inscription et rejoindre la communauté, tu dois vérifier ton adresse email.</p>
        <p style="text-align: center;">
            <a href="' . $verificationUrl . '" class="button">✉️ Vérifier mon email</a>
        </p>
        <p>Ou copie ce lien dans ton navigateur :</p>
        <p style="word-break: break-all; color: #00d4ff; font-size: 12px;">' . $verificationUrl . '</p>
        <p><strong>⚠️ Ce lien expire dans 24 heures.</strong></p>
        <p>Si tu n\'as pas créé de compte, ignore simplement cet email.</p>
    ';

    return sendEmail($to, $subject, $content);
}

/**
 * Envoyer un email de réinitialisation de mot de passe
 *
 * @param string $to Email du destinataire
 * @param string $username Pseudo de l'utilisateur
 * @param string $token Token de reset
 * @return bool True si envoyé
 */
function sendPasswordResetEmail($to, $username, $token) {
    $resetUrl = SITE_URL . '/reset-password?token=' . urlencode($token);

    $subject = '🔐 Réinitialisation de mot de passe - Arki\'Family';

    $content = '
        <p>Salut <strong>' . htmlspecialchars($username) . '</strong>,</p>
        <p>Tu as demandé à réinitialiser ton mot de passe sur <strong>Arki\'Family</strong>.</p>
        <p style="text-align: center;">
            <a href="' . $resetUrl . '" class="button">🔑 Changer mon mot de passe</a>
        </p>
        <p>Ou copie ce lien dans ton navigateur :</p>
        <p style="word-break: break-all; color: #00d4ff; font-size: 12px;">' . $resetUrl . '</p>
        <p><strong>⚠️ Ce lien expire dans 1 heure.</strong></p>
        <p>Si tu n\'as pas fait cette demande, ignore cet email et ton mot de passe restera inchangé.</p>
    ';

    return sendEmail($to, $subject, $content);
}

/**
 * Envoyer une notification de nouvelle demande de tribu (à l'admin)
 *
 * @param string $adminEmail Email de l'admin
 * @param string $tribeName Nom de la tribu demandée
 * @param string $requestedBy Pseudo du demandeur
 * @return bool True si envoyé
 */
function sendTribeRequestNotification($adminEmail, $tribeName, $requestedBy) {
    $adminUrl = SITE_URL . '/admin/pending-tribes';

    $subject = '🆕 Nouvelle demande de tribu - Arki\'Family';

    $content = '
        <p>Salut Admin ! 👋</p>
        <p>Une nouvelle demande de création de tribu a été soumise :</p>
        <div class="code">
            ' . htmlspecialchars($tribeName) . '
        </div>
        <p><strong>Demandée par :</strong> ' . htmlspecialchars($requestedBy) . '</p>
        <p style="text-align: center;">
            <a href="' . $adminUrl . '" class="button">📋 Voir les demandes en attente</a>
        </p>
    ';

    return sendEmail($adminEmail, $subject, $content);
}

/**
 * Envoyer une notification de validation de tribu
 *
 * @param string $to Email du propriétaire
 * @param string $tribeName Nom de la tribu
 * @param bool $approved True si approuvée, false si rejetée
 * @param string $reason Raison du rejet (si rejetée)
 * @return bool True si envoyé
 */
function sendTribeValidationEmail($to, $tribeName, $approved, $reason = '') {
    if ($approved) {
        $subject = '✅ Ta tribu a été approuvée ! - Arki\'Family';
        $tribeUrl = SITE_URL . '/tribes/' . urlencode(strtolower(str_replace(' ', '-', $tribeName)));

        $content = '
            <p>Félicitations ! 🎉</p>
            <p>Ta tribu <strong>' . htmlspecialchars($tribeName) . '</strong> a été approuvée par un administrateur.</p>
            <p>Tu peux maintenant commencer à gérer ta tribu et ajouter des dinosaures !</p>
            <p style="text-align: center;">
                <a href="' . $tribeUrl . '" class="button">🦖 Accéder à ma tribu</a>
            </p>
        ';
    } else {
        $subject = '❌ Demande de tribu rejetée - Arki\'Family';

        $content = '
            <p>Malheureusement, ta demande de création de tribu <strong>' . htmlspecialchars($tribeName) . '</strong> a été rejetée.</p>
            <p><strong>Raison :</strong> ' . htmlspecialchars($reason) . '</p>
            <p>Tu peux soumettre une nouvelle demande en tenant compte de ces remarques.</p>
        ';
    }

    return sendEmail($to, $subject, $content);
}

/**
 * Envoyer une notification de demande pour rejoindre une tribu (au propriétaire)
 *
 * @param string $ownerEmail Email du propriétaire
 * @param string $tribeName Nom de la tribu
 * @param string $requesterUsername Pseudo du demandeur
 * @param string $message Message de la demande
 * @return bool True si envoyé
 */
function sendJoinRequestNotification($ownerEmail, $tribeName, $requesterUsername, $message) {
    $manageUrl = SITE_URL . '/tribes/manage';

    $subject = '🙋 Nouvelle demande pour rejoindre ta tribu - Arki\'Family';

    $content = '
        <p>Salut ! 👋</p>
        <p><strong>' . htmlspecialchars($requesterUsername) . '</strong> souhaite rejoindre ta tribu <strong>' . htmlspecialchars($tribeName) . '</strong>.</p>
        <p><strong>Message :</strong></p>
        <div style="background: #f0f0f0; padding: 15px; border-left: 4px solid #00d4ff; margin: 15px 0;">
            ' . nl2br(htmlspecialchars($message)) . '
        </div>
        <p style="text-align: center;">
            <a href="' . $manageUrl . '" class="button">📋 Gérer les demandes</a>
        </p>
    ';

    return sendEmail($ownerEmail, $subject, $content);
}

/**
 * Envoyer une notification de réponse à une demande de rejoindre une tribu
 *
 * @param string $to Email du demandeur
 * @param string $tribeName Nom de la tribu
 * @param bool $accepted True si accepté, false si rejeté
 * @return bool True si envoyé
 */
function sendJoinResponseEmail($to, $tribeName, $accepted) {
    if ($accepted) {
        $subject = '✅ Tu as rejoint la tribu ! - Arki\'Family';
        $tribeUrl = SITE_URL . '/tribes/' . urlencode(strtolower(str_replace(' ', '-', $tribeName)));

        $content = '
            <p>Excellente nouvelle ! 🎉</p>
            <p>Ta demande pour rejoindre <strong>' . htmlspecialchars($tribeName) . '</strong> a été acceptée !</p>
            <p>Tu fais maintenant partie de la tribu et tu peux voir tous ses dinosaures.</p>
            <p style="text-align: center;">
                <a href="' . $tribeUrl . '" class="button">🦖 Voir la tribu</a>
            </p>
        ';
    } else {
        $subject = '❌ Demande de tribu refusée - Arki\'Family';

        $content = '
            <p>Malheureusement, ta demande pour rejoindre <strong>' . htmlspecialchars($tribeName) . '</strong> a été refusée par le propriétaire.</p>
            <p>Tu peux essayer de rejoindre une autre tribu ou créer la tienne !</p>
        ';
    }

    return sendEmail($to, $subject, $content);
}

/**
 * Envoyer un email de bienvenue après vérification
 *
 * @param string $to Email du destinataire
 * @param string $username Pseudo de l'utilisateur
 * @return bool True si envoyé
 */
function sendWelcomeEmail($to, $username) {
    $subject = '🦖 Bienvenue dans Arki\'Family !';

    $content = '
        <p>Salut <strong>' . htmlspecialchars($username) . '</strong> ! 🎉</p>
        <p>Ton compte est maintenant vérifié et actif. Bienvenue dans <strong>Arki\'Family</strong> !</p>
        <h3>Prochaines étapes :</h3>
        <ul style="line-height: 2;">
            <li>🏕️ Crée ta propre tribu ou rejoins-en une existante</li>
            <li>🦖 Ajoute tes premiers dinosaures</li>
            <li>📊 Suis les stats de ta tribu</li>
            <li>👥 Invite d\'autres membres</li>
        </ul>
        <p style="text-align: center;">
            <a href="' . SITE_URL . '" class="button">🚀 Commencer l\'aventure</a>
        </p>
        <p>Bon jeu ! 🎮</p>
    ';

    return sendEmail($to, $subject, $content);
}
?>
