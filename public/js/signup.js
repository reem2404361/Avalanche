const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

const eyeOpen = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12C4 12 5.6 7 12 7M12 7C18.4 7 20 12 20 12M12 7V4M18 5L16 7.5M6 5L8 7.5M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const eyeClosed = `<svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 9C5.186 9 3.561 7.848 2.497 6.666C1.964 6.074 1.578 5.48 1.326 5.035C1.2 4.812 1.108 4.628 1.048 4.502C1.018 4.438 0.996 4.389 0.982 4.357C0.5 4.5C0.036 4.686C0.143 4.928C0.734 6.02 1.753 7.334 2.939 8.652C4.814 10 7.5 10 7.5 10V9ZM14.5 4.5C14.036 4.314C13.952 4.502C13.422 5.48C12.503 6.666C11.439 7.848 9.814 9 7.5 9V10C10.186 10 13.247 7.334 14.544 5.528C14.886 4.855C14.956 4.706C14.5 4.5ZM8 12L8 9.5L7 9.5L7 12L8 12ZM1.354 10.354L3.354 8.354L2.646 7.646L0.646 9.646L1.354 10.354ZM11.646 8.354L13.646 10.354L14.354 9.646L12.354 7.646L11.646 8.354Z" fill="#1D2D44"/></svg>`;

document.getElementById('togglePw').addEventListener('click', () => {
  const pw = document.getElementById('password');
  const hidden = pw.type === 'password';
  pw.type = hidden ? 'text' : 'password';
  document.getElementById('togglePw').innerHTML = hidden ? eyeOpen : eyeClosed;
});

document.getElementById('toggleCpw').addEventListener('click', () => {
  const pw = document.getElementById('confirm-password');
  const hidden = pw.type === 'password';
  pw.type = hidden ? 'text' : 'password';
  document.getElementById('toggleCpw').innerHTML = hidden ? eyeOpen : eyeClosed;
});

function validateForm() {
  ['nameError','emailError','pwError','cpwError'].forEach(id => document.getElementById(id).innerText = '');

  const name = document.getElementById('name').value.trim();
  if (!name) { document.getElementById('nameError').innerText = 'Full name is required.'; return false; }

  const email = document.getElementById('email').value;
  if (!/^[^ ]+@[^ ]+\.[a-z]{2,}$/i.test(email)) { document.getElementById('emailError').innerText = 'Enter a valid email address.'; return false; }

  const password = document.getElementById('password').value;
  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    document.getElementById('pwError').innerText = 'Password must be 8+ chars, one uppercase, one number.'; return false;
  }

  const cpassword = document.getElementById('confirm-password').value;
  if (password !== cpassword) { document.getElementById('cpwError').innerText = 'Passwords do not match.'; return false; }

  return true;
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerText = 'Creating...';
  btn.disabled = true;

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:     document.getElementById('name').value.trim(),
        email:    document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `token=${data.token}; expires=${expires}; path=/; SameSite=Lax`;

      if (data.user && (data.user.role === 'admin' || data.user.role === 'superadmin')) {
        window.location.href = '/appointments/admin/dashboard';
      } else {
        window.location.href = '/userdash';
      }
    } else {
      document.getElementById('cpwError').innerText = data.message || 'Signup failed. Try again.';
      btn.innerText = 'Create Account';
      btn.disabled = false;
    }
  } catch (err) {
    document.getElementById('cpwError').innerText = 'Network error. Please try again.';
    btn.innerText = 'Create Account';
    btn.disabled = false;
  }
});