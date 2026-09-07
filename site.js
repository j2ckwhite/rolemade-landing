// RoleMade site behaviours: nav, reveal-on-scroll, pinned journey, calculator, lead form.
(function () {
  var nav = document.querySelector('.nav');
  var onScroll = function () { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.querySelector('.burger');
  var links = document.querySelector('.links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      links.classList.toggle('open');
      burger.textContent = links.classList.contains('open') ? 'Close' : 'Menu';
    });
  }

  // Reveal on scroll
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // Pinned journey: scroll progress through .j-track drives one of 5 states (intro + 4 steps)
  var track = document.querySelector('.j-track');
  if (track) {
    var pin = track.querySelector('.j-pin');
    var states = Array.prototype.slice.call(track.querySelectorAll('.j-state'));
    var prevRows = Array.prototype.slice.call(track.querySelectorAll('.j-prev .jr'));
    var nextRows = Array.prototype.slice.call(track.querySelectorAll('.j-next .jr'));
    var plates = Array.prototype.slice.call(track.querySelectorAll('.stack .plate'));
    var lbls = Array.prototype.slice.call(track.querySelectorAll('.stack [data-for]'));
    var platesG = track.querySelector('.stack .plates');
    var stack = track.querySelector('.stack');
    var prog = track.querySelector('.j-prog');
    var col = track.querySelector('.j-col');
    var shift = [0, 168, 58, -52, -162]; // centers the active plate (intro, then steps 1-4)
    var N = states.length, cur = null;
    var apply = function (idx) {
      if (idx === cur) return; cur = idx;
      var step = idx - 1; // -1 = intro
      states.forEach(function (s, k) { s.classList.toggle('on', k === idx); });
      prevRows.forEach(function (r) { r.classList.toggle('show', Number(r.getAttribute('data-k')) < step); });
      nextRows.forEach(function (r) { r.classList.toggle('show', Number(r.getAttribute('data-k')) > step); });
      var c = step >= 0 ? states[idx].style.getPropertyValue('--c') : '';
      if (stack) stack.style.setProperty('--c', c || 'var(--line-2)');
      if (col) col.style.setProperty('--c', c || 'var(--line-2)');
      plates.forEach(function (p) { var k = Number(p.getAttribute('data-i')); p.classList.toggle('on', k === step); p.classList.toggle('dim', step >= 0 && k !== step); });
      lbls.forEach(function (l) { l.classList.toggle('on', Number(l.getAttribute('data-for')) === step); });
      if (platesG) platesG.setAttribute('transform', 'translate(0 ' + shift[idx] + ')');
    };
    // Progress ring: the active marker sits in one fixed slot. A ring around it fills as you scroll
    // through that step, then the step docks to the top stack and the next one takes the slot.
    var ring = track.querySelector('.j-ring');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targetF = 0, curF = 0, raf = null, settled = true, lastIdx = -2;
    var placeRing = function () {
      if (!ring || !col) return;
      var k = track.querySelector('.j-state.on .k') || track.querySelector('.j-state .k');
      if (!k) return;
      // offset positions ignore the state's slide-in transform, so the ring lands exactly on the marker
      var st = k.parentElement, cen = st.parentElement;
      var y = cen.offsetTop + st.offsetTop + k.offsetTop;
      ring.style.top = y + 'px';
      if (prog) prog.style.height = Math.max(0, y) + 'px';
      ring.classList.add('on');
    };
    var paintF = function (f) { if (ring) ring.style.setProperty('--pf', f.toFixed(4)); };
    var tick = function () {
      var d = targetF - curF;
      if (Math.abs(d) < 0.002) { curF = targetF; paintF(curF); raf = null; settled = true; return; }
      curF += d * 0.18; paintF(curF);
      raf = requestAnimationFrame(tick);
    };
    var place = function (p) {
      var idx = Math.floor(p * N), frac = p * N - idx;
      if (idx !== lastIdx) {
        // handoff: the ring starts empty on the new step (or full when scrolling back into a step)
        curF = idx > lastIdx ? 0 : 1; lastIdx = idx;
        requestAnimationFrame(placeRing);
      }
      targetF = Math.min(1, Math.max(0, frac));
      if (reduce) { curF = targetF; paintF(curF); return; }
      if (settled) { settled = false; raf = requestAnimationFrame(tick); }
    };
    var lastP = -1;
    var onJ = function () {
      var r = track.getBoundingClientRect();
      var range = track.offsetHeight - pin.offsetHeight;
      var p = (-(r.top - 72)) / range; // 72 = sticky nav height
      p = Math.min(0.9999, Math.max(0, p));
      apply(Math.floor(p * N));
      if (p !== lastP) { lastP = p; place(p); }
    };
    var fitBox = function () {
      if (!stack) return;
      if (window.innerWidth <= 900) {
        var box = stack.parentElement, w = box.clientWidth || 1, h = box.clientHeight || 1;
        var vh = 340 * (h / w); // match the window's aspect so y=300 is its exact center
        stack.setAttribute('viewBox', '110 ' + (300 - vh / 2) + ' 340 ' + vh);
      } else {
        stack.setAttribute('viewBox', '-70 0 720 600');
      }
    };
    fitBox(); onJ(); requestAnimationFrame(placeRing);
    window.addEventListener('scroll', onJ, { passive: true });
    window.addEventListener('resize', function () { fitBox(); cur = null; lastP = -1; lastIdx = -2; onJ(); });
  }

  // Avoided-cost calculator
  var hrs = document.getElementById('c-hrs'), rate = document.getElementById('c-rate');
  if (hrs && rate) {
    var out = document.getElementById('c-out');
    var hv = document.getElementById('c-hrs-v');
    var rvv = document.getElementById('c-rate-v');
    var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var upd = function () {
      hv.textContent = hrs.value + ' hrs / wk';
      rvv.textContent = '$' + rate.value + ' / hr';
      out.textContent = fmt(hrs.value * rate.value * 50);
    };
    hrs.addEventListener('input', upd);
    rate.addEventListener('input', upd);
    upd();
  }

  // Lead form. Placeholder submit: swap the TODO for your endpoint, or start the quiz flow here.
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      // TODO: POST `data` to a form endpoint (Formspree, Vercel function, GHL webhook) or launch the quiz.
      console.log('lead', data);
      form.closest('.form').classList.add('sent');
    });
  }
})();
