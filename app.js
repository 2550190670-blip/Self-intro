/* ========================================================================
   🎨 倪润玮 · UI前端作品集 — App Logic
   ======================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     1️⃣  暗黑模式切换
     ====================================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  // 读取本地存储
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else if (savedTheme === 'light') {
    root.classList.remove('dark');
  } else {
    // 默认跟随系统
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
  }

  themeToggle.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  });


  /* ======================================================================
     2️⃣  Canvas 鼠标跟随光晕
     ====================================================================== */
  const canvas = document.getElementById('cursorGlow');
  const ctx = canvas.getContext('2d');

  let w, h;
  function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 三颗光晕粒子：紫 / 青 / 粉
  const particles = [
    { x: 0, y: 0, tx: 0, ty: 0, r: 120, color: '124, 92, 242',  speed: 0.08 },
    { x: 0, y: 0, tx: 0, ty: 0, r: 90,  color: '34, 211, 238', speed: 0.12 },
    { x: 0, y: 0, tx: 0, ty: 0, r: 100, color: '236, 72, 153', speed: 0.06 },
  ];

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isMoving = false;
  let moveTimeout;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => { isMoving = false; }, 150);
  });

  // 初始化粒子位置
  particles.forEach(p => { p.x = mouseX; p.y = mouseY; });

  function drawGlow() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
      const offsetX = (i - 1) * 30;
      const offsetY = (i - 1) * 20;
      p.tx = mouseX + offsetX;
      p.ty = mouseY + offsetY;

      p.x += (p.tx - p.x) * p.speed;
      p.y += (p.ty - p.y) * p.speed;

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      const alpha = 0.2;
      gradient.addColorStop(0, 'rgba(' + p.color + ', ' + alpha + ')');
      gradient.addColorStop(0.5, 'rgba(' + p.color + ', ' + alpha * 0.4 + ')');
      gradient.addColorStop(1, 'rgba(' + p.color + ', 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawGlow);
  }
  drawGlow();


  /* ======================================================================
     3️⃣  滚动入场动画（IntersectionObserver）
     ====================================================================== */
  const revealEls = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ======================================================================
     4️⃣  页面导航切换（单页应用逻辑）
     ====================================================================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const pages = document.querySelectorAll('.page');

  function closeMobileMenu() {
    if (!mobileMenuToggle || !mobileNav) return;
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('active');
  }

  function toggleMobileMenu() {
    if (!mobileMenuToggle || !mobileNav) return;
    const isOpen = mobileNav.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function switchPage(pageId) {
    const pageExists = Array.prototype.some.call(pages, function(page) {
      return page.id === pageId;
    });

    if (!pageExists) {
      pageId = 'home';
      history.replaceState(null, '', '#home');
    }

    // 更新导航高亮
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });
    closeMobileMenu();

    // 切换页面 + 重新触发入场动画
    pages.forEach(page => {
      const isActive = page.id === pageId;
      if (isActive) {
        page.classList.add('active');

        // 重新触发本页的 scroll-reveal
        page.querySelectorAll('.scroll-reveal').forEach(el => {
          el.classList.remove('visible');
          void el.offsetWidth; // 强制 reflow
          revealObserver.observe(el);
        });

        // 重置本页 skill-fill
        page.querySelectorAll('.skill-fill').forEach(function(fill) {
          fill.classList.remove('active');
          skillObserver.observe(fill);
        });

        // 如果切到画廊页，重新渲染确保内容存在
        if (pageId === 'gallery') {
          renderGallery(currentFilter);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        page.classList.remove('active');
      }
    });
  }

  // 导航点击
  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      history.pushState(null, '', '#' + pageId);
      switchPage(pageId);
    });
  });

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }

  document.addEventListener('click', function(e) {
    if (!mobileNav || !mobileMenuToggle) return;
    if (!mobileNav.classList.contains('active')) return;
    if (mobileNav.contains(e.target) || mobileMenuToggle.contains(e.target)) return;
    closeMobileMenu();
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) closeMobileMenu();
  });

  // Logo 点击 → 回首页
  document.querySelectorAll('[data-link]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = btn.dataset.link;
      history.pushState(null, '', '#' + pageId);
      switchPage(pageId);
    });
  });

  // 浏览器前进后退
  window.addEventListener('popstate', () => {
    const hash = location.hash.replace('#', '') || 'home';
    switchPage(hash);
  });

  // 初始加载：根据 hash 决定页面（默认 home）
  const initialPage = location.hash.replace('#', '') || 'home';


  /* ======================================================================
     5️⃣  作品画廊 — 数据 / 筛选 / 灯箱
     ====================================================================== */
  const artworks = [
    {
      id: 1, type: 'badge', title: 'AEGIS · 吧唧柄图',
      desc: 'AIGC + 手绘,Photoshop精修的二次元吧唧柄图，女神异闻录黄黑配色方案。',
      src: 'image/AEGIS-badge2.png',   // ✅ 真实图片路径（没有就回退到 emoji）
      emoji: '🌸'
    },
    {
      id: 2, type: 'badge', title: 'AEGIS · 吧唧柄图',
      desc: 'Stable Diffusion 生成基底 + Illusion制作，蓝白色系主题。',
      src: 'image/AEGIS-badge1.png',
      emoji: '🪄'
    },
    {
      id: 3, type: 'badge', title: 'AEGIS · 吧唧柄图',
      desc: '手绘人物线稿，手绘 + Photoshop精修制作柄图。',
      src: 'image/AEGIS-badge3.png',
      emoji: '🌙'
    },
    {
      id: 4, type: 'sketch', title: '露琪亚手绘临摹',
      desc: '画世界PRO绘制，学习日系平涂技法的色彩过渡与线条表现。',
      src: 'image/RUKIA.JPG',
      emoji: '✏️'
    },
    {
      id: 5, type: 'sketch', title: '露琪亚新年贺图',
      desc: 'AI辅助生成基底，画世界PRO绘制',
      src: 'image/rukianewyear.PNG',
      emoji: '🖌️'
    },
    {
      id: 6, type: 'sketch', title: 'AEGIS头像绘制',
      desc: '在现成线稿基础上进行修改并上色，画世界PRO绘制',
      src: 'image/AEGIS1.JPG',
      emoji: '🎨'
    },
    {
      id: 7, type: 'sketch', title: '露西手绘作品',
      desc: 'AI提供基底，手绘完成线稿并上色，背景由ai生成',
      src: 'image/LUCY.png',
      emoji: '🖼️'
    },
    {
      id: 8, type: 'graphic', title: 'AEGIS平面设计',
      desc: '简单的文字海报设计，Illusion绘制。',
      src: 'image/poster.png',
      emoji: '🎵'
    },
    {
      id: 9, type: 'sketch', title: '手绘临摹作品 · 01',
      desc: '手绘临摹作品，展示人物绘制与色彩表现。',
      src: 'image/handdraw-20260912.png',
      emoji: '✏️'
    },
    {
      id: 10, type: 'sketch', title: '手绘临摹作品 · 02',
      desc: '手绘临摹作品，展示人物绘制与画面细节。',
      src: 'image/handdraw-20260827.png',
      emoji: '🖌️'
    },
    {
      id: 11, type: 'ui', title: 'Persona 3 Reload 主题交互网站',
      desc: '从 Figma 视觉设计、信息架构与交互规划到响应式前端实现的完整 UI 项目。点击卡片访问线上作品。',
      src: '',
      emoji: '🌊',
      url: 'https://2550190670-blip.github.io/hitorip3r/'
    },
  ];

  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  var currentFilter = 'all';

  // ✅ 安全取值：防止 undefined 直接显示到页面上
  function safe(val, fallback) {
    return (val !== undefined && val !== null && val !== '') ? val : fallback;
  }

  // ✅ 生成封面内容：有 src 用 img，没有就用 emoji + 渐变背景
  function buildCover(art) {
    if (art.src) {
      return '<img src="' + art.src + '" alt="' + art.title + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
             '<div class="cover-fallback" style="display:none">' + safe(art.emoji, '🎨') + '</div>';
    }
    return '<div class="cover-fallback">' + safe(art.emoji, '🎨') + '</div>';
  }

  function renderGallery(filter) {
    filter = filter || 'all';
    currentFilter = filter;

    const filtered = filter === 'all'
      ? artworks
      : artworks.filter(function(a) { return a.type === filter; });

    // 生成卡片 HTML
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var art = filtered[i];
      html += '<div class="artwork-card scroll-reveal visible" style="--i: ' + i + '" data-id="' + art.id + '">' +
               '<div class="artwork-cover">' + buildCover(art) + '</div>' +
               '<div class="artwork-info">' +
                 '<h3>' + safe(art.title, '未命名作品') + '</h3>' +
                 '<p>' + safe(art.desc.substring(0, 28), '') + '...</p>' +
               '</div>' +
             '</div>';
    }
    galleryGrid.innerHTML = html;

    // 绑定卡片点击 → 打开灯箱
    var cards = galleryGrid.querySelectorAll('.artwork-card');
    for (var j = 0; j < cards.length; j++) {
      (function(card) {
        card.addEventListener('click', function() {
          var id = parseInt(card.dataset.id, 10);
          var selected = artworks.find(function(item) { return item.id === id; });
          if (selected && selected.url) {
            window.open(selected.url, '_blank', 'noopener,noreferrer');
          } else {
            openModal(id);
          }
        });
      })(cards[j]);
    }
  }

  // 筛选按钮
  for (var f = 0; f < filterBtns.length; f++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        for (var k = 0; k < filterBtns.length; k++) {
          filterBtns[k].classList.remove('active');
        }
        btn.classList.add('active');
        renderGallery(btn.dataset.filter);
      });
    })(filterBtns[f]);
  }

  // 初始渲染
  renderGallery('all');


  /* ======================================================================
     6️⃣  灯箱 Modal
     ====================================================================== */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalDesc = document.getElementById('modalDesc');

  const typeLabel = { badge: '吧唧柄图', sketch: '手绘临摹', graphic: '平面设计', ui: 'UI 设计' };
  const tagClass  = { badge: 'tag-pink', sketch: 'tag-violet', graphic: 'tag-cyan', ui: 'tag-violet' };

  function openModal(id) {
    var art = null;
    for (var m = 0; m < artworks.length; m++) {
      if (artworks[m].id === id) { art = artworks[m]; break; }
    }
    if (!art) return;

    // ✅ 灯箱内容：有图用图，没图用 emoji
    if (art.src) {
      modalImage.innerHTML = '<img src="' + art.src + '" alt="' + art.title + '" style="max-width:100%;max-height:60vh;border-radius:12px">' +
                             '<div class="cover-fallback" style="display:none">' + safe(art.emoji, '🎨') + '</div>';
    } else {
      modalImage.innerHTML = '<div class="cover-fallback" style="font-size:80px">' + safe(art.emoji, '🎨') + '</div>';
    }

    modalTitle.textContent = safe(art.title, '未命名作品');
    modalTag.textContent = safe(typeLabel[art.type], '');
    modalTag.className = 'tag ' + safe(tagClass[art.type], 'tag-violet');
    modalDesc.textContent = safe(art.desc, '');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });


  /* ======================================================================
     7️⃣  项目详情 Modal
     ====================================================================== */
  const projectDetails = {
    p3r: {
      title: 'Persona 3 Reload 主题交互网站',
      period: '2026',
      summary: '以 Persona 3 Reload 的视觉语言为灵感，构建包含角色、图鉴、探索、日历、音乐和登录模块的响应式主题网站。',
      role: '负责视觉方向、信息架构、交互规划、响应式前端实现，以及 AI 生成代码的拆解、检查与浏览器验收。',
      stack: ['Figma', 'HTML/CSS', 'JavaScript', 'Responsive'],
      links: [{ label: '🌐 在线预览', url: 'https://2550190670-blip.github.io/hitorip3r/' }]
    },
    rogue: {
      title: 'Rogue.py｜用 Python 自动战斗学编程',
      period: '2026',
      summary: '将真实 Python 运行时放入浏览器，让玩家通过编写代码完成战斗、策略选择与随机迷宫寻路，共设计 5 章 14 关。',
      role: '负责产品规则、关卡与 UI、BFS 迷宫、Pyodide 与 Web Worker 集成，并用 AI Coding 辅助实现后逐关测试和验收。',
      stack: ['Python', 'Pyodide', 'Web Worker', 'React', 'BFS', 'Vibe Coding'],
      links: [{ label: '🌐 在线预览', url: 'https://2550190670-blip.github.io/rogue-py/' }]
    },
    meeting: {
      title: 'AI 会议纪要整理系统',
      period: '2026',
      summary: '面向活动执行场景，将会议记录生成摘要、议题、决策、待办、风险和后续跟进，并支持编辑、收藏与文件夹管理。',
      role: '负责业务场景、输出 Schema、Prompt、FastAPI 数据链路与异常测试；让 AI 辅助编码，再通过运行时校验和不同会议样本验收。',
      stack: ['Python', 'FastAPI', 'Qwen', 'SQLite', 'Jinja2', 'SSE', 'AI Coding'],
      links: [{ label: '📱 下载 APK', url: 'https://github.com/2550190670-blip/meeting_ai_assistant/releases/download/v1.0.0/app-debug.apk' }]
    },
    'cv-creater': {
      title: 'CV Creater 智能定向简历管理系统',
      period: '2026',
      summary: '将个人信息、教育、工作和项目经历沉淀为可复用知识库，结合岗位 JD 生成可编辑、可确认采用的定向简历，并保存来源快照与生成版本。系统还支持招聘截图 OCR、简历档案管理以及 Word、PDF 导出。',
      role: '独立负责需求梳理、信息架构与视觉交互、前后端和数据库开发、Qwen 严格事实提示词、OCR 接入、账号与数据隔离，以及跨格式导出排版调试。',
      stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Pydantic', 'SQLite', 'Qwen', 'OCR', 'python-docx', 'ReportLab'],
      links: []
    },
    recruiting: {
      title: '招聘平台产品界面设计项目',
      period: '2024.03 — 2024.08',
      summary: '围绕职位展示、企业信息和用户中心等核心场景，参与招聘平台 PC 端与移动端产品界面设计。',
      role: '负责页面结构、UI 设计、交互优化、视觉资源制作及设计交付沟通。',
      stack: ['Figma', 'UI Components', 'Sketch', 'Photoshop', 'CapCut'],
      links: []
    },
    inventory: {
      title: 'Android 物品管理 APP',
      period: '2024.1 — 2024.6',
      summary: '基于 Android 平台实现物品录入、查询、出入库管理和基础统计，覆盖登录、列表、管理及个人中心。',
      role: '使用 APP Inventor 搭建应用原型，并用 Figma、Photoshop 完成移动端界面与交互优化。',
      stack: ['APP Inventor', 'Figma', 'Photoshop'],
      links: []
    },
    'card-suits': {
      title: '扑克牌花色识别系统',
      period: '2025.3 — 2025.4',
      summary: '针对嵌入式设备算力限制，训练四类扑克牌花色分类模型，并部署到 OpenMV 完成端侧实时推理。',
      role: '负责数据整理与四分类重构、Edge Impulse 训练部署、Python 推理输出、日志记录及串口问题排查。',
      stack: ['Edge Impulse', 'OpenMV', 'TensorFlow Lite', 'Python'],
      links: []
    },
    'low-visibility': {
      title: '低可见度环境下自动驾驶三维目标检测优化',
      period: '2025.1 — 2025.9',
      summary: '基于 MMDetection3D、CRN 与 nuScenes，评估夜间和雨天等环境对三维目标检测的影响，并探索数据增强策略。',
      role: '负责 Windows Docker/CUDA 环境、CRN 兼容适配、数据处理、模型训练、指标评估与实验结果分析。',
      stack: ['PyTorch', 'MMDetection3D', 'CRN', 'nuScenes', 'Docker', 'CUDA'],
      links: []
    },
    'embedded-cv': {
      title: '嵌入式计算机视觉目标检测与人脸识别系统',
      period: '2023 — 2024',
      summary: '在 Raspberry Pi 4 上适配目标检测与人脸识别流程，完成不同光照条件下的视频采集、标注和结果分析。',
      role: '负责 Linux 环境与摄像头配置、开源脚本适配、逐帧推理、CSV 与置信度曲线输出，以及异常结果复核。',
      stack: ['Python', 'Linux', 'Raspberry Pi', 'OpenCV', 'TensorFlow Lite', 'SSD MobileNet'],
      links: []
    },
    portfolio: {
      title: '个人作品集网站',
      period: '2026',
      summary: '围绕个人能力展示构建多页面单页作品集，包含主题切换、Canvas 动效、滚动动画、作品筛选与响应式布局。',
      role: '负责产品定位、信息架构和视觉方向，通过提示词驱动 AI 生成与迭代代码，并进行内容整合、交互检查和浏览器验收。',
      stack: ['HTML/CSS', 'JavaScript', 'Canvas', 'Design System', 'Responsive'],
      links: [
        { label: '🔗 GitHub', url: 'https://github.com/2550190670-blip/Self-intro' },
        { label: '🌐 在线预览', url: 'https://2550190670-blip.github.io/Self-intro/' }
      ]
    }
  };

  const projectModalOverlay = document.getElementById('projectModalOverlay');
  const projectModalClose = document.getElementById('projectModalClose');
  const projectModalPeriod = document.getElementById('projectModalPeriod');
  const projectModalTitle = document.getElementById('projectModalTitle');
  const projectModalSummary = document.getElementById('projectModalSummary');
  const projectModalRole = document.getElementById('projectModalRole');
  const projectModalStack = document.getElementById('projectModalStack');
  const projectModalLinks = document.getElementById('projectModalLinks');
  let projectModalTrigger = null;

  function openProjectModal(projectId, trigger) {
    const project = projectDetails[projectId];
    if (!project || !projectModalOverlay) return;

    projectModalTrigger = trigger || null;
    projectModalPeriod.textContent = project.period;
    projectModalTitle.textContent = project.title;
    projectModalSummary.textContent = project.summary;
    projectModalRole.textContent = project.role;
    projectModalStack.innerHTML = '';
    projectModalLinks.innerHTML = '';

    project.stack.forEach(function(item, index) {
      const stackTag = document.createElement('span');
      const tagColors = ['tag-violet', 'tag-cyan', 'tag-pink'];
      stackTag.className = 'tag ' + tagColors[index % tagColors.length];
      stackTag.textContent = item;
      projectModalStack.appendChild(stackTag);
    });

    project.links.forEach(function(item) {
      const link = document.createElement('a');
      link.className = 'project-modal-link';
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.label;
      projectModalLinks.appendChild(link);
    });

    projectModalOverlay.classList.add('active');
    projectModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    projectModalClose.focus();
  }

  function closeProjectModal() {
    if (!projectModalOverlay || !projectModalOverlay.classList.contains('active')) return;
    projectModalOverlay.classList.remove('active');
    projectModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (projectModalTrigger) projectModalTrigger.focus();
    projectModalTrigger = null;
  }

  document.querySelectorAll('.project-card[data-project-id]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target instanceof Element && e.target.closest('a, button')) return;
      openProjectModal(card.dataset.projectId, card);
    });
    card.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target instanceof Element && e.target.closest('a, button')) return;
      e.preventDefault();
      openProjectModal(card.dataset.projectId, card);
    });
  });

  projectModalClose.addEventListener('click', closeProjectModal);
  projectModalOverlay.addEventListener('click', function(e) {
    if (e.target === projectModalOverlay) closeProjectModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeProjectModal();
  });


  /* ======================================================================
     8️⃣  技能条动画触发（进入视口时）
     ====================================================================== */
  const skillFills = document.querySelectorAll('.skill-fill');
  const skillObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        requestAnimationFrame(function() {
          entry.target.classList.add('active');
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillFills.forEach(function(fill) {
    skillObserver.observe(fill);
  });

  // 初始页面加载
  switchPage(initialPage);

})();
