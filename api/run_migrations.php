<?php
/**
 * Script d'exécution des migrations SQL
 * Usage: php run_migrations.php
 */

require_once __DIR__ . '/config.php';

echo "=== Exécution des migrations SQL ===\n\n";

try {
    $pdo = getDbConnection();

    // Créer la table de suivi des migrations si elle n'existe pas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Récupérer les migrations déjà exécutées
    $stmt = $pdo->query("SELECT filename FROM migrations");
    $executedMigrations = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Lire tous les fichiers de migration
    $migrationsDir = __DIR__ . '/migrations';
    $migrationFiles = glob($migrationsDir . '/*.sql');
    sort($migrationFiles);

    if (empty($migrationFiles)) {
        echo "Aucune migration trouvée dans $migrationsDir\n";
        exit(0);
    }

    $executed = 0;
    $skipped = 0;

    foreach ($migrationFiles as $file) {
        $filename = basename($file);

        // Vérifier si la migration a déjà été exécutée
        if (in_array($filename, $executedMigrations)) {
            echo "⏭️  Migration déjà exécutée: $filename\n";
            $skipped++;
            continue;
        }

        echo "🔄 Exécution de: $filename\n";

        // Lire le contenu du fichier SQL
        $sql = file_get_contents($file);

        // Diviser en requêtes individuelles (séparées par ;)
        $queries = array_filter(
            array_map('trim', explode(';', $sql)),
            function($query) {
                // Ignorer les commentaires et les lignes vides
                return !empty($query) &&
                       !preg_match('/^\s*--/', $query) &&
                       !preg_match('/^\s*$/', $query);
            }
        );

        // Exécuter chaque requête
        $pdo->beginTransaction();

        try {
            foreach ($queries as $query) {
                if (!empty(trim($query))) {
                    $pdo->exec($query);
                }
            }

            // Enregistrer la migration comme exécutée
            $stmt = $pdo->prepare("INSERT INTO migrations (filename) VALUES (?)");
            $stmt->execute([$filename]);

            $pdo->commit();
            echo "✅ Migration réussie: $filename\n\n";
            $executed++;

        } catch (Exception $e) {
            $pdo->rollBack();
            echo "❌ Erreur lors de la migration $filename:\n";
            echo "   " . $e->getMessage() . "\n\n";
            throw $e;
        }
    }

    echo "\n=== Résumé ===\n";
    echo "✅ Migrations exécutées: $executed\n";
    echo "⏭️  Migrations déjà faites: $skipped\n";
    echo "📊 Total: " . count($migrationFiles) . "\n";

} catch (Exception $e) {
    echo "\n❌ Erreur fatale:\n";
    echo $e->getMessage() . "\n";
    exit(1);
}
