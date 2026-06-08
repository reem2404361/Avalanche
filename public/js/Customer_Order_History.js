// Sidebar toggle 
const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector("aside");
const mainContent = document.querySelector(".main-content");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded-main");
});

// Custom cursor 
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");

document.addEventListener("mousemove", (e) => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

// Orders logic 
const API_BASE = "/api/orders";

let allOrders = [];
let activeFilter = "all";

// Helpers
function getIconSVG(category) {
  if (category === "maintenance") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
      <path fill="none" stroke="#000000" stroke-width="2"
        d="M12 22S3 18 3 5l9-3l9 3c0 13-9 17-9 17ZM4 11h16m-8-9v20"/>
    </svg>`;
  }
  if (category === "upgrade") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
      <path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13 3v7h6l-8 11v-7H5l8-11"/>
    </svg>`;
  }
  // default: hardware
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M153.8 96C123.8 96 97.8 116.8 91.3 146.1L41.6 370.1C32.7 410.1 63.1 448 104 448L288.1 448L288.1 512L224.1 512C206.4 512 192.1 526.3 192.1 544C192.1 561.7 206.4 576 224.1 576L416.1 576C433.8 576 448.1 561.7 448.1 544C448.1 526.3 433.8 512 416.1 512L352.1 512L352.1 448L536.2 448C577.1 448 607.6 410.1 598.7 370.1L548.9 146.1C542.4 116.8 516.5 96 486.5 96L153.8 96z"/>
  </svg>`;
}

function deriveCategory(productName = "") {
  const name = productName.toLowerCase();
  if (
    name.includes("maintenance") ||
    name.includes("service") ||
    name.includes("cleaning") ||
    name.includes("optimization")
  )
    return "maintenance";
  if (
    name.includes("upgrade") ||
    name.includes("battery") ||
    name.includes("expansion") ||
    name.includes("storage")
  )
    return "upgrade";
  return "hardware";
}

function formatDate(isoString) {
  return new Date(isoString)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .replace(",", " ,");
}

function formatCurrency(amount) {
  return (
    "EGP " +
    Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })
  );
}

function statusClass(status) {
  if (status === "approved") return "completed";
  if (status === "rejected") return "processing";
  return "processing"; // pending
}

function statusLabel(status) {
  if (status === "approved") return "Completed";
  if (status === "rejected") return "Rejected";
  return "Processing"; // pending
}

// Build a single order card 
function buildOrderCard(order) {
  const firstItem = order.items?.[0] || {};
  const productName = firstItem.product?.name || "Solar Product";
  const productDesc = firstItem.product?.description || "";
  const category = deriveCategory(productName);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const isHighlight = category !== "maintenance";
  const shortId = String(order._id).slice(-8).toUpperCase();

  return `
    <div class="order-card" data-category="${category}" data-id="${order._id}">
      <div class="icon">
        ${getIconSVG(category)}
      </div>
      <div class="card-content">
        <div class="order-info">
          <div class="order-type${isHighlight ? '" id="type-diff"' : '"'}>${categoryLabel}</div>
          <div class="order-id">ID: ${shortId}</div>
        </div>
        <h2>${productName}</h2>
        <p>${productDesc}</p>
      </div>
      <div class="date">
        <h4>Placed On</h4>
        <p>${formatDate(order.createdAt)}</p>
      </div>
      <div class="amount">
        <h4>Amount</h4>
        <p>${formatCurrency(order.totalPrice)}</p>
      </div>
      <div class="status">
        <h4>Status</h4>
        <p class="${statusClass(order.status)}">${statusLabel(order.status)}</p>
      </div>
      <div class="invoice">
        <button class="invoice-btn" onclick="downloadInvoice('${order._id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
            <path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12"/>
          </svg>
          Invoice
        </button>
      </div>
    </div>`;
}

// Render orders into the container 
function renderOrders(orders) {
  const container = document.getElementById("orders-container");
  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div style="padding:60px;text-align:center;color:var(--surface);opacity:0.6;">
        No orders found.
      </div>`;
    return;
  }
  container.innerHTML = orders.map(buildOrderCard).join("");
}

// Total investment display 
function updateTotalInvestment(orders) {
  const total = (orders || []).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const el = document.getElementById("total-investment");
  if (el) el.textContent = formatCurrency(total);
}

// Filter tabs
function applyFilter(filter) {
  activeFilter = filter;

  // Update active tab highlight
  document.querySelectorAll(".option").forEach((opt) => {
    if (opt.dataset.filter === filter) {
      opt.id = "current-option";
    } else {
      opt.removeAttribute("id");
    }
  });

  const filtered =
    filter === "all"
      ? allOrders
      : allOrders.filter((o) => {
          const name = o.items?.[0]?.product?.name || "";
          return deriveCategory(name) === filter;
        });

  renderOrders(filtered);
}

// Invoice placeholder 
function downloadInvoice(orderId) {
  // TODO: implement invoice download endpoint
  alert("Invoice download coming soon for order " + orderId);
}

// Main fetch 
async function loadOrders() {
  const container = document.getElementById("orders-container");
  container.innerHTML = `
    <div style="padding:60px;text-align:center;color:var(--surface);opacity:0.6;">
      Loading orders…
    </div>`;

  try {
    const res = await fetch(`${API_BASE}/my`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    allOrders = data.data || [];

    updateTotalInvestment(allOrders);
    applyFilter(activeFilter);
  } catch (err) {
    container.innerHTML = `
      <div style="padding:60px;text-align:center;color:#c0392b;">
        Failed to load orders: ${err.message}
      </div>`;
  }
}

// Boot 
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".option").forEach((opt) => {
    opt.addEventListener("click", () => applyFilter(opt.dataset.filter));
  });

  loadOrders();
});
