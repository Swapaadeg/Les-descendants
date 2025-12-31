# Migration Arki'Family - Test en LOCAL avec WAMP

Guide pour tester la migration sur ton PC avec WAMP avant de la faire en production.

---

## ✅ Prérequis

- [x] WAMP installé et démarré
- [ ] Icon WAMP verte (tous les services actifs)
- [ ] Accès à PHPMyAdmin local (`http://localhost/phpmyadmin`)

---

## 📋 Étape 1 : Créer la base de données locale

1. **Démarre WAMP** (icon verte)
2. **Ouvre PHPMyAdmin** : `http://localhost/phpmyadmin`
3. **Clique sur "Nouvelle base de données"**
4. **Nom** : `ark_tracker_local`
5. **Interclassement** : `utf8mb4_unicode_ci`
6. **Créer**

---

## 📋 Étape 2 : Importer les données actuelles (optionnel mais recommandé)

Cette étape permet de tester avec tes vrais dinosaures.

### Option A : Télécharger depuis o2switch

1. **Connecte-toi à PHPMyAdmin sur o2switch**
2. **Sélectionne** `sc5jewe1253_ark-tracker`
3. **Onglet "Exporter"**
4. **Méthode** : Rapide
5. **Format** : SQL
6. **Exécuter**
7. **Télécharge** le fichier `.sql`

### Option B : Via terminal SSH

```bash
ssh ton-user@serveur.o2switch.net
mysqldump -u sc5jewe1253_swap -p sc5jewe1253_ark-tracker > export_prod.sql
exit
```

Puis télécharge le fichier via FTP.

### Importer dans WAMP

1. **Ouvre PHPMyAdmin local** : `http://localhost/phpmyadmin`
2. **Sélectionne** `ark_tracker_local`
3. **Onglet "Importer"**
4. **Choisis** ton fichier `.sql` téléchargé
5. **Exécuter**

✅ Tu devrais maintenant avoir une copie exacte de ta base de production en local !

---

## 📋 Étape 3 : Configurer l'API locale

### 3.1 Créer un fichier config local

Crée `api/config.local.php` :

```php
<?php
/**
 * Configuration LOCALE pour WAMP
 * Ce fichier n'est jamais commité (déjà dans .gitignore)
 */

// Configuration BDD locale
define('DB_HOST', 'localhost');
define('DB_NAME', 'ark_tracker_local');
define('DB_USER', 'root');
define('DB_PASS', ''); // Généralement vide avec WAMP par défaut

// URL de base locale
define('BASE_URL', 'http://localhost/les-descendants');

// Mode debug
define('DEBUG_MODE', true);

// CORS pour développement local
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>
```

### 3.2 Modifier config.php pour détecter l'environnement

Édite `api/config.php` pour qu'il utilise le bon fichier :

```php
<?php
/**
 * Configuration principale - Détection automatique environnement
 */

// Détection de l'environnement
$isLocal = (
    $_SERVER['HTTP_HOST'] === 'localhost' ||
    strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false
);

// Charger la config appropriée
if ($isLocal && file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
} else {
    // Configuration PRODUCTION o2switch
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'sc5jewe1253_ark-tracker');
    define('DB_USER', 'sc5jewe1253_swap');
    define('DB_PASS', 'Nidoking63450');
    define('BASE_URL', 'https://les-descendants.sc5jewe1253.universe.wf');
    define('DEBUG_MODE', false);
}

// Configuration commune
date_default_timezone_set('Europe/Paris');
ini_set('display_errors', DEBUG_MODE ? 1 : 0);
error_reporting(DEBUG_MODE ? E_ALL : 0);
?>
```

### 3.3 Vérifier que l'API fonctionne

1. **Place le projet dans** : `C:\wamp64\www\les-descendants`
   (ou là où WAMP pointe)

2. **Teste l'API** : `http://localhost/les-descendants/api/dinosaurs.php`

Tu devrais voir tes dinosaures en JSON !

---

## 📋 Étape 4 : Configurer le script de migration

Édite `api/migrate_to_arki_family.php` :

```php
// Ligne 17-21, remplace par tes infos :
const ADMIN_CONFIG = [
    'email' => 'ton-email@example.com',        // ← TON VRAI EMAIL
    'username' => 'Marie',                      // ← TON PSEUDO
    'password' => 'TestLocal123!',              // ← Mot de passe de test
];
```

**Note** : Pour les tests locaux, tu peux mettre un faux email si tu veux.

---

## 📋 Étape 5 : Appliquer le nouveau schéma SQL

1. **Ouvre PHPMyAdmin local** : `http://localhost/phpmyadmin`
2. **Sélectionne** `ark_tracker_local`
3. **Onglet "SQL"**
4. **Copie TOUT le contenu** de `api/database_arki_family.sql`
5. **Colle et Exécute**

