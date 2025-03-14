// Express API for Inventory Management
require("dotenv").config();
const express = require("express");
const pool = require("./models/db");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.json()); // ⬅️ This enables JSON body parsing


const PORT = process.env.PORT || 5001;

// Get all categories
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all items
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get low-stock items (where quantity < minimum_stock)
app.get("/items/low-stock", async (req, res) => {
  try {
    console.log("🔍 Fetching low-stock items...");
    const result = await pool.query(
      "SELECT * FROM items WHERE quantity < minimum_stock"
    );
    console.log("✅ Low-stock items retrieved:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching low-stock items:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new item
app.post("/items", async (req, res) => {
  const {
    item_no,
    description,
    unit,
    quantity,
    minimum_stock,
    on_order,
    on_contract,
    to_order,
    category_id,
  } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO items (item_no, description, unit, quantity, minimum_stock, on_order, on_contract, to_order, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        item_no,
        description,
        unit,
        quantity,
        minimum_stock,
        on_order,
        on_contract,
        to_order,
        category_id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an item
app.delete("/items/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Default Route
app.get("/", (req, res) => {
  res.send("Inventory API is running!");
});

// Adjust Item Quantity (Increase or Decrease)
app.put("/items/:id/adjust", async (req, res) => {
    const { amount } = req.body;  // Get 'amount' from request body
    const itemId = req.params.id; // Get item ID from URL params

    console.log(`🔄 Adjusting quantity for item ID: ${itemId}, Amount: ${amount}`);

    // Ensure 'amount' is received and valid
    if (amount === undefined || isNaN(amount)) {
        console.error("❌ Invalid amount:", amount);
        return res.status(400).json({ error: "Invalid amount provided" });
    }

    try {
        const result = await pool.query(
            "UPDATE items SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
            [amount, itemId]
        );

        if (result.rowCount === 0) {
            console.error("❌ Item not found:", itemId);
            return res.status(404).json({ error: "Item not found" });
        }

        console.log("✅ Quantity updated successfully:", result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Server error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get total count of items
app.get("/stats/total-items", async (req, res) => {
    try {
      const result = await pool.query("SELECT COUNT(*) FROM items");
      res.json({ totalItems: result.rows[0].count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get count of low-stock items (where quantity < minimum_stock)
  app.get("/stats/low-stock", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT COUNT(*) FROM items WHERE quantity < minimum_stock"
      );
      res.json({ lowStock: result.rows[0].count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get most-added item (item with highest quantity)
  app.get("/stats/most-added", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT description, quantity FROM items ORDER BY quantity DESC LIMIT 1"
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get recently updated items (last 5 updated items)
  app.get("/stats/recent-updates", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT description, quantity FROM items ORDER BY id DESC LIMIT 5"
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  




app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
