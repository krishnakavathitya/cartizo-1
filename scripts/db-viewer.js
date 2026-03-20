const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('╔════════════════════════════════════════╗');
console.log('║   SQLite Database Viewer - Cartizo     ║');
console.log('╚════════════════════════════════════════╝\n');

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

function handleCommand(cmd) {
  switch(cmd) {
    case '1':
      showTables();
      break;
    case '2':
      viewTable('users', 'SELECT id, name, email, role, createdAt FROM users');
      break;
    case '3':
      viewTable('orders', 'SELECT id, userId, orderNumber, total, status, createdAt FROM orders ORDER BY createdAt DESC LIMIT 20');
      break;
    case '4':
      viewTable('products', 'SELECT id, name, brand, category, price, discount, inStock, stock FROM products LIMIT 20');
      break;
    case '5':
      viewTable('reviews', 'SELECT r.id, r.userId, r.productId, r.rating, r.comment, r.createdAt FROM reviews r LIMIT 20');
      break;
    case '6':
      viewTable('wishlist', 'SELECT * FROM wishlist LIMIT 20');
      break;
    case '7':
      viewTable('addresses', 'SELECT * FROM addresses LIMIT 20');
      break;
    case '8':
      rl.question('Enter SQL query: ', (query) => {
        runCustomQuery(query);
      });
      return;
    case '9':
      console.log('\n👋 Goodbye!\n');
      db.close();
      rl.close();
      return;
    default:
      console.log('❌ Invalid command');
      showMenu();
  }
}

function showTables() {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('\n📊 Tables in database:');
      tables.forEach(t => console.log(`  - ${t.name}`));
    }
    showMenu();
  });
}

function viewTable(tableName, query) {
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log(`\n📋 ${tableName.toUpperCase()} (${rows.length} rows):`);
      console.table(rows);
    }
    showMenu();
  });
}

function runCustomQuery(query) {
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log(`\n✅ Query result (${rows.length} rows):`);
      console.table(rows);
    }
    showMenu();
  });
}

// Start the interactive menu
showMenu();
