(() => {
  'use strict';

  /*
   * Cesare Paratore — interaction layer
   * Progressive enhancement:
   * - il sito funziona senza GSAP
   * - il loader non può bloccare permanentemente la pagina
   * - animazioni e interazioni sono opzionali
   */

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1500,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260
  };

  const doc = document;
  const win = window;

  const $ = (selector, parent = doc) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = doc) =>
    Array.from(parent.querySelectorAll(selector));

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const prefersReducedMotion = () =>
    win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let UI = null;
  let sections = [];
  let activeIndex = 0;

  let menuOpen = false;
  let lastFocusedElement = null;

  let scrollTicking = false;
  let resizeTimer = null;
  let standbyTimer = null;

  let loaderHidden = false;

  /* =========================================================
     LOADER
     ========================================================= */

  function hideLoader() {
    if (loaderHidden) return;

    loaderHidden = true;

    /*
     * IMPORTANTE:
     * l'HTML usa #page-loader.
     */
    const loader = doc.getElementById('page-loader');

    /*
     * Rimuoviamo immediatamente eventuali stati
     * di caricamento dalla pagina.
     */
    doc.documentElement.classList.remove('is-loading');
    doc.body.classList.remove('is-loading');

    if (!loader) return;

    loader.classList.add('is-hidden');

    /*
     * Fallback ulteriore:
     * anche se la transizione CSS non esiste,
     * il loader viene comunque rimosso.
     */
    win.setTimeout(() => {
      try {
        loader.remove();
      } catch (_) {
        loader.style.display = 'none';
        loader.style.visibility = 'hidden';
        loader.style.pointerEvents = 'none';
      }
    }, 700);
  }

  /*
   * Sicurezza assoluta:
   * anche se l'inizializzazione JS fallisce,
   * il loader viene rimosso.
   */
  win.setTimeout(hideLoader, CONFIG.loaderMax);

  /* =========================================================
     DOM REFERENCES
     ========================================================= */

  function collectUI() {
    UI = {
      header: $('#site-header'),

      menuToggle: $('#menu-toggle'),
      menu: $('#menu'),
      menuLinks: $$('#menu a'),

      storyTitle: $('#active-story-title'),

      storyPrev: $('#story-prev'),
      storyNext: $('#story-next'),

      storyProgress: $('#story-progress'),
      storyProgressFill: $('.story-progress-fill'),
      storyProgressOrb: $('.story-progress-orb'),

      sections: $$('main .story'),

      standby: $('#standby'),

      year: $('#current-year')
    };
  }

  /* =========================================================
     SECTIONS
     ========================================================= */

  function collectSections() {
    if (!UI?.sections?.length) {
      sections = [];
      return;
    }

    sections = UI.sections
      .map((element) => ({
        element,
        id: element.id,
        title:
          element.dataset.storyTitle ||
          $('.story-title', element)?.textContent?.trim() ||
          element.id
      }))
      .filter((item) => item.element);
  }

  /* =========================================================
     ACTIVE SECTION
     ========================================================= */

  function getReadingLine() {
    const viewportHeight =
      win.innerHeight ||
      doc.documentElement.clientHeight;

    return Math.min(
      viewportHeight * CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );
  }

  function findActiveSection() {
    if (!sections.length) return 0;

    const readingLine = getReadingLine();

    let candidate = 0;
    let closestDistance = Infinity;

    sections.forEach((section, index) => {
      const rect =
        section.element.getBoundingClientRect();

      /*
       * Una sezione diventa attiva quando il suo inizio
       * raggiunge la reading line.
       */
      if (rect.top <= readingLine) {
        candidate = index;
      }

      const distance = Math.abs(
        rect.top - readingLine
      );

      if (
        distance < closestDistance &&
        rect.top <= readingLine
      ) {
        closestDistance = distance;
        candidate = index;
      }
    });

    return clamp(
      candidate,
      0,
      sections.length - 1
    );
  }

  function updateActiveSection(force = false) {
    if (!sections.length) return;

    const nextIndex = findActiveSection();

    if (!force && nextIndex === activeIndex) {
      updateProgress();
      return;
    }

    activeIndex = nextIndex;

    const current = sections[activeIndex];

    if (UI.storyTitle) {
      UI.storyTitle.textContent =
        current.title;
    }

    sections.forEach((section, index) => {
      const isActive =
        index === activeIndex;

      section.element.classList.toggle(
        'is-active',
        isActive
      );

      const link = UI.menuLinks.find(
        (item) =>
          item.getAttribute('href') ===
          `#${section.id}`
      );

      if (!link) return;

      if (isActive) {
        link.setAttribute(
          'aria-current',
          'location'
        );
      } else {
        link.removeAttribute(
          'aria-current'
        );
      }
    });

    updateArrowState();
    updateProgress();
  }

  /* =========================================================
     PROGRESS
     ========================================================= */

  function getProgress(section) {
    if (!section) return 0;

    const element = section.element;
    const rect =
      element.getBoundingClientRect();

    const scrollY =
      win.scrollY ||
      win.pageYOffset ||
      0;

    const viewportHeight =
      win.innerHeight ||
      doc.documentElement.clientHeight;

    const sectionTop =
      scrollY + rect.top;

    const sectionHeight =
      element.offsetHeight;

    if (!sectionHeight) return 0;

    /*
     * Sezione più corta della viewport:
     * progress basato sull'attraversamento.
     */
    if (sectionHeight <= viewportHeight) {
      const travel = Math.max(
        1,
        sectionHeight -
          viewportHeight * 0.35
      );

      return clamp(
        (
          scrollY -
          sectionTop +
          viewportHeight * 0.35
        ) / travel
      );
    }

    /*
     * Sezione lunga:
     * 0% all'inizio,
     * 100% quando il fondo raggiunge la viewport.
     */
    const travel = Math.max(
      1,
      sectionHeight - viewportHeight
    );

    return clamp(
      (scrollY - sectionTop) / travel
    );
  }

  function updateProgress() {
    if (
      !sections.length ||
      !UI.storyProgressFill
    ) {
      return;
    }

    const progress =
      getProgress(
        sections[activeIndex]
      );

    const percentage =
      `${progress * 100}%`;

    UI.storyProgressFill.style.width =
      percentage;

    if (UI.storyProgressOrb) {
      UI.storyProgressOrb.style.left =
        percentage;
    }

    if (UI.storyProgress) {
      UI.storyProgress.setAttribute(
        'aria-valuenow',
        String(Math.round(progress * 100))
      );
    }
  }

  /* =========================================================
     ARROWS
     ========================================================= */

  function updateArrowState() {
    if (
      !UI.storyPrev ||
      !UI.storyNext
    ) {
      return;
    }

    UI.storyPrev.disabled =
      activeIndex <= 0;

    UI.storyNext.disabled =
      activeIndex >= sections.length - 1;
  }

  function scrollToSection(
    index,
    updateHistory = true
  ) {
    if (!sections.length) return;

    const safeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const target =
      sections[safeIndex]?.element;

    if (!target) return;

    const headerHeight =
      UI.header?.offsetHeight || 0;

    const top =
      target.getBoundingClientRect().top +
      (
        win.scrollY ||
        win.pageYOffset ||
        0
      ) -
      headerHeight +
      CONFIG.scrollOffset;

    win.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion()
        ? 'auto'
        : 'smooth'
    });

    activeIndex = safeIndex;

    updateActiveSection(true);

    if (
      updateHistory &&
      target.id
    ) {
      try {
        history.pushState(
          null,
          '',
          `#${target.id}`
        );
      } catch (_) {
        /*
         * Fallback:
         * nessuna azione necessaria.
         */
      }
    }
  }

  function goPrevious() {
    if (activeIndex > 0) {
      scrollToSection(
        activeIndex - 1
      );
    }
  }

  function goNext() {
    if (
      activeIndex <
      sections.length - 1
    ) {
      scrollToSection(
        activeIndex + 1
      );
    }
  }

  /* =========================================================
     MENU
     ========================================================= */

  function updateMenuState() {
    if (
      !UI.menu ||
      !UI.menuToggle
    ) {
      return;
    }

    UI.menuToggle.setAttribute(
      'aria-expanded',
      String(menuOpen)
    );

    UI.menuToggle.setAttribute(
      'aria-label',
      menuOpen
        ? 'Chiudi menu'
        : 'Apri menu'
    );

    UI.menu.setAttribute(
      'aria-hidden',
      String(!menuOpen)
    );

    if (menuOpen) {
      UI.menu.removeAttribute(
        'inert'
      );
    } else {
      UI.menu.setAttribute(
        'inert',
        ''
      );
    }
  }

  function openMenu() {
    if (
      !UI.menu ||
      !UI.menuToggle
    ) {
      return;
    }

    lastFocusedElement =
      doc.activeElement;

    menuOpen = true;

    UI.menu.classList.add(
      'is-open'
    );

    UI.header?.classList.add(
      'menu-is-open'
    );

    updateMenuState();

    const firstLink =
      UI.menuLinks[0];

    if (firstLink) {
      win.requestAnimationFrame(() => {
        firstLink.focus();
      });
    }
  }

  function closeMenu(
    restoreFocus = true
  ) {
    if (
      !UI.menu ||
      !UI.menuToggle
    ) {
      return;
    }

    menuOpen = false;

    UI.menu.classList.remove(
      'is-open'
    );

    UI.header?.classList.remove(
      'menu-is-open'
    );

    updateMenuState();

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        'function'
    ) {
      win.requestAnimationFrame(() => {
        try {
          lastFocusedElement.focus();
        } catch (_) {
          UI.menuToggle.focus();
        }
      });
    }
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function handleMenuClick(event) {
    const link =
      event.currentTarget;

    const href =
      link.getAttribute('href');

    if (
      !href ||
      !href.startsWith('#')
    ) {
      return;
    }

    const id =
      href.slice(1);

    const index =
      sections.findIndex(
        (section) =>
          section.id === id
      );

    if (index === -1) return;

    event.preventDefault();

    closeMenu(false);

    scrollToSection(index);
  }

  /* =========================================================
     KEYBOARD
     ========================================================= */

  function trapMenuFocus(event) {
    if (
      !menuOpen ||
      event.key !== 'Tab'
    ) {
      return;
    }

    const focusable =
      UI.menuLinks.filter(
        (element) =>
          !element.disabled &&
          element.offsetParent !== null
      );

    if (!focusable.length) return;

    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length - 1
      ];

    if (
      event.shiftKey &&
      doc.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (
      !event.shiftKey &&
      doc.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeydown(event) {
    if (
      event.key === 'Escape' &&
      menuOpen
    ) {
      event.preventDefault();
      closeMenu();
      return;
    }

    trapMenuFocus(event);

    if (menuOpen) return;

    const target =
      event.target;

    if (
      target instanceof
        HTMLInputElement ||
      target instanceof
        HTMLTextAreaElement ||
      target instanceof
        HTMLSelectElement ||
      target?.isContentEditable
    ) {
      return;
    }

    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown'
    ) {
      event.preventDefault();
      goNext();
    }

    if (
      event.key === 'ArrowUp' ||
      event.key === 'PageUp'
    ) {
      event.preventDefault();
      goPrevious();
    }

    if (
      event.key === 'Home' &&
      event.ctrlKey
    ) {
      event.preventDefault();
      scrollToSection(0);
    }

    if (
      event.key === 'End' &&
      event.ctrlKey
    ) {
      event.preventDefault();

      scrollToSection(
        sections.length - 1
      );
    }
  }

  /* =========================================================
     SCROLL
     ========================================================= */

  function handleScroll() {
    if (scrollTicking) return;

    scrollTicking = true;

    win.requestAnimationFrame(() => {
      updateActiveSection();
      scrollTicking = false;
    });
  }

  /* =========================================================
     HASH
     ========================================================= */

  function handleHash() {
    const hash =
      win.location.hash;

    if (
      !hash ||
      hash === '#'
    ) {
      updateActiveSection(true);
      return;
    }

    const id =
      decodeURIComponent(
        hash.slice(1)
      );

    const index =
      sections.findIndex(
        (section) =>
          section.id === id
      );

    if (index === -1) {
      updateActiveSection(true);
      return;
    }

    win.setTimeout(() => {
      scrollToSection(
        index,
        false
      );
    }, 50);
  }

  /* =========================================================
     STANDBY
     ========================================================= */

  function resetStandby() {
    if (!UI.standby) return;

    UI.standby.classList.remove(
      'is-visible'
    );

    if (standbyTimer) {
      win.clearTimeout(
        standbyTimer
      );
    }

    standbyTimer = win.setTimeout(() => {
      if (
        !doc.hidden &&
        !menuOpen &&
        UI.standby
      ) {
        UI.standby.classList.add(
          'is-visible'
        );
      }
    }, CONFIG.standbyDelay);
  }

  function initStandby() {
    [
      'pointerdown',
      'pointermove',
      'keydown',
      'touchstart',
      'wheel'
    ].forEach((eventName) => {
      doc.addEventListener(
        eventName,
        resetStandby,
        {
          passive: true
        }
      );
    });

    resetStandby();
  }

  /* =========================================================
     GSAP — OPTIONAL
     ========================================================= */

  function initGSAP() {
    if (
      prefersReducedMotion() ||
      typeof win.gsap === 'undefined'
    ) {
      return;
    }

    try {
      if (
        typeof win.ScrollTrigger !==
        'undefined'
      ) {
        win.gsap.registerPlugin(
          win.ScrollTrigger
        );
      }

      const elements =
        $$('.story .reveal');

      if (!elements.length) {
        return;
      }

      if (
        typeof win.ScrollTrigger !==
        'undefined'
      ) {
        elements.forEach(
          (element) => {
            win.gsap.fromTo(
              element,
              {
                opacity: 0,
                y: 28
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: element,
                  start: 'top 86%',
                  once: true
                }
              }
            );
          }
        );
      } else {
        win.gsap.to(
          elements,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.04,
            ease: 'power3.out'
          }
        );
      }
    } catch (error) {
      /*
       * GSAP è opzionale.
       * Un suo errore non deve mai rompere il sito.
       */
      console.warn(
        'GSAP enhancement skipped:',
        error
      );
    }
  }

  /* =========================================================
     YEAR
     ========================================================= */

  function updateYear() {
    if (!UI.year) return;

    UI.year.textContent =
      String(
        new Date().getFullYear()
      );
  }

  /* =========================================================
     RESIZE
     ========================================================= */

  function handleResize() {
    if (resizeTimer) {
      win.clearTimeout(
        resizeTimer
      );
    }

    resizeTimer = win.setTimeout(
      () => {
        collectSections();
        updateActiveSection(true);

        if (
          typeof win.ScrollTrigger !==
          'undefined'
        ) {
          try {
            win.ScrollTrigger.refresh();
          } catch (_) {
            // Optional enhancement.
          }
        }
      },
      100
    );
  }

  /* =========================================================
     VISIBILITY / BFCACHE
     ========================================================= */

  function handleVisibility() {
    if (doc.hidden) {
      if (standbyTimer) {
        win.clearTimeout(
          standbyTimer
        );
      }

      return;
    }

    resetStandby();
    collectSections();
    updateActiveSection(true);
  }

  function handlePageShow() {
    /*
     * Anche dopo BFCache il loader non deve ricomparire.
     */
    hideLoader();

    collectSections();
    updateActiveSection(true);
    resetStandby();

    if (
      typeof win.ScrollTrigger !==
      'undefined'
    ) {
      try {
        win.ScrollTrigger.refresh();
      } catch (_) {
        // Optional enhancement.
      }
    }
  }

  /* =========================================================
     EVENTS
     ========================================================= */

  function bindEvents() {
    UI.menuToggle?.addEventListener(
      'click',
      toggleMenu
    );

    UI.menuLinks.forEach(
      (link) => {
        link.addEventListener(
          'click',
          handleMenuClick
        );
      }
    );

    UI.storyPrev?.addEventListener(
      'click',
      goPrevious
    );

    UI.storyNext?.addEventListener(
      'click',
      goNext
    );

    win.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    );

    win.addEventListener(
      'resize',
      handleResize,
      {
        passive: true
      }
    );

    win.addEventListener(
      'hashchange',
      handleHash
    );

    win.addEventListener(
      'popstate',
      handleHash
    );

    win.addEventListener(
      'pageshow',
      handlePageShow
    );

    doc.addEventListener(
      'keydown',
      handleKeydown
    );

    doc.addEventListener(
      'visibilitychange',
      handleVisibility
    );
  }

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function init() {
    try {
      collectUI();
      collectSections();

      updateYear();
      updateMenuState();

      bindEvents();

      updateActiveSection(true);

      /*
       * Se esiste un hash, lo gestiamo dopo
       * che il layout è stato calcolato.
       */
      handleHash();

      initStandby();

      /*
       * Il loader viene chiuso SUBITO.
       * Non aspettiamo GSAP, immagini, iframe o altro.
       */
      win.requestAnimationFrame(() => {
        hideLoader();
      });

      /*
       * GSAP viene caricato/inizializzato
       * come enhancement separato.
       */
      win.setTimeout(() => {
        initGSAP();
      }, 0);

    } catch (error) {
      console.error(
        'Site initialization error:',
        error
      );

      /*
       * Fallback definitivo:
       * la pagina deve comunque diventare visibile.
       */
      hideLoader();

      doc.documentElement.classList.remove(
        'is-loading'
      );

      doc.body.classList.remove(
        'is-loading'
      );
    }
  }

  /* =========================================================
     GLOBAL ERROR SAFETY
     ========================================================= */

  win.addEventListener(
    'error',
    () => {
      hideLoader();
    }
  );

  win.addEventListener(
    'unhandledrejection',
    () => {
      hideLoader();
    }
  );

  /* =========================================================
     START
     ========================================================= */

  if (
    doc.readyState === 'loading'
  ) {
    doc.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
