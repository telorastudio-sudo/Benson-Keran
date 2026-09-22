(function () {
  'use strict';

  var PASSWORD = 'BK123';

  // ── DOM refs ──────────────────────────────────────────────────────────────
  var body        = document.body;
  var gate        = document.getElementById('gate');
  var gateContent = document.getElementById('gateContent');
  var gateAuth    = document.getElementById('gateAuth');
  var envWrap     = document.getElementById('envWrap');
  var envelope    = document.getElementById('envelope');
  var codeForm    = document.getElementById('codeForm');
  var codeInput   = document.getElementById('codeInput');
  var codeError   = document.getElementById('codeError');
  var nav         = document.getElementById('siteNav');
  var navBurger   = document.getElementById('navBurger');
  var navLinks    = document.getElementById('navLinks');
  var scrollTop   = document.getElementById('scrollTop');

  // ── Returning visitor: skip gate, show everything instantly ──────────────
  try {
    if (localStorage.getItem('bk-invite-unlocked') === 'yes') {
      gate.style.display = 'none'; // instantly gone — no fade, no bleed
      body.classList.remove('locked');
      nav.classList.add('nav-visible');
      startCountdown();
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('active');
      });
    }
  } catch (e) {}

  // ── Subtle 3D parallax tilt on the envelope, following the cursor (lerped for buttery smoothness) ─
  (function () {
    if (!envelope || !window.matchMedia) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var raf = null, tiltActive = true;

    function onMove(e) {
      if (!tiltActive) return;
      var w = window.innerWidth, h = window.innerHeight;
      targetX = (e.clientX / w) * 2 - 1;   // -1 … 1
      targetY = (e.clientY / h) * 2 - 1;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!tiltActive) return;
      // Ease current position toward target — smooth, weighty motion
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      envelope.style.transform =
        'rotateY(' + (curX * 9).toFixed(2) + 'deg) rotateX(' + (-curY * 7).toFixed(2) + 'deg)';
    }
    tick();

    // Stop tilting once the envelope starts opening; settle back to flat
    var stopObserver = new MutationObserver(function () {
      if (envelope.classList.contains('open')) {
        tiltActive = false;
        window.removeEventListener('mousemove', onMove);
        if (raf) cancelAnimationFrame(raf);
        envelope.style.transform = 'rotateY(0deg) rotateX(0deg)';
        stopObserver.disconnect();
      }
    });
    stopObserver.observe(envelope, { attributes: true, attributeFilter: ['class'] });
  }());

  // ── Gold-dust sparkle burst, radiating from the wax seal ──────────────────
  function spawnSealSparkles() {
    if (!envelope) return;

    // Bright flash at the instant of cracking
    var flash = document.createElement('span');
    flash.className = 'seal-flash';
    envelope.appendChild(flash);
    setTimeout(function () { flash.remove(); }, 700);

    var count = 18;
    for (var i = 0; i < count; i++) {
      var span = document.createElement('span');
      span.className = 'seal-sparkle' + (i % 3 === 0 ? ' star' : '');
      var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      var dist  = 42 + Math.random() * 54;
      var tx = Math.cos(angle) * dist;
      var ty = Math.sin(angle) * dist * 0.75 - 10; // slight upward bias
      var scale = (0.6 + Math.random() * 0.9).toFixed(2);
      span.style.setProperty('--tx', tx.toFixed(1) + 'px');
      span.style.setProperty('--ty', ty.toFixed(1) + 'px');
      span.style.setProperty('--s', scale);
      span.style.animationDelay = (Math.random() * 0.09).toFixed(2) + 's';
      envelope.appendChild(span);
      (function (el) {
        setTimeout(function () { el.remove(); }, 1300);
      }(span));
    }
  }

  // ── Envelope unlock sequence ──────────────────────────────────────────────
  function runUnlockSequence() {
    try { localStorage.setItem('bk-invite-unlocked', 'yes'); } catch (e) {}

    // Stop floating animation
    if (envWrap) envWrap.classList.add('opening');

    // Hide auth form
    gateAuth.style.transition = 'opacity 0.5s ease';
    gateAuth.style.opacity    = '0';
    gateAuth.style.pointerEvents = 'none';

    // Step 1: Crack the wax seal + burst gold-dust sparkles
    var seal = document.getElementById('waxSeal');
    if (seal) seal.classList.add('cracking');
    spawnSealSparkles();

    // Step 2: After seal cracks (550ms), open the flap
    setTimeout(function () {
      envelope.classList.add('open');
    }, 550);

    // Step 3: Once the card has finished its rise, let it settle into a gentle idle float
    var envCard = document.getElementById('envCard');
    setTimeout(function () {
      if (envCard) envCard.classList.add('settled');
    }, 550 + 1250);

    // Step 4: After card has risen (550 + 1800ms), fade the gate out
    setTimeout(function () {
      gateContent.classList.add('fade-out');
      setTimeout(function () {
        gate.classList.add('hidden');
        body.classList.remove('locked');
        setTimeout(function () { nav.classList.add('nav-visible'); }, 600);
        startCountdown();
        triggerReveals();
      }, 950);
    }, 2350);
  }
  

  // ── Code form submission ──────────────────────────────────────────────────
  codeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = (codeInput.value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (val === PASSWORD) {
      codeError.classList.remove('show');
      runUnlockSequence();
    } else {
      codeError.classList.add('show');
      codeInput.value = '';
      codeInput.focus();
      // Shake the input
      codeInput.classList.add('shake');
      setTimeout(function () { codeInput.classList.remove('shake'); }, 500);
    }
  });

  // ── Countdown ─────────────────────────────────────────────────────────────
  var countdownStarted = false;
  function startCountdown() {
    if (countdownStarted) return;
    countdownStarted = true;
    var target = new Date('2026-12-05T10:30:00').getTime();
    function tick() {
      var diff = Math.max(0, target - Date.now());
      document.getElementById('cd-days').textContent  = pad(Math.floor(diff / 86400000));
      document.getElementById('cd-hours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
      document.getElementById('cd-mins').textContent  = pad(Math.floor((diff % 3600000) / 60000));
      document.getElementById('cd-secs').textContent  = pad(Math.floor((diff % 60000) / 1000));
    }
    function pad(n) { return String(n).padStart(2, '0'); }
    tick();
    setInterval(tick, 1000);
  }

  // ── Scroll reveal (first-time visitors) ───────────────────────────────────
  function triggerReveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length || !window.IntersectionObserver) {
      els.forEach(function (el) { el.classList.add('active'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ── Parallax hero ─────────────────────────────────────────────────────────
  window.addEventListener('scroll', function () {
    var heroBg = document.getElementById('heroBg');
    if (heroBg) heroBg.style.transform = 'translateY(' + (window.pageYOffset * 0.38) + 'px)';

    // Scroll-to-top visibility
    if (scrollTop) {
      if (window.pageYOffset > 320) {
        scrollTop.classList.add('visible');
      } else {
        scrollTop.classList.remove('visible');
      }
    }
  }, { passive: true });

  // ── Scroll-to-top button ──────────────────────────────────────────────────
  if (scrollTop) {
    scrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Mobile hamburger menu ─────────────────────────────────────────────────
  if (navBurger && navLinks) {
    navBurger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navBurger.classList.toggle('active', open);
      navBurger.setAttribute('aria-expanded', String(open));
    });

    // Close menu when a link is tapped
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navBurger.classList.remove('active');
        navBurger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── FAQ accordion ────────────────────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(function (item) {
    item.querySelector('.faq-q').addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (o) { o.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── RSVP ─────────────────────────────────────────────────────────────────
  var rsvpForm   = document.getElementById('rsvpForm');
  var rsvpThanks = document.getElementById('rsvpThanks');
  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    rsvpForm.style.display = 'none';
    rsvpThanks.classList.add('show');
  });


  // ── Luxury Particle Engine ────────────────────────────────────────────────
  (function () {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var particles = [];
    var raf = null;
    var emberTimer = 0, petalTimer = 0;

    // Color palette (matches site CSS vars)
    var GOLD      = '#C58A32';
    var GOLD_SOFT = '#D4A35B';
    var EMBER     = '#A94722';
    var CREAM     = '#F3EBDD';
    var PLUM      = '#641C35';

    var emberCols = [GOLD, GOLD_SOFT, EMBER, '#E8B86D', CREAM];
    var bokehCols = [
      'rgba(197,138,50,',   // gold
      'rgba(212,163,91,',   // gold-soft
      'rgba(169,71,34,',    // ember
      'rgba(243,235,221,'   // cream
    ];
    var petalCols = [
      'rgba(100,28,53,',    // plum
      'rgba(169,71,34,',    // ember
      'rgba(197,138,50,'    // gold
    ];

    // ── Resize ──────────────────────────────────────────────────────────────
    function resize() {
      W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // ── Factories ────────────────────────────────────────────────────────────
    function rnd(min, max) { return Math.random() * (max - min) + min; }
    function pick(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }

    function mkEmber() {
      var lifespan = rnd(160, 280);
      return {
        t: 'e',
        x: rnd(0, W),
        y: H + 6,
        vx: rnd(-0.5, 0.5),
        vy: rnd(-1.1, -0.45),
        r: rnd(0.8, 2.8),
        phase: rnd(0, Math.PI * 2),
        phaseSpd: rnd(-0.022, 0.022),
        col: pick(emberCols),
        glow: Math.random() > 0.42,
        maxA: rnd(0.55, 1.0),
        a: 0,
        life: lifespan,
        age: 0
      };
    }

    function mkBokeh() {
      return {
        t: 'b',
        x: rnd(0, W),
        y: rnd(0, H),
        vx: rnd(-0.12, 0.12),
        vy: rnd(-0.08, 0.08),
        r: rnd(28, 80),
        col: pick(bokehCols),
        maxA: rnd(0.025, 0.07),
        a: 0,
        life: rnd(300, 600),
        age: 0
      };
    }

    function mkPetal() {
      return {
        t: 'p',
        x: rnd(-W * 0.05, W * 1.05),
        y: rnd(-40, -10),
        vx: rnd(-0.4, 0.6),
        vy: rnd(0.35, 0.75),
        rx: rnd(5, 11),   // ellipse x-radius
        ry: rnd(2.5, 5),  // ellipse y-radius
        rot: rnd(0, Math.PI * 2),
        rotSpd: rnd(-0.03, 0.03),
        phase: rnd(0, Math.PI * 2),
        phaseSpd: rnd(-0.013, 0.013),
        col: pick(petalCols),
        maxA: rnd(0.08, 0.22),
        a: 0,
        life: rnd(280, 440),
        age: 0
      };
    }

    // ── Seed initial particles (staggered ages so screen fills immediately) ─
    var i;
    for (i = 0; i < 14; i++) {
      var b = mkBokeh();
      b.age = Math.floor(Math.random() * b.life * 0.6);
      b.a   = b.maxA * Math.min(b.age / (b.life * 0.15), 1);
      particles.push(b);
    }
    for (i = 0; i < 40; i++) {
      var e = mkEmber();
      e.y   = rnd(0, H);
      e.age = Math.floor(Math.random() * e.life * 0.75);
      particles.push(e);
    }
    for (i = 0; i < 10; i++) {
      var p = mkPetal();
      p.y   = rnd(0, H);
      p.age = Math.floor(Math.random() * p.life * 0.5);
      particles.push(p);
    }

    // ── Draw helpers ────────────────────────────────────────────────────────
    function drawEmber(p) {
      ctx.save();
      ctx.globalAlpha = p.a;
      if (p.glow) {
        // Soft halo
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, p.col);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Core dot
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBokeh(p) {
      ctx.save();
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0,   p.col + p.a + ')');
      g.addColorStop(0.5, p.col + (p.a * 0.4) + ')');
      g.addColorStop(1,   p.col + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.col + p.a + ')';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Subtle highlight
      ctx.globalAlpha = p.a * 0.25;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(-p.rx * 0.25, -p.ry * 0.2, p.rx * 0.45, p.ry * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── Update returns true if alive ─────────────────────────────────────────
    function update(p) {
      p.age++;
      var prog = p.age / p.life;

      // Universal fade-in / fade-out envelope
      if (prog < 0.18)      { p.a = (prog / 0.18) * p.maxA; }
      else if (prog > 0.72) { p.a = ((1 - prog) / 0.28) * p.maxA; }
      else                  { p.a = p.maxA; }

      if (p.t === 'e') {
        p.phase += p.phaseSpd;
        p.x += p.vx + Math.sin(p.phase) * 0.5;
        p.y += p.vy;
      } else if (p.t === 'b') {
        p.x += p.vx;
        p.y += p.vy;
        // Gentle boundary drift
        if (p.x < -p.r)  p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        if (p.y < -p.r)  p.y = H + p.r;
        if (p.y > H + p.r) p.y = -p.r;
      } else if (p.t === 'p') {
        p.phase += p.phaseSpd;
        p.x += p.vx + Math.sin(p.phase) * 0.35;
        p.y += p.vy;
        p.rot += p.rotSpd;
      }

      return p.age < p.life;
    }

    // ── Main loop ───────────────────────────────────────────────────────────
    function loop() {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);

      // Spawn new particles on timers
      emberTimer++;
      petalTimer++;
      if (emberTimer >= 6)  { particles.push(mkEmber()); emberTimer = 0; }
      if (petalTimer >= 55) { particles.push(mkPetal()); petalTimer = 0; }
      // Keep bokeh count stable
      var bokehCount = 0;
      for (var k = 0; k < particles.length; k++) { if (particles[k].t === 'b') bokehCount++; }
      if (bokehCount < 14) particles.push(mkBokeh());

      // Draw in layers: bokeh → petals → embers
      var live = [];
      var bokeh = [], petals = [], embers = [];
      for (var j = 0; j < particles.length; j++) {
        var q = particles[j];
        if (q.t === 'b') bokeh.push(q);
        else if (q.t === 'p') petals.push(q);
        else embers.push(q);
      }

      for (var a = 0; a < bokeh.length;  a++) drawBokeh(bokeh[a]);
      for (var b = 0; b < petals.length; b++) drawPetal(petals[b]);
      for (var c = 0; c < embers.length; c++) drawEmber(embers[c]);

      // Update & cull dead particles
      particles = particles.filter(update);
    }

    loop();

    // Stop the RAF when the gate closes (saves battery on mobile)
    var gateEl = document.getElementById('gate');
    if (gateEl) {
      var mo = new MutationObserver(function () {
        if (gateEl.classList.contains('hidden')) {
          cancelAnimationFrame(raf);
          mo.disconnect();
        }
      });
      mo.observe(gateEl, { attributes: true, attributeFilter: ['class'] });
    }
  }());

})();
