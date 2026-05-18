/* RoleMade — minimal JS (vanilla, no deps) */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ----- Nav scrolled state -----
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile drawer -----
  const drawer = $('.drawer');
  const scrim = $('.drawer-scrim');
  const openDrawer = () => {
    drawer.classList.add('open');
    scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
    document.body.style.overflow = '';
  };
  $('.nav-burger')?.addEventListener('click', openDrawer);
  $('.drawer-close')?.addEventListener('click', closeDrawer);
  scrim?.addEventListener('click', closeDrawer);
  $$('.drawer-link, .drawer-cta a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (drawer?.classList.contains('open')) closeDrawer();
      const t = $('.tweaks');
      if (t?.classList.contains('open')) t.classList.remove('open');
    }
  });

  // ----- Accordion: tasks + objections -----
  const wireAccordion = (rowSel) => {
    $$(rowSel).forEach(row => {
      const head = row.querySelector('[data-accordion-head]') || row;
      head.addEventListener('click', () => row.classList.toggle('open'));
    });
  };
  wireAccordion('.task-row');
  wireAccordion('.obj');

  // ----- Reveal observer -----
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        // free up will-change / paint promotion after the animation
        setTimeout(() => {
          e.target.style.willChange = 'auto';
          e.target.style.transition = 'none';
        }, 900);
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  $$('[data-reveal]').forEach((el, i) => {
    if (!el.style.getPropertyValue('--reveal-delay')) {
      el.style.setProperty('--reveal-delay', Math.min(i % 6 * 60, 360) + 'ms');
    }
    io.observe(el);
  });

  // ----- Hero rotation: role / task -----
  const pairs = [
    { role: 'paralegal',    task: 'drafting briefs' },
    { role: 'bookkeeper',   task: 'monthly close' },
    { role: 'project lead', task: 'tracking jobs' },
    { role: 'front desk',   task: 'intake forms' },
    { role: 'dispatcher',   task: 'routing crews' }
  ];
  const roleEl = $('[data-rotate="role"]');
  const taskEl = $('[data-rotate="task"]');
  if (roleEl && taskEl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let i = 0;
    const FADE = 320;
    const INTERVAL = 3400;
    const swap = () => {
      if (document.hidden) return;
      i = (i + 1) % pairs.length;
      const next = pairs[i];
      // exit: slide up + fade out
      roleEl.classList.add('out');
      taskEl.classList.add('out');
      setTimeout(() => {
        roleEl.textContent = next.role;
        taskEl.textContent = next.task;
        // enter: jump to "in" state (below + transparent), then transition to neutral
        roleEl.classList.remove('out');
        taskEl.classList.remove('out');
        roleEl.classList.add('in');
        taskEl.classList.add('in');
        // force reflow so the transition runs
        void roleEl.offsetWidth;
        roleEl.classList.remove('in');
        taskEl.classList.remove('in');
      }, FADE);
    };
    let timer = setInterval(swap, INTERVAL);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(timer);
        timer = null;
      } else if (!timer) {
        timer = setInterval(swap, INTERVAL);
      }
    });
  }

  // ----- Hero diagnosis: cycle phases -----
  const diag = $('#diag');
  if (diag) {
    const phases = [
      {
        stage: 'BEFORE',
        time: '~ 90 min',
        rows: [
          ['pull material costs', '88%'],
          ['cross-check labor & rates', '64%'],
          ['apply markups + contingency', '78%'],
          ['format pdf, double-check', '54%'],
          ['attach + email client', '70%']
        ]
      },
      {
        stage: 'AFTER',
        time: '~ 4 min',
        rows: [
          ['project scope & materials', '100%'],
          ['labor + timeline breakdown', '100%'],
          ['total with payment terms', '100%'],
          ['client-ready pdf', '100%']
        ]
      }
    ];
    const stageEl = diag.querySelector('.stage');
    const timeEl  = diag.querySelector('.time');
    const bodyEl  = diag.querySelector('.diag-body');
    let i = 0;
    const render = () => {
      const p = phases[i];
      stageEl.textContent = p.stage;
      timeEl.textContent  = p.time;
      bodyEl.innerHTML = p.rows.map(([label, w], idx) => `
        <div class="diag-row" style="animation-delay:${idx * 90}ms">
          <span class="label">${label}</span>
          <span class="meter"><i style="--w:${w};animation-delay:${idx * 90 + 200}ms"></i></span>
        </div>
      `).join('');
    };
    render();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(() => {
        i = (i + 1) % phases.length;
        render();
      }, 5200);
    }
  }

  // ----- Smooth scroll for in-page links -----
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = $(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ============================================================
  // TWEAKS PANEL — exposed via host toolbar
  // ============================================================
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#F59E0B",
    "accentBright": "#FCD34D",
    "density": "comfy",
    "grain": true
  }/*EDITMODE-END*/;

  const ACCENT_PRESETS = {
    "#F59E0B": { bright: "#FCD34D", glow: "rgba(245,158,11,0.5)", soft: "rgba(245,158,11,0.08)" },
    "#E26B3A": { bright: "#F2A06C", glow: "rgba(226,107,58,0.5)",  soft: "rgba(226,107,58,0.08)" },
    "#A78BFA": { bright: "#C4B5FD", glow: "rgba(167,139,250,0.5)", soft: "rgba(167,139,250,0.08)" },
    "#34D399": { bright: "#6EE7B7", glow: "rgba(52,211,153,0.5)",  soft: "rgba(52,211,153,0.08)" },
    "#00C8D8": { bright: "#67E8F2", glow: "rgba(0,200,216,0.5)",   soft: "rgba(0,200,216,0.08)" }
  };

  const state = { ...TWEAK_DEFAULTS };

  const applyState = () => {
    const root = document.documentElement;
    const p = ACCENT_PRESETS[state.accent] || ACCENT_PRESETS["#F59E0B"];
    root.style.setProperty('--amber', state.accent);
    root.style.setProperty('--amber-bright', p.bright);
    root.style.setProperty('--amber-glow', p.glow);
    root.style.setProperty('--amber-soft', p.soft);
    root.style.setProperty('--r-3', state.density === 'tight' ? '8px' : '12px');
    document.body.style.fontSize = state.density === 'tight' ? '15px' : '16px';
    const grain = $('.grain');
    if (grain) grain.style.display = state.grain ? '' : 'none';
  };

  const tweaks = $('#tweaks');
  const buildTweaks = () => {
    tweaks.innerHTML = `
      <div class="tweaks-title">
        <span>Tweaks</span>
        <button id="tweaks-close" aria-label="Close">×</button>
      </div>
      <div class="tweaks-row">
        <div class="tweaks-label">Accent</div>
        <div class="swatch-row" id="swatch-row">
          ${Object.keys(ACCENT_PRESETS).map(c =>
            `<button class="swatch ${c === state.accent ? 'active' : ''}"
              data-accent="${c}" style="background:${c}" aria-label="Accent ${c}"></button>`
          ).join('')}
        </div>
      </div>
      <div class="tweaks-row">
        <div class="tweaks-label">Density</div>
        <div class="seg">
          <button class="${state.density === 'comfy' ? 'active' : ''}" data-density="comfy">Comfy</button>
          <button class="${state.density === 'tight' ? 'active' : ''}" data-density="tight">Tight</button>
        </div>
      </div>
      <div class="tweaks-row">
        <div class="tweaks-label">Texture</div>
        <div class="seg">
          <button class="${state.grain ? 'active' : ''}" data-grain="true">Grain</button>
          <button class="${!state.grain ? 'active' : ''}" data-grain="false">Clean</button>
        </div>
      </div>
    `;
    $('#tweaks-close').onclick = () => {
      tweaks.classList.remove('open');
      try { window.parent.postMessage({type: '__edit_mode_dismissed'}, '*'); } catch(_) {}
    };
    $$('.swatch', tweaks).forEach(s => {
      s.onclick = () => {
        state.accent = s.dataset.accent;
        applyState();
        $$('.swatch', tweaks).forEach(x => x.classList.toggle('active', x === s));
        persist({ accent: state.accent });
      };
    });
    $$('[data-density]', tweaks).forEach(b => {
      b.onclick = () => {
        state.density = b.dataset.density;
        applyState();
        $$('[data-density]', tweaks).forEach(x => x.classList.toggle('active', x === b));
        persist({ density: state.density });
      };
    });
    $$('[data-grain]', tweaks).forEach(b => {
      b.onclick = () => {
        state.grain = b.dataset.grain === 'true';
        applyState();
        $$('[data-grain]', tweaks).forEach(x => x.classList.toggle('active', x === b));
        persist({ grain: state.grain });
      };
    });
  };

  const persist = (edits) => {
    try { window.parent.postMessage({type: '__edit_mode_set_keys', edits}, '*'); } catch(_) {}
  };

  // Listener BEFORE we announce availability
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode') {
      buildTweaks();
      tweaks.classList.add('open');
    } else if (d.type === '__deactivate_edit_mode') {
      tweaks.classList.remove('open');
    }
  });

  applyState();
  try { window.parent.postMessage({type: '__edit_mode_available'}, '*'); } catch(_) {}

  // ----- Year in footer -----
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  // ----- Page visibility — pause animations when hidden (perf) -----
  document.addEventListener('visibilitychange', () => {
    document.body.style.animationPlayState = document.hidden ? 'paused' : '';
  });
})();
