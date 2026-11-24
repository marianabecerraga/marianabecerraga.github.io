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

  var home = document.getElementById('home');

  /* ---------- 2. The cursor: a dot that grows over links and
     carries a word over work ("View", "Expand") ---------- */
  var cursor = document.querySelector('.cursor');
  var heroMe = home.querySelector('.home-photo .c1');
  var heroStar = home.querySelector('.star-wrap');
  if (finePointer && cursor && !reduce) {
    body.classList.add('has-cursor');
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      /* hero depth: portrait and star drift apart with the pointer */
      if (scrollY < innerHeight) {
        var dx = x / innerWidth - 0.5, dy = y / innerHeight - 0.5;
        heroMe.style.transform = 'translate3d(' + (dx * -10) + 'px,' + (dy * -6) + 'px,0)';
        heroStar.style.transform = 'translate3d(' + (dx * 22) + 'px,' + (dy * 14) + 'px,0)';
      }
    }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.3; cy += (y - cy) * 0.3;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('.card').forEach(function (el) { el.setAttribute('data-cursor', 'View'); });
    document.querySelectorAll('.mcard').forEach(function (el) { el.setAttribute('data-cursor', 'Expand'); });
    document.querySelectorAll('.ai figure:not(.is-video) .ai-shot').forEach(function (el) { el.setAttribute('data-cursor', 'View'); });
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var label = el.getAttribute('data-cursor');
        if (label) { cursor.setAttribute('data-label', label); cursor.classList.add('label'); }
        else cursor.classList.add('big');
      });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('big', 'label'); });
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
  var trackWrap = document.getElementById('trackWrap');
  function trackEnd() { trackWrap.classList.toggle('at-end', track.scrollLeft + track.clientWidth >= track.scrollWidth - 8); }
  track.addEventListener('scroll', trackEnd, { passive: true });
  addEventListener('resize', trackEnd);
  chips.forEach(function (c) { c.addEventListener('click', function () { setTimeout(trackEnd, 400); }); });
  trackEnd();
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
  var visible = new Set();
  var autoVids = document.querySelectorAll('video[data-auto]');
  autoVids.forEach(function (v) {
    v.muted = true;
    vidObserver.observe(v);
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) visible.add(v); else visible.delete(v); }); }).observe(v);
    if (reduce) v.setAttribute('controls', '');
  });
  /* browsers pause media in background tabs: resume what is on screen when the tab returns */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden || reduce) return;
    visible.forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
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

  /* ---------- 6. Motion system ----------
     Principles taken from the references: things arrive once and settle
     (long deceleration, no bounce); type is set word by word out of a mask;
     images open from an edge; sections rise like cards over the previous
     one; images drift a little slower than the page, for depth. */
  if (!reduce) {
    /* split titles into masked words */
    function split(el, baseDelay, step) {
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span'); w.className = 'w';
              var i = document.createElement('i'); i.textContent = part;
              i.style.setProperty('--d', (baseDelay + n * step).toFixed(2) + 's'); n++;
              w.appendChild(i); frag.appendChild(w);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
        });
      })(el);
      el.classList.add('split');
      return n;
    }
    var heroCount = 0;
    ['.l1', '.l2', '.l3', '.l4'].forEach(function (sel, i) {
      heroCount += split(home.querySelector('.hero-title ' + sel), 0.15 + heroCount * 0.08 + i * 0.06, 0.08);
    });
    home.querySelector('.hero-title').classList.add('split', 'reveal-target');
    document.querySelectorAll('.display:not(.long), .interlude-lead, .statement').forEach(function (el) {
      split(el, 0.05, 0.07); el.classList.add('reveal-target');
    });
    document.querySelectorAll('.display.long').forEach(function (el) { el.classList.add('rv', 'reveal-target'); });

    /* content blocks rise; siblings follow each other */
    function mark(sel, cls, step) {
      document.querySelectorAll(sel).forEach(function (el) {
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(sel); });
        el.classList.add(cls, 'reveal-target');
        el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 6) * step).toFixed(2) + 's');
      });
    }
    mark('.sh, .micro, .chips, .arrows', 'rv', 0.08);
    mark('.p-line, .story > *, .meta, .next, .path li, .interlude > :not(.interlude-lead), .mcap', 'rv', 0.1);
    mark('.card, .reel, .mcard, .plate figcaption, .studio-live figcaption, .studio-text > p:not(.statement)', 'rv', 0.1);
    mark('.roles > div, .about-text > .k, .about-text > .meta, .about-text > .btn, .contact .actions, .foot', 'rv', 0.07);
    mark('.p-media .row > figure, .plate .fig, .live-frame', 'rvi', 0.12);
    mark('.about-photo, .home-photo', 'rv', 0);
    mark('.ai-intro-text > p, .ai-rules li, .ai-case-head > *, .ai-badge, .ai-rights', 'rv', 0.08);
    mark('.ai-slide, .ai-col > figure', 'rv', 0.1);
    document.querySelectorAll('.ai-collage > figure').forEach(function (f) { f.classList.add('rv', 'reveal-target'); });
    home.querySelector('.home-photo').style.setProperty('--d', '.7s');

    /* clipped images are watched through their (unclipped) parent:
       a fully clipped element never counts as visible */
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        if (t.classList.contains('reveal-target')) t.classList.add('in');
        Array.prototype.forEach.call(t.children, function (c) { if (c.classList.contains('rvi')) c.classList.add('in'); });
        revealer.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    var watched = new Set();
    document.querySelectorAll('.reveal-target').forEach(function (el) {
      var t = el.classList.contains('rvi') ? el.parentNode : el;
      if (!watched.has(t)) { watched.add(t); revealer.observe(t); }
    });

    /* scroll-linked: section cards, image drift, the middle reel */
    var stage = Array.prototype.slice.call(panels);
    var drifting = Array.prototype.slice.call(document.querySelectorAll('.p-media .row > figure, .plate .fig'));
    var midReel = document.querySelector('.reel:nth-child(2) .phone');
    /* AI collage: each piece floats at its own speed (--sp), like a pinned scrapbook */
    var floaters = Array.prototype.slice.call(document.querySelectorAll('.ai-collage > figure, .ai-col'));
    var wide = window.matchMedia('(min-width: 981px)');
    var bgs = stage.map(function (p) { return getComputedStyle(p).backgroundColor; });
    var ticking = false;
    function frame() {
      ticking = false;
      var vh = innerHeight, under = null;
      var maxInset = Math.min(innerWidth * 0.04, 56);
      stage.forEach(function (p, i) {
        if (i === 0) return;
        var t = p.getBoundingClientRect().top / vh;
        if (t > 0 && t < 1) {
          var e = 1 - Math.pow(t, 3);           /* 0 at the bottom edge → 1 at the top */
          p.style.setProperty('--ci', ((1 - e) * maxInset).toFixed(1) + 'px');
          p.style.setProperty('--cr', ((1 - e) * 28).toFixed(1) + 'px');
          under = bgs[i - 1];
        } else {
          p.style.setProperty('--ci', '0px'); p.style.setProperty('--cr', '0px');
        }
      });
      body.style.backgroundColor = under || '';
      drifting.forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var prog = (r.top + r.height / 2 - vh / 2) / vh;      /* -1 … 1 */
        var img = f.querySelector('img');
        if (img) img.style.setProperty('--py', (Math.max(-1, Math.min(1, prog)) * r.height * -0.018).toFixed(1) + 'px');
      });
      floaters.forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var sp = parseFloat(f.style.getPropertyValue('--sp')) || (f.classList.contains('ai-col') ? [0.15, -0.2, 0.25][Array.prototype.indexOf.call(f.parentNode.children, f)] : 0);
        var dy = wide.matches ? ((r.top + r.height / 2) / vh - 0.5) * sp * -120 : 0;
        f.style.setProperty('--dy', dy.toFixed(1) + 'px');
      });
      if (midReel) {
        var rr = midReel.getBoundingClientRect();
        if (rr.bottom > 0 && rr.top < vh) midReel.style.setProperty('--rp', (((rr.top + rr.height / 2) / vh - 0.5) * -60).toFixed(1) + 'px');
      }
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', frame);
    frame();
  }

  /* ---------- 7. AI lightbox: click a still to see it whole ---------- */
  var lb = document.createElement('div');
  lb.className = 'ai-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML = '<img alt=""><button type="button">Close</button>';
  body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbBtn = lb.querySelector('button'), lastFocus = null;
  function closeLb() { lb.classList.remove('open'); body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  document.querySelectorAll('.ai figure:not(.is-video) .ai-shot').forEach(function (shot) {
    var img = shot.querySelector('img');
    shot.setAttribute('tabindex', '0'); shot.setAttribute('role', 'button');
    shot.setAttribute('aria-label', 'Open image: ' + img.alt);
    function open() { lastFocus = shot; lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lb.classList.add('open'); body.style.overflow = 'hidden'; lbBtn.focus(); }
    shot.addEventListener('click', open);
    shot.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });

  /* ---------- 8. Mobile menu ---------- */
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
