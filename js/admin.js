// ===== ADMIN.JS =====

const AdminPage = {
  user: null,
  allUsers: [],
  allCourses: [],

  init() {
    this.user = Auth.requireAdmin();
    if (!this.user) return;

    const info = document.getElementById('admin-user-info');
    if (info) info.textContent = `👤 ${this.user.name}`;

    this.allUsers = DB.getUsers();
    this.allCourses = DB.getCourses();

    this.renderOverview();
    this.renderUsersTable(this.allUsers);
    this.renderCoursesTable(this.allCourses);
    this.renderCategoriesTable();
  },

  showTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab)?.classList.add('active');

    const tabLabels = { overview: 'ภาพรวมระบบ', users: 'จัดการสมาชิก', courses: 'จัดการคอร์ส', categories: 'จัดการหมวดหมู่' };
    document.getElementById('admin-page-title').textContent = tabLabels[tab] || '';

    const btns = document.querySelectorAll('.admin-nav-item');
    const tabIdx = { overview: 0, users: 1, courses: 2, categories: 3 };
    if (btns[tabIdx[tab]]) btns[tabIdx[tab]].classList.add('active');
  },

  // ===== OVERVIEW =====
  renderOverview() {
    const cats = DB.getCategories();
    const totalLikes = this.allCourses.reduce((sum, c) => sum + (c.likes || 0), 0);

    document.getElementById('a-total-users').textContent = this.allUsers.length;
    document.getElementById('a-total-courses').textContent = this.allCourses.length;
    document.getElementById('a-total-cats').textContent = cats.length;
    document.getElementById('a-total-likes').textContent = totalLikes;

    // Top courses table
    const topCourses = [...this.allCourses]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
    const topTbody = document.querySelector('#top-courses-table tbody');
    if (topTbody) {
      topTbody.innerHTML = '';
      topCourses.forEach((c, i) => {
        const cat = DB.getCategoryById(c.categoryId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${c.emoji || '📚'} ${c.title}</td>
          <td>${cat ? cat.name : '—'}</td>
          <td>❤️ ${c.likes || 0}</td>
          <td>${c.authorName}</td>
        `;
        topTbody.appendChild(tr);
      });
    }

    // Recent users table
    const recentUsers = [...this.allUsers]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 5);
    const recentTbody = document.querySelector('#recent-users-table tbody');
    if (recentTbody) {
      recentTbody.innerHTML = '';
      recentUsers.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td><span class="role-tag ${u.role}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
          <td>${(u.enrolledCourses || []).length} คอร์ส</td>
          <td>${(u.createdCourses || []).length} คอร์ส</td>
        `;
        recentTbody.appendChild(tr);
      });
    }
  },

  // ===== USERS =====
  renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.name}</td>
        <td style="color:var(--text2);font-size:.83rem">${u.email}</td>
        <td><span class="role-tag ${u.role}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
        <td>${(u.enrolledCourses || []).length}</td>
        <td>${(u.createdCourses || []).length}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${u.role !== 'admin'
              ? `<button class="tbl-btn promote" onclick="AdminPage.promoteUser('${u.id}')">⬆ Admin</button>`
              : (u.id !== 'u_admin' ? `<button class="tbl-btn" onclick="AdminPage.demoteUser('${u.id}')">⬇ User</button>` : '<span style="color:var(--text3);font-size:.78rem">Owner</span>')
            }
            ${u.id !== this.user.id && u.id !== 'u_admin'
              ? `<button class="tbl-btn del" onclick="AdminPage.deleteUser('${u.id}')">✕ ลบ</button>`
              : ''
            }
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  searchUsers(val) {
    const q = val.toLowerCase();
    const filtered = this.allUsers.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    this.renderUsersTable(filtered);
  },

  promoteUser(id) {
    const users = DB.getUsers();
    const u = users.find(u => u.id === id);
    if (!u) return;
    u.role = 'admin';
    DB.saveUsers(users);
    this.allUsers = DB.getUsers();
    this.renderUsersTable(this.allUsers);
    showToast(`${u.name} ได้รับสิทธิ์ Admin แล้ว`);
  },

  demoteUser(id) {
    const users = DB.getUsers();
    const u = users.find(u => u.id === id);
    if (!u) return;
    u.role = 'user';
    DB.saveUsers(users);
    this.allUsers = DB.getUsers();
    this.renderUsersTable(this.allUsers);
    showToast(`${u.name} ถูกลดเป็น User แล้ว`);
  },

  deleteUser(id) {
    if (!confirm('ยืนยันลบสมาชิกนี้?')) return;
    const users = DB.getUsers().filter(u => u.id !== id);
    DB.saveUsers(users);
    this.allUsers = DB.getUsers();
    this.renderUsersTable(this.allUsers);
    this.renderOverview();
    showToast('ลบสมาชิกเรียบร้อย');
  },

  // ===== COURSES =====
  renderCoursesTable(courses) {
    const tbody = document.getElementById('courses-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    courses.forEach(c => {
      const cat = DB.getCategoryById(c.categoryId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.emoji || '📚'} <strong>${c.title}</strong></td>
        <td>${cat ? cat.name : '—'}</td>
        <td style="color:var(--text2);font-size:.83rem">${c.authorName}</td>
        <td style="text-align:center">${(c.lessons || []).length}</td>
        <td style="text-align:center">${(c.quiz || []).length}</td>
        <td style="text-align:center">❤️ ${c.likes || 0}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="tbl-btn promote" onclick="window.location.href='learn.html?id=${c.id}'">▶ เปิด</button>
            <button class="tbl-btn del" onclick="AdminPage.deleteCourse('${c.id}')">✕ ลบ</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  searchCourses(val) {
    const q = val.toLowerCase();
    const filtered = this.allCourses.filter(c =>
      c.title.toLowerCase().includes(q) || c.authorName.toLowerCase().includes(q)
    );
    this.renderCoursesTable(filtered);
  },

  deleteCourse(id) {
    if (!confirm('ยืนยันลบคอร์สนี้?')) return;
    DB.deleteCourse(id);
    // Remove from all users' createdCourses & enrolledCourses
    const users = DB.getUsers();
    users.forEach(u => {
      if (u.createdCourses) u.createdCourses = u.createdCourses.filter(cid => cid !== id);
      if (u.enrolledCourses) u.enrolledCourses = u.enrolledCourses.filter(cid => cid !== id);
      if (u.progress) delete u.progress[id];
    });
    DB.saveUsers(users);
    this.allCourses = DB.getCourses();
    this.renderCoursesTable(this.allCourses);
    this.renderOverview();
    showToast('ลบคอร์สเรียบร้อย');
  },

  // ===== CATEGORIES =====
  renderCategoriesTable() {
    const tbody = document.getElementById('cats-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const cats = DB.getCategories();
    const courses = DB.getCourses();

    cats.forEach(cat => {
      const count = courses.filter(c => c.categoryId === cat.id).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat.icon || '📂'} ${cat.name}</td>
        <td style="text-align:center">${count}</td>
        <td>
          ${count === 0
            ? `<button class="tbl-btn del" onclick="AdminPage.deleteCategory('${cat.id}')">✕ ลบ</button>`
            : `<span style="color:var(--text3);font-size:.78rem">มีคอร์ส ${count} คอร์ส</span>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  addCategory() {
    const input = document.getElementById('new-cat-admin');
    const name = input?.value.trim();
    if (!name) { showToast('กรุณากรอกชื่อหมวดหมู่', 'error'); return; }

    const icons = ['📂','📌','🎯','⭐','🏷️','🔷'];
    const newCat = {
      id: DB.genId('cat'),
      name,
      icon: icons[Math.floor(Math.random() * icons.length)]
    };
    DB.addCategory(newCat);
    input.value = '';
    this.renderCategoriesTable();
    this.renderOverview();
    showToast('เพิ่มหมวดหมู่เรียบร้อย');
  },

  deleteCategory(id) {
    if (!confirm('ยืนยันลบหมวดหมู่นี้?')) return;
    DB.deleteCategory(id);
    this.renderCategoriesTable();
    this.renderOverview();
    showToast('ลบหมวดหมู่เรียบร้อย');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminPage.init());