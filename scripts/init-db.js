const { Pool } = require('pg');
const path = require('path');

// Always load env from repo root (.env.local). Do NOT move this file.
// This makes the script resilient no matter where it's executed from.
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function initializeDatabase() {
  // First, connect to default postgres database to create our database
  const rootPool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    database: 'postgres' // Connect to default database first
  });

  try {
    // Check if database exists
    const { rows } = await rootPool.query(`
      SELECT datname FROM pg_database WHERE datname = 'letushack_db'
    `);
    
    if (rows.length === 0) {
      // Disconnect all other clients first
      await rootPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'letushack_db'
        AND pid <> pg_backend_pid();
      `);
      
      // Create the database
      await rootPool.query('CREATE DATABASE letushack_db');
    }
    
    console.log('✅ Database checked/created successfully');
    await rootPool.end();

    // Now connect to our database to create tables
    const appPool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: 'letushack_db'
    });

    // Create users table
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        ip_address VARCHAR(255),
        last_activity TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name VARCHAR(255)
      );
    `);
    console.log('✅ users table created successfully (or already exists)');

    // Create notifications table
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ notifications table created successfully (or already exists)');

    // Create labs table
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS labs (
        lab_id SERIAL PRIMARY KEY,
        lab_name VARCHAR(255) NOT NULL,
        lab_description TEXT,
        lab_tags TEXT[],
        level INT,
        max_score INT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ labs table created successfully (or already exists)');

    // Create lab_scores table
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS lab_scores (
        score_id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        lab_id INT NOT NULL,
        score INT DEFAULT 0,
        solved BOOLEAN DEFAULT FALSE,
        submitted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ lab_scores table created successfully (or already exists)');

    console.log('✅ All tables initialized successfully');
    await appPool.end();
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

initializeDatabase().catch(console.error);