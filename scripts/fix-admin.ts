import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';

const databaseUrl = 'postgresql://flow_db_gtnz_user:hezt7qwkFW9fxYNj3PRjgxx8VKZp5YQI@dpg-d7ks8ipf9bms739mh8s0-a/flow_db_gtnz';
const email = 'admin@flowsoftware.app';
const password = 'Admin2024!';
const name = 'Administrador';
const role = 'admin';

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Use the actual column names from the schema
    // In Drizzle it's passwordHash (camelCase) but in SQL it might be password_hash (snake_case)
    // Let's check the schema first if possible, or try both.
    
    try {
      await client.query(
        'INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = $1, name = $2, role = $3, updated_at = NOW()',
        [passwordHash, name, role, email]
      );
      console.log('Admin user ensured (snake_case)');
    } catch (e) {
      console.log('Snake case failed, trying camelCase');
      await client.query(
        'INSERT INTO users (email, "passwordHash", name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "passwordHash" = $1, name = $2, role = $3, "updatedAt" = NOW()',
        [passwordHash, name, role, email]
      );
      console.log('Admin user ensured (camelCase)');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
