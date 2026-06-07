let inventory = []; 
let cart = []; 
let activeFilter = 'all';


function loadDatabaseProducts() {
    fetch('/api/products')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not stable');
            return response.json();
        })
        .then(data => {
            inventory = data.map(item => ({
                id: item._id, 
                category: item.category,
                name: item.name,
                price: Number(item.price), 
                img: item.imageUrl,
                description: item.description || 'No description available.'
            }));
            renderInventory(); 
        })
        .catch(error => {
            console.error('Error fetching catalog data:', error);
            alert('Could not connect to the backend server. Make sure server.js is running!');
        });
}


function renderInventory() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    const filtered = activeFilter === 'all' ? inventory : inventory.filter(item => item.category === activeFilter);
    
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${item.img}" class="prod-img">
            <div class="prod-info">
                <div class="prod-name">${item.name}</div>
                <div class="prod-price">EGP ${item.price.toLocaleString()}</div>
            </div>
            <div class="prod-meta" style="flex-direction: column; align-items: flex-start; gap: 12px;">
                <p style="margin: 0; font-size: 0.8rem; opacity: 0.6; line-height: 1.4; min-height: 38px;">${item.description}</p>
                <button class="buy-btn" style="width: 100%;" onclick="addToCart('${item.id}')">BUY NOW</button>
            </div>
        `;
        grid.appendChild(card);
    });
}


function addToCart(id) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1; 
    } else {
        const item = inventory.find(p => p.id === id);
        cart.push({ ...item, quantity: 1 }); 
    }
    updateCartBadge();
}

function updateCartBadge() {
    const uniqueItemsCount = cart.length;
    document.getElementById('cart-count').innerText = `${uniqueItemsCount} ${uniqueItemsCount === 1 ? 'ITEM' : 'ITEMS'}`;
}

function renderCartList() {
    const list = document.getElementById('cart-items-list');
    let total = 0;
    
    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Your cart is empty</p>';
        document.getElementById('cart-total').innerText = 'EGP 0';
        return;
    }

    list.innerHTML = cart.map(item => { 
        const itemTotal = item.price * item.quantity;
        total += itemTotal; 
        
        return `
            <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <div style="font-weight:800; font-size:0.9rem;">${item.name}</div>
                        <div style="color:var(--accent); font-weight:700; font-size:0.85rem;">EGP ${item.price.toLocaleString()}</div>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: #edf2f4; padding: 6px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; color: #0d1321;">
                        × ${item.quantity}
                    </div>
                    <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #ef4444; font-size: 1.1rem; cursor: none; padding: 4px;">
                        🗑️
                    </button>
                </div>
            </div>`; 
    }).join(''); 
    
    document.getElementById('cart-total').innerText = `EGP ${total.toLocaleString()}`;
}


function removeFromCart(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1; 
        } else {
            cart.splice(itemIndex, 1); 
        }
    }
    updateCartBadge();
    renderCartList(); 
}

function completePurchase() {
    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[0125][0-9]{8}$/;

    if (name.length < 8) return alert("Full Name must be at least 8 characters long.");
    if (!emailRegex.test(email)) return alert("Please enter a valid email address.");
    if (!phoneRegex.test(phone)) return alert("Please enter a valid phone number.");
    if (address.length < 10) return alert("Please provide a more detailed delivery address.");

    alert(`Order Placed Successfully!\nThank you, ${name}. We will contact you at ${phone} shortly.`);
    
    cart = [];
    updateCartBadge();
    toggleCart();
    
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-address').value = '';
}

function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    overlay.style.display = (overlay.style.display === 'flex') ? 'none' : 'flex';
    if (overlay.style.display === 'flex') {
        renderCartList(); 
        showCartItems();
    }
}

function goToCheckout() {
    if (cart.length === 0) return alert("Your cart is empty!"); 
    toggleCart();
}

function showCheckoutForm() {
    if (cart.length === 0) return;
    document.getElementById('cart-view-items').style.display = 'none';
    document.getElementById('cart-view-form').style.display = 'flex';
}

function showCartItems() {
    document.getElementById('cart-view-items').style.display = 'flex'; 
    document.getElementById('cart-view-form').style.display = 'none';
}

function filterBy(cat, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    activeFilter = cat;
    renderInventory();
}

document.getElementById('toggle-btn').addEventListener('click', () => {
    document.querySelector('aside').classList.toggle('collapsed');
    document.getElementById('main-content').classList.toggle('expanded-main');
});

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

loadDatabaseProducts();