/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER HOME JS
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01 — CONFIG
     ======================================================= */

  const CONFIG = {
    loaderMinimumTime: 450,
    loaderMaximumWait: 4500,

    standbyDelay: 30000,
    standbyWakeDistance: 4,

    revealThreshold: 0.12,
    sectionThreshold: 0.52,

    cursorLerp: 0.16,
    magneticStrength: 0.18,

    resizeDebounce: 180
  };


  /* =======================================================
     02 — STATE
     ======================================================= */

  const state = {
    menuOpen: false,

    standbyActive: false,
    standbyWaking: false,

    currentSection: 1,
    previousSection: 1,

    standbyTimer: null,
    standbyWakeTimer: null,

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    touchDevice:
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window,

    cursorEnabled: false,

    scrollTicking: false,
    resizeTimer: null,

    lastActivity: Date.now(),

    menuLastFocused: null
  };


  /* =======================================================
     03 — HELPERS
     ======================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isInteractiveTarget = (target) =>
    target instanceof Element &&
    !!target.closest(
      "a, button, input, textarea, select, [role='button']"
    );

  const getSection = (number) =>
    document.querySelector(
      `.home-section[data-section="${number}"]`
    );

  const getSectionNumber = (element) =>
    element?.dataset?.section
      ? Number(element.dataset.section)
      : null;


  /* =======================================================
     04 — INITIALIZATION
     ======================================================= */

  function init() {
    initLoader();
    initHeader();
    initMenu();
    initScrollProgress();
    initSectionNavigation();
    initReveal();
    initDirectionInteractions();
    initMagneticElements();
    initCursor();
    initStandby();
    initPageTransitions();
    initInitialHash();
    initKeyboardNavigation();
    initVisibilityHandling();
    initResizeHandling();
    initScrollState();

    document.documentElement.classList.add("js");

    updateSectionState();
    updateHeaderCounter();
    updateSectionNavigation();
    updateNavigationTheme();

    resetStandbyTimer();
  }


  /* =======================================================
     05 — LOADER
     ======================================================= */

  function initLoader() {
    const loader = $("#page-loader");

    if (!loader) {
      return;
    }

    const startedAt = performance.now();
    let completed = false;

    const finish = () => {
      if (completed) {
        return;
      }

      completed = true;

      const elapsed =
        performance.now() - startedAt;

      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        loader.classList.add("is-hidden");

        window.setTimeout(() => {
          loader.setAttribute(
            "aria-hidden",
            "true"
          );
        }, 750);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener(
        "load",
        finish,
        { once: true }
      );
    }

    window.setTimeout(
      finish,
      CONFIG.loaderMaximumWait
    );
  }


  /* =======================================================
     06 — HEADER
     ======================================================= */

  function initHeader() {
    const header = $(".site-header");

    if (!header) {
      return;
    }

    const update = () => {
      header.classList.toggle(
        "is-scrolled",
        window.scrollY > 20
      );
    };

    update();

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );
  }


  /* =======================================================
     07 — MAIN MENU
     Il menu contiene le pagine interne.
     ======================================================= */

  function initMenu() {
    const menu = $("#site-menu");
    const toggle = $(".menu-toggle");
    const closeButton = $(".site-menu-close");
    const backdrop = $(".site-menu-backdrop");
    const links = $$(".site-menu-link");

    if (!menu || !toggle) {
      return;
    }

    const openMenu = () => {
      if (state.menuOpen) {
        return;
      }

      state.menuOpen = true;
      state.menuLastFocused =
        document.activeElement;

      menu.classList.add("is-open");

      document.body.classList.add(
        "is-menu-open"
      );

      toggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menu.setAttribute(
        "aria-hidden",
        "false"
      );

      window.clearTimeout(
        state.standbyTimer
      );

      requestAnimationFrame(() => {
        closeButton?.focus();
      });
    };

    const closeMenu = () => {
      if (!state.menuOpen) {
        return;
      }

      state.menuOpen = false;

      menu.classList.remove("is-open");

      document.body.classList.remove(
        "is-menu-open"
      );

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menu.setAttribute(
        "aria-hidden",
        "true"
      );

      if (
        state.menuLastFocused &&
        typeof state.menuLastFocused.focus ===
          "function"
      ) {
        state.menuLastFocused.focus();
      }

      state.menuLastFocused = null;

      resetStandbyTimer();
    };

    toggle.addEventListener(
      "click",
      () => {
        if (state.menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );

    closeButton?.addEventListener(
      "click",
      closeMenu
    );

    backdrop?.addEventListener(
      "click",
      closeMenu
    );

    links.forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );

      const href =
        link.getAttribute("href");

      if (
        href &&
        !href.startsWith("#") &&
        window.location.pathname.endsWith(
          href.replace(/\/$/, "")
        )
      ) {
        link.classList.add(
          "is-active"
        );
      }
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (!state.menuOpen) {
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
          return;
        }

        if (event.key !== "Tab") {
          return;
        }

        const focusable = $$(
          "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])",
          menu
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
  }


  /* =======================================================
     08 — SCROLL PROGRESS
     ======================================================= */

  function initScrollProgress() {
    const progress =
      $(".scroll-progress-fill");

    if (!progress) {
      return;
    }

    const update = () => {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        documentHeight > 0
          ? (window.scrollY /
              documentHeight) *
            100
          : 0;

      progress.style.width =
        `${clamp(
          percentage,
          0,
          100
        )}%`;
    };

    update();

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      update,
      { passive: true }
    );
  }


  /* =======================================================
     09 — HORIZONTAL SECTION NAVIGATION
     ======================================================= */

  function initSectionNavigation() {
    const nav =
      $(".home-section-nav");

    if (!nav) {
      return;
    }

    const track =
      $(".home-section-nav-track", nav);

    const items =
      $$(".home-section-nav-item", nav);

    if (!track || !items.length) {
      return;
    }

    items.forEach((item) => {
      item.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          const targetNumber =
            Number(
              item.dataset.sectionTarget
            );

          if (!targetNumber) {
            return;
          }

          const section =
            getSection(targetNumber);

          if (!section) {
            return;
          }

          section.scrollIntoView({
            behavior:
              state.reducedMotion
                ? "auto"
                : "smooth",
            block: "start"
          });

          resetStandbyTimer();
        }
      );
    });

    if (
      "IntersectionObserver" in window
    ) {
      const observer =
        new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              const number =
                getSectionNumber(
                  entry.target
                );

              if (number) {
                updateCurrentSection(
                  number
                );
              }
            });
          },
          {
            threshold:
              CONFIG.sectionThreshold,

            rootMargin:
              "-10% 0px -35% 0px"
          }
        );

      $$(".home-section").forEach(
        (section) => {
          observer.observe(section);
        }
      );
    }
  }


  /* =======================================================
     10 — SECTION STATE
     ======================================================= */

  function updateSectionState() {
    const sections =
      $$(".home-section");

    if (!sections.length) {
      return;
    }

    let closest = null;
    let closestDistance =
      Infinity;

    sections.forEach(
      (section) => {
        const rect =
          section.getBoundingClientRect();

        const distance =
          Math.abs(
            rect.top -
              window.innerHeight *
                0.35
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closest = section;
        }
      }
    );

    const number =
      getSectionNumber(closest);

    if (number) {
      updateCurrentSection(number);
    }
  }


  function updateCurrentSection(
    number
  ) {
    if (
      !number ||
      number ===
        state.currentSection
    ) {
      return;
    }

    state.previousSection =
      state.currentSection;

    state.currentSection =
      number;

    updateHeaderCounter();
    updateSectionNavigation();
    updateNavigationTheme();
  }


  function updateHeaderCounter() {
    const current =
      $(".header-section-current");

    if (!current) {
      return;
    }

    current.textContent =
      String(
        state.currentSection
      ).padStart(2, "0");
  }


  function updateSectionNavigation() {
    const items =
      $$(".home-section-nav-item");

    items.forEach((item) => {
      const target =
        Number(
          item.dataset.sectionTarget
        );

      const active =
        target ===
        state.currentSection;

      item.classList.toggle(
        "is-active",
        active
      );

      if (active) {
        item.setAttribute(
          "aria-current",
          "true"
        );
      } else {
        item.removeAttribute(
          "aria-current"
        );
      }
    });

    const active =
      items.find(
        (item) =>
          Number(
            item.dataset.sectionTarget
          ) ===
          state.currentSection
      );

    if (active) {
      active.scrollIntoView({
        behavior:
          state.reducedMotion
            ? "auto"
            : "smooth",

        inline: "center",
        block: "nearest"
      });
    }
  }


  function updateNavigationTheme() {
    const nav =
      $(".home-section-nav");

    if (!nav) {
      return;
    }

    const section =
      getSection(
        state.currentSection
      );

    if (!section) {
      return;
    }

    const isLight =
      section.classList.contains(
        "home-section-light"
      );

    nav.classList.toggle(
      "is-light",
      isLight
    );
  }


  /* =======================================================
     11 — REVEAL
     ======================================================= */

  function initReveal() {
    const elements =
      $$(".reveal");

    if (!elements.length) {
      return;
    }

    if (
      state.reducedMotion ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      elements.forEach(
        (element) => {
          element.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (
          entries,
          observerInstance
        ) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              observerInstance.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold:
            CONFIG.revealThreshold
        }
      );

    elements.forEach(
      (element) => {
        observer.observe(element);
      }
    );
  }


  /* =======================================================
     12 — DIRECTION INTERACTIONS
     ======================================================= */

  function initDirectionInteractions() {
    const items =
      $$(".direction-item");

    items.forEach((item) => {
      item.addEventListener(
        "mouseenter",
        () => {
          item.classList.add(
            "is-hover"
          );
        }
      );

      item.addEventListener(
        "mouseleave",
        () => {
          item.classList.remove(
            "is-hover"
          );
        }
      );
    });
  }


  /* =======================================================
     13 — MAGNETIC ELEMENTS
     ======================================================= */

  function initMagneticElements() {
    if (
      state.touchDevice ||
      state.reducedMotion
    ) {
      return;
    }

    const elements =
      $$("[data-magnetic]");

    elements.forEach(
      (element) => {
        element.addEventListener(
          "pointermove",
          (event) => {
            if (
              event.pointerType !==
              "mouse"
            ) {
              return;
            }

            const rect =
              element.getBoundingClientRect();

            const x =
              event.clientX -
              (rect.left +
                rect.width / 2);

            const y =
              event.clientY -
              (rect.top +
                rect.height / 2);

            const moveX =
              x *
              CONFIG.magneticStrength;

            const moveY =
              y *
              CONFIG.magneticStrength;

            element.style.transform =
              `translate3d(${moveX}px, ${moveY}px, 0)`;
          },
          { passive: true }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            element.style.transform =
              "";
          }
        );
      }
    );
  }


  /* =======================================================
     14 — CUSTOM CURSOR
     ======================================================= */

  function initCursor() {
    if (
      state.touchDevice ||
      state.reducedMotion
    ) {
      return;
    }

    const cursor =
      $(".cursor");

    const dot =
      $(".cursor-dot");

    const ring =
      $(".cursor-ring");

    if (
      !cursor ||
      !dot ||
      !ring
    ) {
      return;
    }

    state.cursorEnabled =
      true;

    cursor.classList.add(
      "is-enabled"
    );

    let mouseX = -100;
    let mouseY = -100;

    let dotX = mouseX;
    let dotY = mouseY;

    let ringX = mouseX;
    let ringY = mouseY;

    const render = () => {
      dotX +=
        (mouseX - dotX) *
        CONFIG.cursorLerp;

      dotY +=
        (mouseY - dotY) *
        CONFIG.cursorLerp;

      ringX +=
        (mouseX - ringX) *
        0.1;

      ringY +=
        (mouseY - ringY) *
        0.1;

      dot.style.transform =
        `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

      ring.style.transform =
        `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(
        render
      );
    };

    render();

    window.addEventListener(
      "pointermove",
      (event) => {
        if (
          event.pointerType !==
          "mouse"
        ) {
          return;
        }

        mouseX =
          event.clientX;

        mouseY =
          event.clientY;
      },
      { passive: true }
    );

    $$(
      "a, button, [data-magnetic]"
    ).forEach((element) => {
      element.addEventListener(
        "mouseenter",
        () => {
          cursor.classList.add(
            "is-hover"
          );
        }
      );

      element.addEventListener(
        "mouseleave",
        () => {
          cursor.classList.remove(
            "is-hover"
          );
        }
      );
    });
  }


  /* =======================================================
     15 — STANDBY
     Attivazione dopo inattività.
     Risveglio tramite movimento.
     Click / wheel / tastiera = fallback.
     ======================================================= */

  function initStandby() {
    const standby =
      $(".standby-screen");

    if (!standby) {
      return;
    }

    let standbyMouseX = null;
    let standbyMouseY = null;


    /* -------------------------------------------------------
       ATTIVA
       ------------------------------------------------------- */

    const activateStandby = () => {
      if (
        state.standbyActive ||
        state.menuOpen
      ) {
        return;
      }

      state.standbyActive =
        true;

      state.standbyWaking =
        false;

      standbyMouseX = null;
      standbyMouseY = null;

      standby.classList.add(
        "is-active"
      );

      standby.classList.remove(
        "is-waking"
      );

      standby.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "is-standby"
      );
    };


    /* -------------------------------------------------------
       RISVEGLIA
       ------------------------------------------------------- */

    const wakeStandby = () => {
      if (
        !state.standbyActive ||
        state.standbyWaking
      ) {
        return;
      }

      state.standbyWaking =
        true;

      standby.classList.add(
        "is-waking"
      );

      window.clearTimeout(
        state.standbyWakeTimer
      );

      state.standbyWakeTimer =
        window.setTimeout(
          () => {
            standby.classList.remove(
              "is-active",
              "is-waking"
            );

            standby.setAttribute(
              "aria-hidden",
              "true"
            );

            document.body.classList.remove(
              "is-standby"
            );

            state.standbyActive =
              false;

            state.standbyWaking =
              false;

            standbyMouseX = null;
            standbyMouseY = null;

            resetStandbyTimer();
          },
          state.reducedMotion
            ? 0
            : 360
        );
    };


    /* -------------------------------------------------------
       MOVIMENTO POINTER
       ------------------------------------------------------- */

    const handlePointerMove =
      (event) => {

        if (!state.standbyActive) {
          resetStandbyTimer();
          return;
        }

        /*
         * Mouse e penna:
         * il movimento fisico del puntatore
         * è il trigger principale.
         */
        if (
          event.pointerType &&
          event.pointerType !== "mouse" &&
          event.pointerType !== "pen"
        ) {
          return;
        }

        const x =
          event.clientX;

        const y =
          event.clientY;


        /*
         * Primo rilevamento.
         */
        if (
          standbyMouseX === null ||
          standbyMouseY === null
        ) {
          standbyMouseX = x;
          standbyMouseY = y;
          return;
        }


        const dx =
          x - standbyMouseX;

        const dy =
          y - standbyMouseY;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        standbyMouseX = x;
        standbyMouseY = y;


        /*
         * Anche un piccolo movimento
         * deve essere sufficiente.
         */
        if (
          distance >=
          CONFIG.standbyWakeDistance
        ) {
          wakeStandby();
        }
      };


    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true
      }
    );


    /* -------------------------------------------------------
       TOUCH MOVE
       ------------------------------------------------------- */

    window.addEventListener(
      "touchmove",
      () => {
        if (
          state.standbyActive
        ) {
          wakeStandby();
        } else {
          resetStandbyTimer();
        }
      },
      {
        passive: true
      }
    );


    /* -------------------------------------------------------
       WHEEL
       ------------------------------------------------------- */

    window.addEventListener(
      "wheel",
      () => {
        if (
          state.standbyActive
        ) {
          wakeStandby();
        } else {
          resetStandbyTimer();
        }
      },
      {
        passive: true
      }
    );


    /* -------------------------------------------------------
       CLICK FALLBACK
       ------------------------------------------------------- */

    window.addEventListener(
      "click",
      () => {
        if (
          state.standbyActive
        ) {
          wakeStandby();
        } else {
          resetStandbyTimer();
        }
      },
      true
    );


    /* -------------------------------------------------------
       KEYBOARD FALLBACK
       ------------------------------------------------------- */

    window.addEventListener(
      "keydown",
      () => {
        if (
          state.standbyActive
        ) {
          wakeStandby();
        } else {
          resetStandbyTimer();
        }
      },
      true
    );


    /* -------------------------------------------------------
       EVENTUALE PULSANTE LEGACY
       ------------------------------------------------------- */

    const wakeButton =
      $(".standby-wake");

    if (wakeButton) {
      wakeButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          wakeStandby();
        }
      );
    }


    /* -------------------------------------------------------
       API PUBBLICA
       ------------------------------------------------------- */

    window.CPStandby = {
      activate:
        activateStandby,

      wake:
        wakeStandby
    };
  }


  /* =======================================================
     16 — STANDBY TIMER
     ======================================================= */

  function resetStandbyTimer() {
    if (
      state.menuOpen ||
      state.standbyActive
    ) {
      return;
    }

    window.clearTimeout(
      state.standbyTimer
    );

    state.lastActivity =
      Date.now();

    state.standbyTimer =
      window.setTimeout(
        () => {
          if (
            !state.menuOpen &&
            !state.standbyActive &&
            document.visibilityState ===
              "visible"
          ) {
            if (
              window.CPStandby &&
              typeof
                window.CPStandby.activate ===
                "function"
            ) {
              window.CPStandby.activate();
            }
          }
        },
        CONFIG.standbyDelay
      );
  }


  /* =======================================================
     17 — PAGE TRANSITIONS
     ======================================================= */

  function initPageTransitions() {
    const transition =
      $(".page-transition");

    if (!transition) {
      return;
    }

    const links =
      $$("a[href]");

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {

          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          const href =
            link.getAttribute(
              "href"
            );

          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith(
              "javascript:"
            )
          ) {
            return;
          }

          let targetUrl;

          try {
            targetUrl =
              new URL(
                href,
                window.location.href
              );
          } catch {
            return;
          }

          if (
            targetUrl.origin !==
            window.location.origin
          ) {
            return;
          }

          event.preventDefault();

          transition.classList.add(
            "is-active"
          );

          window.setTimeout(
            () => {
              window.location.href =
                targetUrl.href;
            },
            state.reducedMotion
              ? 0
              : 480
          );
        }
      );
    });

    window.addEventListener(
      "pageshow",
      () => {
        transition.classList.remove(
          "is-active"
        );
      }
    );
  }


  /* =======================================================
     18 — HASH NAVIGATION
     ======================================================= */

  function initInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    let target = null;

    try {
      target =
        document.querySelector(
          hash
        );
    } catch {
      return;
    }

    if (!target) {
      return;
    }

    window.setTimeout(
      () => {
        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });
      },
      100
    );
  }


  /* =======================================================
     19 — KEYBOARD SECTION NAVIGATION
     ======================================================= */

  function initKeyboardNavigation() {
    document.addEventListener(
      "keydown",
      (event) => {

        if (
          state.menuOpen ||
          state.standbyActive
        ) {
          return;
        }

        if (
          isInteractiveTarget(
            event.target
          )
        ) {
          return;
        }

        let targetNumber = null;


        if (
          event.key ===
          "ArrowDown"
        ) {
          targetNumber =
            clamp(
              state.currentSection + 1,
              1,
              10
            );
        }


        if (
          event.key ===
          "ArrowUp"
        ) {
          targetNumber =
            clamp(
              state.currentSection - 1,
              1,
              10
            );
        }


        if (
          event.key ===
          "PageDown"
        ) {
          targetNumber =
            clamp(
              state.currentSection + 1,
              1,
              10
            );
        }


        if (
          event.key ===
          "PageUp"
        ) {
          targetNumber =
            clamp(
              state.currentSection - 1,
              1,
              10
            );
        }


        if (
          event.key ===
          "Home"
        ) {
          targetNumber = 1;
        }


        if (
          event.key ===
          "End"
        ) {
          targetNumber = 10;
        }


        if (!targetNumber) {
          return;
        }


        const section =
          getSection(
            targetNumber
          );

        if (!section) {
          return;
        }


        event.preventDefault();


        section.scrollIntoView({
          behavior:
            state.reducedMotion
              ? "auto"
              : "smooth",

          block: "start"
        });


        resetStandbyTimer();
      }
    );
  }


  /* =======================================================
     20 — VISIBILITY
     ======================================================= */

  function initVisibilityHandling() {
    document.addEventListener(
      "visibilitychange",
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {
          if (
            !state.standbyActive
          ) {
            resetStandbyTimer();
          }
        } else {
          window.clearTimeout(
            state.standbyTimer
          );
        }
      }
    );
  }


  /* =======================================================
     21 — RESIZE
     ======================================================= */

  function initResizeHandling() {
    window.addEventListener(
      "resize",
      () => {

        window.clearTimeout(
          state.resizeTimer
        );

        state.resizeTimer =
          window.setTimeout(
            () => {
              updateSectionState();
              updateSectionNavigation();
              updateNavigationTheme();
            },
            CONFIG.resizeDebounce
          );
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     22 — SCROLL STATE
     ======================================================= */

  function initScrollState() {
    window.addEventListener(
      "scroll",
      () => {

        if (
          state.scrollTicking
        ) {
          return;
        }

        state.scrollTicking =
          true;

        requestAnimationFrame(
          () => {
            updateSectionState();

            state.scrollTicking =
              false;
          }
        );

        /*
         * Lo scroll costituisce
         * attività dell'utente.
         */
        if (
          !state.standbyActive
        ) {
          resetStandbyTimer();
        }
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     23 — START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }


  /* =======================================================
     24 — GLOBAL API
     ======================================================= */

  window.CP = {

    get state() {
      return {
        ...state
      };
    },


    goToSection(number) {
      const target =
        clamp(
          Number(number) || 1,
          1,
          10
        );

      const section =
        getSection(target);

      if (!section) {
        return;
      }

      section.scrollIntoView({
        behavior:
          state.reducedMotion
            ? "auto"
            : "smooth",

        block: "start"
      });
    },


    openMenu() {
      const toggle =
        $(".menu-toggle");

      if (
        toggle &&
        !state.menuOpen
      ) {
        toggle.click();
      }
    },


    closeMenu() {
      const close =
        $(".site-menu-close");

      if (
        close &&
        state.menuOpen
      ) {
        close.click();
      }
    },


    activateStandby() {
      if (
        window.CPStandby &&
        typeof
          window.CPStandby.activate ===
          "function"
      ) {
        window.CPStandby.activate();
      }
    },


    wakeStandby() {
      if (
        window.CPStandby &&
        typeof
          window.CPStandby.wake ===
          "function"
      ) {
        window.CPStandby.wake();
      }
    }
  };

})();
