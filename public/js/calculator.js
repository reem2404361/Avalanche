
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');

    document.addEventListener('mousemove', e => {
        const x = e.clientX;
        const y = e.clientY;
        cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

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
        fill.style.width = pct + "%";
        pctText.innerText = pct + "% COMPLETE";
        stepText.innerText = `STEP ${completed} OF 3`;
    }

    document.getElementById('open-map').addEventListener('click', function () {

        window.open('https://www.google.com/maps', '_blank');
    });


    document.querySelectorAll('input, select').forEach(i => i.addEventListener('input', updateProgress));

    function goToResults() {
        const area = document.getElementById('roofArea').value || 100;
        const bill = document.getElementById('monthlyBill').value || 1000;
        const gov = document.getElementById('govSelect').value || 'cairo';

        localStorage.setItem('userArea', area);
        localStorage.setItem('userBill', bill);
        localStorage.setItem('userGov', gov);
        window.location.href = 'solution.html';
    }