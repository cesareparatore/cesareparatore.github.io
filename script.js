/* ============================================================
   MOVIMENTO CON DIREZIONE.
   Cesare Paratore
   Experience / Creative Technology / Design Engineering
   ============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     01. DOM
     ========================================================== */

  const root = document.documentElement;
  const body = document.body;

  const loader = document.querySelector(".page-loader");
  const idleScreen = document.querySelector("#idle-screen");

  const header = document.querySelector(".site-header");
  const menu = document.querySelector("#site-menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuLinks = [...document.querySelectorAll(".site-menu__nav a")];

  const progressCurrent = document.querySelector("#progress-current");
  const progressFill = document.querySelector("#progress-fill");
  const progressPoint = document.querySelector("#progress-point");

  const previousSection = document.querySelector("#previous-section");
  const previousSectionLabel = document.querySelector("#previous-section-label");

  const nextSection = document.querySelector("#next-section");
  const nextSectionLabel = document.querySelector("#next-section-label");

  const chapters = [
    ...document.querySelectorAll(".chapter")
  ];

  const trajectories = [
    ...document.querySelectorAll(".trajectory")
  ];

  const magneticElements = [
    ...document.querySelectorAll(".magnetic")
  ];

  const mapElement = document.querySelector(".origin-map img");


  /* ==========================================================
     02. CONFIGURATION
     ========================================================== */

  const CHAPTERS = chapters.map((chapter, index) => ({
    index: index + 1,
    element: chapter,
    title: chapter.dataset.title || "",
    id: chapter.id
  }));

  const IDLE_DELAY = 45000;
  const LOADER_MAX_WAIT = 6500;

  const MOBILE_BREAKPOINT = 760;

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const touchQuery = window.matchMedia(
    "(hover: none), (pointer: coarse)"
  );


  /* ==========================================================
     03. EXPERIENCE STATE
     ========================================================== */

  const state = {
    chapter: 1,
    chapterProgress: 0,
    globalProgress: 0,
    scrollDirection: 1,
    reducedMotion: motionQuery.matches,
    menuOpen: false,
    idle: false,
    loaderComplete: false,
    dirty: true,
    frameRequested: false,
    lastScrollY: window.scrollY,
    lastRenderedScrollY: window.scrollY,
    previousChapter: 1
  };


  /* ==========================================================
     04. UTILITY
     ========================================================== */

  const clamp = (value, min = 0, max = 1) => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  const lerp = (a, b, amount) => {
    return a + (b - a) * amount;
  };


  const easeOut = (value) => {
    const t = clamp(value);
    return 1 - Math.pow(1 - t, 3);
  };


  const chapterById = (id) => {
    return CHAPTERS.find(
      chapter => chapter.id === id
    );
  };


  const getChapterIndexFromScroll = () => {
    const scrollY = window.scrollY;
    const viewportCenter = scrollY + window.innerHeight * .5;

    let closest = CHAPTERS[0];
    let closestDistance = Infinity;

    CHAPTERS.forEach((chapter) => {
      const rect = chapter.element.getBoundingClientRect();

      const absoluteTop = rect.top + scrollY;
      const center = absoluteTop + rect.height * .5;

      const distance = Math.abs(
        center - viewportCenter
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = chapter;
      }
    });

    return closest.index;
  };


  const getChapterProgress = (chapter) => {
    const rect = chapter.element.getBoundingClientRect();

    const scrollableHeight =
      Math.max(
        1,
        rect.height - window.innerHeight
      );

    const progress =
      clamp(
        -rect.top / scrollableHeight
      );

    return progress;
  };


  const getGlobalProgress = () => {
    const maxScroll =
      Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

    return clamp(
      window.scrollY / maxScroll
    );
  };


  const getChapterFromHash = () => {
    const hash = window.location.hash;

    if (!hash) {
      return null;
    }

    return chapterById(
      hash.replace("#", "")
    );
  };


  /* ==========================================================
     05. STATE CALCULATION
     ========================================================== */

  const calculateState = () => {

    const currentChapterIndex =
      getChapterIndexFromScroll();

    const currentChapter =
      CHAPTERS[currentChapterIndex - 1];

    if (!currentChapter) {
      return;
    }

    const currentScrollY = window.scrollY;

    if (currentScrollY > state.lastScrollY) {
      state.scrollDirection = 1;
    } else if (currentScrollY < state.lastScrollY) {
      state.scrollDirection = -1;
    }

    state.lastScrollY = currentScrollY;

    state.chapter =
      currentChapterIndex;

    state.chapterProgress =
      getChapterProgress(
        currentChapter.element
      );

    state.globalProgress =
      getGlobalProgress();

    state.reducedMotion =
      motionQuery.matches;

    state.previousChapter =
      state.chapter;

  };


  /* ==========================================================
     06. ROOT CSS STATE
     ========================================================== */

  const writeRootState = () => {

    root.style.setProperty(
      "--chapter-progress",
      state.chapterProgress.toFixed(5)
    );

    root.style.setProperty(
      "--global-progress",
      state.globalProgress.toFixed(5)
    );

  };


  /* ==========================================================
     07. CHAPTER-SPECIFIC MOTION
     ========================================================== */

  const renderChapterMotion = () => {

    const progress = state.reducedMotion
      ? 1
      : state.chapterProgress;

    trajectories.forEach((trajectory) => {

      const chapter =
        trajectory.closest(".chapter");

      if (!chapter) {
        return;
      }

      const chapterNumber =
        Number(chapter.dataset.chapter);

      if (chapterNumber !== state.chapter) {
        return;
      }

      trajectory.style.setProperty(
        "--trajectory-progress",
        progress
      );

    });


    /* --------------------------------------------------------
       CHAPTER 04 — CONVERGENCE
       -------------------------------------------------------- */

    if (state.chapter === 4) {

      const convergenceMark =
        document.querySelector(".convergence-mark");

      if (convergenceMark) {

        const markProgress =
          easeOut(
            clamp(
              (progress - .22) / .58
            )
          );

        convergenceMark.style.opacity =
          String(
            clamp(
              (progress - .12) / .18
            )
          );

        convergenceMark.style.transform =
          `translate(-50%, -50%) scale(${lerp(
            .92,
            1,
            markProgress
          )})`;

      }
    }


    /* --------------------------------------------------------
       CHAPTER 05 — PAUSE
       -------------------------------------------------------- */

    if (state.chapter === 5) {

      const chapter =
        document.querySelector(".chapter--05");

      if (chapter) {

        const point =
          chapter.querySelector(
            ".trajectory-point--05"
          );

        if (point) {
          point.style.opacity =
            state.reducedMotion
              ? "1"
              : String(
                  clamp(
                    (progress - .35) / .2
                  )
                );
        }
      }
    }


    /* --------------------------------------------------------
       CHAPTER 08 — FORM
       -------------------------------------------------------- */

    if (state.chapter === 8) {

      const formation =
        document.querySelector(".formation");

      if (formation) {

        [...formation.children].forEach(
          (item, index) => {

            const localStart =
              .18 + index * .11;

            const localProgress =
              clamp(
                (progress - localStart) / .25
              );

            item.style.opacity =
              state.reducedMotion
                ? "1"
                : String(
                    easeOut(localProgress)
                  );

            item.style.transform =
              state.reducedMotion
                ? "none"
                : `translateY(${
                    lerp(16, 0, localProgress)
                  }px)`;

          }
        );
      }
    }


    /* --------------------------------------------------------
       CHAPTER 09 — ENCOUNTER
       -------------------------------------------------------- */

    if (state.chapter === 9) {

      const encounterPoint =
        document.querySelector(
          ".encounter-point"
        );

      if (encounterPoint) {

        const localProgress =
          clamp(
            (progress - .52) / .2
          );

        encounterPoint.style.opacity =
          String(
            easeOut(localProgress)
          );

      }
    }


    /* --------------------------------------------------------
       CHAPTER 10 — RESTART
       -------------------------------------------------------- */

    if (state.chapter === 10) {

      const point =
        document.querySelector(
          ".trajectory-point--10"
        );

      if (point) {
        point.style.opacity =
          state.reducedMotion
            ? "1"
            : String(
                clamp(
                  (progress - .08) / .12
                )
              );
      }
    }

  };


  /* ==========================================================
     08. HEADER RENDER
     ========================================================== */

  const renderHeader = () => {

    const current =
      CHAPTERS[state.chapter - 1];

    if (!current) {
      return;
    }

    progressCurrent.textContent =
      current.title;


    if (state.chapter > 1) {

      const previous =
        CHAPTERS[state.chapter - 2];

      previousSection.classList.remove(
        "is-disabled"
      );

      previousSection.setAttribute(
        "href",
        `#${previous.id}`
      );

      previousSection.setAttribute(
        "aria-hidden",
        "false"
      );

      previousSection.setAttribute(
        "tabindex",
        "0"
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

      previousSection.setAttribute(
        "tabindex",
        "-1"
      );

      previousSectionLabel.textContent =
        "";

    }


    if (state.chapter < CHAPTERS.length) {

      const next =
        CHAPTERS[state.chapter];

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
        next.title;

    } else {

      nextSection.classList.add(
        "is-disabled"
      );

      nextSection.setAttribute(
        "aria-label",
        "Fine del percorso"
      );

      nextSectionLabel.textContent =
        "";

    }

  };


  /* ==========================================================
     09. RENDER
     ========================================================== */

  const render = () => {

    calculateState();

    writeRootState();

    renderChapterMotion();

    renderHeader();

    state.lastRenderedScrollY =
      window.scrollY;

    state.dirty = false;

  };


  /* ==========================================================
     10. FRAME ENGINE
     ========================================================== */

  const requestFrame = () => {

    state.dirty = true;

    if (state.frameRequested) {
      return;
    }

    state.frameRequested = true;

    requestAnimationFrame(() => {

      state.frameRequested = false;

      if (!state.dirty) {
        return;
      }

      render();

    });

  };


  /* ==========================================================
     11. SCROLL
     ========================================================== */

  let scrollFramePending = false;

  const handleScroll = () => {

    resetIdleTimer();

    state.dirty = true;

    if (scrollFramePending) {
      return;
    }

    scrollFramePending = true;

    requestAnimationFrame(() => {

      scrollFramePending = false;

      if (!state.menuOpen && !state.idle) {
        requestFrame();
      }

    });

  };


  window.addEventListener(
    "scroll",
    handleScroll,
    {
      passive: true
    }
  );


  /* ==========================================================
     12. RESIZE
     ========================================================== */

  let resizeTimer = null;

  const handleResize = () => {

    clearTimeout(resizeTimer);

    resizeTimer =
      setTimeout(() => {

        requestFrame();

      }, 100);

  };

  window.addEventListener(
    "resize",
    handleResize,
    {
      passive: true
    }
  );


  window.addEventListener(
    "orientationchange",
    () => {
      requestFrame();
    },
    {
      passive: true
    }
  );


  /* ==========================================================
     13. VISIBILITY
     ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {
        state.dirty = false;
        return;
      }

      requestFrame();

    }
  );


  /* ==========================================================
     14. INTERSECTION OBSERVER
     ========================================================== */

  const chapterObserver =
    new IntersectionObserver(
      entries => {

        const visible =
          entries
            .filter(entry => entry.isIntersecting)
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

        if (!visible.length) {
          return;
        }

        const active =
          visible[0].target;

        const chapter =
          chapterById(active.id);

        if (!chapter) {
          return;
        }

        state.chapter =
          chapter.index;

        requestFrame();

      },
      {
        threshold: [
          0,
          .15,
          .35,
          .5,
          .7,
          .85,
          1
        ],
        rootMargin:
          "-10% 0px -10% 0px"
      }
    );


  chapters.forEach(
    chapter => {
      chapterObserver.observe(chapter);
    }
  );


  /* ==========================================================
     15. DIRECT NAVIGATION
     ========================================================== */

  const navigateToChapter = (
    chapter,
    updateHash = true
  ) => {

    if (!chapter) {
      return;
    }

    if (updateHash) {

      history.pushState(
        null,
        "",
        `#${chapter.id}`
      );

    }

    chapter.element.scrollIntoView({
      behavior:
        state.reducedMotion
          ? "auto"
          : "auto",
      block: "start"
    });

    requestFrame();

  };


  const handleHashNavigation = () => {

    const target =
      getChapterFromHash();

    if (!target) {
      requestFrame();
      return;
    }

    window.requestAnimationFrame(() => {

      target.element.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      requestFrame();

    });

  };


  window.addEventListener(
    "popstate",
    handleHashNavigation
  );

  window.addEventListener(
    "hashchange",
    handleHashNavigation
  );


  [...document.querySelectorAll(
    'a[href^="#chapter-"]'
  )].forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const href =
          link.getAttribute("href");

        if (!href) {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        const chapter =
          chapterById(
            target.id
          );

        navigateToChapter(
          chapter
        );

        if (state.menuOpen) {
          closeMenu();
        }

      }
    );

  });


  /* ==========================================================
     16. MENU
     ========================================================== */

  let menuReturnFocus =
    null;

  const getFirstFocusableMenuElement = () => {

    return menu.querySelector(
      "a, button, [tabindex]:not([tabindex='-1'])"
    );

  };


  const openMenu = () => {

    if (state.menuOpen) {
      return;
    }

    menuReturnFocus =
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

    window.requestAnimationFrame(() => {

      const first =
        getFirstFocusableMenuElement();

      if (first) {
        first.focus();
      }

    });

    resetIdleTimer();

  };


  const closeMenu = () => {

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
      menuReturnFocus &&
      typeof menuReturnFocus.focus === "function"
    ) {
      menuReturnFocus.focus();
    }

    resetIdleTimer();

  };


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


  menuLinks.forEach(
    link => {

      link.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        state.menuOpen
      ) {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (
        event.key === "Tab" &&
        state.menuOpen
      ) {

        const focusable =
          [
            ...menu.querySelectorAll(
              "a, button, [tabindex]:not([tabindex='-1'])"
            )
          ].filter(
            element =>
              !element.hasAttribute("disabled") &&
              element.getAttribute("aria-hidden") !== "true"
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

    }
  );


  /* ==========================================================
     17. MAGNETIC INTERACTION
     ========================================================== */

  const magneticEnabled = () => {

    return (
      !state.reducedMotion &&
      !touchQuery.matches &&
      window.innerWidth > MOBILE_BREAKPOINT
    );

  };


  const resetMagnetic = () => {

    root.style.setProperty(
      "--magnetic-x",
      "0px"
    );

    root.style.setProperty(
      "--magnetic-y",
      "0px"
    );

  };


  magneticElements.forEach(
    element => {

      element.addEventListener(
        "pointermove",
        event => {

          if (!magneticEnabled()) {
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

          const strength = .08;

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


  /* ==========================================================
     18. IDLE STANDBY
     ========================================================== */

  let idleTimer = null;

  let savedScrollY = 0;

  const interactionEvents = [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ];


  const enterIdle = () => {

    if (
      state.idle ||
      state.menuOpen ||
      !state.loaderComplete ||
      document.hidden
    ) {
      return;
    }

    savedScrollY =
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

  };


  const exitIdle = () => {

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
      savedScrollY
    );

    requestFrame();

  };


  const resetIdleTimer = () => {

    if (!state.loaderComplete) {
      return;
    }

    clearTimeout(idleTimer);

    if (state.idle) {
      exitIdle();
    }

    idleTimer =
      setTimeout(
        enterIdle,
        IDLE_DELAY
      );

  };


  interactionEvents.forEach(
    eventName => {

      window.addEventListener(
        eventName,
        () => {

          if (state.idle) {
            exitIdle();
          }

          if (
            eventName !== "scroll"
          ) {
            resetIdleTimer();
          }

        },
        {
          passive: true
        }
      );

    }
  );


  /* ==========================================================
     19. LOADER
     ========================================================== */

  let loaderCompleted = false;

  const completeLoader = () => {

    if (loaderCompleted) {
      return;
    }

    loaderCompleted = true;

    state.loaderComplete = true;

    loader.classList.add(
      "is-complete"
    );

    window.setTimeout(
      () => {

        loader.setAttribute(
          "hidden",
          ""
        );

        requestFrame();

        resetIdleTimer();

      },
      state.reducedMotion
        ? 50
        : 850
    );

  };


  const startLoader = () => {

    if (!loader) {
      state.loaderComplete = true;
      return;
    }

    if (state.reducedMotion) {

      completeLoader();

      return;
    }

    window.setTimeout(
      completeLoader,
      5200
    );

    window.setTimeout(
      completeLoader,
      LOADER_MAX_WAIT
    );

  };


  /* ==========================================================
     20. IMAGE FAILURE
     ========================================================== */

  if (mapElement) {

    mapElement.addEventListener(
      "error",
      () => {

        const map =
          mapElement.closest(
            ".origin-map"
          );

        if (!map) {
          return;
        }

        map.classList.add(
          "is-missing"
        );

        mapElement.remove();

      }
    );

  }


  /* ==========================================================
     21. REDUCED MOTION CHANGE
     ========================================================== */

  const handleMotionChange = event => {

    state.reducedMotion =
      event.matches;

    if (state.reducedMotion) {
      resetMagnetic();
    }

    requestFrame();

  };


  if (
    typeof motionQuery.addEventListener ===
    "function"
  ) {

    motionQuery.addEventListener(
      "change",
      handleMotionChange
    );

  } else if (
    typeof motionQuery.addListener ===
    "function"
  ) {

    motionQuery.addListener(
      handleMotionChange
    );

  }


  /* ==========================================================
     22. NO-JS MARKER
     ========================================================== */

  document.documentElement.classList.remove(
    "no-js"
  );


  /* ==========================================================
     23. INITIAL STATE
     ========================================================== */

  const initialize = () => {

    state.reducedMotion =
      motionQuery.matches;

    state.lastScrollY =
      window.scrollY;

    const hashTarget =
      getChapterFromHash();

    if (hashTarget) {

      window.requestAnimationFrame(
        () => {

          hashTarget.element.scrollIntoView({
            behavior: "auto",
            block: "start"
          });

          requestFrame();

        }
      );

    } else {

      requestFrame();

    }

    startLoader();

  };


  /* ==========================================================
     24. WINDOW LOAD
     ========================================================== */

  if (
    document.readyState === "complete"
  ) {

    initialize();

  } else {

    window.addEventListener(
      "load",
      initialize,
      {
        once: true
      }
    );

  }

})();
