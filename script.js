/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER JAVASCRIPT
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

    resizeDebounce: 180,

    scrollNavigationOffset: 18,

    transitionDuration: 700
  };


  /* =======================================================
     STATE
     ======================================================= */

  const state = {
    isLoaded: false,
    isMenuOpen: false,
    isStandby: false,

    activeSection: null,

    lastActivity: Date.now(),

    pointerX: 0,
    pointerY: 0,

    cursorX: 0,
    cursorY: 0,

    pointerMoving: false,

    resizeTimer: null,
    standbyTimer: null,

    rafId: null
  };


  /* =======================================================
     DOM
     ======================================================= */

  const dom = {
    body: document.body,

    loader: document.querySelector("#page-loader"),

    pageTransition:
      document.querySelector(".page-transition"),

    standby:
      document.querySelector(".standby-screen"),

    standbyWake:
      document.querySelector(".standby-wake"),

    header:
      document.querySelector(".site-header"),

    sectionCounter:
      document.querySelector(".site-header-section-counter"),

    menu:
      document.querySelector(".site-menu"),

    menuPanel:
      document.querySelector(".site-menu-panel"),

    menuTrigger:
      document.querySelector(".menu-trigger"),

    menuClose:
      document.querySelector(".site-menu-close"),

    menuBackdrop:
      document.querySelector(".site-menu-backdrop"),

    scrollProgress:
      document.querySelector(".scroll-progress-bar"),

    sectionNav:
      document.querySelector(".home-section-nav"),

    sectionNavCurrentNumber:
      document.querySelector(
        ".home-section-nav-current-number"
      ),

    sectionNavCurrentLabel:
      document.querySelector(
        ".home-section-nav-current-label"
      ),

    sectionNavRoute:
      document.querySelector(
        ".home-section-nav-route"
      ),

    sectionNavRouteProgress:
      document.querySelector(
        ".home-section-nav-route-progress"
      ),

    sectionNavRoutePoint:
      document.querySelector(
        ".home-section-nav-route-point"
      ),

    sectionNavItems:
      Array.from(
        document.querySelectorAll(
          ".home-section-nav-item"
        )
      ),

    sections:
      Array.from(
        document.querySelectorAll(
          ".home-section[data-section]"
        )
      ),

    reveals:
      Array.from(
        document.querySelectorAll(".reveal")
      ),

    magnetic:
      Array.from(
        document.querySelectorAll("[data-magnetic]")
      ),

    cursor:
      document.querySelector(".cursor"),

    cursorDot:
      document.querySelector(".cursor-dot"),

    cursorRing:
      document.querySelector(".cursor-ring")
  };


  /* =======================================================
     UTILITIES
     ======================================================= */

  const prefersReducedMotion = () =>
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const lerp = (start, end, amount) =>
    start + (end - start) * amount;


  const getSectionById = (id) =>
    dom.sections.find(
      (section) =>
        section.dataset.section === id
    );


  const getSectionIndex = (section) => {
    if (!section) return -1;

    return dom.sections.indexOf(section);
  };


  const getSectionLabel = (section) => {
    if (!section) return "";

    const item =
      dom.sectionNavItems.find(
        (navItem) =>
          navItem.dataset.sectionTarget ===
          section.id
      );

    if (!item) return "";

    const label =
      item.querySelector(
        ".home-section-nav-label"
      );

    return label
      ? label.textContent.trim()
      : "";
  };


  /* =======================================================
     ACTIVITY
     ======================================================= */

  function registerActivity() {
    state.lastActivity = Date.now();

    if (state.isStandby) {
      wakeFromStandby();
    }

    scheduleStandby();
  }


  /* =======================================================
     LOADER
     ======================================================= */

  function initLoader() {
    if (!dom.loader) {
      state.isLoaded = true;
      return;
    }

    const startTime = performance.now();

    const finish = () => {
      if (state.isLoaded) return;

      state.isLoaded = true;

      const elapsed =
        performance.now() - startTime;

      const remaining =
        Math.max(
          0,
          CONFIG.loaderMinimumTime - elapsed
        );

      window.setTimeout(() => {
        dom.loader.classList.add("is-hidden");

        window.setTimeout(() => {
          dom.loader.remove();
        }, 800);

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
     MENU
     ======================================================= */

  function openMenu() {
    if (!dom.menu || state.isMenuOpen) return;

    state.isMenuOpen = true;

    dom.menu.classList.add("is-open");

    if (dom.menuTrigger) {
      dom.menuTrigger.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    dom.body.classList.add(
      "is-menu-open"
    );

    const firstLink =
      dom.menu.querySelector(
        ".site-menu-link"
      );

    if (firstLink) {
      window.setTimeout(() => {
        firstLink.focus();
      }, 350);
    }
  }


  function closeMenu() {
    if (!dom.menu || !state.isMenuOpen) return;

    state.isMenuOpen = false;

    dom.menu.classList.remove("is-open");

    if (dom.menuTrigger) {
      dom.menuTrigger.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    dom.body.classList.remove(
      "is-menu-open"
    );

    if (dom.menuTrigger) {
      dom.menuTrigger.focus();
    }
  }


  function initMenu() {
    if (dom.menuTrigger) {
      dom.menuTrigger.addEventListener(
        "click",
        () => {
          state.isMenuOpen
            ? closeMenu()
            : openMenu();
        }
      );
    }

    if (dom.menuClose) {
      dom.menuClose.addEventListener(
        "click",
        closeMenu
      );
    }

    if (dom.menuBackdrop) {
      dom.menuBackdrop.addEventListener(
        "click",
        closeMenu
      );
    }

    if (dom.menu) {
      dom.menu
        .querySelectorAll(".site-menu-link")
        .forEach((link) => {
          link.addEventListener(
            "click",
            () => {
              closeMenu();
            }
          );
        });
    }

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          if (state.isMenuOpen) {
            closeMenu();
          }

          if (state.isStandby) {
            wakeFromStandby();
          }
        }
      }
    );
  }


  /* =======================================================
     SCROLL PROGRESS
     ======================================================= */

  function updateScrollProgress() {
    if (!dom.scrollProgress) return;

    const documentHeight =
      document.documentElement.scrollHeight;

    const viewportHeight =
      window.innerHeight;

    const scrollable =
      documentHeight - viewportHeight;

    const progress =
      scrollable > 0
        ? window.scrollY / scrollable
        : 0;

    dom.scrollProgress.style.width =
      `${clamp(progress, 0, 1) * 100}%`;
  }


  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  function getSectionNavigationProgress() {
    if (!dom.sections.length) {
      return 0;
    }

    const viewportCenter =
      window.scrollY +
      window.innerHeight *
      CONFIG.sectionThreshold;

    let activeIndex = 0;

    dom.sections.forEach(
      (section, index) => {
        const top =
          section.offsetTop;

        if (viewportCenter >= top) {
          activeIndex = index;
        }
      }
    );

    if (dom.sections.length <= 1) {
      return 0;
    }

    return activeIndex /
      (dom.sections.length - 1);
  }


  function updateSectionNavigation(
    force = false
  ) {
    if (!dom.sections.length) return;

    const viewportCenter =
      window.scrollY +
      window.innerHeight *
      CONFIG.sectionThreshold;

    let activeSection =
      dom.sections[0];

    let activeIndex = 0;

    dom.sections.forEach(
      (section, index) => {
        const top =
          section.offsetTop;

        if (viewportCenter >= top) {
          activeSection = section;
          activeIndex = index;
        }
      }
    );

    if (
      !force &&
      state.activeSection ===
        activeSection
    ) {
      updateSectionTrajectory(
        activeIndex
      );

      return;
    }

    state.activeSection =
      activeSection;

    updateSectionNavigationUI(
      activeSection,
      activeIndex
    );
  }


  function updateSectionNavigationUI(
    section,
    index
  ) {
    if (!section) return;

    const sectionNumber =
      String(index + 1).padStart(
        2,
        "0"
      );

    const label =
      getSectionLabel(section);

    if (dom.sectionNavCurrentNumber) {
      dom.sectionNavCurrentNumber.textContent =
        sectionNumber;
    }

    if (dom.sectionNavCurrentLabel) {
      dom.sectionNavCurrentLabel.textContent =
        label;
    }

    if (dom.sectionCounter) {
      dom.sectionCounter.textContent =
        `${sectionNumber} / ${String(
          dom.sections.length
        ).padStart(2, "0")}`;
    }

    dom.sectionNavItems.forEach(
      (item, itemIndex) => {
        const isActive =
          itemIndex === index;

        item.classList.toggle(
          "is-active",
          isActive
        );

        if (isActive) {
          item.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          item.removeAttribute(
            "aria-current"
          );
        }
      }
    );

    updateSectionTrajectory(index);
  }


  function updateSectionTrajectory(
    activeIndex
  ) {
    if (
      !dom.sectionNavRoute ||
      !dom.sectionNavItems.length
    ) {
      return;
    }

    const total =
      dom.sectionNavItems.length;

    if (total <= 1) return;

    const progress =
      activeIndex / (total - 1);

    if (dom.sectionNavRouteProgress) {
      dom.sectionNavRouteProgress.style.width =
        `${progress * 100}%`;
    }

    if (dom.sectionNavRoutePoint) {
      dom.sectionNavRoutePoint.style.left =
        `${progress * 100}%`;
    }
  }


  function scrollToSection(
    sectionId
  ) {
    const target =
      document.getElementById(
        sectionId
      );

    if (!target) return;

    registerActivity();

    const targetTop =
      target.getBoundingClientRect().top +
      window.scrollY -
      CONFIG.scrollNavigationOffset;

    const destination =
      Math.max(0, targetTop);

    if (prefersReducedMotion()) {
      window.scrollTo(
        0,
        destination
      );

      return;
    }

    window.scrollTo({
      top: destination,
      behavior: "smooth"
    });
  }


  function initSectionNavigation() {
    dom.sectionNavItems.forEach(
      (item) => {
        item.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            const target =
              item.dataset.sectionTarget;

            if (!target) return;

            scrollToSection(target);
          }
        );
      }
    );

    updateSectionNavigation(true);
  }


  /* =======================================================
     SECTION OBSERVER
     ======================================================= */

  function initSectionObserver() {
    if (!dom.sections.length) return;

    if (
      !("IntersectionObserver" in window)
    ) {
      updateSectionNavigation(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                const index =
                  getSectionIndex(
                    entry.target
                  );

                if (index >= 0) {
                  state.activeSection =
                    entry.target;

                  updateSectionNavigationUI(
                    entry.target,
                    index
                  );
                }
              }
            }
          );
        },
        {
          root: null,
          rootMargin:
            "-40% 0px -40% 0px",
          threshold: 0
        }
      );

    dom.sections.forEach(
      (section) => {
        observer.observe(section);
      }
    );
  }


  /* =======================================================
     REVEAL
     ======================================================= */

  function initReveal() {
    if (!dom.reveals.length) return;

    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      dom.reveals.forEach(
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
        (entries, obs) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "is-visible"
                );

                obs.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold:
            CONFIG.revealThreshold
        }
      );

    dom.reveals.forEach(
      (element) => {
        observer.observe(element);
      }
    );
  }


  /* =======================================================
     DIRECTION / CARD INTERACTIONS
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
            prefersReducedMotion()
          ) {
            return;
          }

          const rect =
            card.getBoundingClientRect();

          const x =
            (event.clientX -
              rect.left) /
            rect.width;

          const y =
            (event.clientY -
              rect.top) /
            rect.height;

          const rotateX =
            (0.5 - y) * 4;

          const rotateY =
            (x - 0.5) * 4;

          card.style.transform =
            `perspective(800px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
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
     MAGNETIC ELEMENTS
     ======================================================= */

  function initMagneticElements() {
    if (
      prefersReducedMotion() ||
      !dom.magnetic.length
    ) {
      return;
    }

    dom.magnetic.forEach(
      (element) => {
        element.addEventListener(
          "pointermove",
          (event) => {
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

            const strength =
              parseFloat(
                element.dataset.magneticStrength ||
                "0.18"
              );

            element.style.transform =
              `translate(${x * strength}px, ${y * strength}px)`;
          }
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
     CUSTOM CURSOR
     ======================================================= */

  function initCursor() {
    if (
      !dom.cursor ||
      window.matchMedia(
        "(hover: none)"
      ).matches
    ) {
      return;
    }

    document.body.classList.add(
      "has-custom-cursor"
    );

    document.addEventListener(
      "pointermove",
      (event) => {
        state.pointerX =
          event.clientX;

        state.pointerY =
          event.clientY;

        state.pointerMoving = true;

        if (
          dom.cursor.style.opacity !==
          "1"
        ) {
          dom.cursor.style.opacity =
            "1";
        }

        registerActivity();
      },
      {
        passive: true
      }
    );

    const interactive =
      document.querySelectorAll(
        "a, button, [data-magnetic], .direction-card"
      );

    interactive.forEach(
      (element) => {
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
      }
    );

    animateCursor();
  }


  function animateCursor() {
    state.cursorX =
      lerp(
        state.cursorX,
        state.pointerX,
        CONFIG.cursorLerp
      );

    state.cursorY =
      lerp(
        state.cursorY,
        state.pointerY,
        CONFIG.cursorLerp
      );

    if (dom.cursorDot) {
      dom.cursorDot.style.transform =
        `translate(${state.cursorX}px, ${state.cursorY}px) translate(-50%, -50%)`;
    }

    if (dom.cursorRing) {
      dom.cursorRing.style.transform =
        `translate(${state.cursorX}px, ${state.cursorY}px) translate(-50%, -50%)`;
    }

    state.rafId =
      requestAnimationFrame(
        animateCursor
      );
  }


  /* =======================================================
     STANDBY
     ======================================================= */

  function scheduleStandby() {
    window.clearTimeout(
      state.standbyTimer
    );

    if (
      document.hidden ||
      state.isMenuOpen ||
      state.isStandby
    ) {
      return;
    }

    state.standbyTimer =
      window.setTimeout(
        () => {
          enterStandby();
        },
        CONFIG.standbyDelay
      );
  }


  function enterStandby() {
    if (
      !dom.standby ||
      state.isStandby ||
      state.isMenuOpen
    ) {
      return;
    }

    state.isStandby = true;

    dom.standby.classList.add(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );

    dom.body.classList.add(
      "is-standby"
    );
  }


  function wakeFromStandby() {
    if (
      !dom.standby ||
      !state.isStandby
    ) {
      return;
    }

    state.isStandby = false;

    dom.standby.classList.remove(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.body.classList.remove(
      "is-standby"
    );

    state.lastActivity =
      Date.now();

    scheduleStandby();
  }


  function initStandby() {
    if (!dom.standby) return;

    if (dom.standbyWake) {
      dom.standbyWake.addEventListener(
        "click",
        wakeFromStandby
      );
    }

    /*
     * Il risveglio non dipende dal bottone.
     * Qualunque movimento significativo
     * riattiva l'esperienza.
     */

    let startX = null;
    let startY = null;

    document.addEventListener(
      "pointermove",
      (event) => {
        if (!state.isStandby) {
          return;
        }

        if (
          startX === null ||
          startY === null
        ) {
          startX = event.clientX;
          startY = event.clientY;
          return;
        }

        const dx =
          event.clientX - startX;

        const dy =
          event.clientY - startY;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );

        if (
          distance >=
          CONFIG.standbyWakeDistance
        ) {
          startX = null;
          startY = null;

          wakeFromStandby();
        }
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "pointerdown",
      () => {
        if (state.isStandby) {
          wakeFromStandby();
        }
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      "wheel",
      () => {
        if (state.isStandby) {
          wakeFromStandby();
        } else {
          registerActivity();
        }
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      "scroll",
      () => {
        if (state.isStandby) {
          wakeFromStandby();
        } else {
          registerActivity();
        }
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      "keydown",
      () => {
        if (state.isStandby) {
          wakeFromStandby();
        } else {
          registerActivity();
        }
      }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.hidden
        ) {
          return;
        }

        registerActivity();
      }
    );

    scheduleStandby();
  }


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  function initPageTransitions() {
    if (!dom.pageTransition) {
      return;
    }

    const internalLinks =
      document.querySelectorAll(
        'a[href]:not([target="_blank"]):not([download])'
      );

    internalLinks.forEach(
      (link) => {
        link.addEventListener(
          "click",
          (event) => {
            const href =
              link.getAttribute(
                "href"
              );

            if (!href) return;

            if (
              href.startsWith("#") ||
              href.startsWith(
                "mailto:"
              ) ||
              href.startsWith(
                "tel:"
              )
            ) {
              return;
            }

            const url =
              new URL(
                href,
                window.location.href
              );

            if (
              url.origin !==
              window.location.origin
            ) {
              return;
            }

            if (
              url.pathname ===
                window.location.pathname &&
              url.search ===
                window.location.search
            ) {
              return;
            }

            event.preventDefault();

            if (
              prefersReducedMotion()
            ) {
              window.location.href =
                url.href;

              return;
            }

            dom.pageTransition.classList.add(
              "is-active"
            );

            window.setTimeout(
              () => {
                window.location.href =
                  url.href;
              },
              CONFIG.transitionDuration
            );
          }
        );
      }
    );
  }


  /* =======================================================
     HASH / INITIAL POSITION
     ======================================================= */

  function initHashNavigation() {
    const hash =
      window.location.hash;

    if (!hash) return;

    const target =
      document.getElementById(
        hash.slice(1)
      );

    if (!target) return;

    window.setTimeout(
      () => {
        const top =
          target.getBoundingClientRect()
            .top +
          window.scrollY -
          CONFIG.scrollNavigationOffset;

        window.scrollTo({
          top,
          behavior:
            prefersReducedMotion()
              ? "auto"
              : "smooth"
        });

        updateSectionNavigation(
          true
        );
      },
      500
    );
  }


  /* =======================================================
     KEYBOARD SECTION NAVIGATION
     ======================================================= */

  function initKeyboardNavigation() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          state.isMenuOpen ||
          state.isStandby
        ) {
          return;
        }

        if (
          event.key !== "PageDown" &&
          event.key !== "PageUp"
        ) {
          return;
        }

        if (
          !state.activeSection
        ) {
          return;
        }

        const currentIndex =
          getSectionIndex(
            state.activeSection
          );

        if (currentIndex < 0) {
          return;
        }

        let nextIndex =
          currentIndex;

        if (
          event.key === "PageDown"
        ) {
          nextIndex =
            Math.min(
              currentIndex + 1,
              dom.sections.length - 1
            );
        }

        if (
          event.key === "PageUp"
        ) {
          nextIndex =
            Math.max(
              currentIndex - 1,
              0
            );
        }

        if (
          nextIndex !== currentIndex
        ) {
          event.preventDefault();

          const target =
            dom.sections[nextIndex];

          if (target) {
            scrollToSection(
              target.id
            );
          }
        }
      }
    );
  }


  /* =======================================================
     RESIZE
     ======================================================= */

  function initResize() {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );

        state.resizeTimer =
          window.setTimeout(
            () => {
              updateSectionNavigation(
                true
              );
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
     SCROLL
     ======================================================= */

  function initScroll() {
    let ticking = false;

    const update = () => {
      updateScrollProgress();
      updateSectionNavigation();

      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        registerActivity();

        if (!ticking) {
          requestAnimationFrame(
            update
          );

          ticking = true;
        }
      },
      {
        passive: true
      }
    );

    update();
  }


  /* =======================================================
     POINTER ACTIVITY
     ======================================================= */

  function initPointerActivity() {
    document.addEventListener(
      "pointermove",
      () => {
        registerActivity();
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "touchmove",
      () => {
        registerActivity();
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     INITIALIZE
     ======================================================= */

  function init() {
    initLoader();

    initMenu();

    initSectionNavigation();
    initSectionObserver();

    initReveal();

    initDirectionInteractions();

    initMagneticElements();

    initCursor();

    initStandby();

    initPageTransitions();

    initHashNavigation();

    initKeyboardNavigation();

    initResize();

    initScroll();

    initPointerActivity();

    updateScrollProgress();

    updateSectionNavigation(
      true
    );
  }


  /* =======================================================
     START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
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
