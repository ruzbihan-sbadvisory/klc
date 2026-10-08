(function () {
  var CFG = window.SITE || {};

  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Menu skrin penuh ----
  var menu = document.getElementById('fmenu');
  var menuOpener = null;
  function openMenu(btn) {
    if (!menu) return;
    menuOpener = btn || null;
    menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false');
    $$('[data-open-menu]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var c = menu.querySelector('.fmenu-close'); if (c) c.focus({ preventScroll: true }); }, 50);
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
    $$('[data-open-menu]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.body.style.overflow = '';
    if (menuOpener) menuOpener.focus({ preventScroll: true });
  }
  $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { openMenu(b); }); });
  $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // ---- Marquee: gandakan isi supaya bergerak tanpa putus ----
  $$('[data-marquee]').forEach(function (t) { t.innerHTML += t.innerHTML; });

  // ---- Animasi masuk dari kiri / kanan / bawah ----
  $$('[data-alt]').forEach(function (c) {
    var mode = c.getAttribute('data-alt');
    Array.prototype.forEach.call(c.children, function (el, i) {
      el.setAttribute('data-anim', mode === 'up' ? 'up' : (i % 2 ? 'right' : 'left'));
      el.style.setProperty('--d', (i * 0.09) + 's');
    });
  });
  var animEls = $$('[data-anim]');
  function reveal(el) {
    el.classList.add('in');
    var d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    // buang atribut lepas siap supaya transisi hover tak terseret
    setTimeout(function () { el.removeAttribute('data-anim'); el.classList.remove('in'); }, d * 1000 + 1400);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); reveal(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    animEls.forEach(function (el) { io.observe(el); });
  } else {
    animEls.forEach(function (el) { el.removeAttribute('data-anim'); });
  }

  // ---- Scroll: header, ring progress, parallax, nav aktif ----
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');
  var ring = document.getElementById('ringP');
  var px = $$('[data-px]');
  var heroImg = document.querySelector('[data-parallax-img]');
  var navLinks = $$('.nav-link');
  var onHome = location.pathname === '/';
  var navTargets = navLinks.map(function (a) {
    try { return onHome && a.hash ? document.querySelector(a.hash) : null; } catch (e) { return null; }
  });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 500);
    var max = document.documentElement.scrollHeight - vh;
    if (ring) ring.style.strokeDashoffset = 131.95 * (1 - Math.min(1, y / (max || 1)));
    if (!reduce) {
      px.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty('--tx', ((p * 2 - 1) * -260 * Number(el.getAttribute('data-px'))) + 'px');
      });
      if (heroImg && y < 1200) heroImg.style.setProperty('--py', Math.min(60, y * 0.12) + 'px');
    }
    var cur = -1, best = -Infinity;
    navTargets.forEach(function (t, i) {
      if (!t) return;
      var top = t.getBoundingClientRect().top;
      if (top <= 140 && top > best) { best = top; cur = i; }
    });
    navLinks.forEach(function (a, i) {
      a.classList.toggle('on', onHome ? i === cur : (a.pathname === '/artikel/' && location.pathname.indexOf('/artikel') === 0));
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---- Modal borang ----
  var modal = document.getElementById('contact-modal');
  var modalContent = document.getElementById('modal-content');
  var form = document.getElementById('inquiryForm');

  function openForm() {
    if (!modal) return;
    closeMenu();
    modal.classList.remove('hidden'); modal.classList.add('flex');
    setTimeout(function () {
      modal.classList.replace('opacity-0', 'opacity-100');
      modalContent.classList.replace('scale-95', 'scale-100');
      var first = form && form.querySelector('input');
      if (first) first.focus();
    }, 10);
  }
  function closeForm() {
    if (!modal) return;
    modal.classList.replace('opacity-100', 'opacity-0');
    modalContent.classList.replace('scale-100', 'scale-95');
    setTimeout(function () {
      modal.classList.add('hidden'); modal.classList.remove('flex');
      document.getElementById('successMessage').classList.add('hidden');
      form.reset();
    }, 300);
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-form]')) { e.preventDefault(); openForm(); }
    if (e.target.closest('[data-close-form]') || e.target === modal) closeForm();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeForm(); });
  if (location.hash === '#contact') openForm();

  // ---- Hantar borang ke Google Apps Script ----
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = CFG.form || {};
      var btn = document.getElementById('submitBtn');
      var txt = document.getElementById('btnText');
      var icon = document.getElementById('btnIcon');
      var spin = document.getElementById('btnSpinner');
      function reset(label) { btn.disabled = false; txt.textContent = label; icon.classList.remove('hidden'); spin.classList.add('hidden'); }

      if (!f.scriptUrl) { reset(f.errorText || 'Error'); return; }
      btn.disabled = true; txt.textContent = f.sendingLabel || 'Sending...';
      icon.classList.add('hidden'); spin.classList.remove('hidden');
      form.elements.page.value = location.href;

      // no-cors: Apps Script tak hantar header CORS yang konsisten, tapi data tetap sampai
      fetch(f.scriptUrl, { method: 'POST', mode: 'no-cors', body: new FormData(form) })
        .then(function () {
          reset(f.submitLabel || 'Send Message');
          document.getElementById('successMessage').classList.remove('hidden');
          form.reset();
          setTimeout(closeForm, 2500);
        })
        .catch(function (err) {
          console.error(err);
          reset(f.errorText || 'Error. Try Again.');
          setTimeout(function () { reset(f.submitLabel || 'Send Message'); }, 3000);
        });
    });
  }

  // ---- Slider servis ----
  document.querySelectorAll('[data-slider]').forEach(function (root) {
    var track = root.querySelector('[data-track]');
    var dots = root.querySelectorAll('[data-dot]');
    var total = track ? track.children.length : 0;
    var secs = Number(root.getAttribute('data-interval')) || 6;
    var cur = 0, timer;
    if (total < 2) return;

    function go(i) {
      cur = (i + total) % total;
      track.style.transform = 'translateX(-' + cur * 100 + '%)';
      dots.forEach(function (d, k) {
        var on = k === cur;
        d.classList.toggle('bg-brand-gold', on); d.classList.toggle('w-8', on);
        d.classList.toggle('bg-white/40', !on); d.classList.toggle('w-2', !on);
        d.setAttribute('aria-current', on ? 'true' : 'false');
      });
      restart();
    }
    function restart() { clearInterval(timer); if (secs > 0) timer = setInterval(function () { go(cur + 1); }, secs * 1000); }

    root.querySelector('[data-prev]').addEventListener('click', function () { go(cur - 1); });
    root.querySelector('[data-next]').addEventListener('click', function () { go(cur + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });

    // Swipe di telefon
    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
    });
    restart();
  });

  // ---- Penapis kategori artikel ----
  var filters = document.querySelectorAll('[data-filter]');
  if (filters.length) {
    filters.forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-filter');
        filters.forEach(function (x) {
          var on = x === b;
          x.classList.toggle('bg-brand-blue', on); x.classList.toggle('text-white', on);
          x.classList.toggle('bg-white', !on); x.classList.toggle('text-gray-700', !on);
        });
        var shown = 0;
        document.querySelectorAll('[data-category]').forEach(function (card) {
          var ok = cat === 'all' || card.getAttribute('data-category') === cat;
          card.classList.toggle('hidden', !ok); if (ok) shown++;
        });
        var empty = document.getElementById('no-articles');
        if (empty) empty.classList.toggle('hidden', shown > 0);
      });
    });
  }
})();
