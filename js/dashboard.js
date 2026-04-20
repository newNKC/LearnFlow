// ===== DASHBOARD.JS =====

const DashboardPage = {
  user: null,

  init() {
    this.user = initSharedUI();
    if (!this.user) return;
    renderGreeting(this.user);
    this.renderStats();
    this.renderContinueLearning();
    this.renderRecommended();
    this.renderCategories();
  },

  renderStats() {
    const u = this.user;
    const enrolled = u.enrolledCourses ? u.enrolledCourses.length : 0;
    const created = u.createdCourses ? u.createdCourses.length : 0;

    // Average progress
    let totalPct = 0, count = 0;
    if (u.progress) {
      Object.values(u.progress).forEach(p => {
        totalPct += p.pct || 0;
        count++;
      });
    }
    const avgPct = count > 0 ? Math.round(totalPct / count) : 0;

    document.getElementById('stat-courses').textContent = enrolled;
    document.getElementById('stat-progress').textContent = avgPct + '%';
    document.getElementById('stat-created').textContent = created;
  },

  renderContinueLearning() {
    const container = document.getElementById('continue-learning');
    if (!container) return;
    const u = this.user;
    if (!u.enrolledCourses || u.enrolledCourses.length === 0) {
      container.innerHTML = '<p style="color:var(--text2);font-size:.9rem;padding:8px 0">ยังไม่ได้เรียนคอร์สใด — <a href="courses.html" style="color:var(--accent)">เริ่มเรียนเลย</a></p>';
      return;
    }
    const courses = DB.getCourses().filter(c => u.enrolledCourses.includes(c.id));
    courses.forEach(course => {
      const card = renderCourseCard(course, u, () => {
        window.location.href = `learn.html?id=${course.id}`;
      });
      container.appendChild(card);
    });
  },

  renderRecommended() {
    const container = document.getElementById('recommended-courses');
    if (!container) return;
    const u = this.user;
    const courses = DB.getCourses()
      .slice()
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 4);
    courses.forEach(course => {
      const card = renderCourseCard(course, u, () => {
        window.location.href = `learn.html?id=${course.id}`;
      });
      container.appendChild(card);
    });
  },

  renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    const cats = DB.getCategories();
    const courses = DB.getCourses();
    cats.forEach(cat => {
      const count = courses.filter(c => c.categoryId === cat.id).length;
      const card = document.createElement('div');
      card.className = 'cat-card';
      card.innerHTML = `
        <div class="cat-card-icon">${cat.icon || '📂'}</div>
        <div class="cat-card-name">${cat.name}</div>
        <div class="cat-card-count">${count} คอร์ส</div>
      `;
      card.onclick = () => {
        window.location.href = `courses.html?cat=${cat.id}`;
      };
      container.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => DashboardPage.init());