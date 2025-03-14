const express = require("express");
const pool = require("../models/db"); // Make sure this is correctly imported
const router = express.Router();

// 🟢 Get Total Number of Items
router.get("/total-items", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total FROM items");
    res.json({ totalItems: parseInt(result.rows[0].total) });
  } catch (error) {
    console.error("Error fetching total items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🟡 Get Number of Low Stock Items
router.get("/low-stock", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS low_stock FROM items WHERE quantity < 1"
    );
    res.json({ lowStock: parseInt(result.rows[0].low_stock) });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
