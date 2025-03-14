const xlsx = require("xlsx");
const pool = require("./models/db");
const path = require("path");

// Load Excel file
const filePath = path.join(__dirname, "Inventory jan 2023.xlsx");
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { defval: "" }); // Ensures empty cells are converted to empty strings

// Function to insert inventory data into PostgreSQL
const importInventory = async () => {
  try {
    for (let row of data) {
      const item_no = row["McCarthy's Heating Service Ltd."]?.trim() || null;
      const description = row["__EMPTY"]?.trim() || "";
      const unit = row["__EMPTY_1"]?.trim() || "";
      const quantity = parseInt(row["__EMPTY_2"], 10) || 0;
      const minimum_stock = parseInt(row["__EMPTY_3"], 10) || 0;
      const on_order = parseInt(row["__EMPTY_4"], 10) || 0;
      const on_contract = parseInt(row["__EMPTY_5"], 10) || 0;
      const to_order = parseInt(row["__EMPTY_6"], 10) || 0;

      // Skip rows with missing item_no
      if (!item_no || item_no.includes("Generated On:")) {
        console.log("Skipping row due to missing or invalid item_no:", row);
        continue;
      }

      // Insert into database
      await pool.query(
        `INSERT INTO items (item_no, description, unit, quantity, minimum_stock, on_order, on_contract, to_order)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (item_no) DO UPDATE SET 
                 description = EXCLUDED.description, quantity = EXCLUDED.quantity, 
                 minimum_stock = EXCLUDED.minimum_stock, on_order = EXCLUDED.on_order, 
                 on_contract = EXCLUDED.on_contract, to_order = EXCLUDED.to_order;`,
        [
          item_no,
          description,
          unit,
          quantity,
          minimum_stock,
          on_order,
          on_contract,
          to_order,
        ]
      );
    }
    console.log("Inventory data imported successfully!");
  } catch (err) {
    console.error("Error importing inventory:", err);
  } finally {
    pool.end();
  }
};

importInventory();
