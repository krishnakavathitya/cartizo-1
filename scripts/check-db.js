require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase (PostgreSQL)');

    // Check orders
    const resOrders = await client.query('SELECT "id", "userId", "orderNumber", "total", "status", "createdAt" FROM orders LIMIT 10');
    const orders = resOrders.rows;
    console.log('\n📦 ORDERS:', orders.length);
    orders.forEach(o => {
      console.log(`  - ${o.orderNumber}: userId=${o.userId} (${typeof o.userId}), total=₹${o.total}, status=${o.status}`);
    });

    // Check users
    const resUsers = await client.query('SELECT "id", "name", "email", "role" FROM users');
    const users = resUsers.rows;
    console.log('\n👥 USERS:', users.length);
    users.forEach(u => {
      console.log(`  - ID: ${u.id} (${typeof u.id}), Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    await client.end();
  }
}

check();
