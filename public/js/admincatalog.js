let inventory = []; 
let editId = null;
let activeFilter = 'all';

function fetchAdminInventory() {
    fetch('/api/products')
        .then(res => res.json())
        .then(data => {
            inventory = data.map(item => ({
                id: item._id,
                category: item.category,
                name: item.name,
                price: item.price,
                stock: item.quantity,
                img: item.imageUrl,
                description: item.description
            }));
            renderInventory();
        })
        .catch(err => console.error("Error fetching admin data panel:", err));
}

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
                    <div class="prod-info"><div class="prod-name">${item.name}</div><div class="prod-price">EGP ${item.price.toLocaleString()}</div></div>
                    <div class="prod-meta" style="flex-direction: column; align-items: flex-start; gap: 10px;">
                        <p style="margin: 0; font-size: 0.8rem; opacity: 0.7; line-height: 1.4;">${item.description}</p>
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                            <span class="action-btn" onclick="openModal('${item.id}')">EDIT</span>
                            <span class="action-btn delete-btn" onclick="deleteProduct('${item.id}')">DELETE</span>
                        </div>
                    </div>
                `;
        grid.appendChild(card);
    });
}

function saveProduct() {
    const name = document.getElementById('p-name').value;
    const price = Number(document.getElementById('p-price').value);
    const quantity = parseInt(document.getElementById('p-stock').value);
    const category = document.getElementById('p-category').value;
    const imageUrl = document.getElementById('p-img').value;
    const description = document.getElementById('p-description').value;

    const payload = { name, category, price, quantity, imageUrl, description, wattage: category === 'panels' ? 400 : 0 };

    if (editId) {
       fetch(`/api/products/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Update action rejected by data validation parameters');
            return res.json();
        })
        .then(() => {
            fetchAdminInventory(); 
            closeModal();
        })
        .catch(err => alert(err.message));
    } else {
        fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Creation rejected. Check validation guidelines.');
            return res.json();
        })
        .then(() => {
            fetchAdminInventory();
            closeModal();
        })
        .catch(err => alert(err.message));
    }
}

function deleteProduct(id) {
    if (confirm("Are you absolutely sure you want to delete this warehouse item?")) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
            .then(res => res.json())
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

fetchAdminInventory();