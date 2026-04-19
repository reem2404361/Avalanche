const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  const { clientX: x, clientY: y } = e;
  
  // Move main cursor instantly
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  
  // Move ring slightly delayed
  cursorRing.style.transform = `translate(${x}px, ${y}px)`;
});



document.getElementById('toggle-btn').addEventListener('click', () => {
  document.querySelector('aside').classList.toggle('collapsed');
});
