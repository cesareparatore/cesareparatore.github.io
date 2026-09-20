/* ============================================================
   CESARE PARATORE
   MOVIMENTO CON DIREZIONE.
   EXPERIENCE ENGINE
   ============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     01. DOM
     ========================================================== */

  const root = document.documentElement;
  const body = document.body;

  const header = document.querySelector(".site-header");

  const progressCurrent =
    document.getElementById("progress-current");

  const progressFill =
    document.getElementById("progress-fill");

  const progressPoint =
    document.getElementById("progress-point");

  const previousSection =
    document.getElementById("previous-section");

  const previousSectionLabel =
    document.getElementById("previous-section-label");

  const nextSection =
    document.getElementById("next-section");

  const nextSectionLabel =
    document.getElementById("next-section-label");

  const menuTrigger =
    document.querySelector(".menu-trigger");

  const menu =
    document.getElementById("site-menu");

  const menuLinks =
    [...document.querySelectorAll("[data-menu-link]")];

  const pageLoader =
    document.getElementById("page-loader");

  const idleScreen =
    document.getElementById("idle-screen");

  const chapters =
    [...document.querySelectorAll(".chapter")];

  const magneticElements =
    [...document.querySelectorAll(".magnetic")];


  /* ==========================================================
     02. EXPERIENCE CONFIGURATION
     ========================================================== */

  const chapterConfig = [
    {
      id: "chapter-01",
      title: "IL MOVIMENTO È SOLO L'INIZIO."
    },
    {
      id: "chapter-02",
      title: "LA DOMANDA È CAMBIATA."
    },
    {
      id: "chapter-03",
      title: "UNA STRADA NON ERA ABBASTANZA."
    },
    {
      id: "chapter-04",
      title: "POI HO CAPITO CHE NON ERANO CINQUE STRADE."
    },
    {
      id: "chapter-05",
      title: "A QUEL PUNTO, MI SONO FERMATO."
    },
    {
      id: "chapter-06",
      title: "OGGI SO ANCHE DA DOVE PARTO."
    },
    {
      id: "chapter-07",
      title: "LA BASE È QUI. LA DIREZIONE, NO."
    },
    {
      id: "chapter-08",
      title: "ORA QUESTA DIREZIONE PRENDE FORMA."
    },
    {
      id: "chapter-09",
      title: "FORSE È QUI CHE LA STORIA CAMBIA."
    },
    {
      id: "chapter-10",
      title: "PARTIAMO DA QUELLO."
    }
  ];


  /* ==========================================================
     03. SINGLE SOURCE OF TRUTH
     ========================================================== */

  const state = {
    chapter: 1,
    chapterProgress: 0,
    globalProgress: 0,
    scrollDirection: 1,

    reducedMotion:
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches,

    menuOpen: false,
    idle: false,
    loaderComplete: false,

    frameRequested: false,
    dirty: true,
    initialized: false,

    lastScrollY: window.scrollY,

    idleTimer: null,
    idleScrollY: 0,

    focusedBeforeMenu: null,

    resizeTimer: null,

    navigationLock: false
  };


  /* ==========================================================
     04. UTILITIES
     ========================================================== */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const lerp = (a, b, amount) =>
    a + ((b - a) * amount);

  const easeOutCubic = (value) =>
    1 - Math.pow(1 - value, 3);

  const prefersReducedMotion = () =>
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const getChapterByIndex = index =>
    chapterConfig[index] || chapterConfig[0];

  const getChapterElement = index =>
    document.getElementById(
      getChapterByIndex(index - 1).id
    );


  /* ==========================================================
     05. CHAPTER GEOMETRY
     ========================================================== */

  function getDocumentMetrics() {

    const scrollY = window.scrollY;

    const viewportHeight =
      window.innerHeight;

    const maxScroll =
      Math.max(
        1,
        document.documentElement.scrollHeight -
        viewportHeight
      );

    const globalProgress =
      clamp(scrollY / maxScroll);

    return {
      scrollY,
      viewportHeight,
      maxScroll,
      globalProgress
    };
  }


  function calculateChapterState() {

    const {
      scrollY,
      viewportHeight,
      globalProgress
    } = getDocumentMetrics();

    let activeIndex = 0;
    let activeProgress = 0;

    let smallestDistance = Infinity;

    chapters.forEach((chapter, index) => {

      const rect =
        chapter.getBoundingClientRect();

      const absoluteTop =
        rect.top + scrollY;

      const absoluteBottom =
        absoluteTop + chapter.offsetHeight;

      const localStart =
        absoluteTop - viewportHeight * 0.5;

      const localEnd =
        absoluteBottom - viewportHeight * 0.5;

      const localProgress =
        clamp(
          (scrollY - localStart) /
          Math.max(1, localEnd - localStart)
        );

      const distance =
        Math.abs(
          (scrollY + viewportHeight * 0.5) -
          (absoluteTop + chapter.offsetHeight * 0.5)
        );

      if (
        scrollY >= localStart &&
        scrollY <= localEnd
      ) {
        activeIndex = index;
        activeProgress = localProgress;
      }

      if (distance < smallestDistance) {
        smallestDistance = distance;

        if (
          scrollY < localStart ||
          scrollY > localEnd
        ) {
          activeIndex = index;
          activeProgress = localProgress;
        }
      }
    });

    return {
      chapter: activeIndex + 1,
      chapterProgress: clamp(activeProgress),
      globalProgress
    };
  }


  /* ==========================================================
     06. STATE UPDATE
     ========================================================== */

  function updateStateFromScroll() {

    const currentScrollY =
      window.scrollY;

    const delta =
      currentScrollY - state.lastScrollY;

    if (Math.abs(delta) > 0.5) {
      state.scrollDirection =
        delta > 0 ? 1 : -1;
    }

    state.lastScrollY =
      currentScrollY;

    const chapterState =
      calculateChapterState();

    state.chapter =
      chapterState.chapter;

    state.chapterProgress =
      chapterState.chapterProgress;

    state.globalProgress =
      chapterState.globalProgress;

    state.dirty = false;
  }


  /* ==========================================================
     07. CSS STATE
     ========================================================== */

  function renderChapterProgress() {

    chapters.forEach((chapter, index) => {

      let progress = 0;

      if (index + 1 < state.chapter) {
        progress = 1;
      }

      if (index + 1 === state.chapter) {
        progress =
          state.chapterProgress;
      }

      if (index + 1 > state.chapter) {
        progress = 0;
      }

      chapter.style.setProperty(
        "--chapter-progress",
        progress.toFixed(5)
      );

      chapter.style.setProperty(
        "--chapter-index",
        index + 1
      );
    });
  }


  function renderGlobalProgress() {

    root.style.setProperty(
      "--global-progress",
      state.globalProgress.toFixed(5)
    );

    progressFill.style.width =
      `${state.globalProgress * 100}%`;

    progressPoint.style.left =
      `${state.globalProgress * 100}%`;
  }


  /* ==========================================================
     08. HEADER NAVIGATION
     ========================================================== */

  function renderHeaderNavigation() {

    const index =
      state.chapter - 1;

    const current =
      getChapterByIndex(index);

    progressCurrent.textContent =
      current.title;

    const previous =
      chapterConfig[index - 1];

    const next =
      chapterConfig[index + 1];

    if (previous) {

      previousSection.classList.remove(
        "is-disabled"
      );

      previousSection.setAttribute(
        "aria-hidden",
        "false"
      );

      previousSection.tabIndex = 0;

      previousSection.href =
        `#${previous.id}`;

      previousSection.setAttribute(
        "aria-label",
        `Vai alla sezione precedente: ${previous.title}`
      );

      previousSectionLabel.textContent =
        previous.title;

    } else {

      previousSection.classList.add(
        "is-disabled"
      );

      previousSection.setAttribute(
        "aria-hidden",
        "true"
      );

      previousSection.tabIndex = -1;

      previousSection.href =
        "#chapter-01";

      previousSectionLabel.textContent =
        "";
    }


    if (next) {

      nextSection.classList.remove(
        "is-disabled"
      );

      nextSection.href =
        `#${next.id}`;

      nextSection.setAttribute(
        "aria-label",
        `Vai alla sezione successiva: ${next.title}`
      );

      nextSectionLabel.textContent =
        next.title;

    } else {

      nextSection.classList.add(
        "is-disabled"
      );

      nextSection.removeAttribute(
        "href"
      );

      nextSection.setAttribute(
        "aria-disabled",
        "true"
      );

      nextSectionLabel.textContent =
        "";
    }
  }


  /* ==========================================================
     09. RENDER ENGINE
     ========================================================== */

  function render() {

    state.frameRequested = false;

    if (state.menuOpen || state.idle) {
      return;
    }

    if (state.dirty) {
      updateStateFromScroll();
    }

    renderChapterProgress();
    renderGlobalProgress();
    renderHeaderNavigation();
  }


  function requestRender() {

    state.dirty = true;

    if (state.frameRequested) {
      return;
    }

    state.frameRequested = true;

    requestAnimationFrame(render);
  }


  /* ==========================================================
     10. SCROLL
     ========================================================== */

  function onScroll() {

    if (state.idle) {
      return;
    }

    requestRender();
    resetIdleTimer();
  }


  window.addEventListener(
    "scroll",
    onScroll,
    {
      passive: true
    }
  );


  /* ==========================================================
     11. RESIZE
     ========================================================== */

  function onResize() {

    clearTimeout(state.resizeTimer);

    state.resizeTimer =
      setTimeout(() => {

        state.dirty = true;
        requestRender();

      }, 80);
  }


  window.addEventListener(
    "resize",
    onResize,
    {
      passive: true
    }
  );


  /* ==========================================================
     12. DIRECT NAVIGATION
     ========================================================== */

  function navigateToChapter(
    chapterId,
    options = {}
  ) {

    const target =
      document.getElementById(chapterId);

    if (!target) {
      return;
    }

    const behavior =
      state.reducedMotion || options.instant
        ? "auto"
        : "smooth";

    state.navigationLock = true;

    target.scrollIntoView({
      behavior,
      block: "start"
    });

    window.setTimeout(() => {
      state.navigationLock = false;
      requestRender();
    }, behavior === "smooth" ? 900 : 50);
  }


  function handleHashNavigation() {

    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      return;
    }

    requestAnimationFrame(() => {

      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      requestRender();
    });
  }


  window.addEventListener(
    "hashchange",
    handleHashNavigation
  );


  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          'a[href^="#chapter-"]'
        );

      if (!link) {
        return;
      }

      const hash =
        link.getAttribute("href");

      if (!hash) {
        return;
      }

      const target =
        document.querySelector(hash);

      if (!target) {
        return;
      }

      event.preventDefault();

      if (state.menuOpen) {
        closeMenu({
          restoreFocus: false
        });
      }

      window.history.pushState(
        {},
        "",
        hash
      );

      navigateToChapter(
        hash.substring(1)
      );

    }
  );


  /* ==========================================================
     13. INTERSECTION OBSERVER
     ========================================================== */

  const chapterObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }

          const chapterNumber =
            Number(
              entry.target.dataset.chapter
            );

          if (!chapterNumber) {
            return;
          }

          entry.target.dataset.visible =
            "true";
        });
      },
      {
        threshold: 0.15
      }
    );


  chapters.forEach(
    chapter =>
      chapterObserver.observe(chapter)
  );


  /* ==========================================================
     14. MENU
     ========================================================== */

  function getMenuFocusableElements() {

    return [
      menuTrigger,
      ...menuLinks
    ].filter(
      element =>
        element &&
        !element.hasAttribute("disabled")
    );
  }


  function openMenu() {

    if (state.menuOpen) {
      return;
    }

    state.focusedBeforeMenu =
      document.activeElement;

    state.menuOpen = true;

    body.classList.add(
      "is-menu-open"
    );

    menu.classList.add(
      "is-open"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    menu.removeAttribute("inert");

    menuTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    window.clearTimeout(
      state.idleTimer
    );

    const firstLink =
      menuLinks[0];

    window.setTimeout(() => {

      if (firstLink) {
        firstLink.focus();
      }

    }, 60);
  }


  function closeMenu(
    {
      restoreFocus = true
    } = {}
  ) {

    if (!state.menuOpen) {
      return;
    }

    state.menuOpen = false;

    body.classList.remove(
      "is-menu-open"
    );

    menu.classList.remove(
      "is-open"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menu.setAttribute(
      "inert",
      ""
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Apri menu"
    );

    if (
      restoreFocus &&
      state.focusedBeforeMenu &&
      typeof state.focusedBeforeMenu.focus ===
        "function"
    ) {
      state.focusedBeforeMenu.focus();
    }

    state.focusedBeforeMenu =
      null;

    resetIdleTimer();
    requestRender();
  }


  menuTrigger.addEventListener(
    "click",
    () => {

      if (state.menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }

    }
  );


  menuLinks.forEach(link => {

    link.addEventListener(
      "click",
      () => {
        closeMenu({
          restoreFocus: false
        });
      }
    );

  });


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        if (state.menuOpen) {
          closeMenu();
        }

        return;
      }

      if (
        state.menuOpen &&
        event.key === "Tab"
      ) {

        const focusable =
          getMenuFocusableElements();

        if (!focusable.length) {
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[focusable.length - 1];

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

    }
  );


  /* ==========================================================
     15. KEYBOARD CHAPTER NAVIGATION
     ========================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        state.menuOpen ||
        state.idle
      ) {
        return;
      }

      const tag =
        document.activeElement?.tagName;

      const isTypingContext =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT";

      if (isTypingContext) {
        return;
      }

      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp"
      ) {
        return;
      }

      event.preventDefault();

      const direction =
        event.key === "ArrowDown"
          ? 1
          : -1;

      const targetIndex =
        clamp(
          state.chapter - 1 + direction,
          0,
          chapters.length - 1
        );

      const target =
        chapters[targetIndex];

      if (!target) {
        return;
      }

      window.history.pushState(
        {},
        "",
        `#${target.id}`
      );

      navigateToChapter(
        target.id
      );
    }
  );


  /* ==========================================================
     16. MAGNETIC INTERACTION
     ========================================================== */

  const pointerFine =
    window.matchMedia(
      "(pointer: fine)"
    );

  function enableMagnetic(
    element
  ) {

    const strength = 7;

    function move(event) {

      if (
        state.reducedMotion ||
        state.menuOpen ||
        state.idle
      ) {
        return;
      }

      const rect =
        element.getBoundingClientRect();

      const x =
        event.clientX -
        (rect.left + rect.width / 2);

      const y =
        event.clientY -
        (rect.top + rect.height / 2);

      const normalizedX =
        clamp(
          x / (rect.width / 2),
          -1,
          1
        );

      const normalizedY =
        clamp(
          y / (rect.height / 2),
          -1,
          1
        );

      element.style.setProperty(
        "--magnetic-x",
        `${normalizedX * strength}px`
      );

      element.style.setProperty(
        "--magnetic-y",
        `${normalizedY * strength}px`
      );
    }

    function reset() {

      element.style.setProperty(
        "--magnetic-x",
        "0px"
      );

      element.style.setProperty(
        "--magnetic-y",
        "0px"
      );
    }

    element.addEventListener(
      "pointermove",
      move
    );

    element.addEventListener(
      "pointerleave",
      reset
    );

    element.addEventListener(
      "blur",
      reset
    );
  }


  if (
    pointerFine.matches &&
    !state.reducedMotion
  ) {
    magneticElements.forEach(
      enableMagnetic
    );
  }


  /* ==========================================================
     17. IDLE STANDBY
     ========================================================== */

  const IDLE_DELAY =
    45_000;


  function resetIdleTimer() {

    if (
      state.menuOpen ||
      !state.loaderComplete ||
      state.reducedMotion
    ) {
      return;
    }

    window.clearTimeout(
      state.idleTimer
    );

    state.idleTimer =
      window.setTimeout(
        activateIdle,
        IDLE_DELAY
      );
  }


  function activateIdle() {

    if (
      state.menuOpen ||
      !state.loaderComplete ||
      state.idle
    ) {
      return;
    }

    state.idleScrollY =
      window.scrollY;

    state.idle = true;

    body.classList.add(
      "is-idle"
    );

    idleScreen.classList.add(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  function deactivateIdle() {

    if (!state.idle) {
      return;
    }

    state.idle = false;

    body.classList.remove(
      "is-idle"
    );

    idleScreen.classList.remove(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "true"
    );

    window.scrollTo(
      0,
      state.idleScrollY
    );

    state.lastScrollY =
      state.idleScrollY;

    requestRender();

    resetIdleTimer();
  }


  [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach(type => {

    window.addEventListener(
      type,
      () => {

        if (state.idle) {
          deactivateIdle();
        }

        resetIdleTimer();

      },
      {
        passive: true
      }
    );

  });


  /* ==========================================================
     18. VISIBILITY
     ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState ===
        "hidden"
      ) {
        window.clearTimeout(
          state.idleTimer
        );

        return;
      }

      requestRender();
      resetIdleTimer();
    }
  );


  /* ==========================================================
     19. REDUCED MOTION LIVE UPDATE
     ========================================================== */

  const motionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  function updateMotionPreference(
    event
  ) {

    state.reducedMotion =
      event.matches;

    if (state.reducedMotion) {
      deactivateIdle();
    }

    requestRender();
  }


  if (
    typeof motionQuery.addEventListener ===
    "function"
  ) {

    motionQuery.addEventListener(
      "change",
      updateMotionPreference
    );

  } else if (
    typeof motionQuery.addListener ===
    "function"
  ) {

    motionQuery.addListener(
      updateMotionPreference
    );
  }


  /* ==========================================================
     20. LOADER
     ========================================================== */

  let loaderFinished = false;

  function finishLoader() {

    if (loaderFinished) {
      return;
    }

    loaderFinished = true;

    state.loaderComplete = true;

    if (state.reducedMotion) {

      pageLoader.classList.add(
        "is-complete"
      );

      resetIdleTimer();

      return;
    }

    window.setTimeout(() => {

      pageLoader.classList.add(
        "is-complete"
      );

      resetIdleTimer();

    }, 4300);
  }


  function initializeLoader() {

    const fallback =
      window.setTimeout(
        finishLoader,
        6500
      );

    if (
      document.readyState ===
      "complete"
    ) {

      window.clearTimeout(
        fallback
      );

      finishLoader();

      return;
    }

    window.addEventListener(
      "load",
      () => {

        window.clearTimeout(
          fallback
        );

        finishLoader();

      },
      {
        once: true
      }
    );
  }


  /* ==========================================================
     21. INITIAL STATE
     ========================================================== */

  function initialize() {

    state.initialized = true;

    state.reducedMotion =
      prefersReducedMotion();

    updateStateFromScroll();
    renderChapterProgress();
    renderGlobalProgress();
    renderHeaderNavigation();

    handleHashNavigation();

    initializeLoader();
  }


  /* ==========================================================
     22. BOOT
     ========================================================== */

  initialize();

})();
