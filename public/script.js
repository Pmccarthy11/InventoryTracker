


// Fetch All Items
function fetchItems() {
  fetch("/items")
    .then((response) => response.json())
    .then((data) => {
      displayItems(data);
    })
    .catch((error) => console.error("Error fetching items:", error));
}

// Fetch Low-Stock Items
function fetchLowStock() {
  fetch("/items/low-stock")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        alert("✅ No low-stock items!");
      }
      displayItems(data, true);
    })
    .catch((error) => console.error("Error fetching low-stock items:", error));
}

// Display Items in List with Aligned Buttons
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
document
  .getElementById("addItemForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const newItem = {
      item_no: document.getElementById("item_no").value,
      description: document.getElementById("description").value,
      unit: document.getElementById("unit").value,
      quantity: document.getElementById("quantity").value,
    };

    fetch("/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("✅ Item added!");
        fetchItems(); // Refresh inventory list
      })
      .catch((error) => console.error("Error adding item:", error));
  });

// Delete Item
function deleteItem(id) {
  if (confirm("❗ Are you sure you want to delete this item?")) {
    fetch(`/items/${id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        alert("✅ Item deleted!");
        fetchItems(); // Refresh inventory
      })
      .catch((error) => console.error("Error deleting item:", error));
  }
}


function adjustQuantity(id, amount) {
    fetch(`http://localhost:5001/items/${id}/adjust`, {  // Make sure this is correct!
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            document.getElementById(`qty-${id}`).textContent = data.quantity;
        }
    })
    .catch(error => console.error("Error updating quantity:", error));
}

function toggleAddItemForm() {
    const formContainer = document.getElementById("addItemContainer");

    if (formContainer.classList.contains("hidden")) {
        formContainer.classList.remove("hidden");
    } else {
        formContainer.classList.add("hidden");
    }
}

document.getElementById("toggleAddItem").addEventListener("click", function () {
    const formContainer = document.getElementById("addItemContainer");
    formContainer.style.display =
      formContainer.style.display === "none" ? "block" : "none";
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const body = document.body;
  
    // Check if dark mode was previously enabled
    if (localStorage.getItem("darkMode") === "enabled") {
      body.classList.add("dark-mode");
    }
  
    darkModeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
  
      // Save user preference
      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
      } else {
        localStorage.setItem("darkMode", "disabled");
      }
    });
  });
  

  async function loadStats() {
    try {
      const totalRes = await fetch("/stats/total-items");  // Fetch total items
      const lowStockRes = await fetch("/stats/low-stock"); // Fetch low-stock count
  
      const totalData = await totalRes.json();
      const lowStockData = await lowStockRes.json();
  
      // Update the UI
      document.getElementById("totalItems").textContent = totalData.totalItems;
      document.getElementById("lowStockItems").textContent = lowStockData.lowStock;
  
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }
  
  // Ensure the stats load when the page loads
  window.onload = () => {
    loadStats();
    fetchItems(); // Load inventory
    loadChart();
  };
  
  
  // Load stats when the page loads
  window.onload = () => {
    loadStats();
    fetchItems(); // Ensure inventory is loaded
  };
  

  async function loadChart() {
    try {
      const res = await fetch("/items"); // Get all items
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
  
  // Load chart after the page loads
  window.onload = () => {
    loadStats();
    loadChart();
    fetchItems();
  };
  