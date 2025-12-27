# Guide de déploiement sur o2switch

Ce guide vous explique comment déployer votre tracker ARK sur votre hébergement o2switch.

## Prérequis

- Un compte o2switch actif
- Accès à cPanel
- Accès FTP (FileZilla ou client FTP intégré à cPanel)

---

## Étape 1: Créer la base de données MySQL

### 1.1 Accéder à PHPMyAdmin

1. Connectez-vous à votre **cPanel** o2switch
2. Dans la section **Bases de données**, cliquez sur **PHPMyAdmin**

### 1.2 Créer une nouvelle base de donnéesJe vais corriger la liste en supprimant les doublons et en ajoutant les créatures manquantes:

1. Dans PHPMyAdmin, cliquez sur **Nouvelle base de données** (ou "New" en anglais)
2. Donnez un nom à votre base (ex: `ark_tracker`)
3. Choisissez l'encodage: **utf8mb4_unicode_ci**
4. Cliquez sur **Créer**

### 1.3 Exécuter le script SQL

1. Sélectionnez votre nouvelle base de données dans le menu de gauche
2. Cliquez sur l'onglet **SQL**
3. Copiez-collez le contenu du fichier `database.sql` (à la racine du projet)
4. Cliquez sur **Exécuter**

✅ Votre table `dinosaurs` est maintenant créée!

### 1.4 Noter les identifiants

Notez ces informations (vous en aurez besoin):
- **Nom de la base**: votre_nom_de_base
- **Utilisateur**: généralement préfixé par votre nom de domaine
- **Mot de passe**: celui que vous avez défini
- **Hôte**: `localhost` (dans 99% des cas chez o2switch)

---

## Étape 2: Configurer l'API PHP

### 2.1 Modifier le fichier de configuration

Dans le fichier `api/config.php`, remplacez les lignes 21-24:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'votre_nom_de_base');      // ← Remplacez
define('DB_USER', 'votre_utilisateur');       // ← Remplacez
define('DB_PASS', 'votre_mot_de_passe');      // ← Remplacez
```

Par vos vrais identifiants de base de données.

---

## Étape 3: Builder l'application React

### 3.1 Modifier l'URL de l'API

Dans le fichier `.env.local`, remplacez:

```
VITE_API_URL=https://votre-domaine.com/api
```

Par votre vraie URL (ex: `https://mon-site-ark.com/api`)

### 3.2 Builder l'application

Ouvrez un terminal dans le dossier du projet et exécutez:

```bash
npm run build
```

Cela va créer un dossier `dist/` avec tous les fichiers optimisés.

---

## Étape 4: Uploader les fichiers sur o2switch

### Option A: Via FileZilla (Recommandé)

1. **Téléchargez FileZilla** (si pas déjà fait)
2. **Connectez-vous** avec vos identifiants FTP o2switch:
   - Hôte: `ftp.votre-domaine.com` ou l'IP fournie par o2switch
   - Utilisateur: votre login FTP
   - Mot de passe: votre mot de passe FTP
   - Port: 21

3. **Uploadez les fichiers**:
   - Allez dans le dossier `public_html/` sur le serveur (colonne de droite)
   - Uploadez TOUT le contenu du dossier `dist/` dans `public_html/`
   - Uploadez le dossier `api/` à la racine de `public_html/`

Structure finale sur le serveur:
```
public_html/
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-xyz789.css
│   └── ...
└── api/
    ├── config.php
    ├── dinosaurs.php
    └── uploads/
```

### Option B: Via le gestionnaire de fichiers cPanel

1. Dans cPanel, allez dans **Gestionnaire de fichiers**
2. Naviguez vers `public_html/`
3. Uploadez les fichiers un par un ou créez une archive ZIP et extrayez-la

---

## Étape 5: Configurer les permissions

### 5.1 Permissions du dossier uploads

Le dossier `api/uploads/` doit être accessible en écriture:

1. Dans FileZilla ou le gestionnaire de fichiers
2. Clic droit sur le dossier `api/uploads/`
3. Permissions → `755` (ou cochez: lecture/écriture/exécution pour propriétaire)

---

## Étape 6: Tester votre site

### 6.1 Accéder au site

Ouvrez votre navigateur et allez sur: `https://votre-domaine.com`

### 6.2 Vérifier que tout fonctionne

- [ ] Le site s'affiche correctement
- [ ] Vous pouvez ajouter un dinosaure
- [ ] L'upload de photo fonctionne
- [ ] La modification des stats fonctionne
- [ ] La suppression fonctionne

---

## Dépannage

### Erreur "Erreur de connexion à la base de données"

**Cause**: Identifiants MySQL incorrects

**Solution**:
1. Vérifiez `api/config.php` (lignes 21-24)
2. Vérifiez dans cPanel → Bases de données MySQL que votre utilisateur a accès à la base

### Erreur "Failed to fetch" ou CORS

**Cause**: Problème de cross-origin ou URL incorrecte

**Solution**:
1. Vérifiez que `.env.local` a la bonne URL (avec https://)
2. Rebuilder l'app: `npm run build`
3. Re-uploader les fichiers du dossier `dist/`

### Les images ne s'affichent pas

**Cause**: Permissions incorrectes sur le dossier uploads

**Solution**:
1. Vérifiez les permissions du dossier `api/uploads/` (755)
2. Vérifiez que le fichier `.htaccess` est bien présent dans `api/uploads/`

### Erreur 500 sur l'API

**Cause**: Erreur PHP

**Solution**:
1. Activez l'affichage des erreurs temporairement dans `api/config.php`:
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```
2. Consultez les logs d'erreur dans cPanel → Erreurs
3. Corrigez l'erreur
4. Désactivez l'affichage des erreurs en production

---

## Sécurité en production

Une fois que tout fonctionne, pour sécuriser votre site:

### 1. Désactiver l'affichage des erreurs

Dans `api/config.php`, ligne 7-8, remplacez par:
```php
error_reporting(0);
ini_set('display_errors', 0);
```

### 2. Protéger config.php

Créez un fichier `.htaccess` dans le dossier `api/`:

```apache
<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>
```

### 3. Limiter les types de fichiers uploadés

C'est déjà fait dans `api/dinosaurs.php` (lignes 205-208), mais vérifiez que seuls les formats image sont autorisés.

---

## Mise à jour du site

Pour mettre à jour votre site après des modifications:

1. Modifiez le code localement
2. Testez en local (`npm run dev`)
3. Rebuilder: `npm run build`
4. Uploader uniquement les fichiers modifiés du dossier `dist/` vers `public_html/`

**Note**: Pas besoin de re-uploader le dossier `api/` si vous n'avez modifié que le frontend React.

---

## Support

Si vous rencontrez des problèmes:

1. **Vérifiez les logs**: cPanel → Erreurs
2. **Console navigateur**: F12 → Console (pour les erreurs JavaScript)
3. **Support o2switch**: Ils sont réactifs et peuvent vous aider avec les problèmes serveur

---

Votre tracker ARK est maintenant en ligne! 🦖✨
