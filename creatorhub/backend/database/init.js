/**
 * Database Initialization Script
 * Standalone script to create CreatorHub database schema
 * Run with: npm run db:init
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'creatorhub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Harshad2007@1823'
});

async function checkDatabaseExists() {
  const client = await pool.connect();
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [process.env.DB_NAME]
  );
  client.release();
  return result.rows.length > 0;
}

async function createDatabase() {
  const exists = await checkDatabaseExists();
  if (!exists) {
    const client = await pool.connect();
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    client.release();
    console.log(`✅ Database '${process.env.DB_NAME}' created`);
  } else {
    console.log(`ℹ️ Database '${process.env.DB_NAME}' already exists`);
  }
}

const createTables = async () => {
  try {
    console.log('⏳ Initializing CreatorHub database schema...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'admin',
        avatar_url TEXT,
        brand_kit JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ users table created');

    // Create social_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        username VARCHAR(100),
        access_token TEXT,
        refresh_token TEXT,
        connected BOOLEAN DEFAULT false,
        followers INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, platform)
      );
    `);
    console.log('✅ social_accounts table created');

    // Create content table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content (
        id VARCHAR(36) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500),
        description TEXT,
        type VARCHAR(50),
        platforms TEXT[],
        tags TEXT[],
        hashtags TEXT[],
        media_url TEXT,
        thumbnail_url TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        published_at TIMESTAMP,
        ai_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ content table created');

    // Create media table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(36) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255),
        original_name VARCHAR(255),
        url TEXT,
        type VARCHAR(50),
        category VARCHAR(50),
        size BIGINT,
        mime_type VARCHAR(100),
        thumbnail TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ media table created');

    // Create content_analytics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_analytics (
        id SERIAL PRIMARY KEY,
        content_id VARCHAR(36) REFERENCES content(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        watch_time INTEGER DEFAULT 0,
        retention_rate FLOAT DEFAULT 0,
        UNIQUE(content_id, date)
      );
    `);
    console.log('✅ content_analytics table created');

    // Create analytics_platform table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_platform (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        followers INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        engagement_rate FLOAT DEFAULT 0,
        UNIQUE(platform, user_id, date)
      );
    `);
    console.log('✅ analytics_platform table created');

    // Create analytics_summary table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_summary (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        followers INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        engagement_rate FLOAT DEFAULT 0
      );
    `);
    console.log('✅ analytics_summary table created');

    // Create analytics_daily table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_daily (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        followers INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        UNIQUE(user_id, date)
      );
    `);
    console.log('✅ analytics_daily table created');

    // Create scheduled_posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scheduled_posts (
        id VARCHAR(36) PRIMARY KEY,
        content_id VARCHAR(36) REFERENCES content(id) ON DELETE CASCADE,
        platforms TEXT[],
        scheduled_at TIMESTAMP,
        timezone VARCHAR(50) DEFAULT 'UTC',
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ scheduled_posts table created');

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ notifications table created');

    // Seed the admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, 'Creator', 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, passwordHash]
    );
    console.log(`✅ Admin user seeded: ${adminEmail}`);

    // Seed initial social accounts
    await pool.query(`
      INSERT INTO social_accounts (user_id, platform, username, connected, followers)
      VALUES
        (1, 'youtube', '@creatorhub', true, 15000),
        (1, 'instagram', '@creatorhub', true, 8400),
        (1, 'facebook', 'CreatorHub', true, 2000)
      ON CONFLICT (user_id, platform) DO NOTHING
    `);
    console.log('✅ Social accounts seeded');

    console.log('\n🎉 All tables created and seeded successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the initialization
(async () => {
  try {
    await createDatabase();
    await createTables();
  } finally {
    await pool.end();
  }
})();
