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
  '.svc-showcase__header',
  '.services__header',
  '.services__grid',
  /* New sections */
  '.diff-new__intro',
  '.gr-reviews__header',
  '.contact__info',
  '.contact__form-wrap',
  '.studio-image__visual',
  '.studio-image__content',
  '.footer__col--brand',
  '.footer__col--menu',
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


/* ---- BRANDS MARQUEE: pixel-precise loop fix -------------- */
(function () {
  const track = document.querySelector('.brands__track');
  const set   = document.querySelector('.brands__set');
  if (!track || !set) return;

  function calibrate() {
    const w = set.getBoundingClientRect().width;
    track.style.setProperty('--brands-w', `-${w}px`);
    /* Restart animation so it picks up the new value immediately */
    track.style.animation = 'none';
    track.offsetHeight; // force reflow
    track.style.animation = '';
  }

  /* Run once all images in the banner have loaded */
  const imgs = [...track.querySelectorAll('img')];
  let pending = imgs.filter(i => !i.complete).length;

  if (pending === 0) {
    calibrate();
  } else {
    function onLoad() { if (--pending <= 0) calibrate(); }
    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load',  onLoad, { once: true });
        img.addEventListener('error', onLoad, { once: true });
      }
    });
  }

  window.addEventListener('resize', calibrate, { passive: true });
})();


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

  function tryPlay(video) {
    const p = video.play();
    if (p !== undefined) {
      p.catch(() => {
        // Retry once after a short delay (handles browser autoplay policy races)
        setTimeout(() => video.play().catch(() => {}), 400);
      });
    }
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tryPlay(entry.target);
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.1 }
  );

  videos.forEach(v => {
    v.muted = true; // ensure muted programmatically for Safari
    videoObserver.observe(v);
  });
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


