/* ============================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM — 2026
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     00 — ROOT / CAPABILITIES
     ========================================================== */

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const finePointerQuery = window.matchMedia(
    "(pointer: fine)"
  );

  const isReducedMotion = () => reducedMotionQuery.matches;
  const hasFinePointer = () => finePointerQuery.matches;

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  /* ==========================================================
     01 — ELEMENT REFERENCES
     ========================================================== */

  const loader = $(".site-loader");
  const header = $("#site-header");
  const menu = $("#site-menu");
  const menuToggle = $("#menu-toggle");
  const menuClose = $(".menu-close");
  const menuBackdrop = $(".menu-backdrop");
  const scrollProgress = $("#scroll-progress");
  const sectionIndex = $("#section-index");

  const sections = $$(
    "main > section[id]"
  );

  const revealItems = $$("[data-reveal]");

  const hero = $("#inizio");
  const heroTitle = $("#hero-title");

  const directionItems = $$(".direction-item");
  const directionDoors = $$(".direction-door");

  const magneticItems = $$("[data-magnetic]");

  let previousScrollY = window.scrollY;
  let currentScrollY = window.scrollY;

  let ticking = false;
  let menuOpen = false;
  let lastFocusedElement = null;

  let heroPointerX = 0;
  let heroPointerY = 0;
  let heroTargetX = 0;
  let heroTargetY = 0;

  let standbyTimer = null;
  let standbyActive = false;
  let lastInteraction = performance.now();

  const STANDBY_DELAY = 30000;


  /* ==========================================================
     02 — LOADER
     ========================================================== */

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 1000);
  };

  if (loader) {
    window.addEventListener("load", () => {
      const delay = isReducedMotion() ? 250 : 900;

      window.setTimeout(hideLoader, delay);
    });

    /* Safety fallback */
    window.setTimeout(hideLoader, 3800);
  }


  /* ==========================================================
     03 — HEADER STATE
     ========================================================== */

  const updateHeader = () => {
    if (!header) return;

    const y = window.scrollY;

    if (y > 30) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }

    const delta = y - previousScrollY;

    if (
      delta > 8 &&
      y > 180 &&
      !menuOpen &&
      !standbyActive
    ) {
      header.classList.add("is-hidden");
    }

    if (delta < -4 || y < 80 || menuOpen) {
      header.classList.remove("is-hidden");
    }

    previousScrollY = y;
  };


  /* ==========================================================
     04 — SCROLL PROGRESS
     ========================================================== */

  const updateScrollProgress = () => {
    if (!scrollProgress) return;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (documentHeight <= 0) {
      scrollProgress.style.height = "0%";
      return;
    }

    const progress =
      clamp(window.scrollY / documentHeight, 0, 1) * 100;

    scrollProgress.style.height = `${progress}%`;
  };


  /* ==========================================================
     05 — SECTION INDEX
     ========================================================== */

  const updateSectionIndex = () => {
    if (!sectionIndex || !sections.length) return;

    const viewportCenter = window.innerHeight * 0.45;

    let activeSection = sections[0];

    for (const section of sections) {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= viewportCenter &&
        rect.bottom >= viewportCenter
      ) {
        activeSection = section;
        break;
      }
    }

    const index =
      sections.indexOf(activeSection) + 1;

    const formatted =
      String(index).padStart(2, "0");

    /*
      Compatible with:
      <span class="index-current">01</span>
      <span class="index-separator">/</span>
      <span class="index-total">10</span>
    */

    const current = $(".index-current", sectionIndex);

    if (current) {
      current.textContent = formatted;
    } else {
      sectionIndex.textContent =
        `${formatted} / ${String(sections.length).padStart(2, "0")}`;
    }
  };


  /* ==========================================================
     06 — MASTER SCROLL LOOP
     ========================================================== */

  const updateScrollState = () => {
    ticking = false;

    currentScrollY = window.scrollY;

    updateHeader();
    updateScrollProgress();
    updateSectionIndex();

    if (
      hero &&
      hasFinePointer() &&
      !isReducedMotion()
    ) {
      updateHeroParallax();
    }
  };

  const requestScrollUpdate = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateScrollState);
  };

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );


  /* ==========================================================
     07 — REVEAL SYSTEM
     ========================================================== */

  const prepareRevealSystem = () => {
    if (
      !revealItems.length ||
      isReducedMotion()
    ) {
      return;
    }

    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealItems.forEach(item => {
      observer.observe(item);
    });
  };


  /* ==========================================================
     08 — HERO PARALLAX
     ========================================================== */

  const updateHeroParallax = () => {
    if (!hero) return;

    heroPointerX +=
      (heroTargetX - heroPointerX) * 0.075;

    heroPointerY +=
      (heroTargetY - heroPointerY) * 0.075;

    hero.style.setProperty(
      "--hero-x",
      `${heroPointerX}px`
    );

    hero.style.setProperty(
      "--hero-y",
      `${heroPointerY}px`
    );
  };

  const handleHeroPointer = event => {
    if (
      !hero ||
      !hasFinePointer() ||
      isReducedMotion()
    ) {
      return;
    }

    const rect = hero.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    heroTargetX = x * 18;
    heroTargetY = y * 18;
  };

  const resetHeroPointer = () => {
    heroTargetX = 0;
    heroTargetY = 0;
  };

  if (hero) {
    hero.addEventListener(
      "pointermove",
      handleHeroPointer,
      { passive: true }
    );

    hero.addEventListener(
      "pointerleave",
      resetHeroPointer
    );
  }


  /* ==========================================================
     09 — MENU
     ========================================================== */

  const getFocusableMenuElements = () => {
    if (!menu) return [];

    return $$(
      `
      a[href],
      button:not([disabled]),
      input:not([disabled]),
      textarea:not([disabled]),
      select:not([disabled]),
      [tabindex]:not([tabindex="-1"])
      `,
      menu
    ).filter(el => {
      const style =
        window.getComputedStyle(el);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  };

  const openMenu = () => {
    if (!menu || !menuToggle) return;

    if (menuOpen) return;

    lastFocusedElement = document.activeElement;

    menuOpen = true;

    menu.classList.add("is-open");
    body.classList.add("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    header?.classList.remove("is-hidden");

    stopStandby();

    const focusable =
      getFocusableMenuElements();

    if (focusable.length) {
      window.setTimeout(() => {
        focusable[0].focus();
      }, 250);
    }
  };

  const closeMenu = ({
    restoreFocus = true
  } = {}) => {
    if (!menu || !menuToggle) return;

    if (!menuOpen) return;

    menuOpen = false;

    menu.classList.remove("is-open");
    body.classList.remove("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      window.setTimeout(() => {
        lastFocusedElement.focus();
      }, 350);
    }

    lastFocusedElement = null;

    restartStandbyTimer();
  };

  if (menuToggle) {
    menuToggle.addEventListener(
      "click",
      () => {
        menuOpen ? closeMenu() : openMenu();
      }
    );
  }

  if (menuClose) {
    menuClose.addEventListener(
      "click",
      () => closeMenu()
    );
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener(
      "click",
      () => closeMenu()
    );
  }


  /* ==========================================================
     10 — MENU KEYBOARD / FOCUS TRAP
     ========================================================== */

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      if (menuOpen) {
        closeMenu();
        return;
      }

      if (standbyActive) {
        wakeFromStandby();
      }

      return;
    }

    if (
      event.key !== "Tab" ||
      !menuOpen
    ) {
      return;
    }

    const focusable =
      getFocusableMenuElements();

    if (!focusable.length) return;

    const first = focusable[0];
    const last =
      focusable[focusable.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    }

    if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  });


  /* ==========================================================
     11 — MENU LINKS
     ========================================================== */

  const menuLinks = $$(
    ".primary-nav a"
  );

  menuLinks.forEach(link => {

    link.addEventListener("click", () => {

      const href =
        link.getAttribute("href") || "";

      if (href.startsWith("#")) {
        closeMenu({
          restoreFocus: false
        });
      }

    });

  });


  /* ==========================================================
     12 — SAME-PAGE SMOOTH NAVIGATION
     ========================================================== */

  const anchorLinks = $$(
    'a[href^="#"]'
  );

  anchorLinks.forEach(link => {

    link.addEventListener("click", event => {

      const href =
        link.getAttribute("href");

      if (
        !href ||
        href === "#" ||
        href.length <= 1
      ) {
        return;
      }

      const target =
        document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      const headerOffset =
        header?.offsetHeight || 0;

      const targetY =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top: Math.max(targetY, 0),
        behavior:
          isReducedMotion()
            ? "auto"
            : "smooth"
      });

      if (history.pushState) {
        history.pushState(
          null,
          "",
          href
        );
      }

      if (menuOpen) {
        closeMenu({
          restoreFocus: false
        });
      }
    });

  });


  /* ==========================================================
     13 — FIVE DIRECTIONS
     ========================================================== */

  const clearDirectionStates = () => {
    directionItems.forEach(item => {
      item.classList.remove("is-active");
    });

    directionDoors.forEach(item => {
      item.classList.remove("is-active");
    });
  };

  const activateDirection = item => {

    clearDirectionStates();

    item.classList.add("is-active");

    const direction =
      item.dataset.direction;

    if (!direction) return;

    directionItems.forEach(other => {
      if (
        other.dataset.direction === direction
      ) {
        other.classList.add("is-active");
      }
    });
  };

  directionItems.forEach(item => {

    item.addEventListener(
      "mouseenter",
      () => {
        if (!hasFinePointer()) return;
        activateDirection(item);
      }
    );

    item.addEventListener(
      "focusin",
      () => activateDirection(item)
    );

  });

  directionDoors.forEach(item => {

    item.addEventListener(
      "mouseenter",
      () => {
        if (!hasFinePointer()) return;

        activateDirection(item);
      }
    );

    item.addEventListener(
      "focusin",
      () => activateDirection(item)
    );

  });


  /* ==========================================================
     14 — MAGNETIC INTERACTIONS
     ========================================================== */

  const magneticStates = new WeakMap();

  const setupMagnetic = item => {

    if (
      !hasFinePointer() ||
      isReducedMotion()
    ) {
      return;
    }

    magneticStates.set(item, {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      raf: null
    });

    const state =
      magneticStates.get(item);

    const render = () => {

      state.x +=
        (state.targetX - state.x) * .18;

      state.y +=
        (state.targetY - state.y) * .18;

      item.style.transform =
        `translate3d(${state.x}px, ${state.y}px, 0)`;

      if (
        Math.abs(state.targetX - state.x) > .01 ||
        Math.abs(state.targetY - state.y) > .01
      ) {
        state.raf =
          requestAnimationFrame(render);
      } else {
        state.raf = null;
      }
    };

    item.addEventListener(
      "pointermove",
      event => {

        const rect =
          item.getBoundingClientRect();

        const strength =
          Number(item.dataset.magneticStrength) || 12;

        state.targetX =
          ((event.clientX - rect.left) / rect.width - .5)
          * strength;

        state.targetY =
          ((event.clientY - rect.top) / rect.height - .5)
          * strength;

        if (!state.raf) {
          state.raf =
            requestAnimationFrame(render);
        }
      }
    );

    item.addEventListener(
      "pointerleave",
      () => {

        state.targetX = 0;
        state.targetY = 0;

        if (!state.raf) {
          state.raf =
            requestAnimationFrame(render);
        }
      }
    );
  };

  magneticItems.forEach(setupMagnetic);


  /* ==========================================================
     15 — STANDBY SYSTEM
     ========================================================== */

  /*
    STATES

    ACTIVE
      normal interaction

    QUIET
      no input for a while

    STANDBY
      ambient visual mode

    AWAKEN
      first interaction restores active state
  */

  const startStandbyTimer = () => {

    if (
      isReducedMotion() ||
      menuOpen ||
      document.hidden
    ) {
      return;
    }

    clearTimeout(standbyTimer);

    standbyTimer =
      window.setTimeout(
        enterStandby,
        STANDBY_DELAY
      );
  };

  const restartStandbyTimer = () => {

    lastInteraction =
      performance.now();

    if (standbyActive) {
      wakeFromStandby();
    }

    startStandbyTimer();
  };

  const enterStandby = () => {

    if (
      standbyActive ||
      isReducedMotion() ||
      menuOpen ||
      document.hidden
    ) {
      return;
    }

    standbyActive = true;

    body.classList.add(
      "standby-active"
    );

    root.classList.add(
      "standby-mode"
    );

    header?.classList.remove(
      "is-hidden"
    );

    /*
      Keep the state deliberately subtle.
      The CSS layer remains responsible for
      the actual visual atmosphere.
    */

    body.dispatchEvent(
      new CustomEvent(
        "cp:standby-enter"
      )
    );
  };

  const wakeFromStandby = () => {

    if (!standbyActive) {
      restartStandbyTimer();
      return;
    }

    standbyActive = false;

    body.classList.remove(
      "standby-active"
    );

    root.classList.remove(
      "standby-mode"
    );

    body.dispatchEvent(
      new CustomEvent(
        "cp:standby-wake"
      )
    );

    lastInteraction =
      performance.now();

    startStandbyTimer();
  };

  const stopStandby = () => {

    clearTimeout(standbyTimer);

    standbyTimer = null;

    if (standbyActive) {
      wakeFromStandby();
    }
  };

  /*
    Activity signals.
    Pointermove is throttled because it can fire
    hundreds of times per second.
  */

  let activityScheduled = false;

  const registerActivity = () => {

    if (activityScheduled) return;

    activityScheduled = true;

    requestAnimationFrame(() => {

      activityScheduled = false;

      lastInteraction =
        performance.now();

      if (standbyActive) {
        wakeFromStandby();
      } else if (!menuOpen) {
        startStandbyTimer();
      }

    });
  };

  [
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach(type => {

    window.addEventListener(
      type,
      registerActivity,
      {
        passive: true
      }
    );

  });

  window.addEventListener(
    "pointermove",
    registerActivity,
    {
      passive: true
    }
  );


  /* ==========================================================
     16 — VISIBILITY
     ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {
        stopStandby();
        return;
      }

      restartStandbyTimer();

    }
  );


  /* ==========================================================
     17 — MEDIA QUERY CHANGES
     ========================================================== */

  const handleMotionPreferenceChange = () => {

    if (isReducedMotion()) {

      stopStandby();

      root.classList.remove(
        "reveal-ready"
      );

      revealItems.forEach(item => {
        item.classList.add(
          "is-visible"
        );
      });

    } else {

      prepareRevealSystem();
      restartStandbyTimer();

    }
  };

  if (
    typeof reducedMotionQuery.addEventListener ===
    "function"
  ) {
    reducedMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );
  } else {
    reducedMotionQuery.addListener(
      handleMotionPreferenceChange
    );
  }


  const handlePointerCapabilityChange = () => {

    if (!hasFinePointer()) {

      heroTargetX = 0;
      heroTargetY = 0;

      magneticItems.forEach(item => {
        item.style.transform = "";
      });

    }

  };

  if (
    typeof finePointerQuery.addEventListener ===
    "function"
  ) {
    finePointerQuery.addEventListener(
      "change",
      handlePointerCapabilityChange
    );
  } else {
    finePointerQuery.addListener(
      handlePointerCapabilityChange
    );
  }


  /* ==========================================================
     18 — INITIAL HASH
     ========================================================== */

  const handleInitialHash = () => {

    const hash =
      window.location.hash;

    if (!hash) return;

    const target =
      document.querySelector(hash);

    if (!target) return;

    window.requestAnimationFrame(() => {

      const offset =
        header?.offsetHeight || 0;

      window.scrollTo({
        top:
          target.getBoundingClientRect().top +
          window.scrollY -
          offset,
        behavior: "auto"
      });

    });

  };


  /* ==========================================================
     19 — RESIZE
     ========================================================== */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(resizeTimer);

      resizeTimer =
        window.setTimeout(() => {

          updateScrollProgress();
          updateSectionIndex();

          if (!hasFinePointer()) {
            heroTargetX = 0;
            heroTargetY = 0;
          }

        }, 150);

    },
    {
      passive: true
    }
  );


  /* ==========================================================
     20 — PAGE TRANSITIONS
     ========================================================== */

  /*
    Native View Transitions are used only when available.
    No dependency is required.
  */

  const supportsViewTransition =
    typeof document.startViewTransition ===
    "function";

  const sameOrigin =
    url => url.origin === window.location.origin;

  const isDocumentNavigation =
    link => {

      const href =
        link.getAttribute("href");

      if (!href) return false;

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return false;
      }

      try {

        const url =
          new URL(
            href,
            window.location.href
          );

        return (
          sameOrigin(url) &&
          url.pathname !==
            window.location.pathname
        );

      } catch {
        return false;
      }

    };


  const navigationLinks =
    $$("a[href]");

  navigationLinks.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        if (
          !supportsViewTransition ||
          isReducedMotion() ||
          !isDocumentNavigation(link)
        ) {
          return;
        }

        /*
          Do not hijack modified clicks.
        */

        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const url =
          new URL(
            link.href,
            window.location.href
          );

        event.preventDefault();

        if (menuOpen) {
          closeMenu({
            restoreFocus: false
          });
        }

        document.startViewTransition(
          () => {
            window.location.href =
              url.href;
          }
        );
      }
    );

  });


  /* ==========================================================
     21 — PAGE TRANSITION CSS HOOKS
     ========================================================== */

  if (supportsViewTransition) {
    root.classList.add(
      "view-transitions"
    );
  }


  /* ==========================================================
     22 — CUSTOM EVENT BRIDGE
     ========================================================== */

  body.addEventListener(
    "cp:standby-enter",
    () => {
      /*
        Hook intentionally kept empty.
        CSS can react to .standby-mode.
      */
    }
  );

  body.addEventListener(
    "cp:standby-wake",
    () => {
      /*
        Hook intentionally kept empty.
        CSS can react to removal of .standby-mode.
      */
    }
  );


  /* ==========================================================
     23 — INITIALIZATION
     ========================================================== */

  const initialize = () => {

    /*
      ARIA initial state
    */

    if (menu) {
      menu.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (menuToggle) {
      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    /*
      Initial visual state
    */

    updateScrollProgress();
    updateSectionIndex();
    updateHeader();

    prepareRevealSystem();

    /*
      Hash after layout has settled.
    */

    window.setTimeout(
      handleInitialHash,
      80
    );

    /*
      Standby starts only after the page
      is fully initialized.
    */

    startStandbyTimer();
  };


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }


  /* ==========================================================
     24 — DEBUG API
     ========================================================== */

  /*
    Intentionally non-invasive.
    Useful during development without
    requiring a framework.

    window.CP = {
      openMenu(),
      closeMenu(),
      enterStandby(),
      wakeFromStandby()
    }
  */

  window.CP = Object.freeze({
    openMenu,
    closeMenu,
    enterStandby,
    wakeFromStandby
  });

})();
