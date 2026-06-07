let inventory = [
    { id: 1, category: 'panels', name: "Luxen 550W Bifacial", price: 8450, img: "https://s.alicdn.com/@sc04/kf/H31e3a60ac5e94b4b95bb3e81f2b6b186Y.jpg_720x720q50.jpg", meta: "Efficiency: 21.8%" },
    { id: 2, category: 'inverters', name: "Deye 12kW Hybrid", price: 92000, img: "https://www.deyeinverter.com/deyeinverter/2025/12/05/SUN-5-12K-SG04LP3-EU1.png", meta: "High Yield Tech" },
    { id: 3, category: 'storage', name: "Pylontech US5000", price: 58200, img: "https://cdn11.bigcommerce.com/s-fv94jpligr/images/stencil/1280x1280/products/1257/3249/Pylontech_Stack_frankensolar__66533.1614896264.1280.1280__03433.1690579455.jpg?c=1", meta: "4.8 kWh Capacity" },
    { id: 4, category: 'panels', name: "Alu-Mount 890W", price: 15870, img: "https://media.rs-online.com/image/upload/bo_1.5px_solid_white,b_auto,c_pad,dpr_2,f_auto,h_399,q_auto,w_710/c_pad,h_399,w_710/Y2651114-01?pgw=1", meta: "Pro Series" },
    { id: 5, category: 'inverters', name: "Hoymiles HMS-2000", price: 14300, img: "https://kizuna.ca/wp-content/uploads/2025/01/hoymiles-hms-2000-series-1.png", meta: "Micro-inverter" },
    { id: 6, category: 'storage', name: "BYD Battery-Box", price: 31200, img: "https://www.mg-solar-shop.com/media/image/03/d5/2e/114321-BYD-Battery-Box-HVS-5-1-Batteriespeicher-512-kWh-1_600x600.png", meta: "Lithium Safe" }
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

function renderInventory() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    const filtered = activeFilter === 'all' ? inventory : inventory.filter(item => item.category === activeFilter);
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<img src="${item.img}" class="prod-img"><div class="prod-info"><div class="prod-name">${item.name}</div><div class="prod-price">EGP ${item.price.toLocaleString()}</div></div><div class="prod-meta"><span>${item.meta}</span><button class="buy-btn" onclick="addToCart(${item.id})">BUY NOW</button></div>`;
        grid.appendChild(card);
    });
}

function addToCart(id) {
    cart.push(inventory.find(p => p.id === id));
    updateCartBadge();
}

function updateCartBadge() {
    document.getElementById('cart-count').innerText = `${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'}`;
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

function renderCartList() {
    const list = document.getElementById('cart-items-list');
    let total = 0;
    list.innerHTML = cart.map(item => { 
        total += item.price; 
        return `<div class="cart-item"><img src="${item.img}"><div><div style="font-weight:800; font-size:0.9rem;">${item.name}</div><div style="color:var(--accent); font-weight:700;">EGP ${item.price.toLocaleString()}</div></div></div>`; 
    }).join(''); 
    document.getElementById('cart-total').innerText = `EGP ${total.toLocaleString()}`;
}

function showCheckoutForm() {
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