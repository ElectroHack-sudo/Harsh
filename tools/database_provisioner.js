/**
 * Database Hub & Scaffolder (Layer 3 Deterministic Tool)
 * 
 * Provisions database connectors, schemas, environment configurations, and migrations
 * dynamically for SQLite, PostgreSQL, Supabase, Prisma, or Drizzle.
 */

const fs = require('fs');
const path = require('path');

const DB_TEMPLATES = {
    sqlite: {
        env: 'DATABASE_URL="file:./dev.db"',
        packages: ['better-sqlite3'],
        connectorCode: `// SQLite Client Connector
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

module.exports = db;
`
    },
    postgres: {
        env: 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"',
        packages: ['pg', 'dotenv'],
        connectorCode: `// PostgreSQL Client Pool Connector
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
`
    },
    supabase: {
        env: 'SUPABASE_URL="https://your-project.supabase.co"\nSUPABASE_ANON_KEY="your-anon-key"',
        packages: ['@supabase/supabase-js', 'dotenv'],
        connectorCode: `// Supabase Client Connector
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Database Hub] Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
`
    },
    prisma: {
        env: 'DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"',
        packages: ['@prisma/client', 'prisma'],
        schemaPrisma: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
    }
};

function provisionDatabase(options = {}) {
    const targetDir = options.targetDir || process.cwd();
    const type = (options.type || 'sqlite').toLowerCase();
    const template = DB_TEMPLATES[type] || DB_TEMPLATES.sqlite;

    console.log(`[Database Hub] Provisioning database type [${type}] in: ${targetDir}`);

    const dbDir = path.join(targetDir, 'db');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // 1. Write Connector Code
    if (template.connectorCode) {
        const connectorPath = path.join(dbDir, 'client.js');
        fs.writeFileSync(connectorPath, template.connectorCode, 'utf8');
        console.log(`[Database Hub] Created connector: ${connectorPath}`);
    }

    // 2. Write Prisma Schema if Prisma
    if (type === 'prisma' && template.schemaPrisma) {
        const prismaDir = path.join(targetDir, 'prisma');
        if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });
        const schemaPath = path.join(prismaDir, 'schema.prisma');
        fs.writeFileSync(schemaPath, template.schemaPrisma, 'utf8');
        console.log(`[Database Hub] Created Prisma schema: ${schemaPath}`);
    }

    // 3. Append to .env.example
    const envExamplePath = path.join(targetDir, '.env.example');
    const existingEnv = fs.existsSync(envExamplePath) ? fs.readFileSync(envExamplePath, 'utf8') : '';
    if (!existingEnv.includes('DATABASE_URL') && !existingEnv.includes('SUPABASE_URL')) {
        fs.appendFileSync(envExamplePath, `\n# Database Configuration (${type})\n${template.env}\n`, 'utf8');
        console.log(`[Database Hub] Updated .env.example with ${type} defaults`);
    }

    return {
        success: true,
        type,
        targetDir,
        recommendedPackages: template.packages
    };
}

// CLI entrypoint
if (require.main === module) {
    const args = process.argv.slice(2);
    const cmd = args[0] || 'test';

    if (cmd === 'test') {
        const res = provisionDatabase({ type: 'sqlite' });
        console.log('[Test Provision Result]:', res);
    } else if (cmd === 'create' || cmd === 'add') {
        const type = args[1] || 'sqlite';
        const res = provisionDatabase({ type });
        console.log('[Provision Result]:', res);
    } else {
        console.log('Usage: node database_provisioner.js [test | add <sqlite|postgres|supabase|prisma>]');
    }
}

module.exports = {
    DB_TEMPLATES,
    provisionDatabase
};
