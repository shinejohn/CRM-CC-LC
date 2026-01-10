<?php
// Temporary script to fix UUID defaults in migrations for SQLite compatibility
// This removes PostgreSQL-specific uuid_generate_v4() defaults

$migrationFiles = glob(__DIR__ . '/*.php');

foreach ($migrationFiles as $file) {
    $content = file_get_contents($file);
    
    // Replace uuid_generate_v4() defaults with conditional logic
    $pattern = '/\$table->uuid\([\'"]id[\'"]\)->primary\(\)->default\(DB::raw\([\'"]uuid_generate_v4\(\)[\'"]\)\);/';
    $replacement = "\$table->uuid('id')->primary();";
    
    $newContent = preg_replace($pattern, $replacement, $content);
    
    if ($newContent !== $content) {
        file_put_contents($file, $newContent);
        echo "Fixed: " . basename($file) . "\n";
    }
}

echo "Done!\n";
