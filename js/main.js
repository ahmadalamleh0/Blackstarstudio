/* ============================================================
   BLACK STAR STUDIO — MAIN SCRIPT
   ============================================================ */

/* ---- NAV: Frosted scroll state --------------------------- */
const nav = document.getElementById('nav');

function handleNavScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on load in case page is already scrolled


/* ---- SCROLL FADE-IN (Intersection Observer) -------------- */
const fadeTargets = [
  '.hero-visual__media',
  '.signature__header',
  '.signature__main-image',
  '.signature__details',
  '.finish-tech__frame',
  '.finish-tech__text',
  '.services__header',
  '.services__grid',
  /* New sections */
  '.difference__header',
  '.difference__item',
  '.reviews__header',
  '.contact__info',
  '.contact__form-wrap',
  '.studio-image__visual',
  '.studio-image__content',
  '.why-bss__visual',
  '.why-bss__content',
  '.footer__col--brand',
  '.footer__col--menu',
  '.footer__col--services',
];

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll(fadeTargets.join(',')).forEach((el) => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

/* Services grid: stagger children */
const servicesGrid = document.querySelector('.services__grid');
if (servicesGrid) {
  servicesGrid.classList.remove('fade-in');
  servicesGrid.classList.add('fade-in-children');

  const gridObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        gridObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
  );

  gridObserver.observe(servicesGrid);
}


/* ---- SMOOTH ANCHOR SCROLL -------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('nav').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ---- CINEMATIC REVEAL: fade-in + viewport autoplay ------- */
(function () {
  const section = document.querySelector('.reveal');
  if (!section) return;

  // Fade-in each column and the text block
  const fadeEls = [
    section.querySelector('.reveal__col--left'),
    section.querySelector('.reveal__text'),
    section.querySelector('.reveal__col--right'),
  ].filter(Boolean);

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  fadeEls.forEach(el => revealObserver.observe(el));

  // Autoplay when video is in view, pause when not
  const videos = section.querySelectorAll('.reveal__video');

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  videos.forEach(v => videoObserver.observe(v));
})();


/* ---- MATERIAL TRACK: touch drag on mobile ---------------- */
(function () {
  const track = document.getElementById('materials-track');
  if (!track) return;

  // Only active when the CSS animation is off (mobile / reduced motion)
  const isAnimated = () =>
    getComputedStyle(track).animationName !== 'none' &&
    getComputedStyle(track).animationName !== '';

  let startX = 0;
  let scrollStart = 0;

  track.addEventListener('touchstart', (e) => {
    if (isAnimated()) return;
    startX = e.touches[0].clientX;
    scrollStart = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (isAnimated()) return;
    const dx = startX - e.touches[0].clientX;
    track.scrollLeft = scrollStart + dx;
  }, { passive: true });
})();


/* ---- PLACEHOLDER SWAP HELPER (development only) ----------
   Usage example (call from browser console or remove entirely):
   swapPlaceholder('.hero-visual__media', '<img src="assets/images/hero.jpg" alt="Hero">')
   --------------------------------------------------------- */
window.swapPlaceholder = function (selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
};


