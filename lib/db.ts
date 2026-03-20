import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

let dbPromise: Promise<Database> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    const db = await dbPromise;

    // Initialize Tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        phone TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        discount REAL DEFAULT 0,
        description TEXT,
        specifications TEXT,
        image TEXT,
        averageRating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        inStock INTEGER DEFAULT 1,
        stock INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        name TEXT,
        phone TEXT,
        street TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        country TEXT,
        type TEXT DEFAULT 'Home',
        isDefault INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        orderNumber TEXT UNIQUE NOT NULL,
        total REAL NOT NULL,
        subtotal REAL,
        tax REAL,
        shipping REAL,
        status TEXT NOT NULL,
        paymentMethod TEXT,
        shippingAddressId TEXT,
        items TEXT NOT NULL, -- JSON string
        statusHistory TEXT NOT NULL, -- JSON string
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS wishlist (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS carts (
        userId INTEGER PRIMARY KEY,
        items TEXT NOT NULL, -- JSON string
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY
      );
    `);

    // Table migrations
    try {
      // 1. Ensure addresses has 'zip' (might have been 'postalCode' from a previous migration)
      const tableInfo = await db.all("PRAGMA table_info(addresses)");
      const hasZip = tableInfo.some(r => r.name === 'zip');
      const hasPostalCode = tableInfo.some(r => r.name === 'postalCode');
      const hasType = tableInfo.some(r => r.name === 'type');

      if (!hasZip && hasPostalCode) {
        await db.exec('ALTER TABLE addresses RENAME COLUMN postalCode TO zip');
        console.log('Migrated addresses table: postalCode -> zip');
      }

      if (!hasType) {
        await db.exec("ALTER TABLE addresses ADD COLUMN type TEXT DEFAULT 'Home'");
        console.log('Migrated addresses table: added type column');
      }
    } catch (e) {
      console.error('Migration error (addresses):', e);
    }

    try {
      // 2. Ensure orders has all required columns
      await db.exec('ALTER TABLE orders ADD COLUMN subtotal REAL').catch(() => { });
      await db.exec('ALTER TABLE orders ADD COLUMN tax REAL').catch(() => { });
      await db.exec('ALTER TABLE orders ADD COLUMN shipping REAL').catch(() => { });
      await db.exec('ALTER TABLE orders ADD COLUMN paymentMethod TEXT').catch(() => { });
      await db.exec('ALTER TABLE orders ADD COLUMN shippingAddressId TEXT').catch(() => { });
      console.log('Migrated orders table with new columns if missing');
    } catch (e) {
      // Ignore if already existing
    }

    console.log('Database initialized successfully');
    return db;
  }
  return dbPromise;
}

export const getDatabase = () => {
  return {
    users: {
      getAll: async () => {
        const db = await getDb();
        return db.all('SELECT * FROM users');
      },
      getById: async (id: number) => {
        const db = await getDb();
        return db.get('SELECT * FROM users WHERE id = ?', id);
      },
      getByEmail: async (email: string) => {
        const db = await getDb();
        return db.get('SELECT * FROM users WHERE email = ?', email);
      },
      create: async (user: any) => {
        const db = await getDb();
        const result = await db.run(
          'INSERT INTO users (name, email, password, role, avatar, phone, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [user.name, user.email, user.password, user.role, user.avatar, user.phone, new Date().toISOString()]
        );
        return { ...user, id: result.lastID };
      },
      update: async (id: number, updates: any) => {
        const db = await getDb();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
        return db.get('SELECT * FROM users WHERE id = ?', id);
      },
      delete: async (id: number) => {
        const db = await getDb();
        const result = await db.run('DELETE FROM users WHERE id = ?', id);
        return (result.changes ?? 0) > 0;
      }
    },
    products: {
      getAll: async () => {
        const db = await getDb();
        const products = await db.all('SELECT * FROM products');
        return products.map(p => ({ ...p, inStock: !!p.inStock }));
      },
      getById: async (id: number) => {
        const db = await getDb();
        const p = await db.get('SELECT * FROM products WHERE id = ?', id);
        return p ? { ...p, inStock: !!p.inStock } : undefined;
      },
      getBySlug: async (slug: string) => {
        const db = await getDb();
        const p = await db.get('SELECT * FROM products WHERE slug = ?', slug);
        return p ? { ...p, inStock: !!p.inStock } : undefined;
      },
      create: async (product: any) => {
        const db = await getDb();
        const result = await db.run(
          'INSERT INTO products (name, slug, brand, category, price, discount, description, specifications, image, averageRating, reviewCount, inStock, stock, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [product.name, product.slug, product.brand, product.category, product.price, product.discount, product.description, product.specifications, product.image, product.averageRating || 0, product.reviewCount || 0, product.inStock ? 1 : 0, product.stock, new Date().toISOString()]
        );
        return { ...product, id: result.lastID };
      },
      update: async (id: number, updates: any) => {
        const db = await getDb();
        if (updates.inStock !== undefined) updates.inStock = updates.inStock ? 1 : 0;
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        await db.run(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
        const p = await db.get('SELECT * FROM products WHERE id = ?', id);
        return p ? { ...p, inStock: !!p.inStock } : undefined;
      },
      delete: async (id: number) => {
        const db = await getDb();
        const result = await db.run('DELETE FROM products WHERE id = ?', id);
        return (result.changes ?? 0) > 0;
      }
    },
    addresses: {
      getAll: async (userId: number) => {
        const db = await getDb();
        const addrs = await db.all('SELECT * FROM addresses WHERE userId = ?', userId);
        return addrs.map(a => ({
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        }));
      },
      getById: async (id: string) => {
        const db = await getDb();
        const a = await db.get('SELECT * FROM addresses WHERE id = ?', id);
        return a ? {
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        } : undefined;
      },
      create: async (userId: number, address: any) => {
        const db = await getDb();
        const id = `addr-${Date.now()}`;
        if (address.isDefault) {
          await db.run('UPDATE addresses SET isDefault = 0 WHERE userId = ?', userId);
        }
        await db.run(
          'INSERT INTO addresses (id, userId, name, phone, street, city, state, zip, country, type, isDefault, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, address.name, address.phone, address.street, address.city, address.state, address.postalCode || address.zip, address.country, address.type || 'Home', address.isDefault ? 1 : 0, new Date().toISOString(), new Date().toISOString()]
        );
        const a = await db.get('SELECT * FROM addresses WHERE id = ?', id);
        return a ? {
          ...a,
          postalCode: a.zip,
          isDefault: !!a.isDefault
        } : null;
      },
      update: async (userId: number, id: string, updates: any) => {
        const db = await getDb();
        if (updates.isDefault) {
          await db.run('UPDATE addresses SET isDefault = 0 WHERE userId = ?', userId);
        }
        if (updates.postalCode) {
          updates.zip = updates.postalCode;
          delete updates.postalCode;
        }
        if (updates.isDefault !== undefined) updates.isDefault = updates.isDefault ? 1 : 0;
        updates.updatedAt = new Date().toISOString();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        await db.run(`UPDATE addresses SET ${setClause} WHERE id = ? AND userId = ?`, [...values, id, userId]);
        const a = await db.get('SELECT * FROM addresses WHERE id = ?', id);
        return a ? {
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        } : null;
      },
      delete: async (userId: number, id: string) => {
        const db = await getDb();
        const result = await db.run('DELETE FROM addresses WHERE id = ? AND userId = ?', [id, userId]);
        return (result.changes ?? 0) > 0;
      },
      setDefault: async (userId: number, id: string) => {
        const db = await getDb();
        await db.run('UPDATE addresses SET isDefault = 0 WHERE userId = ?', userId);
        await db.run('UPDATE addresses SET isDefault = 1 WHERE id = ? AND userId = ?', [id, userId]);
        const a = await db.get('SELECT * FROM addresses WHERE id = ?', id);
        return a ? {
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        } : null;
      }
    },
    orders: {
      getAll: async (userId: number) => {
        const db = await getDb();
        const orders = await db.all('SELECT * FROM orders WHERE userId = ?', userId);
        return orders.map(o => ({ ...o, items: JSON.parse(o.items), statusHistory: JSON.parse(o.statusHistory) }));
      },
      getAllAdmin: async () => {
        const db = await getDb();
        const orders = await db.all('SELECT * FROM orders');
        return orders.map(o => ({ ...o, items: JSON.parse(o.items), statusHistory: JSON.parse(o.statusHistory) }));
      },
      getById: async (userId: number, id: string) => {
        const db = await getDb();
        const o = await db.get('SELECT * FROM orders WHERE id = ? AND userId = ?', [id, userId]);
        return o ? { ...o, items: JSON.parse(o.items), statusHistory: JSON.parse(o.statusHistory) } : undefined;
      },
      getByOrderNumber: async (orderNumber: string) => {
        const db = await getDb();
        const o = await db.get('SELECT * FROM orders WHERE orderNumber = ?', orderNumber);
        return o ? { ...o, items: JSON.parse(o.items), statusHistory: JSON.parse(o.statusHistory) } : undefined;
      },
      create: async (userId: number, order: any) => {
        const db = await getDb();
        const id = `ord-${Date.now()}`;
        const statusHistory = JSON.stringify([{
          id: `sh-${Date.now()}`,
          status: order.status || 'PENDING',
          createdAt: new Date().toISOString(),
          note: 'Order initiated via decentralized gateway'
        }]);
        await db.run(
          'INSERT INTO orders (id, userId, orderNumber, total, subtotal, tax, shipping, status, paymentMethod, shippingAddressId, items, statusHistory, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            userId,
            order.orderNumber,
            order.total,
            order.subtotal || order.total,
            order.tax || 0,
            order.shipping || 0,
            order.status || 'PENDING',
            order.paymentMethod,
            order.shippingAddressId,
            JSON.stringify(order.items),
            statusHistory,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
        const o = await db.get('SELECT * FROM orders WHERE id = ?', id);
        return o ? { ...o, items: JSON.parse(o.items), statusHistory: JSON.parse(o.statusHistory) } : null;
      },
      updateStatus: async (userId: number, id: string, status: string) => {
        const db = await getDb();
        const o = await db.get('SELECT * FROM orders WHERE id = ? AND userId = ?', [id, userId]);
        if (!o) return null;
        const history = JSON.parse(o.statusHistory);
        history.push({
          id: `sh-${Date.now()}`,
          status,
          createdAt: new Date().toISOString(),
          note: `Status updated to ${status}`
        });
        await db.run(
          'UPDATE orders SET status = ?, statusHistory = ?, updatedAt = ? WHERE id = ?',
          [status, JSON.stringify(history), new Date().toISOString(), id]
        );
        const updated = await db.get('SELECT * FROM orders WHERE id = ?', id);
        return { ...updated, items: JSON.parse(updated.items), statusHistory: JSON.parse(updated.statusHistory) };
      }
    },
    wishlist: {
      getAll: async (userId: number) => {
        const db = await getDb();
        return db.all('SELECT * FROM wishlist WHERE userId = ?', userId);
      },
      add: async (userId: number, productId: number) => {
        const db = await getDb();
        // Check if already exists
        const existing = await db.get('SELECT * FROM wishlist WHERE userId = ? AND productId = ?', [userId, productId]);
        if (existing) return existing;

        const id = `wish-${Date.now()}`;
        await db.run(
          'INSERT INTO wishlist (id, userId, productId, createdAt) VALUES (?, ?, ?, ?)',
          [id, userId, productId, new Date().toISOString()]
        );
        return db.get('SELECT * FROM wishlist WHERE id = ?', id);
      },
      remove: async (userId: number, productId: number) => {
        const db = await getDb();
        const result = await db.run('DELETE FROM wishlist WHERE userId = ? AND productId = ?', [userId, productId]);
        return (result.changes ?? 0) > 0;
      },
      isInWishlist: async (userId: number, productId: number) => {
        const db = await getDb();
        const item = await db.get('SELECT 1 FROM wishlist WHERE userId = ? AND productId = ?', [userId, productId]);
        return !!item;
      }
    },
    carts: {
      get: async (userId: number) => {
        const db = await getDb();
        let cart = await db.get('SELECT * FROM carts WHERE userId = ?', userId);
        if (!cart) {
          await db.run('INSERT INTO carts (userId, items, updatedAt) VALUES (?, ?, ?)', [userId, '[]', new Date().toISOString()]);
          cart = { userId, items: '[]', updatedAt: new Date().toISOString() };
        }
        return { ...cart, items: JSON.parse(cart.items) };
      },
      update: async (userId: number, items: any[]) => {
        const db = await getDb();
        await db.run(
          'INSERT INTO carts (userId, items, updatedAt) VALUES (?, ?, ?) ON CONFLICT(userId) DO UPDATE SET items = excluded.items, updatedAt = excluded.updatedAt',
          [userId, JSON.stringify(items), new Date().toISOString()]
        );
        return { userId, items, updatedAt: new Date().toISOString() };
      },
      clear: async (userId: number) => {
        const db = await getDb();
        await db.run('DELETE FROM carts WHERE userId = ?', userId);
      }
    },
    reviews: {
      getAll: async (productId?: number) => {
        const db = await getDb();
        if (productId) return db.all('SELECT * FROM reviews WHERE productId = ?', productId);
        return db.all('SELECT * FROM reviews');
      },
      getAllReviews: async () => {
        const db = await getDb();
        return db.all('SELECT * FROM reviews');
      },
      getByUser: async (userId: number) => {
        const db = await getDb();
        return db.all('SELECT * FROM reviews WHERE userId = ?', userId);
      },
      create: async (userId: number, review: any) => {
        const db = await getDb();
        const id = `rev-${Date.now()}`;
        const createdAt = new Date().toISOString();
        await db.run(
          'INSERT INTO reviews (id, userId, productId, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [id, userId, review.productId, review.rating, review.comment, createdAt]
        );

        // Update product rating
        const revs = await db.all('SELECT rating FROM reviews WHERE productId = ?', review.productId);
        const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
        await db.run('UPDATE products SET averageRating = ?, reviewCount = ? WHERE id = ?', [avg, revs.length, review.productId]);

        return { ...review, id, userId, createdAt };
      },
      delete: async (reviewId: string) => {
        const db = await getDb();
        const r = await db.get('SELECT productId FROM reviews WHERE id = ?', reviewId);
        if (!r) return false;
        await db.run('DELETE FROM reviews WHERE id = ?', reviewId);

        const revs = await db.all('SELECT rating FROM reviews WHERE productId = ?', r.productId);
        const avg = revs.length > 0 ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 0;
        await db.run('UPDATE products SET averageRating = ?, reviewCount = ? WHERE id = ?', [avg, revs.length, r.productId]);
        return true;
      }
    },
    categories: {
      getAll: async (): Promise<string[]> => {
        const db = await getDb();
        const cats = await db.all('SELECT name FROM categories');
        if (cats.length === 0) {
          const products = await db.all('SELECT DISTINCT category FROM products');
          const names = products.map(p => p.category).filter(Boolean);
          for (const name of names) {
            await db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', name);
          }
          return names.sort();
        }
        return cats.map(c => c.name).sort();
      },
      update: async (categories: string[]) => {
        const db = await getDb();
        await db.run('DELETE FROM categories');
        for (const name of categories) {
          await db.run('INSERT INTO categories (name) VALUES (?)', name);
        }
      }
    }
  };
};

export function closeDatabase() {
  if (dbPromise) {
    dbPromise.then(db => db.close());
    dbPromise = null;
  }
}
