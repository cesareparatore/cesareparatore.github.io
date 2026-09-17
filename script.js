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

  const isReducedMotion = () =>
    reducedMotionQuery.matches;

  const hasFinePointer = () =>
    finePointerQuery.matches;

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

  const revealItems = $$(
    "[data-reveal]"
  );

  const hero = $("#inizio");

  const directionItems = $$(
    ".direction-item"
  );

  const directionDoors = $$(
    ".direction-door"
  );

  const magneticItems = $$(
    "[data-magnetic]"
  );

  const navigationLinks = $$(
    "a[href]"
  );

  let previousScrollY = window.scrollY;

  let ticking = false;
  let menuOpen = false;

  let lastFocusedElement = null;

  let heroPointerX = 0;
  let heroPointerY = 0;
  let heroTargetX = 0;
  let heroTargetY = 0;

  let standbyTimer = null;
  let standbyActive = false;

  let activityScheduled = false;

  const STANDBY_DELAY = 30000;


  /* ==========================================================
     02 — LOADER
     ========================================================== */

  let loaderHidden = false;

  const hideLoader = () => {
    if (!loader || loaderHidden) return;

    loaderHidden = true;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute(
        "aria-hidden",
        "true"
      );
    }, 1000);
  };

  /*
    The loader must never be able to block
    the website indefinitely.
  */

  if (loader) {

    window.addEventListener(
      "load",
      () => {

        const delay =
          isReducedMotion()
            ? 180
            : 700;

        window.setTimeout(
          hideLoader,
          delay
        );

      },
      { once: true }
    );

    window.setTimeout(
      hideLoader,
      3500
    );
  }


  /* ==========================================================
     03 — HEADER
     ========================================================== */

  const updateHeader = () => {

    if (!header) return;

    const y =
      window.scrollY;

    if (y > 30) {
      header.classList.add(
        "is-scrolled"
      );
    } else {
      header.classList.remove(
        "is-scrolled"
      );
    }

    const delta =
      y - previousScrollY;

    if (
      delta > 8 &&
      y > 180 &&
      !menuOpen &&
      !standbyActive
    ) {
      header.classList.add(
        "is-hidden"
      );
    }

    if (
      delta < -4 ||
      y < 80 ||
      menuOpen ||
      standbyActive
    ) {
      header.classList.remove(
        "is-hidden"
      );
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

      scrollProgress.style.height =
        "0%";

      return;
    }

    const progress =
      clamp(
        window.scrollY /
          documentHeight,
        0,
        1
      ) * 100;

    scrollProgress.style.height =
      `${progress}%`;
  };


  /* ==========================================================
     05 — SECTION INDEX
     ========================================================== */

  const updateSectionIndex = () => {

    if (
      !sectionIndex ||
      !sections.length
    ) {
      return;
    }

    const viewportCenter =
      window.innerHeight * 0.42;

    let activeIndex = 0;

    let smallestDistance =
      Infinity;

    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const sectionCenter =
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            sectionCenter -
            viewportCenter
          );

        if (
          distance <
          smallestDistance
        ) {
          smallestDistance =
            distance;

          activeIndex =
            index;
        }

      }
    );

    const formattedCurrent =
      String(
        activeIndex + 1
      ).padStart(2, "0");

    const formattedTotal =
      String(
        sections.length
      ).padStart(2, "0");

    const current =
      $(".index-current", sectionIndex);

    const total =
      $(".index-total", sectionIndex);

    if (current) {
      current.textContent =
        formattedCurrent;
    }

    if (total) {
      total.textContent =
        formattedTotal;
    }

    /*
      Important:
      never replace the entire #section-index
      because that would destroy its internal
      navigation structure.
    */
  };


  /* ==========================================================
     06 — MASTER SCROLL LOOP
     ========================================================== */

  const updateScrollState = () => {

    ticking = false;

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

    window.requestAnimationFrame(
      updateScrollState
    );
  };


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive: true
    }
  );


  /* ==========================================================
     07 — REVEAL SYSTEM
     ========================================================== */

  let revealObserver = null;

  const prepareRevealSystem = () => {

    if (
      !revealItems.length
    ) {
      return;
    }

    if (
      isReducedMotion()
    ) {

      root.classList.remove(
        "reveal-ready"
      );

      revealItems.forEach(
        item => {
          item.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }

    root.classList.add(
      "reveal-ready"
    );

    if (
      revealObserver
    ) {
      revealObserver.disconnect();
    }

    revealObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              revealObserver.unobserve(
                entry.target
              );

            }
          );

        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    revealItems.forEach(
      item => {

        /*
          Avoid forcing elements into
          awkward overlapping states.
        */

        item.style.removeProperty(
          "transform"
        );

        revealObserver.observe(
          item
        );
      }
    );
  };


  /* ==========================================================
     08 — HERO PARALLAX
     ========================================================== */

  const updateHeroParallax = () => {

    if (!hero) return;

    heroPointerX +=
      (
        heroTargetX -
        heroPointerX
      ) * 0.075;

    heroPointerY +=
      (
        heroTargetY -
        heroPointerY
      ) * 0.075;

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

    const rect =
      hero.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    const x =
      (
        event.clientX -
        rect.left
      ) /
        rect.width -
      0.5;

    const y =
      (
        event.clientY -
        rect.top
      ) /
        rect.height -
      0.5;

    heroTargetX =
      x * 18;

    heroTargetY =
      y * 18;
  };


  const resetHeroPointer = () => {

    heroTargetX = 0;
    heroTargetY = 0;
  };


  if (hero) {

    hero.addEventListener(
      "pointermove",
      handleHeroPointer,
      {
        passive: true
      }
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

    if (!menu) {
      return [];
    }

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
    ).filter(
      element => {

        const style =
          window.getComputedStyle(
            element
          );

        return (
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      }
    );
  };


  const openMenu = () => {

    if (
      !menu ||
      !menuToggle ||
      menuOpen
    ) {
      return;
    }

    lastFocusedElement =
      document.activeElement;

    menuOpen = true;

    /*
      Stop ambient mode immediately.
    */

    stopStandby();

    menu.classList.add(
      "is-open"
    );

    body.classList.add(
      "menu-open"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    header?.classList.remove(
      "is-hidden"
    );

    root.classList.add(
      "navigation-active"
    );

    const focusable =
      getFocusableMenuElements();

    if (focusable.length) {

      window.setTimeout(
        () => {
          focusable[0].focus();
        },
        180
      );
    }
  };


  const closeMenu = ({
    restoreFocus = true
  } = {}) => {

    if (
      !menu ||
      !menuToggle ||
      !menuOpen
    ) {
      return;
    }

    menuOpen = false;

    menu.classList.remove(
      "is-open"
    );

    body.classList.remove(
      "menu-open"
    );

    root.classList.remove(
      "navigation-active"
    );

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
      typeof lastFocusedElement.focus ===
        "function"
    ) {

      window.setTimeout(
        () => {

          try {
            lastFocusedElement.focus();
          } catch {}

        },
        250
      );
    }

    lastFocusedElement =
      null;

    restartStandbyTimer();
  };


  if (menuToggle) {

    menuToggle.addEventListener(
      "click",
      () => {

        if (menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }

      }
    );
  }


  if (menuClose) {

    menuClose.addEventListener(
      "click",
      () => {
        closeMenu();
      }
    );
  }


  if (menuBackdrop) {

    menuBackdrop.addEventListener(
      "click",
      () => {
        closeMenu();
      }
    );
  }


  /* ==========================================================
     10 — KEYBOARD NAVIGATION
     ========================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

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

        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === last
      ) {

        event.preventDefault();

        first.focus();
      }
    }
  );


  /* ==========================================================
     11 — SECTION NAVIGATION
     ========================================================== */

  const getSectionFromHash = hash => {

    if (
      !hash ||
      hash === "#"
    ) {
      return null;
    }

    try {
      return document.querySelector(
        hash
      );
    } catch {
      return null;
    }
  };


  const scrollToSection = (
    target,
    updateHistory = true
  ) => {

    if (!target) return;

    const headerOffset =
      header?.offsetHeight || 0;

    const targetY =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerOffset -
      18;

    window.scrollTo({
      top: Math.max(
        targetY,
        0
      ),
      behavior:
        isReducedMotion()
          ? "auto"
          : "smooth"
    });

    if (
      updateHistory &&
      history.pushState
    ) {

      history.pushState(
        null,
        "",
        `#${target.id}`
      );
    }

    /*
      Update navigation immediately,
      then again during the scroll.
    */

    window.setTimeout(
      updateSectionIndex,
      isReducedMotion()
        ? 0
        : 250
    );
  };


  const anchorLinks = $$(
    'a[href^="#"]'
  );


  anchorLinks.forEach(
    link => {

      link.addEventListener(
        "click",
        event => {

          const href =
            link.getAttribute(
              "href"
            );

          const target =
            getSectionFromHash(
              href
            );

          if (!target) {
            return;
          }

          event.preventDefault();

          if (menuOpen) {

            closeMenu({
              restoreFocus: false
            });
          }

          scrollToSection(
            target,
            true
          );

          /*
            Temporary visual feedback.
          */

          link.classList.add(
            "is-navigating"
          );

          window.setTimeout(
            () => {
              link.classList.remove(
                "is-navigating"
              );
            },
            700
          );

        }
      );

    }
  );


  /* ==========================================================
     12 — SECTION INDEX CLICKABLE NAVIGATION
     ========================================================== */

  const sectionIndexLinks =
    $$(
      "[data-section-link]"
    );


  sectionIndexLinks.forEach(
    link => {

      link.addEventListener(
        "click",
        event => {

          const targetId =
            link.dataset.sectionLink;

          if (!targetId) {
            return;
          }

          const target =
            document.getElementById(
              targetId
            );

          if (!target) {
            return;
          }

          event.preventDefault();

          scrollToSection(
            target,
            true
          );

        }
      );
    }
  );


  /* ==========================================================
     13 — FIVE DIRECTIONS
     ========================================================== */

  const clearDirectionStates = () => {

    directionItems.forEach(
      item => {

        item.classList.remove(
          "is-active"
        );
      }
    );

    directionDoors.forEach(
      item => {

        item.classList.remove(
          "is-active"
        );
      }
    );
  };


  const activateDirection = item => {

    if (!item) return;

    clearDirectionStates();

    item.classList.add(
      "is-active"
    );

    const direction =
      item.dataset.direction;

    if (!direction) {
      return;
    }

    directionItems.forEach(
      other => {

        if (
          other.dataset.direction ===
          direction
        ) {

          other.classList.add(
            "is-active"
          );
        }
      }
    );

    directionDoors.forEach(
      other => {

        if (
          other.dataset.direction ===
          direction
        ) {

          other.classList.add(
            "is-active"
          );
        }
      }
    );
  };


  directionItems.forEach(
    item => {

      item.addEventListener(
        "mouseenter",
        () => {

          if (
            !hasFinePointer()
          ) {
            return;
          }

          activateDirection(
            item
          );
        }
      );

      item.addEventListener(
        "focusin",
        () => {
          activateDirection(
            item
          );
        }
      );
    }
  );


  directionDoors.forEach(
    item => {

      item.addEventListener(
        "mouseenter",
        () => {

          if (
            !hasFinePointer()
          ) {
            return;
          }

          activateDirection(
            item
          );
        }
      );

      item.addEventListener(
        "focusin",
        () => {
          activateDirection(
            item
          );
        }
      );
    }
  );


  /* ==========================================================
     14 — MAGNETIC INTERACTIONS
     ========================================================== */

  const magneticStates =
    new WeakMap();


  const setupMagnetic = item => {

    if (
      !hasFinePointer() ||
      isReducedMotion()
    ) {
      return;
    }

    const state = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      raf: null
    };

    magneticStates.set(
      item,
      state
    );


    const render = () => {

      state.x +=
        (
          state.targetX -
          state.x
        ) * 0.18;

      state.y +=
        (
          state.targetY -
          state.y
        ) * 0.18;

      item.style.transform =
        `translate3d(${state.x}px, ${state.y}px, 0)`;


      if (
        Math.abs(
          state.targetX -
          state.x
        ) > 0.01 ||
        Math.abs(
          state.targetY -
          state.y
        ) > 0.01
      ) {

        state.raf =
          requestAnimationFrame(
            render
          );

      } else {

        state.raf = null;
      }
    };


    item.addEventListener(
      "pointermove",
      event => {

        const rect =
          item.getBoundingClientRect();

        if (
          rect.width <= 0 ||
          rect.height <= 0
        ) {
          return;
        }

        const strength =
          Number(
            item.dataset
              .magneticStrength
          ) || 10;

        state.targetX =
          (
            (
              event.clientX -
              rect.left
            ) /
              rect.width -
            0.5
          ) * strength;

        state.targetY =
          (
            (
              event.clientY -
              rect.top
            ) /
              rect.height -
            0.5
          ) * strength;

        if (!state.raf) {

          state.raf =
            requestAnimationFrame(
              render
            );
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
            requestAnimationFrame(
              render
            );
        }
      }
    );
  };


  magneticItems.forEach(
    setupMagnetic
  );


  /* ==========================================================
     15 — STANDBY SYSTEM
     ========================================================== */

  /*
    ACTIVE
       ↓
    30 seconds without interaction
       ↓
    STANDBY

    Any interaction
       ↓
    AWAKEN
       ↓
    ACTIVE
  */


  const startStandbyTimer = () => {

    clearTimeout(
      standbyTimer
    );

    standbyTimer = null;

    if (
      isReducedMotion() ||
      menuOpen ||
      document.hidden
    ) {
      return;
    }

    standbyTimer =
      window.setTimeout(
        enterStandby,
        STANDBY_DELAY
      );
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

    /*
      The header remains visible.
      Standby is an atmosphere,
      NOT a lock screen.
    */

    header?.classList.remove(
      "is-hidden"
    );

    body.dispatchEvent(
      new CustomEvent(
        "cp:standby-enter"
      )
    );
  };


  const wakeFromStandby = () => {

    clearTimeout(
      standbyTimer
    );

    standbyTimer = null;

    if (!standbyActive) {

      startStandbyTimer();

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

    startStandbyTimer();
  };


  const stopStandby = () => {

    clearTimeout(
      standbyTimer
    );

    standbyTimer = null;

    if (standbyActive) {
      wakeFromStandby();
    }
  };


  const restartStandbyTimer = () => {

    if (standbyActive) {
      wakeFromStandby();
      return;
    }

    startStandbyTimer();
  };


  /* ==========================================================
     16 — ACTIVITY DETECTION
     ========================================================== */

  const registerActivity = () => {

    if (activityScheduled) {
      return;
    }

    activityScheduled = true;

    requestAnimationFrame(
      () => {

        activityScheduled =
          false;

        if (
          standbyActive
        ) {

          wakeFromStandby();

          return;
        }

        if (
          !menuOpen &&
          !document.hidden
        ) {

          startStandbyTimer();
        }
      }
    );
  };


  [
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach(
    type => {

      window.addEventListener(
        type,
        registerActivity,
        {
          passive: true
        }
      );
    }
  );


  window.addEventListener(
    "pointermove",
    registerActivity,
    {
      passive: true
    }
  );


  /* ==========================================================
     17 — VISIBILITY
     ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        stopStandby();

        return;
      }

      startStandbyTimer();
    }
  );


  /* ==========================================================
     18 — MOTION PREFERENCE
     ========================================================== */

  const handleMotionPreferenceChange =
    () => {

      if (
        isReducedMotion()
      ) {

        stopStandby();

        root.classList.remove(
          "reveal-ready"
        );

        revealItems.forEach(
          item => {

            item.classList.add(
              "is-visible"
            );
          }
        );

      } else {

        prepareRevealSystem();

        startStandbyTimer();
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


  /* ==========================================================
     19 — POINTER CAPABILITY
     ========================================================== */

  const handlePointerCapabilityChange =
    () => {

      if (
        !hasFinePointer()
      ) {

        heroTargetX = 0;
        heroTargetY = 0;

        magneticItems.forEach(
          item => {

            item.style.transform =
              "";
          }
        );
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
     20 — INITIAL HASH
     ========================================================== */

  const handleInitialHash = () => {

    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const target =
      getSectionFromHash(
        hash
      );

    if (!target) {
      return;
    }

    window.requestAnimationFrame(
      () => {

        window.setTimeout(
          () => {

            scrollToSection(
              target,
              false
            );

          },
          60
        );
      }
    );
  };


  window.addEventListener(
    "popstate",
    () => {

      const target =
        getSectionFromHash(
          window.location.hash
        );

      if (target) {

        scrollToSection(
          target,
          false
        );
      }
    }
  );


  /* ==========================================================
     21 — RESIZE
     ========================================================== */

  let resizeTimer = null;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(
          () => {

            updateScrollProgress();
            updateSectionIndex();

            if (
              !hasFinePointer()
            ) {

              heroTargetX = 0;
              heroTargetY = 0;
            }

          },
          150
        );
    },
    {
      passive: true
    }
  );


  /* ==========================================================
     22 — PAGE TRANSITIONS
     ========================================================== */

  const supportsViewTransition =
    typeof document.startViewTransition ===
    "function";


  const sameOrigin = url =>
    url.origin ===
    window.location.origin;


  const isDocumentNavigation =
    link => {

      const href =
        link.getAttribute(
          "href"
        );

      if (!href) {
        return false;
      }

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
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


  navigationLinks.forEach(
    link => {

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

          /*
            Important:
            don't put location.href directly
            inside a complex animation callback
            unless the browser supports the
            exact MPA transition lifecycle.
          */

          root.classList.add(
            "page-leaving"
          );

          window.setTimeout(
            () => {

              window.location.href =
                url.href;

            },
            isReducedMotion()
              ? 0
              : 260
          );
        }
      );
    }
  );


  if (
    supportsViewTransition
  ) {

    root.classList.add(
      "view-transitions"
    );
  }


  /* ==========================================================
     23 — STANDBY EVENT BRIDGE
     ========================================================== */

  body.addEventListener(
    "cp:standby-enter",
    () => {

      /*
        CSS owns the visual standby state.

        JS only controls:
        - state
        - timing
        - awakening
      */
    }
  );


  body.addEventListener(
    "cp:standby-wake",
    () => {

      /*
        CSS removes the ambient state.
      */
    }
  );


  /* ==========================================================
     24 — INITIALIZATION
     ========================================================== */

  const initialize = () => {

    /*
      MENU
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
      INITIAL SCROLL STATE
    */

    updateScrollProgress();
    updateSectionIndex();
    updateHeader();


    /*
      REVEAL
    */

    prepareRevealSystem();


    /*
      HASH
    */

    window.setTimeout(
      handleInitialHash,
      100
    );


    /*
      STANDBY
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
     25 — DEBUG API
     ========================================================== */

  window.CP = Object.freeze({

    openMenu,
    closeMenu,

    enterStandby,
    wakeFromStandby,

    scrollToSection,

    get state() {

      return Object.freeze({
        menuOpen,
        standbyActive,
        reducedMotion:
          isReducedMotion(),
        finePointer:
          hasFinePointer()
      });
    }
  });


})();
