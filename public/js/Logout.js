/* ═══════════════════════════════════════════
   Logout.js  —  Two responsibilities:

   1. On logout page → runs the goodbye page
      (cursor, rays, clears token, redirect to /login)

   2. On ANY other page → wires up the logout
      button in the sidebar to go to /logout
═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

    // ── DETECT WHICH PAGE WE'RE ON ──
    const isLogoutPage = document.querySelector(".card") !== null;

    if (isLogoutPage) {

        // ════════════════════════════════
        // LOGOUT PAGE LOGIC
        // ════════════════════════════════

        // Clear all auth data immediately when the page loads
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear the cookie by setting it expired
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Custom cursor
        const cursor = document.getElementById("cursor");
        const ring   = document.getElementById("cursor-ring");
        if (cursor && ring) {
            document.addEventListener("mousemove", (e) => {
                cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
                ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            });
        }

        // Background rays
        const raysEl = document.getElementById("rays");
        if (raysEl) {
            for (let i = 0; i < 16; i++) {
                const r = document.createElement("div");
                r.className = "ray";
                r.style.transform      = `rotate(${i * 22.5}deg)`;
                r.style.animationDelay = (i * 0.04) + "s";
                raysEl.appendChild(r);
            }
        }

        // Redirect to login after bar fills (3s bar + 1.2s delay + 0.2s buffer)
        setTimeout(() => {
            window.location.href = "/login";
        }, 4400);

    } else {

        // ════════════════════════════════
        // ALL OTHER PAGES — wire logout btn
        // ════════════════════════════════

        const logoutBtn = document.querySelector(".side-btn.logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.location.href = "/logout";
            });
        }
    }

});