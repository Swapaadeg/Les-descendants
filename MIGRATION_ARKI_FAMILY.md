# Migration vers Arki'Family - Guide Complet

## ⚠️ IMPORTANT - À LIRE AVANT DE COMMENCER

Cette migration va transformer "Les Descendants" en "Arki'Family", un système multi-tribus.

**Données conservées:**
- ✅ Tous tes dinosaures existants
- ✅ Toutes les photos uploadées
- ✅ Les stats et mutations

**Ce qui change:**
- Nouveau système d'authentification
- Gestion multi-tribus
- Panel d'administration
- Pages de tribus personnalisables

---

## 📋 Prérequis

- [ ] Sauvegarde complète de la base de données actuelle
- [ ] Accès à PHPMyAdmin ou terminal MySQL
- [ ] Accès SSH ou terminal sur le serveur
- [ ] Un email valide pour ton compte admin

---

## 🚀 Étapes de migration

### Étape 1: Sauvegarde de la base actuelle

**Via PHPMyAdmin:**
1. Ouvre PHPMyAdmin
2. Sélectionne `sc5jewe1253_ark-tracker`
3. Onglet "Exporter"
4. Choisis "Rapide" et format SQL
5. Télécharge le fichier de sauvegarde
6. **Garde ce fichier précieusement !**

**Via terminal:**
```bash
mysqldump -u sc5jewe1253_swap -p sc5jewe1253_ark-tracker > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### Étape 2: Configuration du script de migration

1. Ouvre `api/migrate_to_arki_family.php`
2. Modifie les constantes suivantes:

```php
const ADMIN_CONFIG = [
    'email' => 'ton-email@example.com',        // ← TON EMAIL ICI
    'username' => 'Marie',                      // ← TON PSEUDO ICI
    'password' => 'MotDePasseTemporaire123!',   // ← MOT DE PASSE TEMPORAIRE
];
```

**⚠️ Notes importantes:**
- Utilise un vrai email (pour la récupération de mot de passe)
- Choisis un mot de passe temporaire fort
- Tu pourras le changer après la première connexion

---

### Étape 3: Application du nouveau schéma

**Option A: Via PHPMyAdmin**
1. Ouvre PHPMyAdmin
2. Sélectionne `sc5jewe1253_ark-tracker`
3. Onglet "SQL"
4. Copie TOUT le contenu de `api/database_arki_family.sql`
5. Colle dans la zone de texte
6. Clique sur "Exécuter"

**Option B: Via terminal**
```bash
cd api
mysql -u sc5jewe1253_swap -p sc5jewe1253_ark-tracker < database_arki_family.sql
```

**Résultat attendu:**
- 8 nouvelles tables créées
- Table `dinosaurs` renommée en `dinosaurs_old`
- Nouvelle table `dinosaurs` créée
- 2 vues créées
- 3 triggers créés

---

### Étape 4: Exécution de la migration des données

**Via terminal (recommandé):**
```bash
cd api
php migrate_to_arki_family.php
```

**Via navigateur:**
Accède à: `https://les-descendants.sc5jewe1253.universe.wf/api/migrate_to_arki_family.php`

**Sortie attendue:**
```
[INFO] 14:30:15 - Connexion à la base de données réussie
[INFO] 14:30:15 - Début de la migration...

[INFO] 14:30:15 - ÉTAPE 1: Création de l'utilisateur admin
[✓] 14:30:15 - Utilisateur admin créé (ID: 1)
[⚠] 14:30:15 - Email: ton-email@example.com
[⚠] 14:30:15 - Mot de passe temporaire: MotDePasseTemporaire123!

[INFO] 14:30:15 - ÉTAPE 2: Création de la tribu 'Les Descendants'
[✓] 14:30:15 - Tribu créée (ID: 1)

[INFO] 14:30:15 - ÉTAPE 3: Ajout de l'admin comme owner de la tribu
[✓] 14:30:15 - Admin ajouté comme owner de la tribu

[INFO] 14:30:15 - ÉTAPE 4: Migration des dinosaures existants
[INFO] 14:30:15 - 42 dinosaure(s) à migrer...
[✓] 14:30:16 - Migration terminée: 42/42 dinosaure(s) migré(s)

=== STATISTIQUES FINALES ===
[INFO] Utilisateurs: 1
[INFO] Tribus: 1
[INFO] Dinosaures: 42

🎉 MIGRATION TERMINÉE AVEC SUCCÈS!
```

---

### Étape 5: Vérification

