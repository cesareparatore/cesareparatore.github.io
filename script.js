(() => {
  'use strict';

  /*
   * Cesare Paratore — main interaction layer
   * Progressive enhancement:
   * - il sito funziona anche senza GSAP
   * - il loader non può bloccare permanentemente la pagina
   * - animazioni e interazioni sono aggiunte dopo il rendering iniziale
   */

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1200,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    progressEpsilon: 0.001
  };

  const doc = document;
  const win = window;

  const $ = (selector, parent = doc) => parent.querySelector(selector);
  const $$ = (selector, parent = doc) =>
    Array.from(parent.querySelectorAll(selector));

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const prefersReducedMotion = () =>
    win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sections = [];
  let activeIndex = 0;
  let scrollTicking = false;
  let standbyTimer = null;
  let menuOpen = false;
  let lastFocusedElement = null;
  let loaderHidden = false;

  /* -------------------------------------------------------
     LOADER — fail safe
     ------------------------------------------------------- */

  function hideLoader() {
    if (loaderHidden) return;

    loaderHidden = true;

    const loader = $('#loader');
    if (!loader) {
      doc.documentElement.classList.remove('is-loading');
      doc.body.classList.remove('is-loading');
      return;
    }

    loader.classList.add('is-hidden');
    doc.documentElement.classList.remove('is-loading');
    doc.body.classList.remove('is-loading');

    // Rimuove completamente il loader dopo la transizione.
    win.setTimeout(() => {
      try {
        loader.remove();
      } catch (_) {
        // Safe fallback.
        loader.style.display = 'none';
      }
    }, 700);
  }

  function emergencyLoaderFallback() {
    // Il loader deve SEMPRE sparire, anche in caso di errore JS.
    win.setTimeout(hideLoader, CONFIG.loaderMax);
  }

  /*
   * Avviato immediatamente, prima di qualsiasi inizializzazione.
   * Se qualcosa sotto fallisce, il timer rimane comunque attivo.
   */
  emergencyLoaderFallback();

  /* -------------------------------------------------------
     DOM READY
     ------------------------------------------------------- */

  function onReady(callback) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', callback, {
        once: true
      });
    } else {
      callback();
    }
  }

  /* -------------------------------------------------------
     REFERENCES
     ------------------------------------------------------- */

  function getElements() {
    return {
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
      year: $('#current-year'),
      standby: $('#standby')
    };
  }

  let UI = null;

  /* -------------------------------------------------------
     SECTIONS
     ------------------------------------------------------- */

  function getSectionData() {
    if (!UI) return [];

    return UI.sections
      .map((section) => {
        const title =
          section.dataset.title ||
          $('.story-title', section)?.textContent?.trim() ||
          $('.story-kicker', section)?.textContent?.trim() ||
          section.id;

        return {
          element: section,
          id: section.id,
          title
        };
      })
      .filter((item) => item.element);
  }

  function updateSectionMeasurements() {
    sections = getSectionData();
  }

  /* -------------------------------------------------------
     ACTIVE SECTION
     ------------------------------------------------------- */

  function getReadingLine() {
    const viewportHeight = win.innerHeight || doc.documentElement.clientHeight;

    return Math.min(
      viewportHeight * CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );
  }

  function getActiveSectionIndex() {
    if (!sections.length) return 0;

    const readingLine = getReadingLine();
    let closestIndex = 0;
    let closestDistance = Infinity;

    sections.forEach((item, index) => {
      const rect = item.element.getBoundingClientRect();

      const distance = Math.abs(rect.top - readingLine);

      /*
       * Sezione già attraversata:
       * la consideriamo attiva quando la sua parte iniziale
       * ha superato la reading line.
       */
      if (rect.top <= readingLine + 1) {
        closestIndex = index;
      }

      if (distance < closestDistance) {
        closestDistance = distance;

        if (rect.top <= readingLine) {
          closestIndex = index;
        }
      }
    });

    return clamp(
      closestIndex,
      0,
      Math.max(0, sections.length - 1)
    );
  }

  function updateActiveSection(force = false) {
    if (!sections.length) return;

    const nextIndex = getActiveSectionIndex();

    if (!force && nextIndex === activeIndex) {
      updateSectionProgress();
      return;
    }

    activeIndex = nextIndex;

    const current = sections[activeIndex];

    if (UI.storyTitle) {
      UI.storyTitle.textContent = current.title;
    }

    sections.forEach((item, index) => {
      const isActive = index === activeIndex;

      item.element.classList.toggle('is-active', isActive);

      const menuLink = UI.menuLinks.find(
        (link) => link.getAttribute('href') === `#${item.id}`
      );

      if (menuLink) {
        if (isActive) {
          menuLink.setAttribute('aria-current', 'location');
        } else {
          menuLink.removeAttribute('aria-current');
        }
      }
    });

    updateArrowState();
    updateSectionProgress();
  }

  /* -------------------------------------------------------
     SECTION PROGRESS
     ------------------------------------------------------- */

  function getSectionProgress(section) {
    if (!section) return 0;

    const element = section.element;
    const rect = element.getBoundingClientRect();

    const scrollY = win.scrollY || win.pageYOffset || 0;
    const viewportHeight =
      win.innerHeight || doc.documentElement.clientHeight;

    const sectionTop = scrollY + rect.top;
    const sectionHeight = element.offsetHeight;

    if (sectionHeight <= viewportHeight) {
      const total =
        Math.max(1, sectionHeight - viewportHeight * 0.35);

      return clamp(
        (scrollY - sectionTop + viewportHeight * 0.35) / total
      );
    }

    const total = Math.max(
      1,
      sectionHeight - viewportHeight
    );

    return clamp(
      (scrollY - sectionTop) / total
    );
  }

  function updateSectionProgress() {
    if (!sections.length || !UI.storyProgressFill) return;

    const current = sections[activeIndex];
    const progress = getSectionProgress(current);

    const percentage = `${progress * 100}%`;

    UI.storyProgressFill.style.width = percentage;

    if (UI.storyProgressOrb) {
      UI.storyProgressOrb.style.left = percentage;
    }

    if (UI.storyProgress) {
      const value = Math.round(progress * 100);

      UI.storyProgress.setAttribute(
        'aria-valuenow',
        String(value)
      );
    }
  }

  /* -------------------------------------------------------
     ARROWS
     ------------------------------------------------------- */

  function updateArrowState() {
    if (!UI.storyPrev || !UI.storyNext) return;

    UI.storyPrev.disabled = activeIndex <= 0;
    UI.storyNext.disabled =
      activeIndex >= sections.length - 1;
  }

  function scrollToSection(index, updateHistory = true) {
    if (!sections.length) return;

    const safeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const target = sections[safeIndex]?.element;

    if (!target) return;

    const headerHeight =
      UI.header?.offsetHeight || 0;

    const top =
      target.getBoundingClientRect().top +
      (win.scrollY || win.pageYOffset || 0) -
      headerHeight +
      CONFIG.scrollOffset;

    const behavior = prefersReducedMotion()
      ? 'auto'
      : 'smooth';

    win.scrollTo({
      top: Math.max(0, top),
      behavior
    });

    if (updateHistory && target.id) {
      try {
        history.pushState(
          null,
          '',
          `#${target.id}`
        );
      } catch (_) {
        // Hash navigation still works without history API.
      }
    }

    activeIndex = safeIndex;
    updateActiveSection(true);
  }

  function goPrevious() {
    if (activeIndex > 0) {
      scrollToSection(activeIndex - 1);
    }
  }

  function goNext() {
    if (activeIndex < sections.length - 1) {
      scrollToSection(activeIndex + 1);
    }
  }

  /* -------------------------------------------------------
     MENU
     ------------------------------------------------------- */

  function updateMenuAria() {
    if (!UI.menu || !UI.menuToggle) return;

    UI.menuToggle.setAttribute(
      'aria-expanded',
      String(menuOpen)
    );

    UI.menuToggle.setAttribute(
      'aria-label',
      menuOpen ? 'Chiudi menu' : 'Apri menu'
    );

    UI.menu.setAttribute(
      'aria-hidden',
      String(!menuOpen)
    );

    /*
     * inert evita che il contenuto del menu chiuso
     * venga raggiunto accidentalmente dalla tastiera.
     */
    if (menuOpen) {
      UI.menu.removeAttribute('inert');
    } else {
      UI.menu.setAttribute('inert', '');
    }
  }

  function openMenu() {
    if (!UI.menu || !UI.menuToggle) return;

    lastFocusedElement = doc.activeElement;

    menuOpen = true;

    UI.menu.classList.add('is-open');
    UI.header?.classList.add('menu-is-open');

    updateMenuAria();

    const firstLink = UI.menuLinks[0];

    if (firstLink) {
      win.requestAnimationFrame(() => {
        firstLink.focus();
      });
    }
  }

  function closeMenu(restoreFocus = true) {
    if (!UI.menu || !UI.menuToggle) return;

    menuOpen = false;

    UI.menu.classList.remove('is-open');
    UI.header?.classList.remove('menu-is-open');

    updateMenuAria();

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === 'function'
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

  function handleMenuLinkClick(event) {
    const link = event.currentTarget;
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('#')) return;

    const id = href.slice(1);

    const index = sections.findIndex(
      (item) => item.id === id
    );

    if (index === -1) return;

    event.preventDefault();

    closeMenu(false);
    scrollToSection(index);
  }

  /* -------------------------------------------------------
     KEYBOARD
     ------------------------------------------------------- */

  function trapMenuFocus(event) {
    if (!menuOpen || event.key !== 'Tab') return;

    const focusable = UI.menuLinks.filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        element.offsetParent !== null
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault();
      closeMenu();
      return;
    }

    trapMenuFocus(event);

    if (menuOpen) return;

    /*
     * Evitiamo di intercettare i tasti quando l'utente
     * sta scrivendo in un campo.
     */
    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable
    ) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      goNext();
    }

    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      goPrevious();
    }

    if (event.key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      scrollToSection(0);
    }

    if (event.key === 'End' && event.ctrlKey) {
      event.preventDefault();
      scrollToSection(sections.length - 1);
    }
  }

  /* -------------------------------------------------------
     SCROLL
     ------------------------------------------------------- */

  function requestScrollUpdate() {
    if (scrollTicking) return;

    scrollTicking = true;

    win.requestAnimationFrame(() => {
      updateActiveSection();
      scrollTicking = false;
    });
  }

  /* -------------------------------------------------------
     HASH / HISTORY
     ------------------------------------------------------- */

  function goToCurrentHash() {
    const hash = win.location.hash;

    if (!hash || hash === '#') {
      updateActiveSection(true);
      return;
    }

    const id = decodeURIComponent(
      hash.slice(1)
    );

    const index = sections.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      updateActiveSection(true);
      return;
    }

    /*
     * Al primo caricamento lasciamo che il browser
     * completi il layout prima di spostarsi.
     */
    win.setTimeout(() => {
      scrollToSection(index, false);
    }, 30);
  }

  function handleHashChange() {
    goToCurrentHash();
  }

  /* -------------------------------------------------------
     STANDBY / INACTIVITY
     ------------------------------------------------------- */

  function resetStandby() {
    if (!UI.standby) return;

    UI.standby.classList.remove('is-visible');

    if (standbyTimer) {
      win.clearTimeout(standbyTimer);
    }

    standbyTimer = win.setTimeout(() => {
      /*
       * Standby volutamente discreto.
       * Non blocca mai l'interazione.
       */
      if (
        !doc.hidden &&
        !menuOpen &&
        UI.standby
      ) {
        UI.standby.classList.add('is-visible');
      }
    }, CONFIG.standbyDelay);
  }

  function setupStandby() {
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
        { passive: true }
      );
    });

    resetStandby();
  }

  /* -------------------------------------------------------
     GSAP — OPTIONAL ENHANCEMENT
     ------------------------------------------------------- */

  function initGSAP() {
    /*
     * GSAP non è necessario per il funzionamento del sito.
     * Se non è disponibile, semplicemente usciamo.
     */
    if (
      prefersReducedMotion() ||
      typeof win.gsap === 'undefined'
    ) {
      return;
    }

    try {
      if (
        typeof win.ScrollTrigger !== 'undefined'
      ) {
        win.gsap.registerPlugin(
          win.ScrollTrigger
        );
      }

      const animatedElements = $$('.story .reveal');

      if (!animatedElements.length) return;

      /*
       * Se ScrollTrigger è disponibile, lo usiamo.
       * Altrimenti fallback a una semplice animazione
       * eseguita al caricamento.
       */
      if (
        typeof win.ScrollTrigger !== 'undefined'
      ) {
        animatedElements.forEach((element) => {
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
        });
      } else {
        win.gsap.to(
          animatedElements,
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
       * GSAP è enhancement:
       * un suo errore NON deve mai impedire
       * il funzionamento del sito.
       */
      console.warn(
        'GSAP enhancement skipped:',
        error
      );
    }
  }

  /* -------------------------------------------------------
     MENU FALLBACK
     ------------------------------------------------------- */

  function ensureMenuFallback() {
    if (!UI.menu) return;

    /*
     * Il CSS/no-JS può comunque rendere il menu leggibile.
     * Qui impostiamo solo lo stato iniziale.
     */
    updateMenuAria();
  }

  /* -------------------------------------------------------
     YEAR
     ------------------------------------------------------- */

  function updateYear() {
    if (!UI.year) return;

    UI.year.textContent = String(
      new Date().getFullYear()
    );
  }

  /* -------------------------------------------------------
     RESIZE
     ------------------------------------------------------- */

  let resizeTimer = null;

  function handleResize() {
    if (resizeTimer) {
      win.clearTimeout(resizeTimer);
    }

    resizeTimer = win.setTimeout(() => {
      updateSectionMeasurements();
      updateActiveSection(true);

      if (
        typeof win.ScrollTrigger !== 'undefined'
      ) {
        try {
          win.ScrollTrigger.refresh();
        } catch (_) {
          // Enhancement only.
        }
      }
    }, 100);
  }

  /* -------------------------------------------------------
     PAGE VISIBILITY / BFCACHE
     ------------------------------------------------------- */

  function handleVisibilityChange() {
    if (doc.hidden) {
      if (standbyTimer) {
        win.clearTimeout(standbyTimer);
      }
      return;
    }

    resetStandby();
    updateSectionMeasurements();
    updateActiveSection(true);
  }

  function handlePageShow() {
    updateSectionMeasurements();
    updateActiveSection(true);
    resetStandby();

    /*
     * Se la pagina viene ripristinata dal BFCache,
     * ci assicuriamo che il loader non torni visibile.
     */
    hideLoader();

    if (
      typeof win.ScrollTrigger !== 'undefined'
    ) {
      try {
        win.ScrollTrigger.refresh();
      } catch (_) {
        // Enhancement only.
      }
    }
  }

  /* -------------------------------------------------------
     EVENTS
     ------------------------------------------------------- */

  function bindEvents() {
    UI.menuToggle?.addEventListener(
      'click',
      toggleMenu
    );

    UI.menuLinks.forEach((link) => {
      link.addEventListener(
        'click',
        handleMenuLinkClick
      );
    });

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
      requestScrollUpdate,
      { passive: true }
    );

    win.addEventListener(
      'resize',
      handleResize,
      { passive: true }
    );

    win.addEventListener(
      'hashchange',
      handleHashChange
    );

    win.addEventListener(
      'popstate',
      handleHashChange
    );

    win.addEventListener(
      'pageshow',
      handlePageShow
    );

    doc.addEventListener(
      'keydown',
      handleGlobalKeydown
    );

    doc.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
  }

  /* -------------------------------------------------------
     INITIALIZATION
     ------------------------------------------------------- */

  function init() {
    try {
      UI = getElements();

      if (!UI) {
        hideLoader();
        return;
      }

      updateYear();

      updateSectionMeasurements();

      ensureMenuFallback();

      bindEvents();

      /*
       * Primo stato della navigazione.
       */
      updateActiveSection(true);

      /*
       * Gestione eventuale deep-link #sezione.
       */
      goToCurrentHash();

      setupStandby();

      /*
       * GSAP viene inizializzato DOPO che la UI
       * è già funzionante.
       */
      win.setTimeout(() => {
        try {
          initGSAP();
        } catch (error) {
          console.warn(
            'Optional animation layer skipped:',
            error
          );
        }
      }, 0);

      /*
       * Il loader non aspetta GSAP.
       * Scompare appena la struttura base è pronta.
       */
      win.requestAnimationFrame(() => {
        hideLoader();
      });

    } catch (error) {
      /*
       * ULTIMO LIVELLO DI SICUREZZA.
       * Qualunque errore di inizializzazione non può
       * lasciare il sito coperto dal loader.
       */
      console.error(
        'Site initialization error:',
        error
      );

      hideLoader();

      /*
       * Tentiamo comunque di rendere la pagina
       * immediatamente utilizzabile.
       */
      try {
        doc.documentElement.classList.remove(
          'is-loading'
        );

        doc.body.classList.remove(
          'is-loading'
        );
      } catch (_) {
        // Nothing else to do.
      }
    }
  }

  /* -------------------------------------------------------
     GLOBAL ERROR SAFETY
     ------------------------------------------------------- */

  /*
   * Se un errore non gestito arriva da uno script esterno
   * (es. GSAP/CDN), il loader viene comunque rimosso.
   */
  win.addEventListener(
    'error',
    () => {
      hideLoader();
    },
    { once: false }
  );

  win.addEventListener(
    'unhandledrejection',
    () => {
      hideLoader();
    },
    { once: false }
  );

  /*
   * Avvio.
   */
  onReady(init);

})();
