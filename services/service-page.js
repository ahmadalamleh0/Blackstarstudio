/* ============================================================
   BLACK STAR STUDIO — Service Coming Soon page renderer
   Reads data-service from #service-root and builds the page.
   ============================================================ */
(function () {
  'use strict';

  const root = document.getElementById('service-root');
  if (!root) return;

  const name = root.dataset.service || 'SERVICE';

  /* Update browser tab title */
  const titleCase = name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  document.title = titleCase + ' — Black Star Studio';

  /* Render page */
  root.innerHTML = `
    <div class="sp-page">

      <a href="/" class="sp-logo-link" aria-label="Black Star Studio — Home">
        <span class="sp-logo-black">BLACK</span>
        <span class="sp-logo-star">STAR</span>
        <span class="sp-logo-row">
          <span class="sp-logo-script">Studio</span>
          <span class="sp-logo-star-icon">★</span>
        </span>
      </a>

      <div class="sp-rule" aria-hidden="true"></div>

      <p class="sp-service-name">${name}</p>
      <h1 class="sp-coming-soon">COMING<br>SOON</h1>

      <a href="/#svc-showcase" class="sp-back">← Back to Services</a>

    </div>
  `;

  /* Fade in after first paint */
  const page = root.querySelector('.sp-page');
  setTimeout(() => { page?.classList.add('sp-page--in'); }, 40);
})();
