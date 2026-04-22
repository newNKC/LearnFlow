// ===== CREATE-COURSE.JS =====

const THEME_COLORS = ['#7c6ef0','#3ecf8e','#f0c96f','#f06f6f','#6fa8f0','#f06fc9','#6ff0d8','#a594f9'];
const THEME_EMOJIS = ['📚','💻','🎨','🔬','📐','🌍','🏆','🎯','🎸','🐍','🧬','⚡'];

const CreatePage = {
  user: null,
  lessonList: null,   // LessonLinkedList
  quizItems: [],      // [{id,question,options:[],correct}]
  selectedColor: THEME_COLORS[0],
  selectedEmoji: '📚',
  editingLessonId: null,
  editingQuizIdx: null,

  init() {
    this.user = initSharedUI();
    if (!this.user) return;
    this.lessonList = new LessonLinkedList();
    this.buildColorPicker();
    this.buildEmojiPicker();
    this.buildCatSelect();
  },

  buildColorPicker() {
    const row = document.getElementById('color-picker-row');
    if (!row) return;
    THEME_COLORS.forEach(color => {
      const sw = document.createElement('div');
      sw.className = 'color-swatch' + (color === this.selectedColor ? ' selected' : '');
      sw.style.background = color;
      sw.title = color;
      sw.onclick = () => {
        this.selectedColor = color;
        row.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
      };
      row.appendChild(sw);
    });
  },
  buildEmojiPicker() {
    const row = document.getElementById('emoji-picker-row');
    if (!row) return;
    THEME_EMOJIS.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'emoji-btn' + (emoji === this.selectedEmoji ? ' selected' : '');
      btn.textContent = emoji;
      btn.onclick = () => {
        this.selectedEmoji = emoji;
        row.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      row.appendChild(btn);
    });
  },

  buildCatSelect() {
    const sel = document.getElementById('c-cat');
    if (!sel) return;
    DB.getCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      sel.appendChild(opt);
    });
  },

  showNewCat() {
    document.getElementById('new-cat-input')?.classList.remove('hidden');
  },

  addNewCat() {
    const input = document.getElementById('new-cat-name');
    const name = input?.value.trim();
    if (!name) return;
    const newCat = { id: DB.genId('cat'), name, icon: '📂' };
    DB.addCategory(newCat);
    // Add to select
    const sel = document.getElementById('c-cat');
    const opt = document.createElement('option');
    opt.value = newCat.id;
    opt.textContent = newCat.name;
    sel.appendChild(opt);
    sel.value = newCat.id;
    input.value = '';
    document.getElementById('new-cat-input')?.classList.add('hidden');
    showToast('เพิ่มหมวดหมู่เรียบร้อย');
  },

  // ===== LESSONS =====
  addLesson() {
    this.editingLessonId = null;
    document.getElementById('lesson-modal-title').textContent = 'เพิ่มบทเรียนใหม่';
    document.getElementById('lm-title').value = '';
    document.getElementById('lm-content').value = '';
    document.getElementById('lesson-modal')?.classList.remove('hidden');
    document.getElementById('lm-title').focus();
  },

  editLesson(id) {
    const node = this.lessonList.get(id);
    if (!node) return;
    this.editingLessonId = id;
    document.getElementById('lesson-modal-title').textContent = 'แก้ไขบทเรียน';
    document.getElementById('lm-title').value = node.title;
    document.getElementById('lm-content').value = node.content;
    document.getElementById('lesson-modal')?.classList.remove('hidden');
    document.getElementById('lm-title').focus();
  },

  saveLessonModal() {
    const title = document.getElementById('lm-title').value.trim();
    const content = document.getElementById('lm-content').value.trim();
    if (!title) { showToast('กรุณากรอกหัวข้อบทเรียน', 'error'); return; }

    if (this.editingLessonId) {
      this.lessonList.update(this.editingLessonId, { title, content });
    } else {
      this.lessonList.append({ id: DB.genId('l'), title, content });
    }
    this.closeLessonModal();
    this.renderLessons();
  },

  closeLessonModal() {
    document.getElementById('lesson-modal')?.classList.add('hidden');
    this.editingLessonId = null;
  },

  deleteLesson(id) {
    this.lessonList.remove(id);
    this.renderLessons();
  },

  moveLessonUp(id) {
    this.lessonList.moveUp(id);
    this.renderLessons();
  },

  moveLessonDown(id) {
    this.lessonList.moveDown(id);
    this.renderLessons();
  },

  renderLessons() {
    const builder = document.getElementById('lesson-builder');
    const badge = document.getElementById('lesson-count');
    if (!builder) return;

    const nodes = this.lessonList.getOrdered();
    badge.textContent = nodes.length;

    if (nodes.length === 0) {
      builder.innerHTML = '<div class="empty-lessons">ยังไม่มีบทเรียน — เพิ่มบทเรียนแรก</div>';
      return;
    }

    builder.innerHTML = '';
    nodes.forEach((node, idx) => {
      const item = document.createElement('div');
      item.className = 'builder-lesson-item';
      item.innerHTML = `
        <span class="builder-drag-handle">⠿</span>
        <div class="builder-lesson-num">${idx + 1}</div>
        <div class="builder-lesson-title">${node.title}</div>
        <div class="builder-lesson-actions">
          <button class="builder-action-btn" title="ขึ้น" onclick="CreatePage.moveLessonUp('${node.id}')" ${!node.prev ? 'disabled style="opacity:.3"' : ''}>▲</button>
          <button class="builder-action-btn" title="ลง" onclick="CreatePage.moveLessonDown('${node.id}')" ${!node.next ? 'disabled style="opacity:.3"' : ''}>▼</button>
          <button class="builder-action-btn" title="แก้ไข" onclick="CreatePage.editLesson('${node.id}')">✎</button>
          <button class="builder-action-btn del" title="ลบ" onclick="CreatePage.deleteLesson('${node.id}')">✕</button>
        </div>
      `;
      builder.appendChild(item);
    });
  },

  // ===== QUIZ =====
  addQuiz() {
    this.editingQuizIdx = null;
    document.getElementById('qm-question').value = '';
    this._renderQuizOptions([{ text: '', correct: true }, { text: '', correct: false }]);
    document.getElementById('quiz-editor-modal')?.classList.remove('hidden');
    document.getElementById('qm-question').focus();
  },

  editQuiz(idx) {
    this.editingQuizIdx = idx;
    const q = this.quizItems[idx];
    document.getElementById('qm-question').value = q.question;
    const opts = q.options.map((text, i) => ({ text, correct: i === q.correct }));
    this._renderQuizOptions(opts);
    document.getElementById('quiz-editor-modal')?.classList.remove('hidden');
  },

  _renderQuizOptions(opts) {
    const container = document.getElementById('qm-options');
    if (!container) return;
    container.innerHTML = '';
    opts.forEach((opt, i) => {
      const row = document.createElement('div');
      row.className = 'qm-option-row';
      row.innerHTML = `
        <input type="text" placeholder="ตัวเลือก ${i + 1}" value="${opt.text}" data-idx="${i}" class="qm-opt-input" />
        <button class="correct-toggle ${opt.correct ? 'correct' : ''}" data-idx="${i}" title="เลือกเป็นคำตอบที่ถูก" onclick="CreatePage._toggleCorrect(${i})">✓</button>
        <button class="del-opt-btn" onclick="CreatePage._removeOption(${i})">✕</button>
      `;
      container.appendChild(row);
    });
  },

  _toggleCorrect(idx) {
    const toggles = document.querySelectorAll('#qm-options .correct-toggle');
    toggles.forEach((t, i) => {
      t.classList.toggle('correct', i === idx);
    });
  },

  _removeOption(idx) {
    const rows = document.querySelectorAll('#qm-options .qm-option-row');
    if (rows.length <= 2) { showToast('ต้องมีอย่างน้อย 2 ตัวเลือก', 'error'); return; }
    const opts = this._collectOptions();
    opts.splice(idx, 1);
    if (opts.every(o => !o.correct)) opts[0].correct = true;
    this._renderQuizOptions(opts);
  },

  addOption() {
    const opts = this._collectOptions();
    opts.push({ text: '', correct: false });
    this._renderQuizOptions(opts);
  },

  _collectOptions() {
    const rows = document.querySelectorAll('#qm-options .qm-option-row');
    const opts = [];
    rows.forEach((row, i) => {
      const input = row.querySelector('.qm-opt-input');
      const toggle = row.querySelector('.correct-toggle');
      opts.push({ text: input.value, correct: toggle.classList.contains('correct') });
    });
    return opts;
  },

  saveQuizModal() {
    const question = document.getElementById('qm-question').value.trim();
    if (!question) { showToast('กรุณากรอกคำถาม', 'error'); return; }
    const opts = this._collectOptions();
    const texts = opts.map(o => o.text.trim());
    if (texts.some(t => !t)) { showToast('กรุณากรอกตัวเลือกให้ครบ', 'error'); return; }
    const correctIdx = opts.findIndex(o => o.correct);
    if (correctIdx === -1) { showToast('กรุณาเลือกคำตอบที่ถูกต้อง', 'error'); return; }

    const item = { id: DB.genId('q'), question, options: texts, correct: correctIdx };
    if (this.editingQuizIdx !== null) {
      this.quizItems[this.editingQuizIdx] = item;
    } else {
      this.quizItems.push(item);
    }
    this.closeQuizModal();
    this.renderQuiz();
  },

  closeQuizModal() {
    document.getElementById('quiz-editor-modal')?.classList.add('hidden');
    this.editingQuizIdx = null;
  },

  deleteQuiz(idx) {
    this.quizItems.splice(idx, 1);
    this.renderQuiz();
  },

  renderQuiz() {
    const builder = document.getElementById('quiz-builder');
    const badge = document.getElementById('quiz-count');
    if (!builder) return;
    badge.textContent = this.quizItems.length;

    if (this.quizItems.length === 0) {
      builder.innerHTML = '<div class="empty-lessons">ยังไม่มีคำถาม</div>';
      return;
    }
    builder.innerHTML = '';
    this.quizItems.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'builder-quiz-item';
      item.innerHTML = `
        <div class="builder-quiz-num">${idx + 1}</div>
        <div class="builder-quiz-q">
          <div style="font-weight:600;font-size:.88rem;margin-bottom:4px">${q.question}</div>
          <div style="font-size:.78rem;color:var(--text3)">${q.options.length} ตัวเลือก · ✓ ${q.options[q.correct]}</div>
        </div>
        <div class="builder-lesson-actions">
          <button class="builder-action-btn" onclick="CreatePage.editQuiz(${idx})">✎</button>
          <button class="builder-action-btn del" onclick="CreatePage.deleteQuiz(${idx})">✕</button>
        </div>
      `;
      builder.appendChild(item);
    });
  },

  // ===== PUBLISH =====
  publish() {
    const title = document.getElementById('c-title').value.trim();
    const desc = document.getElementById('c-desc').value.trim();
    const catId = document.getElementById('c-cat').value;

    if (!title) { showToast('กรุณากรอกชื่อคอร์ส', 'error'); return; }
    if (!desc) { showToast('กรุณากรอกคำอธิบาย', 'error'); return; }
    if (!catId) { showToast('กรุณาเลือกหมวดหมู่', 'error'); return; }
    if (this.lessonList.size === 0) { showToast('กรุณาเพิ่มบทเรียนอย่างน้อย 1 บท', 'error'); return; }

    const lessons = this.lessonList.toArray();
    const course = {
      id: DB.genId('c'),
      title,
      description: desc,
      categoryId: catId,
      authorId: this.user.id,
      authorName: this.user.name,
      likes: 0,
      likedBy: [],
      color: this.selectedColor,
      emoji: this.selectedEmoji,
      createdAt: Date.now(),
      lessons,
      quiz: this.quizItems
    };
    DB.addCourse(course);

    // Update user's createdCourses
    const u = DB.getUserById(this.user.id);
    if (!u.createdCourses) u.createdCourses = [];
    u.createdCourses.push(course.id);
    DB.updateUser(u);

    showToast('เผยแพร่คอร์สเรียบร้อยแล้ว! 🎉');
    setTimeout(() => { window.location.href = `learn.html?id=${course.id}`; }, 1000);
  }
};

document.addEventListener('DOMContentLoaded', () => CreatePage.init());
