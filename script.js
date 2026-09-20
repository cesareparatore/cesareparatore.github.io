(() => {
  "use strict";

  /* ==========================================================
     ROOT
  =========================================================== */

  const root = document.documentElement;
  const body = document.body;

  root.classList.remove("no-js");


  /* ==========================================================
     CONFIG — SINGLE SOURCE OF TRUTH
  =========================================================== */

  const chapters = [
    {
      number: "01",
      id: "01",
      title: "IL MOVIMENTO È SOLO L'INIZIO."
    },
    {
      number: "02",
      id: "02",
      title: "LA DOMANDA È CAMBIATA."
    },
    {
      number: "03",
      id: "03",
      title: "UNA STRADA NON ERA ABBASTANZA."
    },
    {
      number: "04",
      id: "04",
      title: "POI HO CAPITO CHE NON ERANO CINQUE STRADE."
    },
    {
      number: "05",
      id: "05",
      title: "A QUEL PUNTO, MI SONO FERMATO."
    },
    {
      number: "06",
      id: "06",
      title: "OGGI SO ANCHE DA DOVE PARTO."
    },
    {
      number: "07",
      id: "07",
      title: "LA BASE È QUI. LA DIREZIONE, NO."
    },
    {
      number: "08",
      id: "08",
      title: "ORA QUESTA DIREZIONE PRENDE FORMA."
    },
    {
      number: "09",
      id: "09",
      title: "FORSE È QUI CHE LA STORIA CAMBIA."
    },
    {
      number: "10",
      id: "10",
      title: "PARTIAMO DA QUELLO."
    }
  ];


  /* ==========================================================
     DOM
  =========================================================== */

  /*
   * The current HTML uses 01 → 10.
   * We also accept chapter-01 → chapter-10 as a safe fallback.
   */

  const resolveChapterElement = (chapter) => {
    return (
      document.getElementById(chapter.id) ||
      document.getElementById(`chapter-${chapter.number}`)
    );
  };

  const chapterElements = chapters.map(
    resolveChapterElement
  );

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
    [...document.querySelectorAll(".site-menu__nav a")];

  const idleScreen =
    document.getElementById("idle-screen");


  /* ==========================================================
     STATE
  =========================================================== */

  const state = {
    chapter: 1,
    chapterProgress: 0,
    globalProgress: 0,
    scrollDirection: 1,
    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,
    menuOpen: false,
    idle: false,
    loaderComplete: false
  };


  /* ==========================================================
     INTERNAL ENGINE STATE
  =========================================================== */

  let frameRequested = false;
  let geometryDirty = true;
  let lastScrollY = window.scrollY;
  let maxScroll = 1;

  let chapterMetrics = [];

  let idleTimer = null;
  let previousFocus = null;

  let loaderFinished = false;

  const IDLE_DELAY = 45000;


  /* ==========================================================
     UTILS
  =========================================================== */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));


  const raf =
    window.requestAnimationFrame ||
    ((callback) => window.setTimeout(callback, 16));


  /* ==========================================================
     GEOMETRY
  =========================================================== */

  function calculateGeometry() {

    const scrollY = window.scrollY;

    maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight -
      window.innerHeight
    );

    chapterMetrics = chapterElements.map((element) => {

      if (!element) {
        return {
          top: 0,
          height: 1,
          bottom: 1
        };
      }

      const rect =
        element.getBoundingClientRect();

      const top =
        rect.top + scrollY;

      const height =
        Math.max(
          1,
          element.offsetHeight
        );

      return {
        top,
        height,
        bottom: top + height
      };
    });

    geometryDirty = false;
  }


  function ensureGeometry() {

    if (geometryDirty) {
      calculateGeometry();
    }
  }


  /* ==========================================================
     ACTIVE CHAPTER
  =========================================================== */

  function resolveExperience(scrollY) {

    ensureGeometry();

    const documentProgress =
      clamp(scrollY / maxScroll);

    /*
     * The active chapter is determined from the actual
     * document geometry, not from an observer.
     *
     * This keeps scroll as the single source of truth.
     */

    let activeIndex = 0;

    for (
      let i = 0;
      i < chapterMetrics.length;
      i += 1
    ) {

      const metric =
        chapterMetrics[i];

      if (
        scrollY >= metric.top &&
        scrollY < metric.bottom
      ) {
        activeIndex = i;
        break;
      }

      if (scrollY >= metric.bottom) {
        activeIndex = i;
      }
    }

    /*
     * Defensive fallback:
     * if a section could not be measured, preserve
     * the previous chapter instead of jumping to 01.
     */

    if (
      !chapterMetrics.length ||
      !chapterMetrics[activeIndex]
    ) {
      activeIndex =
        clamp(
          state.chapter - 1,
          0,
          chapters.length - 1
        );
    }

    const metric =
      chapterMetrics[activeIndex];

    const scrollableDistance =
      Math.max(
        1,
        metric.height - window.innerHeight
      );

    const localProgress =
      clamp(
        (scrollY - metric.top) /
        scrollableDistance
      );

    return {
      chapter: activeIndex + 1,
      chapterProgress: localProgress,
      globalProgress: documentProgress
    };
  }


  /* ==========================================================
     STATE UPDATE
  =========================================================== */

  function updateState() {

    const scrollY =
      window.scrollY;

    if (scrollY > lastScrollY) {
      state.scrollDirection = 1;
    } else if (scrollY < lastScrollY) {
      state.scrollDirection = -1;
    }

    lastScrollY = scrollY;

    const nextState =
      resolveExperience(scrollY);

    const chapterChanged =
      state.chapter !== nextState.chapter;

    state.chapter =
      nextState.chapter;

    state.chapterProgress =
      nextState.chapterProgress;

    state.globalProgress =
      nextState.globalProgress;

    renderState(chapterChanged);
  }


  /* ==========================================================
     RENDER
  =========================================================== */

  function renderState(
    chapterChanged = false
  ) {

    root.style.setProperty(
      "--chapter-progress",
      state.chapterProgress
    );

    root.style.setProperty(
      "--global-progress",
      state.globalProgress
    );

    root.style.setProperty(
      "--header-progress",
      state.globalProgress
    );

    const current =
      chapters[state.chapter - 1];

    const previous =
      chapters[state.chapter - 2];

    const next =
      chapters[state.chapter];

    /*
     * CURRENT CHAPTER TITLE
     */

    if (
      current &&
      progressCurrent
    ) {
      progressCurrent.textContent =
        current.title;
    }

    /*
     * CONTINUOUS WOW BAR
     */

    const percentage =
      state.globalProgress * 100;

    if (progressFill) {
      progressFill.style.width =
        `${percentage}%`;
    }

    if (progressPoint) {
      progressPoint.style.left =
        `${percentage}%`;
    }

    /*
     * CHAPTER NAVIGATION
     */

    updatePrevious(previous);
    updateNext(next);

    /*
     * CHAPTER MOTION
     */

    if (chapterChanged) {
      applyChapterTransition();
    }
  }


  /* ==========================================================
     PREVIOUS CHAPTER
  =========================================================== */

  function updatePrevious(previous) {

    if (
      !previous ||
      !previousSection
    ) {

      if (previousSection) {
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
      }

      if (previousSectionLabel) {
        previousSectionLabel.textContent = "";
      }

      return;
    }

    previousSection.classList.remove(
      "is-disabled"
    );

    previousSection.removeAttribute(
      "aria-hidden"
    );

    previousSection.removeAttribute(
      "tabindex"
    );

    previousSection.href =
      `#${previous.id}`;

    /*
     * IMPORTANT:
     * the visible label is the PAGE / CHAPTER NUMBER,
     * not the title.
     */

    previousSectionLabel.textContent =
      previous.number;

    previousSection.setAttribute(
      "aria-label",
      `Vai alla sezione ${previous.number}: ${previous.title}`
    );
  }


  /* ==========================================================
     NEXT CHAPTER
  =========================================================== */

  function updateNext(next) {

    if (
      !next ||
      !nextSection
    ) {

      if (nextSection) {
        nextSection.classList.add(
          "is-disabled"
        );

        nextSection.setAttribute(
          "aria-hidden",
          "true"
        );

        nextSection.setAttribute(
          "tabindex",
          "-1"
        );
      }

      if (nextSectionLabel) {
        nextSectionLabel.textContent = "";
      }

      return;
    }

    nextSection.classList.remove(
      "is-disabled"
    );

    nextSection.removeAttribute(
      "aria-hidden"
    );

    nextSection.removeAttribute(
      "tabindex"
    );

    nextSection.href =
      `#${next.id}`;

    /*
     * Visible label = chapter number.
     */

    nextSectionLabel.textContent =
      next.number;

    nextSection.setAttribute(
      "aria-label",
      `Vai alla sezione ${next.number}: ${next.title}`
    );
  }


  /* ==========================================================
     CHAPTER TRANSITION
  =========================================================== */

  function applyChapterTransition() {

    if (state.reducedMotion) {
      return;
    }

    chapterElements.forEach((chapter) => {

      if (!chapter) {
        return;
      }

      chapter.classList.remove(
        "is-transitioning"
      );
    });

    const current =
      chapterElements[
        state.chapter - 1
      ];

    if (!current) {
      return;
    }

    current.classList.add(
      "is-transitioning"
    );

    window.setTimeout(() => {

      current.classList.remove(
        "is-transitioning"
      );

    }, 500);
  }


  /* ==========================================================
     SINGLE FRAME ENGINE
  =========================================================== */

  function requestFrame() {

    if (frameRequested) {
      return;
    }

    frameRequested = true;

    raf(() => {

      frameRequested = false;

      updateState();
    });
  }


  /* ==========================================================
     SCROLL
  =========================================================== */

  function onScroll() {

    requestFrame();
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
     RESIZE
  =========================================================== */

  function onResize() {

    geometryDirty = true;

    requestFrame();
  }


  window.addEventListener(
    "resize",
    onResize,
    {
      passive: true
    }
  );


  window.addEventListener(
    "orientationchange",
    () => {

      geometryDirty = true;

      requestFrame();

    },
    {
      passive: true
    }
  );


  /* ==========================================================
     INTERSECTION OBSERVER
     Semantic activation only.
  =========================================================== */

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          /*
           * Scroll remains the source of truth.
           * The observer intentionally does not mutate
           * chapter state or progress.
           */

        });
      },
      {
        root: null,
        threshold: 0.05
      }
    );


  chapterElements.forEach((chapter) => {

    if (chapter) {
      observer.observe(chapter);
    }

  });


  /* ==========================================================
     DIRECT NAVIGATION
  =========================================================== */

  function scrollToChapter(id) {

    const target =
      document.getElementById(id) ||
      document.getElementById(
        `chapter-${id}`
      );

    if (!target) {
      return;
    }

    const top =
      target.getBoundingClientRect().top +
      window.scrollY;

    const headerOffset =
      window.innerWidth <= 680
        ? 112
        : window.innerWidth <= 900
          ? 106
          : 118;

    window.scrollTo({
      top: Math.max(
        0,
        top - headerOffset
      ),
      behavior:
        state.reducedMotion
          ? "auto"
          : "smooth"
    });
  }


  document.addEventListener(
    "click",
    (event) => {

      const link =
        event.target.closest(
          'a[href^="#"]'
        );

      if (!link) {
        return;
      }

      const href =
        link.getAttribute("href");

      if (!href) {
        return;
      }

      /*
       * Only intercept chapter navigation.
       * Do not interfere with other anchors.
       */

      const chapterMatch =
        href.match(
          /^#(?:chapter-)?(0[1-9]|10)$/
        );

      if (!chapterMatch) {
        return;
      }

      const number =
        chapterMatch[1];

      const target =
        document.getElementById(number) ||
        document.getElementById(
          `chapter-${number}`
        );

      if (!target) {
        return;
      }

      event.preventDefault();

      if (state.menuOpen) {
        closeMenu({
          restoreFocus: false
        });
      }

      scrollToChapter(number);

      history.pushState(
        null,
        "",
        `#${number}`
      );

      resetIdleTimer();
    }
  );


  /* ==========================================================
     MENU
  =========================================================== */

  function openMenu() {

    if (
      state.menuOpen ||
      !menu ||
      !menuTrigger
    ) {
      return;
    }

    previousFocus =
      document.activeElement;

    state.menuOpen = true;

    body.classList.add(
      "is-menu-open"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    menu.removeAttribute(
      "inert"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    resetIdleTimer();

    window.requestAnimationFrame(() => {

      const firstLink =
        menuLinks[0];

      if (firstLink) {
        firstLink.focus();
      }

    });
  }


  function closeMenu({
    restoreFocus = true
  } = {}) {

    if (
      !state.menuOpen ||
      !menu ||
      !menuTrigger
    ) {
      return;
    }

    state.menuOpen = false;

    body.classList.remove(
      "is-menu-open"
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
      previousFocus &&
      typeof previousFocus.focus ===
        "function"
    ) {
      previousFocus.focus();
    }

    previousFocus = null;

    resetIdleTimer();
  }


  if (menuTrigger) {

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

  }


  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }

      if (state.menuOpen) {
        closeMenu();
      }

      if (state.idle) {
        exitIdle();
      }

    }
  );


  /* ==========================================================
     MENU FOCUS CONTAINMENT
  =========================================================== */

  if (menu) {

    menu.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key !== "Tab" ||
          !state.menuOpen
        ) {
          return;
        }

        const focusable =
          menu.querySelectorAll(
            'a[href], button:not([disabled])'
          );

        if (!focusable.length) {
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[
            focusable.length - 1
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

      }
    );

  }


  /* ==========================================================
     MAGNETIC — PROGRESSIVE ENHANCEMENT
  =========================================================== */

  const magneticElements =
    [
      ...document.querySelectorAll(
        ".magnetic"
      )
    ];

  const finePointer =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );


  function enableMagnetic() {

    if (
      !finePointer.matches ||
      state.reducedMotion
    ) {
      return;
    }

    magneticElements.forEach(
      (element) => {

        element.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              element.getBoundingClientRect();

            const x =
              (
                event.clientX -
                rect.left -
                rect.width / 2
              ) / rect.width;

            const y =
              (
                event.clientY -
                rect.top -
                rect.height / 2
              ) / rect.height;

            const strength = 5;

            element.style.setProperty(
              "--magnetic-x",
              `${x * strength}px`
            );

            element.style.setProperty(
              "--magnetic-y",
              `${y * strength}px`
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

      }
    );
  }


  enableMagnetic();


  /* ==========================================================
     IDLE
  =========================================================== */

  function resetIdleTimer() {

    if (
      !loaderFinished ||
      state.menuOpen
    ) {
      return;
    }

    if (state.idle) {
      exitIdle();
    }

    if (idleTimer) {
      window.clearTimeout(
        idleTimer
      );
    }

    idleTimer =
      window.setTimeout(
        enterIdle,
        IDLE_DELAY
      );
  }


  function enterIdle() {

    if (
      !loaderFinished ||
      state.menuOpen ||
      state.idle ||
      !idleScreen
    ) {
      return;
    }

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


  function exitIdle() {

    if (!state.idle) {
      return;
    }

    state.idle = false;

    body.classList.remove(
      "is-idle"
    );

    if (idleScreen) {

      idleScreen.classList.remove(
        "is-active"
      );

      idleScreen.setAttribute(
        "aria-hidden",
        "true"
      );

    }

    resetIdleTimer();
  }


  const interactionEvents = [
    "pointermove",
    "pointerdown",
    "touchstart",
    "wheel",
    "keydown"
  ];


  interactionEvents.forEach(
    (eventName) => {

      window.addEventListener(
        eventName,
        resetIdleTimer,
        {
          passive:
            eventName !== "keydown"
        }
      );

    }
  );


  if (idleScreen) {

    idleScreen.addEventListener(
      "pointerdown",
      exitIdle
    );

  }


  /* ==========================================================
     LOADER
  =========================================================== */

  function completeLoader() {

    if (loaderFinished) {
      return;
    }

    loaderFinished = true;

    state.loaderComplete = true;

    /*
     * This is the original loader state.
     * We preserve it instead of replacing or hiding
     * the loader through JS.
     */

    root.classList.add(
      "is-loader-complete"
    );

    window.setTimeout(
      () => {

        root.classList.remove(
          "is-loader-complete"
        );

      },
      900
    );

    geometryDirty = true;

    requestFrame();

    resetIdleTimer();
  }


  window.addEventListener(
    "load",
    () => {

      if (state.reducedMotion) {

        window.setTimeout(
          completeLoader,
          80
        );

        return;
      }

      window.setTimeout(
        completeLoader,
        5200
      );

    },
    {
      once: true
    }
  );


  /*
   * Hard fallback:
   * the experience must never remain blocked.
   */

  window.setTimeout(
    completeLoader,
    state.reducedMotion
      ? 900
      : 7000
  );


  /* ==========================================================
     REDUCED MOTION CHANGE
  =========================================================== */

  const motionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  function onMotionPreferenceChange(
    event
  ) {

    state.reducedMotion =
      event.matches;

    if (state.reducedMotion) {

      magneticElements.forEach(
        (element) => {

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
    }

    requestFrame();
  }


  if (
    typeof motionQuery.addEventListener ===
    "function"
  ) {

    motionQuery.addEventListener(
      "change",
      onMotionPreferenceChange
    );

  } else if (
    typeof motionQuery.addListener ===
    "function"
  ) {

    motionQuery.addListener(
      onMotionPreferenceChange
    );

  }


  /* ==========================================================
     VISIBILITY
  =========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        if (idleTimer) {
          window.clearTimeout(
            idleTimer
          );
        }

      } else {

        geometryDirty = true;

        requestFrame();

        resetIdleTimer();
      }

    }
  );


  /* ==========================================================
     INITIALIZATION
  =========================================================== */

  calculateGeometry();

  updateState();

})();
