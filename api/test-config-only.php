<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Début du test...\n";

if (!file_exists(__DIR__ . '/config.local.php')) {
    die("ERREUR: config.local.php n'existe pas!\n");
}

echo "config.local.php existe\n";

try {
    require_once __DIR__ . '/config.local.php';
    echo "config.local.php chargé avec succès!\n";

    echo "DB_HOST: " . (defined('DB_HOST') ? DB_HOST : 'NON DÉFINI') . "\n";
    echo "DB_NAME: " . (defined('DB_NAME') ? DB_NAME : 'NON DÉFINI') . "\n";

} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "Fin du test\n";
?>
