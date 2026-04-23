import fs from 'fs';
import path from 'path';

const schemaDir = 'c:/Users/Levay/Desktop/flow/lib/db/src/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  let content = fs.readFileSync(path.join(schemaDir, file), 'utf8');
  
  // Revert imports
  content = content.replace(/from\s*"drizzle-orm\/sqlite-core"/g, 'from "drizzle-orm/pg-core"');
  content = content.replace(/sqliteTable/g, 'pgTable');
  
  // Revert IDs
  content = content.replace(/integer\("id"\)\.primaryKey\(\{ autoIncrement: true \}\)/g, 'serial("id").primaryKey()');
  
  // Revert Booleans
  content = content.replace(/integer\("([^"]+)",\s*\{\s*mode:\s*"boolean"\s*\}\)/g, 'boolean("$1")');
  
  // Revert Timestamps
  content = content.replace(/integer\("([^"]+)",\s*\{\s*mode:\s*"timestamp"\s*\}\)/g, 'timestamp("$1")');
  
  // Revert JSON mode (tags)
  content = content.replace(/text\("tags",\s*\{\s*mode:\s*"json"\s*\}\)\.\$type<string\[\]>\(\)/g, 'jsonb("tags").$type<string[]>()');

  // Fix imports list
  content = content.replace(/import\s*\{([^}]*)\}\s*from\s*"drizzle-orm\/pg-core";/, (match, p1) => {
    let parts = p1.split(',').map(p => p.trim()).filter(p => p);
    parts = parts.filter(p => !['sqliteTable', 'integer'].includes(p));
    if (!parts.includes('pgTable')) parts.push('pgTable');
    if (content.includes('serial(') && !parts.includes('serial')) parts.push('serial');
    if (content.includes('boolean(') && !parts.includes('boolean')) parts.push('boolean');
    if (content.includes('timestamp(') && !parts.includes('timestamp')) parts.push('timestamp');
    if (content.includes('jsonb(') && !parts.includes('jsonb')) parts.push('jsonb');
    if (content.includes('text(') && !parts.includes('text')) parts.push('text');
    
    return `import { ${[...new Set(parts)].join(', ')} } from "drizzle-orm/pg-core";`;
  });

  fs.writeFileSync(path.join(schemaDir, file), content);
  console.log(`Reverted ${file} to PostgreSQL`);
}
