(function () {
  'use strict';

  var PASSWORD = 'BK123';

  // ── DOM refs ──────────────────────────────────────────────────────────────
  var body        = document.body;
  var gate        = document.getElementById('gate');
  var gateContent = document.getElementById('gateContent');
  var gateAuth    = document.getElementById('gateAuth');
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
      gate.classList.add('hidden');
      body.classList.remove('locked');
      nav.classList.add('nav-visible');
      startCountdown();
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('active');
      });
    }
  } catch (e) {}

  // ── Envelope unlock sequence ──────────────────────────────────────────────
  function runUnlockSequence() {
    try { localStorage.setItem('bk-invite-unlocked', 'yes'); } catch (e) {}

    // Hide auth immediately
    gateAuth.style.transition = 'opacity 0.4s ease';
    gateAuth.style.opacity    = '0';
    gateAuth.style.pointerEvents = 'none';

    // Trigger envelope open
    envelope.classList.add('open');

    setTimeout(function () {
      // Fade out entire gate
      gateContent.classList.add('fade-out');
      setTimeout(function () {
        gate.classList.add('hidden');
        body.classList.remove('locked');
        setTimeout(function () { nav.classList.add('nav-visible'); }, 600);
        startCountdown();
        triggerReveals();
      }, 900);
    }, 1800);
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

})();