/* ---- REVIEWS CAROUSEL ------------------------------------ */
(function () {
  const overflow = document.getElementById('reviews-overflow');
  const track    = document.getElementById('reviews-track');
  const dotsWrap = document.getElementById('reviews-dots');
  const prevBtn  = document.getElementById('reviews-prev');
  const nextBtn  = document.getElementById('reviews-next');
  if (!track) return;

  const cards = [...track.querySelectorAll('.review-card')];
  const total = cards.length;
  let current = 0;

  /* Build progress dots */
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'reviews__dot';
    d.setAttribute('aria-label', `Review ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function updateDots() {
    dotsWrap.querySelectorAll('.reviews__dot').forEach((d, i) =>
      d.classList.toggle('reviews__dot--active', i === current)
    );
  }

  function updateActive() {
    cards.forEach((c, i) => c.classList.toggle('review-card--active', i === current));
  }

  function goTo(index) {
    current = ((index % total) + total) % total;
    /* Slide track so active card is centred in the overflow container */
    const gap        = parseFloat(getComputedStyle(track).gap) || 24;
    const cardW      = cards[0].offsetWidth;
    const ovW        = overflow.offsetWidth;
    const offset     = current * (cardW + gap) - (ovW - cardW) / 2;
    track.style.transform = `translateX(${-Math.max(0, offset)}px)`;
    updateActive();
    updateDots();
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  /* Keyboard — only when focus is inside the reviews section */
  document.addEventListener('keydown', e => {
    const stage = document.querySelector('.reviews__stage');
    if (!stage?.contains(document.activeElement)) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* Touch swipe */
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1));
  });

  /* Init */
  goTo(0);

  /* Re-centre on resize */
  window.addEventListener('resize', () => goTo(current), { passive: true });
})();


/* ---- OUR WORK: portfolio slider -------------------------- */
(function () {

  /* ── Build data ─────────────────────────────────────────────
     Fields:
       name           (string|null) — shown above the card; null = hidden
       images         (string[])    — one file = static, multiple = tap-to-cycle
       imageAlt       (string)      — alt text for first image
       imagePosition  (string)      — CSS object-position for all slides
       brandLogo      (string|null) — badge image path (top-left circle)
       colorLabel     (string|null) — shown below the card; null = hidden
       colorClass     (string|null) — CSS modifier e.g. 'silver', 'coffee', 'black'
  ─────────────────────────────────────────────────────────── */
  const BUILDS = [
    {
      name:          'MERCEDES-AMG G63',
      images:        ['G-class(1).jpg', 'G-class(2).jpg', 'G-class(3).jpg'],
      imageAlt:      'Mercedes-AMG G63 — Black Star Studio',
      imagePosition: 'center 40%',
      brandLogo:     null,
      colorLabel:    'METALLIC SILVER',
      colorClass:    'silver',
    },
    {
      name:          null,
      images:        [
        'coffee(1).jpg', 'coffee(2).jpg', 'coffee(3).jpg',
        'coffee(4).jpg', 'coffee(5).jpg', 'coffee(6).jpg',
      ],
      imageAlt:      'Build — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    'COFFEE',
      colorClass:    'coffee',
    },
    {
      name:          'ASTON MARTIN',
      images:        ['Aston(1).jpg', 'Aston(2).jpg', 'Aston(3).jpg', 'Aston(4).jpg'],
      imageAlt:      'Aston Martin — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    null,
      colorClass:    null,
    },
    {
      name:          'ROLLS-ROYCE PHANTOM',
      images:        ['phantom(1).jpg', 'phantom(2).jpg', 'phantom(3).jpg', 'phantom(4).jpg'],
      imageAlt:      'Rolls-Royce Phantom — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    null,
      colorClass:    null,
    },
    {
      name:          'BMW X6',
      images:        ['x6(2).jpg', 'x6(1).jpg'],
      imageAlt:      'BMW X6 — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    null,
      colorClass:    null,
    },
    {
      name:          'MASERATI',
      images:        ['massarati(1).jpg', 'massarati(2).jpg', 'massarati(3).jpg'],
      imageAlt:      'Maserati — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    null,
      colorClass:    null,
    },
  ];

  /* ── Render items ─────────────────────────────────────── */
  const track = document.getElementById('ow-track');
  if (!track) return;

  BUILDS.forEach((b) => {
    const item = document.createElement('div');
    item.className = 'build-item';

    const multi = b.images.length > 1;

    const badge = b.brandLogo
      ? `<div class="build-card__badge"><img src="${b.brandLogo}" alt=""></div>`
      : '';

    const slidesHtml = b.images.map((src, i) =>
      `<img src="${src}"
            alt="${i === 0 ? b.imageAlt : ''}"
            class="build-card__image${i === 0 ? ' is-active' : ''}"
            style="object-position:${b.imagePosition}"
            loading="${i === 0 ? 'eager' : 'lazy'}">`
    ).join('');

    const dotsHtml = multi
      ? `<div class="build-card__dots" aria-hidden="true">${
          b.images.map((_, i) =>
            `<span class="build-card__dot${i === 0 ? ' is-active' : ''}"></span>`
          ).join('')
        }</div>`
      : '';

    const nameHtml = b.name
      ? `<p class="build-item__name">${b.name}</p>`
      : `<p class="build-item__name" style="visibility:hidden">—</p>`;

    const colorHtml = b.colorLabel
      ? `<p class="build-item__color${b.colorClass ? ` build-item__color--${b.colorClass}` : ''}">${b.colorLabel}</p>`
      : `<p class="build-item__color" style="visibility:hidden">—</p>`;

    item.innerHTML = `
      ${nameHtml}
      <div class="build-card">
        <div class="build-card__image-wrap">
          ${badge}
          ${slidesHtml}
          ${dotsHtml}
        </div>
      </div>
      ${colorHtml}`;

    /* Tap / click cycles through images */
    if (multi) {
      let current = 0;
      const imgs = item.querySelectorAll('.build-card__image');
      const dots = item.querySelectorAll('.build-card__dot');

      item.querySelector('.build-card__image-wrap').addEventListener('click', () => {
        imgs[current].classList.remove('is-active');
        dots[current].classList.remove('is-active');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('is-active');
        dots[current].classList.add('is-active');
      });
    }

    track.appendChild(item);
  });

  /* ── Prev / Next buttons ──────────────────────────────── */
  const wrap    = document.getElementById('ow-wrap');
  const prevBtn = document.getElementById('ow-prev');
  const nextBtn = document.getElementById('ow-next');
  if (!wrap) return;

  function cardStep() {
    const item = track.querySelector('.build-item');
    const gap  = parseFloat(getComputedStyle(track).gap) || 20;
    return item ? item.offsetWidth + gap : 320;
  }

  function updateButtons() {
    if (prevBtn) prevBtn.disabled = wrap.scrollLeft <= 0;
    if (nextBtn) nextBtn.disabled = wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth - 2;
  }

  prevBtn?.addEventListener('click', () => {
    wrap.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    wrap.scrollBy({ left: cardStep(), behavior: 'smooth' });
  });

  wrap.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();

})();


/* ---- CINEMATIC BREAK: text fade-in on scroll ------------- */
(function () {
  const section = document.querySelector('.cin-break');
  if (!section) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add('in-view');
        observer.unobserve(section);
      }
    },
    { threshold: 0.18 }
  );

  observer.observe(section);
})();


/* ---- FOOTER SERVICES: expand / collapse ------------------ */
(function () {
  document.querySelectorAll('.footer__service-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.footer__service-item');
      const isOpen = item.classList.contains('footer__service-item--open');
      document.querySelectorAll('.footer__service-item--open').forEach(open => {
        open.classList.remove('footer__service-item--open');
        open.querySelector('.footer__service-btn')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('footer__service-item--open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ---- GOOGLE MAPS ------------------------------------------
   Replace the values below when the real address/coordinates
   are confirmed. Everything else wires itself automatically.
   ---------------------------------------------------------- */
const MAP_CONFIG = {
  address: '55 Torbarrie Rd #10, North York, ON M3L 1G5',
  zoom:    17,
  openUrl:  '',
  embedUrl: '',
};

const _addr = encodeURIComponent(MAP_CONFIG.address);
MAP_CONFIG.openUrl  = `https://maps.google.com/?q=${_addr}`;
MAP_CONFIG.embedUrl = `https://maps.google.com/maps?q=${_addr}&z=${MAP_CONFIG.zoom}&output=embed`;

(function () {
  const iframe = document.getElementById('gmap-iframe');
  const btn    = document.getElementById('gmap-open-btn');
  if (iframe) iframe.src = MAP_CONFIG.embedUrl;
  if (btn)    btn.href   = MAP_CONFIG.openUrl;
})();


/* ---- CONTACT FORM VALIDATION ----------------------------- */
(function () {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;

  function validate(field) {
    const val = field.value.trim();
    if (field.required && !val) return false;
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
    return true;
  }

  /* Live clear error on input */
  form.querySelectorAll('.form-input').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('has-error'));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('.form-input').forEach(field => {
      if (!validate(field)) {
        field.classList.add('has-error');
        valid = false;
      }
    });

    if (!valid) {
      const first = form.querySelector('.has-error');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.focus();
      return;
    }

    /* Success state */
    form.style.display = 'none';
    success.classList.add('is-visible');
    success.setAttribute('aria-hidden', 'false');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
