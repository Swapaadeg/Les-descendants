<?php
/**
 * Production Configuration - o2switch
 * Copy this to config.local.php on the production server and fill in your credentials
 * 
 * DO NOT commit this file to git (it's in .gitignore for security)
 */

// o2switch production database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'teze5999_arki-family');
define('DB_USER', 'teze5999_swap');
define('DB_PASS', 'Nidoking63450');

// Production URL for absolute paths in uploads  
define('BASE_URL', 'https://arki-family.swapdevstudio.fr');

// JWT Configuration (production secret - generate with: php -r "echo bin2hex(random_bytes(32));")
define('JWT_SECRET', '5c0af389d04c0c1eb1e3e9ac71f5e2c90be3f2d7e8a9b0c1d2e3f4a5b6c7d8e');
define('JWT_EXPIRATION', 86400); // 24 hours
