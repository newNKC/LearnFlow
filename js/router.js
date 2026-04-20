// ===== ROUTER.JS — Shared Utilities =====

// Toast notification
function showToast(msg, type = 'success') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Sidebar toggle (mobile)
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// Render avatar button
function renderAvatarBtn(user) {
  const el = document.getElementById('header-avatar');
  if (el && user) {
    el.textContent = user.name.charAt(0).toUpperCase();
    el.style.background = stringToColor(user.name);
  }
}

// Render user-mini in sidebar
function renderUserMini(user) {
  const el = document.getElementById('user-mini');
  if (el && user) {
    el.innerHTML = `
      <div class="avatar" style="background:${stringToColor(user.name)}">${user.name.charAt(0).toUpperCase()}</div>
      <div style="overflow:hidden">
        <div style="font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">${user.name}</div>
        <div style="font-size:.7rem;color:var(--text3)">${user.role === 'admin' ? 'Admin' : 'สมาชิก'}</div>
      </div>
    `;
  }
}

// Greeting
function renderGreeting(user) {
  const el = document.getElementById('header-greeting');
  if (el && user) {
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'สวัสดีตอนเช้า' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    el.textContent = `${greet}, ${user.name.split(' ')[0]} 👋`;
  }
}

// Color from string (for avatars)
function stringToColor(str) {
  const colors = ['#7c6ef0','#3ecf8e','#f0c96f','#f06f6f','#6fa8f0','#f06fc9','#6ff0d8'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Get URL param
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// Render course card HTML
function renderCourseCard(course, user, onClick) {
  const cat = DB.getCategoryById(course.categoryId);
  const isLiked = user && course.likedBy && course.likedBy.includes(user.id);
  const progress = user && user.progress && user.progress[course.id];
  const pct = progress ? progress.pct : 0;

  const card = document.createElement('div');
  card.className = 'course-card';
  card.onclick = onClick;
  card.innerHTML = `
    <div class="course-card-top" style="background:${hexToRgba(course.color || '#7c6ef0', 0.15)}">
      <span style="font-size:2.2rem">${course.emoji || '📚'}</span>
    </div>
    <div class="course-card-body">
      <div class="course-card-cat">${cat ? cat.name : 'ทั่วไป'}</div>
      <div class="course-card-title">${course.title}</div>
      <div class="course-card-desc">${course.description}</div>
      ${pct > 0 ? `
        <div class="mini-progress" style="margin-top:10px">
          <div class="mini-progress-fill" style="width:${pct}%"></div>
        </div>
        <div style="font-size:.72rem;color:var(--text3);margin-top:4px">${pct}% เสร็จแล้ว</div>
      ` : ''}
    </div>
    <div class="course-card-footer">
      <span style="font-size:.78rem;color:var(--text2)">${course.lessons ? course.lessons.length : 0} บทเรียน</span>
      <span class="like-pill ${isLiked ? 'liked' : ''}">
        ${isLiked ? '♥' : '♡'} ${course.likes || 0}
      </span>
    </div>
  `;
  return card;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Simple markdown renderer
function renderMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// Init shared UI on pages that need auth
function initSharedUI() {
  const user = DB.getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  renderAvatarBtn(user);
  renderUserMini(user);

  // Admin link in sidebar
  if (user.role === 'admin') {
    const nav = document.querySelector('.sidebar-nav');
    if (nav && !nav.querySelector('.admin-link')) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.className = 'nav-item admin-link';
      adminLink.innerHTML = '<span class="nav-icon">⚙</span> Admin Panel';
      nav.appendChild(adminLink);
    }
  }
  return user;
}