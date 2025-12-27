# Guide de déploiement rapide sur o2switch

## URL de votre site
`https://les-descendants.sc5jewe1253.universe.wf`

## Étapes de déploiement

### 1. Créer la base de données MySQL sur o2switch

1. Connectez-vous à votre **cPanel o2switch**
2. Allez dans **Bases de données MySQL**
3. Créez une nouvelle base de données (ex: `ark_tracker`)
4. Créez un utilisateur MySQL avec un mot de passe
5. Ajoutez l'utilisateur à la base de données avec tous les privilèges
6. **Notez ces informations** (vous en aurez besoin):
   - Nom de la base
   - Nom d'utilisateur
   - Mot de passe

### 2. Importer la structure de la base de données

1. Allez dans **PHPMyAdmin** depuis cPanel
2. Sélectionnez votre base de données
3. Cliquez sur l'onglet **SQL**
4. Copiez-collez le contenu du fichier `database.sql` (à la racine de ce projet)
5. Cliquez sur **Exécuter**

### 3. Configurer l'API pour la production

1. Ouvrez le fichier `C:\wamp64\www\api\config.production.php`
2. Modifiez les lignes avec vos identifiants o2switch (que vous avez notés à l'étape 1):

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'votre_nom_de_base');      // Remplacez avec le nom créé dans cPanel
define('DB_USER', 'votre_utilisateur');       // Remplacez avec l'utilisateur MySQL
define('DB_PASS', 'votre_mot_de_passe');      // Remplacez avec le mot de passe
```

3. Sauvegardez le fichier

**Note**: Ne touchez PAS au `config.php` - il est pour WAMP en local!

### 4. Uploader l'API sur o2switch

#### Via FileZilla (Recommandé):

1. Téléchargez **FileZilla** si pas déjà fait
2. Connectez-vous avec vos identifiants FTP o2switch
3. Naviguez vers le dossier: `les-descendants.sc5jewe1253.universe.wf/public`
4. Créez un dossier `api` s'il n'existe pas
5. Uploadez **tous les fichiers** du dossier `C:\wamp64\www\api\` dans le dossier `api/` sur le serveur:
   - `dinosaurs.php`
   - `config.production.php`
   - `database.sql`
   - Le dossier `uploads/` (créez-le s'il n'existe pas)
6. **Sur le serveur**, renommez `config.production.php` en `config.php`

Structure finale sur le serveur:
```
public/
└── api/
    ├── config.php
    ├── dinosaurs.php
    └── uploads/
```

### 5. Configurer les permissions

1. Dans FileZilla, clic droit sur le dossier `api/uploads/`
2. **Permissions** → `755`
3. Cochez "Appliquer aux sous-dossiers"

### 6. Activer le SSL (HTTPS)

1. Dans cPanel, allez dans **SSL/TLS**
2. Cliquez sur **Gérer les sites SSL**
3. Activez le certificat SSL gratuit (Let's Encrypt) pour `les-descendants.sc5jewe1253.universe.wf`
4. Attendez quelques minutes que le certificat soit actif

### 7. Tester l'API

Ouvrez votre navigateur et testez:
```
https://les-descendants.sc5jewe1253.universe.wf/api/dinosaurs.php
```

Vous devriez voir `[]` (tableau vide) ou vos dinosaures en JSON.

---

## Prochaine étape: Application Android

Une fois l'API déployée et fonctionnelle, on pourra créer l'application Android avec Capacitor.
