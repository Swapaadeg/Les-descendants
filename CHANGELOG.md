# Changelog - Les Descendants (Arki'Family)

Tous les changements notables de ce projet seront documentés dans ce fichier.

## [Unreleased] - 2026-01-05

### 🔒 Security

- **CRITIQUE**: Migration des credentials vers variables d'environnement
  - Ajout de `api/.env` pour les credentials réels
  - Ajout de `api/.env.example` comme template
  - Modification de `api/config.local.php` pour charger depuis .env
  - Mise à jour `.gitignore` pour exclure les fichiers sensibles
- **CRITIQUE**: Suppression des fichiers exposant des informations sensibles
  - Supprimé `api/middleware/auth.php.backup` (ancien JWT secret)
  - Supprimé `api/scripts/test-auth.php` (expose détails authentification)
  - Supprimé `api/scripts/test-cors.php` (expose configuration CORS)
- Suppression des logs de tokens dans `src/services/api.js`

### ♻️ Refactoring

#### Réorganisation des Fichiers

- **Scripts de déploiement**: Déplacés vers `scripts/deployment/`
  - deploy.sh, deploy.ps1
  - cleanup-prod.sh, cleanup-prod.bat
  - start-server.bat

- **Base de données**: Réorganisation sous `api/database/`
  - Schémas SQL dans `api/database/schema/`
  - Migrations dans `api/database/migrations/`
  - Mise à jour des chemins dans les scripts de migration

#### Standardisation des Composants

Tous les composants et pages suivent maintenant la convention **Folder + index.js**:

- **Composants**:
  - Skeleton, TribeSelector

- **Pages racine** (7 fichiers restructurés):
  - Dashboard, Home, Login, Register
  - TribesListPage, UserProfile, VerifyEmail

- **Pages Legal** (3 fichiers):
  - CGU, MentionsLegales, PolitiqueConfidentialite

- **Pages Events** (4 fichiers + SCSS):
  - CreateEvent, EditEvent, EventDetail, EventsList

- **Pages Admin** (2 pages + 3 composants):
  - AdminDashboard, TribesManagement
  - components/AdminLayout, components/StatsCard, components/TribeCard

- **Pages Tribe**:
  - TribePage/TribePage, TribePage/PublicTribePage
  - TribeCustomization/TribeCustomization

### ✨ Features

- **Changement d'email**: Implémentation complète dans UserProfile
  - API call fonctionnel vers `userAPI.changeEmail()`
  - Validation et gestion d'erreurs
  - Message de succès avec instruction de vérification

- **Changement de mot de passe**: Implémentation complète dans UserProfile
  - API call fonctionnel vers `userAPI.changePassword()`
  - Validation (correspondance, longueur minimale)
  - Gestion d'erreurs complète

- **ConfirmModal**: Nouveau composant réutilisable
  - Remplace les confirm() natifs
  - Design cohérent avec l'application
  - Options personnalisables (danger mode, textes custom)
  - Animation et overlay

### 🧹 Cleanup

- Supprimé `database.sql` de la racine (duplicate)
- Supprimé `src/assets/react.svg` (logo Vite non utilisé)
- Supprimé `src/lib/` (répertoire vide)
- Nettoyage des console.log dans les fichiers critiques:
  - `src/services/api.js` (logs de tokens)
  - `src/pages/TribePage/TribePage.jsx`

### 🐛 Bug Fixes

- Correction des imports SCSS après restructuration (Events + Admin)
- Correction des imports JSX après restructuration (Login)
- Amélioration de la gestion d'erreurs dans TribePage
  - Remplacé console.error par setError()
  - Messages d'erreur utilisateur friendly

### 📝 Documentation

- Ajout de `AUDIT_SUMMARY.md` - Rapport complet d'audit
- Ajout de `CHANGELOG.md` - Ce fichier
- Mise à jour `.gitignore` avec documentation des exclusions

---

## Structure des Composants

### Avant
```
src/components/
  - TribeSelector.jsx
src/pages/
  - Dashboard.jsx
  - Home.jsx
```

### Après
```
src/components/
  - TribeSelector/
    - TribeSelector.jsx
    - TribeSelector.scss
    - index.js
src/pages/
  - Dashboard/
    - Dashboard.jsx
    - index.js
  - Home/
    - Home.jsx
    - index.js
```

---

## Migration Guide

### Pour les Développeurs

**Imports de composants**:
```javascript
// ✅ Maintenant
import ComponentName from '@/components/ComponentName';

// ❌ Avant
import ComponentName from '@/components/ComponentName/ComponentName';
```

**Variables d'environnement**:
```bash
# Copier le template
cp api/.env.example api/.env

# Remplir avec vos credentials réels
# Ne JAMAIS commit api/.env
```

**Migrations de base de données**:
```bash
# Nouveau chemin
php api/database/migrations/run_migrations.php

# ❌ Ancien chemin (ne fonctionne plus)
php api/migrations/run_migrations.php
```

---

## Notes de Version

### Compatibilité

- ✅ React 19.2.0
- ✅ Vite 7.2.4
- ✅ PHP 7.4+
- ✅ MySQL 5.7+

### Changements Breaking

⚠️ **IMPORTANT**: Cette mise à jour contient des changements de structure importants.

1. **Base de données**: Les chemins de migrations ont changé
   - Mettre à jour vos scripts de déploiement

2. **Variables d'environnement**: Configuration requise
   - Le fichier `api/.env` est maintenant requis
   - Copier `.env.example` et remplir les valeurs

3. **Imports**: Les imports de composants peuvent casser
   - Vérifier tous les imports après mise à jour
   - Utiliser le format `from './ComponentName'` sans répétition

### Prochaines Étapes (TODO)

- [ ] Finaliser nettoyage console.log (~40 restants)
- [ ] Remplacer alert()/confirm() par ConfirmModal (5 fichiers)
- [ ] Corriger imports JSX restants après restructuration (~17 fichiers)
- [ ] Tests E2E complets
- [ ] Documentation API complète

---

## Contributeurs

- Claude Sonnet 4.5 (Anthropic) - Audit et refactoring
- Marie - Product Owner

---

## Liens

- [Rapport d'audit complet](AUDIT_SUMMARY.md)
- [Structure du projet](README.md)
