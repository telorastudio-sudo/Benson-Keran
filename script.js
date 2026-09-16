(function(){
  const PASSWORD = "BK120526";
  const body = document.body;
  const gate = document.getElementById('gate');
  const openBtn = document.getElementById('openBtn');
  const codeForm = document.getElementById('codeForm');
  const codeInput = document.getElementById('codeInput');
  const codeError = document.getElementById('codeError');
  const nav = document.getElementById('siteNav');

  const gateContent = document.getElementById('gateContent');
  const envelope = document.getElementById('envelope');
  const cinematic = document.getElementById('cinematic');
  const cine1 = document.getElementById('cine1');
  const cine2 = document.getElementById('cine2');
  const cine3 = document.getElementById('cine3');

  async function runUnlockSequence(remember) {
    if(remember){
      try{ localStorage.setItem('bk-invite-unlocked','yes'); }catch(e){}
    }

    // 1. Open Envelope
    envelope.classList.add('open');
    
    // Wait for card to slide up
    await new Promise(r => setTimeout(r, 1800));
    
    // 2. Fade out gate content
    gateContent.classList.add('fade-out');
    await new Promise(r => setTimeout(r, 800));
    
    // 3. Start Cinematic Sequence
    cinematic.classList.add('active');
    gate.classList.add('hidden'); // hide gate layer
    
    await new Promise(r => setTimeout(r, 800));
    
    // Show line 1
    cine1.classList.add('show');
    await new Promise(r => setTimeout(r, 2200));
    cine1.classList.remove('show');
    await new Promise(r => setTimeout(r, 1000));
    
    // Show line 2
    cine2.classList.add('show');
    await new Promise(r => setTimeout(r, 2200));
    cine2.classList.remove('show');
    await new Promise(r => setTimeout(r, 1000));
    
    // Show line 3
    cine3.classList.add('show');
    await new Promise(r => setTimeout(r, 2200));
    cine3.classList.remove('show');
    await new Promise(r => setTimeout(r, 1200));
    
    // 4. Reveal Website
    cinematic.classList.remove('active');
    body.classList.remove('locked');
    setTimeout(function() { nav.classList.add('nav-visible'); }, 800);
    startCountdown();
    triggerReveals();
  }

  function quickUnlock() {
    gate.classList.add('hidden');
    body.classList.remove('locked');
    nav.classList.add('nav-visible');
    startCountdown();
    triggerReveals();
  }

  try {
    if(localStorage.getItem('bk-invite-unlocked') === 'yes'){ quickUnlock(); }
  } catch(e){}

  

  codeForm.addEventListener('submit', function(e){
    e.preventDefault();
    const val = (codeInput.value || '').trim().toUpperCase().replace(/\s+/g,'');
    if(val === PASSWORD){
      codeError.classList.remove('show');
      runUnlockSequence(true);
    } else {
      codeError.classList.add('show');
    }
  });

  /* ---- Countdown ---- */
  let started = false;
  function startCountdown(){
    if(started) return;
    started = true;
    const target = new Date('2026-12-05T10:30:00').getTime();
    function tick(){
      const now = new Date().getTime();
      let diff = target - now;
      if(diff < 0) diff = 0;
      document.getElementById('cd-days').textContent = String(Math.floor(diff / 86400000)).padStart(2,'0');
      document.getElementById('cd-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
      document.getElementById('cd-mins').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
      document.getElementById('cd-secs').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });

  /* ---- RSVP ---- */
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpThanks = document.getElementById('rsvpThanks');
  rsvpForm.addEventListener('submit', function(e){
    e.preventDefault();
    rsvpForm.style.display = 'none';
    rsvpThanks.classList.add('show');
  });

  /* ---- Scroll Animations ---- */
  function triggerReveals() {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });
  }

  /* ---- Parallax Hero ---- */
  window.addEventListener('scroll', function() {
    var heroBg = document.getElementById('heroBg');
    if (heroBg) {
      heroBg.style.transform = 'translateY(' + (window.pageYOffset * 0.4) + 'px)';
    }
  });

})();