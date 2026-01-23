#!/usr/bin/env node

/**
 * Data Dictionary Generator
 * Generates comprehensive JSON data dictionary for:
 * 1. Database schema (from migrations)
 * 2. Migrations metadata
 * 3. Laravel models
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const backendDir = join(rootDir, 'backend');

// Helper to parse PHP migration file
function parseMigration(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop();
  
  // Extract migration class name
  const classNameMatch = content.match(/class\s+(\w+)\s+extends\s+Migration/);
  const className = classNameMatch ? classNameMatch[1] : null;
  
  // Extract table name from Schema::create or Schema::table
  const createMatch = content.match(/Schema::create\(['"]([^'"]+)['"]/);
  const alterMatch = content.match(/Schema::table\(['"]([^'"]+)['"]/);
  const tableName = createMatch ? createMatch[1] : (alterMatch ? alterMatch[1] : null);
  
  // Extract columns with more detail
  const columns = [];
  const columnMatches = content.matchAll(/\$table->(\w+)\(['"]([^'"]+)['"](?:,\s*([^)]+))?\)/g);
  for (const match of columnMatches) {
    const type = match[1];
    const name = match[2];
    const params = match[3] || '';
    
    // Extract nullable
    const nullable = params.includes('nullable()') || type === 'nullable';
    
    // Extract default
    const defaultMatch = params.match(/default\(([^)]+)\)/);
    const defaultValue = defaultMatch ? defaultMatch[1].replace(/['"]/g, '') : null;
    
    // Extract unique
    const unique = params.includes('unique()') || content.includes(`->unique()`);
    
    columns.push({ 
      name, 
      type, 
      nullable,
      default: defaultValue,
      unique
    });
  }
  
  // Extract indexes
  const indexes = [];
  const indexMatches = content.matchAll(/\$table->(index|unique|primary)\(['"]([^'"]+)['"]\)/g);
  for (const match of indexMatches) {
    indexes.push({ type: match[1], columns: match[2] });
  }
  
  // Extract foreign keys
  const foreignKeys = [];
  const fkMatches = content.matchAll(/\$table->foreign\(['"]([^'"]+)['"]\)->references\(['"]([^'"]+)['"]\)->on\(['"]([^'"]+)['"]\)/g);
  for (const match of fkMatches) {
    foreignKeys.push({
      column: match[1],
      references: match[2],
      on: match[3]
    });
  }
  
  return {
    fileName,
    className,
    tableName,
    type: createMatch ? 'create' : (alterMatch ? 'alter' : 'unknown'),
    columns,
    indexes,
    foreignKeys
  };
}

// Helper to parse PHP model file
function parseModel(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop();
  
  // Extract model class name
  const classNameMatch = content.match(/class\s+(\w+)\s+extends\s+\w+/);
  const className = classNameMatch ? classNameMatch[1] : null;
  
  // Extract table name
  const tableMatch = content.match(/protected\s+\$table\s*=\s*['"]([^'"]+)['"]/);
  const tableName = tableMatch ? tableMatch[1] : null;
  
  // Extract fillable
  const fillableMatch = content.match(/protected\s+\$fillable\s*=\s*\[([^\]]+)\]/s);
  const fillable = fillableMatch 
    ? fillableMatch[1].split(',').map(f => f.trim().replace(/['"]/g, '').replace(/\/\/.*/, '')).filter(f => f)
    : [];
  
  // Extract casts
  const casts = {};
  const castsMatch = content.match(/protected\s+\$casts\s*=\s*\[([^\]]+)\]/s);
  if (castsMatch) {
    const castPairs = castsMatch[1].matchAll(/(['"]([^'"]+)['"])\s*=>\s*(['"]([^'"]+)['"]|(\w+)::class)/g);
    for (const match of castPairs) {
      const key = match[2];
      const value = match[4] || match[5] || 'unknown';
      casts[key] = value;
    }
  }
  
  // Extract relationships
  const relationships = [];
  const relationshipMatches = content.matchAll(/public\s+function\s+(\w+)\s*\([^)]*\)\s*:\s*(\w+)\s*\{[^}]*return\s+\$this->(belongsTo|hasMany|hasOne|belongsToMany|morphTo|morphMany)\(([^)]+)\)/gs);
  for (const match of relationshipMatches) {
    const returnType = match[2];
    const relType = match[3];
    const definition = match[4];
    
    // Try to extract related model
    const modelMatch = definition.match(/(\w+)::class/);
    const relatedModel = modelMatch ? modelMatch[1] : null;
    
    relationships.push({
      name: match[1],
      type: relType,
      returnType,
      definition: definition.trim(),
      relatedModel
    });
  }
  
  // Extract timestamps
  const timestamps = !content.includes('public $timestamps = false');
  
  // Extract primary key
  const keyTypeMatch = content.match(/protected\s+\$keyType\s*=\s*['"]([^'"]+)['"]/);
  const keyType = keyTypeMatch ? keyTypeMatch[1] : 'int';
  
  const incrementingMatch = content.match(/public\s+\$incrementing\s*=\s*(true|false)/);
  const incrementing = incrementingMatch ? incrementingMatch[1] === 'true' : true;
  
  return {
    fileName,
    className,
    tableName: tableName || (className ? className.toLowerCase() + 's' : null),
    fillable,
    casts,
    relationships,
    timestamps,
    keyType,
    incrementing,
    usesSoftDeletes: content.includes('use SoftDeletes') || content.includes('use Illuminate\\Database\\Eloquent\\SoftDeletes')
  };
}

