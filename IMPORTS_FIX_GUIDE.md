# Guide de Correction des Imports

Ce guide vous aide à corriger rapidement tous les imports après la restructuration des composants.

## 🚨 Problème

Après la restructuration, les fichiers ont été déplacés dans des sous-dossiers. Les imports relatifs ne pointent plus vers les bons chemins.

**Exemple**:
```
Avant: src/pages/Login.jsx
Après: src/pages/Login/Login.jsx
```

Les imports dans Login.jsx qui étaient `../components/Header` doivent maintenant être `../../components/Header` (un niveau de plus).

---

## ⚡ Solution Rapide - Script Automatique

### Option 1: PowerShell (Windows)

```powershell
# Sauvegarder ce script dans fix-imports.ps1

$files = Get-ChildItem -Path "src/pages" -Recurse -Filter "*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false

    # Corriger les imports de composants
    if ($content -match "from '\.\./components/") {
        $content = $content -replace "from '\.\./components/", "from '../../components/"
        $changed = $true
    }

    # Corriger les imports de contexts
    if ($content -match "from '\.\./contexts/") {
        $content = $content -replace "from '\.\./contexts/", "from '../../contexts/"
        $changed = $true
    }

    # Corriger les imports de services
    if ($content -match "from '\.\./services/") {
        $content = $content -replace "from '\.\./services/", "from '../../services/"
        $changed = $true
    }

    # Corriger les imports de hooks
    if ($content -match "from '\.\./hooks/") {
        $content = $content -replace "from '\.\./hooks/", "from '../../hooks/"
        $changed = $true
    }

    # Corriger les imports de data
    if ($content -match "from '\.\./data/") {
        $content = $content -replace "from '\.\./data/", "from '../../data/"
        $changed = $true
    }

    # Corriger les imports de styles
    if ($content -match "import '\.\./styles/") {
        $content = $content -replace "import '\.\./styles/", "import '../../styles/"
        $changed = $true
    }

    if ($changed) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "✓ Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nDone! Please verify and test." -ForegroundColor Cyan
```

**Exécuter**:
```powershell
.\fix-imports.ps1
```

### Option 2: Bash (Linux/Mac/Git Bash)

```bash
#!/bin/bash
# Sauvegarder ce script dans fix-imports.sh

find src/pages -type f -name "*.jsx" | while read file; do
    # Créer une backup
    cp "$file" "$file.bak"

    # Corriger les imports
    sed -i "s|from '../components/|from '../../components/|g" "$file"
    sed -i "s|from '../contexts/|from '../../contexts/|g" "$file"
    sed -i "s|from '../services/|from '../../services/|g" "$file"
    sed -i "s|from '../hooks/|from '../../hooks/|g" "$file"
    sed -i "s|from '../data/|from '../../data/|g" "$file"
    sed -i "s|import '../styles/|import '../../styles/|g" "$file"

    echo "✓ Fixed: $file"
done

echo "Done! Backups saved with .bak extension"
```

**Exécuter**:
```bash
chmod +x fix-imports.sh
./fix-imports.sh
```

---

## 🔍 Liste des Fichiers à Corriger

### Pages Racine
- [ ] `src/pages/Dashboard/Dashboard.jsx`
- [ ] `src/pages/Home/Home.jsx`
- [ ] `src/pages/Login/Login.jsx` ✅ (déjà corrigé)
- [ ] `src/pages/Register/Register.jsx`
- [ ] `src/pages/TribesListPage/TribesListPage.jsx`
- [ ] `src/pages/UserProfile/UserProfile.jsx`
- [ ] `src/pages/VerifyEmail/VerifyEmail.jsx`

### Pages Legal
- [ ] `src/pages/Legal/CGU/CGU.jsx`
- [ ] `src/pages/Legal/MentionsLegales/MentionsLegales.jsx`
- [ ] `src/pages/Legal/PolitiqueConfidentialite/PolitiqueConfidentialite.jsx`

