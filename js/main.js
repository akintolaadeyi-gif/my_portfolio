/* ─── Cursor ─────────────────────────────────────────────────────── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -200, my = -200, cx = -200, cy = -200;

if (cursor) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  (function tick() {
    cx += (mx - cx) * 0.11;
    cy += (my - cy) * 0.11;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .work-item, .skill-pill, .contact-link-row').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
  });

  document.querySelectorAll('.hero-avatar, .about-photo, .about-page-photo').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

/* ─── Page loader ────────────────────────────────────────────────── */
function dismissLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('loaded');
    /* trigger decrypt after loader fade (550ms transition + buffer) */
    setTimeout(() => {
      document.querySelectorAll('.hero-name-line-inner').forEach((el, i) => {
        setTimeout(() => decryptText(el), i * 250);
      });
    }, 650);
  }, 600);
}
window.addEventListener('load', dismissLoader);
/* also dismiss on bfcache restore (back/forward navigation) */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) dismissLoader();
  /* always make sure body is visible */
  document.body.style.opacity = '1';
});

/* ─── Nav scroll border ──────────────────────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─── Scroll reveal: [data-anim] ─────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('[data-anim]').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.07 + 's';
  revealObserver.observe(el);
});

/* ─── Decrypted text reveal ─────────────────────────────────────── */
function decryptText(el, {
  speed = 60,
  preScramble = 12,
  revealDirection = 'center',
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
} = {}) {
  const text = el.textContent;
  const len = text.length;

  /* reveal order: outward from the center */
  const order = [];
  if (revealDirection === 'center') {
    const middle = Math.floor(len / 2);
    let offset = 0;
    while (order.length < len) {
      const idx = offset % 2 === 0 ? middle + offset / 2 : middle - Math.ceil(offset / 2);
      if (idx >= 0 && idx < len) order.push(idx);
      offset++;
    }
  } else {
    for (let i = 0; i < len; i++) order.push(i);
  }

  el.innerHTML = text.split('').map(ch => `<span class="decrypt-char">${ch}</span>`).join('');
  const spans = el.querySelectorAll('.decrypt-char');
  const revealed = new Set();
  let pointer = 0;
  let pre = 0;

  const interval = setInterval(() => {
    /* scramble all unrevealed chars every tick */
    spans.forEach((span, i) => {
      if (revealed.has(i)) return;
      span.textContent = characters[Math.floor(Math.random() * characters.length)];
    });
    /* hold in full-chaos for preScramble ticks, then lock in one char per tick */
    if (pre < preScramble) {
      pre++;
    } else if (pointer < order.length) {
      const idx = order[pointer++];
      spans[idx].textContent = text[idx];
      spans[idx].classList.add('is-decrypted');
      revealed.add(idx);
    } else {
      clearInterval(interval);
    }
  }, speed);
}

/* ─── Hero name mask reveal ──────────────────────────────────────── */
const nameObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    document.querySelectorAll('.hero-name-line-inner').forEach(el => el.classList.add('visible'));
    nameObserver.disconnect();
  }
}, { threshold: 0.05 });

const heroName = document.querySelector('.hero-name');
if (heroName) nameObserver.observe(heroName);

/* ─── Copy email ─────────────────────────────────────────────────── */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      btn.classList.add('copied');
      showToast('Email copied!');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    });
  });
});

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ─── Nav toggle ─────────────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
if (navToggle && nav) {
  const MOBILE_BP = 840;

  /* on mobile the dropdown is hidden when nav--closed is absent,
     so we start mobile with nav--closed so the icon shows "open" */
  function initNavState() {
    if (window.innerWidth <= MOBILE_BP) {
      nav.classList.add('nav--closed');
    } else {
      nav.classList.remove('nav--closed');
    }
  }
  initNavState();
  window.addEventListener('resize', initNavState, { passive: true });

  navToggle.addEventListener('click', () => nav.classList.toggle('nav--closed'));

  /* close dropdown when a link is tapped on mobile */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= MOBILE_BP) nav.classList.add('nav--closed');
    });
  });
}

/* ─── Nav dot indicator ──────────────────────────────────────────── */
const navDot = document.querySelector('.nav-dot');
const navLinkEls = document.querySelectorAll('.nav-link');
if (navDot && navLinkEls.length) {
  const linksContainer = navDot.closest('.nav-links');
  /* seed initial position so first hover doesn't fly in from zero */
  const seedLeft = () => {
    const r = navLinkEls[0].getBoundingClientRect();
    const c = linksContainer.getBoundingClientRect();
    navDot.style.left = (r.right - c.left + 10) + 'px';
  };
  window.addEventListener('load', seedLeft);
  navLinkEls.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const r = link.getBoundingClientRect();
      const c = linksContainer.getBoundingClientRect();
      navDot.style.left = (r.right - c.left + 10) + 'px';
    });
  });
}

/* ─── Works list magnetic title ──────────────────────────────────── */
document.querySelectorAll('.works-list-item').forEach(item => {
  const title = item.querySelector('.wl-title');
  if (!title) return;
  item.addEventListener('mousemove', e => {
    const r = item.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 9;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 9;
    title.style.transform = `translate(${x}px, ${y}px)`;
  });
  item.addEventListener('mouseleave', () => { title.style.transform = ''; });
});

/* ─── Dark-section nav inversion ────────────────────────────────── */
const darkSections = document.querySelectorAll('.cta-dark');
if (nav && darkSections.length) {
  function checkDarkNav() {
    const navBottom = nav.getBoundingClientRect().bottom;
    const anyDark = [...darkSections].some(s => {
      const r = s.getBoundingClientRect();
      return r.top < navBottom && r.bottom > 0;
    });
    nav.classList.toggle('nav--light', anyDark);
  }
  window.addEventListener('scroll', checkDarkNav, { passive: true });
  checkDarkNav(); /* run once on load */
}

/* ─── Page transitions ───────────────────────────────────────────── */
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
  link.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 260);
  });
});
