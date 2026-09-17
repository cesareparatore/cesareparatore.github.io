/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER JS — 17.09.2026
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. CONFIG
     ======================================================= */

  const CONFIG = {
    loaderMinimumTime: 450,
    loaderMaximumWait: 4500,

    standbyDelay: 30000,
    standbyWakeDistance: 4,

    revealThreshold: 0.12,
    sectionThreshold: 0.52,

    cursorLerp: 0.16,

    resizeDebounce: 180,

    scrollNavigationOffset: 18
  };


  /* =======================================================
     02. STATE
     ======================================================= */

  const state = {
    menuOpen: false,

    standbyActive: false,
    standbyWaking: false,

    currentSection: "01",
    previousSection: "01",

    standbyTimer: null,

    lastActivity: Date.now(),

    menuLastFocused: null,

    reducedMotion:
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,

    touchDevice:
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0,

    cursorEnabled: false,

    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,

    cursorTargetX: window.innerWidth / 2,
    cursorTargetY: window.innerHeight / 2,

    standbyMouseX: window.innerWidth / 2,
    standbyMouseY: window.innerHeight / 2,

    lastScrollY: window.scrollY,

    sectionObserver: null,
    revealObserver: null,

    resizeTimer: null,

    footerVisible: false
  };


  /* =======================================================
     03. DOM
     ======================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));


  /* =======================================================
     04. HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isInteractiveElement = (element) => {
    if (!element) return false;

    return Boolean(
      element.closest(
        "a, button, input, textarea, select, summary, [role='button']"
      )
    );
  };

  const getSectionId = (section) => {
    if (!section) return null;

    return (
      section.dataset.section ||
      section.id ||
      null
    );
  };


  /* =======================================================
     05. LOADER
     ======================================================= */

  function initLoader() {
    const loader = $("#page-loader");

    if (!loader) return;

    const startedAt = performance.now();

    const finish = () => {
      const elapsed = performance.now() - startedAt;

      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        loader.classList.add("is-hidden");

        window.setTimeout(() => {
          loader.setAttribute("aria-hidden", "true");
        }, 800);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
      return;
    }

    window.addEventListener(
      "load",
      finish,
      { once: true }
    );

    window.setTimeout(finish, CONFIG.loaderMaximumWait);
  }


  /* =======================================================
     06. HEADER
     ======================================================= */

  function initHeader() {
    updateHeaderCounter();
  }

  function updateHeaderCounter() {
    const current = $(".header-counter-current");

    if (!current) return;

    current.textContent = state.currentSection;
  }


  /* =======================================================
     07. MAIN MENU
     ======================================================= */

  function initMenu() {
    const menu = $(".site-menu");
    const trigger = $(".menu-trigger");
    const close = $(".site-menu-close");
    const backdrop = $(".site-menu-backdrop");

    if (!menu || !trigger) return;

    trigger.addEventListener("click", () => {
      openMenu();
    });

    close?.addEventListener("click", () => {
      closeMenu();
    });

    backdrop?.addEventListener("click", () => {
      closeMenu();
    });

    $$(".site-menu-link").forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });

      link.addEventListener("mouseenter", () => {
        link.classList.add("is-tracing");
      });

      link.addEventListener("mouseleave", () => {
        link.classList.remove("is-tracing");
      });

      link.addEventListener("focus", () => {
        link.classList.add("is-tracing");
      });

      link.addEventListener("blur", () => {
        link.classList.remove("is-tracing");
      });
    });
  }

  function openMenu() {
    const menu = $(".site-menu");
    const trigger = $(".menu-trigger");

    if (!menu || state.menuOpen) return;

    state.menuOpen = true;
    state.menuLastFocused = document.activeElement;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");

    document.body.classList.add("is-locked");

    trigger?.setAttribute("aria-expanded", "true");

    const close = $(".site-menu-close");

    window.setTimeout(() => {
      close?.focus();
    }, 80);
  }

  function closeMenu() {
    const menu = $(".site-menu");
    const trigger = $(".menu-trigger");

    if (!menu || !state.menuOpen) return;

    state.menuOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");

    document.body.classList.remove("is-locked");

    trigger?.setAttribute("aria-expanded", "false");

    if (
      state.menuLastFocused &&
      typeof state.menuLastFocused.focus === "function"
    ) {
      state.menuLastFocused.focus();
    }

    state.menuLastFocused = null;
  }


  /* =======================================================
     08. SCROLL PROGRESS
     ======================================================= */

  function initScrollProgress() {
    const bar = $(".scroll-progress-bar");

    if (!bar) return;

    const update = () => {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        documentHeight > 0
          ? window.scrollY / documentHeight
          : 0;

      bar.style.width =
        `${clamp(progress * 100, 0, 100)}%`;
    };

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      update
    );

    update();
  }


  /* =======================================================
     09. SECTION NAVIGATION
     
     IMPORTANT:
     - NEVER fixed
     - NEVER bottom anchored
     - follows document flow
     - mobile rail follows active section
     ======================================================= */

  function initSectionNavigation() {
    const nav = $(".home-section-nav");
    const track = $(".home-section-nav-track");

    if (!nav || !track) return;

    const items = $$(".home-section-nav-item", track);

    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener("click", () => {
        const targetId =
          item.dataset.sectionTarget;

        if (!targetId) return;

        const target =
          document.getElementById(targetId);

        if (!target) return;

        closeMenu();

        scrollToSection(target);
      });
    });

    updateSectionNavigation();
  }

  function scrollToSection(section) {
    const nav = $(".home-section-nav");

    const navHeight =
      nav?.getBoundingClientRect().height || 0;

    const targetTop =
      section.getBoundingClientRect().top +
      window.scrollY -
      navHeight -
      CONFIG.scrollNavigationOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: state.reducedMotion
        ? "auto"
        : "smooth"
    });
  }

  function updateSectionNavigation() {
    const items =
      $$(".home-section-nav-item");

    if (!items.length) return;

    items.forEach((item) => {
      const id =
        item.dataset.sectionTarget;

      const active =
        id === `section-${state.currentSection}`;

      item.classList.toggle(
        "is-active",
        active
      );

      item.setAttribute(
        "aria-current",
        active ? "true" : "false"
      );
    });

    /*
      Mobile:
      the active item is simply brought into view.
      Nothing becomes fixed.
    */
    const activeItem =
      items.find((item) =>
        item.dataset.sectionTarget ===
        `section-${state.currentSection}`
      );

    if (!activeItem) return;

    const track =
      $(".home-section-nav-track");

    if (!track) return;

    const trackRect =
      track.getBoundingClientRect();

    const itemRect =
      activeItem.getBoundingClientRect();

    const itemCenter =
      itemRect.left +
      itemRect.width / 2;

    const trackCenter =
      trackRect.left +
      trackRect.width / 2;

    const delta =
      itemCenter - trackCenter;

    if (
      Math.abs(delta) > 4 &&
      window.innerWidth <= 760
    ) {
      track.scrollBy({
        left: delta,
        behavior: state.reducedMotion
          ? "auto"
          : "smooth"
      });
    }
  }


  /* =======================================================
     10. REVEAL
     ======================================================= */

  function initReveal() {
    const elements =
      $$(".reveal");

    if (!elements.length) return;

    if (
      state.reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    state.revealObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(entry.target);
          });
        },
        {
          threshold: CONFIG.revealThreshold,
          rootMargin: "0px 0px -6% 0px"
        }
      );

    elements.forEach((element) => {
      state.revealObserver.observe(element);
    });
  }


  /* =======================================================
     11. SECTION OBSERVER
     ======================================================= */

  function initSectionObserver() {
    const sections =
      $$(".home-section[data-section]");

    if (!sections.length) return;

    if (!("IntersectionObserver" in window)) {
      return;
    }

    state.sectionObserver =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter((entry) =>
                entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (!visible.length) return;

          const id =
            getSectionId(visible[0].target);

          if (!id) return;

          setCurrentSection(id);
        },
        {
          threshold: [
            0.2,
            0.35,
            0.5,
            0.65,
            0.8
          ],
          rootMargin:
            "-20% 0px -20% 0px"
        }
      );

    sections.forEach((section) => {
      state.sectionObserver.observe(section);
    });
  }

  function setCurrentSection(id) {
    if (!id) return;

    if (id !== state.currentSection) {
      state.previousSection =
        state.currentSection;

      state.currentSection = id;

      updateHeaderCounter();
      updateSectionNavigation();
      updateSectionTheme();
    }
  }


  /* =======================================================
     12. SECTION THEME
     ======================================================= */

  function updateSectionTheme() {
    const section =
      document.querySelector(
        `.home-section[data-section="${state.currentSection}"]`
      );

    if (!section) return;

    const isDark =
      section.classList.contains(
        "home-section-dark"
      ) ||
      section.classList.contains(
        "directions-section"
      ) ||
      section.classList.contains(
        "direction-section"
      ) ||
      section.classList.contains(
        "territory-section"
      ) ||
      section.classList.contains(
        "your-direction-section"
      );

    document.body.classList.toggle(
      "cursor-dark",
      isDark
    );

    const nav =
      $(".home-section-nav");

    if (nav) {
      nav.classList.toggle(
        "is-dark",
        isDark
      );
    }
  }


  /* =======================================================
     13. FOOTER SAFETY
     
     No fixed navigation.
     The observer only hides the rail when footer
     becomes the active visual area.
     ======================================================= */

  function initFooterSafety() {
    const footer =
      $(".site-footer");

    const nav =
      $(".home-section-nav");

    if (!footer || !nav) return;

    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry) return;

          state.footerVisible =
            entry.isIntersecting;

          nav.classList.toggle(
            "is-footer-near",
            entry.isIntersecting
          );
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -8% 0px"
        }
      );

    observer.observe(footer);
  }


  /* =======================================================
     14. DIRECTION INTERACTIONS
     ======================================================= */

  function initDirectionInteractions() {
    const cards =
      $$(".direction-card");

    cards.forEach((card) => {
      card.addEventListener(
        "mouseenter",
        () => {
          card.classList.add("is-active");
        }
      );

      card.addEventListener(
        "mouseleave",
        () => {
          card.classList.remove("is-active");
        }
      );
    });
  }


  /* =======================================================
     15. MAGNETIC ELEMENTS
     ======================================================= */

  function initMagneticElements() {
    if (
      state.touchDevice ||
      state.reducedMotion
    ) {
      return;
    }

    const elements =
      $$(".magnetic");

    elements.forEach((element) => {
      element.addEventListener(
        "mousemove",
        (event) => {
          const rect =
            element.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left -
            rect.width / 2;

          const y =
            event.clientY -
            rect.top -
            rect.height / 2;

          const strength =
            0.18;

          element.style.transform =
            `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        }
      );

      element.addEventListener(
        "mouseleave",
        () => {
          element.style.transform =
            "";
        }
      );
    });
  }


  /* =======================================================
     16. CUSTOM CURSOR
     ======================================================= */

  function initCursor() {
    if (
      state.touchDevice ||
      state.reducedMotion
    ) {
      return;
    }

    const cursor =
      $(".custom-cursor");

    if (!cursor) return;

    state.cursorEnabled = true;

    document.body.classList.add(
      "cursor-enabled"
    );

    window.addEventListener(
      "pointermove",
      (event) => {
        state.cursorTargetX =
          event.clientX;

        state.cursorTargetY =
          event.clientY;
      },
      { passive: true }
    );

    const animate = () => {
      state.cursorX +=
        (state.cursorTargetX -
          state.cursorX) *
        CONFIG.cursorLerp;

      state.cursorY +=
        (state.cursorTargetY -
          state.cursorY) *
        CONFIG.cursorLerp;

      cursor.style.transform =
        `translate3d(${state.cursorX}px, ${state.cursorY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(animate);
    };

    animate();

    const interactive =
      $$(
        "a, button, .direction-card, .site-menu-link, .home-section-nav-item"
      );

    interactive.forEach((element) => {
      element.addEventListener(
        "mouseenter",
        () => {
          cursor.classList.add(
            "is-hovering"
          );
        }
      );

      element.addEventListener(
        "mouseleave",
        () => {
          cursor.classList.remove(
            "is-hovering"
          );
        }
      );
    });

    document.addEventListener(
      "mouseleave",
      () => {
        document.body.classList.add(
          "cursor-hidden"
        );
      }
    );

    document.addEventListener(
      "mouseenter",
      () => {
        document.body.classList.remove(
          "cursor-hidden"
        );
      }
    );
  }


  /* =======================================================
     17. STANDBY
     
     ACTIVE
       ↓ inactivity
     STANDBY
       ↓ movement
     ACTIVE
     ======================================================= */

  function initStandby() {
    const screen =
      $(".standby-screen");

    if (!screen) return;

    scheduleStandby();

    const registerMovement = (event) => {
      registerActivity(event);
    };

    window.addEventListener(
      "pointermove",
      registerMovement,
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      registerMovement,
      { passive: true }
    );

    window.addEventListener(
      "wheel",
      registerMovement,
      {
        passive: true
      }
    );

    window.addEventListener(
      "scroll",
      registerMovement,
      {
        passive: true
      }
    );

    window.addEventListener(
      "keydown",
      registerMovement
    );

    window.addEventListener(
      "pointerdown",
      registerMovement,
      { passive: true }
    );

    const wakeButton =
      $(".standby-wake");

    wakeButton?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        wakeStandby();
      }
    );

    screen.addEventListener(
      "pointermove",
      (event) => {
        state.standbyMouseX =
          event.clientX;

        state.standbyMouseY =
          event.clientY;

        if (
          state.standbyActive &&
          !state.standbyWaking
        ) {
          wakeStandby();
        }
      },
      { passive: true }
    );

    screen.addEventListener(
      "touchmove",
      () => {
        if (
          state.standbyActive &&
          !state.standbyWaking
        ) {
          wakeStandby();
        }
      },
      { passive: true }
    );
  }

  function registerActivity(event) {
    const now = Date.now();

    state.lastActivity = now;

    if (
      state.standbyActive &&
      !state.standbyWaking
    ) {
      if (
        event?.type === "pointermove"
      ) {
        const x =
          event.clientX ?? 0;

        const y =
          event.clientY ?? 0;

        const distance =
          Math.hypot(
            x - state.standbyMouseX,
            y - state.standbyMouseY
          );

        state.standbyMouseX = x;
        state.standbyMouseY = y;

        if (
          distance <
          CONFIG.standbyWakeDistance
        ) {
          return;
        }
      }

      wakeStandby();
      return;
    }

    scheduleStandby();
  }

  function scheduleStandby() {
    window.clearTimeout(
      state.standbyTimer
    );

    if (
      document.hidden ||
      state.menuOpen
    ) {
      return;
    }

    state.standbyTimer =
      window.setTimeout(
        () => {
          activateStandby();
        },
        CONFIG.standbyDelay
      );
  }

  function activateStandby() {
    const screen =
      $(".standby-screen");

    if (
      !screen ||
      state.standbyActive ||
      document.hidden ||
      state.menuOpen
    ) {
      return;
    }

    state.standbyActive = true;
    state.standbyWaking = false;

    screen.classList.add(
      "is-active"
    );

    screen.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "is-locked"
    );
  }

  function wakeStandby() {
    const screen =
      $(".standby-screen");

    if (
      !screen ||
      !state.standbyActive ||
      state.standbyWaking
    ) {
      return;
    }

    state.standbyWaking = true;

    screen.classList.remove(
      "is-active"
    );

    screen.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "is-locked"
    );

    window.setTimeout(
      () => {
        state.standbyActive = false;
        state.standbyWaking = false;

        state.lastActivity =
          Date.now();

        scheduleStandby();
      },
      850
    );
  }


  /* =======================================================
     18. PAGE TRANSITIONS
     ======================================================= */

  function initPageTransitions() {
    const transition =
      $(".page-transition");

    if (!transition) return;

    const links =
      $$("a[href]");

    links.forEach((link) => {
      const href =
        link.getAttribute("href");

      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      if (
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        isExternalLink(link)
      ) {
        return;
      }

      link.addEventListener(
        "click",
        (event) => {
          if (
            event.defaultPrevented ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();

          closeMenu();

          transition.classList.add(
            "is-active"
          );

          window.setTimeout(
            () => {
              window.location.href =
                href;
            },
            state.reducedMotion
              ? 0
              : 450
          );
        }
      );
    });
  }

  function isExternalLink(link) {
    try {
      const url =
        new URL(
          link.href,
          window.location.href
        );

      return (
        url.origin !==
        window.location.origin
      );
    } catch {
      return false;
    }
  }


  /* =======================================================
     19. HASH NAVIGATION
     ======================================================= */

  function initInitialHash() {
    if (!window.location.hash) {
      return;
    }

    const id =
      window.location.hash.substring(1);

    const target =
      document.getElementById(id);

    if (!target) return;

    window.setTimeout(() => {
      scrollToSection(target);
    }, 500);
  }


  /* =======================================================
     20. KEYBOARD NAVIGATION
     ======================================================= */

  function initKeyboardNavigation() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          if (state.menuOpen) {
            closeMenu();
            return;
          }

          if (state.standbyActive) {
            wakeStandby();
          }
        }

        if (
          event.key === "Tab" &&
          state.menuOpen
        ) {
          trapMenuFocus(event);
        }
      }
    );
  }

  function trapMenuFocus(event) {
    const menu =
      $(".site-menu");

    if (!menu) return;

    const focusable =
      $$(
        "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])",
        menu
      ).filter(
        (element) =>
          element.offsetParent !== null
      );

    if (!focusable.length) return;

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


  /* =======================================================
     21. VISIBILITY
     ======================================================= */

  function initVisibilityHandling() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          window.clearTimeout(
            state.standbyTimer
          );
          return;
        }

        state.lastActivity =
          Date.now();

        scheduleStandby();
      }
    );
  }


  /* =======================================================
     22. RESIZE
     ======================================================= */

  function initResizeHandling() {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );

        state.resizeTimer =
          window.setTimeout(() => {
            updateSectionNavigation();
            updateHeaderCounter();
          }, CONFIG.resizeDebounce);
      }
    );
  }


  /* =======================================================
     23. SCROLL STATE
     ======================================================= */

  function initScrollState() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
          const currentY =
            window.scrollY;

          const direction =
            currentY > state.lastScrollY
              ? "down"
              : "up";

          document.body.dataset.scrollDirection =
            direction;

          document.body.classList.toggle(
            "is-scrolling-down",
            direction === "down"
          );

          document.body.classList.toggle(
            "is-scrolling-up",
            direction === "up"
          );

          state.lastScrollY =
            currentY;

          ticking = false;
        });
      },
      { passive: true }
    );
  }


  /* =======================================================
     24. STANDBY GLOBAL API
     ======================================================= */

  window.CPStandby = {
    activate: activateStandby,
    wake: wakeStandby,
    isActive: () =>
      state.standbyActive
  };


  /* =======================================================
     25. DEBUG API
     ======================================================= */

  window.CP = {
    state,

    menu: {
      open: openMenu,
      close: closeMenu
    },

    standby: {
      activate: activateStandby,
      wake: wakeStandby
    },

    navigation: {
      current: () =>
        state.currentSection,

      goTo: (id) => {
        const target =
          document.getElementById(id);

        if (target) {
          scrollToSection(target);
        }
      }
    }
  };


  /* =======================================================
     26. INIT
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
    initSectionObserver();
    initFooterSafety();
    initScrollState();

    updateHeaderCounter();
    updateSectionNavigation();
    updateSectionTheme();

    registerActivity();
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
