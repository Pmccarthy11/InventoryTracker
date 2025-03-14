require('dotenv').config();

const adminAuth = (req, res, next) => {
    console.log("🔍 Checking admin password..."); // Debugging log

    const { adminPassword } = req.body; // Expect adminPassword in request body

    if (!adminPassword) {
        console.log("❌ Admin password missing!");
        return res.status(403).json({ error: "Admin password required" });
    }

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        console.log("❌ Invalid admin password!");
        return res.status(401).json({ error: "Invalid admin password" });
    }

    console.log("✅ Admin authenticated successfully!");
    next(); // Continue if password is correct
};

module.exports = adminAuth;