1. **Connecte-toi à PHPMyAdmin**
2. Vérifie les tables suivantes:
   - `users` → 1 ligne (toi)
   - `tribes` → 1 ligne ("Les Descendants")
   - `tribe_members` → 1 ligne (toi en owner)
   - `dinosaurs` → X lignes (tous tes dinos)
   - `dinosaurs_old` → X lignes (anciens dinos - backup)

3. **Note les informations de connexion:**
   - Email: `ton-email@example.com`
   - Mot de passe temporaire: `MotDePasseTemporaire123!`

---

### Étape 6: Sécurité post-migration

**1. Supprimer le script de migration (important !)**
```bash
rm api/migrate_to_arki_family.php
```
Ou via FTP: supprime `migrate_to_arki_family.php`

**2. Vérifier les permissions**
```bash
chmod 644 api/database_arki_family.sql
```

**3. Ajouter au .gitignore**
Le script ne devrait jamais être committé avec tes vraies infos !

---

## 🧪 Tests à effectuer

Après la migration, teste les points suivants:

### Frontend (provisoire - ancien code)
- [ ] Le site affiche toujours tes dinos
- [ ] Les photos sont toujours visibles
- [ ] Les stats s'affichent correctement
- [ ] Les mutations sont préservées

**Note:** Le frontend actuel continuera de fonctionner car il utilise l'ancienne API. On va l'adapter progressivement.

### Backend (nouvelle structure)
- [ ] Table `users` contient ton compte
- [ ] Table `tribes` contient "Les Descendants"
- [ ] Table `dinosaurs` contient tous tes dinos avec le bon `tribe_id`
- [ ] Toutes les clés étrangères sont correctes

---

## 🔄 Rollback (en cas de problème)

Si quelque chose se passe mal, tu peux revenir en arrière:

**1. Restaurer la sauvegarde**
```bash
mysql -u sc5jewe1253_swap -p sc5jewe1253_ark-tracker < backup_YYYYMMDD_HHMMSS.sql
```

Ou via PHPMyAdmin:
1. Vide la base de données
2. Onglet "Importer"
3. Choisis ton fichier de sauvegarde
4. Importe

**2. Vérifier que tout fonctionne**
Le site devrait refonctionner comme avant.

---

## 📝 Après la migration réussie

Une fois que tu as vérifié que tout fonctionne:

1. **Ne supprime PAS `dinosaurs_old` immédiatement**
   - Garde-la 1-2 semaines par sécurité
   - Elle sera supprimée automatiquement plus tard

2. **Change ton mot de passe**
   - Dès que le frontend d'authentification sera prêt
   - Utilise un mot de passe fort

3. **Prochaines étapes du développement:**
   - Phase 1: API d'authentification
   - Phase 2: Frontend login/register
   - Phase 3: Gestion des tribus
   - Phase 4: Panel admin
   - Phase 5: Personnalisation

---

## ❓ FAQ / Troubleshooting

### Erreur: "Table 'users' already exists"
➡️ La migration a déjà été exécutée. Vérifie les données avec PHPMyAdmin.

### Erreur: "Foreign key constraint fails"
➡️ Les tables n'ont pas été créées dans le bon ordre. Supprime toutes les nouvelles tables et recommence.

### Les photos ne s'affichent plus
➡️ Les URLs des photos sont préservées. Vérifie:
1. Que le dossier `api/uploads/` existe
2. Que les permissions sont correctes (755)
3. Que les chemins dans la base sont corrects

### Le script de migration tourne en boucle
➡️ Annule avec Ctrl+C. Vérifie:
1. Que la connexion DB est OK
2. Que les tables n'existent pas déjà
3. Les logs d'erreur PHP

---

## 📞 Support

En cas de problème:
1. Vérifie les logs PHP: `/logs/error.log`
2. Vérifie les logs MySQL dans PHPMyAdmin
3. Garde toujours ta sauvegarde à portée de main
4. Ne panique pas, tout est réversible !

---

## ✅ Checklist complète

- [ ] Sauvegarde de la base de données effectuée
- [ ] Configuration du script de migration avec mes infos
- [ ] Schéma SQL appliqué (8 tables créées)
- [ ] Script de migration exécuté avec succès
- [ ] Vérification des données dans PHPMyAdmin
- [ ] Notes des credentials admin
- [ ] Script de migration supprimé du serveur
- [ ] Tests frontend OK
- [ ] `dinosaurs_old` conservée temporairement

**Date de migration:** ___/___/______

**Problèmes rencontrés:** _____________________

**Notes:** _____________________

---

🎉 **Bravo ! Tu es prête pour développer Arki'Family !**
