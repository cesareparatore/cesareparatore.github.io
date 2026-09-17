/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER JS
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIG
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

    resizeDebounce: 180,
    scrollThrottle: 16
  };


  /* =======================================================
     DOM
  ======================================================= */

  const DOM = {
    body: document.body,
    html: document.documentElement,

    loader: document.querySelector("#page-loader"),
    transition: document.querySelector(".page-transition"),

    header: document.querySelector(".site-header"),
    headerCounter: document.querySelector(".site-header-section-counter"),

    menu: document.querySelector("#site-menu"),
    menuPanel: document.querySelector(".site-menu-panel"),
    menuBackdrop: document.querySelector(".site-menu-backdrop"),
    menuTrigger: document.querySelector(".menu-trigger"),
    menuClose: document.querySelector(".site-menu-close"),
    menuLinks: [...document.querySelectorAll(".site-menu-link")],

    progressBar: document.querySelector(".scroll-progress-bar"),

    sections: [...document.querySelectorAll(".home-section")],

    sectionNav: document.querySelector(".home-section-nav"),
    sectionNavTrack: document.querySelector(".home-section-nav-track"),
    sectionNavItems: [
      ...document.querySelectorAll(".home-section-nav-item")
    ],

    reveals: [...document.querySelectorAll(".reveal")],

    magnetic: [...document.querySelectorAll("[data-magnetic]")],

    cursorDot: document.querySelector(".cursor-dot"),
    cursorRing: document.querySelector(".cursor-ring"),

    standby: document.querySelector(".standby-screen"),
    standbyWake: document.querySelector(".standby-wake"),

    footer: document.querySelector(".site-footer")
  };


  /* =======================================================
     STATE
  ======================================================= */

  const state = {
    initialized: false,

    menuOpen: false,

    standbyActive: false,
    standbyWaking: false,

    currentSection: "01",
    currentSectionId: "inizio",

    previousSection: null,

    scrollTicking: false,
    resizeTimer: null,

    standbyTimer: null,

    lastActivity: Date.now(),

    menuLastFocused: null,

    reducedMotion:
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,

    touchDevice:
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0,

    cursorEnabled:
      window.matchMedia &&
      window.matchMedia("(pointer: fine)").matches,

    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,

    cursorTargetX: window.innerWidth / 2,
    cursorTargetY: window.innerHeight / 2,

    standbyMouseX: null,
    standbyMouseY: null,

    lastScrollY: window.scrollY,

    sectionObserver: null,
    revealObserver: null,

    footerVisible: false
  };


  /* =======================================================
     UTILS
  ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const prefersReducedMotion = () =>
    state.reducedMotion;


  const isEditableTarget = (element) => {
    if (!element) return false;

    const tag = element.tagName?.toLowerCase();

    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      element.isContentEditable
    );
  };


  const raf = (callback) => {
    window.requestAnimationFrame(callback);
  };


  /* =======================================================
     ACTIVITY / STANDBY
     ======================================================= */

  function registerActivity() {
    state.lastActivity = Date.now();

    if (!state.standbyActive) {
      resetStandbyTimer();
    }
  }


  function resetStandbyTimer() {
    clearTimeout(state.standbyTimer);

    if (
      state.standbyActive ||
      state.menuOpen ||
      document.hidden
    ) {
      return;
    }

    state.standbyTimer = setTimeout(() => {
      activateStandby();
    }, CONFIG.standbyDelay);
  }


  function activateStandby() {
    if (
      state.standbyActive ||
      state.menuOpen ||
      document.hidden
    ) {
      return;
    }

    state.standbyActive = true;
    state.standbyWaking = false;

    clearTimeout(state.standbyTimer);

    DOM.body.classList.add("is-standby");

    DOM.standby?.classList.add("is-active");
    DOM.standby?.setAttribute("aria-hidden", "false");

    state.standbyMouseX = null;
    state.standbyMouseY = null;
  }


  function wakeStandby() {
    if (
      !state.standbyActive ||
      state.standbyWaking
    ) {
      return;
    }

    state.standbyWaking = true;

    DOM.standby?.classList.add("is-waking");

    window.setTimeout(() => {
      state.standbyActive = false;
      state.standbyWaking = false;

      DOM.body.classList.remove("is-standby");

      DOM.standby?.classList.remove(
        "is-active",
        "is-waking"
      );

      DOM.standby?.setAttribute("aria-hidden", "true");

      registerActivity();
    }, 360);
  }


  function initStandby() {
    if (!DOM.standby) return;

    /*
     * Il movimento del mouse è il vero risveglio.
     * Non dipendiamo dal touch.
     */

    window.addEventListener(
      "pointermove",
      (event) => {
        registerActivity();

        if (!state.standbyActive) return;

        if (
          state.standbyMouseX === null ||
          state.standbyMouseY === null
        ) {
          state.standbyMouseX = event.clientX;
          state.standbyMouseY = event.clientY;
          return;
        }

        const dx =
          event.clientX - state.standbyMouseX;

        const dy =
          event.clientY - state.standbyMouseY;

        const distance = Math.hypot(dx, dy);

        if (distance >= CONFIG.standbyWakeDistance) {
          wakeStandby();
        }

        state.standbyMouseX = event.clientX;
        state.standbyMouseY = event.clientY;
      },
      { passive: true }
    );


    /*
     * Fallback naturale:
     * movimento touch, rotella, tastiera.
     */

    window.addEventListener(
      "touchmove",
      () => {
        registerActivity();

        if (state.standbyActive) {
          wakeStandby();
        }
      },
      { passive: true }
    );


    window.addEventListener(
      "wheel",
      () => {
        registerActivity();

        if (state.standbyActive) {
          wakeStandby();
        }
      },
      { passive: true }
    );


    window.addEventListener(
      "keydown",
      (event) => {
        if (isEditableTarget(event.target)) return;

        registerActivity();

        if (state.standbyActive) {
          wakeStandby();
        }
      }
    );


    window.addEventListener(
      "pointerdown",
      () => {
        registerActivity();

        if (state.standbyActive) {
          wakeStandby();
        }
      },
      { passive: true }
    );


    DOM.standbyWake?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        wakeStandby();
      }
    );


    resetStandbyTimer();
  }


  /* =======================================================
     LOADER
     ======================================================= */

  function initLoader() {
    if (!DOM.loader) return;

    const startedAt = performance.now();

    const hideLoader = () => {
      const elapsed = performance.now() - startedAt;

      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        DOM.loader.classList.add("is-hidden");
      }, remaining);
    };


    if (document.readyState === "complete") {
      hideLoader();
      return;
    }


    window.addEventListener(
      "load",
      hideLoader,
      { once: true }
    );


    window.setTimeout(() => {
      DOM.loader.classList.add("is-hidden");
    }, CONFIG.loaderMaximumWait);
  }


  /* =======================================================
     HEADER
     ======================================================= */

  function initHeader() {
    if (!DOM.header) return;

    updateHeaderCounter();
  }


  function updateHeaderCounter() {
    if (!DOM.headerCounter) return;

    DOM.headerCounter.textContent =
      `${state.currentSection} / 10`;
  }


  /* =======================================================
     MENU
     ======================================================= */

  function openMenu() {
    if (!DOM.menu || state.menuOpen) return;

    state.menuLastFocused =
      document.activeElement;

    state.menuOpen = true;

    DOM.body.classList.add("menu-is-open");

    DOM.menu.classList.add("is-open");
    DOM.menu.setAttribute("aria-hidden", "false");

    DOM.menuTrigger?.setAttribute(
      "aria-expanded",
      "true"
    );

    clearTimeout(state.standbyTimer);

    /*
     * Piccolo ingresso progressivo delle tracce.
     * Nessuna freccia: la linea e il punto sono
     * l'unico linguaggio interattivo.
     */

    DOM.menuLinks.forEach((link, index) => {
      link.style.setProperty(
        "--menu-index",
        index
      );

      link.animate(
        [
          {
            opacity: 0,
            transform: "translateX(30px)"
          },
          {
            opacity: 1,
            transform: "translateX(0)"
          }
        ],
        {
          duration: prefersReducedMotion()
            ? 0
            : 520,
          delay: prefersReducedMotion()
            ? 0
            : index * 35,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "both"
        }
      );
    });


    window.setTimeout(() => {
      DOM.menuClose?.focus();
    }, prefersReducedMotion() ? 0 : 220);
  }


  function closeMenu() {
    if (!DOM.menu || !state.menuOpen) return;

    state.menuOpen = false;

    DOM.body.classList.remove("menu-is-open");

    DOM.menu.classList.remove("is-open");
    DOM.menu.setAttribute("aria-hidden", "true");

    DOM.menuTrigger?.setAttribute(
      "aria-expanded",
      "false"
    );

    if (
      state.menuLastFocused &&
      typeof state.menuLastFocused.focus === "function"
    ) {
      state.menuLastFocused.focus();
    }

    registerActivity();
  }


  function initMenu() {
    if (!DOM.menu) return;

    DOM.menuTrigger?.addEventListener(
      "click",
      () => {
        state.menuOpen
          ? closeMenu()
          : openMenu();
      }
    );


    DOM.menuClose?.addEventListener(
      "click",
      closeMenu
    );


    DOM.menuBackdrop?.addEventListener(
      "click",
      closeMenu
    );


    DOM.menuLinks.forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );
    });


    /*
     * Hover progress delle tracce.
     * Il punto viene gestito dal CSS;
     * qui sincronizziamo il feedback su touch/focus.
     */

    DOM.menuLinks.forEach((link) => {
      link.addEventListener(
        "pointerenter",
        () => {
          link.classList.add("is-tracing");
        }
      );

      link.addEventListener(
        "pointerleave",
        () => {
          link.classList.remove("is-tracing");
        }
      );

      link.addEventListener(
        "focus",
        () => {
          link.classList.add("is-tracing");
        }
      );

      link.addEventListener(
        "blur",
        () => {
          link.classList.remove("is-tracing");
        }
      );
    });
  }


  /* =======================================================
     SCROLL PROGRESS
     ======================================================= */

  function updateScrollProgress() {
    if (!DOM.progressBar) return;

    const scrollTop =
      window.scrollY || window.pageYOffset;

    const maxScroll =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      maxScroll > 0
        ? clamp(scrollTop / maxScroll, 0, 1)
        : 0;

    DOM.progressBar.style.transform =
      `scaleX(${progress})`;
  }


  function initScrollProgress() {
    updateScrollProgress();
  }


  /* =======================================================
     SECTION DETECTION
     ======================================================= */

  function detectCurrentSection() {
    if (!DOM.sections.length) return;

    const viewportPoint =
      window.innerHeight * CONFIG.sectionThreshold;

    let candidate = DOM.sections[0];

    for (const section of DOM.sections) {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= viewportPoint &&
        rect.bottom >= viewportPoint
      ) {
        candidate = section;
        break;
      }

      if (
        Math.abs(rect.top - viewportPoint) <
        Math.abs(
          candidate.getBoundingClientRect().top -
          viewportPoint
        )
      ) {
        candidate = section;
      }
    }


    if (!candidate) return;

    const nextId = candidate.id;
    const nextNumber =
      candidate.dataset.section || "01";

    if (
      nextId !== state.currentSectionId
    ) {
      state.previousSection =
        state.currentSectionId;

      state.currentSectionId = nextId;
      state.currentSection = nextNumber;

      updateHeaderCounter();
      updateSectionNavigation();
      updateSectionNavigationTheme();
    }
  }


  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  function updateSectionNavigation() {
    if (!DOM.sectionNavItems.length) return;

    DOM.sectionNavItems.forEach((item) => {
      const target =
        item.dataset.sectionTarget;

      const active =
        target === state.currentSectionId;

      item.classList.toggle(
        "is-active",
        active
      );

      if (active) {
        /*
         * Mobile:
         * la sezione corrente viene portata
         * delicatamente al centro del tracciato.
         *
         * Non è fixed.
         */

        if (
          window.innerWidth <= 800 &&
          DOM.sectionNavTrack
        ) {
          centerSectionNavItem(item);
        }
      }
    });
  }


  function centerSectionNavItem(item) {
    if (!DOM.sectionNavTrack || !item) return;

    const trackRect =
      DOM.sectionNavTrack.getBoundingClientRect();

    const itemRect =
      item.getBoundingClientRect();

    const offset =
      itemRect.left -
      trackRect.left -
      (trackRect.width / 2) +
      (itemRect.width / 2);

    DOM.sectionNavTrack.scrollBy({
      left: offset,
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth"
    });
  }


  function updateSectionNavigationTheme() {
    if (!DOM.sectionNav) return;

    const section =
      document.getElementById(
        state.currentSectionId
      );

    if (!section) return;

    const dark =
      section.classList.contains(
        "home-section-dark"
      );

    DOM.sectionNav.classList.toggle(
      "is-dark",
      dark
    );
  }


  function initSectionNavigation() {
    if (!DOM.sectionNavItems.length) return;

    DOM.sectionNavItems.forEach((item) => {
      item.addEventListener(
        "click",
        (event) => {
          const targetId =
            item.dataset.sectionTarget;

          const target =
            document.getElementById(targetId);

          if (!target) return;

          event.preventDefault();

          closeMenu();

          target.scrollIntoView({
            behavior: prefersReducedMotion()
              ? "auto"
              : "smooth",
            block: "start"
          });

          registerActivity();
        }
      );
    });


    updateSectionNavigation();
    updateSectionNavigationTheme();

    /*
     * IMPORTANT:
     * la Section Navigation non deve restare
     * visivamente attiva sopra il footer.
     */

    if (DOM.footer && DOM.sectionNav) {
      const footerObserver =
        new IntersectionObserver(
          (entries) => {
            const entry = entries[0];

            state.footerVisible =
              entry.isIntersecting;

            DOM.sectionNav.classList.toggle(
              "is-footer-near",
              entry.isIntersecting
            );

            if (entry.isIntersecting) {
              DOM.sectionNav.setAttribute(
                "aria-hidden",
                "true"
              );

              DOM.sectionNavItems.forEach(
                (item) => {
                  item.setAttribute(
                    "tabindex",
                    "-1"
                  );
                }
              );
            } else {
              DOM.sectionNav.removeAttribute(
                "aria-hidden"
              );

              DOM.sectionNavItems.forEach(
                (item) => {
                  item.removeAttribute(
                    "tabindex"
                  );
                }
              );
            }
          },
          {
            root: null,
            threshold: 0.02
          }
        );

      footerObserver.observe(DOM.footer);
    }
  }


  /* =======================================================
     REVEAL SYSTEM
     ======================================================= */

  function initReveal() {
    if (!DOM.reveals.length) return;

    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      DOM.reveals.forEach((element) => {
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

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: CONFIG.revealThreshold,
          rootMargin: "0px 0px -8% 0px"
        }
      );


    DOM.reveals.forEach((element) => {
      state.revealObserver.observe(
        element
      );
    });
  }


  /* =======================================================
     MAGNETIC ELEMENTS
     ======================================================= */

  function initMagneticElements() {
    if (
      !DOM.magnetic.length ||
      !state.cursorEnabled ||
      state.touchDevice
    ) {
      return;
    }


    DOM.magnetic.forEach((element) => {
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

          const moveX =
            x * CONFIG.magneticStrength;

          const moveY =
            y * CONFIG.magneticStrength;

          element.style.transform =
            `translate3d(${moveX}px, ${moveY}px, 0)`;
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


  /* =======================================================
     CURSOR
     ======================================================= */

  function initCursor() {
    if (
      !state.cursorEnabled ||
      state.touchDevice ||
      !DOM.cursorDot ||
      !DOM.cursorRing
    ) {
      return;
    }


    DOM.body.classList.add(
      "cursor-ready"
    );


    window.addEventListener(
      "pointermove",
      (event) => {
        state.cursorTargetX =
          event.clientX;

        state.cursorTargetY =
          event.clientY;

        registerActivity();
      },
      { passive: true }
    );


    const interactiveElements =
      document.querySelectorAll(
        "a, button, .direction-card, .site-menu-link"
      );


    interactiveElements.forEach(
      (element) => {
        element.addEventListener(
          "pointerenter",
          () => {
            DOM.body.classList.add(
              "cursor-hover"
            );
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            DOM.body.classList.remove(
              "cursor-hover"
            );
          }
        );
      }
    );


    const renderCursor = () => {
      state.cursorX +=
        (state.cursorTargetX -
          state.cursorX) *
        CONFIG.cursorLerp;

      state.cursorY +=
        (state.cursorTargetY -
          state.cursorY) *
        CONFIG.cursorLerp;


      DOM.cursorDot.style.transform =
        `translate3d(
          ${state.cursorX}px,
          ${state.cursorY}px,
          0
        ) translate(-50%, -50%)`;


      DOM.cursorRing.style.transform =
        `translate3d(
          ${state.cursorX}px,
          ${state.cursorY}px,
          0
        ) translate(-50%, -50%)`;


      window.requestAnimationFrame(
        renderCursor
      );
    };


    renderCursor();
  }


  /* =======================================================
     SCROLL ENGINE
     ======================================================= */

  function handleScroll() {
    if (state.scrollTicking) return;

    state.scrollTicking = true;

    window.requestAnimationFrame(() => {
      updateScrollProgress();
      detectCurrentSection();

      state.lastScrollY =
        window.scrollY;

      state.scrollTicking = false;
    });
  }


  function initScrollState() {
    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    updateScrollProgress();
    detectCurrentSection();
  }


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  function initPageTransitions() {
    if (!DOM.transition) return;

    const links =
      document.querySelectorAll(
        "a[href]"
      );


    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const href =
            link.getAttribute("href");

          if (!href) return;

          if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
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


          event.preventDefault();

          closeMenu();

          if (prefersReducedMotion()) {
            window.location.href =
              destination.href;
            return;
          }


          DOM.transition.classList.add(
            "is-active"
          );


          window.setTimeout(() => {
            window.location.href =
              destination.href;
          }, 520);
        }
      );
    });
  }


  /* =======================================================
     HASH NAVIGATION
     ======================================================= */

  function initInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) return;

    const target =
      document.querySelector(hash);

    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      detectCurrentSection();
    }, 80);
  }


  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  function initKeyboardNavigation() {
    window.addEventListener(
      "keydown",
      (event) => {
        if (isEditableTarget(event.target)) {
          return;
        }


        if (event.key === "Escape") {
          if (state.menuOpen) {
            closeMenu();
            return;
          }

          if (state.standbyActive) {
            wakeStandby();
          }

          return;
        }


        if (
          state.menuOpen ||
          state.standbyActive
        ) {
          return;
        }


        if (
          event.key !== "ArrowDown" &&
          event.key !== "ArrowUp"
        ) {
          return;
        }


        const currentIndex =
          DOM.sections.findIndex(
            (section) =>
              section.id ===
              state.currentSectionId
          );


        if (currentIndex < 0) return;

        const direction =
          event.key === "ArrowDown"
            ? 1
            : -1;

        const nextIndex =
          clamp(
            currentIndex + direction,
            0,
            DOM.sections.length - 1
          );

        const target =
          DOM.sections[nextIndex];

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion()
            ? "auto"
            : "smooth",
          block: "start"
        });
      }
    );
  }


  /* =======================================================
     VISIBILITY
     ======================================================= */

  function initVisibilityHandling() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          clearTimeout(
            state.standbyTimer
          );
          return;
        }

        registerActivity();
      }
    );
  }


  /* =======================================================
     RESIZE
     ======================================================= */

  function initResizeHandling() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          state.resizeTimer
        );

        state.resizeTimer =
          setTimeout(() => {
            updateScrollProgress();
            detectCurrentSection();
            updateSectionNavigationTheme();
          }, CONFIG.resizeDebounce);
      },
      { passive: true }
    );
  }


  /* =======================================================
     DIRECTION INTERACTIONS
     ======================================================= */

  function initDirectionInteractions() {
    const cards =
      document.querySelectorAll(
        ".direction-card"
      );

    cards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          if (
            state.touchDevice ||
            prefersReducedMotion()
          ) {
            return;
          }

          const rect =
            card.getBoundingClientRect();

          const x =
            (event.clientX - rect.left) /
            rect.width;

          const y =
            (event.clientY - rect.top) /
            rect.height;

          const rotateY =
            (x - .5) * 3;

          const rotateX =
            (.5 - y) * 3;

          card.style.transform =
            `translateY(-8px)
             perspective(700px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)`;
        }
      );


      card.addEventListener(
        "pointerleave",
        () => {
          card.style.transform = "";
        }
      );
    });
  }


  /* =======================================================
     FOOTER SAFETY
     ======================================================= */

  function initFooterSafety() {
    if (!DOM.footer || !DOM.sectionNav) {
      return;
    }

    /*
     * Non spostiamo il footer.
     * Non lo copriamo.
     *
     * La Section Navigation rimane parte del flusso
     * e, quando il footer arriva in viewport,
     * perde interazione.
     */

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          state.footerVisible =
            entry.isIntersecting;

          DOM.sectionNav.classList.toggle(
            "is-footer-near",
            entry.isIntersecting
          );
        },
        {
          threshold: 0,
          rootMargin: "0px 0px -15% 0px"
        }
      );

    observer.observe(DOM.footer);
  }


  /* =======================================================
     ACTIVE SECTION INIT
     ======================================================= */

  function initSectionObserver() {
    if (
      !DOM.sections.length ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }


    state.sectionObserver =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );


          if (!visible.length) return;

          const section =
            visible[0].target;

          const id = section.id;
          const number =
            section.dataset.section ||
            "01";


          if (
            id === state.currentSectionId
          ) {
            return;
          }


          state.previousSection =
            state.currentSectionId;

          state.currentSectionId = id;
          state.currentSection = number;

          updateHeaderCounter();
          updateSectionNavigation();
          updateSectionNavigationTheme();
        },
        {
          threshold: [
            0.2,
            0.35,
            0.5,
            0.65
          ]
        }
      );


    DOM.sections.forEach(
      (section) => {
        state.sectionObserver.observe(
          section
        );
      }
    );
  }


  /* =======================================================
     INITIAL HASH + DIRECT SECTION
     ======================================================= */

  function goToSection(id) {
    const section =
      document.getElementById(id);

    if (!section) return false;

    closeMenu();

    section.scrollIntoView({
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth",
      block: "start"
    });

    registerActivity();

    return true;
  }


  /* =======================================================
     DEBUG / PUBLIC API
     ======================================================= */

  function exposeAPI() {
    window.CP = {
      version: "2026.09",

      get state() {
        return {
          ...state,
          sections:
            DOM.sections.map(
              (section) => ({
                id: section.id,
                number:
                  section.dataset.section,
                label:
                  section.dataset.sectionLabel
              })
            )
        };
      },

      goToSection,

      openMenu,
      closeMenu,

      activateStandby,
      wakeStandby,

      resetStandbyTimer
    };


    window.CPStandby = {
      activate: activateStandby,
      wake: wakeStandby
    };
  }


  /* =======================================================
     INIT
     ======================================================= */

  function init() {
    if (state.initialized) return;

    state.initialized = true;

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
    updateSectionNavigationTheme();

    registerActivity();
  }


  /* =======================================================
     START
     ======================================================= */

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
