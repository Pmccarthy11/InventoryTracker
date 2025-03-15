const BASE_URL = "https://your-vercel-backend.vercel.app"; // Update this with your actual backend URL

// Fetch All Items
function fetchItems() {
    fetch(`${BASE_URL}/items`)
        .then((response) => response.json())
        .then((data) => {
            displayItems(data);
        })
        .catch((error) => console.error("Error fetching items:", error));
}

// Fetch Low-Stock Items
function fetchLowStock() {
    fetch(`${BASE_URL}/items/low-stock`)
        .then((response) => response.json())
        .then((data) => {
            if (data.length === 0) {
                alert("✅ No low-stock items!");
            }
            displayItems(data, true);
        })
        .catch((error) => console.error("Error fetching low-stock items:", error));
}

// Display Items in List
function displayItems(data) {
    const list = document.getElementById("inventory-list");
    list.innerHTML = ""; // Clear existing list

    data.forEach((item) => {
        const li = document.createElement("li");
        li.className = "inventory-item";
        li.innerHTML = `
            <span class="item-info">
                (${item.item_no}) ${item.description} - Qty: <span id="qty-${item.id}">${item.quantity}</span>
            </span>
            <div class="item-actions">
                <button class="plus-btn" onclick="adjustQuantity(${item.id}, 1)">➕</button>
                <button class="minus-btn" onclick="adjustQuantity(${item.id}, -1)">➖</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Search Inventory
function searchItems() {
    const query = document.getElementById("search").value.toLowerCase();
    const items = document.querySelectorAll("#inventory-list li");

    items.forEach((item) => {
        if (item.textContent.toLowerCase().includes(query)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

// Add New Item
document.getElementById("addItemForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const newItem = {
        item_no: document.getElementById("item_no").value,
        description: document.getElementById("description").value,
        unit: document.getElementById("unit").value,
        quantity: document.getElementById("quantity").value,
    };

    fetch(`${BASE_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
    })
        .then((response) => response.json())
        .then(() => {
            alert("✅ Item added!");
            fetchItems();
        })
        .catch((error) => console.error("Error adding item:", error));
});

// Delete Item
function deleteItem(id) {
    if (confirm("❗ Are you sure you want to delete this item?")) {
        fetch(`${BASE_URL}/items/${id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                alert("✅ Item deleted!");
                fetchItems();
            })
            .catch((error) => console.error("Error deleting item:", error));
    }
}

// Adjust Item Quantity
function adjustQuantity(id, amount) {
    fetch(`${BASE_URL}/items/${id}/adjust`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                document.getElementById(`qty-${id}`).textContent = data.quantity;
            }
        })
        .catch((error) => console.error("Error updating quantity:", error));
}

// Toggle Add Item Form
document.getElementById("toggleAddItem").addEventListener("click", function () {
    const formContainer = document.getElementById("addItemContainer");
    formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
});

// Dark Mode Toggle
document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const body = document.body;

    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });
});

// Load Stats
async function loadStats() {
    try {
        const totalRes = await fetch(`${BASE_URL}/stats/total-items`);
        const lowStockRes = await fetch(`${BASE_URL}/stats/low-stock`);

        const totalData = await totalRes.json();
        const lowStockData = await lowStockRes.json();

        document.getElementById("totalItems").textContent = totalData.totalItems;
        document.getElementById("lowStockItems").textContent = lowStockData.lowStock;
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// Load Chart Data
async function loadChart() {
    try {
        const res = await fetch(`${BASE_URL}/items`);
        const data = await res.json();

        const topItems = data.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        const labels = topItems.map((item) => item.description);
        const quantities = topItems.map((item) => item.quantity);

        const ctx = document.getElementById("inventoryChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Top 5 Items in Stock",
                        data: quantities,
                        backgroundColor: ["#007bff", "#ff5733", "#ffc107", "#28a745", "#6610f2"],
                    },
                ],
            },
        });
    } catch (error) {
        console.error("Error loading chart:", error);
    }
}

// Initialize Everything
window.onload = () => {
    loadStats();
    loadChart();
    fetchItems();
};
