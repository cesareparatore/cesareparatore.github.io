/* ================================================================
   MOVIMENTO CON DIREZIONE
   Cesare Paratore
   Design Engineering — Experience Engine
================================================================ */

(() => {
  "use strict";


  /* ==============================================================
     01. DOM
  ============================================================== */

  const root = document.documentElement;
  const body = document.body;

  const header = document.getElementById("site-header");

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
    document.getElementById("menu-trigger");

  const siteMenu =
    document.getElementById("site-menu");

  const menuLinks =
    [...document.querySelectorAll("[data-menu-link]")];

  const pageLoader =
    document.getElementById("page-loader");

  const idleScreen =
    document.getElementById("idle-screen");

  const chapters =
    [...document.querySelectorAll(".chapter")];

  const sectionsCount =
    chapters.length;


  /* ==============================================================
     02. CONFIGURATION
  ============================================================== */

  const CONFIG = {

    idleDelay: 45000,

    loaderFallback: 6000,

    loaderMinimum: 3900,

    scrollEpsilon: 0.001,

    magneticMax: 4,

    magneticRadius: 110,

    resizeDebounce: 120

  };


  /* ==============================================================
     03. STATE
  ============================================================== */

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

    resizeTimer: null

  };


  /* ==============================================================
     04. CHAPTER DATA
  ============================================================== */

  const chapterData =
    chapters.map((chapter, index) => {

      return {

        element: chapter,

        index,

        number: index + 1,

        title:
          chapter.dataset.title ||
          "",

        shortTitle:
          chapter.dataset.shortTitle ||
          "",

        id:
          chapter.id

      };

    });


  /* ==============================================================
     05. UTILITIES
  ============================================================== */

  const clamp = (value, min = 0, max = 1) => {

    return Math.min(
      max,
      Math.max(min, value)
    );

  };


  const lerp = (a, b, t) => {

    return a + ((b - a) * t);

  };


  const easeOut = (t) => {

    return 1 - Math.pow(1 - t, 3);

  };


  const getViewportHeight = () => {

    return (
      window.visualViewport?.height ||
      window.innerHeight
    );

  };


  const getScrollMax = () => {

    return Math.max(
      1,
      document.documentElement.scrollHeight -
      getViewportHeight()
    );

  };


  const getGlobalProgress = () => {

    return clamp(
      window.scrollY / getScrollMax()
    );

  };


  const getChapterMetrics = (chapter) => {

    const rect =
      chapter.element.getBoundingClientRect();

    const viewportHeight =
      getViewportHeight();

    const chapterHeight =
      Math.max(
        1,
        chapter.element.offsetHeight
      );

    /*
      A chapter is treated as a scroll-controlled stage.

      Progress 0:
      chapter enters the sticky stage.

      Progress 1:
      chapter leaves the sticky stage.
    */

    const scrollableDistance =
      Math.max(
        1,
        chapterHeight - viewportHeight
      );

    const progress =
      clamp(
        -rect.top / scrollableDistance
      );

    return {
      rect,
      chapterHeight,
      scrollableDistance,
      progress
    };

  };


  /* ==============================================================
     06. ACTIVE CHAPTER RESOLUTION
  ============================================================== */

  const resolveActiveChapter = () => {

    const viewportCenter =
      getViewportHeight() * 0.5;

    let bestIndex = 0;
    let bestDistance = Infinity;

    chapterData.forEach((chapter, index) => {

      const rect =
        chapter.element.getBoundingClientRect();

      const center =
        rect.top + (rect.height * 0.5);

      const distance =
        Math.abs(center - viewportCenter);

      /*
        Prefer chapters that actually intersect the viewport.
      */

      const intersects =
        rect.bottom > 0 &&
        rect.top < getViewportHeight();

      const weightedDistance =
        intersects
          ? distance * 0.25
          : distance;

      if (weightedDistance < bestDistance) {

        bestDistance =
          weightedDistance;

        bestIndex =
          index;

      }

    });

    return bestIndex;

  };


  /* ==============================================================
     07. STATE CALCULATION
  ============================================================== */

  const calculateState = () => {

    const scrollY =
      window.scrollY;

    const delta =
      scrollY - state.lastScrollY;

    if (
      Math.abs(delta) >
      CONFIG.scrollEpsilon
    ) {

      state.scrollDirection =
        delta >= 0
          ? 1
          : -1;

    }

    state.lastScrollY =
      scrollY;

    const activeIndex =
      resolveActiveChapter();

    const activeChapter =
      chapterData[activeIndex];

    const metrics =
      getChapterMetrics(activeChapter);

    state.chapter =
      activeChapter.number;

    state.chapterProgress =
      metrics.progress;

    state.globalProgress =
      getGlobalProgress();

  };


  /* ==============================================================
     08. STATE → CSS
  ============================================================== */

  const renderState = () => {

    root.style.setProperty(
      "--chapter-progress",
      state.chapterProgress.toFixed(5)
    );

    root.style.setProperty(
      "--global-progress",
      state.globalProgress.toFixed(5)
    );

    updateChapterClasses();

    updateHeader();

    state.dirty = false;

  };


  /* ==============================================================
     09. CHAPTER CLASSES
  ============================================================== */

  const updateChapterClasses = () => {

    const activeIndex =
      state.chapter - 1;

    chapterData.forEach((chapter, index) => {

      const isActive =
        index === activeIndex;

      chapter.element.classList.toggle(
        "is-active",
        isActive
      );

      chapter.element.classList.toggle(
        "is-before",
        index < activeIndex
      );

      chapter.element.classList.toggle(
        "is-after",
        index > activeIndex
      );

      /*
        Every chapter receives its own progress.

        This is intentionally done without independent
        animation timelines.
      */

      const metrics =
        getChapterMetrics(chapter);

      chapter.element.style.setProperty(
        "--chapter-progress",
        metrics.progress.toFixed(5)
      );

    });

  };


  /* ==============================================================
     10. HEADER
  ============================================================== */

  const updateHeader = () => {

    const current =
      chapterData[state.chapter - 1];

    if (!current) {
      return;
    }

    progressCurrent.textContent =
      current.title;

    progressFill.style.width =
      `${state.globalProgress * 100}%`;

    progressPoint.style.left =
      `${state.globalProgress * 100}%`;

    updateSectionJump();

  };


  const updateSectionJump = () => {

    const currentIndex =
      state.chapter - 1;

    const previous =
      chapterData[currentIndex - 1];

    const next =
      chapterData[currentIndex + 1];


    /* Previous */

    if (previous) {

      previousSection.classList.remove(
        "is-disabled"
      );

      previousSection.setAttribute(
        "aria-hidden",
        "false"
      );

      previousSection.setAttribute(
        "tabindex",
        "0"
      );

      previousSection.setAttribute(
        "href",
        `#${previous.id}`
      );

      previousSection.setAttribute(
        "aria-label",
        `Vai a ${previous.title}`
      );

      previousSectionLabel.textContent =
        previous.shortTitle;

    } else {

      previousSection.classList.add(
        "is-disabled"
      );

      previousSection.setAttribute(
        "aria-hidden",
        "true"
      );

      previousSection.setAttribute(
        "tabindex",
        "-1"
      );

      previousSectionLabel.textContent =
        "";

    }


    /* Next */

    if (next) {

      nextSection.classList.remove(
        "is-disabled"
      );

      nextSection.setAttribute(
        "href",
        `#${next.id}`
      );

      nextSection.setAttribute(
        "aria-label",
        `Vai a ${next.title}`
      );

      nextSectionLabel.textContent =
        next.shortTitle;

    } else {

      nextSection.classList.add(
        "is-disabled"
      );

      nextSection.setAttribute(
        "href",
        "#chapter-10"
      );

      nextSection.setAttribute(
        "aria-label",
        "Ultima sezione"
      );

      nextSectionLabel.textContent =
        "";

    }

  };


  /* ==============================================================
     11. FRAME ENGINE
  ============================================================== */

  const requestFrame = () => {

    if (state.frameRequested) {
      return;
    }

    state.frameRequested = true;

    requestAnimationFrame(() => {

      state.frameRequested = false;

      if (
        !state.dirty ||
        state.menuOpen ||
        state.idle
      ) {
        return;
      }

      /*
        Read → calculate → write.

        One centralized frame.
      */

      calculateState();

      renderState();

    });

  };


  const markDirty = () => {

    state.dirty = true;

    requestFrame();

    resetIdleTimer();

  };


  /* ==============================================================
     12. SCROLL
  ============================================================== */

  const onScroll = () => {

    if (
      state.menuOpen ||
      state.idle
    ) {
      return;
    }

    markDirty();

  };


  /* ==============================================================
     13. RESIZE
  ============================================================== */

  const onResize = () => {

    clearTimeout(
      state.resizeTimer
    );

    state.resizeTimer =
      setTimeout(() => {

        state.dirty = true;

        requestFrame();

      }, CONFIG.resizeDebounce);

    resetIdleTimer();

  };


  /* ==============================================================
     14. DIRECT NAVIGATION
  ============================================================== */

  const scrollToChapter = (
    chapterId,
    behavior = "smooth"
  ) => {

    const chapter =
      document.getElementById(
        chapterId
      );

    if (!chapter) {
      return;
    }

    const target =
      chapter.getBoundingClientRect().top +
      window.scrollY -
      2;

    window.scrollTo({
      top: Math.max(0, target),
      behavior:
        state.reducedMotion
          ? "auto"
          : behavior
    });

  };


  const handleAnchorNavigation = (event) => {

    const link =
      event.currentTarget;

    const href =
      link.getAttribute("href");

    if (
      !href ||
      !href.startsWith("#") ||
      href.length <= 1
    ) {
      return;
    }

    const target =
      document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    if (state.menuOpen) {
      closeMenu();
    }

    history.pushState(
      null,
      "",
      href
    );

    scrollToChapter(
      target.id
    );

    resetIdleTimer();

  };


  /* ==============================================================
     15. MENU
  ============================================================== */

  let menuFocusableElements = [];


  const updateMenuFocusableElements = () => {

    menuFocusableElements =
      [
        ...siteMenu.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ].filter(
        element =>
          !element.hasAttribute("inert")
      );

  };


  const openMenu = () => {

    if (state.menuOpen) {
      return;
    }

    state.focusedBeforeMenu =
      document.activeElement;

    state.menuOpen = true;

    body.classList.add(
      "is-menu-open"
    );

    root.classList.add(
      "is-scroll-locked"
    );

    body.classList.add(
      "is-scroll-locked"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    siteMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    siteMenu.removeAttribute(
      "inert"
    );

    updateMenuFocusableElements();

    resetIdleTimer();

    /*
      Give the menu one frame to become visible,
      then move focus into it.
    */

    requestAnimationFrame(() => {

      if (
        menuFocusableElements.length
      ) {

        menuFocusableElements[0]
          .focus();

      }

    });

  };


  const closeMenu = () => {

    if (!state.menuOpen) {
      return;
    }

    state.menuOpen = false;

    body.classList.remove(
      "is-menu-open"
    );

    root.classList.remove(
      "is-scroll-locked"
    );

    body.classList.remove(
      "is-scroll-locked"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Apri menu"
    );

    siteMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    siteMenu.setAttribute(
      "inert",
      ""
    );

    resetIdleTimer();

    if (
      state.focusedBeforeMenu &&
      typeof state.focusedBeforeMenu.focus === "function"
    ) {

      state.focusedBeforeMenu.focus();

    }

    state.focusedBeforeMenu =
      null;

    state.dirty = true;

    requestFrame();

  };


  const toggleMenu = () => {

    if (state.menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  };


  const handleMenuKeyboard = (event) => {

    if (!state.menuOpen) {
      return;
    }

    if (event.key === "Escape") {

      event.preventDefault();

      closeMenu();

      return;

    }

    if (
      event.key !== "Tab" ||
      !menuFocusableElements.length
    ) {
      return;
    }

    const first =
      menuFocusableElements[0];

    const last =
      menuFocusableElements[
        menuFocusableElements.length - 1
      ];

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

  };


  /* ==============================================================
     16. LOADER
  ============================================================== */

  let loaderStartedAt =
    performance.now();


  const completeLoader = () => {

    if (state.loaderComplete) {
      return;
    }

    const elapsed =
      performance.now() -
      loaderStartedAt;

    const remaining =
      Math.max(
        0,
        CONFIG.loaderMinimum -
        elapsed
      );

    setTimeout(() => {

      if (state.loaderComplete) {
        return;
      }

      state.loaderComplete = true;

      pageLoader.classList.add(
        "is-complete"
      );

      window.setTimeout(() => {

        pageLoader.style.display =
          "none";

      }, 1000);

      state.dirty = true;

      requestFrame();

      resetIdleTimer();

    }, state.reducedMotion ? 100 : remaining);

  };


  const initializeLoader = () => {

    loaderStartedAt =
      performance.now();

    /*
      The loader is deliberately connected to window.load,
      because the opening should not reveal an incompletely
      loaded visual field.
    */

    if (document.readyState === "complete") {

      completeLoader();

    } else {

      window.addEventListener(
        "load",
        completeLoader,
        {
          once: true
        }
      );

    }

    /*
      Absolute safety fallback.
      The page must never remain blocked by the loader.
    */

    window.setTimeout(
      completeLoader,
      CONFIG.loaderFallback
    );

  };


  /* ==============================================================
     17. IDLE STANDBY
  ============================================================== */

  const clearIdleTimer = () => {

    if (state.idleTimer) {

      window.clearTimeout(
        state.idleTimer
      );

      state.idleTimer = null;

    }

  };


  const resetIdleTimer = () => {

    clearIdleTimer();

    if (
      !state.loaderComplete ||
      state.menuOpen ||
      state.idle
    ) {
      return;
    }

    state.idleTimer =
      window.setTimeout(
        enterIdle,
        CONFIG.idleDelay
      );

  };


  const enterIdle = () => {

    if (
      !state.loaderComplete ||
      state.menuOpen ||
      state.idle
    ) {
      return;
    }

    state.idle = true;

    state.idleScrollY =
      window.scrollY;

    idleScreen.classList.add(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "false"
    );

    idleScreen.removeAttribute(
      "inert"
    );

  };


  const exitIdle = () => {

    if (!state.idle) {
      resetIdleTimer();
      return;
    }

    state.idle = false;

    idleScreen.classList.remove(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "true"
    );

    idleScreen.setAttribute(
      "inert",
      ""
    );

    /*
      Restore exactly the position from which
      the standby screen appeared.
    */

    window.scrollTo({
      top: state.idleScrollY,
      behavior: "auto"
    });

    state.lastScrollY =
      state.idleScrollY;

    state.dirty = true;

    requestFrame();

    resetIdleTimer();

  };


  const handleActivity = () => {

    if (state.idle) {

      exitIdle();

    } else {

      resetIdleTimer();

    }

  };


  /* ==============================================================
     18. MAGNETIC INTERACTION
  ============================================================== */

  const magneticElements =
    [
      ...document.querySelectorAll(".magnetic")
    ];


  const supportsHover =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;


  const initializeMagnetic = () => {

    if (
      !supportsHover ||
      state.reducedMotion
    ) {
      return;
    }

    magneticElements.forEach(element => {

      element.addEventListener(
        "pointermove",
        event => {

          const rect =
            element.getBoundingClientRect();

          const centerX =
            rect.left +
            rect.width / 2;

          const centerY =
            rect.top +
            rect.height / 2;

          const distanceX =
            event.clientX - centerX;

          const distanceY =
            event.clientY - centerY;

          const distance =
            Math.sqrt(
              distanceX * distanceX +
              distanceY * distanceY
            );

          if (
            distance >
            CONFIG.magneticRadius
          ) {

            return;

          }

          const strength =
            1 -
            (
              distance /
              CONFIG.magneticRadius
            );

          const x =
            distanceX *
            strength *
            .08;

          const y =
            distanceY *
            strength *
            .08;

          element.style.setProperty(
            "--magnetic-x",
            `${clamp(
              x,
              -CONFIG.magneticMax,
              CONFIG.magneticMax
            )}px`
          );

          element.style.setProperty(
            "--magnetic-y",
            `${clamp(
              y,
              -CONFIG.magneticMax,
              CONFIG.magneticMax
            )}px`
          );

        }
      );

      element.addEventListener(
        "pointerleave",
        () => {

          element.style.setProperty(
            "--magnetic-x",
            "0px"
          );

          element.style.setProperty(
            "--magnetic-y",
            "0px"
          );

        }
      );

    });

  };


  /* ==============================================================
     19. KEYBOARD
  ============================================================== */

  const handleKeydown = (event) => {

    if (state.menuOpen) {

      handleMenuKeyboard(event);

      return;

    }

    if (event.key === "Escape") {

      if (state.idle) {

        exitIdle();

      }

      return;

    }

    if (
      event.key === "ArrowDown" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {

      const next =
        chapterData[state.chapter];

      if (next) {

        event.preventDefault();

        scrollToChapter(
          next.id
        );

      }

    }

    if (
      event.key === "ArrowUp" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {

      const previous =
        chapterData[
          state.chapter - 2
        ];

      if (previous) {

        event.preventDefault();

        scrollToChapter(
          previous.id
        );

      }

    }

  };


  /* ==============================================================
     20. INTERSECTION OBSERVER
  ============================================================== */

  const initializeObserver = () => {

    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.dataset.visible =
                "true";

            } else {

              entry.target.dataset.visible =
                "false";

            }

          });

        },
        {
          root: null,
          threshold: [
            0,
            .25,
            .5,
            .75,
            1
          ]
        }
      );

    chapters.forEach(chapter => {

      observer.observe(chapter);

    });

  };


  /* ==============================================================
     21. VISIBILITY
  ============================================================== */

  const handleVisibilityChange = () => {

    if (
      document.visibilityState ===
      "hidden"
    ) {

      clearIdleTimer();

      return;

    }

    state.lastScrollY =
      window.scrollY;

    state.dirty = true;

    requestFrame();

    resetIdleTimer();

  };


  /* ==============================================================
     22. EVENT BINDINGS
  ============================================================== */

  window.addEventListener(
    "scroll",
    onScroll,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    onResize,
    {
      passive: true
    }
  );

  window.addEventListener(
    "orientationchange",
    onResize,
    {
      passive: true
    }
  );

  document.addEventListener(
    "keydown",
    handleKeydown
  );

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  window.addEventListener(
    "pointerdown",
    handleActivity,
    {
      passive: true
    }
  );

  window.addEventListener(
    "touchstart",
    handleActivity,
    {
      passive: true
    }
  );

  window.addEventListener(
    "wheel",
    handleActivity,
    {
      passive: true
    }
  );

  window.addEventListener(
    "keydown",
    event => {

      /*
        Do not treat modifier-only presses
        as activity.
      */

      if (
        event.key === "Shift" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Meta"
      ) {
        return;
      }

      handleActivity();

    }
  );


  menuTrigger.addEventListener(
    "click",
    toggleMenu
  );


  /*
    Header navigation.
  */

  [
    previousSection,
    nextSection
  ].forEach(link => {

    link.addEventListener(
      "click",
      handleAnchorNavigation
    );

  });


  /*
    Menu navigation.
  */

  menuLinks.forEach(link => {

    link.addEventListener(
      "click",
      handleAnchorNavigation
    );

  });


  /*
    Logo navigation.
  */

  const brand =
    document.querySelector(".site-brand");

  if (brand) {

    brand.addEventListener(
      "click",
      handleAnchorNavigation
    );

  }


  /* ==============================================================
     23. HISTORY
  ============================================================== */

  window.addEventListener(
    "popstate",
    () => {

      const hash =
        window.location.hash;

      if (!hash) {

        window.scrollTo({
          top: 0,
          behavior:
            state.reducedMotion
              ? "auto"
              : "smooth"
        });

        return;

      }

      const target =
        document.querySelector(hash);

      if (!target) {
        return;
      }

      scrollToChapter(
        target.id
      );

    }
  );


  /* ==============================================================
     24. INITIAL STATE
  ============================================================== */

  const initializeState = () => {

    /*
      Make the initial CSS state explicit before
      the first enhanced frame.
    */

    state.lastScrollY =
      window.scrollY;

    state.dirty = true;

    calculateState();

    renderState();

    state.initialized = true;

  };


  /* ==============================================================
     25. INITIALIZATION
  ============================================================== */

  const initialize = () => {

    initializeState();

    initializeObserver();

    initializeMagnetic();

    initializeLoader();

    resetIdleTimer();

  };


  /*
    defer guarantees the DOM exists.
  */

  initialize();


})();
