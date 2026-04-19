/* ═══════════════════════════════════════════
   scheduler.js  —  Scheduler Interactions
═══════════════════════════════════════════ */

// ── SIDEBAR TOGGLE ──
const toggleBtn = document.getElementById("toggle-btn");
const sidebar   = document.querySelector("aside.admin-sidebar");
const mainEl    = document.getElementById("main-content");
const navEl     = document.querySelector("nav");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainEl.classList.toggle("expanded-main");
    navEl.classList.toggle("expanded-nav");
});

// ── CUSTOM CURSOR ──
const cursor = document.getElementById("cursor");
const ring   = document.getElementById("cursor-ring");

document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

document.querySelectorAll('button, a, .day-box, .side-btn').forEach(el => {
    el.addEventListener("mouseenter", () => { ring.style.borderColor = "var(--primary)"; });
    el.addEventListener("mouseleave", () => { ring.style.borderColor = "var(--cursor)"; });
});

// ── CALENDAR ──
let currentMonth = 3; // April (0-indexed)
let selectedDay  = null;

const months = [
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December"
];

const daysInMonth = [31,28,30,31,30,31,31,28,31,30,31,30];

function renderCal() {
    const cal = document.getElementById('calendar-days');
    if (!cal) return;
    cal.innerHTML = "";
    document.getElementById('monthLabel').innerText = months[currentMonth] + " 2026";

    const total = daysInMonth[currentMonth];
    for (let i = 1; i <= total; i++) {
        const d = document.createElement('div');
        d.innerText = i;
        d.className = "day-box" + (selectedDay === i && currentMonth === currentMonth ? "" : "");
        if (selectedDay === i) d.classList.add("day-selected");

        d.onclick = function () {
            document.querySelectorAll('.day-box').forEach(el => el.classList.remove("day-selected"));
            this.classList.add("day-selected");
            selectedDay = i;
            // Update summary date
            document.getElementById('summary-date').innerText = months[currentMonth] + " " + i + ", 2026";
        };
        cal.appendChild(d);
    }
}

function changeMonth(dir) {
    currentMonth = Math.min(11, Math.max(0, currentMonth + dir));
    selectedDay = null;
    renderCal();
}

function nextStep() {
    if (!selectedDay) {
        alert("Please select a date first.");
        return;
    }
    document.getElementById('step-1').classList.add('hidden-step');
    const s2 = document.getElementById('step-2');
    s2.classList.remove('hidden-step');

    // Update step indicator
    document.getElementById('dot-1').classList.remove('active');
    document.getElementById('dot-2').classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    document.getElementById('step-2').classList.add('hidden-step');
    document.getElementById('step-1').classList.remove('hidden-step');
    document.getElementById('dot-2').classList.remove('active');
    document.getElementById('dot-1').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── ORDER SUBMISSION ──
function handleOrder(e) {
    e.preventDefault();
    const bus  = document.getElementById('bus-img');
    const path = document.getElementById('fill-path');

    bus.style.transition  = "left 3s linear";
    path.style.transition = "width 3s linear";
    bus.style.left        = "calc(100% - 10px)";
    path.style.width      = "100%";

    setTimeout(() => {
        alert("Your audit has been booked! 🚌 We'll be in touch soon.");
        window.location.href = 'dashb.html';
    }, 3100);
}

function resetAll() {
    document.getElementById('orderForm').reset();
    const bus  = document.getElementById('bus-img');
    const path = document.getElementById('fill-path');
    bus.style.transition  = "none";
    path.style.transition = "none";
    bus.style.left  = "-5rem";
    path.style.width = "0%";
}

// ── INIT ──
renderCal();