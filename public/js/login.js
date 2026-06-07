// ── Custom cursor ──────────────────────────────────────────────────────────────
const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  const { clientX: x, clientY: y } = e;
  cursor.style.transform     = `translate(${x}px, ${y}px)`;
  cursorRing.style.transform = `translate(${x}px, ${y}px)`;
});

// ── Eye toggle SVGs ────────────────────────────────────────────────────────────
const eyeOpen = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 12C4 12 5.6 7 12 7M12 7C18.4 7 20 12 20 12M12 7V4M18 5L16 7.5M6 5L8 7.5M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const eyeClosed = `<svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.49998 9C5.18597 9 3.56111 7.84827 2.49664 6.66552C1.96405 6.07375 1.57811 5.48029 1.32563 5.03474C1.19968 4.81247 1.10772 4.62838 1.04797 4.50164C1.01811 4.4383 0.996349 4.3894 0.98246 4.35735C0.975517 4.34133 0.970545 4.32953 0.967517 4.32225C0.966003 4.31861 0.964975 4.3161 0.96443 4.31477C0.5 4.5C0.0357612 4.68569 0.0359408 4.68614C0.0367599 4.68818C0.0385076 4.69248C0.0442628 4.70644C0.0649031 4.75495C0.143439 4.92805C0.455611 5.52776C0.734381 6.01971 1.75334 7.33448C2.93886 8.65173 4.814 10 7.49998 10V9ZM14.5 4.5C14.0358 4.3143 14.036 4.31364C14.0356 4.31476C14.0175 4.35735C13.952 4.50163C13.6744 5.03474C12.5033 6.66552C11.4389 7.84827 9.814 9 7.49998 9V10C10.186 10 12.0611 8.65173 13.2466 7.33448C14.5444 5.52776C14.8566 4.92805C14.9557 4.70644C14.9615 4.69248C14.9641 4.68615C14.5 4.5ZM8 12L7.99998 9.5L6.99998 9.5L7 12L8 12ZM1.35355 10.3536L3.35355 8.35355L2.64645 7.64645L0.646447 9.64645L1.35355 10.3536ZM11.6464 8.35355L13.6464 10.3536L14.3536 9.64645L12.3536 7.64645L11.6464 8.35355Z" fill="#1D2D44"/>
</svg>`;

document.getElementById('togglePw').addEventListener('click', () => {
  const pw = document.getElementById('password');
  const isHidden = pw.type === 'password';
  pw.type = isHidden ? 'text' : 'password';
  document.getElementById('togglePw').innerHTML = isHidden ? eyeOpen : eyeClosed;
});

// ── Frontend validation ────────────────────────────────────────────────────────
function validateForm() {
  document.getElementById('emailError').innerText = '';
  document.getElementById('pwError').innerText    = '';

  const email = document.getElementById('email').value;
  if (!/^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email)) {
    document.getElementById('emailError').innerText = 'Enter a valid email address.';
    return false;
  }

  const password = document.getElementById('password').value;
  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    document.getElementById('pwError').innerText =
      'Password must be at least 8 characters, have one uppercase letter, and one number.';
    return false;
  }

  return true;
}

// ── Login submit handler ───────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const btn        = document.getElementById('loginBtn');
  const banner     = document.getElementById('errorBanner');
  const bannerText = document.getElementById('errorText');

  btn.innerText    = 'Signing in…';
  btn.disabled     = true;
  banner.style.display = 'none';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Store in localStorage (for fetch/AJAX calls)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));

      // ALSO store in cookie so server-side auth middleware can read it
      // Expires in 7 days
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `token=${data.token}; expires=${expires}; path=/; SameSite=Lax`;

      // Redirect based on role
      if (data.user && (data.user.role === 'admin' || data.user.role === 'superadmin')) {
        window.location.href = '/appointments/admin/dashboard';
      } else {
        window.location.href = '/userdash';
      }
    } else {
      bannerText.innerText    = data.message || 'Invalid credentials.';
      banner.style.display    = 'block';
      btn.innerText           = 'Sign In →';
      btn.disabled            = false;
    }
  } catch (err) {
    bannerText.innerText  = 'Network error. Please try again.';
    banner.style.display  = 'block';
    btn.innerText         = 'Sign In →';
    btn.disabled          = false;
  }
}