// Main function
function generateDataDictionary() {
  console.log('🔍 Generating Data Dictionary...\n');
  
  const migrationsDir = join(backendDir, 'database/migrations');
  const modelsDir = join(backendDir, 'app/Models');
  
  if (!existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }
  
  if (!existsSync(modelsDir)) {
    console.error(`❌ Models directory not found: ${modelsDir}`);
    process.exit(1);
  }
  
  const dataDictionary = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      project: 'Learning Center Platform',
      description: 'Comprehensive data dictionary for database schema, migrations, and Laravel models'
    },
    database: {
      tables: {},
      relationships: [],
      indexes: []
    },
    migrations: [],
    models: {}
  };
  
  // Process migrations
  console.log('📋 Processing migrations...');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.php') && !f.includes('fix-'))
    .sort();
  
  for (const file of migrationFiles) {
    const filePath = join(migrationsDir, file);
    try {
      const migration = parseMigration(filePath);
      dataDictionary.migrations.push(migration);
      
      // Add to tables if it's a create migration
      if (migration.type === 'create' && migration.tableName) {
        if (!dataDictionary.database.tables[migration.tableName]) {
          dataDictionary.database.tables[migration.tableName] = {
            name: migration.tableName,
            columns: [],
            indexes: [],
            foreignKeys: [],
            migrations: []
          };
        }
        
        // Merge columns (avoid duplicates)
        migration.columns.forEach(col => {
          const existing = dataDictionary.database.tables[migration.tableName].columns.find(c => c.name === col.name);
          if (!existing) {
            dataDictionary.database.tables[migration.tableName].columns.push(col);
          }
        });
        
        // Merge indexes
        migration.indexes.forEach(idx => {
          const existing = dataDictionary.database.tables[migration.tableName].indexes.find(i => 
            i.columns === idx.columns && i.type === idx.type
          );
          if (!existing) {
            dataDictionary.database.tables[migration.tableName].indexes.push(idx);
          }
        });
        
        // Merge foreign keys
        migration.foreignKeys.forEach(fk => {
          const existing = dataDictionary.database.tables[migration.tableName].foreignKeys.find(f => 
            f.column === fk.column
          );
          if (!existing) {
            dataDictionary.database.tables[migration.tableName].foreignKeys.push(fk);
          }
        });
        
        dataDictionary.database.tables[migration.tableName].migrations.push(file);
      }
    } catch (error) {
      console.warn(`⚠️  Error parsing migration ${file}:`, error.message);
    }
  }
  
  console.log(`✅ Processed ${dataDictionary.migrations.length} migrations`);
  console.log(`✅ Found ${Object.keys(dataDictionary.database.tables).length} tables`);
  
  // Process models
  console.log('\n📦 Processing models...');
  const modelFiles = [];
  
  function scanModels(dir, prefix = '') {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanModels(fullPath, `${prefix}${entry.name}/`);
      } else if (entry.isFile() && entry.name.endsWith('.php')) {
        modelFiles.push({ path: fullPath, name: `${prefix}${entry.name}` });
      }
    }
  }
  
  scanModels(modelsDir);
  
  for (const { path, name } of modelFiles) {
    try {
      const model = parseModel(path);
      const modelKey = model.className || name.replace('.php', '');
      dataDictionary.models[modelKey] = model;
    } catch (error) {
      console.warn(`⚠️  Error parsing model ${name}:`, error.message);
    }
  }
  
  console.log(`✅ Processed ${Object.keys(dataDictionary.models).length} models`);
  
  // Generate relationships map
  console.log('\n🔗 Mapping relationships...');
  const relationshipMap = [];
  
  for (const [modelName, model] of Object.entries(dataDictionary.models)) {
    for (const rel of model.relationships) {
      relationshipMap.push({
        from: modelName,
        relationship: rel.name,
        type: rel.type,
        to: rel.relatedModel || 'unknown',
        definition: rel.definition
      });
    }
  }
  
  dataDictionary.database.relationships = relationshipMap;
  
  console.log(`✅ Mapped ${relationshipMap.length} relationships`);
  
  // Write output
  const outputPath = join(rootDir, 'DATA_DICTIONARY.json');
  writeFileSync(outputPath, JSON.stringify(dataDictionary, null, 2), 'utf-8');
  
  console.log(`\n✅ Data dictionary generated: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - Tables: ${Object.keys(dataDictionary.database.tables).length}`);
  console.log(`   - Migrations: ${dataDictionary.migrations.length}`);
  console.log(`   - Models: ${Object.keys(dataDictionary.models).length}`);
  console.log(`   - Relationships: ${relationshipMap.length}`);
}

generateDataDictionary();
