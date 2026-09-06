/* Houminusite — Auth logic (register & login)
   Penyimpanan akun disimulasikan dengan localStorage, cukup untuk demo
   front-end. Untuk produksi, ganti bagian simpan/cek akun dengan panggilan
   ke API/back-end sungguhan. */

const HOUMINI_USERS_KEY = 'houmini_users';
const HOUMINI_SESSION_KEY = 'houmini_session';

function getUsers(){
  try{
    return JSON.parse(localStorage.getItem(HOUMINI_USERS_KEY)) || [];
  }catch(e){
    return [];
  }
}

function saveUsers(users){
  localStorage.setItem(HOUMINI_USERS_KEY, JSON.stringify(users));
}

function setSession(user){
  localStorage.setItem(HOUMINI_SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
}

function isPasswordValid(password){
  // Minimal 8 karakter, mengandung minimal satu huruf, satu angka,
  // dan satu karakter spesial. Contoh yang lolos: Alok1234#
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasMinLength && hasLetter && hasNumber && hasSpecial;
}

function passwordScore(password){
  let score = 0;
  if(password.length >= 8) score++;
  if(/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score++;
  if(/[^A-Za-z0-9]/.test(password) && password.length >= 10) score++;
  return score; // 0..3
}

function showBanner(el, message, type){
  el.textContent = message;
  el.className = 'form-banner show ' + type;
}

function setFieldError(fieldEl, message){
  fieldEl.classList.add('has-error');
  const errorEl = fieldEl.querySelector('.field-error');
  if(errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldEl){
  fieldEl.classList.remove('has-error');
}

/* ---------------------------------------------------------------- Register */

function initRegisterForm(){
  const form = document.getElementById('register-form');
  if(!form) return;

  const nameField = document.getElementById('field-name');
  const emailField = document.getElementById('field-email');
  const passField = document.getElementById('field-password');
  const passInput = document.getElementById('input-password');
  const strengthBars = document.querySelectorAll('.password-strength i');
  const banner = document.getElementById('form-banner');

  passInput.addEventListener('input', () => {
    const score = passwordScore(passInput.value);
    strengthBars.forEach((bar, i) => {
      bar.className = '';
      if(i < score){
        bar.className = score === 1 ? 'on-weak' : score === 2 ? 'on-mid' : 'on-strong';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    banner.className = 'form-banner';

    const name = document.getElementById('input-name').value.trim();
    const email = document.getElementById('input-email').value.trim().toLowerCase();
    const password = passInput.value;

    let valid = true;

    [nameField, emailField, passField].forEach(clearFieldError);

    if(name.length < 2){
      setFieldError(nameField, 'Nama lengkap wajib diisi.');
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
      setFieldError(emailField, 'Masukkan alamat email yang valid.');
      valid = false;
    }

    if(!isPasswordValid(password)){
      setFieldError(passField, 'Minimal 8 karakter, kombinasi huruf, angka, dan simbol (contoh: Alok1234#).');
      valid = false;
    }

    if(!valid) return;

    const users = getUsers();
    if(users.some(u => u.email === email)){
      showBanner(banner, 'Email ini sudah terdaftar. Silakan masuk lewat halaman login.', 'error');
      return;
    }

    users.push({ name, email, password });
    saveUsers(users);
    setSession({ name, email });

    showBanner(banner, 'Akun berhasil dibuat. Mengalihkan ke Houminusite…', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  });
}

/* ------------------------------------------------------------------- Login */

function initLoginForm(){
  const form = document.getElementById('login-form');
  if(!form) return;

  const emailField = document.getElementById('field-email');
  const passField = document.getElementById('field-password');
  const banner = document.getElementById('form-banner');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    banner.className = 'form-banner';
    [emailField, passField].forEach(clearFieldError);

    const email = document.getElementById('input-email').value.trim().toLowerCase();
    const password = document.getElementById('input-password').value;

    const users = getUsers();
    const match = users.find(u => u.email === email && u.password === password);

    if(!match){
      showBanner(banner, 'Email atau kata sandi salah. Belum punya akun? Daftar dulu, ya.', 'error');
      return;
    }

    setSession(match);
    showBanner(banner, 'Berhasil masuk. Mengalihkan ke dashboard…', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 700);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
  initLoginForm();
});
