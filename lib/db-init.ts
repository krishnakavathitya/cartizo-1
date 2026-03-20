import { getDatabase } from './db';
import bcrypt from 'bcryptjs';

export function initializeDatabase() {
  try {
    const db = getDatabase();

    // Check if admin already exists
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = db.users.getByEmail(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('Admin@123', 10);
      db.users.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('✅ Default admin created:', adminEmail);
    } else {
      console.log('ℹ️  Admin already exists');
    }

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Auto-initialize on import
initializeDatabase();

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase();
  console.log('Database setup complete!');
  process.exit(0);
}
