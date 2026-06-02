// SIDEBAR TOGGLE
const toggleBtn = document.getElementById("toggle-btn");
const sidebar   = document.querySelector("aside.admin-sidebar");
const mainEl    = document.getElementById("main-content");
const navEl     = document.querySelector("nav");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainEl.classList.toggle("expanded-main");
    navEl.classList.toggle("expanded-nav");
});

// CUSTOM CURSOR 
const cursor = document.getElementById("cursor");
const ring   = document.getElementById("cursor-ring");

document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});
