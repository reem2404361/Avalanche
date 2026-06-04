const toggleBtn = document.getElementById("toggle-btn");
const sidebar   = document.querySelector("aside.admin-sidebar");
const mainEl    = document.getElementById("main-content");
const navEl     = document.querySelector("nav");

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        if (mainEl) mainEl.classList.toggle("expanded-main");
        if (navEl) navEl.classList.toggle("expanded-nav");
    });
}

const cursor = document.getElementById("cursor");
const ring   = document.getElementById("cursor-ring");

if (cursor && ring) {
    document.addEventListener("mousemove", (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    document.querySelectorAll('.m-card, button, a, .anim-row, .review-card, .side-btn, .tab, .btn-action-cancel').forEach(el => {
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