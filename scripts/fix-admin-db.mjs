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
    
    // Check if user exists
    const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (res.rows.length > 0) {
      // Update
      await client.query(
        'UPDATE users SET password_hash = $1, name = $2, role = $3, updated_at = NOW() WHERE email = $4',
        [passwordHash, name, role, email]
      );
      console.log('Admin user updated successfully');
    } else {
      // Insert
      await client.query(
        'INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [email, passwordHash, name, role]
      );
      console.log('Admin user created successfully');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
