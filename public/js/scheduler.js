const toggleBtn = document.getElementById("toggle-btn");
const sidebar   = document.querySelector("aside.admin-sidebar");
const mainEl    = document.getElementById("main-content");
const navEl     = document.querySelector("nav");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        mainEl.classList.toggle("expanded-main");
        if (navEl) navEl.classList.toggle("expanded-nav");
    });
}

const cursor = document.getElementById("cursor");
const ring   = document.getElementById("cursor-ring");

document.addEventListener("mousemove", (e) => {
    if (cursor) cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    if (ring)   ring.style.transform   = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();
let selectedDay  = null;

const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

// Fallback default location string
const defaultLocation = "Cairo, Egypt";

function renderCal() {
    const cal = document.getElementById("calendar-days");
    if (!cal) return;
    cal.innerHTML = "";
    document.getElementById("monthLabel").innerText = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "day-box day-empty";
        cal.appendChild(empty);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const d = document.createElement("div");
        d.innerText = i;
        d.className = "day-box";

        const thisDate = new Date(currentYear, currentMonth, i);
        if (thisDate < today) {
            d.classList.add("day-past");
            d.style.opacity = "0.3";
            d.style.cursor  = "not-allowed";
        } else {
            if (selectedDay === i && currentMonth === new Date().getMonth()) {
                d.classList.add("day-selected");
            }
            d.onclick = function () {
                document.querySelectorAll(".day-box").forEach(el => el.classList.remove("day-selected"));
                this.classList.add("day-selected");
                selectedDay = i;

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
                const hiddenInput = document.getElementById("hidden-date-input");
                if (hiddenInput) hiddenInput.value = dateStr;

                const summaryDate = document.getElementById("summary-date");
                if (summaryDate) summaryDate.innerText = `${months[currentMonth]} ${i}, ${currentYear}`;
            };
        }
        cal.appendChild(d);
    }
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
    selectedDay = null;
    renderCal();
}

function nextStep() {
    if (!selectedDay) {
        alert("Please select a date first.");
        return;
    }
    document.getElementById("step-1").classList.add("hidden-step");
    const s2 = document.getElementById("step-2");
    s2.classList.remove("hidden-step");

    document.getElementById("dot-1").classList.remove("active");
    document.getElementById("dot-2").classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
    document.getElementById("step-2").classList.add("hidden-step");
    document.getElementById("step-1").classList.remove("hidden-step");
    document.getElementById("dot-2").classList.remove("active");
    document.getElementById("dot-1").classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectSlot(btn) {
    document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    const slot = btn.getAttribute("data-slot");
    const hiddenSlot = document.getElementById("hidden-slot-input");
    if (hiddenSlot) hiddenSlot.value = slot;

    const summarySlot = document.getElementById("summary-slot");
    if (summarySlot) summarySlot.innerText = slot;
}

function resetAll() {
    const form = document.getElementById("appointmentForm") || document.getElementById("orderForm");
    if (form) form.reset();
    
    document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
    
    const hiddenSlot = document.getElementById("hidden-slot-input");
    if (hiddenSlot) hiddenSlot.value = "";
    
    const summaryLocation = document.getElementById("summary-location");
    if (summaryLocation) summaryLocation.innerText = defaultLocation;

    const summarySlot = document.getElementById("summary-slot");
    if (summarySlot) summarySlot.innerText = "---";

    const summaryDate = document.getElementById("summary-date");
    if (summaryDate) summaryDate.innerText = "---";

    selectedDay = null;
    renderCal();
    goBack();

    const errBanner = document.getElementById("form-error");
    if (errBanner) { errBanner.style.display = "none"; errBanner.innerText = ""; }
}

async function handleOrder(e) {
    e.preventDefault();

    const errBanner = document.getElementById("form-error");
    const submitBtn = document.getElementById("submit-btn");

    const date     = document.getElementById("hidden-date-input").value;
    const timeSlot = document.getElementById("hidden-slot-input").value;

    if (!date) {
        errBanner.innerText = "Please go back and select a date.";
        errBanner.style.display = "block";
        return;
    }
    if (!timeSlot) {
        errBanner.innerText = "Please select a time slot before submitting.";
        errBanner.style.display = "block";
        return;
    }

    errBanner.style.display = "none";

    const form = document.getElementById("appointmentForm") || document.getElementById("orderForm");
    const formData = new FormData(form);
    const payload  = {};
    formData.forEach((val, key) => { payload[key] = val; });

    submitBtn.classList.add("submit-loading");
    submitBtn.innerText = "Booking...";

    try {
        const response = await fetch("/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success && data.redirectUrl) {
            window.location.href = data.redirectUrl;
        } else {
            errBanner.innerText = data.message || "Something went wrong. Please try again.";
            errBanner.style.display = "block";
            submitBtn.classList.remove("submit-loading");
            submitBtn.innerText = "BOOK APPOINTMENT >";
        }
    } catch (err) {
        console.error("Booking fetch error:", err);
        errBanner.innerText = "Network error. Please check your connection and try again.";
        errBanner.style.display = "block";
        submitBtn.classList.remove("submit-loading");
        submitBtn.innerText = "BOOK APPOINTMENT >";
    }
}

// Wire up live address tracking pipeline
function initAddressSync() {
    const addressField = document.getElementById("f-address");
    const summaryLocation = document.getElementById("summary-location");

    if (addressField && summaryLocation) {
        addressField.addEventListener("input", (e) => {
            const currentVal = e.target.value.trim();
            summaryLocation.innerText = currentVal.length > 0 ? currentVal : defaultLocation;
        });
    }
}

// Wire up submission listener directly to the designated structural layout
const appointmentFormElement = document.getElementById("appointmentForm") || document.getElementById("orderForm");
if (appointmentFormElement) {
    appointmentFormElement.addEventListener("submit", handleOrder);
}

renderCal();
initAddressSync();