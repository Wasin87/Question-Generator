import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// On Vercel, we use /tmp for the database, but remember it's ephemeral!
const dbPath = process.env.VERCEL ? "/tmp/questions.db" : "questions.db";
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT,
    class_name TEXT,
    marks INTEGER,
    duration TEXT,
    quantity INTEGER,
    content TEXT,
    questions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
app.use(express.json());

// API Routes
app.post("/api/save-questions", async (req, res) => {
  const { topic, className, marks, duration, quantity, content, questions } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO history (topic, class_name, marks, duration, quantity, content, questions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(topic, className, marks, duration, quantity, content, JSON.stringify(questions));
    res.json({ id: info.lastInsertRowid });
  } catch (error: any) {
    console.error("Save History Error:", error);
    res.status(500).json({ error: "Failed to save questions to history" });
  }
});

app.get("/api/history", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM history ORDER BY created_at DESC").all();
    res.json(rows.map(row => ({
      ...row,
      questions: JSON.parse(row.questions)
    })));
  } catch (error) {
    res.json([]);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

app.delete("/api/history/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM history WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// Vite Integration
async function setupServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }
}

setupServer();

export default app;

// Only listen if not running as a serverless function
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
