<?php
/**
 * Service d'envoi d'emails
 * Gère les emails de confirmation, récupération de mot de passe, etc.
 */

class EmailService {
    private $fromEmail;
    private $fromName;
    private $baseUrl;

    public function __construct() {
        $this->fromEmail = 'noreply@arkifamily.com';
        $this->fromName = 'Arki\'Family';
        $this->baseUrl = 'http://localhost:5173'; // URL du frontend
    }

    /**
     * Envoyer un email de confirmation d'inscription
     */
    public function sendVerificationEmail($email, $username, $token) {
        $verificationUrl = $this->baseUrl . '/verify-email?token=' . urlencode($token);

        $subject = 'Confirme ton inscription à Arki\'Family !';

        $htmlBody = $this->getEmailTemplate([
            'title' => 'Bienvenue dans Arki\'Family !',
            'username' => $username,
            'message' => 'Nous sommes ravis de t\'accueillir dans notre communauté d\'éleveurs ARK !',
            'content' => '
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    Pour commencer ton aventure et accéder à toutes les fonctionnalités,
                    tu dois confirmer ton adresse email en cliquant sur le bouton ci-dessous :
                </p>
            ',
            'buttonText' => 'Confirmer mon email',
            'buttonUrl' => $verificationUrl,
            'footer' => '
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                    Si tu n\'as pas créé de compte sur Arki\'Family, tu peux ignorer cet email.
                </p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 20px;">
                    Ce lien expire dans 24 heures.
                </p>
            '
        ]);

        return $this->sendEmail($email, $subject, $htmlBody);
    }

    /**
     * Envoyer un email de récupération de mot de passe
     */
    public function sendPasswordResetEmail($email, $username, $token) {
        $resetUrl = $this->baseUrl . '/reset-password?token=' . urlencode($token);

        $subject = 'Réinitialisation de ton mot de passe - Arki\'Family';

        $htmlBody = $this->getEmailTemplate([
            'title' => 'Réinitialisation de mot de passe',
            'username' => $username,
            'message' => 'Tu as demandé à réinitialiser ton mot de passe.',
            'content' => '
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe :
                </p>
            ',
            'buttonText' => 'Réinitialiser mon mot de passe',
            'buttonUrl' => $resetUrl,
            'footer' => '
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                    Si tu n\'as pas demandé cette réinitialisation, tu peux ignorer cet email en toute sécurité.
                </p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 20px;">
                    Ce lien expire dans 1 heure pour ta sécurité.
                </p>
            '
        ]);

        return $this->sendEmail($email, $subject, $htmlBody);
    }

    /**
     * Envoyer un email de confirmation de changement d'email
     */
    public function sendEmailChangeConfirmation($newEmail, $username, $token) {
        $confirmUrl = $this->baseUrl . '/confirm-email-change?token=' . urlencode($token);

        $subject = 'Confirme ton changement d\'email - Arki\'Family';

        $htmlBody = $this->getEmailTemplate([
            'title' => 'Changement d\'adresse email',
            'username' => $username,
            'message' => 'Tu as demandé à changer ton adresse email.',
            'content' => '
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    Pour confirmer que cette nouvelle adresse t\'appartient bien,
                    clique sur le bouton ci-dessous :
                </p>
            ',
            'buttonText' => 'Confirmer mon nouvel email',
            'buttonUrl' => $confirmUrl,
            'footer' => '
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                    Si tu n\'as pas demandé ce changement, contacte-nous immédiatement.
                </p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 20px;">
                    Ce lien expire dans 24 heures.
                </p>
            '
        ]);

        return $this->sendEmail($newEmail, $subject, $htmlBody);
    }

    /**
     * Template HTML pour les emails
     */
    private function getEmailTemplate($data) {
        return '
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($data['title']) . '</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Container principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
                    <!-- En-tête -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="color: #00d4ff; font-size: 32px; font-weight: 900; margin: 0 0 10px; text-shadow: 0 2px 20px rgba(0, 212, 255, 0.3);">
                                ARKI\'FAMILY
                            </h1>
                            <div style="height: 3px; width: 60px; background: linear-gradient(135deg, #00d4ff 0%, #b842ff 100%); margin: 0 auto;"></div>
                        </td>
                    </tr>

                    <!-- Corps -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px;">
                                ' . htmlspecialchars($data['title']) . '
                            </h2>

                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6; margin: 10px 0;">
                                Salut <strong style="color: #00d4ff;">' . htmlspecialchars($data['username']) . '</strong>,
                            </p>

                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6; margin: 10px 0;">
                                ' . $data['message'] . '
                            </p>

                            ' . $data['content'] . '

                            <!-- Bouton CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="' . htmlspecialchars($data['buttonUrl']) . '"
                                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d4ff 0%, #b842ff 100%);
                                                  color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 18px;
                                                  font-weight: 600; box-shadow: 0 5px 25px rgba(0, 212, 255, 0.4);">
                                            ' . htmlspecialchars($data['buttonText']) . '
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            ' . $data['footer'] . '
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                            <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 0;">
                                © ' . date('Y') . ' Arki\'Family - Communauté d\'éleveurs ARK
                            </p>
                            <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin: 10px 0 0;">
                                Rejoins une tribu, élève tes dinosaures, partage tes aventures
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ';
    }

    /**
     * Fonction d'envoi d'email (utilise mail() de PHP)
     * En production, utiliser PHPMailer ou un service comme SendGrid
     */
    private function sendEmail($to, $subject, $htmlBody) {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $headers .= "Reply-To: {$this->fromEmail}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        // En développement, logger l'email au lieu de l'envoyer
        if ($_SERVER['SERVER_NAME'] === 'localhost' || strpos($_SERVER['SERVER_NAME'], '127.0.0.1') !== false) {
            $this->logEmail($to, $subject, $htmlBody);
            return true;
        }

        // En production, envoyer réellement l'email
        return mail($to, $subject, $htmlBody, $headers);
    }

    /**
     * Logger les emails en développement
     */
    private function logEmail($to, $subject, $body) {
        $logDir = __DIR__ . '/../logs/emails';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }

        $logFile = $logDir . '/' . date('Y-m-d') . '.log';
        $logContent = sprintf(
            "[%s] TO: %s | SUBJECT: %s\n%s\n\n",
            date('Y-m-d H:i:s'),
            $to,
            $subject,
            "Voir le fichier HTML séparé pour le contenu"
        );

        file_put_contents($logFile, $logContent, FILE_APPEND);

        // Sauvegarder aussi le HTML pour prévisualisation
        $htmlFile = $logDir . '/' . date('Y-m-d_His') . '_' . md5($to . $subject) . '.html';
        file_put_contents($htmlFile, $body);

        error_log("📧 Email (DEV MODE) envoyé à $to : $subject (sauvegardé dans $htmlFile)");
    }
}