### Pages Events
- [ ] `src/pages/Events/CreateEvent/CreateEvent.jsx`
- [ ] `src/pages/Events/EditEvent/EditEvent.jsx`
- [ ] `src/pages/Events/EventDetail/EventDetail.jsx`
- [ ] `src/pages/Events/EventsList/EventsList.jsx`

### Pages Admin
- [ ] `src/pages/Admin/AdminDashboard/AdminDashboard.jsx`
- [ ] `src/pages/Admin/TribesManagement/TribesManagement.jsx`
- [ ] `src/pages/Admin/components/AdminLayout/AdminLayout.jsx`
- [ ] `src/pages/Admin/components/StatsCard/StatsCard.jsx`
- [ ] `src/pages/Admin/components/TribeCard/TribeCard.jsx`

### Pages Tribe
- [ ] `src/pages/TribePage/TribePage/TribePage.jsx`
- [ ] `src/pages/TribePage/PublicTribePage/PublicTribePage.jsx`
- [ ] `src/pages/TribeCustomization/TribeCustomization/TribeCustomization.jsx`

---

## 📋 Checklist Manuelle (Si Préféré)

Pour chaque fichier, chercher et remplacer:

1. **Imports de composants**:
   ```javascript
   // Chercher
   from '../components/
   // Remplacer par
   from '../../components/
   ```

2. **Imports de contexts**:
   ```javascript
   // Chercher
   from '../contexts/
   // Remplacer par
   from '../../contexts/
   ```

3. **Imports de services**:
   ```javascript
   // Chercher
   from '../services/
   // Remplacer par
   from '../../services/
   ```

4. **Imports de hooks**:
   ```javascript
   // Chercher
   from '../hooks/
   // Remplacer par
   from '../../hooks/
   ```

5. **Imports de styles**:
   ```javascript
   // Chercher
   import '../styles/
   // Remplacer par
   import '../../styles/
   ```

---

## ✅ Vérification

Après correction, vérifier que tout fonctionne:

```bash
# Test build
npm run build

# Si erreurs, chercher les imports restants
grep -r "from '\.\./components/" src/pages/
grep -r "from '\.\./contexts/" src/pages/
grep -r "from '\.\./services/" src/pages/
```

---

## 🚀 Cas Spéciaux

### Composants Admin

Les composants dans `src/pages/Admin/components/` ont besoin de **4 niveaux**:

```javascript
// ❌ Avant
from '../../../styles/
from '../../../components/

// ✅ Après
from '../../../../styles/
from '../../../components/  (peut rester si c'est un import entre admin components)
```

**Note**: Les imports SCSS dans Admin/components ont déjà été corrigés.

### TribeCustomization

Le fichier `TribeCustomization.jsx` a une structure imbriquée inhabituelle:
```
src/pages/TribeCustomization/TribeCustomization/TribeCustomization.jsx
```

Vérifier que les imports utilisent bien 3 niveaux `../../../`.

---

## 🐛 Troubleshooting

### Erreur: "Could not resolve '../components/Header'"

**Cause**: Import relatif incorrect après restructuration.

**Solution**: Ajouter un niveau `../../components/Header`

### Erreur: "Can't find stylesheet to import"

**Cause**: Import SCSS avec mauvais chemin relatif.

**Solution**: Ces erreurs ont normalement été corrigées. Si vous en voyez, vérifier que vous avez le bon nombre de `../`.

### Build réussit mais runtime erreur

**Cause**: Import dynamique ou conditionnel non corrigé.

**Solution**: Chercher `require()` ou imports conditionnels et les corriger aussi.

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier le rapport d'audit: `AUDIT_SUMMARY.md`
2. Consulter le changelog: `CHANGELOG.md`
3. Rechercher l'erreur exacte avec grep

---

**Temps estimé de correction**: 15-30 minutes (avec script automatique)
