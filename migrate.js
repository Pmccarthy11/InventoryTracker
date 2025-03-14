const pool = require("./models/db");

const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        item_no VARCHAR(50) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        unit VARCHAR(50),
        quantity INTEGER DEFAULT 0,
        minimum_stock INTEGER DEFAULT 0,
        on_order INTEGER DEFAULT 0,
        on_contract INTEGER DEFAULT 0,
        to_order INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        order_quantity INTEGER NOT NULL,
        order_status VARCHAR(50) CHECK (order_status IN ('Pending', 'Ordered', 'Received')),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

  try {
    await pool.query(query);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
};

createTables();
