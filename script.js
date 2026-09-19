(() => {
  'use strict';

  /*
   * CESARE PARATORE
   * MOVIMENTO / CON DIREZIONE.
   *
   * Global interaction layer
   * 01 → 11
   *
   * Principles:
   * - progressive enhancement
   * - one central animation frame loop
   * - IntersectionObserver for chapter state
   * - CSS handles visual interpolation
   * - no content is hidden by JS before initialization
   */

  const doc = document;
  const body = doc.body;
  const root = doc.documentElement;

  const SELECTORS = {
    loader: '.page-loader',
    header: '.site-header',
    menuTrigger: '.menu-trigger',
    menu: '.site-menu',
    menuClose: '.chapter-close',
    menuLinks: '.site-menu a',
    chapters: '.chapter',
    legacySections: '.home-section',
    progressFill: '#progress-fill',
    progressPoint: '#progress-point',
    progressCurrent: '#progress-current',
    previousSection: '#previous-section',
    previousSectionLabel: '#previous-section-label',
    nextSection: '#next-section',
    nextSectionLabel: '#next-section-label',
    magnetic: '.magnetic',
    cursor: '[data-cursor]',
    reveal: '.reveal'
  };

  const chapters = Array.from(doc.querySelectorAll(SELECTORS.chapters));
  const legacySections = Array.from(doc.querySelectorAll(SELECTORS.legacySections));
  const allSections = [...chapters, ...legacySections];

  const chapterCount = chapters.length || 11;

  const state = {
    initialized: false,
    reducedMotion: false,
    menuOpen: false,
    activeChapter: 1,
    previousChapter: null,
    scrollY: window.scrollY || 0,
    ticking: false,
    framePending: false,
    loaderFinished: false,
    pointerFine: window.matchMedia
      ? window.matchMedia('(pointer: fine)').matches
      : false,
    cursorEnabled: false,
    lastCursorX: 0,
    lastCursorY: 0,
    targetCursorX: 0,
    targetCursorY: 0,
    lastScrollDirection: 0
  };

  /*
   * ------------------------------------------------------------
   * Utilities
   * ------------------------------------------------------------
   */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isElementVisible = (element) => {
    if (!element) return false;

    const rect = element.getBoundingClientRect();

    return (
      rect.bottom > 0 &&
      rect.top < window.innerHeight
    );
  };

  const getChapterNumber = (chapter) => {
    if (!chapter) return null;

    const id = chapter.id || '';
    const match = id.match(/\d+/);

    if (match) {
      return Number(match[0]);
    }

    const index = chapters.indexOf(chapter);

    return index >= 0 ? index + 1 : null;
  };

  const getChapter = (number) => {
    if (!number) return null;

    return (
      doc.getElementById(String(number)) ||
      doc.querySelector(`.chapter--${String(number).padStart(2, '0')}`)
    );
  };

  const formatChapter = (number) =>
    String(number).padStart(2, '0');

  const getChapterTitle = (chapter) => {
    if (!chapter) return '';

    return (
      chapter.dataset.sectionTitle ||
      chapter.dataset.chapterTitle ||
      chapter.querySelector('.chapter-title')?.textContent?.trim() ||
      chapter.querySelector('.section-title')?.textContent?.trim() ||
      ''
    );
  };

  const getSectionList = () => {
    if (chapters.length) {
      return chapters;
    }

    return allSections;
  };

  /*
   * ------------------------------------------------------------
   * Reduced motion
   * ------------------------------------------------------------
   */

  const setupReducedMotion = () => {
    state.reducedMotion = prefersReducedMotion();

    root.classList.toggle(
      'is-reduced-motion',
      state.reducedMotion
    );

    const mediaQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    if (!mediaQuery) return;

    const handleChange = (event) => {
      state.reducedMotion = event.matches;

      root.classList.toggle(
        'is-reduced-motion',
        state.reducedMotion
      );

      if (state.reducedMotion) {
        root.style.setProperty('--chapter-progress', '1');
      }

      requestUpdate();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  };

  /*
   * ------------------------------------------------------------
   * Loader
   * ------------------------------------------------------------
   */

  const finishLoader = () => {
    if (state.loaderFinished) return;

    state.loaderFinished = true;

    const loader = doc.querySelector(SELECTORS.loader);

    if (!loader) return;

    if (state.reducedMotion) {
      loader.classList.add('is-hidden');
      return;
    }

    window.setTimeout(() => {
      loader.classList.add('is-hidden');
    }, 1700);
  };

  const setupLoader = () => {
    const loader = doc.querySelector(SELECTORS.loader);

    if (!loader) {
      state.loaderFinished = true;
      return;
    }

    /*
     * The loader remains CSS-driven.
     * JS only removes it after the opening sequence.
     */

    if (state.reducedMotion) {
      loader.classList.add('is-hidden');
      state.loaderFinished = true;
      return;
    }

    window.addEventListener(
      'load',
      finishLoader,
      { once: true }
    );

    /*
     * Safety fallback:
     * the site must never remain blocked by the loader.
     */
    window.setTimeout(finishLoader, 2800);
  };

  /*
   * ------------------------------------------------------------
   * Header / scroll state
   * ------------------------------------------------------------
   */

  const updateHeaderState = () => {
    const header = doc.querySelector(SELECTORS.header);

    if (!header) return;

    header.classList.toggle(
      'is-scrolled',
      state.scrollY > 24
    );
  };

  /*
   * ------------------------------------------------------------
   * Chapter progress
   * ------------------------------------------------------------
   *
   * Each chapter receives:
   *
   * --chapter-progress: 0 → 1
   *
   * CSS can then use this variable for:
   * - SVG drawing
   * - opacity
   * - transforms
   * - point movement
   * - trajectory convergence
   */

  const calculateChapterProgress = (chapter) => {
    if (!chapter) return 0;

    const rect = chapter.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    /*
     * 0:
     * chapter enters from below.
     *
     * 1:
     * chapter has completely passed through the viewport.
     */

    const totalDistance =
      rect.height + viewportHeight;

    const travelled =
      viewportHeight - rect.top;

    return clamp(
      travelled / totalDistance,
      0,
      1
    );
  };

  const updateChapterProgress = () => {
    const sections = getSectionList();

    sections.forEach((section) => {
      const progress = state.reducedMotion
        ? 1
        : calculateChapterProgress(section);

      section.style.setProperty(
        '--chapter-progress',
        progress.toFixed(4)
      );

      section.classList.toggle(
        'is-visible',
        progress > 0.02 && progress < 0.98
      );
    });
  };

  /*
   * ------------------------------------------------------------
   * Active chapter
   * ------------------------------------------------------------
   */

  const setActiveChapter = (number, source = 'observer') => {
    if (!number || number < 1) return;

    const boundedNumber = clamp(
      number,
      1,
      chapterCount
    );

    if (
      state.activeChapter === boundedNumber &&
      source !== 'initial'
    ) {
      return;
    }

    state.previousChapter = state.activeChapter;
    state.activeChapter = boundedNumber;

    chapters.forEach((chapter) => {
      const chapterNumber =
        getChapterNumber(chapter);

      const isActive =
        chapterNumber === boundedNumber;

      const isComplete =
        chapterNumber < boundedNumber;

      chapter.classList.toggle(
        'is-active',
        isActive
      );

      chapter.classList.toggle(
        'is-complete',
        isComplete
      );
    });

    updateProgressUI();
  };

  /*
   * ------------------------------------------------------------
   * Progress bar
   * ------------------------------------------------------------
   */

  const updateProgressUI = () => {
    const fill =
      doc.querySelector(SELECTORS.progressFill);

    const point =
      doc.querySelector(SELECTORS.progressPoint);

    const current =
      doc.querySelector(SELECTORS.progressCurrent);

    const previous =
      doc.querySelector(SELECTORS.previousSection);

    const previousLabel =
      doc.querySelector(SELECTORS.previousSectionLabel);

    const next =
      doc.querySelector(SELECTORS.nextSection);

    const nextLabel =
      doc.querySelector(SELECTORS.nextSectionLabel);

    const currentNumber =
      state.activeChapter;

    const percentage =
      chapterCount > 1
        ? ((currentNumber - 1) / (chapterCount - 1)) * 100
        : 0;

    if (fill) {
      fill.style.width =
        `${percentage}%`;
    }

    if (point) {
      point.style.left =
        `${percentage}%`;
    }

    /*
     * Preserve the existing header wording until JS is active.
     * Once active, the progress label becomes contextual.
     */
    if (current) {
      const chapter = getChapter(currentNumber);
      const title = getChapterTitle(chapter);

      current.textContent =
        title || `${formatChapter(currentNumber)} / ${formatChapter(chapterCount)}`;
    }

    if (previous) {
      if (currentNumber <= 1) {
        previous.classList.add('is-disabled');
        previous.setAttribute('aria-hidden', 'true');
        previous.setAttribute('tabindex', '-1');
        previous.setAttribute('href', '#01');
      } else {
        const previousNumber =
          currentNumber - 1;

        previous.classList.remove('is-disabled');
        previous.removeAttribute('aria-hidden');
        previous.removeAttribute('tabindex');
        previous.setAttribute(
          'href',
          `#${formatChapter(previousNumber)}`
        );
        previous.setAttribute(
          'aria-label',
          `Vai alla sezione ${formatChapter(previousNumber)}`
        );

        if (previousLabel) {
          previousLabel.textContent =
            formatChapter(previousNumber);
        }
      }
    }

    if (next) {
      if (currentNumber >= chapterCount) {
        next.classList.add('is-disabled');
        next.setAttribute('aria-hidden', 'true');
        next.setAttribute('tabindex', '-1');
      } else {
        const nextNumber =
          currentNumber + 1;

        next.classList.remove('is-disabled');
        next.removeAttribute('aria-hidden');
        next.removeAttribute('tabindex');

        next.setAttribute(
          'href',
          `#${formatChapter(nextNumber)}`
        );

        next.setAttribute(
          'aria-label',
          `Vai alla sezione ${formatChapter(nextNumber)}`
        );

        if (nextLabel) {
          nextLabel.textContent =
            formatChapter(nextNumber);
        }
      }
    }
  };

  /*
   * ------------------------------------------------------------
   * IntersectionObserver
   * ------------------------------------------------------------
   */

  const setupChapterObserver = () => {
    if (!chapters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries =
          entries.filter(
            (entry) => entry.isIntersecting
          );

        if (!visibleEntries.length) return;

        /*
         * Choose the chapter whose center is
         * closest to the viewport center.
         */
        visibleEntries.sort((a, b) => {
          const aCenter =
            Math.abs(
              a.boundingClientRect.top +
              a.boundingClientRect.height / 2 -
              window.innerHeight / 2
            );

          const bCenter =
            Math.abs(
              b.boundingClientRect.top +
              b.boundingClientRect.height / 2 -
              window.innerHeight / 2
            );

          return aCenter - bCenter;
        });

        const chapter =
          visibleEntries[0].target;

        const number =
          getChapterNumber(chapter);

        if (number) {
          setActiveChapter(
            number,
            'observer'
          );
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    chapters.forEach((chapter) => {
      observer.observe(chapter);
    });
  };

  /*
   * ------------------------------------------------------------
   * Central requestAnimationFrame
   * ------------------------------------------------------------
   */

  const requestUpdate = () => {
    if (state.framePending) return;

    state.framePending = true;

    window.requestAnimationFrame(() => {
      state.framePending = false;

      updateChapterProgress();
      updateHeaderState();
      updateCursor();
    });
  };

  const handleScroll = () => {
    const currentY =
      window.scrollY || window.pageYOffset;

    const delta =
      currentY - state.scrollY;

    if (delta !== 0) {
      state.lastScrollDirection =
        delta > 0 ? 1 : -1;
    }

    state.scrollY = currentY;

    requestUpdate();
  };

  /*
   * ------------------------------------------------------------
   * Smooth internal navigation
   * ------------------------------------------------------------
   */

  const scrollToTarget = (target) => {
    if (!target) return;

    const header =
      doc.querySelector(SELECTORS.header);

    const headerHeight =
      header?.getBoundingClientRect().height || 0;

    const rect =
      target.getBoundingClientRect();

    const targetY =
      window.scrollY +
      rect.top -
      headerHeight;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: state.reducedMotion
        ? 'auto'
        : 'smooth'
    });
  };

  const setupAnchorNavigation = () => {
    doc.addEventListener(
      'click',
      (event) => {
        const link =
          event.target.closest('a[href^="#"]');

        if (!link) return;

        const href =
          link.getAttribute('href');

        if (
          !href ||
          href === '#' ||
          href.length < 2
        ) {
          return;
        }

        const target =
          doc.querySelector(href);

        if (!target) return;

        event.preventDefault();

        closeMenu();

        scrollToTarget(target);

        /*
         * Preserve browser history without
         * forcing an immediate jump.
         */
        if (
          window.history &&
          window.history.pushState
        ) {
          window.history.pushState(
            null,
            '',
            href
          );
        }
      }
    );
  };

  /*
   * ------------------------------------------------------------
   * Menu
   * ------------------------------------------------------------
   */

  let menuPreviousFocus = null;

  const getFocusableElements = (container) => {
    if (!container) return [];

    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), ' +
        'input:not([disabled]), ' +
        'select:not([disabled]), ' +
        'textarea:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])'
      )
    );
  };

  const openMenu = () => {
    const menu =
      doc.querySelector(SELECTORS.menu);

    const trigger =
      doc.querySelector(SELECTORS.menuTrigger);

    if (!menu || !trigger) return;

    if (state.menuOpen) return;

    menuPreviousFocus =
      doc.activeElement;

    state.menuOpen = true;

    body.classList.add('is-menu-open');
    root.classList.add('is-menu-open');

    trigger.setAttribute(
      'aria-expanded',
      'true'
    );

    trigger.setAttribute(
      'aria-label',
      'Chiudi menu'
    );

    /*
     * Prevent background scrolling.
     */
    body.style.overflow = 'hidden';

    const focusables =
      getFocusableElements(menu);

    if (focusables.length) {
      window.setTimeout(() => {
        focusables[0].focus();
      }, state.reducedMotion ? 0 : 100);
    }

    if (typeof menu.focus === 'function') {
      menu.setAttribute('tabindex', '-1');
    }
  };

  const closeMenu = (restoreFocus = true) => {
    const trigger =
      doc.querySelector(SELECTORS.menuTrigger);

    if (!state.menuOpen) return;

    state.menuOpen = false;

    body.classList.remove('is-menu-open');
    root.classList.remove('is-menu-open');

    if (trigger) {
      trigger.setAttribute(
        'aria-expanded',
        'false'
      );

      trigger.setAttribute(
        'aria-label',
        'Apri menu'
      );
    }

    body.style.overflow = '';

    if (
      restoreFocus &&
      menuPreviousFocus &&
      typeof menuPreviousFocus.focus === 'function'
    ) {
      menuPreviousFocus.focus();
    }

    menuPreviousFocus = null;
  };

  const setupMenu = () => {
    const trigger =
      doc.querySelector(SELECTORS.menuTrigger);

    const menu =
      doc.querySelector(SELECTORS.menu);

    if (!trigger || !menu) return;

    trigger.addEventListener(
      'click',
      () => {
        if (state.menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );

    /*
     * Close button.
     */
    doc.addEventListener(
      'click',
      (event) => {
        const close =
          event.target.closest(
            SELECTORS.menuClose
          );

        if (!close) return;

        event.preventDefault();

        closeMenu();
      }
    );

    /*
     * Menu navigation.
     */
    menu.addEventListener(
      'click',
      (event) => {
        const link =
          event.target.closest('a[href]');

        if (!link) return;

        const href =
          link.getAttribute('href');

        if (
          href &&
          href.startsWith('#')
        ) {
          const target =
            doc.querySelector(href);

          if (target) {
            event.preventDefault();

            closeMenu(false);

            window.setTimeout(() => {
              scrollToTarget(target);

              if (
                window.history &&
                window.history.pushState
              ) {
                window.history.pushState(
                  null,
                  '',
                  href
                );
              }
            }, state.reducedMotion ? 0 : 50);
          }
        } else {
          closeMenu(false);
        }
      }
    );
  };

  /*
   * ------------------------------------------------------------
   * Keyboard accessibility
   * ------------------------------------------------------------
   */

  const trapMenuFocus = (event) => {
    if (!state.menuOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    const menu =
      doc.querySelector(SELECTORS.menu);

    const focusables =
      getFocusableElements(menu);

    if (!focusables.length) return;

    const first =
      focusables[0];

    const last =
      focusables[focusables.length - 1];

    if (
      event.shiftKey &&
      doc.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      doc.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  };

  const setupKeyboard = () => {
    doc.addEventListener(
      'keydown',
      trapMenuFocus
    );
  };

  /*
   * ------------------------------------------------------------
   * Magnetic interaction
   * ------------------------------------------------------------
   *
   * Kept deliberately subtle.
   * Disabled on touch and reduced motion.
   */

  const setupMagneticElements = () => {
    if (
      !state.pointerFine ||
      state.reducedMotion
    ) {
      return;
    }

    const elements =
      Array.from(
        doc.querySelectorAll(
          SELECTORS.magnetic
        )
      );

    elements.forEach((element) => {
      element.addEventListener(
        'pointermove',
        (event) => {
          const rect =
            element.getBoundingClientRect();

          const x =
            event.clientX -
            (rect.left + rect.width / 2);

          const y =
            event.clientY -
            (rect.top + rect.height / 2);

          const strength =
            0.08;

          element.style.setProperty(
            '--magnetic-x',
            `${x * strength}px`
          );

          element.style.setProperty(
            '--magnetic-y',
            `${y * strength}px`
          );
        }
      );

      element.addEventListener(
        'pointerleave',
        () => {
          element.style.setProperty(
            '--magnetic-x',
            '0px'
          );

          element.style.setProperty(
            '--magnetic-y',
            '0px'
          );
        }
      );
    });
  };

  /*
   * ------------------------------------------------------------
   * Contextual cursor
   * ------------------------------------------------------------
   *
   * Optional enhancement.
   * Never required for navigation.
   */

  const createCursor = () => {
    if (
      !state.pointerFine ||
      state.reducedMotion
    ) {
      return null;
    }

    if (doc.querySelector('.context-cursor')) {
      return doc.querySelector('.context-cursor');
    }

    const cursor =
      doc.createElement('div');

    cursor.className =
      'context-cursor';

    cursor.setAttribute(
      'aria-hidden',
      'true'
    );

    cursor.innerHTML =
      '<span class="context-cursor__label"></span>';

    body.appendChild(cursor);

    state.cursorEnabled = true;

    return cursor;
  };

  const updateCursor = () => {
    if (!state.cursorEnabled) return;

    const cursor =
      doc.querySelector('.context-cursor');

    if (!cursor) return;

    state.lastCursorX =
      lerp(
        state.lastCursorX,
        state.targetCursorX,
        0.16
      );

    state.lastCursorY =
      lerp(
        state.lastCursorY,
        state.targetCursorY,
        0.16
      );

    cursor.style.transform =
      `translate3d(${state.lastCursorX}px, ${state.lastCursorY}px, 0)`;
  };

  const setCursorLabel = (label) => {
    const cursor =
      doc.querySelector('.context-cursor');

    if (!cursor) return;

    const labelElement =
      cursor.querySelector(
        '.context-cursor__label'
      );

    if (labelElement) {
      labelElement.textContent =
        label || '';
    }

    cursor.classList.toggle(
      'is-visible',
      Boolean(label)
    );
  };

  const setupCursor = () => {
    const cursor =
      createCursor();

    if (!cursor) return;

    window.addEventListener(
      'pointermove',
      (event) => {
        state.targetCursorX =
          event.clientX;

        state.targetCursorY =
          event.clientY;

        requestUpdate();
      },
      { passive: true }
    );

    doc.addEventListener(
      'pointerover',
      (event) => {
        const interactive =
          event.target.closest(
            'a, button, [data-cursor]'
          );

        if (!interactive) {
          setCursorLabel('');
          return;
        }

        const custom =
          interactive.dataset.cursor;

        if (custom) {
          setCursorLabel(custom);
          return;
        }

        if (
          interactive.matches(
            '.menu-trigger'
          )
        ) {
          setCursorLabel(
            state.menuOpen
              ? 'CLOSE'
              : 'MENU'
          );

          return;
        }

        if (
          interactive.matches(
            'a[href^="#"]'
          )
        ) {
          setCursorLabel('MOVE');
          return;
        }

        setCursorLabel('OPEN');
      }
    );

    doc.addEventListener(
      'pointerout',
      (event) => {
        const related =
          event.relatedTarget;

        if (
          related &&
          related.closest &&
          related.closest(
            'a, button, [data-cursor]'
          )
        ) {
          return;
        }

        setCursorLabel('');
      }
    );
  };

  /*
   * ------------------------------------------------------------
   * Reveal observer
   * ------------------------------------------------------------
   *
   * Content is visible by default.
   * JS only adds is-visible after detection.
   */

  const setupRevealObserver = () => {
    const elements =
      Array.from(
        doc.querySelectorAll(
          SELECTORS.reveal
        )
      );

    if (!elements.length) return;

    if (
      state.reducedMotion ||
      !('IntersectionObserver' in window)
    ) {
      elements.forEach((element) => {
        element.classList.add('is-visible');
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              'is-visible'
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -12% 0px',
          threshold: 0.05
        }
      );

    elements.forEach((element) => {
      observer.observe(element);
    });
  };

  /*
   * ------------------------------------------------------------
   * SVG trajectory helpers
   * ------------------------------------------------------------
   *
   * CSS controls the actual visual drawing.
   * JS only marks trajectories as ready/visible.
   */

  const setupTrajectories = () => {
    const trajectories =
      Array.from(
        doc.querySelectorAll(
          '[data-trajectory]'
        )
      );

    trajectories.forEach((trajectory) => {
      trajectory.setAttribute(
        'aria-hidden',
        'true'
      );

      trajectory.setAttribute(
        'focusable',
        'false'
      );

      trajectory.classList.add(
        'trajectory-ready'
      );
    });
  };

  /*
   * ------------------------------------------------------------
   * Chapter-specific semantic states
   * ------------------------------------------------------------
   *
   * This is intentionally small.
   * Complex choreography belongs to CSS
   * and the chapter's own markup.
   */

  const updateChapterSemanticState = () => {
    chapters.forEach((chapter) => {
      const number =
        getChapterNumber(chapter);

      if (!number) return;

      chapter.dataset.progress =
        calculateChapterProgress(
          chapter
        ).toFixed(3);

      /*
       * Useful hooks:
       *
       * .chapter--01
       * .chapter--02
       * ...
       * .chapter--11
       *
       * CSS can react without JS knowing
       * the visual details of each chapter.
       */
    });
  };

  /*
   * ------------------------------------------------------------
   * Initial active chapter
   * ------------------------------------------------------------
   */

  const detectInitialChapter = () => {
    if (!chapters.length) {
      setActiveChapter(1, 'initial');
      return;
    }

    let bestChapter = chapters[0];
    let bestDistance = Infinity;

    const viewportCenter =
      window.innerHeight / 2;

    chapters.forEach((chapter) => {
      const rect =
        chapter.getBoundingClientRect();

      const center =
        rect.top +
        rect.height / 2;

      const distance =
        Math.abs(
          center -
          viewportCenter
        );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestChapter = chapter;
      }
    });

    const number =
      getChapterNumber(bestChapter) || 1;

    setActiveChapter(
      number,
      'initial'
    );
  };

  /*
   * ------------------------------------------------------------
   * Resize
   * ------------------------------------------------------------
   */

  let resizeTimer = null;

  const handleResize = () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      state.pointerFine =
        window.matchMedia
          ? window.matchMedia(
              '(pointer: fine)'
            ).matches
          : false;

      requestUpdate();
      updateChapterSemanticState();
    }, 100);
  };

  /*
   * ------------------------------------------------------------
   * Page visibility
   * ------------------------------------------------------------
   */

  const setupVisibilityHandling = () => {
    document.addEventListener(
      'visibilitychange',
      () => {
        if (
          document.visibilityState === 'visible'
        ) {
          requestUpdate();
        }
      }
    );
  };

  /*
   * ------------------------------------------------------------
   * Hash navigation on initial load
   * ------------------------------------------------------------
   */

  const handleInitialHash = () => {
    const hash =
      window.location.hash;

    if (!hash || hash === '#') return;

    const target =
      doc.querySelector(hash);

    if (!target) return;

    /*
     * Let layout settle before scrolling.
     */
    window.setTimeout(() => {
      scrollToTarget(target);
    }, state.reducedMotion ? 0 : 100);
  };

  /*
   * ------------------------------------------------------------
   * Scroll listeners
   * ------------------------------------------------------------
   */

  const setupScroll = () => {
    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    );

    window.addEventListener(
      'resize',
      handleResize,
      {
        passive: true
      }
    );
  };

  /*
   * ------------------------------------------------------------
   * Focus handling
   * ------------------------------------------------------------
   */

  const setupFocusHandling = () => {
    doc.addEventListener(
      'focusin',
      (event) => {
        const element =
          event.target.closest(
            'a, button, input, textarea, select, [tabindex]'
          );

        if (!element) return;

        element.classList.add(
          'is-keyboard-focus'
        );
      }
    );

    doc.addEventListener(
      'focusout',
      (event) => {
        const element =
          event.target.closest(
            'a, button, input, textarea, select, [tabindex]'
          );

        if (!element) return;

        element.classList.remove(
          'is-keyboard-focus'
        );
      }
    );
  };

  /*
   * ------------------------------------------------------------
   * Body ready state
   * ------------------------------------------------------------
   */

  const setReadyState = () => {
    body.classList.add(
      'is-js-ready'
    );

    root.classList.add(
      'is-js-ready'
    );
  };

  /*
   * ------------------------------------------------------------
   * Main initialization
   * ------------------------------------------------------------
   */

  const init = () => {
    if (state.initialized) return;

    state.initialized = true;

    setupReducedMotion();

    setReadyState();

    setupLoader();

    setupScroll();

    setupChapterObserver();

    setupAnchorNavigation();

    setupMenu();

    setupKeyboard();

    setupRevealObserver();

    setupTrajectories();

    setupMagneticElements();

    setupCursor();

    setupVisibilityHandling();

    setupFocusHandling();

    detectInitialChapter();

    updateChapterProgress();

    updateHeaderState();

    updateProgressUI();

    updateChapterSemanticState();

    handleInitialHash();

    /*
     * First visual update.
     */
    requestUpdate();
  };

  /*
   * ------------------------------------------------------------
   * Start
   * ------------------------------------------------------------
   */

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
