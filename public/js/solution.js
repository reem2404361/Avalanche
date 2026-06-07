const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  const x = e.clientX;
  const y = e.clientY;
  cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
});

function displaySolarResults() {
    const savedResults = sessionStorage.getItem('solar_results');

    if (!savedResults) {
        console.warn("No calculated metrics discovered in temporary session tracking. Redirecting.");
        window.location.href = 'calculator.html';
        return;
    }

    const recommendation = JSON.parse(savedResults);

    const panelsTextElement = document.getElementById('panels-count-text');
    if (panelsTextElement) {
        panelsTextElement.innerText = `${recommendation.recommendedPanels} Panels`;
    }

    const systemSizeElement = document.getElementById('system-size-text');
    if (systemSizeElement) {
        systemSizeElement.innerText = `${recommendation.systemSizeKW} kW Array Capacity`;
    }

    const coverageBarElement = document.getElementById('coverage-percentage-bar');
    if (coverageBarElement) {
        coverageBarElement.innerText = `${recommendation.estimatedCoverage}% Bill Coverage`;
        coverageBarElement.style.width = `${recommendation.estimatedCoverage}%`;
    }

    const notesElement = document.getElementById('system-notes-p');
    if (notesElement) {
        notesElement.innerText = recommendation.note;
    }
}


document.addEventListener('DOMContentLoaded', displaySolarResults);