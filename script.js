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

  // ── Returning visitor: skip gate ──────────────────────────────────────────
  try {
    if (
      localStorage.getItem('bk-invite-unlocked') === 'yes' &&
      gate &&
      body
    ) {
      gate.style.display = 'none';
      body.classList.remove('locked');

      if (nav) {
        nav.classList.add('nav-visible');
      }

      startCountdown();

      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('active');
      });
    }
  } catch (e) {
    // localStorage may be unavailable in some browsers
  }

  // ── Envelope 3D parallax ──────────────────────────────────────────────────
  (function () {
    if (!envelope || !window.matchMedia) return;

    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var raf = null;
    var tiltActive = true;

    function onMove(e) {
      if (!tiltActive) return;

      var w = window.innerWidth;
      var h = window.innerHeight;

      targetX = (e.clientX / w) * 2 - 1;
      targetY = (e.clientY / h) * 2 - 1;
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    function tick() {
      raf = requestAnimationFrame(tick);

      if (!tiltActive) return;

      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;

      envelope.style.transform =
        'rotateY(' +
        (curX * 9).toFixed(2) +
        'deg) rotateX(' +
        (-curY * 7).toFixed(2) +
        'deg)';
    }

    tick();

    var stopObserver = new MutationObserver(function () {
      if (envelope.classList.contains('open')) {
        tiltActive = false;

        window.removeEventListener('mousemove', onMove);

        if (raf) {
          cancelAnimationFrame(raf);
        }

        envelope.style.transform = 'rotateY(0deg) rotateX(0deg)';
        stopObserver.disconnect();
      }
    });

    stopObserver.observe(envelope, {
      attributes: true,
      attributeFilter: ['class']
    });
  })();

  // ── Wax seal sparkles ─────────────────────────────────────────────────────
  function spawnSealSparkles() {
    if (!envelope) return;

    var flash = document.createElement('span');
    flash.className = 'seal-flash';

    envelope.appendChild(flash);

    setTimeout(function () {
      if (flash && flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }, 700);

    var count = 18;

    for (var i = 0; i < count; i++) {
      var sparkle = document.createElement('span');

      sparkle.className =
        'seal-sparkle' + (i % 3 === 0 ? ' star' : '');

      var angle =
        (Math.PI * 2 * i) / count +
        (Math.random() * 0.4 - 0.2);

      var distance = 42 + Math.random() * 54;

      var tx = Math.cos(angle) * distance;
      var ty = Math.sin(angle) * distance * 0.75 - 10;
      var scale = (0.6 + Math.random() * 0.9).toFixed(2);

      sparkle.style.setProperty('--tx', tx.toFixed(1) + 'px');
      sparkle.style.setProperty('--ty', ty.toFixed(1) + 'px');
      sparkle.style.setProperty('--s', scale);

      sparkle.style.animationDelay =
        (Math.random() * 0.09).toFixed(2) + 's';

      envelope.appendChild(sparkle);

      (function (element) {
        setTimeout(function () {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }, 1300);
      })(sparkle);
    }
  }

  // ── Cinematic opening sequence ────────────────────────────────────────────

function ensureScrollNavigator() {
    var hero = document.getElementById('welcome');

    if (
        !hero ||
        document.getElementById('scrollNavigator')
    ) {
        return;
    }

    var button = document.createElement('button');

    button.id = 'scrollNavigator';
    button.className = 'scroll-navigator';
    button.type = 'button';

    button.setAttribute(
        'aria-label',
        'Scroll down to wedding details'
    );

    button.innerHTML =
        '<span class="scroll-navigator-label">Scroll down</span>' +
        '<span class="scroll-navigator-arrows" aria-hidden="true"></span>';

    hero.appendChild(button);

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            button.classList.add('visible');
        });
    });

    button.addEventListener('click', function () {
        var nextSection =
            document.getElementById('schedule');

        if (nextSection) {
            nextSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}


/*
   Keep the invitation-code box inside the phone's
   visible viewport when the on-screen keyboard opens.
*/

function positionGateAuthForMobile() {
    if (
        !gateAuth ||
        !window.matchMedia ||
        !window.matchMedia('(max-width: 600px)').matches
    ) {
        return;
    }

    var viewport = window.visualViewport;

    var height =
        viewport
            ? viewport.height
            : window.innerHeight;

    var offsetTop =
        viewport
            ? viewport.offsetTop
            : 0;

    /*
       Place it at roughly 70% of the currently visible
       phone area instead of the full document height.
    */

    var target =
        offsetTop +
        Math.min(
            height * 0.70,
            height - 82
        );

    target =
        Math.max(
            205,
            target
        );

    gateAuth.style.setProperty(
        '--auth-top',
        target + 'px'
    );
}


if (window.visualViewport) {

    window.visualViewport.addEventListener(
        'resize',
        function () {
            if (
                gate &&
                gate.classList.contains('auth-open')
            ) {
                positionGateAuthForMobile();
            }
        }
    );

    window.visualViewport.addEventListener(
        'scroll',
        function () {
            if (
                gate &&
                gate.classList.contains('auth-open')
            ) {
                positionGateAuthForMobile();
            }
        }
    );
}


/*
   Returning visitor:
   if the gate was skipped using localStorage,
   still provide the scroll-down navigator.
*/

window.addEventListener('load', function () {

    if (
        body &&
        !body.classList.contains('locked')
    ) {
        ensureScrollNavigator();
    }
});


function runUnlockSequence() {

    try {
        localStorage.setItem(
            'bk-invite-unlocked',
            'yes'
        );
    } catch (e) {
        /* localStorage unavailable */
    }


    if (envWrap) {
        envWrap.classList.add('opening');
    }


    /*
       Hide the invitation-code form.
    */

    if (gateAuth) {

        gateAuth.style.transition =
            'opacity 0.45s ease, transform 0.45s ease';

        gateAuth.style.opacity = '0';

        gateAuth.style.pointerEvents = 'none';
    }


    if (gate) {
        gate.classList.remove('auth-open');
    }


    /*
       Remove the partial/code-entry state.
    */

    if (envelope) {
        envelope.classList.remove('code-stage');
    }


    /*
       PHASE 1:
       Release / illuminate the seal.
    */

    var seal =
        document.getElementById('waxSeal');

    if (seal) {
        seal.classList.add('cracking');
    }

    spawnSealSparkles();


    /*
       PHASE 2:
       Only the TOP envelope flap opens.
       Side and bottom folds remain untouched.
    */

    setTimeout(function () {

        if (envelope) {
            envelope.classList.add('top-open');
        }

    }, 180);


    /*
       PHASE 3:
       Once the upper flap is open,
       create the golden light bloom.
    */

    setTimeout(function () {

        if (envelope) {
            envelope.classList.add('light-reveal');
        }

        if (gate) {
            gate.classList.add('light-stage');
        }

    }, 1500);


    /*
       PHASE 4:
       Reveal the invitation only AFTER
       the final light effect.
    */

    setTimeout(function () {

        if (envelope) {
            envelope.classList.add('open');
        }

    }, 2180);


    /*
       Give the invitation a moment to appear,
       then transition into your EXISTING website.
    */

    setTimeout(function () {

        if (gateContent) {
            gateContent.classList.add('fade-out');
        }

    }, 3550);


    setTimeout(function () {

        if (gate) {
            gate.classList.add('hidden');
        }

        if (body) {
            body.classList.remove('locked');
        }


        if (nav) {

            setTimeout(function () {
                nav.classList.add('nav-visible');
            }, 350);

        }


        startCountdown();

        triggerReveals();

        ensureScrollNavigator();

    }, 4200);
}


// ── Wax seal click ────────────────────────────────────────────────────────

var waxSeal =
    document.getElementById('waxSeal');


if (waxSeal) {

    waxSeal.addEventListener(
        'click',
        function () {

            if (
                !envWrap ||
                envWrap.classList.contains('opening') ||
                !codeInput
            ) {
                return;
            }


            /*
               Reference-video adaptation:
               seal activates + upper flap lifts slightly,
               but the invitation remains closed.
            */

            if (gate) {
                gate.classList.add('auth-open');
            }

            if (envelope) {
                envelope.classList.add('code-stage');
            }


            positionGateAuthForMobile();


            /*
               On phones, first bring the textbox into the
               visible viewport, THEN open the keyboard.
            */

            setTimeout(function () {

                positionGateAuthForMobile();

                if (gateAuth) {

                    try {
                        gateAuth.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    } catch (e) {
                        /* Older browser */
                    }
                }

                setTimeout(function () {

                    try {
                        codeInput.focus();
                    } catch (e) {
                        /* Ignore */
                    }

                    positionGateAuthForMobile();

                }, 180);

            }, 220);
        }
    );
}

  // ── Invitation code form ──────────────────────────────────────────────────
  if (codeForm && codeInput && codeError) {
    codeForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var value = (codeInput.value || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '');

      if (value === PASSWORD) {
        codeError.classList.remove('show');
        runUnlockSequence();
      } else {
        codeError.classList.add('show');

        codeInput.value = '';
        codeInput.focus();

        codeInput.classList.add('shake');

        setTimeout(function () {
          codeInput.classList.remove('shake');
        }, 500);
      }
    });
  }

  // ── Countdown ─────────────────────────────────────────────────────────────
  var countdownStarted = false;

  function startCountdown() {
    if (countdownStarted) return;

    countdownStarted = true;

    var target =
      new Date('2026-12-05T10:30:00').getTime();

    function pad(number) {
      return String(number).padStart(2, '0');
    }

    function tick() {
      var difference =
        Math.max(0, target - Date.now());

      var days =
        Math.floor(difference / 86400000);

      var hours =
        Math.floor(
          (difference % 86400000) / 3600000
        );

      var minutes =
        Math.floor(
          (difference % 3600000) / 60000
        );

      var seconds =
        Math.floor(
          (difference % 60000) / 1000
        );

      var daysEl =
        document.getElementById('cd-days');

      var hoursEl =
        document.getElementById('cd-hours');

      var minsEl =
        document.getElementById('cd-mins');

      var secsEl =
        document.getElementById('cd-secs');

      if (daysEl) {
        daysEl.textContent = pad(days);
      }

      if (hoursEl) {
        hoursEl.textContent = pad(hours);
      }

      if (minsEl) {
        minsEl.textContent = pad(minutes);
      }

      if (secsEl) {
        secsEl.textContent = pad(seconds);
      }
    }

    tick();

    setInterval(tick, 1000);
  }

  // ── Scroll reveal ─────────────────────────────────────────────────────────
  function triggerReveals() {
    var elements =
      document.querySelectorAll('.reveal');

    if (!elements.length) return;

    if (!window.IntersectionObserver) {
      elements.forEach(function (element) {
        element.classList.add('active');
      });

      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.06,
          rootMargin: '0px 0px -30px 0px'
        }
      );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  // ── Hero parallax + scroll-to-top button ──────────────────────────────────
  window.addEventListener(
    'scroll',
    function () {
      var heroBg =
        document.getElementById('heroBg');

      if (heroBg) {
        heroBg.style.transform =
          'translateY(' +
          window.pageYOffset * 0.38 +
          'px)';
      }

      if (scrollTop) {
        if (window.pageYOffset > 320) {
          scrollTop.classList.add('visible');
        } else {
          scrollTop.classList.remove('visible');
        }
      }
    },
    { passive: true }
  );

  if (scrollTop) {
    scrollTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ── Mobile navigation ─────────────────────────────────────────────────────
  if (navBurger && navLinks) {
    navBurger.addEventListener('click', function () {
      var open =
        navLinks.classList.toggle('open');

      navBurger.classList.toggle(
        'active',
        open
      );

      navBurger.setAttribute(
        'aria-expanded',
        String(open)
      );
    });

    navLinks
      .querySelectorAll('a')
      .forEach(function (link) {
        link.addEventListener(
          'click',
          function () {
            navLinks.classList.remove('open');
            navBurger.classList.remove('active');

            navBurger.setAttribute(
              'aria-expanded',
              'false'
            );
          }
        );
      });
  }

  // ── FAQ accordion ─────────────────────────────────────────────────────────
  document
    .querySelectorAll('.faq-item')
    .forEach(function (item) {

      var question =
        item.querySelector('.faq-q');

      if (!question) return;

      question.addEventListener(
        'click',
        function () {

          var isOpen =
            item.classList.contains('open');

          document
            .querySelectorAll('.faq-item')
            .forEach(function (otherItem) {
              otherItem.classList.remove('open');
            });

          if (!isOpen) {
            item.classList.add('open');
          }
        }
      );
    });

  // ── RSVP ──────────────────────────────────────────────────────────────────
  var rsvpForm =
    document.getElementById('rsvpForm');

  var rsvpThanks =
    document.getElementById('rsvpThanks');

  if (rsvpForm && rsvpThanks) {
    rsvpForm.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();

        rsvpForm.style.display = 'none';
        rsvpThanks.classList.add('show');
      }
    );
  }

  // ── Gate particle engine ──────────────────────────────────────────────────
  (function () {
    var canvas =
      document.getElementById('particleCanvas');

    if (!canvas || !canvas.getContext) {
      return;
    }

    var ctx = canvas.getContext('2d');

    var W = 0;
    var H = 0;

    var particles = [];
    var raf = null;

    var emberTimer = 0;
    var petalTimer = 0;

    var GOLD = '#C58A32';
    var GOLD_SOFT = '#D4A35B';
    var EMBER = '#A94722';
    var CREAM = '#F3EBDD';

    var emberColors = [
      GOLD,
      GOLD_SOFT,
      EMBER,
      '#E8B86D',
      CREAM
    ];

    var bokehColors = [
      'rgba(197,138,50,',
      'rgba(212,163,91,',
      'rgba(169,71,34,',
      'rgba(243,235,221,'
    ];

    var petalColors = [
      'rgba(100,28,53,',
      'rgba(169,71,34,',
      'rgba(197,138,50,'
    ];

    function resize() {
      W =
        canvas.width =
        canvas.offsetWidth ||
        window.innerWidth;

      H =
        canvas.height =
        canvas.offsetHeight ||
        window.innerHeight;
    }

    window.addEventListener(
      'resize',
      resize,
      { passive: true }
    );

    resize();

    function random(min, max) {
      return (
        Math.random() *
        (max - min) +
        min
      );
    }

    function pick(array) {
      return array[
        Math.floor(
          Math.random() *
          array.length
        )
      ];
    }

    function createEmber() {
      return {
        type: 'ember',

        x: random(0, W),
        y: H + 6,

        vx: random(-0.5, 0.5),
        vy: random(-1.1, -0.45),

        radius: random(0.8, 2.8),

        phase: random(
          0,
          Math.PI * 2
        ),

        phaseSpeed:
          random(-0.022, 0.022),

        color:
          pick(emberColors),

        glow:
          Math.random() > 0.42,

        maxAlpha:
          random(0.55, 1),

        alpha: 0,

        life:
          random(160, 280),

        age: 0
      };
    }

    function createBokeh() {
      return {
        type: 'bokeh',

        x: random(0, W),
        y: random(0, H),

        vx:
          random(-0.12, 0.12),

        vy:
          random(-0.08, 0.08),

        radius:
          random(28, 80),

        color:
          pick(bokehColors),

        maxAlpha:
          random(0.025, 0.07),

        alpha: 0,

        life:
          random(300, 600),

        age: 0
      };
    }

    function createPetal() {
      return {
        type: 'petal',

        x:
          random(
            -W * 0.05,
            W * 1.05
          ),

        y:
          random(-40, -10),

        vx:
          random(-0.4, 0.6),

        vy:
          random(0.35, 0.75),

        radiusX:
          random(5, 11),

        radiusY:
          random(2.5, 5),

        rotation:
          random(
            0,
            Math.PI * 2
          ),

        rotationSpeed:
          random(-0.03, 0.03),

        phase:
          random(
            0,
            Math.PI * 2
          ),

        phaseSpeed:
          random(-0.013, 0.013),

        color:
          pick(petalColors),

        maxAlpha:
          random(0.08, 0.22),

        alpha: 0,

        life:
          random(280, 440),

        age: 0
      };
    }

    // Initial bokeh
    for (var i = 0; i < 14; i++) {
      var bokeh = createBokeh();

      bokeh.age =
        Math.floor(
          Math.random() *
          bokeh.life *
          0.6
        );

      bokeh.alpha =
        bokeh.maxAlpha *
        Math.min(
          bokeh.age /
          (bokeh.life * 0.15),
          1
        );

      particles.push(bokeh);
    }

    // Initial embers
    for (i = 0; i < 40; i++) {
      var ember = createEmber();

      ember.y =
        random(0, H);

      ember.age =
        Math.floor(
          Math.random() *
          ember.life *
          0.75
        );

      particles.push(ember);
    }

    // Initial petals
    for (i = 0; i < 10; i++) {
      var petal = createPetal();

      petal.y =
        random(0, H);

      petal.age =
        Math.floor(
          Math.random() *
          petal.life *
          0.5
        );

      particles.push(petal);
    }

    function drawEmber(particle) {
      ctx.save();

      ctx.globalAlpha =
        particle.alpha;

      if (particle.glow) {
        var glow =
          ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.radius * 5
          );

        glow.addColorStop(
          0,
          particle.color
        );

        glow.addColorStop(
          1,
          'transparent'
        );

        ctx.fillStyle = glow;

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius * 5,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      ctx.fillStyle =
        particle.color;

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }

    function drawBokeh(particle) {
      ctx.save();

      var gradient =
        ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );

      gradient.addColorStop(
        0,
        particle.color +
        particle.alpha +
        ')'
      );

      gradient.addColorStop(
        0.5,
        particle.color +
        particle.alpha * 0.4 +
        ')'
      );

      gradient.addColorStop(
        1,
        particle.color +
        '0)'
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }

    function drawPetal(particle) {
      ctx.save();

      ctx.translate(
        particle.x,
        particle.y
      );

      ctx.rotate(
        particle.rotation
      );

      ctx.globalAlpha =
        particle.alpha;

      ctx.fillStyle =
        particle.color +
        particle.alpha +
        ')';

      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        particle.radiusX,
        particle.radiusY,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }

    function updateParticle(particle) {
      particle.age++;

      var progress =
        particle.age /
        particle.life;

      if (progress < 0.18) {
        particle.alpha =
          (progress / 0.18) *
          particle.maxAlpha;
      } else if (progress > 0.72) {
        particle.alpha =
          ((1 - progress) / 0.28) *
          particle.maxAlpha;
      } else {
        particle.alpha =
          particle.maxAlpha;
      }

      if (particle.type === 'ember') {
        particle.phase +=
          particle.phaseSpeed;

        particle.x +=
          particle.vx +
          Math.sin(
            particle.phase
          ) *
          0.5;

        particle.y +=
          particle.vy;
      }

      if (particle.type === 'bokeh') {
        particle.x +=
          particle.vx;

        particle.y +=
          particle.vy;

        if (
          particle.x <
          -particle.radius
        ) {
          particle.x =
            W + particle.radius;
        }

        if (
          particle.x >
          W + particle.radius
        ) {
          particle.x =
            -particle.radius;
        }

        if (
          particle.y <
          -particle.radius
        ) {
          particle.y =
            H + particle.radius;
        }

        if (
          particle.y >
          H + particle.radius
        ) {
          particle.y =
            -particle.radius;
        }
      }

      if (particle.type === 'petal') {
        particle.phase +=
          particle.phaseSpeed;

        particle.x +=
          particle.vx +
          Math.sin(
            particle.phase
          ) *
          0.35;

        particle.y +=
          particle.vy;

        particle.rotation +=
          particle.rotationSpeed;
      }

      return (
        particle.age <
        particle.life
      );
    }

    function loop() {
      raf =
        requestAnimationFrame(loop);

      ctx.clearRect(
        0,
        0,
        W,
        H
      );

      emberTimer++;
      petalTimer++;

      if (emberTimer >= 6) {
        particles.push(
          createEmber()
        );

        emberTimer = 0;
      }

      if (petalTimer >= 55) {
        particles.push(
          createPetal()
        );

        petalTimer = 0;
      }

      var bokehCount = 0;

      for (
        var j = 0;
        j < particles.length;
        j++
      ) {
        if (
          particles[j].type ===
          'bokeh'
        ) {
          bokehCount++;
        }
      }

      if (bokehCount < 14) {
        particles.push(
          createBokeh()
        );
      }

      for (
        var k = 0;
        k < particles.length;
        k++
      ) {
        var particle =
          particles[k];

        if (
          particle.type ===
          'bokeh'
        ) {
          drawBokeh(particle);
        }
      }

      for (
        k = 0;
        k < particles.length;
        k++
      ) {
        particle =
          particles[k];

        if (
          particle.type ===
          'petal'
        ) {
          drawPetal(particle);
        }
      }

      for (
        k = 0;
        k < particles.length;
        k++
      ) {
        particle =
          particles[k];

        if (
          particle.type ===
          'ember'
        ) {
          drawEmber(particle);
        }
      }

      particles =
        particles.filter(
          updateParticle
        );
    }

    loop();

    // Stop particles once gate disappears
    if (gate) {
      var gateObserver =
        new MutationObserver(
          function () {
            if (
              gate.classList.contains(
                'hidden'
              )
            ) {
              if (raf) {
                cancelAnimationFrame(
                  raf
                );
              }

              gateObserver.disconnect();
            }
          }
        );

      gateObserver.observe(
        gate,
        {
          attributes: true,
          attributeFilter: ['class']
        }
      );
    }
  })();

})();