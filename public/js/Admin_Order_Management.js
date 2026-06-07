// Sidebar toggle
const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector("aside");
const mainContent = document.getElementById("main-content");
const nav = document.getElementById("admin-nav");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded-main");
  nav.classList.toggle("expanded-nav");
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
const PAGE_SIZE = 10;

let allOrders = [];
let currentPage = 1;
let activeFilter = "all"; // 'all' | 'pending' | 'approved'
let searchQuery = "";
let openMenuId = null; // which row's context menu is open

// Helpers
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status) {
  const map = {
    approved: '<div class="status approved">APPROVED</div>',
    pending: '<div class="status pending">Pending</div>',
    rejected: '<div class="status rejected">Rejected</div>',
  };
  return map[status] || `<div class="status pending">${status}</div>`;
}

function solutionType(order) {
  const name = order.items?.[0]?.product?.name || "—";
  const alt =
    name.toLowerCase().includes("aurora") ||
    name.toLowerCase().includes("compact");
  return `
    <td class="solution-type${alt ? " different" : ""}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"/>
      </svg>
      ${name}
    </td>`;
}

const DOTS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z"/>
</svg>`;

//Context menu (approve / reject)
function buildContextMenu(orderId, currentStatus) {
  const canApprove = currentStatus !== "approved";
  const canReject = currentStatus !== "rejected";
  return `
    <div class="context-menu" id="menu-${orderId}">
      ${canApprove ? `<button onclick="updateStatus('${orderId}', 'approved')">✔ Approve</button>` : ""}
      ${canReject ? `<button onclick="updateStatus('${orderId}', 'rejected')">✖ Reject</button>` : ""}
      <button onclick="viewOrder('${orderId}')">👁 View Details</button>
    </div>`;
}

function toggleMenu(orderId, status) {
  if (openMenuId && openMenuId !== orderId) {
    const prev = document.getElementById(`menu-${openMenuId}`);
    if (prev) prev.remove();
  }

  const existing = document.getElementById(`menu-${orderId}`);
  if (existing) {
    existing.remove();
    openMenuId = null;
    return;
  }

  const btn = document.getElementById(`dots-${orderId}`);
  if (!btn) return;
  btn.insertAdjacentHTML("afterend", buildContextMenu(orderId, status));
  openMenuId = orderId;
}

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    openMenuId &&
    !e.target.closest(".context-menu") &&
    !e.target.closest(".dots-btn")
  ) {
    const menu = document.getElementById(`menu-${openMenuId}`);
    if (menu) menu.remove();
    openMenuId = null;
  }
});

// Status update 
async function updateStatus(orderId, newStatus) {
  const menu = document.getElementById(`menu-${orderId}`);
  if (menu) menu.remove();
  openMenuId = null;

  try {
    const res = await fetch(`${API_BASE}/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    // Update local data and re-render without a full reload
    const order = allOrders.find((o) => o._id === orderId);
    if (order) order.status = newStatus;

    updateStatCards();
    renderTable();
  } catch (err) {
    alert("Failed to update order: " + err.message);
  }
}

// View order detail (placeholder)
function viewOrder(orderId) {
  // TODO: navigate to a detail page or open a modal
  alert("Order detail view coming soon for " + orderId);
}

// Filtering & searching 
function getFilteredOrders() {
  return allOrders.filter((order) => {
    if (activeFilter !== "all" && order.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const id = String(order._id).toLowerCase();
      const name = (order.user?.name || "").toLowerCase();
      if (!id.includes(q) && !name.includes(q)) return false;
    }
    return true;
  });
}

