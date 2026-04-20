// ===== DATA.JS — Central Data Store =====
// All data persisted in localStorage

const DB = {
  // Keys
  USERS_KEY: 'lf_users',
  COURSES_KEY: 'lf_courses',
  CATEGORIES_KEY: 'lf_categories',
  CURRENT_USER_KEY: 'lf_current_user',

  // ===== INIT =====
  init() {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const admin = {
        id: 'u_admin',
        name: 'Admin LearnFlow',
        email: 'admin@learnflow.com',
        password: 'admin123',
        role: 'admin',
        createdAt: Date.now(),
        enrolledCourses: [],
        createdCourses: [],
        progress: {}
      };
      const demo = {
        id: 'u_demo',
        name: 'สมชาย ใจดี',
        email: 'demo@learnflow.com',
        password: 'demo123',
        role: 'user',
        createdAt: Date.now() - 86400000,
        enrolledCourses: [],
        createdCourses: [],
        progress: {}
      };
      localStorage.setItem(this.USERS_KEY, JSON.stringify([admin, demo]));
    }

    if (!localStorage.getItem(this.CATEGORIES_KEY)) {
      const cats = [
        { id: 'cat_math', name: 'คณิตศาสตร์', icon: '📐' },
        { id: 'cat_lang', name: 'ภาษา', icon: '📝' },
        { id: 'cat_sci', name: 'วิทยาศาสตร์', icon: '🔬' },
        { id: 'cat_prog', name: 'การเขียนโปรแกรม', icon: '💻' },
        { id: 'cat_art', name: 'ศิลปะ', icon: '🎨' },
        { id: 'cat_hist', name: 'ประวัติศาสตร์', icon: '📜' },
      ];
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(cats));
    }

    if (!localStorage.getItem(this.COURSES_KEY)) {
      this._seedCourses();
    }
  },

  _seedCourses() {
    const courses = [
      {
        id: 'c_001',
        title: 'คณิตศาสตร์พื้นฐาน ม.ต้น',
        description: 'เรียนรู้คณิตศาสตร์ตั้งแต่พื้นฐาน บวก ลบ คูณ หาร และสมการเบื้องต้น เหมาะสำหรับผู้เริ่มต้น',
        categoryId: 'cat_math',
        authorId: 'u_admin',
        authorName: 'Admin LearnFlow',
        likes: 24,
        likedBy: [],
        color: '#7c6ef0',
        emoji: '📐',
        createdAt: Date.now() - 86400000 * 5,
        lessons: [
          { id: 'l_001_1', title: 'บทนำ: การบวกและลบ', content: '## การบวกและลบเลข\n\nการบวก คือ การรวมจำนวนสองจำนวนเข้าด้วยกัน\n\n**ตัวอย่าง:**\n- 5 + 3 = 8\n- 12 + 7 = 19\n\nการลบ คือ การเอาจำนวนหนึ่งออกจากอีกจำนวนหนึ่ง\n\n**ตัวอย่าง:**\n- 10 - 4 = 6\n- 20 - 8 = 12\n\n### ฝึกซ้อม\nลองคิดในใจ: 15 + 23 = ?', next: 'l_001_2', prev: null },
          { id: 'l_001_2', title: 'การคูณและหาร', content: '## การคูณและหาร\n\nการคูณ คือ การบวกซ้ำๆ กัน\n\n**ตัวอย่าง:**\n- 4 × 3 = 12 (เท่ากับ 4+4+4)\n- 6 × 5 = 30\n\nการหาร คือ การแบ่งเป็นส่วนเท่าๆ กัน\n\n**ตัวอย่าง:**\n- 12 ÷ 4 = 3\n- 20 ÷ 5 = 4\n\n### สูตรคูณที่ควรจำ\n- 2×1=2, 2×2=4, 2×3=6...\n- 3×1=3, 3×2=6, 3×3=9...', next: 'l_001_3', prev: 'l_001_1' },
          { id: 'l_001_3', title: 'สมการอย่างง่าย', content: '## สมการอย่างง่าย\n\nสมการ คือ ประโยคที่มีเครื่องหมายเท่ากับ (=)\n\n**ตัวอย่าง:**\n- x + 5 = 10 → x = 5\n- 2x = 8 → x = 4\n\n### วิธีแก้สมการ\n1. ย้ายพจน์ที่ไม่ใช่ตัวแปรไปอีกฝั่ง\n2. หารด้วยสัมประสิทธิ์\n\n**ฝึก:** 3x + 2 = 11 แก้ได้ x = ?', next: null, prev: 'l_001_2' }
        ],
        quiz: [
          { id: 'q_001_1', question: '5 + 8 = ?', options: ['11','12','13','14'], correct: 2 },
          { id: 'q_001_2', question: '4 × 7 = ?', options: ['24','28','32','21'], correct: 1 },
          { id: 'q_001_3', question: 'ถ้า x + 3 = 10 แล้ว x = ?', options: ['5','6','7','8'], correct: 2 },
        ]
      },
      {
        id: 'c_002',
        title: 'ภาษาอังกฤษสำหรับชีวิตประจำวัน',
        description: 'เรียนรู้ประโยคภาษาอังกฤษที่ใช้บ่อยในชีวิตประจำวัน การทักทาย การสั่งอาหาร และการเดินทาง',
        categoryId: 'cat_lang',
        authorId: 'u_admin',
        authorName: 'Admin LearnFlow',
        likes: 38,
        likedBy: [],
        color: '#3ecf8e',
        emoji: '🌍',
        createdAt: Date.now() - 86400000 * 3,
        lessons: [
          { id: 'l_002_1', title: 'การทักทาย (Greetings)', content: '## การทักทายภาษาอังกฤษ\n\n**ทักทายทั่วไป:**\n- Hello / Hi — สวัสดี\n- Good morning — สวัสดีตอนเช้า\n- Good afternoon — สวัสดีตอนบ่าย\n- Good evening — สวัสดีตอนเย็น\n\n**ถามสารทุกข์สุขดิบ:**\n- How are you? — คุณเป็นยังไงบ้าง?\n- I\'m fine, thank you — ฉันสบายดี ขอบคุณ\n- Nice to meet you — ยินดีที่ได้รู้จัก', next: 'l_002_2', prev: null },
          { id: 'l_002_2', title: 'ตัวเลขและเวลา (Numbers & Time)', content: '## ตัวเลขและเวลา\n\n**ตัวเลข 1-10:**\n1=one, 2=two, 3=three, 4=four, 5=five\n6=six, 7=seven, 8=eight, 9=nine, 10=ten\n\n**บอกเวลา:**\n- What time is it? — กี่โมงแล้ว?\n- It\'s 3 o\'clock — สามโมง\n- It\'s half past two — สองโมงครึ่ง', next: null, prev: 'l_002_1' }
        ],
        quiz: [
          { id: 'q_002_1', question: '"Good morning" หมายความว่าอะไร?', options: ['สวัสดีตอนกลางคืน','สวัสดีตอนเช้า','ราตรีสวัสดิ์','สวัสดีตอนบ่าย'], correct: 1 },
          { id: 'q_002_2', question: 'How do you say "seven" in numbers?', options: ['6','7','8','9'], correct: 1 },
        ]
      },
      {
        id: 'c_003',
        title: 'วิทยาศาสตร์: ระบบสุริยะ',
        description: 'สำรวจระบบสุริยะของเรา ตั้งแต่ดาวพุธถึงดาวเนปจูน ดาวเคราะห์แต่ละดวงมีคุณสมบัติพิเศษอย่างไร',
        categoryId: 'cat_sci',
        authorId: 'u_demo',
        authorName: 'สมชาย ใจดี',
        likes: 15,
        likedBy: [],
        color: '#f0c96f',
        emoji: '🌌',
        createdAt: Date.now() - 86400000 * 1,
        lessons: [
          { id: 'l_003_1', title: 'ดวงอาทิตย์และโลก', content: '## ดวงอาทิตย์\n\nดวงอาทิตย์คือดาวฤกษ์ที่อยู่ใจกลางระบบสุริยะ มีขนาดใหญ่กว่าโลกประมาณ **1.3 ล้านเท่า**\n\n**ข้อเท็จจริง:**\n- อุณหภูมิพื้นผิว: 5,500°C\n- ระยะห่างจากโลก: 150 ล้านกิโลเมตร\n- แสงใช้เวลา 8 นาทีถึงโลก\n\n## โลก\n\nโลกเป็นดาวเคราะห์ดวงที่ 3 มีน้ำและบรรยากาศที่เอื้อต่อสิ่งมีชีวิต', next: 'l_003_2', prev: null },
          { id: 'l_003_2', title: 'ดาวเคราะห์ 8 ดวง', content: '## ดาวเคราะห์ในระบบสุริยะ\n\n1. **ดาวพุธ** — ดวงเล็กที่สุด ใกล้ดวงอาทิตย์ที่สุด\n2. **ดาวศุกร์** — ร้อนที่สุด (อุณหภูมิ 465°C)\n3. **โลก** — มีสิ่งมีชีวิต\n4. **ดาวอังคาร** — ดาวแดง\n5. **ดาวพฤหัสบดี** — ใหญ่ที่สุด\n6. **ดาวเสาร์** — มีวงแหวน\n7. **ดาวยูเรนัส** — หมุนตะแคง\n8. **ดาวเนปจูน** — ไกลที่สุด', next: null, prev: 'l_003_1' }
        ],
        quiz: [
          { id: 'q_003_1', question: 'ดาวเคราะห์ดวงใดใหญ่ที่สุดในระบบสุริยะ?', options: ['ดาวเสาร์','ดาวพฤหัสบดี','ดาวยูเรนัส','ดาวเนปจูน'], correct: 1 },
          { id: 'q_003_2', question: 'แสงจากดวงอาทิตย์ใช้เวลากี่นาทีถึงโลก?', options: ['3 นาที','5 นาที','8 นาที','15 นาที'], correct: 2 },
        ]
      },
      {
        id: 'c_004',
        title: 'Python สำหรับผู้เริ่มต้น',
        description: 'เรียนเขียนโปรแกรม Python ตั้งแต่ศูนย์ ตัวแปร เงื่อนไข ลูป และฟังก์ชัน',
        categoryId: 'cat_prog',
        authorId: 'u_admin',
        authorName: 'Admin LearnFlow',
        likes: 51,
        likedBy: [],
        color: '#a594f9',
        emoji: '🐍',
        createdAt: Date.now() - 86400000 * 2,
        lessons: [
          { id: 'l_004_1', title: 'Hello World และตัวแปร', content: '## Hello World\n\nโปรแกรมแรกของทุกคน:\n\n```python\nprint("Hello, World!")\n```\n\n## ตัวแปร (Variables)\n\nตัวแปรคือที่เก็บข้อมูล:\n\n```python\nname = "สมชาย"\nage = 25\nheight = 175.5\nprint(name, age)\n```\n\n**ชนิดข้อมูล:**\n- `str` — ข้อความ\n- `int` — จำนวนเต็ม\n- `float` — ทศนิยม\n- `bool` — True/False', next: 'l_004_2', prev: null },
          { id: 'l_004_2', title: 'เงื่อนไข if-else', content: '## เงื่อนไข (Conditions)\n\n```python\nage = 18\n\nif age >= 18:\n    print("เป็นผู้ใหญ่")\nelif age >= 13:\n    print("เป็นวัยรุ่น")\nelse:\n    print("เป็นเด็ก")\n```\n\n**ตัวดำเนินการเปรียบเทียบ:**\n- `==` เท่ากับ\n- `!=` ไม่เท่ากับ\n- `>` มากกว่า\n- `<` น้อยกว่า\n- `>=` มากกว่าหรือเท่ากับ', next: 'l_004_3', prev: 'l_004_1' },
          { id: 'l_004_3', title: 'ลูป for และ while', content: '## ลูป (Loop)\n\n**for loop:**\n```python\nfor i in range(5):\n    print(i)  # 0,1,2,3,4\n\nfruits = ["apple","banana","cherry"]\nfor fruit in fruits:\n    print(fruit)\n```\n\n**while loop:**\n```python\ncount = 0\nwhile count < 3:\n    print("นับ:", count)\n    count += 1\n```', next: null, prev: 'l_004_2' }
        ],
        quiz: [
          { id: 'q_004_1', question: 'คำสั่งใดใช้พิมพ์ข้อความใน Python?', options: ['echo()','console.log()','print()','write()'], correct: 2 },
          { id: 'q_004_2', question: 'ตัวแปรชนิด int เก็บข้อมูลประเภทใด?', options: ['ข้อความ','จำนวนเต็ม','ทศนิยม','ค่าจริง/เท็จ'], correct: 1 },
          { id: 'q_004_3', question: 'range(5) ให้ค่าตั้งแต่อะไรถึงอะไร?', options: ['1 ถึง 5','0 ถึง 5','0 ถึง 4','1 ถึง 4'], correct: 2 },
        ]
      }
    ];
    localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));

    // Enroll demo user in first two
    const users = this.getUsers();
    const demo = users.find(u => u.id === 'u_demo');
    if (demo) {
      demo.enrolledCourses = ['c_001', 'c_002'];
      demo.progress = { c_001: { completed: ['l_001_1'], pct: 33 }, c_002: { completed: [], pct: 0 } };
      this.saveUsers(users);
    }
  },

  // ===== USERS =====
  getUsers() { return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]'); },
  saveUsers(users) { localStorage.setItem(this.USERS_KEY, JSON.stringify(users)); },
  getUserById(id) { return this.getUsers().find(u => u.id === id); },
  updateUser(updated) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx !== -1) { users[idx] = updated; this.saveUsers(users); }
  },

  // ===== COURSES =====
  getCourses() { return JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]'); },
  saveCourses(courses) { localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses)); },
  getCourseById(id) { return this.getCourses().find(c => c.id === id); },
  updateCourse(updated) {
    const courses = this.getCourses();
    const idx = courses.findIndex(c => c.id === updated.id);
    if (idx !== -1) { courses[idx] = updated; this.saveCourses(courses); }
  },
  addCourse(course) {
    const courses = this.getCourses();
    courses.push(course);
    this.saveCourses(courses);
  },
  deleteCourse(id) {
    const courses = this.getCourses().filter(c => c.id !== id);
    this.saveCourses(courses);
  },

  // ===== CATEGORIES =====
  getCategories() { return JSON.parse(localStorage.getItem(this.CATEGORIES_KEY) || '[]'); },
  saveCategories(cats) { localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(cats)); },
  getCategoryById(id) { return this.getCategories().find(c => c.id === id); },
  addCategory(cat) {
    const cats = this.getCategories();
    cats.push(cat);
    this.saveCategories(cats);
  },
  deleteCategory(id) {
    const cats = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(cats);
  },

  // ===== CURRENT USER =====
  getCurrentUser() {
    const id = sessionStorage.getItem(this.CURRENT_USER_KEY) || localStorage.getItem(this.CURRENT_USER_KEY);
    if (!id) return null;
    return this.getUserById(id);
  },
  setCurrentUser(userId, remember = false) {
    if (remember) localStorage.setItem(this.CURRENT_USER_KEY, userId);
    sessionStorage.setItem(this.CURRENT_USER_KEY, userId);
  },
  clearCurrentUser() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    sessionStorage.removeItem(this.CURRENT_USER_KEY);
  },

  // ===== PROGRESS =====
  updateProgress(userId, courseId, lessonId) {
    const user = this.getUserById(userId);
    if (!user) return;
    if (!user.progress[courseId]) user.progress[courseId] = { completed: [], pct: 0 };
    const prog = user.progress[courseId];
    if (!prog.completed.includes(lessonId)) {
      prog.completed.push(lessonId);
      const course = this.getCourseById(courseId);
      if (course) {
        prog.pct = Math.round((prog.completed.length / course.lessons.length) * 100);
      }
    }
    if (!user.enrolledCourses.includes(courseId)) user.enrolledCourses.push(courseId);
    this.updateUser(user);
    return prog;
  },

  // ===== LIKE =====
  toggleLike(userId, courseId) {
    const course = this.getCourseById(courseId);
    if (!course) return null;
    if (!course.likedBy) course.likedBy = [];
    const idx = course.likedBy.indexOf(userId);
    if (idx === -1) {
      course.likedBy.push(userId);
      course.likes = (course.likes || 0) + 1;
    } else {
      course.likedBy.splice(idx, 1);
      course.likes = Math.max(0, (course.likes || 1) - 1);
    }
    this.updateCourse(course);
    return course;
  },

  // ===== UNIQUE ID =====
  genId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
  }
};

// Initialize on load
DB.init();