**Résultat attendu :**
```
✓ 8 nouvelles tables créées
✓ Table dinosaurs renommée en dinosaurs_old
✓ 2 vues créées
✓ 3 triggers créés
```

---

## 📋 Étape 6 : Exécuter la migration

### Via navigateur (plus simple)

1. **Ouvre ton navigateur**
2. **Va sur** : `http://localhost/les-descendants/api/migrate_to_arki_family.php`
3. **Observe les logs**

### Via terminal (recommandé)

```bash
cd C:\wamp64\www\les-descendants\api
php migrate_to_arki_family.php
```

**Sortie attendue :**

```
[INFO] 15:30:00 - Connexion à la base de données réussie
[INFO] 15:30:00 - Début de la migration...

[INFO] 15:30:00 - ÉTAPE 1: Création de l'utilisateur admin
[✓] 15:30:00 - Utilisateur admin créé (ID: 1)

[INFO] 15:30:00 - ÉTAPE 2: Création de la tribu 'Les Descendants'
[✓] 15:30:00 - Tribu créée (ID: 1)

[INFO] 15:30:00 - ÉTAPE 3: Ajout de l'admin comme owner de la tribu
[✓] 15:30:00 - Admin ajouté comme owner de la tribu

[INFO] 15:30:00 - ÉTAPE 4: Migration des dinosaures existants
[INFO] 15:30:00 - X dinosaure(s) à migrer...
[✓] 15:30:01 - Migration terminée: X/X dinosaure(s) migré(s)

🎉 MIGRATION TERMINÉE AVEC SUCCÈS!
```

---

## 📋 Étape 7 : Vérification

### Dans PHPMyAdmin

Vérifie que tu as :
- ✅ Table `users` : 1 ligne (toi)
- ✅ Table `tribes` : 1 ligne ("Les Descendants")
- ✅ Table `tribe_members` : 1 ligne (toi en owner)
- ✅ Table `dinosaurs` : X lignes (tes dinos avec tribe_id=1)
- ✅ Table `dinosaurs_old` : X lignes (backup)

### Structure attendue

**Table `users` :**
| id | email | username | is_admin |
|----|-------|----------|----------|
| 1  | ton-email@... | Marie | 1 |

**Table `tribes` :**
| id | name | slug | owner_id | is_validated |
|----|------|------|----------|--------------|
| 1  | Les Descendants | les-descendants | 1 | 1 |

**Table `tribe_members` :**
| id | tribe_id | user_id | role |
|----|----------|---------|------|
| 1  | 1 | 1 | owner |

**Table `dinosaurs` :**
| id | tribe_id | species | ... |
|----|----------|---------|-----|
| 1  | 1 | T-Rex | ... |
| 2  | 1 | Argentavis | ... |

---

## 📋 Étape 8 : Tester l'ancienne API (doit toujours fonctionner)

L'ancienne API pointe sur `dinosaurs_old` maintenant :

```bash
# Test
curl http://localhost/les-descendants/api/dinosaurs.php
```

❌ **Attendu** : Devrait retourner un tableau vide (normal, on a migré)

---

## 🎉 Migration locale réussie !

Si tout est OK, tu as maintenant :
- ✅ Nouvelle structure de BDD testée
- ✅ Tes données migrées
- ✅ Tout fonctionne en local

### Prochaines étapes

1. **Développer le backend** (API d'authentification)
2. **Tester en local** avec la nouvelle structure
3. **Quand tout est OK** → Migration en production

---

## 🔄 Recommencer de zéro (si besoin)

Si tu veux refaire la migration :

```sql
-- Dans PHPMyAdmin local
DROP DATABASE ark_tracker_local;
CREATE DATABASE ark_tracker_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Puis recommence depuis l'étape 2.

---

## ⚠️ Notes importantes

- ✅ Environnement local = zéro risque
- ✅ Tu peux casser et recommencer autant que tu veux
- ✅ Aucun impact sur le site en production
- ✅ Idéal pour développer la nouvelle API

---

## 📞 Problèmes courants

### WAMP icon orange/rouge
➡️ Un service ne démarre pas. Clique sur l'icon → Apache/MySQL → Service → Start

### "Can't connect to MySQL"
➡️ Vérifie que MySQL est démarré dans WAMP

### "Access denied for user 'root'"
➡️ Le mot de passe root WAMP n'est peut-être pas vide. Vérifie dans PHPMyAdmin → User accounts

### Les dinos ne migrent pas
➡️ Vérifie que `dinosaurs_old` existe et contient des données

---

🎯 **Tu es prête à tester ?** Dis-moi si tu as des questions !
