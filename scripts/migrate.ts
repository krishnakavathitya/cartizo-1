import { getDatabase } from '../lib/db';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = path.join(process.cwd(), 'data');

async function migrate() {
    try {
        console.log('🚀 Starting migration function...');
        const db = getDatabase();
        console.log('📦 Database object initialized');

        const dbPath = path.join(process.cwd(), 'database.sqlite');
        console.log('Opening database at:', dbPath);
        const dbConn = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('🧹 Clearing existing data...');
        await dbConn.run('DELETE FROM users');
        await dbConn.run('DELETE FROM products');
        await dbConn.run('DELETE FROM addresses');
        await dbConn.run('DELETE FROM orders');
        await dbConn.run('DELETE FROM wishlist');
        await dbConn.run('DELETE FROM carts');
        await dbConn.run('DELETE FROM reviews');
        await dbConn.run('DELETE FROM categories');
        await dbConn.close();
        console.log('✅ SQLite tables cleared');

        const files = {
            users: 'users.json',
            products: 'products.json',
            addresses: 'addresses.json',
            orders: 'orders.json',
            wishlist: 'wishlist.json',
            carts: 'carts.json',
            reviews: 'reviews.json',
            categories: 'categories.json'
        };

        const readJson = (filename: string) => {
            const filePath = path.join(DB_PATH, filename);
            if (!fs.existsSync(filePath)) return [];
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        };

        // Users
        const users = readJson(files.users);
        console.log(`Migrating ${users.length} users...`);
        for (const user of users) {
            try {
                await db.users.create(user);
            } catch (err: any) {
                console.error(`❌ Failed to migrate user ${user.email}:`, err.message);
                throw err;
            }
        }

        // Products
        const products = readJson(files.products);
        console.log(`Migrating ${products.length} products...`);
        for (const product of products) {
            await db.products.create(product);
        }

        // Addresses
        const addresses = readJson(files.addresses);
        console.log(`Migrating ${addresses.length} addresses...`);
        for (const addr of addresses) {
            const { userId, ...rest } = addr;
            await db.addresses.create(userId, rest);
        }

        // Orders
        const orders = readJson(files.orders);
        console.log(`Migrating ${orders.length} orders...`);
        for (const order of orders) {
            const { userId, ...rest } = order;
            await db.orders.create(userId, rest);
        }

        // Wishlist
        const wishlist = readJson(files.wishlist);
        console.log(`Migrating ${wishlist.length} wishlist items...`);
        for (const item of wishlist) {
            await db.wishlist.add(item.userId, item.productId);
        }

        // Carts
        const carts = readJson(files.carts);
        console.log(`Migrating ${carts.length} carts...`);
        for (const cart of carts) {
            await db.carts.update(cart.userId, cart.items);
        }

        // Reviews
        const reviews = readJson(files.reviews);
        console.log(`Migrating ${reviews.length} reviews...`);
        for (const rev of reviews) {
            const { userId, ...rest } = rev;
            await db.reviews.create(userId, rest);
        }

        // Categories
        const categories = readJson(files.categories);
        console.log(`Migrating ${categories.length} categories...`);
        if (categories.length > 0) {
            await db.categories.update(categories);
        }

        console.log('✅ Migration complete!');
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Migration failed:', err.stack || err.message);
        process.exit(1);
    }
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
