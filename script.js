(() => {
  "use strict";

  const CONFIG = {
    loaderDuration: 2700,
    loaderFallback: 5000,
    idleDelay: 45000,
    magneticRadius: 90,
    magneticStrength: 0.16
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const state = {
    currentIndex: 0,
    currentProgress: 0,
    targetProgress: 0,
    menuOpen: false,
    idle: false,
    loaderDone: false,
    rafId: null,
    scrollDirty: false,
    resizeDirty: false,
    magneticX: 0,
    magneticY: 0
  };

  const cover = document.querySelector("#cover");
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const allScenes = [cover, ...chapters];

  const header = document.querySelector("#site-header");
  const loader = document.querySelector("#loader");
  const menu = document.querySelector("#site-menu");
  const menuTrigger = document.querySelector("#menu-trigger");

  const progressCurrent = document.querySelector("#progress-current");
  const progressFill = document.querySelector("#progress-fill");
  const progressPoint = document.querySelector("#progress-point");

  const previousSection = document.querySelector("#previous-section");
  const previousSectionLabel = document.querySelector("#previous-section-label");

  const nextSection = document.querySelector("#next-section");
  const nextSectionLabel = document.querySelector("#next-section-label");

  const idleScreen = document.querySelector("#idle-screen");

  const menuLinks = [...document.querySelectorAll("[data-menu-link]")];
  const magneticElements = [...document.querySelectorAll(".magnetic")];

  const root = document.documentElement;

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const lerp = (a, b, t) => a + (b - a) * t;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  /* ----------------------------------------------------------
     LOADER
  ---------------------------------------------------------- */

  function finishLoader() {
    if (state.loaderDone) return;

    state.loaderDone = true;

    if (!loader) return;

    loader.classList.add("is-hidden");
    document.body.classList.remove("is-loading");

    window.setTimeout(() => {
      loader.remove();
    }, prefersReducedMotion.matches ? 50 : 900);
  }

  function initLoader() {
    document.body.classList.add("is-loading");

    const minimumDelay = prefersReducedMotion.matches
      ? 80
      : CONFIG.loaderDuration;

    const fallback = window.setTimeout(
      finishLoader,
      CONFIG.loaderFallback
    );

    window.setTimeout(() => {
      window.clearTimeout(fallback);
      finishLoader();
    }, minimumDelay);
  }

  /* ----------------------------------------------------------
     CHAPTER METADATA
  ---------------------------------------------------------- */

  const sceneMeta = allScenes.map((scene, index) => {
    if (!scene) return null;

    return {
      scene,
      index,
      id: scene.id,
      number:
        scene.dataset.chapter ||
        "00",
      title:
        scene.dataset.title ||
        "MOVIMENTO / CON DIREZIONE"
    };
  }).filter(Boolean);

  function getSceneMeta(index) {
    return sceneMeta[
      Math.max(0, Math.min(sceneMeta.length - 1, index))
    ];
  }

  /* ----------------------------------------------------------
     SCROLL STATE
  ---------------------------------------------------------- */

  function calculateSceneProgress(scene) {
    const rect = scene.getBoundingClientRect();
    const viewport = window.innerHeight;

    const travel = Math.max(1, rect.height - viewport);
    const progress = -rect.top / travel;

    return clamp(progress);
  }

  function calculateCurrentScene() {
    const viewportCenter = window.innerHeight * 0.5;

    let bestIndex = 0;
    let bestDistance = Infinity;

    sceneMeta.forEach((meta, index) => {
      const rect = meta.scene.getBoundingClientRect();

      const center =
        rect.top +
        Math.min(rect.height, window.innerHeight) * 0.5;

      const distance = Math.abs(center - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function readScrollState() {
    if (state.menuOpen) return;

    state.currentIndex = calculateCurrentScene();

    const meta = getSceneMeta(state.currentIndex);

    if (!meta) return;

    state.targetProgress =
      calculateSceneProgress(meta.scene);
  }

  /* ----------------------------------------------------------
     RENDER STATE
  ---------------------------------------------------------- */

  function renderProgress() {
    const meta = getSceneMeta(state.currentIndex);

    if (!meta) return;

    const progress = state.currentProgress;

    root.style.setProperty(
      "--chapter-progress",
      progress.toFixed(4)
    );

    root.style.setProperty(
      "--trajectory-progress",
      easeOutCubic(progress).toFixed(4)
    );

    root.style.setProperty(
      "--convergence-progress",
      easeOutCubic(progress).toFixed(4)
    );

    root.style.setProperty(
      "--encounter-progress",
      easeOutCubic(progress).toFixed(4)
    );

    root.style.setProperty(
      "--final-progress",
      easeOutCubic(progress).toFixed(4)
    );

    if (progressFill) {
      progressFill.style.width =
        `${((meta.index) / (sceneMeta.length - 1)) * 100}%`;
    }

    if (progressPoint) {
      progressPoint.style.left =
        `${((meta.index) / (sceneMeta.length - 1)) * 100}%`;
    }

    if (progressCurrent) {
      progressCurrent.textContent = meta.title;
    }

    updateNavigation(meta);
  }

  function renderFrame() {
    state.rafId = null;

    if (state.scrollDirty) {
      readScrollState();
      state.scrollDirty = false;
    }

    const target = state.targetProgress;

    if (prefersReducedMotion.matches) {
      state.currentProgress = target;
    } else {
      state.currentProgress = lerp(
        state.currentProgress,
        target,
        0.18
      );

      if (
        Math.abs(state.currentProgress - target) > 0.0005
      ) {
        requestRender();
      }
    }

    renderProgress();

    if (state.resizeDirty) {
      state.resizeDirty = false;
    }
  }

  function requestRender() {
    if (state.rafId !== null) return;

    state.rafId = window.requestAnimationFrame(
      renderFrame
    );
  }

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  function updateNavigation(meta) {
    const previous = sceneMeta[meta.index - 1];
    const next = sceneMeta[meta.index + 1];

    if (previous) {
      previousSection.href = `#${previous.id}`;
      previousSectionLabel.textContent =
        previous.number;

      previousSection.classList.remove("is-disabled");
      previousSection.setAttribute(
        "aria-hidden",
        "false"
      );
      previousSection.tabIndex = 0;
      previousSection.setAttribute(
        "aria-label",
        `Vai alla sezione ${previous.number}`
      );
    } else {
      previousSection.classList.add("is-disabled");
      previousSection.setAttribute(
        "aria-hidden",
        "true"
      );
      previousSection.tabIndex = -1;
    }

    if (next) {
      nextSection.href = `#${next.id}`;
      nextSectionLabel.textContent = next.number;

      nextSection.classList.remove("is-disabled");
      nextSection.setAttribute(
        "aria-label",
        `Vai alla sezione ${next.number}`
      );
    } else {
      nextSection.href = "#cover";
      nextSectionLabel.textContent = "00";
      nextSection.setAttribute(
        "aria-label",
        "Torna alla cover"
      );
    }
  }

  function scrollToScene(id) {
    const target = document.getElementById(id);

    if (!target) return;

    closeMenu();

    target.scrollIntoView({
      behavior: prefersReducedMotion.matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  }

  function bindNavigation() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest(
        'a[href^="#"]'
      );

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      scrollToScene(target.id);
    });
  }

  /* ----------------------------------------------------------
     MENU
  ---------------------------------------------------------- */

  let menuFocusTarget = null;

  function getMenuFocusable() {
    return [
      menuTrigger,
      ...menuLinks
    ].filter(Boolean);
  }

  function openMenu() {
    if (state.menuOpen) return;

    menuFocusTarget =
      document.activeElement;

    state.menuOpen = true;

    document.body.classList.add("is-menu-open");

    menuTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    window.setTimeout(() => {
      const first =
        menuLinks[0];

      if (first) first.focus();
    }, 50);
  }

  function closeMenu() {
    if (!state.menuOpen) return;

    state.menuOpen = false;

    document.body.classList.remove("is-menu-open");

    menuTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Apri menu"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    if (
      menuFocusTarget &&
      typeof menuFocusTarget.focus === "function"
    ) {
      menuFocusTarget.focus({
        preventScroll:true
      });
    }

    menuFocusTarget = null;
  }

  function toggleMenu() {
    if (state.menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function bindMenu() {
    if (!menuTrigger) return;

    menuTrigger.addEventListener(
      "click",
      toggleMenu
    );

    menuLinks.forEach((link) => {
      link.addEventListener(
        "click",
        closeMenu
      );
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          closeMenu();
          return;
        }

        if (
          event.key !== "Tab" ||
          !state.menuOpen
        ) {
          return;
        }

        const focusables =
          getMenuFocusable();

        const first =
          focusables[0];

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
    );
  }

  /* ----------------------------------------------------------
     IDLE
  ---------------------------------------------------------- */

  let idleTimer = null;

  function resetIdleTimer() {
    if (state.menuOpen) return;

    state.idle = false;

    if (idleScreen) {
      idleScreen.classList.remove(
        "is-visible"
      );
      idleScreen.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    window.clearTimeout(idleTimer);

    idleTimer = window.setTimeout(
      enterIdle,
      CONFIG.idleDelay
    );
  }

  function enterIdle() {
    if (
      state.menuOpen ||
      prefersReducedMotion.matches
    ) {
      return;
    }

    state.idle = true;

    if (idleScreen) {
      idleScreen.classList.add(
        "is-visible"
      );

      idleScreen.setAttribute(
        "aria-hidden",
        "false"
      );
    }
  }

  function bindIdle() {
    const events = [
      "pointerdown",
      "pointermove",
      "wheel",
      "touchstart",
      "keydown",
      "scroll"
    ];

    events.forEach((eventName) => {
      window.addEventListener(
        eventName,
        resetIdleTimer,
        {
          passive:true
        }
      );
    });

    resetIdleTimer();
  }

  /* ----------------------------------------------------------
     MAGNETIC INTERACTION
  ---------------------------------------------------------- */

  function clearMagnetic() {
    root.style.setProperty(
      "--magnetic-x",
      "0px"
    );

    root.style.setProperty(
      "--magnetic-y",
      "0px"
    );
  }

  function bindMagnetic() {
    if (
      isTouch ||
      prefersReducedMotion.matches
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
            event.clientX -
            (rect.left + rect.width / 2);

          const y =
            event.clientY -
            (rect.top + rect.height / 2);

          const distance =
            Math.sqrt(
              x * x +
              y * y
            );

          if (
            distance >
            CONFIG.magneticRadius
          ) {
            clearMagnetic();
            return;
          }

          const strength =
            CONFIG.magneticStrength *
            (1 - distance / CONFIG.magneticRadius);

          const tx =
            x * strength;

          const ty =
            y * strength;

          element.style.setProperty(
            "--magnetic-x",
            `${tx.toFixed(2)}px`
          );

          element.style.setProperty(
            "--magnetic-y",
            `${ty.toFixed(2)}px`
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

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER
     Semantic activation only.
     Visual progression remains scroll-state driven.
  ---------------------------------------------------------- */

  function bindIntersectionObserver() {
    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle(
              "is-near",
              entry.isIntersecting
            );
          });
        },
        {
          rootMargin:"20% 0px 20% 0px",
          threshold:0
        }
      );

    allScenes.forEach((scene) => {
      if (scene) observer.observe(scene);
    });
  }

  /* ----------------------------------------------------------
     RESIZE
  ---------------------------------------------------------- */

  function bindResize() {
    window.addEventListener(
      "resize",
      () => {
        state.resizeDirty = true;
        state.scrollDirty = true;
        requestRender();
      },
      {
        passive:true
      }
    );
  }

  /* ----------------------------------------------------------
     SCROLL
  ---------------------------------------------------------- */

  function bindScroll() {
    window.addEventListener(
      "scroll",
      () => {
        state.scrollDirty = true;
        requestRender();
      },
      {
        passive:true
      }
    );
  }

  /* ----------------------------------------------------------
     HISTORY / DEEP LINK
  ---------------------------------------------------------- */

  function handleInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) return;

    const target =
      document.querySelector(hash);

    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({
        behavior:"auto",
        block:"start"
      });

      state.scrollDirty = true;
      requestRender();
    }, 100);
  }

  /* ----------------------------------------------------------
     INITIAL STATE
  ---------------------------------------------------------- */

  function initializeState() {
    state.currentIndex =
      calculateCurrentScene();

    const meta =
      getSceneMeta(
        state.currentIndex
      );

    state.targetProgress =
      meta
        ? calculateSceneProgress(meta.scene)
        : 0;

    state.currentProgress =
      state.targetProgress;

    renderProgress();
  }

  /* ----------------------------------------------------------
     KEYBOARD CHAPTER NAVIGATION
  ---------------------------------------------------------- */

  function bindKeyboardNavigation() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          state.menuOpen ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey
        ) {
          return;
        }

        if (
          event.key !== "ArrowDown" &&
          event.key !== "ArrowUp"
        ) {
          return;
        }

        const direction =
          event.key === "ArrowDown"
            ? 1
            : -1;

        const nextIndex =
          clamp(
            state.currentIndex + direction,
            0,
            sceneMeta.length - 1
          );

        const target =
          getSceneMeta(nextIndex);

        if (!target) return;

        event.preventDefault();

        scrollToScene(
          target.id
        );
      }
    );
  }

  /* ----------------------------------------------------------
     PERFORMANCE / VISIBILITY
  ---------------------------------------------------------- */

  function bindVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.hidden &&
          state.rafId !== null
        ) {
          window.cancelAnimationFrame(
            state.rafId
          );

          state.rafId = null;
        }

        if (!document.hidden) {
          state.scrollDirty = true;
          requestRender();
        }
      }
    );
  }

  /* ----------------------------------------------------------
     START
  ---------------------------------------------------------- */

  function init() {
    initLoader();

    bindNavigation();
    bindMenu();
    bindIdle();
    bindMagnetic();
    bindIntersectionObserver();
    bindResize();
    bindScroll();
    bindKeyboardNavigation();
    bindVisibility();

    initializeState();

    requestRender();

    handleInitialHash();
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:true
      }
    );
  } else {
    init();
  }

  window.addEventListener(
    "load",
    () => {
      if (!state.loaderDone) {
        window.setTimeout(
          finishLoader,
          prefersReducedMotion.matches
            ? 50
            : 250
        );
      }

      state.scrollDirty = true;
      requestRender();
    },
    {
      once:true
    }
  );

})();
