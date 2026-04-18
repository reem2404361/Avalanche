let currentMonth = 3; 
const months = ["January", "February", "March", "April", "May", "June"];

function renderCal() {
    const cal = document.getElementById('calendar-days');
    if(!cal) return;
    cal.innerHTML = "";
    document.getElementById('monthLabel').innerText = months[currentMonth] + " 2026";
    
    for(let i=1; i<=30; i++) {
        const d = document.createElement('div');
        d.innerText = i;
        d.className = "aspect-square bg-white flex items-center justify-center font-black text-lg rounded-2xl cursor-pointer hover:bg-slate-50 shadow-sm transition-all";
        d.onclick = function() {
            document.querySelectorAll('#calendar-days div').forEach(el => {
                el.style.background = 'white';
                el.style.color = '#0D1321';
            });
            this.style.background = '#FFB703'; // Yellow Choice
            this.style.color = 'black';
        };
        cal.appendChild(d);
    }
}
renderCal();

function changeMonth(dir) {
    currentMonth += dir;
    if(currentMonth < 0) currentMonth = 0;
    if(currentMonth > 5) currentMonth = 5;
    renderCal();
}

function nextStep() {
    document.getElementById('step-1').style.display='none';
    document.getElementById('step-2').style.display='block';
}

function handleOrder(e) {
    e.preventDefault();
    const bus = document.getElementById('bus-img');
    const path = document.getElementById('fill-path');
    
    bus.style.transition = "3s linear";
    path.style.transition = "3s linear";
    
    bus.style.left = "100%";
    path.style.width = "100%";

    setTimeout(() => {
        alert("Your order is on the way! 🚌");
        window.location.href = 'dashboard.html';
    }, 3100);
}

document.addEventListener('mousemove', (e) => {
    document.getElementById('cursor').style.left = e.clientX + 'px';
    document.getElementById('cursor').style.top = e.clientY + 'px';
    document.getElementById('cursor-ring').style.left = e.clientX + 'px';
    document.getElementById('cursor-ring').style.top = e.clientY + 'px';
});