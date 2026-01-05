# Production Deployment Setup for o2switch

## Problem
The API is returning 500 errors because `config.local.php` is missing on the production server.

## Solution
`config.local.php` is gitignored (for security) and must be created manually on the production server.

## Steps to fix:

### 1. SSH into the production server
```bash
ssh teze5999@hoya.o2switch.net
```

### 2. Navigate to the app directory
```bash
cd ~/arki-family.swapdevstudio.fr
```

### 3. Create the production config file
```bash
cat > api/config.local.php << 'EOF'
<?php
/**
 * Production Configuration - o2switch
 */

// o2switch production database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'teze5999_arki-family');
define('DB_USER', 'teze5999_swap');
define('DB_PASS', 'Nidoking63450');

// Production URL for absolute paths in uploads
define('BASE_URL', 'https://arki-family.swapdevstudio.fr');

// JWT Configuration  
define('JWT_SECRET', '5c0af389d04c0c1eb1e3e9ac71f5e2c90be3f2d7e8a9b0c1d2e3f4a5b6c7d8e');
define('JWT_EXPIRATION', 86400); // 24 hours
EOF
```

### 4. Verify it was created
```bash
ls -la api/config.local.php
```

### 5. Test the CSRF endpoint
```bash
curl -k https://arki-family.swapdevstudio.fr/api/auth/csrf-token.php
```

Should return JSON like: `{"csrf_token":"<some_token_value>"}`

## Why this is needed
- `config.php` is gitignored and loads `config.local.php` for database credentials
- On production, sensitive data (DB passwords) should NOT be in git
- Each environment (local WAMP, production o2switch) needs its own credentials

## Files created/modified
- `api/config.local.example.php` - Template showing expected structure (FOR REFERENCE ONLY)
- `api/config.local.php` - PRODUCTION FILE (create manually, never commit)

## Important
- `.gitignore` prevents `config.local.php` from being committed
- After creating it once, it will persist on the server
- If you redeploy code with `git pull` or `cp dist/* .`, this file is NOT affected
