
let inventory = [
    { id: 1, category: 'panels', name: "Luxen 550W Bifacial", price: "8,450", stock: 124, img: "https://s.alicdn.com/@sc04/kf/H31e3a60ac5e94b4b95bb3e81f2b6b186Y.jpg_720x720q50.jpg", meta: "Efficiency: 21.8%" },
    { id: 2, category: 'inverters', name: "Deye 12kW Hybrid", price: "92,000", stock: 5, img: "https://www.deyeinverter.com/deyeinverter/2025/12/05/SUN-5-12K-SG04LP3-EU1.png", meta: "Phase: Three Phase" },
    { id: 3, category: 'storage', name: "Pylontech US5000", price: "58,200", stock: 15, img: "https://cdn11.bigcommerce.com/s-fv94jpligr/images/stencil/1280x1280/products/1257/3249/Pylontech_Stack_frankensolar__66533.1614896264.1280.1280__03433.1690579455.jpg?c=1", meta: "Capacity: 4.8 kWh" },
    { id: 4, category: 'panels', name: "Alu-Mount 890W Bifacial", price: "15,870", stock: 133, img: "https://media.rs-online.com/image/upload/bo_1.5px_solid_white,b_auto,c_pad,dpr_2,f_auto,h_399,q_auto,w_710/c_pad,h_399,w_710/Y2651114-01?pgw=1", meta: "Efficiency: 21.8%" },
    { id: 5, category: 'inverters', name: "Hoymiles HMS-2000", price: "14,300", stock: 100, img: "https://kizuna.ca/wp-content/uploads/2025/01/hoymiles-hms-2000-series-1.png", meta: "Phase: Three Phase" },
    { id: 6, category: 'storage', name: "BYD Battery-Box HVS", price: "31,200", stock: 30, img: "https://www.mg-solar-shop.com/media/image/03/d5/2e/114321-BYD-Battery-Box-HVS-5-1-Batteriespeicher-512-kWh-1_600x600.png", meta: "Capacity: 4.8 kWh" }
];

let editId = null;
let activeFilter = 'all';

function renderInventory() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    const filtered = activeFilter === 'all' ? inventory : inventory.filter(item => item.category === activeFilter);

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
                    <span class="status-tag ${item.stock <= 5 ? 'low-stock' : 'in-stock'}">${item.stock <= 5 ? 'Low Stock: ' : 'In Stock: '}${item.stock}</span>
                    <img src="${item.img}" class="prod-img">
                    <div class="prod-info"><div class="prod-name">${item.name}</div><div class="prod-price">EGP ${item.price}</div></div>
                    <div class="prod-meta"><span>${item.meta}</span><div>
                    <span class="action-btn" onclick="openModal(${item.id})">EDIT</span>
                    <span class="action-btn delete-btn" onclick="deleteProduct(${item.id})">DELETE</span></div></div>
                `;
        grid.appendChild(card);
    });
}

function filterBy(cat, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    activeFilter = cat;
    renderInventory();
}

function openModal(id = null) {
    editId = id;
    document.getElementById('product-modal').style.display = 'flex';
    if (id) {
        const item = inventory.find(p => p.id === id);
        document.getElementById('p-name').value = item.name;
        document.getElementById('p-price').value = item.price;
        document.getElementById('p-stock').value = item.stock;
        document.getElementById('p-category').value = item.category;
        document.getElementById('p-img').value = item.img;
        document.getElementById('modal-title').innerText = "Edit Product";
    } else {
        document.getElementById('modal-title').innerText = "Add New Product";
        document.getElementById('p-name').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-stock').value = '';
        document.getElementById('p-img').value = '';
    }
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }

function saveProduct() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const stock = document.getElementById('p-stock').value;
    const category = document.getElementById('p-category').value;
    const img = document.getElementById('p-img').value;

    if (editId) {
        const idx = inventory.findIndex(p => p.id === editId);
        inventory[idx] = { ...inventory[idx], name, price, stock, category, img };
    } else {
        inventory.push({ id: Date.now(), category, name, price, stock, img, meta: "Fresh Inventory" });
    }
    renderInventory();
    closeModal();
}

function deleteProduct(id) {
    if (confirm("Delete this item?")) {
        inventory = inventory.filter(p => p.id !== id);
        renderInventory();
    }
}

const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector("aside");
const mainContent = document.getElementById("main-content");
const nav = document.querySelector("nav");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded-main");
    nav.classList.toggle("expanded-nav");
});

const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");

document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
});

renderInventory();
