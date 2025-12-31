# Arki'Family - Plan de développement

## 🎯 Objectif
Transformer le tracker personnel "Les Descendants" en une plateforme multi-tribus "Arki'Family" avec système d'authentification, gestion de tribus et personnalisation.

---

## 📋 Fonctionnalités principales

### 1. Système d'authentification
- [ ] Inscription utilisateur (email, mot de passe, pseudo)
- [ ] Connexion / Déconnexion
- [ ] Récupération de mot de passe
- [ ] Validation d'email
- [ ] Système de sessions sécurisées (JWT ou sessions PHP)
- [ ] Hashage des mots de passe (bcrypt/argon2)

### 2. Gestion des tribus
- [ ] Création de tribu (nécessite validation admin)
- [ ] Rejoindre une tribu existante (nécessite validation du propriétaire)
- [ ] Un utilisateur = une tribu (ou possibilité d'en rejoindre plusieurs ?)
- [ ] Rôles : Propriétaire, Membre
- [ ] Liste des membres de la tribu
- [ ] Expulsion de membres (propriétaire uniquement)

### 3. Panel Admin
- [ ] Page d'administration (accès restreint)
- [ ] Validation/Rejet des nouvelles tribus
- [ ] Liste de toutes les tribus
- [ ] Statistiques globales
- [ ] Gestion des utilisateurs (bannissement, etc.)

### 4. Gestion des dinosaures par tribu
- [ ] Chaque tribu a sa propre liste de dinos
- [ ] Un dino ne peut être ajouté qu'une fois par tribu
- [ ] Modification/Suppression réservée aux membres de la tribu
- [ ] Filtres et recherche par tribu

### 5. Pages de tribu personnalisables
- [ ] Page publique de tribu (visible par utilisateurs connectés)
- [ ] Sélection du "Dino du mois"
- [ ] Upload de photo de base
- [ ] Description de la tribu
- [ ] Statistiques de la tribu (nombre de dinos, niveau moyen, etc.)
- [ ] Galerie de photos

### 6. Sécurité
- [ ] Protection CSRF
- [ ] Validation et sanitization des inputs
- [ ] Protection contre les injections SQL (prepared statements)
- [ ] Protection contre XSS
- [ ] Rate limiting (tentatives de connexion, API calls)
- [ ] Logs de sécurité
- [ ] HTTPS obligatoire en production

---

## 🗄️ Refonte de la base de données

### Tables nécessaires

#### `users`
```sql
- id (PK)
- email (unique)
- password_hash
- username (unique)
- created_at
- email_verified (boolean)
- verification_token
- reset_token
- is_admin (boolean)
- last_login
- is_banned (boolean)
```

#### `tribes`
```sql
- id (PK)
- name (unique)
- slug (unique, pour URL)
- description
- owner_id (FK → users.id)
- created_at
- is_validated (boolean)
- validated_at
- validated_by (FK → users.id, admin qui a validé)
- dino_of_month_id (FK → dinosaurs.id, nullable)
- base_photo_url
```

#### `tribe_members`
```sql
- id (PK)
- tribe_id (FK → tribes.id)
- user_id (FK → users.id)
- role (enum: owner, member)
- joined_at
- invited_by (FK → users.id, nullable)
- is_validated (boolean, pour demandes en attente)
```

#### `dinosaurs` (refonte)
```sql
- id (PK)
- tribe_id (FK → tribes.id)
- species
- type_ids (JSON ou table de liaison)
- stats (JSON)
- mutated_stats (JSON, nullable)
- is_mutated (boolean)
- photo_url
- created_at
- updated_at
- created_by (FK → users.id)
```

#### `tribe_join_requests`
```sql
- id (PK)
- tribe_id (FK → tribes.id)
- user_id (FK → users.id)
- message (texte de demande)
- status (enum: pending, accepted, rejected)
- requested_at
- processed_at
- processed_by (FK → users.id)
```

#### `tribe_creation_requests`
```sql
- id (PK)
- name
- description
- requested_by (FK → users.id)
- status (enum: pending, approved, rejected)
- requested_at
- processed_at
- processed_by (FK → users.id, admin)
- rejection_reason (nullable)
```

#### `sessions` (optionnel si JWT)
```sql
- id (PK)
- user_id (FK → users.id)
- token (unique)
- expires_at
- created_at
- ip_address
- user_agent
```

#### `activity_logs`
```sql
- id (PK)
- user_id (FK → users.id, nullable)
- action (type d'action)
- entity_type (tribe, dino, user, etc.)
- entity_id
- details (JSON)
- ip_address
- created_at
```

---

## 🏗️ Architecture technique

### Backend (API PHP)
```
api/
├── auth/
│   ├── register.php
│   ├── login.php
│   ├── logout.php
│   ├── verify-email.php
│   └── reset-password.php
├── tribes/
│   ├── create.php
│   ├── list.php
│   ├── get.php (détails d'une tribu)
│   ├── update.php
│   ├── join.php
│   ├── leave.php
│   └── members.php
├── dinosaurs/
│   ├── list.php (par tribu)
│   ├── create.php
│   ├── update.php
│   └── delete.php
├── admin/
│   ├── pending-tribes.php
│   ├── validate-tribe.php
│   ├── users.php
│   └── stats.php
├── middleware/
│   ├── auth.php (vérification token)
│   ├── admin.php (vérification admin)
│   └── tribe-member.php (vérification membre tribu)
└── utils/
    ├── database.php
    ├── security.php
    └── mailer.php
```

### Frontend (React)
```
src/
├── pages/
│   ├── Home.jsx (landing page)
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx (tableau de bord utilisateur)
│   ├── TribeList.jsx (liste des tribus)
│   ├── TribeDetail.jsx (page publique tribu)
│   ├── TribeManage.jsx (gestion de sa tribu)
│   ├── DinoList.jsx (liste dinos de la tribu)
│   ├── AdminPanel.jsx
│   └── Profile.jsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── tribe/
│   │   ├── TribeCard.jsx
│   │   ├── TribeHeader.jsx
│   │   ├── TribeMemberList.jsx
│   │   └── JoinRequestForm.jsx
│   └── layout/
│       ├── Header.jsx (avec menu utilisateur)
│       ├── Sidebar.jsx
│       └── Footer.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── TribeContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useTribe.js
│   └── useDinos.js
└── services/
    ├── authService.js
    ├── tribeService.js
    └── dinoService.js
```

---

## 🎨 Design / UX

### Pages principales
1. **Landing page** : Présentation d'Arki'Family, CTA inscription
2. **Login/Register** : Formulaires d'authentification
3. **Dashboard** : Vue d'ensemble (ma tribu, mes stats, notifications)
4. **Liste des tribus** : Voir toutes les tribus validées
5. **Page de tribu** : Infos publiques, dino du mois, galerie
6. **Gestion de tribu** : Paramètres, membres, demandes
7. **Liste de dinos** : Tracker actuel adapté par tribu
8. **Panel admin** : Validation tribus, modération

---

## 📦 Étapes de développement

### Phase 1 : Base technique
1. Refonte de la BDD (migration)
2. Système d'authentification
3. API de base (CRUD users, sessions)

### Phase 2 : Gestion des tribus
1. Création/validation de tribus
2. Système d'invitation/rejoindre
3. Gestion des membres

### Phase 3 : Adaptation des dinos
1. Migration des dinos existants vers système multi-tribus
2. Adaptation du tracker par tribu
3. Permissions et sécurité

### Phase 4 : Personnalisation
1. Pages de tribu customisables
2. Dino du mois
3. Galerie photos

### Phase 5 : Admin
1. Panel d'administration
2. Validation de tribus
3. Modération

### Phase 6 : Polish et sécurité
1. Tests de sécurité
2. Rate limiting
3. Logs et monitoring
4. Documentation

---

## ⚠️ Points d'attention

- **Migration des données** : Les dinos actuels de "Les Descendants" doivent être migrés vers la nouvelle structure
- **Rétrocompatibilité** : Possibilité de garder une version "solo" pour ceux qui ne veulent pas rejoindre de tribu ?
- **Performance** : Optimisation des requêtes avec joins multiples
- **Scalabilité** : Prévoir la croissance (indexation BDD, cache, etc.)
- **Emails** : Système d'envoi d'emails (vérification, notifications)
- **Stockage photos** : Gestion des uploads (limite taille, formats autorisés)

---

## 🚀 Déploiement

- Garder la branche `main` avec la version actuelle (Les Descendants)
- Développer sur `feature/arki-family`
- Tests sur environnement de staging
- Migration progressive en production