// Table rendering
function renderTable() {
  const tbody = document.querySelector(".table-box tbody");
  const footerEl = document.querySelector(".table-footer p");
  const filtered = getFilteredOrders();
  const total = filtered.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = filtered.slice(start, start + PAGE_SIZE);

  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="padding:40px;text-align:center;color:var(--surface);opacity:0.6;">
        No orders found.
      </td></tr>`;
  } else {
    tbody.innerHTML = pageData
      .map((order, idx) => {
        const isLast = idx === pageData.length - 1;
        const shortId = "#EG-" + String(order._id).slice(-5).toUpperCase();
        const location = order.shippingDetails?.deliveryAddress || "";
        const userName = order.user?.name || "—";

        return `
        <tr${isLast ? ' class="last-in-page"' : ""}>
          <td class="order-cell">${shortId}</td>
          <td>
            <div class="name">${userName}</div>
            <div class="location">${location}</div>
          </td>
          ${solutionType(order)}
          <td>${statusBadge(order.status)}</td>
          <td class="date">${formatDate(order.createdAt)}</td>
          <td style="position:relative;">
            <button class="dots-btn" id="dots-${order._id}"
              onclick="toggleMenu('${order._id}', '${order.status}')">
              ${DOTS_SVG}
            </button>
          </td>
        </tr>`;
      })
      .join("");
  }

  if (footerEl) {
    const end = Math.min(start + PAGE_SIZE, total);
    footerEl.textContent = `Showing ${total === 0 ? 0 : start + 1} to ${end} of ${total} entries`;
  }

  renderPagination(total);
}

// Pagination 
function renderPagination(total) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const ul = document.querySelector(".table-footer ul");
  if (!ul) return;

  const delta = 2;
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);
  const pages = [];

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  ul.innerHTML = `
    <li><button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"/>
      </svg>
    </button></li>
    ${pages
      .map((p) =>
        p === "..."
          ? `<li><span>...</span></li>`
          : `<li><button class="${p === currentPage ? "active" : ""}" onclick="changePage(${p})">${p}</button></li>`,
      )
      .join("")}
    <li><button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path d="M439.1 297.4C451.6 309.9 451.6 330.2 439.1 342.7L279.1 502.7C266.6 515.2 246.3 515.2 233.8 502.7C221.3 490.2 221.3 469.9 233.8 457.4L371.2 320L233.9 182.6C221.4 170.1 221.4 149.8 233.9 137.3C246.4 124.8 266.7 124.8 279.2 137.3L439.2 297.3z"/>
      </svg>
    </button></li>`;
}

function changePage(page) {
  const totalPages = Math.max(
    1,
    Math.ceil(getFilteredOrders().length / PAGE_SIZE),
  );
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}

// Stat cards 
function updateStatCards() {
  const active = allOrders.filter((o) => o.status !== "rejected").length;
  const pending = allOrders.filter((o) => o.status === "pending").length;
  const revenue = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  document.getElementById("stat-active").textContent = active.toLocaleString();
  document.getElementById("stat-pending").textContent =
    pending.toLocaleString();
  document.getElementById("stat-revenue").textContent =
    "EGP " + revenue.toLocaleString();
}

// Status filter tabs
function setStatusFilter(filter) {
  activeFilter = filter;
  currentPage = 1;

  document.querySelectorAll(".status div[data-filter]").forEach((div) => {
    div.className = div.dataset.filter === filter ? "select" : "not-selected";
  });

  renderTable();
}

// Main fetch 
async function loadOrders() {
  const tbody = document.querySelector(".table-box tbody");
  tbody.innerHTML = `
    <tr><td colspan="6" style="padding:40px;text-align:center;color:var(--surface);opacity:0.6;">
      Loading orders…
    </td></tr>`;

  try {
    const res = await fetch(API_BASE, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    allOrders = data.data || [];

    updateStatCards();
    renderTable();
  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="padding:40px;text-align:center;color:#c0392b;">
        Failed to load orders: ${err.message}
      </td></tr>`;
  }
}

//  Boot 
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".status div[data-filter]").forEach((div) => {
    div.addEventListener("click", () => setStatusFilter(div.dataset.filter));
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        renderTable();
      }, 300);
    });
  }

  loadOrders();
});
