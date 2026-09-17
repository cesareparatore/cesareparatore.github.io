(() => {
  "use strict";

  /* =========================================================
     CONFIG
     ========================================================= */

  const CONFIG = {
    loaderMinimumTime: 450,
    loaderMaxWait: 4200,
    standbyDelay: 30000,
    revealThreshold: 0.12,
    sectionThreshold: 0.55,
    scrollEase: 700,
    magneticStrength: 0.18,
    cursorLerp: 0.16
  };


  /* =========================================================
     STATE
     ========================================================= */

  const state = {
    menuOpen: false,
    standbyActive: false,
    currentSection: 1,
    previousSection: 1,
    standbyTimer: null,
    reducedMotion: false,
    touchDevice: false,
    cursorEnabled: false,
    scrollTicking: false,
    menuLastFocused: null
  };


  /* =========================================================
     DOM HELPERS
     ========================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    state.reducedMotion = prefersReducedMotion();

    detectDevice();

    initLoader();
    initHeader();
    initMenu();
    initScrollProgress();
    initSectionIndex();
    initMobileSectionNavigation();
    initReveal();
    initDirectionInteractions();
    initMagneticElements();
    initCursor();
    initStandby();
    initPageTransitions();
    initInitialHash();
    initVisibilityHandling();
    initResizeHandling();

    updateSectionUI(1);

    document.documentElement.classList.add("experience-ready");
  }


  /* =========================================================
     DEVICE
     ========================================================= */

  function detectDevice() {
    state.touchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    state.cursorEnabled =
      !state.touchDevice &&
      window.matchMedia("(pointer: fine)").matches;
  }


  /* =========================================================
     LOADER
     ========================================================= */

  function initLoader() {
    const loader = $("#page-loader");

    if (!loader) return;

    const start = performance.now();
    let finished = false;

    const hideLoader = () => {
      if (finished) return;

      finished = true;

      const elapsed = performance.now() - start;
      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        loader.classList.add("is-hidden");

        window.setTimeout(() => {
          loader.setAttribute("aria-hidden", "true");
        }, 750);
      }, remaining);
    };

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        hideLoader,
        { once: true }
      );
    } else {
      hideLoader();
    }

    window.setTimeout(hideLoader, CONFIG.loaderMaxWait);
  }


  /* =========================================================
     HEADER
     ========================================================= */

  function initHeader() {
    const header = $(".site-header");

    if (!header) return;

    let previousY = window.scrollY;

    const updateHeader = () => {
      const currentY = window.scrollY;

      if (
        currentY > 40 &&
        currentY > previousY &&
        !state.menuOpen
      ) {
        header.classList.add("is-scrolled-down");
      } else {
        header.classList.remove("is-scrolled-down");
      }

      if (currentY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }

      previousY = currentY;
    };

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }


  /* =========================================================
     MENU
     ========================================================= */

  function initMenu() {
    const menu = $("#site-menu");
    const toggle = $(".menu-toggle");
    const backdrop = $(".site-menu-backdrop");
    const links = $$(".site-menu-link");
    const closeTargets = [
      backdrop,
      ...links
    ].filter(Boolean);

    if (!menu || !toggle) return;

    toggle.addEventListener("click", () => {
      state.menuOpen
        ? closeMenu()
        : openMenu();
    });

    closeTargets.forEach((element) => {
      element.addEventListener("click", (event) => {
        if (
          element.classList.contains("site-menu-link") &&
          element.getAttribute("href")
        ) {
          return;
        }

        if (element === backdrop) {
          closeMenu();
        }
      });
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href");

        if (!href) return;

        closeMenu();

        if (
          href.startsWith("#") &&
          href === window.location.hash
        ) {
          event.preventDefault();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.menuOpen) {
        closeMenu();
      }

      if (
        event.key === "Tab" &&
        state.menuOpen
      ) {
        trapMenuFocus(event);
      }
    });

    updateMenuActiveLink();
  }


  function openMenu() {
    const menu = $("#site-menu");
    const toggle = $(".menu-toggle");

    if (!menu || !toggle || state.menuOpen) return;

    state.menuLastFocused = document.activeElement;
    state.menuOpen = true;

    document.body.classList.add("menu-open");

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");

    toggle.setAttribute(
      "aria-expanded",
      "true"
    );

    const firstLink = $(".site-menu-link", menu);

    if (firstLink) {
      window.setTimeout(() => {
        firstLink.focus();
      }, 350);
    }
  }


  function closeMenu() {
    const menu = $("#site-menu");
    const toggle = $(".menu-toggle");

    if (!menu || !toggle || !state.menuOpen) return;

    state.menuOpen = false;

    document.body.classList.remove("menu-open");

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    if (
      state.menuLastFocused &&
      typeof state.menuLastFocused.focus === "function"
    ) {
      window.setTimeout(() => {
        state.menuLastFocused.focus();
      }, 50);
    }
  }


  function trapMenuFocus(event) {
    const menu = $("#site-menu");

    if (!menu) return;

    const focusable = $$(
      "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
      menu
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

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


  function updateMenuActiveLink() {
    const links = $$(".site-menu-link");

    if (!links.length) return;

    const currentPath =
      window.location.pathname.replace(/\/+$/, "") || "/";

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (!href) return;

      const normalized =
        href.replace(/\/+$/, "") || "/";

      link.classList.toggle(
        "is-active",
        normalized === currentPath
      );
    });
  }


  /* =========================================================
     SCROLL PROGRESS
     ========================================================= */

  function initScrollProgress() {
    const fill = $(".scroll-progress-fill");

    if (!fill) return;

    const update = () => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        max > 0
          ? clamp(window.scrollY / max, 0, 1)
          : 0;

      fill.style.height = `${progress * 100}%`;
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


  /* =========================================================
     SECTION INDEX
     ========================================================= */

  function initSectionIndex() {
    const items = $$(".section-index-item");

    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener("click", () => {
        const number =
          Number(item.dataset.sectionTarget);

        if (!Number.isFinite(number)) return;

        scrollToSection(number);
      });
    });

    const sections =
      $$(".home-section[data-section]");

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const number =
            Number(entry.target.dataset.section);

          if (!Number.isFinite(number)) return;

          updateSectionUI(number);
        });
      },
      {
        threshold: CONFIG.sectionThreshold
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }


  function scrollToSection(number) {
    const section =
      document.querySelector(
        `.home-section[data-section="${String(number).padStart(2, "0")}"]`
      );

    if (!section) return;

    const headerOffset = 12;

    const target =
      section.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: target,
      behavior: state.reducedMotion
        ? "auto"
        : "smooth"
    });
  }


  function updateSectionUI(number) {
    number = clamp(
      Number(number) || 1,
      1,
      10
    );

    state.previousSection =
      state.currentSection;

    state.currentSection = number;

    const padded =
      String(number).padStart(2, "0");

    const currentSection =
      $(".header-section-current");

    if (currentSection) {
      currentSection.textContent = padded;
    }

    const sectionItems =
      $$(".section-index-item");

    sectionItems.forEach((item) => {
      item.classList.toggle(
        "is-active",
        Number(item.dataset.sectionTarget) === number
      );
    });

    updateMobileSectionUI(number);

    updateSectionBodyState();
  }


  function updateSectionBodyState() {
    document.body.dataset.section =
      String(state.currentSection).padStart(2, "0");
  }


  /* =========================================================
     MOBILE SECTION NAVIGATION
     ========================================================= */

  function initMobileSectionNavigation() {
    const previous =
      $(".mobile-section-prev");

    const next =
      $(".mobile-section-next");

    if (previous) {
      previous.addEventListener("click", () => {
        scrollToSection(
          Math.max(1, state.currentSection - 1)
        );
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        scrollToSection(
          Math.min(10, state.currentSection + 1)
        );
      });
    }
  }


  function updateMobileSectionUI(number) {
    const currentNumber =
      $(".mobile-section-current-number");

    const currentLabel =
      $(".mobile-section-current-label");

    if (!currentNumber || !currentLabel) return;

    const section =
      document.querySelector(
        `.home-section[data-section="${String(number).padStart(2, "0")}"]`
      );

    if (!section) return;

    currentNumber.textContent =
      String(number).padStart(2, "0");

    currentLabel.textContent =
      section.dataset.sectionName || "";
  }


  /* =========================================================
     KEYBOARD SECTION NAVIGATION
     ========================================================= */

  function initKeyboardNavigation() {
    document.addEventListener("keydown", (event) => {
      if (state.menuOpen || state.standbyActive) return;

      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown"
      ) {
        event.preventDefault();

        scrollToSection(
          Math.min(10, state.currentSection + 1)
        );
      }

      if (
        event.key === "ArrowUp" ||
        event.key === "PageUp"
      ) {
        event.preventDefault();

        scrollToSection(
          Math.max(1, state.currentSection - 1)
        );
      }

      if (event.key === "Home") {
        event.preventDefault();
        scrollToSection(1);
      }

      if (event.key === "End") {
        event.preventDefault();
        scrollToSection(10);
      }
    });
  }


  /* =========================================================
     REVEAL
     ========================================================= */

  function initReveal() {
    const elements = $$(".reveal");

    if (!elements.length) return;

    if (state.reducedMotion) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.revealThreshold,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element, index) => {
      const delay =
        Number(element.dataset.revealDelay) ||
        (index % 4) * 45;

      element.style.transitionDelay =
        `${delay}ms`;

      observer.observe(element);
    });
  }


  /* =========================================================
     DIRECTIONS INTERACTION
     ========================================================= */

  function initDirectionInteractions() {
    const items =
      $$(".direction-item");

    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener(
        "mouseenter",
        () => {
          items.forEach((other) => {
            other.classList.toggle(
              "is-dimmed",
              other !== item
            );
          });

          item.classList.add("is-focused");
        }
      );

      item.addEventListener(
        "mouseleave",
        () => {
          items.forEach((other) => {
            other.classList.remove("is-dimmed");
            other.classList.remove("is-focused");
          });
        }
      );
    });
  }


  /* =========================================================
     MAGNETIC ELEMENTS
     ========================================================= */

  function initMagneticElements() {
    if (
      !state.cursorEnabled ||
      state.reducedMotion
    ) {
      return;
    }

    const elements = $$(
      ".menu-toggle, .contact-cta, .mobile-section-prev, .mobile-section-next"
    );

    elements.forEach((element) => {
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

          const strength =
            CONFIG.magneticStrength;

          element.style.transform =
            `translate(${x * strength}px, ${y * strength}px)`;
        }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          element.style.transform = "";
        }
      );
    });
  }


  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */

  function initCursor() {
    if (!state.cursorEnabled) return;

    const cursor =
      $(".cursor");

    const dot =
      $(".cursor-dot");

    const ring =
      $(".cursor-ring");

    if (!cursor || !dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let dotX = mouseX;
    let dotY = mouseY;

    let ringX = mouseX;
    let ringY = mouseY;

    document.addEventListener(
      "pointermove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
      },
      { passive: true }
    );

    const animate = () => {
      dotX +=
        (mouseX - dotX) * 0.35;

      dotY +=
        (mouseY - dotY) * 0.35;

      ringX +=
        (mouseX - ringX) *
        CONFIG.cursorLerp;

      ringY +=
        (mouseY - ringY) *
        CONFIG.cursorLerp;

      dot.style.transform =
        `translate(${dotX}px, ${dotY}px)`;

      ring.style.transform =
        `translate(${ringX}px, ${ringY}px)`;

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const interactive =
      $$(
        "a, button, .direction-item, .site-menu-link"
      );

    interactive.forEach((element) => {
      element.addEventListener(
        "mouseenter",
        () => {
          document.body.classList.add(
            "cursor-hover"
          );
        }
      );

      element.addEventListener(
        "mouseleave",
        () => {
          document.body.classList.remove(
            "cursor-hover"
          );
        }
      );
    });
  }


  /* =========================================================
     STANDBY
     ========================================================= */

  function initStandby() {
    const standby =
      $(".standby-screen");

    if (!standby) return;

    const wakeButton =
      $(".standby-wake");

    let activityEvents = [
      "pointermove",
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart"
    ];

    const activateStandby = () => {
      if (
        state.standbyActive ||
        state.menuOpen
      ) {
        return;
      }

      state.standbyActive = true;

      standby.classList.add("is-active");
      standby.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "standby-active"
      );
    };

    const deactivateStandby = () => {
      if (!state.standbyActive) return;

      state.standbyActive = false;

      standby.classList.remove("is-active");
      standby.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "standby-active"
      );

      restartStandbyTimer();
    };

    const restartStandbyTimer = () => {
      if (state.standbyTimer) {
        window.clearTimeout(
          state.standbyTimer
        );
      }

      if (
        document.hidden ||
        state.reducedMotion
      ) {
        return;
      }

      state.standbyTimer =
        window.setTimeout(
          activateStandby,
          CONFIG.standbyDelay
        );
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        () => {
          if (!state.standbyActive) {
            restartStandbyTimer();
          }
        },
        {
          passive: true
        }
      );
    });

    if (wakeButton) {
      wakeButton.addEventListener(
        "click",
        deactivateStandby
      );
    }

    standby.addEventListener(
      "click",
      (event) => {
        if (
          event.target === standby
        ) {
          deactivateStandby();
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          state.standbyActive &&
          event.key === "Escape"
        ) {
          deactivateStandby();
        }
      }
    );

    restartStandbyTimer();
  }


  /* =========================================================
     PAGE TRANSITIONS
     ========================================================= */

  function initPageTransitions() {
    const transition =
      $(".page-transition");

    if (!transition) return;

    const internalLinks =
      $$("a[href]");

    internalLinks.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const href =
            link.getAttribute("href");

          if (!href) return;

          if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
          ) {
            return;
          }

          if (
            link.target === "_blank" ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          let destination;

          try {
            destination =
              new URL(
                href,
                window.location.href
              );
          } catch {
            return;
          }

          if (
            destination.origin !==
            window.location.origin
          ) {
            return;
          }

          if (
            destination.pathname ===
            window.location.pathname &&
            destination.search ===
            window.location.search
          ) {
            return;
          }

          event.preventDefault();

          closeMenu();

          if (state.reducedMotion) {
            window.location.href =
              destination.href;

            return;
          }

          transition.classList.add(
            "is-active"
          );

          window.setTimeout(() => {
            window.location.href =
              destination.href;
          }, 500);
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


  /* =========================================================
     INITIAL HASH
     ========================================================= */

  function initInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) return;

    const target =
      document.querySelector(hash);

    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: state.reducedMotion
          ? "auto"
          : "smooth",
        block: "start"
      });
    }, 700);
  }


  /* =========================================================
     VISIBILITY
     ========================================================= */

  function initVisibilityHandling() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          if (state.standbyTimer) {
            window.clearTimeout(
              state.standbyTimer
            );
          }
        } else {
          restartStandbyAfterVisibility();
        }
      }
    );
  }


  function restartStandbyAfterVisibility() {
    if (state.standbyActive) return;

    const standby =
      $(".standby-screen");

    if (!standby) return;

    if (state.standbyTimer) {
      window.clearTimeout(
        state.standbyTimer
      );
    }

    if (state.reducedMotion) return;

    state.standbyTimer =
      window.setTimeout(
        () => {
          if (!state.menuOpen) {
            state.standbyActive = true;

            standby.classList.add(
              "is-active"
            );

            standby.setAttribute(
              "aria-hidden",
              "false"
            );

            document.body.classList.add(
              "standby-active"
            );
          }
        },
        CONFIG.standbyDelay
      );
  }


  /* =========================================================
     RESIZE
     ========================================================= */

  function initResizeHandling() {
    let resizeTimer = null;

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(resizeTimer);

        resizeTimer =
          window.setTimeout(() => {
            detectDevice();

            if (
              state.menuOpen &&
              window.innerWidth > 760
            ) {
              // Keep menu state coherent.
              document.body.classList.add(
                "menu-open"
              );
            }
          }, 180);
      }
    );
  }


  /* =========================================================
     TOUCH / POINTER POLISH
     ========================================================= */

  function initPointerPolish() {
    if (!state.cursorEnabled) return;

    document.addEventListener(
      "pointerdown",
      () => {
        document.body.classList.add(
          "is-interacting"
        );
      }
    );

    document.addEventListener(
      "pointerup",
      () => {
        document.body.classList.remove(
          "is-interacting"
        );
      }
    );
  }


  /* =========================================================
     PUBLIC DEBUG API
     ========================================================= */

  function exposeDebugAPI() {
    window.CP = {
      state,

      openMenu,
      closeMenu,

      activateStandby: () => {
        const standby =
          $(".standby-screen");

        if (!standby) return;

        state.standbyActive = true;

        standby.classList.add(
          "is-active"
        );

        standby.setAttribute(
          "aria-hidden",
          "false"
        );

        document.body.classList.add(
          "standby-active"
        );
      },

      deactivateStandby: () => {
        const standby =
          $(".standby-screen");

        if (!standby) return;

        state.standbyActive = false;

        standby.classList.remove(
          "is-active"
        );

        standby.setAttribute(
          "aria-hidden",
          "true"
        );

        document.body.classList.remove(
          "standby-active"
        );
      },

      goToSection: scrollToSection
    };
  }


  /* =========================================================
     START
     ========================================================= */

  initKeyboardNavigation();
  initPointerPolish();
  exposeDebugAPI();

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
