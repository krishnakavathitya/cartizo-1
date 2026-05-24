const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function backupDatabase() {
  try {
    console.log('Starting database backup...');
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `database_backup_${timestamp}.json`);
    
    const dbData = {};

    // Get all tables
    const res = await pool.query("SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    const tables = res.rows.map(r => r.name);

    for (let table of tables) {
      try {
        const data = await pool.query(`SELECT * FROM "${table}"`);
        if (data.rows.length > 0) {
          dbData[table] = data.rows;
          console.log(`Backed up ${data.rows.length} rows from table '${table}'`);
        }
      } catch (e) {
        console.error(`Error backing up table '${table}':`, e.message);
      }
    }

    // Write to JSON file
    fs.writeFileSync(backupFile, JSON.stringify(dbData, null, 2));
    
    console.log(`\n✅ Backup successfully saved to:`);
    console.log(backupFile);
    
  } catch(e) {
    console.error('Backup failed:', e);
  } finally {
    pool.end();
  }
}

backupDatabase();