/* ---- WHAT MAKES US DIFFERENT: staggered reveal ----------- */
(function () {
  const section = document.querySelector('.diff-new');
  if (!section) return;

  const intro  = section.querySelector('.diff-new__intro');
  const visual = section.querySelector('.diff-new__visual');
  const points = [...section.querySelectorAll('.diff-new__point')];

  /* Apply animation classes */
  if (intro)  intro.classList.add('diff-anim');
  if (visual) visual.classList.add('diff-anim--visual');
  points.forEach(p => p.classList.add('diff-anim'));

  /* Stagger delays: intro 0ms, visual 180ms, points 380/520/660/800ms */
  const delays = [0, 180, 380, 520, 660, 800];
  [intro, visual, ...points].forEach((el, i) => {
    if (!el) return;
    el.style.transitionDelay = `${delays[i] || 0}ms`;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('diff-in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  [intro, visual, ...points].forEach(el => { if (el) obs.observe(el); });
})();


/* ---- GOOGLE-STYLE REVIEWS -------------------------------- */

/*
 * REVIEW_CONFIG — update these when the real Google listing is confirmed.
 * googleScore:     number string e.g. '4.9'  — null shows placeholder dashes
 * googleCount:     number string e.g. '52'   — null shows placeholder dashes
 * googleReviewUrl: paste the real Google Maps review URL here
 */
const REVIEW_CONFIG = {
  googleScore:     null,
  googleCount:     null,
  googleReviewUrl: '#',
};

/*
 * REVIEWS — add/edit entries here.
 * All fields support null (omits that UI element).
 * reviewDate: ISO string e.g. '2024-11-03' pulled from Google — null = hidden
 */
const REVIEWS = [
  {
    reviewerName:     'Aryo Lotfi',
    avatar:           null,
    rating:           5,
    reviewText:       'I recently had my car wrapped at Black Star Studios, and the entire experience was nothing short of exceptional. Their customer service is honestly top-tier — they respond to texts and calls almost instantly, and they make you feel genuinely taken care of from start to finish. I\'m extremely OCD with my car, and not once did they get impatient or dismissive. Instead, they went out of their way to help me with every small detail.',
    reviewDate:       null,
    vehicleOrService: 'Mercedes · Ceramic Coating',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'Malika Said Khasan',
    avatar:           null,
    rating:           5,
    reviewText:       'Thank you so much Black Star Studio — your work is amazing. It turned out even better than I imagined. The first time the car was brought in was for a ceramic coat, which also turned out great. Once at the shop I was inspired by all the incredible work, and when I decided to wrap the car I knew exactly who to take it to. The owner took his time with the consultation to make sure I got exactly what I wanted.',
    reviewDate:       null,
    vehicleOrService: 'Vehicle Wrap · Ceramic Coating',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'Howie Le',
    avatar:           null,
    rating:           5,
    reviewText:       'I would like to share my experience about Black Star Studio on their impressive quality of services and professionalism on getting my Maserati wrapped. Outstanding quality of materials used and I was very pleased with the outcome. Nothing but perfection. I highly recommend for those looking for quality and perfection — check out Black Star Studio and ask for Sharif, he\'s your guy.',
    reviewDate:       null,
    vehicleOrService: 'Maserati · Full Wrap',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'Rohit Pardeshi',
    avatar:           null,
    rating:           5,
    reviewText:       'Really really happy with the results of our Moss Green wrapped Jeep Wrangler. This colour definitely turns heads! Best part of the experience was their customer service. Through and through, everyone made sure our questions were answered and that we left completely satisfied.',
    reviewDate:       null,
    vehicleOrService: 'Jeep Wrangler · Full Wrap',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'KPP',
    avatar:           null,
    rating:           5,
    reviewText:       'Finally decided to pull the trigger on a wrap. Owner was extremely helpful in colour choices and styles. Great recommendations and def knows his stuff. I dmed 5 other places but ended up at blackstar. Better pricing and better knowledge. No regrets. the excecution was impeccable and really shows professional work. This place has both great service and skills. I would be coming back and i cannot be more happier. Give this place a shot if you have doubts or are second guessing. You wont regret it. Guy even waited for my car to come off cold start before moving it. You wont find better service elsewhere. Satisafction guaranteed.',
    reviewDate:       null,
    vehicleOrService: 'Lexus IS 350 · Full Wrap',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'Amir Khan',
    avatar:           null,
    rating:           5,
    reviewText:       'I had my Tesla Model 3 wrapped and tinted at Black Star Studio, and the entire experience was exceptional. Sharif and the team were professional, and very detail-oriented. The wrap came out beautifully—sleek, clean, and exactly the aesthetic I was going for. The tints were expertly done, and Sharif took the time to explain the process and materials used, which gave me a lot of confidence in the quality of the work. What stood out most was their integrity—Sharif made choices that prioritized long-term quality and customer satisfaction over short-term upsells. You don\'t find that often. Highly recommend Black Star Studio to anyone who values craftsmanship, honesty, and great service. This shop lives up to its name—top tier work, start to finish.',
    reviewDate:       null,
    vehicleOrService: 'Tesla Model 3 · Wrap & Tint',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'Pierre-Louis Vaz',
    avatar:           null,
    rating:           5,
    reviewText:       'Black Star Studio were fantastic!! The work they did on my Model 3 left me speechless. Very responsive throughout the process. I highly recommend working with them!!',
    reviewDate:       null,
    vehicleOrService: 'Tesla Model 3',
    projectImage:     null,
    sourceUrl:        null,
  },
  {
    reviewerName:     'Somar Amini',
    avatar:           null,
    rating:           5,
    reviewText:       'I had my car wrapped bmw x6 2021 at black star studio they did a phenomenal job! They\'re very competitive on pricing i really recommend black star studio for all your vehicles wrapping , ppf , and much more custom.',
    reviewDate:       null,
    vehicleOrService: 'BMW X6 2021 · Full Wrap',
    projectImage:     null,
    sourceUrl:        null,
  },
];

(function renderReviews() {
  const grid    = document.getElementById('gr-grid');
  const dotsEl  = document.getElementById('gr-dots');
  const scoreEl = document.getElementById('gr-score');
  const starsEl = document.getElementById('gr-stars');
  const countEl = document.getElementById('gr-count');
  const writeBtn = document.getElementById('gr-write-btn');
  if (!grid) return;

  /* ── Google G icon markup (reused on each card) ── */
  const GICON = `<svg class="gr-card__gicon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>`;

  /* ── Star HTML builder ── */
  function stars(rating, size) {
    return Array.from({ length: 5 }, (_, i) =>
      `<span class="gr-star${i < rating ? ' gr-star--filled' : ''}" aria-hidden="true">★</span>`
    ).join('');
  }

  /* ── Populate summary bar ── */
  if (REVIEW_CONFIG.googleScore) {
    scoreEl.textContent = REVIEW_CONFIG.googleScore;
    starsEl.innerHTML   = stars(Math.round(REVIEW_CONFIG.googleScore));
    starsEl.setAttribute('aria-label', `Rating: ${REVIEW_CONFIG.googleScore} out of 5`);
  } else {
    scoreEl.textContent = '—';
    starsEl.innerHTML   = stars(5);
    starsEl.setAttribute('aria-label', 'Rating pending confirmation');
  }

  if (REVIEW_CONFIG.googleCount) {
    countEl.textContent = `(${REVIEW_CONFIG.googleCount} reviews)`;
  } else {
    countEl.textContent = '(rating pending)';
  }

  if (writeBtn && REVIEW_CONFIG.googleReviewUrl !== '#') {
    writeBtn.href = REVIEW_CONFIG.googleReviewUrl;
  }

  /* ── Render cards ── */
  REVIEWS.forEach((r, i) => {
    const initial = r.reviewerName.charAt(0).toUpperCase();
    const needsReadMore = r.reviewText.length > 260;

    const avatarHtml = r.avatar
      ? `<img src="${r.avatar}" alt="${r.reviewerName}" loading="lazy">`
      : initial;

    const projectImgHtml = r.projectImage
      ? `<img class="gr-card__project-img" src="${r.projectImage}" alt="Project — ${r.reviewerName}" loading="lazy">`
      : '';

    const footerContent = [];
    if (r.vehicleOrService) footerContent.push(`<span class="gr-card__service">${r.vehicleOrService}</span>`);

    const card = document.createElement('div');
    card.className = 'gr-card';
    card.innerHTML = `
      <div class="gr-card__top">
        <div class="gr-card__avatar">${avatarHtml}</div>
        <div class="gr-card__meta">
          <span class="gr-card__name">${r.reviewerName}</span>
          <div class="gr-card__stars">${stars(r.rating)}</div>
        </div>
        ${GICON}
      </div>
      <div class="gr-card__text-wrap">
        <p class="gr-card__text">${r.reviewText}</p>
        ${needsReadMore ? '<button class="gr-card__read-more" aria-expanded="false">Read more</button>' : ''}
      </div>
      ${projectImgHtml}
      ${footerContent.length ? `<div class="gr-card__footer">${footerContent.join('')}</div>` : ''}
    `;

    /* Read more toggle */
    const readMoreBtn = card.querySelector('.gr-card__read-more');
    if (readMoreBtn) {
      readMoreBtn.addEventListener('click', () => {
        const textEl   = card.querySelector('.gr-card__text');
        const expanded = textEl.classList.toggle('is-expanded');
        readMoreBtn.textContent       = expanded ? 'Read less' : 'Read more';
        readMoreBtn.setAttribute('aria-expanded', String(expanded));
      });
    }

    grid.appendChild(card);
  });

  /* ── Mobile scroll dots ── */
  if (!dotsEl) return;

  REVIEWS.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'gr-dot';
    d.setAttribute('aria-label', `Review ${i + 1}`);
    d.addEventListener('click', () => {
      const cards   = grid.querySelectorAll('.gr-card');
      const target  = cards[i];
      if (target) grid.scrollTo({ left: target.offsetLeft - parseFloat(getComputedStyle(grid).paddingLeft), behavior: 'smooth' });
    });
    dotsEl.appendChild(d);
  });

  const dots = [...dotsEl.querySelectorAll('.gr-dot')];

  function updateDots() {
    const cards   = [...grid.querySelectorAll('.gr-card')];
    if (!cards.length) return;
    const pl      = parseFloat(getComputedStyle(grid).paddingLeft) || 0;
    const idx     = Math.round((grid.scrollLeft) / (cards[0].offsetWidth + 12));
    const clamped = Math.max(0, Math.min(idx, dots.length - 1));
    dots.forEach((d, i) => d.classList.toggle('gr-dot--active', i === clamped));
  }

  grid.addEventListener('scroll', updateDots, { passive: true });
  updateDots();
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
      images:        ['G-class(1).jpg', 'G-class(2).jpg'],
      imageAlt:      'Mercedes-AMG G63 — Black Star Studio',
      imagePosition: 'center 40%',
      brandLogo:     null,
      colorLabel:    'METALLIC SILVER',
      colorClass:    'silver',
    },
    {
      name:          'RANGE ROVER SVR',
      images:        ['Rangerover(1).jpg', 'Rangerover(2).jpg', 'Rangerover(3).jpg'],
      imageAlt:      'Range Rover SVR — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    'MILITARY GREEN · PPF · CERAMIC COATING',
      colorClass:    'green',
    },
    {
      name:          'PORSCHE · URUS',
      images:        [
        'coffee(1).jpg', 'coffee(2).jpg', 'coffee(3).jpg',
        'coffee(4).jpg', 'coffee(5).jpg',
      ],
      imageAlt:      'Porsche · Urus — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    'CERAMIC COATING · PPF · TINT',
      colorClass:    'coffee',
    },
    {
      name:          'ASTON MARTIN',
      images:        ['Aston(1).jpg', 'Aston(2).jpg', 'Aston(3).jpg', 'Aston(4).jpg'],
      imageAlt:      'Aston Martin — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    'SATIN GUN BLACK',
      colorClass:    'black',
    },
    {
      name:          'ROLLS-ROYCE PHANTOM',
      images:        ['phantom(1).jpg', 'phantom(2).jpg', 'phantom(3).jpg', 'phantom(4).jpg'],
      imageAlt:      'Rolls-Royce Phantom — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    'PPF · CERAMIC COATING',
      colorClass:    'muted',
    },
    {
      name:           'BMW X6',
      images:         ['x6(2).jpg', 'x6(1).jpg'],
      imageAlt:       'BMW X6 — Black Star Studio',
      imagePosition:  'center center',
      imagePositions: ['center center', 'center 65%'],
      brandLogo:      null,
      colorLabel:     'PPF · WRAPPED IN RED · CERAMIC COATING',
      colorClass:     'red',
    },
    {
      name:          'MASERATI',
      images:        ['massarati(1).jpg', 'massarati(2).jpg', 'massarati(3).jpg'],
      imageAlt:      'Maserati — Black Star Studio',
      imagePosition: 'center center',
      brandLogo:     null,
      colorLabel:    'CHROME DELETE · CERAMIC COATING · PPF',
      colorClass:    'muted',
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

    const slidesHtml = b.images.map((src, i) => {
      const pos = (b.imagePositions && b.imagePositions[i]) || b.imagePosition;
      return `<img src="${src}"
            alt="${i === 0 ? b.imageAlt : ''}"
            class="build-card__image${i === 0 ? ' is-active' : ''}"
            style="object-position:${pos}"
            loading="${i === 0 ? 'eager' : 'lazy'}">`;
    }).join('');

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
MAP_CONFIG.embedUrl = `https://maps.google.com/maps?q=${_addr}&z=${MAP_CONFIG.zoom}&output=embed&t=k`;

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


/* ---- SERVICES SHOWCASE ----------------------------------- */
const SERVICES = [
  {
    title:  'VEHICLE WRAPPING',
    sub:    'Color change · Full & partial',
    image:  'Wrap(1).jpeg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #231e14 0%, #0d0b08 100%)',
    link:   '#contact',
  },
  {
    title:  'PAINT PROTECTION FILM',
    sub:    'Long-term surface defense',
    image:  'PPF.jpeg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #0f1020 0%, #07080e 100%)',
    link:   '#contact',
  },
  {
    title:  'CERAMIC COATING',
    sub:    'Gloss · Hydrophobic · Lasting protection',
    image:  'Ceramic_coating.jpg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #141420 0%, #09090d 100%)',
    link:   '#contact',
  },
  {
    title:  'TINTING',
    sub:    'Heat rejection · Privacy · UV block',
    image:  'tinting.jpg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #0d1616 0%, #070c0c 100%)',
    link:   '#contact',
  },
  {
    title:  'BLACK OUT',
    sub:    'Chrome delete · Blacked-out trim · Dark accents',
    image:  'Black_out(2).jpg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #111111 0%, #050505 100%)',
    link:   '#contact',
  },
  {
    title:  'COMMERCIAL WRAP',
    sub:    'Fleet · Brand presence · Business identity',
    image:  'commercial_wrap(2).jpg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #1c1610 0%, #0c0a08 100%)',
    link:   '#contact',
  },
  {
    title:  'DECALS & STRIPES',
    sub:    'Custom graphics · Accents · Identity',
    image:  'decals(2).jpg',
    imgPos: 'center center',
    bg:     'linear-gradient(140deg, #16101e 0%, #0b080f 100%)',
    link:   '#contact',
  },
];

(function renderSvcShowcase() {
  const grid = document.getElementById('svc-showcase-grid');
  if (!grid) return;

  SERVICES.forEach((s, i) => {
    const a = document.createElement('a');
    a.href      = s.link;
    a.className = 'svc-card';

    const media = s.image
      ? `<div class="svc-card__media">
           <img class="svc-card__img" src="${s.image}" alt="${s.title}"
                style="--img-pos:${s.imgPos}">
           <div class="svc-card__overlay"></div>
         </div>`
      : `<div class="svc-card__media">
           <div style="position:absolute;inset:0;background:${s.bg}"></div>
           <div class="svc-card__overlay"></div>
         </div>`;

    a.innerHTML = `${media}
      <div class="svc-card__content">
        <span class="svc-card__number">0${i + 1}</span>
        <h3  class="svc-card__title">${s.title}</h3>
        <p   class="svc-card__sub">${s.sub}</p>
        <span class="svc-card__cta">Book Now &nbsp;→</span>
      </div>`;

    grid.appendChild(a);
  });

  /* Attach scroll-fade to each card */
  grid.querySelectorAll('.svc-card').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
  });
})();
