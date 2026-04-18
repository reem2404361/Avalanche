document.addEventListener('mousemove', (e) => {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
});

// Interactive elements hover
document.querySelectorAll('.m-card, button, a, .anim-row, .review-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.getElementById('cursor-ring').style.transform = 'translate(-50%, -50%) scale(2)';
        document.getElementById('cursor-ring').style.borderColor = 'white';
    });
    el.addEventListener('mouseleave', () => {
        document.getElementById('cursor-ring').style.transform = 'translate(-50%, -50%) scale(1)';
        document.getElementById('cursor-ring').style.borderColor = 'var(--cursor)';
    });
});