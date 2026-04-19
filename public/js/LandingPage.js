// CURSOR
  (function () {
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursor-ring');
    let cx = 0, cy = 0;

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      ring.style.transform   = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    });

    window._setCursorSunMode = function(on) {
      cursor.classList.toggle('sun-mode', on);
      ring.classList.toggle('sun-mode', on);
    };
  })();

  // NAV -  dark mode on section 1
 
  (function() {
    const nav = document.getElementById('main-nav');
    const sections = ['home','why','how','contact'];
    const links = document.querySelectorAll('.nav-link');

    function updateNav() {
      const scrollY = window.scrollY;
      const homeSection = document.getElementById('section-home');
      const homeBottom = homeSection.offsetTop + homeSection.offsetHeight;

      // dark mode while over hero
      if (scrollY < homeBottom - 80) {
        nav.classList.add('dark-mode');
        window._setCursorSunMode && window._setCursorSunMode(true);
      } else {
        nav.classList.remove('dark-mode');
        window._setCursorSunMode && window._setCursorSunMode(false);
      }

      // active link
      let current = 'home';
      sections.forEach(id => {
        const el = document.getElementById('section-' + id);
        if (el && scrollY >= el.offsetTop - 80) current = id;
      });
      links.forEach(l => l.classList.toggle('active', l.dataset.section === current));
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // smooth scroll on click
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  })();

  // COUNTER

  (function() {
    const counter = document.getElementById('counter');
    const section = document.getElementById('section-why');
    let started = false;

    function startCounter() {
      if (started) return;
      started = true;
      let count = 0;
      const target = 500;
      function tick() {
        if (count < target) {
          count += 5;
          if (count > target) count = target;
          counter.textContent = count + '+';
          setTimeout(tick, 20);
        } else {
          counter.textContent = target + '+';
        }
      }
      tick();
    }

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) startCounter();
    }, { threshold: 0.3 });
    observer.observe(section);
  })();

  // SOLAR HERO ANIMATION (section 1)
  (function(){
    const heroEl = document.getElementById('section-home');
    const sky = document.getElementById('sky');
    const horizonGlow = document.getElementById('horizon-glow');
    const cStars = document.getElementById('c-stars');
    const cCity  = document.getElementById('c-city');
    const cMain  = document.getElementById('c-main');
    const cPart  = document.getElementById('c-particles');
    const barFill  = document.getElementById('bar-fill');
    const barLabel = document.getElementById('bar-label');
    const bolts    = document.querySelectorAll('.bolt');
    const headline = document.getElementById('headline');
    const subline  = document.getElementById('subline');
    const badge    = document.getElementById('badge');
    const ctaBtn   = document.getElementById('cta');
    const hintEl   = document.getElementById('hint');
    const sKwh = document.getElementById('s-kwh');
    const sCo2 = document.getElementById('s-co2');
    const sHomes = document.getElementById('s-homes');

    const starsCtx = cStars.getContext('2d');
    const cityCtx  = cCity.getContext('2d');
    const mainCtx  = cMain.getContext('2d');
    const partCtx  = cPart.getContext('2d');

    let W, H, energy=0, mouseX=-999, mouseY=-999, prevX=-999, prevY=-999, velocity=0, totalDist=0;
    let particles=[], sparkles=[], rays=[], stars=[], buildings=[], windows=[], panels=[];
    let ctaShown=false, hintGone=false, frame=0;
    const MIN_READ_MS=3000;
    let currentPhase=0, phaseEnteredAt=performance.now(), wasCharging=true;

    const lerp=(a,b,t)=>a+(b-a)*t;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const rand=(a,b)=>a+Math.random()*(b-a);

    function resize(){
      W = heroEl.clientWidth; H = heroEl.clientHeight;
      [cStars,cCity,cMain,cPart].forEach(c=>{c.width=W;c.height=H;});
      buildScene();
    }

    function buildScene(){
      stars=[];
      for(let i=0;i<120;i++) stars.push({x:rand(0,W),y:rand(0,H*.65),r:rand(.4,1.6),phase:rand(0,Math.PI*2),speed:rand(.008,.025)});
      buildings=[];windows=[];panels=[];
      const HORIZON=H*.6;
      const bDefs=[[0,.065,.4],[.07,.045,.28],[.12,.085,.5],[.22,.055,.34],[.28,.105,.56],[.4,.045,.25],[.45,.09,.48],[.56,.065,.38],[.63,.075,.44],[.72,.055,.32],[.78,.085,.5],[.87,.045,.28],[.92,.08,.42]];
      bDefs.forEach(([xr,wr,hr])=>{
        const bx=xr*W,bw=wr*W,bh=hr*(H*.56),by=HORIZON-bh;
        buildings.push({x:bx,y:by,w:bw,h:bh,lit:0});
        const panelH=Math.max(6,bw*rand(.12,.2)),panelW=bw*.82;
        panels.push({x:bx+bw*.09,y:by-panelH-10,w:panelW,h:panelH,lit:0});
        const wtm=bh*.12,cols=Math.max(1,Math.floor(bw/16)),rows=Math.max(1,Math.floor((bh-wtm)/20));
        for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(Math.random()>.3) windows.push({x:bx+(c+.5)*(bw/cols)-4,y:by+wtm+(r+.5)*((bh-wtm)/rows),w:7,h:5,lit:0,delay:rand(0,.6)});
      });
    }

    function skyColor(e){
      const stops=[[0,[4,7,15]],[.25,[12,10,32]],[.45,[28,16,12]],[.65,[80,45,20]],[.85,[70,120,190]],[1,[80,150,220]]];
      for(let i=0;i<stops.length-1;i++){const[t0,c0]=stops[i],[t1,c1]=stops[i+1];if(e>=t0&&e<=t1){const t=(e-t0)/(t1-t0);return c0.map((_,j)=>Math.floor(lerp(c0[j],c1[j],t)));}}
      return[80,150,220];
    }

    function drawStars(e){
      starsCtx.clearRect(0,0,W,H);
      const fade=clamp(1-e*2.2,0,1);if(fade<=0)return;
      stars.forEach(s=>{s.phase+=s.speed;const a=(.25+.35*Math.sin(s.phase))*fade;starsCtx.beginPath();starsCtx.arc(s.x,s.y,s.r,0,Math.PI*2);starsCtx.fillStyle=`rgba(200,220,255,${a})`;starsCtx.fill();});
    }

    function drawCity(){
      cityCtx.clearRect(0,0,W,H);
      const HORIZON=H*.6;
      cityCtx.fillStyle='#080c18';cityCtx.fillRect(0,HORIZON,W,H-HORIZON);
      const sg=cityCtx.createLinearGradient(0,HORIZON-2,0,HORIZON+8);sg.addColorStop(0,`rgba(255,140,50,${(energy/100)*.3})`);sg.addColorStop(1,'transparent');cityCtx.fillStyle=sg;cityCtx.fillRect(0,HORIZON-2,W,10);
      buildings.forEach(b=>{const lit=b.lit;cityCtx.fillStyle=`rgb(${Math.floor(lerp(12,28,lit))},${Math.floor(lerp(14,38,lit))},${Math.floor(lerp(28,65,lit))})`;cityCtx.fillRect(b.x,b.y,b.w,b.h);if(lit>.1){cityCtx.strokeStyle=`rgba(100,160,255,${lit*.12})`;cityCtx.lineWidth=.5;cityCtx.strokeRect(b.x,b.y,b.w,b.h);}});
      panels.forEach(p=>{if(p.lit<.02)return;cityCtx.fillStyle=`rgba(20,30,50,${p.lit*.9})`;cityCtx.fillRect(p.x-2,p.y-2,p.w+4,p.h+4);const g=cityCtx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);g.addColorStop(0,`rgba(60,140,255,${p.lit*.85})`);g.addColorStop(1,`rgba(20,70,180,${p.lit*.3})`);cityCtx.fillStyle=g;cityCtx.fillRect(p.x,p.y,p.w,p.h);cityCtx.strokeStyle=`rgba(140,210,255,${p.lit*.45})`;cityCtx.lineWidth=.4;const nc=5,nr=2;for(let c=1;c<nc;c++){cityCtx.beginPath();cityCtx.moveTo(p.x+c*(p.w/nc),p.y);cityCtx.lineTo(p.x+c*(p.w/nc),p.y+p.h);cityCtx.stroke();}for(let r=1;r<nr;r++){cityCtx.beginPath();cityCtx.moveTo(p.x,p.y+r*(p.h/nr));cityCtx.lineTo(p.x+p.w,p.y+r*(p.h/nr));cityCtx.stroke();}});
      windows.forEach(w=>{const raw=clamp(w.lit-w.delay*.25,0,1);if(raw<.01)return;const warm=lerp(.5,1,raw),a=clamp(raw*2.5,0,1);cityCtx.fillStyle=`rgba(${Math.floor(255*warm)},${Math.floor(lerp(160,230,raw)*warm)},${Math.floor(lerp(40,90,raw)*warm*.4)},${a})`;cityCtx.fillRect(w.x,w.y,w.w,w.h);});
    }

    function spawnParticles(x,y,spd){const n=Math.ceil(spd*2.5)+1;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=rand(.8,2.8),hot=Math.random()>.4;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-rand(.3,1),life:1,decay:rand(.018,.03),r:hot?255:150,g:hot?Math.floor(rand(130,220)):200,b:hot?Math.floor(rand(0,60)):255,size:rand(1.2,2.8)});}}
    function spawnSparkle(x,y){sparkles.push({x,y,life:1,size:rand(2,4.5),decay:rand(.03,.06)});}
    function spawnRay(x,y){rays.push({x,y,angle:Math.random()*Math.PI*2,len:rand(30,80),life:1,decay:rand(.05,.1),alpha:rand(.3,.6)});}

    function drawParticles(){
      partCtx.clearRect(0,0,W,H);
      particles=particles.filter(p=>p.life>0);
      particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.055;p.life-=p.decay;partCtx.beginPath();partCtx.arc(p.x,p.y,p.size,0,Math.PI*2);partCtx.fillStyle=`rgba(${p.r},${p.g},${p.b},${clamp(p.life,0,1)*.85})`;partCtx.fill();});
      sparkles=sparkles.filter(s=>s.life>0);
      sparkles.forEach(s=>{s.life-=s.decay;const a=clamp(s.life,0,1);partCtx.save();partCtx.translate(s.x,s.y);partCtx.strokeStyle=`rgba(255,230,100,${a})`;partCtx.lineWidth=1.2;[0,45,90,135].forEach(deg=>{const rd=deg*Math.PI/180,len=s.size*5;partCtx.beginPath();partCtx.moveTo(Math.cos(rd)*1.5,Math.sin(rd)*1.5);partCtx.lineTo(Math.cos(rd)*len,Math.sin(rd)*len);partCtx.stroke();});partCtx.restore();});
      rays=rays.filter(r=>r.life>0);
      rays.forEach(r=>{r.life-=r.decay;const a=clamp(r.life,0,1)*r.alpha;partCtx.save();partCtx.translate(r.x,r.y);partCtx.rotate(r.angle);partCtx.strokeStyle=`rgba(255,220,80,${a})`;partCtx.lineWidth=1;partCtx.beginPath();partCtx.moveTo(0,0);partCtx.lineTo(r.len,0);partCtx.stroke();partCtx.restore();});
    }

    function drawMain(){
      mainCtx.clearRect(0,0,W,H);if(mouseX<0)return;
      const e=energy/100;
      if(e>.15){const HORIZON=H*.6,cA=(e-.15)*.4,g=mainCtx.createLinearGradient(mouseX,mouseY,mouseX,HORIZON);g.addColorStop(0,`rgba(255,200,60,${cA*.5})`);g.addColorStop(1,'transparent');mainCtx.beginPath();mainCtx.moveTo(mouseX,mouseY);mainCtx.lineTo(mouseX-80*(1+e),HORIZON);mainCtx.lineTo(mouseX+80*(1+e),HORIZON);mainCtx.closePath();mainCtx.fillStyle=g;mainCtx.fill();}
      const aura=mainCtx.createRadialGradient(mouseX,mouseY,0,mouseX,mouseY,180);aura.addColorStop(0,`rgba(255,240,150,${.1+e*.12})`);aura.addColorStop(.5,`rgba(255,160,40,${.05+e*.06})`);aura.addColorStop(1,'transparent');mainCtx.fillStyle=aura;mainCtx.beginPath();mainCtx.arc(mouseX,mouseY,180,0,Math.PI*2);mainCtx.fill();
    }

    function updateSky(e){
      const[r,g,b]=skyColor(e);sky.style.background=`rgb(${r},${g},${b})`;
      const ha=clamp((e-.3)*2,0,1)*.7;horizonGlow.style.background=`radial-gradient(ellipse 80% 100% at 50% 100%,rgba(255,120,30,${ha}),transparent)`;
    }

    const phases=[
      {threshold:0,html:"Your world is waiting<br>for power…",color:"rgba(200,215,255,0.92)",showBadge:true,showSubline:true},
      {threshold:25,htmlUp:"Energy is beginning<br>to flow…",htmlDown:"Energy is fading…<br>keep moving.",color:"rgba(255,200,130,0.95)",showBadge:false,showSubline:false},
      {threshold:50,htmlUp:"The city is<br>waking up.",htmlDown:"The city is<br>dimming down.",color:"rgba(255,220,140,1)",showBadge:false,showSubline:false},
      {threshold:75,htmlUp:"Clean Energy.<br>Smart Living.",htmlDown:"Don't let the<br>lights go out.",color:"rgba(255,240,160,1)",showBadge:false,showSubline:false},
      {threshold:92,htmlUp:"Your world is<br>fully powered. ✦",htmlDown:"Almost there —<br>push it further!",color:"rgba(255,250,200,1)",showBadge:false,showSubline:false,showCta:true},
    ];

    function phaseHtml(p,charging){return p.html||(charging?p.htmlUp:p.htmlDown);}

    function applyPhase(phase,charging){
      const p=phases[phase];
      headline.style.opacity='0';subline.style.opacity='0';badge.style.opacity='0';
      setTimeout(()=>{headline.innerHTML=phaseHtml(p,charging);headline.style.color=p.color;subline.style.opacity=p.showSubline?'1':'0';badge.style.opacity=p.showBadge?'1':'0';headline.style.opacity='1';if(p.showCta&&!ctaShown){ctaBtn.classList.add('visible');ctaShown=true;}},400);
    }

    function updateUI(){
      const e=energy/100,pct=Math.round(energy),now=performance.now();
      barFill.style.width=pct+'%';
      if(velocity>3)barFill.classList.add('active');else barFill.classList.remove('active');
      barLabel.textContent=`Solar Energy: ${pct}%`;
      barLabel.style.color=e>.5?'rgba(255,220,100,0.85)':'rgba(255,190,60,0.55)';
      bolts.forEach((b,i)=>b.classList.toggle('on',e>(i+1)*.18));
      const charging=velocity>2&&mouseX>0;
      let desiredPhase=0;
      for(let i=phases.length-1;i>=0;i--){if(energy>=phases[i].threshold){desiredPhase=i;break;}}
      if((desiredPhase!==currentPhase||charging!==wasCharging)&&now-phaseEnteredAt>=MIN_READ_MS){currentPhase=desiredPhase;phaseEnteredAt=now;applyPhase(currentPhase,charging);}
      wasCharging=charging;
      const kwh=Math.round(totalDist/120);sKwh.textContent=kwh.toLocaleString();sCo2.textContent=Math.round(kwh*.42);sHomes.textContent=Math.round(kwh/3.8);
    }

    // Only track mouse when in hero viewport
    heroEl.addEventListener('mousemove', e => {
      const r = heroEl.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      if(!hintGone){hintEl.style.opacity='0';hintGone=true;}
    });
    heroEl.addEventListener('mouseleave', () => { mouseX=-999; mouseY=-999; });
    heroEl.addEventListener('touchmove', e => {
      e.preventDefault();
      const r=heroEl.getBoundingClientRect(),t=e.touches[0];
      mouseX=t.clientX-r.left;mouseY=t.clientY-r.top;
      if(!hintGone){hintEl.style.opacity='0';hintGone=true;}
    },{passive:false});
    heroEl.addEventListener('touchend',()=>{mouseX=-999;mouseY=-999;});

    ctaBtn.addEventListener('click', () => {
      document.getElementById('section-why').scrollIntoView({behavior:'smooth'});
    });

    function loop(){
      frame++;
      const dx=mouseX-prevX,dy=mouseY-prevY;velocity=Math.sqrt(dx*dx+dy*dy);
      if(mouseX>0)totalDist+=velocity;
      if(velocity>2&&mouseX>0){energy=clamp(energy+velocity*.018,0,100);if(velocity>8)spawnParticles(mouseX,mouseY,velocity/8);if(velocity>14&&Math.random()>.55)spawnSparkle(mouseX,mouseY);if(velocity>20&&Math.random()>.7)spawnRay(mouseX,mouseY);}
      else{energy=clamp(energy-.12,0,100);}
      prevX=mouseX;prevY=mouseY;
      const e=energy/100;
      buildings.forEach(b=>b.lit=lerp(b.lit,e,.03));
      windows.forEach(w=>w.lit=lerp(w.lit,e,.025));
      panels.forEach(p=>p.lit=lerp(p.lit,e,.04));
      updateSky(e);drawStars(e);drawCity();drawMain();drawParticles();updateUI();
      requestAnimationFrame(loop);
    }

    applyPhase(0,true);
    window.addEventListener('resize',resize);
    resize();
    loop();
  })();