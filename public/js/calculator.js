const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

if (cursor && ring) {
    document.addEventListener('mousemove', e => {
        const x = e.clientX;
        const y = e.clientY;
        cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
}

const stepSections = document.querySelectorAll('.step-section');
const fill = document.getElementById('bar-fill');
const pctText = document.getElementById('pct-text');
const stepText = document.getElementById('step-info');

function updateProgress() {
    let completed = 0;
    stepSections.forEach(section => {
        const inputs = section.querySelectorAll('input, select');
        let isCardDone = Array.from(inputs).some(i => i.value.trim() !== "");
        if (isCardDone) completed++;
    });

    const pct = Math.round((completed / 3) * 100);
    if (fill) fill.style.width = pct + "%";
    if (pctText) pctText.innerText = pct + "% COMPLETE";
    if (stepText) stepText.innerText = `STEP ${completed} OF 3`;
}

const mapBtn = document.getElementById('open-map');
if (mapBtn) {
    mapBtn.addEventListener('click', function () {
        window.open('https://www.google.com/maps', '_blank');
    });
}

document.querySelectorAll('input, select').forEach(i => i.addEventListener('input', updateProgress));

function goToResults(e) {
    
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    const areaEl = document.getElementById('roofArea');
    const billEl = document.getElementById('monthlyBill');
    const govEl = document.getElementById('govSelect');

    if (!areaEl || !billEl || !govEl) {
        alert("System error: Missing matching HTML input element fields.");
        return;
    }

    const area = areaEl.value.trim();
    const bill = billEl.value.trim();
    const gov = govEl.value || 'cairo';

    if (!area || !bill || !gov) {
        alert("Please enter both your available roof area and monthly electricity bill and select your location to get accurate solar recommendations.");
        return; 
    }

    localStorage.setItem('userArea', area);
    localStorage.setItem('userBill', bill);
    localStorage.setItem('userGov', gov);


    fetch(`${window.location.origin}/api/products/recommend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            roofArea: Number(area),
            monthlyConsumption: Number(bill) 
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Calculation engine rejected request parameters');
        return response.json();
    })
    .then(recommendationResults => {
        sessionStorage.setItem('solar_results', JSON.stringify(recommendationResults));
        window.location.href = '/solution';
    })
    .catch(err => {
        console.error("Math engine connection error:", err);
        alert("Could not process recommendations. Make sure server.js is running smoothly!");
    });
}