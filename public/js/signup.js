const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  const { clientX: x, clientY: y } = e;
  
  // Move main cursor instantly
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  
  // Move ring slightly delayed
  cursorRing.style.transform = `translate(${x}px, ${y}px)`;
});


const eyeOpen = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 12C4 12 5.6 7 12 7M12 7C18.4 7 20 12 20 12M12 7V4M18 5L16 7.5M6 5L8 7.5M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const eyeClosed=`<svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.49998 9C5.18597 9 3.56111 7.84827 2.49664 6.66552C1.96405 6.07375 1.57811 5.48029 1.32563 5.03474C1.19968 4.81247 1.10772 4.62838 1.04797 4.50164C1.01811 4.4383 0.996349 4.3894 0.98246 4.35735C0.975517 4.34133 0.970545 4.32953 0.967517 4.32225C0.966003 4.31861 0.964975 4.3161 0.96443 4.31477C0.964157 4.3141 0.964005 4.31372 0.963973 4.31364C0.963958 4.31361 0.963972 4.31364 0.964016 4.31375C0.964038 4.31381 0.964094 4.31394 0.964105 4.31397C0.964168 4.31413 0.964239 4.31431 0.5 4.5C0.0357612 4.68569 0.0358471 4.68591 0.0359408 4.68614C0.0359823 4.68625 0.036084 4.6865 0.0361671 4.68671C0.0363335 4.68712 0.0365311 4.68761 0.0367599 4.68818C0.0372175 4.68931 0.0377999 4.69075 0.0385076 4.69248C0.0399231 4.69595 0.0418401 4.70062 0.0442628 4.70644C0.0491078 4.71808 0.0559773 4.73436 0.0649031 4.75495C0.0827516 4.79614 0.108844 4.85467 0.143439 4.92805C0.212592 5.07474 0.315944 5.28128 0.455611 5.52776C0.734381 6.01971 1.16093 6.67625 1.75334 7.33448C2.93886 8.65173 4.814 10 7.49998 10V9ZM14.5 4.5C14.0358 4.3143 14.0358 4.31413 14.0359 4.31397C14.0359 4.31394 14.036 4.3138 14.036 4.31375C14.036 4.31364 14.036 4.3136 14.036 4.31364C14.036 4.31372 14.0358 4.3141 14.0356 4.31476C14.035 4.3161 14.034 4.31861 14.0325 4.32225C14.0295 4.32952 14.0245 4.34132 14.0175 4.35735C14.0037 4.3894 13.9819 4.4383 13.952 4.50163C13.8923 4.62838 13.8003 4.81246 13.6744 5.03474C13.4219 5.48029 13.0359 6.07375 12.5033 6.66552C11.4389 7.84827 9.814 9 7.49998 9V10C10.186 10 12.0611 8.65173 13.2466 7.33448C13.8391 6.67625 14.2656 6.01971 14.5444 5.52776C14.6841 5.28129 14.7874 5.07474 14.8566 4.92805C14.8912 4.85467 14.9172 4.79615 14.9351 4.75496C14.944 4.73436 14.9509 4.71808 14.9557 4.70644C14.9582 4.70062 14.9601 4.69595 14.9615 4.69248C14.9622 4.69075 14.9628 4.68931 14.9632 4.68818C14.9635 4.68761 14.9637 4.68712 14.9638 4.68671C14.9639 4.6865 14.964 4.68625 14.9641 4.68615C14.9642 4.68591 14.9642 4.6857 14.5 4.5ZM8 12L7.99998 9.5L6.99998 9.5L7 12L8 12ZM1.35355 10.3536L3.35355 8.35355L2.64645 7.64645L0.646447 9.64645L1.35355 10.3536ZM11.6464 8.35355L13.6464 10.3536L14.3536 9.64645L12.3536 7.64645L11.6464 8.35355Z" fill="#1D2D44"/>
</svg>`;



document.getElementById('togglePw').addEventListener('click', () => {
  const pw = document.getElementById('password');
  const isHidden = pw.type === 'password';
  pw.type = isHidden ? 'text' : 'password';
  document.getElementById('togglePw').innerHTML = isHidden ? eyeOpen : eyeClosed;
});


document.getElementById('toggleCpw').addEventListener('click', () => {
  const pw = document.getElementById('confirm-password');
  const isHidden = pw.type === 'password';
  pw.type = isHidden ? 'text' : 'password';
  document.getElementById('toggleCpw').innerHTML = isHidden ? eyeOpen : eyeClosed;
});



function validateForm() {
  
  document.getElementById('nameError').innerText='';
  document.getElementById('emailError').innerText='';
  document.getElementById('pwError').innerText='';
  document.getElementById('cpwError').innerText='';


  const name = document.getElementById('name').value;
  if (name=== '') {
    document.getElementById('nameError').innerText = 'Full name is required.';
    return false;
  }

  
  const email = document.getElementById('email').value;
  const emailregex = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!emailregex.test(email)){
    document.getElementById('emailError').innerText = 'Enter a valid email address.';
    return false;
  }

  
  const password = document.getElementById('password').value;
  const pwregex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!pwregex.test(password)) {
    document.getElementById('pwError').innerText = 'Password must be at least 8 characters, have one uppercase letter, and one number.';
    return false;
  }

const cpassword = document.getElementById('confirm-password').value;
if(password !== cpassword) {
  document.getElementById('cpwError').innerText = 'Passwords do not match.';
  return false;
}


  return true;
}