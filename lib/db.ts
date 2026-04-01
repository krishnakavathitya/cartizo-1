import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getDatabase = () => {
  return {
    users: {
      getAll: async () => {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
      },
      getById: async (id: number) => {
        const result = await pool.query('SELECT * FROM users WHERE "id" = $1', [id]);
        return result.rows[0];
      },
      getByEmail: async (email: string) => {
        const result = await pool.query('SELECT * FROM users WHERE "email" = $1', [email]);
        return result.rows[0];
      },
      create: async (user: any) => {
        const result = await pool.query(
          'INSERT INTO users ("name", "email", "password", "role", "avatar", "phone", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "id"',
          [user.name, user.email, user.password, user.role, user.avatar, user.phone, new Date().toISOString()]
        );
        return { ...user, id: result.rows[0].id };
      },
      update: async (id: number, updates: any) => {
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        await pool.query(`UPDATE users SET ${setClause} WHERE "id" = $${keys.length + 1}`, [...values, id]);
        const result = await pool.query('SELECT * FROM users WHERE "id" = $1', [id]);
        return result.rows[0];
      },
      delete: async (id: number) => {
        const result = await pool.query('DELETE FROM users WHERE "id" = $1', [id]);
        return (result.rowCount ?? 0) > 0;
      }
    },
    products: {
      getAll: async () => {
        const result = await pool.query('SELECT * FROM products');
        return result.rows.map(p => ({ ...p, inStock: !!p.inStock }));
      },
      getById: async (id: number) => {
        const result = await pool.query('SELECT * FROM products WHERE "id" = $1', [id]);
        const p = result.rows[0];
        return p ? { ...p, inStock: !!p.inStock } : undefined;
      },
      getBySlug: async (slug: string) => {
        const result = await pool.query('SELECT * FROM products WHERE "slug" = $1', [slug]);
        const p = result.rows[0];
        return p ? { ...p, inStock: !!p.inStock } : undefined;
      },
      create: async (product: any) => {
        const result = await pool.query(
          'INSERT INTO products ("name", "slug", "brand", "category", "price", "discount", "description", "specifications", "image", "averageRating", "reviewCount", "inStock", "stock", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING "id"',
          [product.name, product.slug, product.brand, product.category, product.price, product.discount, product.description, product.specifications, product.image, product.averageRating || 0, product.reviewCount || 0, !!product.inStock, product.stock, new Date().toISOString()]
        );
        return { ...product, id: result.rows[0].id };
      },
      update: async (id: number, updates: any) => {
        if (updates.inStock !== undefined) updates.inStock = !!updates.inStock;
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        await pool.query(`UPDATE products SET ${setClause} WHERE "id" = $${keys.length + 1}`, [...values, id]);
        const result = await pool.query('SELECT * FROM products WHERE "id" = $1', [id]);
        const p = result.rows[0];
        return p ? { ...p, inStock: !!p.inStock } : undefined;
      },
      delete: async (id: number) => {
        const result = await pool.query('DELETE FROM products WHERE "id" = $1', [id]);
        return (result.rowCount ?? 0) > 0;
      }
    },
    addresses: {
      getAll: async (userId: number) => {
        const result = await pool.query('SELECT * FROM addresses WHERE "userId" = $1', [userId]);
        return result.rows.map(a => ({
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        }));
      },
      getById: async (id: string) => {
        const result = await pool.query('SELECT * FROM addresses WHERE "id" = $1', [id]);
        const a = result.rows[0];
        return a ? {
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        } : undefined;
      },
      create: async (userId: number, address: any) => {
        const id = `addr-${Date.now()}`;
        if (address.isDefault) {
          await pool.query('UPDATE addresses SET "isDefault" = false WHERE "userId" = $1', [userId]);
        }
        await pool.query(
          'INSERT INTO addresses ("id", "userId", "name", "phone", "street", "city", "state", "zip", "country", "type", "isDefault", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [id, userId, address.name, address.phone, address.street, address.city, address.state, address.postalCode || address.zip, address.country, address.type || 'Home', !!address.isDefault, new Date().toISOString(), new Date().toISOString()]
        );
        const result = await pool.query('SELECT * FROM addresses WHERE "id" = $1', [id]);
        const a = result.rows[0];
        return a ? {
          ...a,
          postalCode: a.zip,
          isDefault: !!a.isDefault
        } : null;
      },
      update: async (userId: number, id: string, updates: any) => {
        if (updates.isDefault) {
          await pool.query('UPDATE addresses SET "isDefault" = false WHERE "userId" = $1', [userId]);
        }
        if (updates.postalCode) {
          updates.zip = updates.postalCode;
          delete updates.postalCode;
        }
        if (updates.isDefault !== undefined) updates.isDefault = !!updates.isDefault;
        updates.updatedAt = new Date().toISOString();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        await pool.query(`UPDATE addresses SET ${setClause} WHERE "id" = $${keys.length + 1} AND "userId" = $${keys.length + 2}`, [...values, id, userId]);
        const result = await pool.query('SELECT * FROM addresses WHERE "id" = $1', [id]);
        const a = result.rows[0];
        return a ? {
          ...a,
          postalCode: a.zip,
          type: a.type || 'Home',
          isDefault: !!a.isDefault
        } : null;
      },
      delete: async (userId: number, id: string) => {
        const result = await pool.query('DELETE FROM addresses WHERE "id" = $1 AND "userId" = $2', [id, userId]);
        return (result.rowCount ?? 0) > 0;
      },
      setDefault: async (userId: number, id: string) => {
        await pool.query('UPDATE addresses SET "isDefault" = false WHERE "userId" = $1', [userId]);
        await pool.query('UPDATE addresses SET "isDefault" = true WHERE "id" = $1 AND "userId" = $2', [id, userId]);
        const result = await pool.query('SELECT * FROM addresses WHERE "id" = $1', [id]);
        const a = result.rows[0];
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
        const result = await pool.query('SELECT * FROM orders WHERE "userId" = $1', [userId]);
        return result.rows.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, statusHistory: typeof o.statusHistory === 'string' ? JSON.parse(o.statusHistory) : o.statusHistory }));
      },
      getAllAdmin: async () => {
        const result = await pool.query('SELECT * FROM orders');
        return result.rows.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, statusHistory: typeof o.statusHistory === 'string' ? JSON.parse(o.statusHistory) : o.statusHistory }));
      },
      getById: async (userId: number, id: string) => {
        const result = await pool.query('SELECT * FROM orders WHERE "id" = $1 AND "userId" = $2', [id, userId]);
        const o = result.rows[0];
        return o ? { ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, statusHistory: typeof o.statusHistory === 'string' ? JSON.parse(o.statusHistory) : o.statusHistory } : undefined;
      },
      getByOrderNumber: async (orderNumber: string) => {
        const result = await pool.query('SELECT * FROM orders WHERE "orderNumber" = $1', [orderNumber]);
        const o = result.rows[0];
        return o ? { ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, statusHistory: typeof o.statusHistory === 'string' ? JSON.parse(o.statusHistory) : o.statusHistory } : undefined;
      },
      create: async (userId: number, order: any) => {
        const id = `ord-${Date.now()}`;
        const statusHistory = [{
          id: `sh-${Date.now()}`,
          status: order.status || 'PENDING',
          createdAt: new Date().toISOString(),
          note: 'Order initiated via decentralized gateway'
        }];
        await pool.query(
          'INSERT INTO orders ("id", "userId", "orderNumber", "total", "subtotal", "tax", "shipping", "status", "paymentMethod", "shippingAddressId", "items", "statusHistory", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
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
            JSON.stringify(statusHistory),
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
        const result = await pool.query('SELECT * FROM orders WHERE "id" = $1', [id]);
        const o = result.rows[0];
        return o ? { ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, statusHistory: typeof o.statusHistory === 'string' ? JSON.parse(o.statusHistory) : o.statusHistory } : null;
      },
      updateStatus: async (userId: number, id: string, status: string) => {
        const result = await pool.query('SELECT * FROM orders WHERE "id" = $1 AND "userId" = $2', [id, userId]);
        const o = result.rows[0];
        if (!o) return null;
        const history = typeof o.statusHistory === 'string' ? JSON.parse(o.statusHistory) : o.statusHistory;
        history.push({
          id: `sh-${Date.now()}`,
          status,
          createdAt: new Date().toISOString(),
          note: `Status updated to ${status}`
        });
        await pool.query(
          'UPDATE orders SET "status" = $1, "statusHistory" = $2, "updatedAt" = $3 WHERE "id" = $4',
          [status, JSON.stringify(history), new Date().toISOString(), id]
        );
        const updatedResult = await pool.query('SELECT * FROM orders WHERE "id" = $1', [id]);
        const updated = updatedResult.rows[0];
        return { ...updated, items: typeof updated.items === 'string' ? JSON.parse(updated.items) : updated.items, statusHistory: typeof updated.statusHistory === 'string' ? JSON.parse(updated.statusHistory) : updated.statusHistory };
      }
    },
    wishlist: {
      getAll: async (userId: number) => {
        const result = await pool.query('SELECT * FROM wishlist WHERE "userId" = $1', [userId]);
        return result.rows;
      },
      add: async (userId: number, productId: number) => {
        const existingResult = await pool.query('SELECT * FROM wishlist WHERE "userId" = $1 AND "productId" = $2', [userId, productId]);
        if (existingResult.rows.length > 0) return existingResult.rows[0];

        const id = `wish-${Date.now()}`;
        await pool.query(
          'INSERT INTO wishlist ("id", "userId", "productId", "createdAt") VALUES ($1, $2, $3, $4)',
          [id, userId, productId, new Date().toISOString()]
        );
        const result = await pool.query('SELECT * FROM wishlist WHERE "id" = $1', [id]);
        return result.rows[0];
      },
      remove: async (userId: number, productId: number) => {
        const result = await pool.query('DELETE FROM wishlist WHERE "userId" = $1 AND "productId" = $2', [userId, productId]);
        return (result.rowCount ?? 0) > 0;
      },
      isInWishlist: async (userId: number, productId: number) => {
        const result = await pool.query('SELECT 1 FROM wishlist WHERE "userId" = $1 AND "productId" = $2', [userId, productId]);
        return result.rows.length > 0;
      }
    },
    carts: {
      get: async (userId: number) => {
        const result = await pool.query('SELECT * FROM carts WHERE "userId" = $1', [userId]);
        let cart = result.rows[0];
        if (!cart) {
          await pool.query('INSERT INTO carts ("userId", "items", "updatedAt") VALUES ($1, $2, $3)', [userId, '[]', new Date().toISOString()]);
          cart = { userId, items: [], updatedAt: new Date().toISOString() };
        }
        return { ...cart, items: typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items };
      },
      update: async (userId: number, items: any[]) => {
        await pool.query(
          'INSERT INTO carts ("userId", "items", "updatedAt") VALUES ($1, $2, $3) ON CONFLICT("userId") DO UPDATE SET "items" = EXCLUDED."items", "updatedAt" = EXCLUDED."updatedAt"',
          [userId, JSON.stringify(items), new Date().toISOString()]
        );
        return { userId, items, updatedAt: new Date().toISOString() };
      },
      clear: async (userId: number) => {
        await pool.query('DELETE FROM carts WHERE "userId" = $1', [userId]);
      }
    },
    reviews: {
      getAll: async (productId?: number) => {
        if (productId) {
          const result = await pool.query('SELECT * FROM reviews WHERE "productId" = $1', [productId]);
          return result.rows;
        }
        const result = await pool.query('SELECT * FROM reviews');
        return result.rows;
      },
      getAllReviews: async () => {
        const result = await pool.query('SELECT * FROM reviews');
        return result.rows;
      },
      getByUser: async (userId: number) => {
        const result = await pool.query('SELECT * FROM reviews WHERE "userId" = $1', [userId]);
        return result.rows;
      },
      create: async (userId: number, review: any) => {
        const id = `rev-${Date.now()}`;
        const createdAt = new Date().toISOString();
        await pool.query(
          'INSERT INTO reviews ("id", "userId", "productId", "rating", "comment", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
          [id, userId, review.productId, review.rating, review.comment, createdAt]
        );

        const revsResult = await pool.query('SELECT "rating" FROM reviews WHERE "productId" = $1', [review.productId]);
        const revs = revsResult.rows;
        const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
        await pool.query('UPDATE products SET "averageRating" = $1, "reviewCount" = $2 WHERE "id" = $3', [avg, revs.length, review.productId]);

        return { ...review, id, userId, createdAt };
      },
      delete: async (reviewId: string) => {
        const result = await pool.query('SELECT "productId" FROM reviews WHERE "id" = $1', [reviewId]);
        const r = result.rows[0];
        if (!r) return false;
        await pool.query('DELETE FROM reviews WHERE "id" = $1', [reviewId]);

        const revsResult = await pool.query('SELECT "rating" FROM reviews WHERE "productId" = $1', [r.productId]);
        const revs = revsResult.rows;
        const avg = revs.length > 0 ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 0;
        await pool.query('UPDATE products SET "averageRating" = $1, "reviewCount" = $2 WHERE "id" = $3', [avg, revs.length, r.productId]);
        return true;
      }
    },
    categories: {
      getAll: async (): Promise<string[]> => {
        const result = await pool.query('SELECT "name" FROM categories');
        const cats = result.rows;
        if (cats.length === 0) {
          const productsResult = await pool.query('SELECT DISTINCT "category" FROM products');
          const products = productsResult.rows;
          const names = products.map(p => p.category).filter(Boolean);
          for (const name of names) {
            await pool.query('INSERT INTO categories ("name") VALUES ($1) ON CONFLICT DO NOTHING', [name]);
          }
          return names.sort();
        }
        return cats.map(c => c.name).sort();
      },
      update: async (categories: string[]) => {
        await pool.query('DELETE FROM categories');
        for (const name of categories) {
          await pool.query('INSERT INTO categories ("name") VALUES ($1)', [name]);
        }
      }
    }
  };
};

export async function closeDatabase() {
  await pool.end();
}
