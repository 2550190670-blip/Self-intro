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
      id: 9, type: 'ui', title: 'Persona 3 Reload 主题交互网站',
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
     7️⃣  技能条动画触发（进入视口时）
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
