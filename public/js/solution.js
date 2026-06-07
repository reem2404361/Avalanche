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

let baseRecommendation = null;

function displaySolarResults() {
    const savedResults = sessionStorage.getItem('solar_results');
    const userGov = localStorage.getItem('userGov') || 'Cairo';

    if (!savedResults) {
        console.warn("No calculated metrics discovered in temporary session tracking. Redirecting.");
        window.location.href = '/calculator';
        return;
    }

    baseRecommendation = JSON.parse(savedResults);

  
    const locationTag = document.getElementById('location-tag');
    if (locationTag) {
        locationTag.innerText = `OPTIMIZED FOR: ${userGov.toUpperCase()}`;
    }

    updateUI(1.0, 'Mono-crystalline');
}


window.updateUI = function(efficiencyModifier, panelTypeName) {
    if (!baseRecommendation) return;

    
    const calculatedPanels = Math.ceil(baseRecommendation.recommendedPanels / efficiencyModifier);
    const calculatedSize = (baseRecommendation.systemSizeKW / efficiencyModifier).toFixed(2);
    
    
    const panelPricePerUnit = 4200; 
    const panelsTotalCost = calculatedPanels * panelPricePerUnit;
    const fixedInverterCost = 32500;
    const fixedMountingCost = 14000;
    const totalInvestment = panelsTotalCost + fixedInverterCost + fixedMountingCost;

    
    const monthlySavingsEstimate = Math.round(calculatedSize * 155);

    
    const sizeDisplay = document.getElementById('size-display');
    if (sizeDisplay) sizeDisplay.innerText = `${calculatedSize} kW`;

    const savingsDisplay = document.getElementById('savings-display');
    if (savingsDisplay) savingsDisplay.innerText = `EGP ${monthlySavingsEstimate.toLocaleString()} / mo`;

    const highlightPanel = document.getElementById('highlight-panel');
    if (highlightPanel) highlightPanel.innerText = `${calculatedPanels} x ${panelTypeName} Panels`;

    const highlightInverter = document.getElementById('highlight-inverter');
    if (highlightInverter) {
        highlightInverter.innerText = calculatedSize > 6 ? "8kW Hybrid Inverter" : "5kW Hybrid Inverter";
    }

    const priceEq = document.getElementById('price-eq');
    if (priceEq) priceEq.innerText = `EGP ${panelsTotalCost.toLocaleString()}`;

    const totalDisplay = document.getElementById('total-display');
    if (totalDisplay) totalDisplay.innerText = `EGP ${totalInvestment.toLocaleString()}`;

  
    const cards = document.querySelectorAll('.choice-card');
    cards.forEach(card => {
        card.classList.remove('active');
        const titleText = card.querySelector('h3 b')?.innerText || '';
        if (titleText.toLowerCase() === panelTypeName.toLowerCase()) {
            card.classList.add('active');
        }
    });
};

document.addEventListener('DOMContentLoaded', displaySolarResults);