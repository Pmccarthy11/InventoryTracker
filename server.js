// Load environment variables
require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors"); // Enable CORS
const path = require("path");

const app = express();

// ✅ Enable CORS to allow frontend to connect
app.use(cors());

// ✅ Parse JSON requests
app.use(express.json());

// ✅ Serve static files (for frontend on Vercel)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Connect to PostgreSQL (Neon Database)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon requires SSL
});

// ✅ Test database connection
pool.connect()
    .then(() => console.log("✅ Connected to Neon PostgreSQL"))
    .catch((err) => console.error("❌ Database connection failed:", err));

// ✅ Serve the frontend (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Get all items
app.get("/items", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM items");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get low-stock items (where quantity < 1)
app.get("/items/low-stock", async (req, res) => {
    try {
        console.log("🔍 Fetching low-stock items...");
        const result = await pool.query("SELECT * FROM items WHERE quantity < 1");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Add a new item
app.post("/items", async (req, res) => {
    const { item_no, description, unit, quantity } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO items (item_no, description, unit, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
            [item_no, description, unit, quantity]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete an item
app.delete("/items/:id", async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Adjust Item Quantity (Increase or Decrease)
app.put("/items/:id/adjust", async (req, res) => {
    const { amount } = req.body;
    const itemId = req.params.id;

    if (amount === undefined || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount provided" });
    }

    try {
        const result = await pool.query(
            "UPDATE items SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
            [amount, itemId]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Item not found" });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Statistics Routes
app.get("/stats/total-items", async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM items");
        res.json({ totalItems: result.rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/stats/low-stock", async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM items WHERE quantity < 1");
        res.json({ lowStock: result.rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Deploy on Vercel as an API (Serverless)
module.exports = app;
