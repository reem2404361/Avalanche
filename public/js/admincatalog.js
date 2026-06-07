let inventory = []; 
let editId = null;
let activeFilter = 'all';

function fetchAdminInventory() {
    fetch('/api/products')
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch inventory from server');
            return res.json();
        })
        .then(data => {
            const rawProducts = Array.isArray(data) ? data : (data.products || data.data || []);
            
            inventory = rawProducts.map(item => ({
                id: item._id,
                category: item.category,
                name: item.name,
                price: Number(item.price),
                stock: Number(item.quantity),
                img: item.imageUrl || 'https://via.placeholder.com/300',
                description: item.description || 'No detailed specifications listed.'
            }));
            renderInventory();
        })
       
        .catch(err => console.error("Error fetching admin data panel:", err));
}


function renderInventory() {
    const grid = document.getElementById('product-grid');
    if (!grid) {
        console.error("Critical Layout Error: Element with ID 'product-grid' was not found in the DOM.");
        return;
    }
    
    grid.innerHTML = '';
    const filtered = activeFilter === 'all' ? inventory : inventory.filter(item => item.category === activeFilter);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.5; padding: 40px; font-weight: 700; color: var(--primary);">No items discoverable inside this directory block.</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <span class="status-tag ${item.stock <= 5 ? 'low-stock' : 'in-stock'}">
                ${item.stock <= 5 ? 'Low Stock: ' : 'In Stock: '}${item.stock}
            </span>
            <img src="${item.img}" class="prod-img" onerror="this.src='https://via.placeholder.com/300'">
            <div class="prod-info">
                <div class="prod-name">${item.name}</div>
                <div class="prod-price">EGP ${item.price.toLocaleString()}</div>
            </div>
            <div class="prod-meta">
                <p class="prod-description">${item.description}</p>
                <div class="action-container">
                    <span class="action-btn" onclick="openModal('${item.id}')">EDIT</span>
                    <span class="action-btn delete-btn" onclick="deleteProduct('${item.id}')">DELETE</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}


function saveProduct() {
    const name = document.getElementById('p-name').value.trim();
    const price = Number(document.getElementById('p-price').value);
    const quantity = parseInt(document.getElementById('p-stock').value);
    const category = document.getElementById('p-category').value;
    const imageUrl = document.getElementById('p-img').value.trim();
    const description = document.getElementById('p-description').value.trim();

    if (!name) {
        alert("Validation Guard Alert:\nProduct Name is strictly required!");
        return;
    }

    const payload = { name, category, price, quantity, imageUrl, description, wattage: category === 'panels' ? 400 : 0 };

    if (editId) {
       fetch(`/api/products/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) {
                const errorMessages = data.errors ? data.errors.map(e => `${e.field}: ${e.message}`).join('\n') : data.message;
                throw new Error(errorMessages || 'Update action rejected.');
            }
            return data;
        })
        .then(() => {
            fetchAdminInventory(); 
            closeModal();
        })
        .catch(err => alert(`Validation Guard Alert:\n${err.message}`));
    } else {
        fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) {
                const errorMessages = data.errors ? data.errors.map(e => `${e.field}: ${e.message}`).join('\n') : data.message;
                throw new Error(errorMessages || 'Creation rejected by validator rules.');
            }
            return data;
        })
        .then((savedItem) => {
            alert(`Success!\n"${savedItem.name || 'New Product'}" has been recorded successfully.`);
            fetchAdminInventory();
            closeModal();
        })
        .catch(err => alert(`Validation Guard Alert:\n${err.message}`));
    }
}


function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this item?")) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Deletion request rejected by backend server.');
                return res.json();
            })
            .then(() => fetchAdminInventory())
            .catch(err => console.error("Deletion failed:", err));
    }
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
        document.getElementById('p-description').value = item.description || '';
        document.getElementById('modal-title').innerText = "Edit Product";
    } else {
        document.getElementById('modal-title').innerText = "Add New Product";
        document.getElementById('p-name').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-stock').value = '';
        document.getElementById('p-img').value = '';
        document.getElementById('p-description').value = '';
    }
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }


const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector(".admin-sidebar");
const mainContent = document.getElementById("main-content");

if (toggleBtn && sidebar && mainContent) {
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("expanded-main");
    });
}

const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");

if (cursor && ring) {
    document.addEventListener("mousemove", (e) => {
        const x = e.clientX;
        const y = e.clientY;
        cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
}

fetchAdminInventory();