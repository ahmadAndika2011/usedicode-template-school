(() => {
  const GOOGLE_CLIENT_ID = '106189507367-6cjhm4pc51hsbtmtc1jhpdvtf35rn2am.apps.googleusercontent.com'

  const $ = (id) => document.getElementById(id);
  const modal = $('auth-modal');
  const signupBtn = $('signup-btn');
  const loginBtn = $('login-btn');
  if (!modal || !signupBtn || !loginBtn) return;

  const titleEl = $('auth-title');
  const stepGoogle = $('auth-step-google');
  const form = $('signup-form');
  const errorEl = $('auth-error');

  let currentUser = null;
  let gsiReady = false;

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan. Coba lagi.');
    return data;
  }

  const showError = (msg) => { errorEl.textContent = msg || ''; };

  function showStep(step) {
    stepGoogle.hidden = step !== 'google';
    form.hidden = step !== 'form';
  }

  function renderHeader() {
    if (currentUser) {
      loginBtn.style.display = 'none';
      signupBtn.textContent = `Keluar (${(currentUser.name || currentUser.username).split(' ')[0]})`;
    } else {
      loginBtn.style.display = '';
      signupBtn.textContent = 'SignUp';
    }
  }

  function closeModal() { modal.hidden = true; }

  function onLoggedIn(user) {
    currentUser = user;
    form.reset();
    renderHeader();
    closeModal();
  }

  async function handleCredential(resp) {
    showError('');
    try {
      const data = await postJSON('/api/auth/google', { credential: resp.credential });
      if (data.status === 'login') {
        onLoggedIn(data.user);
      } else if (data.status === 'need_profile') {
        $('signup-name').textContent = data.name;
        showStep('form');
        $('signup-username').focus();
      }
    } catch (err) {
      showError(err.message);
    }
  }

  function openModal(mode) {
    showError('');
    showStep('google');
    titleEl.textContent = mode === 'signup' ? 'Daftar ke SMA Nusantara' : 'Masuk ke SMA Nusantara';
    modal.hidden = false;

    if (!window.google?.accounts?.id) {
      showError('Layanan Google belum termuat. Periksa koneksi internet lalu coba lagi.');
      return;
    }
    if (!gsiReady) {
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
      gsiReady = true;
    }
    $('google-btn').innerHTML = '';
    google.accounts.id.renderButton($('google-btn'), {
      theme: 'outline', size: 'large', shape: 'pill', width: 280, locale: 'id',
      text: mode === 'signup' ? 'signup_with' : 'signin_with',
    });
  }

  // Submit form langkah 2
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    const submit = $('signup-submit');
    submit.disabled = true;
    try {
      const data = await postJSON('/api/auth/complete-signup', {
        username: $('signup-username').value.trim(),
        password: $('signup-password').value,
        id_siswa: $('signup-idsiswa').value.trim(),   // boleh kosong
      });
      onLoggedIn(data.user);
    } catch (err) {
      showError(err.message);
    } finally {
      submit.disabled = false;
    }
  });

  signupBtn.addEventListener('click', async () => {
    if (!currentUser) return openModal('signup');
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    renderHeader();
  });
  loginBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });
  $('auth-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // cek apakah sudah login
  fetch('/api/auth/me').then(r => r.json()).then(d => { currentUser = d.user; renderHeader(); }).catch(() => {});
})();