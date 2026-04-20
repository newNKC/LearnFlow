// ===== COURSES.JS =====

const CoursePage = {
  user: null,
  allCourses: [],
  filtered: [],
  activeCat: 'all',
  searchVal: '',
  sortVal: 'popular',

  init() {
    this.user = initSharedUI();
    if (!this.user) return;
    this.allCourses = DB.getCourses();
    this.filtered = [...this.allCourses];
    this.buildCatFilter();
    this.buildCatPills();
    this.checkUrlCat();
    this.render();
  },

  buildCatFilter() {
    const sel = document.getElementById('cat-filter');
    if (!sel) return;
    DB.getCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      sel.appendChild(opt);
    });
  },

  buildCatPills() {
    const container = document.getElementById('cat-pills');
    if (!container) return;
    const all = document.createElement('span');
    all.className = 'cat-pill active';
    all.textContent = 'ทั้งหมด';
    all.onclick = () => this.setCat('all', all);
    container.appendChild(all);

    DB.getCategories().forEach(cat => {
      const pill = document.createElement('span');
      pill.className = 'cat-pill';
      pill.textContent = cat.name;
      pill.dataset.catId = cat.id;
      pill.onclick = () => this.setCat(cat.id, pill);
      container.appendChild(pill);
    });
  },

  checkUrlCat() {
    const catParam = new URLSearchParams(window.location.search).get('cat');
    if (catParam) {
      this.activeCat = catParam;
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('active');
        if (p.dataset.catId === catParam) p.classList.add('active');
      });
      const sel = document.getElementById('cat-filter');
      if (sel) sel.value = catParam;
    }
  },

  setCat(catId, el) {
    this.activeCat = catId;
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    const sel = document.getElementById('cat-filter');
    if (sel) sel.value = catId;
    this.applyFilters();
  },

  search(val) {
    this.searchVal = val.toLowerCase();
    this.applyFilters();
  },

  filter() {
    const sel = document.getElementById('cat-filter');
    this.activeCat = sel ? sel.value : 'all';
    document.querySelectorAll('.cat-pill').forEach(p => {
      p.classList.remove('active');
      if ((p.dataset.catId || 'all') === this.activeCat) p.classList.add('active');
    });
    this.applyFilters();
  },

  sort() {
    const sel = document.getElementById('sort-select');
    this.sortVal = sel ? sel.value : 'popular';
    this.applyFilters();
  },

  applyFilters() {
    let list = [...this.allCourses];

    // Category filter
    if (this.activeCat !== 'all') {
      list = list.filter(c => c.categoryId === this.activeCat);
    }

    // Search filter
    if (this.searchVal) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(this.searchVal) ||
        c.description.toLowerCase().includes(this.searchVal)
      );
    }

    // Sort
    if (this.sortVal === 'popular') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (this.sortVal === 'newest') {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (this.sortVal === 'az') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'th'));
    }

    this.filtered = list;
    this.render();
  },

  render() {
    const grid = document.getElementById('courses-grid');
    const empty = document.getElementById('empty-state');
    if (!grid) return;
    grid.innerHTML = '';

    if (this.filtered.length === 0) {
      grid.classList.add('hidden');
      empty?.classList.remove('hidden');
      return;
    }
    grid.classList.remove('hidden');
    empty?.classList.add('hidden');

    this.filtered.forEach(course => {
      const card = renderCourseCard(course, this.user, () => {
        window.location.href = `learn.html?id=${course.id}`;
      });
      grid.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => CoursePage.init());