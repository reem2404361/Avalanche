const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  const { clientX: x, clientY: y } = e;
  
  // Move main cursor instantly
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  
  // Move ring slightly delayed
  cursorRing.style.transform = `translate(${x}px, ${y}px)`;
});


// Collapse or expand sidebar navigation
document.getElementById('toggle-btn').addEventListener('click', () => {
  document.querySelector('aside').classList.toggle('collapsed');
});


async function cancelOrder() {
  const confirmed = confirm('Are you sure you want to cancel? This cannot be undone.');
  if (!confirmed) return;

  try {
    const res = await fetch('/api/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', //(auth) Send cookies along with this request, and accept cookies from the response
    });

    const data = await res.json();

    if (data.success) {
      alert('Your order has been cancelled.');
      location.reload(); // Refresh dashboard after successful cancellation
    } else {
      alert('Could not cancel: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    alert('Error: ' + err.message);
    console.error('Cancel error:', err);
  }
}