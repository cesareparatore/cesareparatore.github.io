(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;

  root.classList.add('js');

  const SELECTORS = {
    loader: '.page-loader',
    header: '.site-header',
    menu: '#site-menu',
    menuTrigger: '.menu-trigger',
    menuLinks: '.site-menu-nav a',
    menuClose: '.chapter-close',
    chapters: '.chapter',
    reveal: '.reveal',
    progressCurrent: '#progress-current',
    progressFill: '#progress-fill',
    progressPoint: '#progress-point',
    previous: '#previous-section',
    previousLabel: '#previous-section-label',
    next: '#next-section',
    nextLabel: '#next-section-label',
    cursor: '#context-cursor',
    standby: '#standby-screen',
    magnetic: '.magnetic'
  };

  const state = {
    initialized: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    menuOpen: false,
    standby: false,

    activeChapter: 0,
    scrollY: window.scrollY,
    framePending: false,

    cursorEnabled:
      window.matchMedia('(pointer:fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    cursorX: -100,
    cursorY: -100,

    idleTimer: null,

    idleDelay: 60000,

    standbyAllowed: true
  };

  const chapters = Array.from(
    document.querySelectorAll(SELECTORS.chapters)
  );

  const loader = document.querySelector(SELECTORS.loader);
  const header = document.querySelector(SELECTORS.header);

  const menu = document.querySelector(SELECTORS.menu);
  const menuTrigger = document.querySelector(SELECTORS.menuTrigger);
  const menuClose = document.querySelector(SELECTORS.menuClose);

  const menuLinks = Array.from(
    document.querySelectorAll(SELECTORS.menuLinks)
  );

  const progressCurrent =
    document.querySelector(SELECTORS.progressCurrent);

  const progressFill =
    document.querySelector(SELECTORS.progressFill);

  const progressPoint =
    document.querySelector(SELECTORS.progressPoint);

  const previous =
    document.querySelector(SELECTORS.previous);

  const previousLabel =
    document.querySelector(SELECTORS.previousLabel);

  const next =
    document.querySelector(SELECTORS.next);

  const nextLabel =
    document.querySelector(SELECTORS.nextLabel);

  const cursor =
    document.querySelector(SELECTORS.cursor);

  const standby =
    document.querySelector(SELECTORS.standby);


  /* =========================================================
     HELPERS
  ========================================================== */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

  const getChapterTitle = chapter =>
    chapter?.dataset.sectionTitle || '';

  const getChapterIndex = chapter =>
    Number(chapter?.dataset.chapterIndex || 0);

  const getChapterByIndex = index =>
    chapters.find(
      chapter => getChapterIndex(chapter) === index
    );

  const isInteractiveElement = element => {
    if (!element) return false;

    return Boolean(
      element.closest(
        'a,button,input,textarea,select,summary,[contenteditable="true"]'
      )
    );
  };


  /* =========================================================
     LOADER
  ========================================================== */

  function hideLoader() {
    if (!loader) return;

    loader.classList.add('is-hidden');
  }

  function setupLoader() {
    if (!loader) return;

    const complete = () => {
      if (state.reducedMotion) {
        hideLoader();
        return;
      }

      window.setTimeout(hideLoader, 300);
    };

    if (document.readyState === 'complete') {
      complete();
    } else {
      window.addEventListener('load', complete, {
        once: true
      });

      window.setTimeout(() => {
        hideLoader();
      }, 5000);
    }
  }


  /* =========================================================
     HEADER
  ========================================================== */

  function updateHeader() {
    if (!header) return;

    header.classList.toggle(
      'is-scrolled',
      state.scrollY > 24
    );
  }


  /* =========================================================
     CHAPTER PROGRESS
  ========================================================== */

  function updateChapterProgress(chapter) {
    if (!chapter) return;

    const rect = chapter.getBoundingClientRect();
    const viewport = window.innerHeight;

    const total = rect.height + viewport;

    const travelled = viewport - rect.top;

    const progress = clamp(
      travelled / total
    );

    chapter.style.setProperty(
      '--chapter-progress',
      progress.toFixed(4)
    );
  }


  function updateAllVisibleProgress() {
    chapters.forEach(chapter => {
      const rect = chapter.getBoundingClientRect();

      const visible =
        rect.bottom > 0 &&
        rect.top < window.innerHeight;

      if (visible) {
        updateChapterProgress(chapter);
      }
    });
  }


  /* =========================================================
     ACTIVE CHAPTER
  ========================================================== */

  function setActiveChapter(index) {
    if (!index || index === state.activeChapter) {
      return;
    }

    state.activeChapter = index;

    chapters.forEach(chapter => {
      const chapterIndex = getChapterIndex(chapter);

      chapter.classList.toggle(
        'is-active',
        chapterIndex === index
      );

      chapter.classList.toggle(
        'is-complete',
        chapterIndex < index
      );
    });

    updateProgressUI();
  }


  function updateProgressUI() {
    if (!chapters.length) return;

    const current =
      getChapterByIndex(state.activeChapter) ||
      chapters[0];

    const currentIndex =
      getChapterIndex(current);

    const total =
      chapters.length;

    const percentage =
      total > 1
        ? ((currentIndex - 1) / (total - 1)) * 100
        : 0;

    if (progressCurrent) {
      progressCurrent.textContent =
        getChapterTitle(current);
    }

    if (progressFill) {
      progressFill.style.width =
        `${clamp(percentage / 100) * 100}%`;
    }

    if (progressPoint) {
      progressPoint.style.left =
        `${clamp(percentage / 100) * 100}%`;
    }

    const previousChapter =
      getChapterByIndex(currentIndex - 1);

    const nextChapter =
      getChapterByIndex(currentIndex + 1);

    if (previousChapter) {
      previous.href =
        `#${previousChapter.id}`;

      previousLabel.textContent =
        String(currentIndex - 1).padStart(2, '0');

      previous.classList.remove('is-disabled');
      previous.removeAttribute('aria-hidden');
      previous.removeAttribute('tabindex');
    } else {
      previous.href = '#01';
      previousLabel.textContent = '';
      previous.classList.add('is-disabled');
      previous.setAttribute('aria-hidden', 'true');
      previous.setAttribute('tabindex', '-1');
    }

    if (nextChapter) {
      next.href =
        `#${nextChapter.id}`;

      nextLabel.textContent =
        String(currentIndex + 1).padStart(2, '0');

      next.setAttribute(
        'aria-label',
        `Vai alla sezione ${String(currentIndex + 1).padStart(2, '0')}`
      );
    } else {
      next.href = '#11';
      nextLabel.textContent = '11';
      next.setAttribute(
        'aria-label',
        'Vai alla sezione 11'
      );
    }
  }


  /* =========================================================
     INTERSECTION OBSERVER
  ========================================================== */

  function setupChapterObserver() {
    if (!chapters.length) return;

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              'is-visible'
            );

            const index =
              getChapterIndex(entry.target);

            setActiveChapter(index);
          });
        },
        {
          root:null,
          rootMargin:'-35% 0px -45% 0px',
          threshold:0
        }
      );

    chapters.forEach(chapter => {
      observer.observe(chapter);
    });
  }


  /* =========================================================
     REVEALS
  ========================================================== */

  function setupRevealObserver() {
    const elements =
      document.querySelectorAll(
        SELECTORS.reveal
      );

    if (!elements.length) return;

    if (state.reducedMotion) {
      elements.forEach(element => {
        element.classList.add('is-visible');
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting
            ) {
              entry.target.classList.add(
                'is-visible'
              );
            }
          });
        },
        {
          root:null,
          rootMargin:'0px 0px -12% 0px',
          threshold:.05
        }
      );

    elements.forEach(element => {
      observer.observe(element);
    });
  }


  /* =========================================================
     MENU
  ========================================================== */

  let menuPreviouslyFocused = null;

  function setMenuState(open) {
    if (!menu || !menuTrigger) return;

    state.menuOpen = open;

    body.classList.toggle(
      'is-menu-open',
      open
    );

    menuTrigger.setAttribute(
      'aria-expanded',
      String(open)
    );

    menuTrigger.setAttribute(
      'aria-label',
      open ? 'Chiudi menu' : 'Apri menu'
    );

    menu.setAttribute(
      'aria-hidden',
      String(!open)
    );

    if (open) {
      menuPreviouslyFocused =
        document.activeElement;

      const firstLink =
        menuLinks[0];

      window.setTimeout(() => {
        (firstLink || menuClose)?.focus();
      }, 350);

    } else {

      window.setTimeout(() => {
        if (
          menuPreviouslyFocused &&
          typeof menuPreviouslyFocused.focus === 'function'
        ) {
          menuPreviouslyFocused.focus();
        } else {
          menuTrigger.focus();
        }
      }, 50);
    }
  }


  function setupMenu() {
    menuTrigger?.addEventListener(
      'click',
      () => {
        setMenuState(!state.menuOpen);
        resetIdleTimer();
      }
    );

    menuClose?.addEventListener(
      'click',
      () => {
        setMenuState(false);
        resetIdleTimer();
      }
    );

    menuLinks.forEach(link => {
      link.addEventListener(
        'click',
        () => {
          setMenuState(false);
          resetIdleTimer();
        }
      );
    });
  }


  function handleMenuKeyboard(event) {
    if (!state.menuOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = [
      ...menuLinks,
      menuClose
    ].filter(Boolean);

    if (!focusables.length) return;

    const first = focusables[0];
    const last =
      focusables[focusables.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }


  /* =========================================================
     ANCHOR NAVIGATION
  ========================================================== */

  function setupAnchorNavigation() {
    document.addEventListener(
      'click',
      event => {
        const link =
          event.target.closest('a[href^="#"]');

        if (!link) return;

        const hash =
          link.getAttribute('href');

        if (!hash || hash === '#') return;

        const target =
          document.querySelector(hash);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior:
            state.reducedMotion
              ? 'auto'
              : 'smooth',
          block:'start'
        });

        history.replaceState(
          null,
          '',
          hash
        );

        resetIdleTimer();
      }
    );
  }


  /* =========================================================
     MAGNETIC
  ========================================================== */

  function setupMagnetic() {
    if (
      state.reducedMotion ||
      !window.matchMedia('(pointer:fine)').matches
    ) {
      return;
    }

    const elements =
      document.querySelectorAll(
        SELECTORS.magnetic
      );

    elements.forEach(element => {

      element.addEventListener(
        'pointermove',
        event => {
          const rect =
            element.getBoundingClientRect();

          const x =
            ((event.clientX - rect.left) / rect.width - .5) * 8;

          const y =
            ((event.clientY - rect.top) / rect.height - .5) * 8;

          element.style.setProperty(
            '--magnetic-x',
            `${x}px`
          );

          element.style.setProperty(
            '--magnetic-y',
            `${y}px`
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
  }


  /* =========================================================
     CONTEXTUAL CURSOR
  ========================================================== */

  function setupCursor() {
    if (!state.cursorEnabled || !cursor) {
      return;
    }

    const updateCursor =
      event => {
        state.cursorX = event.clientX;
        state.cursorY = event.clientY;

        cursor.style.setProperty(
          '--cursor-x',
          `${state.cursorX}px`
        );

        cursor.style.setProperty(
          '--cursor-y',
          `${state.cursorY}px`
        );

        cursor.classList.add('is-active');
      };

    window.addEventListener(
      'pointermove',
      updateCursor,
      { passive:true }
    );

    document.addEventListener(
      'pointerover',
      event => {
        const interactive =
          isInteractiveElement(
            event.target
          );

        const label =
          interactive?.dataset.cursor ||
          (
            event.target.closest(
              'a,button'
            )
              ? 'GO'
              : 'MOVE'
          );

        const cursorLabel =
          cursor.querySelector(
            '.context-cursor-label'
          );

        if (cursorLabel) {
          cursorLabel.textContent =
            label;
        }
      }
    );

    document.addEventListener(
      'pointerleave',
      () => {
        cursor.classList.remove(
          'is-active'
        );
      }
    );
  }


  /* =========================================================
     STANDBY
  ========================================================== */

  function canEnterStandby() {
    if (!state.standbyAllowed) {
      return false;
    }

    if (state.reducedMotion) {
      return false;
    }

    if (state.menuOpen) {
      return false;
    }

    if (
      document.visibilityState !== 'visible'
    ) {
      return false;
    }

    const active =
      document.activeElement;

    if (
      active &&
      (
        active.matches(
          'input,textarea,select'
        ) ||
        active.isContentEditable
      )
    ) {
      return false;
    }

    return true;
  }


  function enterStandby() {
    if (
      state.standby ||
      !canEnterStandby()
    ) {
      return;
    }

    state.standby = true;

    body.classList.add(
      'is-standby'
    );

    standby?.setAttribute(
      'aria-hidden',
      'false'
    );

    if (cursor) {
      cursor.classList.remove(
        'is-active'
      );
    }
  }


  function exitStandby() {
    if (!state.standby) return;

    state.standby = false;

    body.classList.remove(
      'is-standby'
    );

    standby?.setAttribute(
      'aria-hidden',
      'true'
    );
  }


  function resetIdleTimer() {
    window.clearTimeout(
      state.idleTimer
    );

    if (state.standby) {
      exitStandby();
    }

    if (state.reducedMotion) {
      return;
    }

    if (
      document.visibilityState !== 'visible'
    ) {
      return;
    }

    state.idleTimer =
      window.setTimeout(
        enterStandby,
        state.idleDelay
      );
  }


  function setupStandby() {
    if (!standby) return;

    const activityEvents = [
      'pointermove',
      'pointerdown',
      'touchstart',
      'wheel',
      'scroll',
      'keydown',
      'click'
    ];

    activityEvents.forEach(
      eventName => {
        window.addEventListener(
          eventName,
          () => {
            resetIdleTimer();
          },
          {
            passive:true
          }
        );
      }
    );

    document.addEventListener(
      'visibilitychange',
      () => {
        if (
          document.visibilityState !== 'visible'
        ) {
          window.clearTimeout(
            state.idleTimer
          );

          if (state.standby) {
            exitStandby();
          }

          return;
        }

        resetIdleTimer();
      }
    );

    resetIdleTimer();
  }


  /* =========================================================
     CENTRAL SCROLL RAF
  ========================================================== */

  function requestFrame() {
    if (state.framePending) return;

    state.framePending = true;

    window.requestAnimationFrame(
      () => {
        state.framePending = false;

        updateHeader();
        updateAllVisibleProgress();
      }
    );
  }


  function setupScroll() {
    window.addEventListener(
      'scroll',
      () => {
        state.scrollY =
          window.scrollY;

        requestFrame();
      },
      {
        passive:true
      }
    );

    window.addEventListener(
      'resize',
      () => {
        requestFrame();
      },
      {
        passive:true
      }
    );
  }


  /* =========================================================
     INITIAL STATE
  ========================================================== */

  function setupInitialState() {
    chapters.forEach(
      (chapter, index) => {
        chapter.style.setProperty(
          '--chapter-progress',
          index === 0 ? '0' : '0'
        );
      }
    );

    if (chapters[0]) {
      chapters[0].classList.add(
        'is-active',
        'is-visible'
      );

      state.activeChapter =
        getChapterIndex(
          chapters[0]
        );
    }

    updateProgressUI();
    updateHeader();
  }


  /* =========================================================
     HASH
  ========================================================== */

  function handleInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) return;

    const target =
      document.querySelector(hash);

    if (!target) return;

    window.setTimeout(
      () => {
        target.scrollIntoView({
          behavior:'auto',
          block:'start'
        });
      },
      100
    );
  }


  /* =========================================================
     KEYBOARD / FOCUS
  ========================================================== */

  function setupKeyboard() {
    document.addEventListener(
      'keydown',
      handleMenuKeyboard
    );

    document.addEventListener(
      'keydown',
      event => {
        if (
          event.key === 'Escape' &&
          state.standby
        ) {
          exitStandby();
          resetIdleTimer();
        }
      }
    );
  }


  /* =========================================================
     INIT
  ========================================================== */

  function init() {
    if (state.initialized) return;

    state.initialized = true;

    setupLoader();
    setupInitialState();

    setupChapterObserver();
    setupRevealObserver();

    setupMenu();
    setupAnchorNavigation();

    setupMagnetic();
    setupCursor();

    setupScroll();
    setupKeyboard();

    setupStandby();

    handleInitialHash();

    requestFrame();
  }


  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once:true }
    );
  } else {
    init();
  }

})();
