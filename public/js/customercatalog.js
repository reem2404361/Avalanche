let inventory = [
    { id: 1, category: 'panels', name: "Luxen 550W Bifacial", price: 8450, img: "https://s.alicdn.com/@sc04/kf/H31e3a60ac5e94b4b95bb3e81f2b6b186Y.jpg_720x720q50.jpg", description: "High-efficiency bifacial module capturing solar energy from both sides." },
    { id: 2, category: 'inverters', name: "Deye 12kW Hybrid", price: 92000, img: "https://www.deyeinverter.com/deyeinverter/2025/12/05/SUN-5-12K-SG04LP3-EU1.png", description: "Three-phase advanced commercial hybrid configuration inverter module." },
    { id: 3, category: 'storage', name: "Pylontech US5000", price: 58200, img: "https://cdn11.bigcommerce.com/s-fv94jpligr/images/stencil/1280x1280/products/1257/3249/Pylontech_Stack_frankensolar__66533.1614896264.1280.1280__03433.1690579455.jpg?c=1", description: "Lithium iron phosphate battery system running at 4.8 kWh capacity tracking bounds." },
    { id: 4, category: 'panels', name: "Alu-Mount 890W Bifacial", price: 15870, img: "https://media.rs-online.com/image/upload/bo_1.5px_solid_white,b_auto,c_pad,dpr_2,f_auto,h_399,q_auto,w_710/c_pad,h_399,w_710/Y2651114-01?pgw=1", description: "Heavy industrial high performance solar generation profile." },
    { id: 5, category: 'inverters', name: "Hoymiles HMS-2000", price: 14300, img: "https://kizuna.ca/wp-content/uploads/2025/01/hoymiles-hms-2000-series-1.png", description: "Grid-tied microinverter optimizing individual panel generation outputs." },
    { id: 6, category: 'storage', name: "BYD Battery-Box HVS", price: 31200, img: "https://www.mg-solar-shop.com/media/image/03/d5/2e/114321-BYD-Battery-Box-HVS-5-1-Batteriespeicher-512-kWh-1_600x600.png", description: "Premium modular battery block tracking a 5.12 kWh cell lifecycle." }
];

let cart = []; 
let activeFilter = 'all';

function completePurchase() {
    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[0125][0-9]{8}$/;

    if (name.length < 8) {
        return alert("Full Name must be at least 8 characters long.");
    }
    if (!emailRegex.test(email)) {
        return alert("Please enter a valid email address.");
    }
    if (!phoneRegex.test(phone)) {
        return alert("Please enter a valid phone number.");
    }
    if (address.length < 10) {
        return alert("Please provide a more detailed delivery address.");
    }

    alert(`Order Placed Successfully!\nThank you, ${name}. We will contact you at ${phone} shortly.`);
    
    cart = [];
    updateCartBadge();
    toggleCart();
    
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-address').value = '';
}

// FIXED: Displaying real description field block instead of old metadata string
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
                <button class="buy-btn" style="width: 100%;" onclick="addToCart(${item.id})">BUY NOW</button>
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
        // Clean numeric integrity preserved
        cart.push({ ...item, quantity: 1 }); 
    }
    updateCartBadge();
}

function updateCartBadge() {
    const uniqueItemsCount = cart.length;
    document.getElementById('cart-count').innerText = `${uniqueItemsCount} ${uniqueItemsCount === 1 ? 'ITEM' : 'ITEMS'}`;
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

// FIXED: Clear mathematical multiplication logic and embedded trash can removal functionality
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
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ef4444; font-size: 1.1rem; cursor: none; padding: 4px;">
                        🗑️
                    </button>
                </div>
            </div>`; 
    }).join(''); 
    
    document.getElementById('cart-total').innerText = `EGP ${total.toLocaleString()}`;
}

// NEW FUNCTION: Handles line modification actions inside cart overlay window
function removeFromCart(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1; // Step quantity value down incrementally
        } else {
            cart.splice(itemIndex, 1); // Remove entire structural asset index block if zeroed
        }
    }
    updateCartBadge();
    renderCartList(); // Refresh overlay viewport instantly
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

renderInventory();