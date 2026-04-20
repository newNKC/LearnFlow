// ===== PROFILE.JS =====

const ProfilePage = {
  user: null,

  init() {
    this.user = initSharedUI();
    if (!this.user) return;
    this.renderProfile();
    this.renderStats();
    this.renderHistory();
    this.renderMyCourses();
  },

  renderProfile() {
    const u = this.user;
    const initials = u.name.charAt(0).toUpperCase();

    const avatarBig = document.getElementById('profile-avatar-big');
    if (avatarBig) {
      avatarBig.textContent = initials;
      avatarBig.style.background = stringToColor(u.name);
    }
    document.getElementById('profile-name').textContent = u.name;
    document.getElementById('profile-email').textContent = u.email;

    const roleBadge = document.getElementById('profile-role');
    if (roleBadge) {
      roleBadge.textContent = u.role === 'admin' ? 'Admin' : 'สมาชิก';
      if (u.role === 'admin') roleBadge.classList.add('admin');
    }

    // Pre-fill edit form
    const editName = document.getElementById('edit-name');
    if (editName) editName.value = u.name;
  },

  renderStats() {
    const u = this.user;
    const enrolled = (u.enrolledCourses || []).length;
    const created = (u.createdCourses || []).length;

    let completedCount = 0;
    let totalPct = 0, count = 0;
    if (u.progress) {
      Object.entries(u.progress).forEach(([cid, prog]) => {
        totalPct += prog.pct || 0;
        count++;
        if (prog.pct >= 100) completedCount++;
      });
    }
    const avg = count > 0 ? Math.round(totalPct / count) : 0;

    document.getElementById('ps-enrolled').textContent = enrolled;
    document.getElementById('ps-completed').textContent = completedCount;
    document.getElementById('ps-created').textContent = created;
    document.getElementById('ps-avg').textContent = avg + '%';
  },

  renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    const u = this.user;

    const enrolled = u.enrolledCourses || [];
    if (enrolled.length === 0) {
      container.innerHTML = '<p style="color:var(--text2);font-size:.9rem">ยังไม่มีประวัติการเรียน</p>';
      return;
    }

    enrolled.forEach(courseId => {
      const course = DB.getCourseById(courseId);
      if (!course) return;
      const cat = DB.getCategoryById(course.categoryId);
      const prog = u.progress && u.progress[courseId];
      const pct = prog ? (prog.pct || 0) : 0;

      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-icon" style="background:${course.color || '#7c6ef0'}22">
          ${course.emoji || '📚'}
        </div>
        <div class="history-info">
          <div class="history-title">${course.title}</div>
          <div class="history-cat">${cat ? cat.name : 'ทั่วไป'} · ${course.authorName}</div>
        </div>
        <div class="history-progress">
          <div class="history-pct">${pct}% เสร็จแล้ว</div>
          <div class="mini-progress"><div class="mini-progress-fill" style="width:${pct}%"></div></div>
        </div>
      `;
      item.onclick = () => { window.location.href = `learn.html?id=${course.id}`; };
      container.appendChild(item);
    });
  },

  renderMyCourses() {
    const container = document.getElementById('my-courses');
    if (!container) return;
    const u = this.user;
    const created = u.createdCourses || [];

    if (created.length === 0) {
      container.innerHTML = '<p style="color:var(--text2);font-size:.9rem">ยังไม่ได้สร้างคอร์ส — <a href="create-course.html" style="color:var(--accent)">สร้างคอร์สแรก</a></p>';
      return;
    }

    created.forEach(cid => {
      const course = DB.getCourseById(cid);
      if (!course) return;
      const card = renderCourseCard(course, u, () => {
        window.location.href = `learn.html?id=${course.id}`;
      });
      container.appendChild(card);
    });
  },

  toggleEdit() {
    document.getElementById('edit-form')?.classList.toggle('hidden');
  },

  saveEdit() {
    const name = document.getElementById('edit-name').value.trim();
    const password = document.getElementById('edit-password').value;
    if (!name) { showToast('กรุณากรอกชื่อ', 'error'); return; }
    if (password && password.length < 6) { showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return; }

    const u = DB.getUserById(this.user.id);
    u.name = name;
    if (password) u.password = password;
    DB.updateUser(u);
    this.user = DB.getCurrentUser();

    showToast('บันทึกข้อมูลเรียบร้อย');
    this.toggleEdit();
    this.renderProfile();
    renderUserMini(this.user);
    renderAvatarBtn(this.user);
  }
};

document.addEventListener('DOMContentLoaded', () => ProfilePage.init());