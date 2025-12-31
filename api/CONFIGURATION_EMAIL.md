# Configuration Email SMTP - Arki'Family

Le système d'envoi d'emails est maintenant configuré avec **PHPMailer** et supporte deux modes :
- **Mode DEBUG** : Affiche les emails dans les logs (pas d'envoi réel)
- **Mode SMTP** : Envoie de vrais emails via SMTP

## 🔧 Configuration rapide

Ouvre le fichier `api/config.local.php` et remplis les credentials SMTP.

### Option 1 : Mailtrap (Recommandé pour le développement)

Mailtrap est un service gratuit qui capture tous les emails envoyés dans une fausse boîte mail. Parfait pour tester sans envoyer de vrais emails.

**Étapes :**

1. **Crée un compte gratuit sur [Mailtrap.io](https://mailtrap.io/register/signup)**

2. **Accède à ton inbox** :
   - Va dans "Email Testing" > "Inboxes" > "My Inbox"
   - Clique sur "Show Credentials"

3. **Copie les credentials dans `api/config.local.php`** :
   ```php
   define('EMAIL_MODE', 'smtp');
   define('SMTP_HOST', 'sandbox.smtp.mailtrap.io');
   define('SMTP_PORT', 2525);
   define('SMTP_USERNAME', 'ton_username_ici'); // Fourni par Mailtrap
   define('SMTP_PASSWORD', 'ton_password_ici'); // Fourni par Mailtrap
   define('SMTP_ENCRYPTION', 'tls');
   ```

4. **Teste l'inscription** : Les emails apparaîtront dans ton inbox Mailtrap !

### Option 2 : Gmail (Pour recevoir sur ta vraie adresse)

**⚠️ Attention** : Nécessite un mot de passe d'application (authentification 2 facteurs requise)

**Étapes :**

1. **Active l'authentification à 2 facteurs** sur ton compte Gmail :
   - [https://myaccount.google.com/security](https://myaccount.google.com/security)

2. **Génère un mot de passe d'application** :
   - Va sur [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Sélectionne "App: Mail" et "Device: Windows Computer"
   - Copie le mot de passe généré (16 caractères sans espaces)

3. **Configure dans `api/config.local.php`** :
   ```php
   define('EMAIL_MODE', 'smtp');
   define('SMTP_HOST', 'smtp.gmail.com');
   define('SMTP_PORT', 587);
   define('SMTP_USERNAME', 'ton-email@gmail.com');
   define('SMTP_PASSWORD', 'mot_de_passe_app_16_caracteres'); // Mot de passe d'app, PAS ton mot de passe Gmail
   define('SMTP_ENCRYPTION', 'tls');
   define('SMTP_FROM_EMAIL', 'ton-email@gmail.com');
   ```

### Option 3 : Mode DEBUG (Sans envoi réel)

Si tu veux juste développer sans configurer SMTP :

```php
define('EMAIL_MODE', 'debug'); // Ou laisse EMAIL_MODE non défini
```

Les emails s'afficheront dans :
- Le terminal où tourne le serveur PHP
- Le fichier `api/logs/emails-dev.log`
- L'interface web `http://localhost:8000/dev/emails.php`

## 🧪 Tester l'envoi d'emails

1. **Inscris-toi sur la page** [http://localhost:5173/register](http://localhost:5173/register)

2. **Vérifie la réception** :
   - **Mailtrap** : Ouvre [https://mailtrap.io](https://mailtrap.io) > Inbox
   - **Gmail** : Vérifie ta boîte mail
   - **Debug** : Ouvre [http://localhost:8000/dev/emails.php](http://localhost:8000/dev/emails.php)

3. **Clique sur le lien de vérification** dans l'email

4. **Tu es connecté automatiquement** sur le dashboard !

## 🐛 Résolution de problèmes

### "SMTP connect() failed"
- Vérifie que `SMTP_USERNAME` et `SMTP_PASSWORD` sont corrects
- Pour Gmail : Assure-toi d'utiliser un mot de passe d'application, pas ton mot de passe Gmail
- Vérifie que le port est correct (2525 pour Mailtrap, 587 pour Gmail)

### "Could not authenticate"
- **Mailtrap** : Vérifie les credentials dans ton inbox Mailtrap
- **Gmail** : Régénère un nouveau mot de passe d'application

### Les emails ne partent pas
- Vérifie que `EMAIL_MODE` est bien défini sur `'smtp'`
- Redémarre le serveur PHP : Ctrl+C puis `cd api && php -S localhost:8000`
- Regarde les erreurs dans le terminal

### Je veux revenir au mode DEBUG
```php
define('EMAIL_MODE', 'debug'); // Dans config.local.php
```

## 📚 Ressources

- **Mailtrap** : [https://mailtrap.io](https://mailtrap.io)
- **Gmail App Passwords** : [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- **PHPMailer Documentation** : [https://github.com/PHPMailer/PHPMailer](https://github.com/PHPMailer/PHPMailer)
