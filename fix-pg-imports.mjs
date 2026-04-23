import fs from 'fs';
import path from 'path';

const schemaDir = 'c:/Users/Levay/Desktop/flow/lib/db/src/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  let content = fs.readFileSync(path.join(schemaDir, file), 'utf8');
  
  // Lista de tipos de PG que podríamos estar usando
  const pgTypes = ['pgTable', 'serial', 'timestamp', 'jsonb', 'boolean', 'varchar', 'text', 'integer', 'real', 'uuid'];
  const usedTypes = pgTypes.filter(t => content.includes(`${t}(`));
  if (content.includes('pgTable(')) usedTypes.push('pgTable');

  // Arreglar import
  content = content.replace(/import\s*\{([^}]*)\}\s*from\s*"drizzle-orm\/pg-core";/, (match, p1) => {
     return `import { ${[...new Set(usedTypes)].join(', ')} } from "drizzle-orm/pg-core";`;
  });

  fs.writeFileSync(path.join(schemaDir, file), content);
  console.log(`Fixed PG imports in ${file}`);
}
