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
     DOM
  =========================================================== */

  const chapterElements = chapters.map(({ id }) =>
    document.getElementById(id)
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


  const lerp = (a, b, amount) =>
    a + (b - a) * amount;


  const raf = window.requestAnimationFrame ||
    ((callback) => window.setTimeout(callback, 16));


  const caf = window.cancelAnimationFrame ||
    window.clearTimeout;


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

      const rect = element.getBoundingClientRect();

      const top =
        rect.top + scrollY;

      const height =
        Math.max(1, element.offsetHeight);

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
     CHAPTER RESOLUTION
  =========================================================== */

  function resolveExperience(scrollY) {

    ensureGeometry();

    const documentProgress =
      clamp(scrollY / maxScroll);

    let activeIndex = 0;

    for (let i = 0; i < chapterMetrics.length; i += 1) {

      const metric = chapterMetrics[i];

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

    const metric =
      chapterMetrics[activeIndex];

    const localProgress =
      clamp(
        (scrollY - metric.top) /
        Math.max(
          1,
          metric.height - window.innerHeight
        )
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

    const scrollY = window.scrollY;

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

  function renderState(chapterChanged = false) {

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

    if (current) {
      progressCurrent.textContent =
        current.title;
    }

    progressFill.style.width =
      `${state.globalProgress * 100}%`;

    progressPoint.style.left =
      `${state.globalProgress * 100}%`;

    updatePrevious(previous);
    updateNext(next);

    if (chapterChanged) {
      applyChapterTransition();
    }
  }


  function updatePrevious(previous) {

    if (!previous) {

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

      previousSectionLabel.textContent = "";

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

    previousSectionLabel.textContent =
      previous.title;

    previousSection.setAttribute(
      "aria-label",
      `Vai a ${previous.title}`
    );
  }


  function updateNext(next) {

    if (!next) {

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

      nextSectionLabel.textContent = "";

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

    nextSectionLabel.textContent =
      next.title;

    nextSection.setAttribute(
      "aria-label",
      `Vai a ${next.title}`
    );
  }


  function applyChapterTransition() {

    if (state.reducedMotion) {
      return;
    }

    chapterElements.forEach((chapter) => {
      chapter.classList.remove(
        "is-transitioning"
      );
    });

    const current =
      chapterElements[state.chapter - 1];

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
     It does NOT drive animation.
  =========================================================== */

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          const chapter =
            entry.target.dataset.chapter;

          if (!chapter) {
            return;
          }

          /*
            Scroll remains the source of truth.
            Observer is deliberately not allowed
            to mutate the experience progress.
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
      document.getElementById(id);

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
      top: Math.max(0, top - headerOffset),
      behavior: state.reducedMotion
        ? "auto"
        : "smooth"
    });
  }


  document.addEventListener(
    "click",
    (event) => {

      const link =
        event.target.closest(
          'a[href^="#chapter-"]'
        );

      if (!link) {
        return;
      }

      const id =
        link.getAttribute("href");

      const target =
        document.querySelector(id);

      if (!target) {
        return;
      }

      event.preventDefault();

      if (state.menuOpen) {
        closeMenu({
          restoreFocus: false
        });
      }

      scrollToChapter(
        id.substring(1)
      );

      resetIdleTimer();
    }
  );


  /* ==========================================================
     MENU
  =========================================================== */

  function openMenu() {

    if (state.menuOpen) {
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

    requestAnimationFrame(() => {

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

    if (!state.menuOpen) {
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
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus();
    }

    previousFocus = null;

    resetIdleTimer();
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
  );


  /* ==========================================================
     MAGNETIC — PROGRESSIVE ENHANCEMENT
  =========================================================== */

  const magneticElements =
    [...document.querySelectorAll(".magnetic")];

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

    magneticElements.forEach((element) => {

      element.addEventListener(
        "pointermove",
        (event) => {

          const rect =
            element.getBoundingClientRect();

          const x =
            (event.clientX - rect.left - rect.width / 2) /
            rect.width;

          const y =
            (event.clientY - rect.top - rect.height / 2) /
            rect.height;

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
    });
  }

  enableMagnetic();


  /* ==========================================================
     IDLE
  =========================================================== */

  function resetIdleTimer() {

    if (
      !loaderFinished ||
      state.menuOpen ||
      state.reducedMotion && false
    ) {
      return;
    }

    if (state.idle) {
      exitIdle();
    }

    if (idleTimer) {
      window.clearTimeout(idleTimer);
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
      state.idle
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

    idleScreen.classList.remove(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "true"
    );

    resetIdleTimer();
  }


  const interactionEvents = [
    "pointermove",
    "pointerdown",
    "touchstart",
    "wheel",
    "keydown"
  ];

  interactionEvents.forEach((eventName) => {

    window.addEventListener(
      eventName,
      resetIdleTimer,
      {
        passive: eventName !== "keydown"
      }
    );
  });


  idleScreen.addEventListener(
    "pointerdown",
    exitIdle
  );


  /* ==========================================================
     LOADER
  =========================================================== */

  function completeLoader() {

    if (loaderFinished) {
      return;
    }

    loaderFinished = true;
    state.loaderComplete = true;

    root.classList.add(
      "is-loader-complete"
    );

    window.setTimeout(() => {
      root.classList.remove(
        "is-loader-complete"
      );
    }, 900);

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
    Hard fallback:
    the experience must never remain blocked by
    an asset/network problem.
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

  function onMotionPreferenceChange(event) {

    state.reducedMotion =
      event.matches;

    if (state.reducedMotion) {

      magneticElements.forEach((element) => {

        element.style.setProperty(
          "--magnetic-x",
          "0px"
        );

        element.style.setProperty(
          "--magnetic-y",
          "0px"
        );
      });
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
          window.clearTimeout(idleTimer);
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
