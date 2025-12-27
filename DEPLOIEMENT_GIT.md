# Déploiement sur o2switch via Git - Guide Complet

URL du site: `https://les-descendants.sc5jewe1253.universe.wf`

---

## ✅ Étape 1: Préparation du projet en local

### 1.1 Configuration du .gitignore
✅ Déjà fait! Le `.gitignore` est configuré pour:
- Ignorer `api/config.php` (contient les mots de passe)
- Ignorer `api/uploads/*` (les photos uploadées)
- Ignorer `.env.local`

### 1.2 Gestion des fichiers nécessaires
✅ Déjà fait! Structure du projet:
```
les-descendants/
├── src/              # Code React
├── public/           # Fichiers statiques
├── api/              # API PHP
│   ├── config.example.php  # Template de config (committé)
│   ├── config.php          # Config réelle (ignoré par Git)
│   ├── dinosaurs.php
│   ├── database.sql
│   ├── .htaccess
│   └── uploads/
├── .htaccess         # Config Apache pour React Router
├── .gitignore
└── package.json
```

### 1.3 Build de l'application React
```bash
cd c:\Users\marie\les-descendants
npm run build
```

Cela crée un dossier `dist/` avec les fichiers optimisés.

---

## ✅ Étape 2: Préparation de l'hébergement o2switch

### 2.1 Création d'une clé SSH sur l'hébergement

1. Connectez-vous à votre **cPanel o2switch**
2. Allez dans **Terminal** ou **SSH Access**
3. Générez une clé SSH:
```bash
ssh-keygen -t rsa -b 4096 -C "votre-email@example.com"
```
4. Appuyez sur Entrée pour accepter l'emplacement par défaut
5. Entrez un mot de passe (optionnel mais recommandé)
6. Affichez votre clé publique:
```bash
cat ~/.ssh/id_rsa.pub
```
7. **Copiez cette clé** (tout le contenu affiché)

### 2.2 Importation de la clé SSH sur GitHub

1. Allez sur **GitHub.com** → Votre profil → **Settings**
2. Cliquez sur **SSH and GPG keys** (dans le menu de gauche)
3. Cliquez sur **New SSH key**
4. **Title**: `o2switch - Les Descendants`
5. **Key**: Collez la clé copiée à l'étape précédente
6. Cliquez sur **Add SSH key**

### 2.3 Tester la connexion SSH
Depuis le terminal o2switch:
```bash
ssh -T git@github.com
```

Vous devriez voir: `Hi username! You've successfully authenticated`

### 2.4 Création d'un sous-domaine
✅ Déjà fait! Sous-domaine: `les-descendants.sc5jewe1253.universe.wf`

### 2.5 Création de la BDD et utilisateur associé
✅ Déjà fait!
- Base: `sc5jewe1253_ark-tracker`
- User: `sc5jewe1253_swap`
- Pass: `Nidoking63450`

---

## ✅ Étape 3: Importation et configuration du projet

### 3.1 Connexion SSH à o2switch

```bash
ssh votre-utilisateur@votre-serveur.o2switch.net
```

### 3.2 Aller dans le dossier du sous-domaine

```bash
cd les-descendants.sc5jewe1253.universe.wf/public
```

### 3.3 Git Clone du projet

**Option A: Si votre repo est public**
```bash
git clone https://github.com/VOTRE-USERNAME/les-descendants.git .
```

**Option B: Si votre repo est privé (avec SSH)**
```bash
git clone git@github.com:VOTRE-USERNAME/les-descendants.git .
```

**Note**: Le `.` à la fin clone directement dans le dossier actuel.

### 3.4 Installation des dépendances Node.js (si nécessaire)

**Note**: Pour ce projet, vous n'avez PAS besoin d'installer les dépendances sur le serveur car vous déployez le build (`dist/`).

### 3.5 Configuration du fichier config.php de l'API

```bash
cd api
cp config.example.php config.php
nano config.php
```

Modifiez les lignes:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sc5jewe1253_ark-tracker');
define('DB_USER', 'sc5jewe1253_swap');
define('DB_PASS', 'Nidoking63450');
```

Sauvegardez: `Ctrl+O`, Entrée, puis `Ctrl+X`

### 3.6 Permissions du dossier uploads

```bash
chmod 755 uploads/
```

### 3.7 Importer la structure de la base de données

1. Allez dans **PHPMyAdmin** depuis cPanel
2. Sélectionnez votre base `sc5jewe1253_ark-tracker`
3. Onglet **SQL**
4. Uploadez ou collez le contenu de `api/database.sql`
5. Cliquez sur **Exécuter**

---

## 🚀 Étape 4: Déploiement du build React

### Option A: Commiter et pusher le build (plus simple)

**Modification du .gitignore**:
1. Enlevez `dist` du `.gitignore` (ligne 11)
2. Committez et pushezfichier:
```bash
git add .
git commit -m "Build production"
git push origin main
```

3. Sur le serveur, faites un pull:
```bash
ssh votre-utilisateur@serveur.o2switch.net
cd les-descendants.sc5jewe1253.universe.wf/public
git pull
```

4. Déplacez le contenu de `dist/` à la racine:
```bash
mv dist/* .
mv dist/.* . 2>/dev/null || true
rm -rf dist/
```

### Option B: Upload FTP du build (si vous ne voulez pas commiter dist/)

1. Buildez en local: `npm run build`
2. Uploadez tout le contenu de `dist/` via FileZilla vers `/public`
3. L'API est déjà en place via Git

---

## ✅ Étape 5: Activer le SSL (HTTPS)

1. Dans cPanel → **SSL/TLS**
2. **Gérer les sites SSL**
3. Activez le certificat **Let's Encrypt** gratuit pour `les-descendants.sc5jewe1253.universe.wf`
4. Attendez 5-10 minutes

---

## 🧪 Étape 6: Tester le site

1. Accédez à: `https://les-descendants.sc5jewe1253.universe.wf`
2. Vérifiez que le site s'affiche
3. Testez l'API: `https://les-descendants.sc5jewe1253.universe.wf/api/dinosaurs.php`
4. Ajoutez un dinosaure pour tester l'upload

---

## 🔄 Mises à jour futures

### Pour mettre à jour le code:

1. **En local**:
```bash
git add .
git commit -m "Description des changements"
git push
```

2. **Sur le serveur**:
```bash
ssh user@serveur
cd les-descendants.sc5jewe1253.universe.wf/public
git pull
```

3. **Si modifications React** (rebuild nécessaire):
```bash
npm run build
# Puis uploadez dist/ ou committez-le
```

---

## ⚠️ Notes importantes

1. **Ne JAMAIS commiter le fichier `api/config.php`** (contient les mots de passe)
2. **Ne pas installer node_modules sur le serveur** (déployer seulement le build)
3. **Vérifier les permissions** du dossier `api/uploads/` (755)
4. **Sauvegarder régulièrement** la base de données via PHPMyAdmin

---

## 📱 Prochaine étape: Application Android

Une fois le site déployé et fonctionnel, vous pourrez créer l'application Android avec Capacitor qui pointera vers cette API en production.
