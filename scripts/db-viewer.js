require('dotenv').config();
const { Client } = require('pg');
const readline = require('readline');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('╔════════════════════════════════════════╗');
console.log('║   Supabase Database Viewer - Cartizo   ║');
console.log('╚════════════════════════════════════════╝\n');

async function start() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase (PostgreSQL)\n');
    showMenu();
  } catch (err) {
    console.error('❌ Connection error:', err);
    process.exit(1);
  }
}

function showMenu() {
  console.log('\n📋 Available Commands:');
  console.log('  1. Show all tables');
  console.log('  2. View users');
  console.log('  3. View orders');
  console.log('  4. View products');
  console.log('  5. View reviews');
  console.log('  6. View wishlist');
  console.log('  7. View addresses');
  console.log('  8. Run custom SQL query');
  console.log('  9. Exit\n');
  
  rl.question('Enter command number: ', (answer) => {
    handleCommand(answer.trim());
  });
}

async function handleCommand(cmd) {
  try {
    switch(cmd) {
      case '1':
        await showTables();
        break;
      case '2':
        await viewTable('users', 'SELECT "id", "name", "email", "role", "createdAt" FROM users');
        break;
      case '3':
        await viewTable('orders', 'SELECT "id", "userId", "orderNumber", "total", "status", "createdAt" FROM orders ORDER BY "createdAt" DESC LIMIT 20');
        break;
      case '4':
        await viewTable('products', 'SELECT "id", "name", "brand", "category", "price", "discount", "inStock", "stock" FROM products LIMIT 20');
        break;
      case '5':
        await viewTable('reviews', 'SELECT "id", "userId", "productId", "rating", "comment", "createdAt" FROM reviews LIMIT 20');
        break;
      case '6':
        await viewTable('wishlist', 'SELECT * FROM wishlist LIMIT 20');
        break;
      case '7':
        await viewTable('addresses', 'SELECT * FROM addresses LIMIT 20');
        break;
      case '8':
        rl.question('Enter SQL query: ', async (query) => {
          await runCustomQuery(query);
          showMenu();
        });
        return;
      case '9':
        console.log('\n👋 Goodbye!\n');
        await client.end();
        rl.close();
        return;
      default:
        console.log('❌ Invalid command');
        showMenu();
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    showMenu();
  }
}

async function showTables() {
  const res = await client.query("SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
  console.log('\n📊 Tables in database:');
  res.rows.forEach(t => console.log(`  - ${t.name}`));
  showMenu();
}

async function viewTable(tableName, query) {
  const res = await client.query(query);
  console.log(`\n📋 ${tableName.toUpperCase()} (${res.rows.length} rows):`);
  console.table(res.rows);
  showMenu();
}

async function runCustomQuery(query) {
  const res = await client.query(query);
  console.log(`\n✅ Query result (${res.rows.length} rows):`);
  console.table(res.rows);
}

start();
