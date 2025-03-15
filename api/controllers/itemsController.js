const pool = require("../models/db");

// Get all low-stock items (where quantity < minimum_stock)
exports.getLowStockItems = async (req, res) => {
  try {
    console.log("🔍 Fetching low-stock items..."); // Debugging log
    const result = await pool.query(
      "SELECT * FROM items WHERE quantity < minimum_stock"
    );
    console.log("✅ Low-stock items retrieved:", result.rows); // Debugging log
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching low-stock items:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
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
      `INSERT INTO items (item_no, description, unit, quantity, minimum_stock, on_order, on_contract, to_order, category_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  const {
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
      `UPDATE items SET description = $1, unit = $2, quantity = $3, minimum_stock = $4, on_order = $5, 
             on_contract = $6, to_order = $7, category_id = $8 WHERE id = $9 RETURNING *`,
      [
        description,
        unit,
        quantity,
        minimum_stock,
        on_order,
        on_contract,
        to_order,
        category_id,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
