const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check orders
db.all('SELECT id, userId, orderNumber, total, status, createdAt FROM orders LIMIT 10', [], (err, orders) => {
  if (err) {
    console.error('Error fetching orders:', err);
  } else {
    console.log('\n📦 ORDERS:', orders.length);
    orders.forEach(o => {
      console.log(`  - ${o.orderNumber}: userId=${o.userId} (${typeof o.userId}), total=₹${o.total}, status=${o.status}`);
    });
  }
  
  // Check users
  db.all('SELECT id, name, email, role FROM users', [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
    } else {
      console.log('\n👥 USERS:', users.length);
      users.forEach(u => {
        console.log(`  - ID: ${u.id} (${typeof u.id}), Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
      });
    }
    
    db.close();
  });
});
