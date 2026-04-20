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

// ===== PROFILE IMAGE UPLOAD EXTENSION =====

document.addEventListener('DOMContentLoaded', () => {
  const avatar = document.getElementById('profile-avatar-big');
  if (!avatar) return;

  let fileInput = document.getElementById('avatar-upload-input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.id = 'avatar-upload-input';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  }

  avatar.style.cursor = 'pointer';
  avatar.title = 'คลิกเพื่อเปลี่ยนรูปโปรไฟล์';
  avatar.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;
      avatar.innerHTML = `<img src="${imageData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      const u = DB.getUserById(ProfilePage.user.id);
      u.avatar = imageData;
      DB.updateUser(u);
      showToast('อัปโหลดรูปโปรไฟล์เรียบร้อย');
    };
    reader.readAsDataURL(file); // ย้ายเข้ามาอยู่ในฟังก์ชันเปลี่ยนไฟล์
  });
});

// ===== PATCH: แสดงรูปตอน render =====
(function () {
  const originalRender = ProfilePage.renderProfile;

  ProfilePage.renderProfile = function () {
    originalRender.apply(this, arguments);

    const avatarBig = document.getElementById('profile-avatar-big');
    const u = this.user;

    if (u.avatar && avatarBig) {
      avatarBig.innerHTML = `<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
  };
})();

// ===== PROFILE IMAGE CROP EXTENSION =====

let cropper;
let cropModal;

document.addEventListener('DOMContentLoaded', () => {
  const avatar = document.getElementById('profile-avatar-big');
  if (!avatar) return;

  cropModal = document.createElement('div');
  cropModal.innerHTML = `
    <div id="crop-overlay" style="
      position:fixed; inset:0; background:rgba(0,0,0,.7);
      display:flex; align-items:center; justify-content:center; z-index:9999;">
      <div style="background:#fff;padding:16px;border-radius:12px;max-width:90%;">
        <img id="crop-image" style="max-width:100%;max-height:60vh;">
        <div style="margin-top:10px;text-align:right;">
          <button id="crop-cancel">ยกเลิก</button>
          <button id="crop-save" style="margin-left:8px;">บันทึก</button>
        </div>
      </div>
    </div>
  `;
  cropModal.style.display = 'none';
  document.body.appendChild(cropModal);

  let fileInput = document.getElementById('avatar-upload-input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.id = 'avatar-upload-input';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  }

  avatar.onclick = () => fileInput.click();

  fileInput.onchange = function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('crop-image');
      img.src = e.target.result;
      cropModal.style.display = 'block';

      if (cropper) cropper.destroy();
      cropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 1
      });
    };
    reader.readAsDataURL(file);
  };

  document.addEventListener('click', e => {
    if (e.target.id === 'crop-cancel') {
      cropModal.style.display = 'none';
      if (cropper) cropper.destroy();
    }
  });

  document.addEventListener('click', e => {
    if (e.target.id === 'crop-save') {
      const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300
      });

      const imageData = canvas.toDataURL('image/png');
      const avatarBig = document.getElementById('profile-avatar-big');
      avatarBig.innerHTML = `<img src="${imageData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

      const u = DB.getUserById(ProfilePage.user.id);
      u.avatar = imageData;
      DB.updateUser(u);

      cropModal.style.display = 'none';
      cropper.destroy();
      showToast('บันทึกรูปโปรไฟล์เรียบร้อย');
    }
  });
});

// ===== PROFILE BIO EXTENSION =====

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const nameEl = document.getElementById('profile-name');
    if (!nameEl) return;

    const bioEl = document.createElement('div');
    bioEl.id = 'profile-bio';
    bioEl.style.marginTop = '6px';
    bioEl.style.fontSize = '.9rem';
    bioEl.style.color = 'var(--text2)';
    nameEl.parentElement.appendChild(bioEl);

    const editForm = document.getElementById('edit-form');
    if (editForm) {
      const textarea = document.createElement('textarea');
      textarea.id = 'edit-bio';
      textarea.placeholder = 'เขียนคำอธิบายตัวเอง...';
      textarea.style.width = '100%';
      textarea.style.marginTop = '8px';
      textarea.style.padding = '8px';
      textarea.style.borderRadius = '8px';
      editForm.appendChild(textarea);
    }
  });

  const oldRender = ProfilePage.renderProfile;
  ProfilePage.renderProfile = function () {
    oldRender.apply(this, arguments);
    const bioEl = document.getElementById('profile-bio');
    const editBio = document.getElementById('edit-bio');
    const u = this.user;
    if (bioEl) bioEl.textContent = u.bio || 'ยังไม่มีคำอธิบายตัวเอง';
    if (editBio) editBio.value = u.bio || '';
  };

  const oldSave = ProfilePage.saveEdit;
  ProfilePage.saveEdit = function () {
    const bio = document.getElementById('edit-bio')?.value || '';
    const u = DB.getUserById(this.user.id);
    u.bio = bio;
    DB.updateUser(u);
    oldSave.apply(this, arguments);
  };

  // ===== SIMPLE ONLINE DOT =====
  setTimeout(() => {
    const avatar = document.getElementById('profile-avatar-big');
    if (!avatar) return;
    let dot = document.getElementById('online-status-dot');
    if (!dot) {
      dot = document.createElement('div');
      dot.id = 'online-status-dot';
      dot.style.position = 'absolute';
      dot.style.bottom = '4px';
      dot.style.right = '4px';
      dot.style.width = '14px';
      dot.style.height = '14px';
      dot.style.background = '#3ba55d';
      dot.style.borderRadius = '50%';
      dot.style.border = '2px solid white';
      dot.style.zIndex = '99';
      avatar.style.position = 'relative';
      avatar.appendChild(dot);
    }
  }, 500);
})();

document.addEventListener('DOMContentLoaded', () => ProfilePage.init());

// ===== REMOVE PROFILE IMAGE BUTTON =====

document.addEventListener('DOMContentLoaded', () => {
  const avatar = document.getElementById('profile-avatar-big');
  if (!avatar) return;

  const btn = document.createElement('button');
  btn.textContent = '🗑 ลบรูปโปรไฟล์';
  btn.style.marginTop = '10px';
  btn.style.padding = '6px 10px';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '0.85rem';
  btn.style.background = '#ff4d4f';
  btn.style.color = '#fff';

  avatar.parentElement.appendChild(btn);

  btn.onclick = () => {
    if (!confirm('ต้องการลบรูปโปรไฟล์ใช่ไหม?')) return;
    const u = DB.getUserById(ProfilePage.user.id);
    delete u.avatar;
    DB.updateUser(u);
    ProfilePage.user = DB.getCurrentUser();
    ProfilePage.renderProfile();
    showToast('ลบรูปโปรไฟล์เรียบร้อย');
  };
});
