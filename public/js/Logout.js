/* ═══════════════════════════════════════════
   logout.js  —  Two responsibilities:

   1. On logout.html → runs the goodbye page
      (cursor, rays, redirect to login.html)

   2. On ANY other page → wires up the logout
      button in the sidebar to go to logout.html

   Just include this on every page:
      <script src="js/logout.js"></script>
═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

    // ── DETECT WHICH PAGE WE'RE ON ──
    const isLogoutPage = document.querySelector(".card") !== null;

    if (isLogoutPage) {

        // ════════════════════════════════
        // LOGOUT PAGE LOGIC
        // ════════════════════════════════

        // Custom cursor
        const cursor = document.getElementById("cursor");
        const ring   = document.getElementById("cursor-ring");
        document.addEventListener("mousemove", (e) => {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        });

        // Background rays
        const raysEl = document.getElementById("rays");
        if (raysEl) {
            for (let i = 0; i < 16; i++) {
                const r = document.createElement("div");
                r.className = "ray";
                r.style.transform     = `rotate(${i * 22.5}deg)`;
                r.style.animationDelay = (i * 0.04) + "s";
                raysEl.appendChild(r);
            }
        }

        // Redirect to login after bar fills (3s bar + 1.2s delay + 0.2s buffer)
        setTimeout(() => {
            window.location.href = "login.html";
        }, 4400);

    } else {

        // ════════════════════════════════
        // ALL OTHER PAGES — wire logout btn
        // ════════════════════════════════

        const logoutBtn = document.querySelector(".side-btn.logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.location.href = "logout.html";
            });
        }
    }

});