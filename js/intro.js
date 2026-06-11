/* ============================================================
   BLACK STAR STUDIO — INTRO ANIMATION
   ============================================================
   Adjust the TIMING object below to retime any part of the
   sequence without touching animation logic.
   All values are in seconds.
   ============================================================ */

const TIMING = {
  // "BLACK" horizontal wipe-in
  blackAt:    0.15,
  blackDur:   0.68,

  // "STAR" wipe — overlaps BLACK for a flowing feel
  starAt:     0.60,
  starDur:    0.65,

  // "Studio" — graceful script reveal, slower than the others
  studioAt:   1.12,
  studioDur:  0.82,

  // Star icon — precise snap after Studio finishes
  starIconAt: 1.88,
  starIconDur: 0.46,

  // Ambient glow — washes in quietly around logo completion
  glowAt:     1.95,
  glowDur:    0.75,

  // Pause: how long to hold the completed logo before exiting
  holdDur:    0.30,

  // Outro: intro panel slides upward off-screen
  exitDur:    0.52,
};


/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const intro    = document.getElementById('intro');
  const iwBlack  = document.getElementById('iw-black');
  const iwStar   = document.getElementById('iw-star');
  const iwStudio = document.getElementById('iw-studio');
  const starIcon = document.getElementById('intro-star');
  const glow     = document.getElementById('intro-glow');
  const bar      = document.getElementById('intro-bar');

  if (!intro) return;

  // Lock body scroll while intro is active
  document.body.classList.add('intro-active');


  /* -- Set initial GSAP states ----------------------------- */
  // The CSS already sets clip-path on .iw elements as a
  // non-JS fallback. Here we also set blur + scale so GSAP
  // has clean starting values for all animated properties.

  gsap.set([iwBlack, iwStar], {
    clipPath: 'inset(0 100% 0 0)',
    filter:   'blur(4px)',
  });

  gsap.set(iwStudio, {
    clipPath: 'inset(0 100% 0 0)',
    filter:   'blur(2px)',
  });

  gsap.set(starIcon, {
    opacity:  0,
    scale:    0,
    rotation: -22,
  });

  gsap.set([glow, bar], { opacity: 0 });


  /* -- Main timeline --------------------------------------- */
  const tl = gsap.timeline({ onComplete: playExit });


  // ── "BLACK" ──────────────────────────────────────────────
  // Clean left-to-right wipe with blur clearing on reveal
  tl.to(iwBlack, {
    clipPath: 'inset(0 0% 0 0)',
    filter:   'blur(0px)',
    duration: TIMING.blackDur,
    ease:     'power3.inOut',
  }, TIMING.blackAt);


  // ── "STAR" ───────────────────────────────────────────────
  // Same wipe but slightly harder ease + subtle scale settle
  // for a more impactful entrance
  tl.fromTo(iwStar,
    {
      clipPath: 'inset(0 100% 0 0)',
      filter:   'blur(4px)',
      scale:    1.05,
    },
    {
      clipPath: 'inset(0 0% 0 0)',
      filter:   'blur(0px)',
      scale:    1,
      duration: TIMING.starDur,
      ease:     'power4.inOut',
    },
    TIMING.starAt
  );


  // ── "Studio" ─────────────────────────────────────────────
  // Softer ease makes the script text feel handwritten / drawn
  tl.to(iwStudio, {
    clipPath: 'inset(0 0% 0 0)',
    filter:   'blur(0px)',
    duration: TIMING.studioDur,
    ease:     'power2.inOut',
  }, TIMING.studioAt);


  // ── Star icon ────────────────────────────────────────────
  // back.out gives the snap / pop a slight overshoot — premium
  tl.to(starIcon, {
    opacity:  1,
    scale:    1,
    rotation: 0,
    duration: TIMING.starIconDur,
    ease:     'back.out(2.2)',
  }, TIMING.starIconAt);


  // ── Ambient glow ─────────────────────────────────────────
  tl.to(glow, {
    opacity:  1,
    duration: TIMING.glowDur,
    ease:     'power2.out',
  }, TIMING.glowAt);


  // ── Hold ─────────────────────────────────────────────────
  tl.to({}, { duration: TIMING.holdDur });


  /* -- Progress bar (runs in parallel with timeline) ------- */
  const barTotal = TIMING.starIconAt + TIMING.starIconDur + TIMING.holdDur;

  gsap.fromTo(bar,
    { width: '0%', opacity: 1 },
    {
      width:    '100%',
      opacity:  1,
      duration: barTotal - TIMING.blackAt,
      ease:     'power1.inOut',
      delay:    TIMING.blackAt,
    }
  );


  /* -- Exit: intro panel slides UP revealing the site ------ */
  function playExit() {
    gsap.to(bar, { opacity: 0, duration: 0.3 });

    gsap.to(intro, {
      yPercent:  -100,
      duration:  TIMING.exitDur,
      ease:      'power3.inOut',
      onComplete() {
        intro.remove();
        document.body.classList.remove('intro-active');

        requestAnimationFrame(() => {
          const heroContent = document.querySelector('.hero__content');
          if (heroContent) heroContent.classList.add('revealed');

          const navLogo = document.getElementById('nav-logo');
          if (navLogo) navLogo.classList.add('revealed');
        });
      },
    });
  }

});
