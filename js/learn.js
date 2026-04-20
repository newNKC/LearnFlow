// ===== LEARN.JS =====

const LearnPage = {
  user: null,
  course: null,
  lessonLL: null,
  currentLessonId: null,
  quizQuestions: [],
  quizIdx: 0,
  quizAnswers: [],

  init() {
    this.user = initSharedUI();
    if (!this.user) return;

    const courseId = getParam('id');
    if (!courseId) { window.location.href = 'courses.html'; return; }

    this.course = DB.getCourseById(courseId);
    if (!this.course) { window.location.href = 'courses.html'; return; }

    // Auto-enroll
    if (!this.user.enrolledCourses.includes(courseId)) {
      const u = DB.getUserById(this.user.id);
      if (!u.enrolledCourses) u.enrolledCourses = [];
      u.enrolledCourses.push(courseId);
      DB.updateUser(u);
      this.user = DB.getCurrentUser();
    }

    // Build linked list from lessons array
    this.lessonLL = createLinkedList(this.course.lessons || []);

    this.renderHero();
    this.renderLessonNav();
    this.updateProgress();

    // Auto-open first lesson
    if (this.lessonLL.head) {
      this.openLesson(this.lessonLL.head);
    }
  },

  renderHero() {
    const c = this.course;
    const cat = DB.getCategoryById(c.categoryId);
    document.getElementById('hero-cat').textContent = cat ? cat.name : 'ทั่วไป';
    document.getElementById('hero-title').textContent = c.title;
    document.getElementById('hero-desc').textContent = c.description;
    document.getElementById('hero-author').textContent = '✎ ' + c.authorName;
    document.getElementById('hero-lessons').textContent = c.lessons ? c.lessons.length : 0;
    document.getElementById('hero-quizzes').textContent = c.quiz ? c.quiz.length : 0;

    // Like button
    const isLiked = c.likedBy && c.likedBy.includes(this.user.id);
    const likeBtn = document.getElementById('like-btn');
    document.getElementById('like-icon').textContent = isLiked ? '♥' : '♡';
    document.getElementById('like-count').textContent = c.likes || 0;
    if (isLiked) likeBtn.classList.add('liked');

    // Course hero background
    const hero = document.getElementById('course-hero');
    if (hero && c.color) {
      hero.style.background = `linear-gradient(135deg, var(--bg3) 0%, ${c.color}22 100%)`;
    }
  },

  renderLessonNav() {
    const list = document.getElementById('lesson-list');
    if (!list) return;
    list.innerHTML = '';

    const prog = this.user.progress && this.user.progress[this.course.id];
    const completed = prog ? (prog.completed || []) : [];

    const nodes = this.lessonLL.getOrdered();
    nodes.forEach((node, idx) => {
      const isDone = completed.includes(node.id);
      const item = document.createElement('div');
      item.className = 'lesson-item' + (isDone ? ' completed' : '');
      item.id = 'nav-' + node.id;
      item.innerHTML = `
        <div class="lesson-num">${isDone ? '✓' : idx + 1}</div>
        <div class="lesson-item-title">${node.title}</div>
      `;
      item.onclick = () => this.openLesson(node.id);
      list.appendChild(item);
    });

    // Quiz nav item (if quiz exists)
    if (this.course.quiz && this.course.quiz.length > 0) {
      const quizItem = document.createElement('div');
      quizItem.className = 'lesson-item';
      quizItem.id = 'nav-quiz';
      quizItem.innerHTML = `
        <div class="lesson-num" style="background:rgba(124,110,240,.2);color:var(--accent2)">Q</div>
        <div class="lesson-item-title">แบบทดสอบท้ายบท</div>
        <span class="lesson-type-tag quiz-tag">Quiz</span>
      `;
      quizItem.onclick = () => this.startQuiz();
      list.appendChild(quizItem);
    }
  },

  openLesson(id) {
    this.currentLessonId = id;
    const node = this.lessonLL.get(id);
    if (!node) return;

    // Update nav active state
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + id)?.classList.add('active');

    // Render content
    const viewer = document.getElementById('content-viewer');
    const prog = this.user.progress && this.user.progress[this.course.id];
    const completed = prog ? (prog.completed || []) : [];
    const isDone = completed.includes(id);
    const prevNode = this.lessonLL.getPrev(id);
    const nextNode = this.lessonLL.getNext(id);

    viewer.innerHTML = `
      <div class="lesson-content-view">
        <h2>${node.title}</h2>
        <div>${renderMarkdown(node.content)}</div>
        <div class="lesson-nav-btns">
          ${prevNode ? `<button class="btn-ghost btn-sm" onclick="LearnPage.openLesson('${prevNode.id}')">← ก่อนหน้า</button>` : '<span></span>'}
          <button class="mark-done-btn ${isDone ? 'done' : ''}" id="mark-btn" onclick="LearnPage.markDone('${id}')">
            ${isDone ? '✓ เรียนแล้ว' : 'ทำเครื่องหมายว่าเรียนแล้ว'}
          </button>
          ${nextNode
            ? `<button class="btn-primary btn-sm" onclick="LearnPage.openLesson('${nextNode.id}')">ถัดไป →</button>`
            : (this.course.quiz && this.course.quiz.length > 0
                ? `<button class="btn-primary btn-sm" onclick="LearnPage.startQuiz()">ทำแบบทดสอบ →</button>`
                : '')
          }
        </div>
      </div>
    `;
  },

  markDone(lessonId) {
    DB.updateProgress(this.user.id, this.course.id, lessonId);
    this.user = DB.getCurrentUser();
    this.updateProgress();
    this.renderLessonNav();

    // Re-render content area to update button state
    this.openLesson(lessonId);
    showToast('บันทึกความคืบหน้าแล้ว ✓');
  },

  updateProgress() {
    const prog = this.user.progress && this.user.progress[this.course.id];
    const pct = prog ? (prog.pct || 0) : 0;
    document.getElementById('progress-pct').textContent = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';
  },

  toggleLike() {
    const updated = DB.toggleLike(this.user.id, this.course.id);
    if (!updated) return;
    this.course = updated;
    const isLiked = updated.likedBy.includes(this.user.id);
    document.getElementById('like-icon').textContent = isLiked ? '♥' : '♡';
    document.getElementById('like-count').textContent = updated.likes || 0;
    const likeBtn = document.getElementById('like-btn');
    likeBtn.classList.toggle('liked', isLiked);
  },

  // ===== QUIZ =====
  startQuiz() {
    if (!this.course.quiz || this.course.quiz.length === 0) return;
    this.quizQuestions = [...this.course.quiz];
    this.quizIdx = 0;
    this.quizAnswers = [];

    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-quiz')?.classList.add('active');

    document.getElementById('quiz-modal')?.classList.remove('hidden');
    this._renderQuizQuestion();
  },

  _renderQuizQuestion() {
    const q = this.quizQuestions[this.quizIdx];
    const total = this.quizQuestions.length;
    document.getElementById('quiz-prog-text').textContent = `${this.quizIdx + 1} / ${total}`;
    document.getElementById('quiz-title').textContent = 'แบบทดสอบ — ' + this.course.title;

    const body = document.getElementById('quiz-body');
    body.innerHTML = `
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-idx="${i}" onclick="LearnPage._selectOption(this, ${i})">${opt}</div>
        `).join('')}
      </div>
    `;

    const nextBtn = document.getElementById('quiz-next-btn');
    nextBtn.textContent = this.quizIdx < total - 1 ? 'ถัดไป' : 'ส่งคำตอบ';
    this.quizAnswers[this.quizIdx] = undefined;
  },

  _selectOption(el, idx) {
    document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    this.quizAnswers[this.quizIdx] = idx;
  },

  quizNext() {
    if (this.quizAnswers[this.quizIdx] === undefined) {
      showToast('กรุณาเลือกคำตอบ', 'error');
      return;
    }

    // Show correct/wrong before advancing
    const q = this.quizQuestions[this.quizIdx];
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      if (i === q.correct) el.classList.add('correct');
      else if (i === this.quizAnswers[this.quizIdx]) el.classList.add('wrong');
      el.style.pointerEvents = 'none';
    });

    if (this.quizIdx < this.quizQuestions.length - 1) {
      setTimeout(() => {
        this.quizIdx++;
        this._renderQuizQuestion();
      }, 700);
    } else {
      setTimeout(() => this._showResult(), 700);
    }
  },

  _showResult() {
    document.getElementById('quiz-modal')?.classList.add('hidden');
    const correct = this.quizAnswers.filter((ans, i) => ans === this.quizQuestions[i].correct).length;
    const total = this.quizQuestions.length;
    const pct = Math.round((correct / total) * 100);

    const passed = pct >= 60;
    document.getElementById('result-icon').textContent = passed ? '🎉' : '📖';
    document.getElementById('result-title').textContent = passed ? 'ยอดเยี่ยม!' : 'ลองอีกครั้ง!';
    document.getElementById('result-score').textContent = `คุณตอบถูก ${correct} / ${total} ข้อ (${pct}%)`;
    document.getElementById('result-modal')?.classList.remove('hidden');
  },

  closeResult() {
    document.getElementById('result-modal')?.classList.add('hidden');
  }
};

document.addEventListener('DOMContentLoaded', () => LearnPage.init());