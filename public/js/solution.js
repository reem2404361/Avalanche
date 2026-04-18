
        const cursor = document.getElementById('cursor');
        const ring = document.getElementById('cursor-ring');

        document.addEventListener('mousemove', e => {
            const x = e.clientX;
            const y = e.clientY;
            cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        });

        function updateUI(techMultiplier, typeName) {
            const area = parseFloat(localStorage.getItem('userArea')) || 100;
            const bill = parseFloat(localStorage.getItem('userBill')) || 1000;
            const gov = localStorage.getItem('userGov') || 'cairo';


            document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('active'));
            if (event && event.currentTarget) event.currentTarget.classList.add('active');


            let sun = 1.0;
            if (gov === 'giza') sun = 1.25;
            if (gov === 'alex') sun = 0.85;


            const maxPanelsOnRoof = Math.floor((area * 0.8) / 1.7);
            const neededByBill = Math.ceil(bill / 250);


            let panelQty = Math.min(maxPanelsOnRoof, neededByBill);
            if (gov === 'giza') panelQty = Math.ceil(panelQty * 0.9);
            if (gov === 'alex') panelQty = Math.ceil(panelQty * 1.1);

            const size = (panelQty * 0.45 * (sun > 1 ? 1 : sun)).toFixed(1);
            const cost = Math.round(panelQty * 7200 * techMultiplier);
            const savings = Math.round((bill * 12) * 0.85);


            document.getElementById('size-display').innerText = size;
            document.getElementById('savings-display').innerText = savings.toLocaleString() + " EGP / YR";
            document.getElementById('total-display').innerText = cost.toLocaleString() + " EGP";
            document.getElementById('price-eq').innerText = "EGP " + Math.round(cost * 0.65).toLocaleString();
            document.getElementById('location-tag').innerText = `⚡ OPTIMIZED FOR ${gov.toUpperCase()}`;


            document.getElementById('highlight-panel').innerText = `${panelQty} x 450W ${typeName}`;
            document.getElementById('highlight-inverter').innerText = `${Math.ceil(size)}kW Hybrid Inverter`;
        }


        window.onload = () => updateUI(1.0, 'Mono-crystalline');
    