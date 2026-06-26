/* toodoo services – script.js */

// === NAV SCROLL ===
(function () {
  const nav = document.getElementById('nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      nav.classList.add('nav--scrolled');
      nav.classList.toggle('nav--hidden', y > lastY + 8);
      if (y < lastY - 8) nav.classList.remove('nav--hidden');
    } else {
      nav.classList.remove('nav--scrolled', 'nav--hidden');
    }
    lastY = y;
  }, { passive: true });
})();

// === MOBILE DRAWER ===
(function () {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('drawer');
  const overlay   = document.getElementById('overlay');
  const close     = document.getElementById('drawerClose');

  const open  = () => { drawer.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const shut  = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; };

  hamburger?.addEventListener('click', open);
  close?.addEventListener('click', shut);
  overlay?.addEventListener('click', shut);
  document.querySelectorAll('.drawer__links a, .drawer__cta').forEach(a => a.addEventListener('click', shut));
})();

// === SCROLL ANIMATIONS ===
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
})();

// === COUNTERS (hero + stats bar) ===
(function () {
  const counters = document.querySelectorAll('.stat-num, .sbar-num');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1600;
      const start  = performance.now();

      const tick = now => {
        const p    = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

// === FAQ ACCORDION ===
(function () {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-a').classList.remove('open');
      });
      if (!isOpen) { item.classList.add('open'); answer.classList.add('open'); }
    });
  });
})();

// === CONTACT FORM ===
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = '✓ Anfrage gesendet!';
    btn.style.background = '#22c55e';
    btn.disabled = true;
    const d = new FormData(form);
    const mailto = `mailto:info@toodoo-services.de?subject=Angebotsanfrage von ${encodeURIComponent(d.get('name'))}&body=${encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nTelefon: ${d.get('telefon')}\n\nNachricht:\n${d.get('message')}`)}`;
    window.location.href = mailto;
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; form.reset(); }, 4000);
  });
})();

// === LIGHTBOX ===
(function () {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbCounter= document.getElementById('lbCounter');
  const thumbs   = document.querySelectorAll('.thumb');
  if (!lightbox || !thumbs.length) return;

  const imgs = [...thumbs].map(t => {
    const img = t.querySelector('img');
    return { src: img.src, alt: img.alt };
  });
  let cur = 0;

  function show(idx) {
    cur = (idx + imgs.length) % imgs.length;
    lbImg.src = imgs[cur].src;
    lbImg.alt = imgs[cur].alt;
    lbCounter.textContent = `${cur + 1} / ${imgs.length}`;
  }

  function open(idx) {
    show(idx);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => open(i)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => show(cur - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(cur + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();

// === GOOGLE REVIEWS POPUP ===
(function () {
  const trigger = document.getElementById('grTrigger');
  const card    = document.getElementById('grCard');
  const closeBtn= document.getElementById('grClose');
  if (!trigger || !card) return;

  trigger.addEventListener('click', () => card.classList.toggle('open'));
  closeBtn?.addEventListener('click', () => card.classList.remove('open'));
  document.addEventListener('click', e => {
    if (!card.contains(e.target) && !trigger.contains(e.target)) card.classList.remove('open');
  });
})();

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('nav')?.offsetHeight || 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 8, behavior: 'smooth' });
  });
});
