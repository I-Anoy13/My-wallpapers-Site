import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('wallpaper_vault.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  -- ... (rest of the tables)
`);

// Re-executing the full schema to be safe since I'm replacing the block
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallpapers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cloudinary_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    tags TEXT,
    width INTEGER,
    height INTEGER,
    dominant_colors TEXT,
    download_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    wallpaper_id INTEGER,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallpaper_id) REFERENCES wallpapers(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    wallpaper_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallpaper_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallpaper_id) REFERENCES wallpapers(id)
  );
`);

// Seed initial categories if empty
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (categoryCount.count === 0) {
  const categories = [
    { name: 'Nature', slug: 'nature' },
    { name: 'City', slug: 'city' },
    { name: 'Abstract', slug: 'abstract' },
    { name: 'Anime', slug: 'anime' },
    { name: 'Minimalist', slug: 'minimalist' },
    { name: 'Dark', slug: 'dark' },
    { name: 'Space', slug: 'space' }
  ];
  const insert = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
  categories.forEach(cat => insert.run(cat.name, cat.slug));
}

// Seed Admin User
const adminEmail = process.env.ADMIN_EMAIL || 'admin@wallpaper-vault.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'System Admin',
    adminEmail,
    hashedPassword,
    'ADMIN'
  );
  console.log(`Admin user created: ${adminEmail}`);
}

export default db;
