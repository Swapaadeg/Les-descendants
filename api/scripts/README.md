# 🛠️ Scripts Utilitaires API

Ce dossier contient tous les scripts PHP utilitaires pour la maintenance et les tests de l'API.

## 📋 Scripts de Test

### Tests d'authentification
- **test-auth.php** - Test du système d'authentification
- **debug_auth.php** - Debug des problèmes d'auth
- **test-cors.php** - Test de la configuration CORS

### Tests des tribus
- **test_tribes_api_full.php** - Test complet de l'API tribus
- **test_tribes_query.php** - Test des requêtes tribus
- **test_my_tribe.php** - Test de la tribu de l'utilisateur
- **test_tribe_requests.php** - Test des demandes d'adhésion
- **check_all_tribes.php** - Vérification de toutes les tribus
- **check_tribe_images.php** - Vérification des images des tribus
- **check_tribe_public.php** - Vérification de la visibilité publique

### Tests des dinosaures
- **test_api_response.php** - Test des réponses API dinos
- **test_full_update.php** - Test de la mise à jour complète
- **test_update_dino.php** - Test de la mise à jour d'un dino
- **list_dinos.php** - Liste tous les dinosaures

## 🔧 Scripts de Maintenance

### Gestion des utilisateurs
- **set_admin.php** - Définir un utilisateur comme admin
- **reset_admin_password.php** - Réinitialiser le mot de passe admin

### Gestion des tribus
- **set_tribe_owner.php** - Définir le propriétaire d'une tribu

### Migrations
- **migrate_to_arki_family.php** - Migration complète vers Arki'Family
- **run_migration_010.php** - Exécution de la migration 010
- **run_featured_migration.php** - Migration du featured system
- **add_request_message_column.php** - Ajout de la colonne request_message

## ⚠️ Attention

Ces scripts sont à utiliser avec précaution. Certains modifient la base de données directement.

### Utilisation typique

```bash
cd api/scripts
php nom_du_script.php
```

## 🔐 Sécurité

**Ne jamais exposer ces scripts en production !** Ils sont uniquement pour le développement et la maintenance en local/serveur sécurisé.
