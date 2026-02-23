import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/db";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

app.use(express.json());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
};

// --- API ROUTES ---

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashedPassword);
    const token = jwt.sign({ id: result.lastInsertRowid, email, role: "USER" }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role: "USER" } });
  } catch (err: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Wallpapers
app.get("/api/wallpapers", (req, res) => {
  const { category, search, sort, limit = 20, offset = 0 } = req.query;
  let query = "SELECT w.*, c.name as category_name FROM wallpapers w LEFT JOIN categories c ON w.category_id = c.id WHERE 1=1";
  const params: any[] = [];

  if (category) {
    query += " AND c.slug = ?";
    params.push(category);
  }
  if (search) {
    query += " AND (w.title LIKE ? OR w.tags LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sort === "popular") query += " ORDER BY w.download_count DESC";
  else if (sort === "random") query += " ORDER BY RANDOM()";
  else query += " ORDER BY w.created_at DESC";

  query += " LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  const wallpapers = db.prepare(query).all(...params);
  res.json(wallpapers);
});

app.get("/api/wallpapers/:id", (req, res) => {
  const wallpaper = db.prepare("SELECT w.*, c.name as category_name FROM wallpapers w LEFT JOIN categories c ON w.category_id = c.id WHERE w.id = ?").get(req.params.id);
  if (!wallpaper) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE wallpapers SET views = views + 1 WHERE id = ?").run(req.params.id);
  res.json(wallpaper);
});

app.post("/api/wallpapers/:id/download", authenticate, (req: any, res) => {
  db.prepare("UPDATE wallpapers SET download_count = download_count + 1 WHERE id = ?").run(req.params.id);
  db.prepare("INSERT INTO downloads (user_id, wallpaper_id) VALUES (?, ?)").run(req.user.id, req.params.id);
  res.json({ success: true });
});

// Favorites
app.get("/api/user/favorites", authenticate, (req: any, res) => {
  const favorites = db.prepare(`
    SELECT w.* FROM favorites f 
    JOIN wallpapers w ON f.wallpaper_id = w.id 
    WHERE f.user_id = ?
  `).all(req.user.id);
  res.json(favorites);
});

app.post("/api/wallpapers/:id/favorite", authenticate, (req: any, res) => {
  try {
    db.prepare("INSERT INTO favorites (user_id, wallpaper_id) VALUES (?, ?)").run(req.user.id, req.params.id);
    res.json({ favorite: true });
  } catch (err) {
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND wallpaper_id = ?").run(req.user.id, req.params.id);
    res.json({ favorite: false });
  }
});

// Categories
app.get("/api/categories", (req, res) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  res.json(categories);
});

app.post("/api/admin/categories", authenticate, isAdmin, (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/ /g, "-");
  try {
    const result = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(name, slug);
    res.json({ id: result.lastInsertRowid, name, slug });
  } catch (err) {
    res.status(400).json({ error: "Category already exists" });
  }
});

app.delete("/api/admin/categories/:id", authenticate, isAdmin, (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Site Settings (Simple mock storage in DB or memory)
let siteSettings = {
  adEnabled: true,
  adTimer: 5,
  siteName: "4K Wallpaper Vault"
};

app.get("/api/settings", (req, res) => {
  res.json(siteSettings);
});

app.post("/api/admin/settings", authenticate, isAdmin, (req, res) => {
  siteSettings = { ...siteSettings, ...req.body };
  res.json(siteSettings);
});

// Admin Stats
app.get("/api/admin/stats", authenticate, isAdmin, (req, res) => {
  const totalWallpapers = db.prepare("SELECT COUNT(*) as count FROM wallpapers").get() as any;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  const totalDownloads = db.prepare("SELECT COUNT(*) as count FROM downloads").get() as any;
  const topWallpapers = db.prepare("SELECT title, download_count FROM wallpapers ORDER BY download_count DESC LIMIT 5").all();
  
  res.json({
    totalWallpapers: totalWallpapers.count,
    totalUsers: totalUsers.count,
    totalDownloads: totalDownloads.count,
    topWallpapers
  });
});

// Admin Wallpaper Management
app.post("/api/admin/wallpapers", authenticate, isAdmin, (req, res) => {
  const { cloudinary_id, url, title, description, category_id, tags, width, height, dominant_colors } = req.body;
  const result = db.prepare(`
    INSERT INTO wallpapers (cloudinary_id, url, title, description, category_id, tags, width, height, dominant_colors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(cloudinary_id, url, title, description, category_id, tags, width, height, JSON.stringify(dominant_colors));
  res.json({ id: result.lastInsertRowid });
});

app.delete("/api/admin/wallpapers/:id", authenticate, isAdmin, (req, res) => {
  db.prepare("DELETE FROM wallpapers WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Admin User Management
app.get("/api/admin/users", authenticate, isAdmin, (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, created_at FROM users").all();
  res.json(users);
});

app.patch("/api/admin/users/:id/role", authenticate, isAdmin, (req, res) => {
  const { role } = req.body;
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  res.json({ success: true });
});

// Admin File Upload to Cloudinary
app.post("/api/admin/upload", authenticate, isAdmin, upload.single("image"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "wallpaper_vault",
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      cloudinary_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
