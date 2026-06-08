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
            const rawProducts = Array.isArray(data) ? data : (data.products || data.data || []);

            inventory = rawProducts.map(item => ({
                id: item._id, 
                category: item.category,
                name: item.name,
                price: Number(item.price), 
                img: item.imageUrl || 'https://via.placeholder.com/300', 
                description: item.description || 'No description available.'
            }));
            renderInventory(); 
        })
        .catch(error => {
            console.error('Error fetching catalog data:', error);
            alert('Could not connect to the backend server. Make sure server.js is running!');
        });
}

function getItemQuantity(id) {
    const item = cart.find(p => p.id === id);
    return item ? item.quantity : 0;
}

function renderInventory() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filtered = activeFilter === 'all' ? inventory : inventory.filter(item => item.category === activeFilter);
    
    filtered.forEach(item => {
        const qty = getItemQuantity(item.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${item.img}" class="prod-img" onerror="this.src='https://via.placeholder.com/300'">
            <div class="prod-info">
                <div class="prod-name">${item.name}</div>
                <div class="prod-price">EGP ${item.price.toLocaleString()}</div>
            </div>
            <div class="prod-meta" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 12px; width: 100%; margin-top: 8px;">
                <p style="margin: 0; font-size: 0.75rem; opacity: 0.6; line-height: 1.3; max-width: 60%;">${item.description}</p>
                <div id="controls-wrapper-${item.id}">
                    </div>
            </div>
        `;
        grid.appendChild(card);
        
        
        updateProductCardControls(item.id);
    });
}

function updateProductCardControls(id) {
    const wrapper = document.getElementById(`controls-wrapper-${id}`);
    if (!wrapper) return;

    const qty = getItemQuantity(id);

    if (qty > 0) {
        wrapper.innerHTML = `
            <div class="stepper-container" style="display: flex; align-items: center; justify-content: space-between; border: 1.5px solid var(--primary, #0d1321); border-radius: 20px; overflow: hidden; width: 110px; height: 32px;">
                <button class="step-control-btn minus" style="background: none; border: none; color: var(--primary); width: 30px; height: 100%; font-size: 1rem; font-weight: 800; cursor: none;" onclick="decrementCartItem('${id}')">—</button>
                <span class="step-qty-val" style="color: var(--primary); font-weight: 800; font-size: 0.8rem;">${qty}</span>
                <button class="step-control-btn plus" style="background: none; border: none; color: var(--primary); width: 30px; height: 100%; font-size: 1rem; font-weight: 800; cursor: none;" onclick="incrementCartItem('${id}')">+</button>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <button class="buy-btn" onclick="incrementCartItem('${id}')">Add to Cart</button>
        `;
    }
}

function incrementCartItem(id) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1; 
    } else {
        const item = inventory.find(p => p.id === id);
        if (item) cart.push({ ...item, quantity: 1 }); 
    }
    updateCartBadge();
    
    
    updateProductCardControls(id); 
    
    if (document.getElementById('cart-overlay').style.display === 'flex') {
        renderCartList();
    }
}

function decrementCartItem(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1; 
        } else {
            cart.splice(itemIndex, 1); 
        }
    }
    updateCartBadge();
    
    updateProductCardControls(id); 
    
    if (document.getElementById('cart-overlay').style.display === 'flex') {
        renderCartList();
    }
}

function updateCartBadge() {
    const uniqueItemsCount = cart.length;
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = `${uniqueItemsCount} ${uniqueItemsCount === 1 ? 'ITEM' : 'ITEMS'}`;
    }
}

function renderCartList() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;
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
                
                <div style="display: flex; align-items: center;">
                    <div class="cart-inline-stepper" style="display: flex; align-items: center; background: #edf2f4; border-radius: 20px; padding: 2px 6px; font-weight: 800; font-size: 0.85rem;">
                        <button onclick="decrementCartItem('${item.id}')" style="background:none; border:none; padding:4px 8px; font-weight:800; cursor:none; color: #0d1321;">—</button>
                        <span style="min-width: 20px; text-align: center; color: #0d1321;">${item.quantity}</span>
                        <button onclick="incrementCartItem('${item.id}')" style="background:none; border:none; padding:4px 8px; font-weight:800; cursor:none; color: #0d1321;">+</button>
                    </div>
                </div>
            </div>`; 
    }).join(''); 
    
    document.getElementById('cart-total').innerText = `EGP ${total.toLocaleString()}`;
}

async function completePurchase() {
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

  const token = localStorage.getItem('token');
  if (!token) {
    alert("You must be logged in to place an order.");
    location.href = '/login';
    return;
  }

  // build items array — each item with its real MongoDB ID and quantity
  const items = cart.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }));

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items,
        shippingDetails: {
          fullName: name,
          email,
          phone,
          deliveryAddress: address
        }
      })
    });

    const data = await response.json();

    if (!data.success) {
      alert(`Order failed: ${data.message}`);
      return;
    }

    alert(`Order placed successfully! Thank you, ${name}. We will contact you at ${phone} shortly.`);

    cart = [];
    updateCartBadge();
    toggleCart();

    document.getElementById('cust-name').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-address').value = '';

  } catch (err) {
    console.error('Error placing order:', err);
    alert('Something went wrong. Please try again.');
  }
}

function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    if (!overlay) return;
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

const menuBtn = document.getElementById('toggle-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        document.querySelector('aside').classList.toggle('collapsed');
        document.getElementById('main-content').classList.toggle('expanded-main');
    });
}

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
if (cursor && ring) {
    document.addEventListener('mousemove', e => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
}

loadDatabaseProducts();