const toggleBtn = document.getElementById("toggle-btn");
const sidebar   = document.querySelector("aside.admin-sidebar");
const mainEl    = document.getElementById("main-content");
const navEl     = document.querySelector("nav");

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        if (mainEl) mainEl.classList.toggle("expanded-main");
        if (navEl) navEl.classList.toggle("expanded-nav");

        if (typeof map !== 'undefined' && map) {
            setTimeout(() => {
                map.invalidateSize({ animate: true });
            }, 300);
        }
    });
}

const cursor = document.getElementById("cursor");
const ring   = document.getElementById("cursor-ring");

document.addEventListener("mousemove", (e) => {
    if (cursor) cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    if (ring)   ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

function attachCursorHoverEffects(elements) {
    if (!ring) return;
    elements.forEach(el => {
        if (el.dataset.hasCursorListener) return;
        el.dataset.hasCursorListener = "true";

        el.addEventListener("mouseenter", () => {
            ring.style.width = "60px";
            ring.style.height = "60px";
            ring.style.borderColor = "#ffb703";
            ring.style.background = "rgba(255, 183, 3, 0.05)";
        });
        el.addEventListener("mouseleave", () => {
            ring.style.width = "30px";
            ring.style.height = "30px";
            ring.style.borderColor = "rgba(255, 183, 3, 0.3)";
            ring.style.background = "transparent";
        });
    });
}

if (cursor && ring) {
    const targetStaticElements = document.querySelectorAll('.m-card, button, a, .anim-row, .review-card, .side-btn, .tab, .btn-action-cancel');
    attachCursorHoverEffects(targetStaticElements);

    const observer = new MutationObserver(() => {
        const liveMapDots = document.querySelectorAll('.map-static-dot');
        if (liveMapDots.length > 0) attachCursorHoverEffects(liveMapDots);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}