const pool = require("./models/db");

const testDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to database:", res.rows);
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    pool.end();
  }
};

testDB();
