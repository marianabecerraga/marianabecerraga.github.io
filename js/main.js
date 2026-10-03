/* Mariana Becerra · Portfolio — interactions */
(function () {
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Section tone + active dot ---------- */
  var navLinks = document.querySelectorAll('.dots a');
  var head = document.querySelector('.site-head');
  var panels = document.querySelectorAll('.panel');
  var toneObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var s = entry.target;
      body.setAttribute('data-tone', s.getAttribute('data-tone') || 'light');
      head.style.backgroundColor = getComputedStyle(s).backgroundColor;
      var key = s.getAttribute('data-nav');
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === key); });
    });
  }, { rootMargin: '-6% 0px -93% 0px' });
  panels.forEach(function (p) { toneObserver.observe(p); });

  /* ---------- 1b. Hero: the photo starts where the last line of the
     headline starts, so it sits beside "it work." and never under the type ---------- */
  var home = document.getElementById('home');
  var heroLines = home.querySelectorAll('.hero-title .ln');
  function placePhoto() {
    var last = heroLines[heroLines.length - 1];
    var top = last.getBoundingClientRect().top - home.getBoundingClientRect().top;
    var room = home.clientHeight - top;
    home.style.setProperty('--photo-top', Math.min(top, home.clientHeight - Math.max(room, 200)) + 'px');
    var range = document.createRange();
    range.selectNodeContents(last);
    var free = home.getBoundingClientRect().right - range.getBoundingClientRect().right - 2 * parseFloat(getComputedStyle(home).paddingRight);
    home.style.setProperty('--photo-w', Math.max(free, 180) + 'px');
  }
  placePhoto();
  addEventListener('resize', placePhoto);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePhoto);

  /* ---------- 2. The cursor: black or orange dot ---------- */
  var cursor = document.querySelector('.cursor');
  if (finePointer && cursor && !reduce) {
    body.classList.add('has-cursor');
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.35; cy += (y - cy) * 0.35;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .mcard').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('big'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('big'); });
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ---------- 3. Work: filters + arrows ---------- */
  var track = document.getElementById('track');
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      track.querySelectorAll('.card').forEach(function (card) {
        var areas = (card.getAttribute('data-area') || '').split(' ');
        card.hidden = !(f === 'all' || areas.indexOf(f) !== -1);
      });
      track.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dir = parseInt(btn.getAttribute('data-scroll'), 10);
      track.scrollBy({ left: dir * track.clientWidth * 0.75, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 4. Videos autoplay (muted, loop) while visible ---------- */
  var vidObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('video[data-auto]').forEach(function (v) {
    v.muted = true;
    vidObserver.observe(v);
    if (reduce) v.setAttribute('controls', '');
  });

  /* ---------- 5. Motion: uniform grid, active piece opens to landscape ----------
     Desktop: all frames share one height; the hovered (or focused) piece
     widens to its own ratio and the others narrow to make room.
     Phones: frames are stacked squares; "Full frame" eases one open. */
  var grid = document.getElementById('mgrid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.mcard'));
    var active = null;
    var phone = window.matchMedia('(max-width: 820px)');

    function ratio(card) { return parseFloat(getComputedStyle(card).getPropertyValue('--ar')) || 16 / 9; }

    function layout() {
      if (phone.matches) {
        grid.style.gridTemplateColumns = '';
        cards.forEach(function (card) {
          var f = card.querySelector('.mframe');
          var w = f.clientWidth;
          f.style.height = (card === active ? w / ratio(card) : w) + 'px';
        });
        return;
      }
      cards.forEach(function (card) { card.querySelector('.mframe').style.height = ''; });
      var W = grid.clientWidth;
      var g = parseFloat(getComputedStyle(grid).columnGap) || 0;
      var free = W - 2 * g;
      var h = free / 3;
      grid.style.setProperty('--mh', h + 'px');
      grid.classList.add('sized');
      if (!active) {
        grid.style.gridTemplateColumns = [h, h, h].map(function (n) { return n + 'px'; }).join(' ');
        return;
      }
      var minOther = Math.max(free * 0.14, 110);
      var aw = Math.min(h * ratio(active), free - 2 * minOther);
      var ow = (free - aw) / 2;
      grid.style.gridTemplateColumns = cards.map(function (c) { return (c === active ? aw : ow) + 'px'; }).join(' ');
    }

    function setActive(card) {
      active = card;
      grid.classList.toggle('has-active', !!card);
      cards.forEach(function (c) {
        c.classList.toggle('is-active', c === card);
        var t = c.querySelector('.mtoggle');
        if (t) t.setAttribute('aria-pressed', c === card ? 'true' : 'false');
      });
      layout();
    }

    if (finePointer) {
      cards.forEach(function (card) {
        card.addEventListener('mouseenter', function () { if (!phone.matches) setActive(card); });
      });
      grid.addEventListener('mouseleave', function () { if (!phone.matches) setActive(null); });
    }
    cards.forEach(function (card) {
      card.addEventListener('focus', function () { setActive(card); });
      card.addEventListener('blur', function (e) { if (!grid.contains(e.relatedTarget)) setActive(null); });
      var t = card.querySelector('.mtoggle');
      if (t) t.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(active === card ? null : card);
      });
    });

    var rt;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 80); });
    layout();
  }

  /* ---------- 6. Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobileNav');
  function setMenu(open) {
    mobileNav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(true); });
  mobileNav.querySelector('.close').addEventListener('click', function () { setMenu(false); });
  mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
})();
