// ===== AUTH.JS =====
const Auth = {
  login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.textContent = '';

    if (!email || !password) { errEl.textContent = 'กรุณากรอกข้อมูลให้ครบ'; return; }
//fix turn to case insensitive for email section
    const users = DB.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) { errEl.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'; return; }

    DB.setCurrentUser(user.id, true);
    window.location.href = 'dashboard.html';
  },

  register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl = document.getElementById('reg-error');
    errEl.textContent = '';

    if (!name || !email || !password) { errEl.textContent = 'กรุณากรอกข้อมูลให้ครบ'; return; }
    if (password.length < 6) { errEl.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; return; }
//fix turn to case insensitive for email section
    const users = DB.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) { errEl.textContent = 'อีเมลนี้ถูกใช้งานแล้ว'; return; }

    const newUser = {
      id: DB.genId('u'),
      name,
      email,
      password,
      role: 'user',
      createdAt: Date.now(),
      enrolledCourses: [],
      createdCourses: [],
      progress: {}
    };
    users.push(newUser);
    DB.saveUsers(users);
    DB.setCurrentUser(newUser.id, true);
    window.location.href = 'dashboard.html';
  },

  logout() {
    DB.clearCurrentUser();
    window.location.href = 'index.html';
  },

  requireAuth() {
    const user = DB.getCurrentUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    return user;
  },

  requireAdmin() {
    const user = Auth.requireAuth();
    if (!user || user.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return null;
    }
    return user;
  }
};

// ===== Tab switching on auth page =====
document.addEventListener('DOMContentLoaded', () => {
  // Auth tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab)?.classList.add('active');
    });
  });

  // Allow Enter key on auth forms
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') Auth.login();
  });
  document.getElementById('reg-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') Auth.register();
  });

  // Auto-redirect if logged in and on index
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    if (DB.getCurrentUser()) window.location.href = 'dashboard.html';
  }
});