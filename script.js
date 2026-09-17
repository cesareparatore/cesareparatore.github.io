/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   HOME — MOTION SYSTEM 17/09/2026
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. ROOT / STATE
     ======================================================= */

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  const state = {
    menuOpen: false,
    standby: false,
    lastScrollY: window.scrollY,
    ticking: false,
    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  };

  const SELECTORS = {
    header: ".site-header",
    menu: "#site-menu",
    menuToggle: "#menu-toggle",
    menuLinks: ".primary-nav a",
    sections: "main section[id]",
    reveals: "[data-reveal]",
    magnetic: ".magnetic",
    directionItems: ".direction-item",
    directionLinks: ".direction-item a",
    samePageLinks: 'a[href^="#"]'
  };

  const STANDBY_DELAY = 30000;

  let standbyTimer = null;
  let loaderTimer = null;
  let cursor = null;
  let mobileNav = null;


  /* =======================================================
     02. UTILITIES
     ======================================================= */

  const qs = (selector, scope = document) =>
    scope.querySelector(selector);

  const qsa = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const prefersReducedMotion = () =>
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const isSamePage = (url) =>
    url.origin === window.location.origin &&
    url.pathname === window.location.pathname &&
    url.search === window.location.search;

  const focusable = (container) =>
    qsa(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])'
      ].join(","),
      container
    );

  const getSections = () =>
    qsa(SELECTORS.sections);

  const getCurrentSection = () => {
    const sections = getSections();

    if (!sections.length) return null;

    const marker = window.innerHeight * 0.38;

    let current = sections[0];

    for (const section of sections) {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= marker &&
        rect.bottom >= marker
      ) {
        current = section;
        break;
      }

      if (rect.top < marker) {
        current = section;
      }
    }

    return current;
  };


  /* =======================================================
     03. LOADER
     ======================================================= */

  function initLoader() {
    const loader = qs("#intro");

    if (!loader) return;

    const hideLoader = () => {
      if (loader.classList.contains("is-hidden")) return;

      loader.classList.add("is-hidden");

      window.setTimeout(() => {
        loader.removeAttribute("aria-hidden");
        loader.setAttribute("aria-hidden", "true");
      }, 1000);
    };

    if (document.readyState === "complete") {
      window.setTimeout(hideLoader, 500);
    } else {
      window.addEventListener(
        "load",
        () => {
          window.setTimeout(hideLoader, 500);
        },
        { once: true }
      );
    }

    loaderTimer = window.setTimeout(
      hideLoader,
      3800
    );
  }


  /* =======================================================
     04. HEADER
     ======================================================= */

  function initHeader() {
    const header = qs(SELECTORS.header);

    if (!header) return;

    let previousY = window.scrollY;

    const updateHeader = () => {
      const currentY = window.scrollY;

      if (
        !state.menuOpen &&
        !state.standby
      ) {
        if (
          currentY > previousY &&
          currentY > 120
        ) {
          header.classList.add("is-hidden");
        } else {
          header.classList.remove("is-hidden");
        }
      }

      previousY = currentY;
    };

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }


  /* =======================================================
     05. SCROLL PROGRESS
     ======================================================= */

  function updateScrollProgress() {
    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      documentHeight > 0
        ? clamp(
            window.scrollY / documentHeight,
            0,
            1
          )
        : 0;

    root.style.setProperty(
      "--progress",
      `${progress * 100}%`
    );
  }

  function initScrollProgress() {
    updateScrollProgress();

    window.addEventListener(
      "scroll",
      updateScrollProgress,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateScrollProgress,
      { passive: true }
    );
  }


  /* =======================================================
     06. SECTION INDEX
     ======================================================= */

  function updateSectionIndex(section) {
    const current = qs(".index-current");
    const total = qs(".index-total");

    if (!current || !total || !section) return;

    const index =
      section.dataset.index ||
      String(
        getSections().indexOf(section) + 1
      ).padStart(2, "0");

    current.textContent =
      String(index).padStart(2, "0");

    total.textContent =
      String(getSections().length).padStart(2, "0");
  }

  function initSectionObserver() {
    const sections = getSections();

    if (!sections.length) return;

    if (!("IntersectionObserver" in window)) {
      updateSectionIndex(sections[0]);
      return;
    }

    const observer =
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

          if (visible[0]) {
            updateSectionIndex(
              visible[0].target
            );

            updateMobileSectionNav(
              visible[0].target
            );
          }
        },
        {
          threshold: [0.15, 0.35, 0.6],
          rootMargin:
            "-10% 0px -35% 0px"
        }
      );

    sections.forEach(section =>
      observer.observe(section)
    );

    updateSectionIndex(sections[0]);
  }


  /* =======================================================
     07. REVEAL SYSTEM
     ======================================================= */

  function initRevealSystem() {
    const elements =
      qsa(SELECTORS.reveals);

    if (!elements.length) return;

    root.classList.add("reveal-ready");

    if (
      state.reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach(el =>
        el.classList.add("is-visible")
      );
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
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
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );

    elements.forEach(el =>
      observer.observe(el)
    );
  }


  /* =======================================================
     08. HERO PARALLAX
     ======================================================= */

  function initHeroParallax() {
    if (
      state.reducedMotion ||
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
    ) {
      return;
    }

    const hero =
      qs(".hero");

    const visual =
      qs(".hero-visual");

    if (!hero || !visual) return;

    let raf = null;

    const move = event => {
      if (raf) {
        cancelAnimationFrame(raf);
      }

      raf = requestAnimationFrame(() => {
        const rect =
          hero.getBoundingClientRect();

        const x =
          (event.clientX -
            window.innerWidth / 2) *
          0.025;

        const y =
          (event.clientY -
            window.innerHeight / 2) *
          0.018;

        visual.style.setProperty(
          "--hero-x",
          `${x}px`
        );

        visual.style.setProperty(
          "--hero-y",
          `${y}px`
        );
      });
    };

    hero.addEventListener(
      "pointermove",
      move,
      { passive: true }
    );

    hero.addEventListener(
      "pointerleave",
      () => {
        visual.style.setProperty(
          "--hero-x",
          "0px"
        );

        visual.style.setProperty(
          "--hero-y",
          "0px"
        );
      }
    );
  }


  /* =======================================================
     09. FULLSCREEN MENU
     ======================================================= */

  function initMenu() {
    const menu =
      qs(SELECTORS.menu);

    const toggle =
      qs(SELECTORS.menuToggle);

    if (!menu || !toggle) return;

    const links =
      qsa(
        SELECTORS.menuLinks,
        menu
      );

    const closeButtons =
      qsa(
        "[data-menu-close]",
        menu
      );

    const openMenu = () => {
      if (state.menuOpen) return;

      state.menuOpen = true;

      menu.classList.add("is-open");
      body.classList.add("menu-open");

      toggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menu.setAttribute(
        "aria-hidden",
        "false"
      );

      const first =
        links[0] ||
        focusable(menu)[0];

      window.setTimeout(() => {
        first?.focus();
      }, 100);

      clearStandbyTimer();
    };

    const closeMenu = (
      restoreFocus = true
    ) => {
      if (!state.menuOpen) return;

      state.menuOpen = false;

      menu.classList.remove("is-open");
      body.classList.remove("menu-open");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menu.setAttribute(
        "aria-hidden",
        "true"
      );

      if (restoreFocus) {
        toggle.focus();
      }

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

    closeButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => closeMenu()
      );
    });

    links.forEach(link => {
      link.addEventListener(
        "click",
        event => {
          const url =
            new URL(
              link.href,
              window.location.href
            );

          if (isSamePage(url)) {
            event.preventDefault();

            closeMenu(false);

            const target =
              qs(
                url.hash,
                document
              );

            if (target) {
              navigateToSection(target);
            }
          }
        }
      );
    });

    document.addEventListener(
      "keydown",
      event => {
        if (!state.menuOpen) return;

        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
          return;
        }

        if (event.key !== "Tab") return;

        const items =
          focusable(menu);

        if (!items.length) return;

        const first = items[0];
        const last =
          items[items.length - 1];

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


  /* =======================================================
     10. SECTION NAVIGATION
     ======================================================= */

  function navigateToSection(
    target,
    options = {}
  ) {
    if (!target) return;

    const {
      smooth = true
    } = options;

    const headerHeight =
      parseFloat(
        getComputedStyle(root)
          .getPropertyValue(
            "--header-height"
          )
      ) || 86;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      15;

    if (
      state.reducedMotion ||
      !smooth
    ) {
      window.scrollTo(
        0,
        top
      );
    } else {
      window.scrollTo({
        top,
        behavior: "smooth"
      });
    }

    history.replaceState(
      null,
      "",
      `#${target.id}`
    );

    resetStandbyTimer();
  }

  function initAnchorNavigation() {
    qsa(
      SELECTORS.samePageLinks
    ).forEach(link => {
      link.addEventListener(
        "click",
        event => {
          const href =
            link.getAttribute("href");

          if (
            !href ||
            href === "#"
          ) {
            event.preventDefault();
            window.scrollTo({
              top: 0,
              behavior:
                state.reducedMotion
                  ? "auto"
                  : "smooth"
            });
            return;
          }

          const target =
            qs(href);

          if (!target) return;

          event.preventDefault();

          navigateToSection(target);
        }
      );
    });
  }


  /* =======================================================
     11. KEYBOARD SECTION NAVIGATION
     ======================================================= */

  function initKeyboardNavigation() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          state.menuOpen ||
          state.standby
        ) {
          return;
        }

        if (
          event.target instanceof
            HTMLInputElement ||
          event.target instanceof
            HTMLTextAreaElement ||
          event.target instanceof
            HTMLSelectElement
        ) {
          return;
        }

        const sections =
          getSections();

        if (!sections.length) return;

        const current =
          getCurrentSection();

        const index =
          sections.indexOf(current);

        if (
          event.key === "ArrowDown" ||
          event.key === "PageDown"
        ) {
          event.preventDefault();

          const next =
            sections[
              clamp(
                index + 1,
                0,
                sections.length - 1
              )
            ];

          navigateToSection(next);
        }

        if (
          event.key === "ArrowUp" ||
          event.key === "PageUp"
        ) {
          event.preventDefault();

          const previous =
            sections[
              clamp(
                index - 1,
                0,
                sections.length - 1
              )
            ];

          navigateToSection(previous);
        }
      }
    );
  }


  /* =======================================================
     12. MOBILE SECTION NAV
     ======================================================= */

  function createMobileSectionNav() {
    if (mobileNav) return;

    const sections =
      getSections();

    if (sections.length < 2) return;

    mobileNav =
      document.createElement("nav");

    mobileNav.className =
      "mobile-section-nav";

    mobileNav.setAttribute(
      "aria-label",
      "Navigazione sezioni"
    );

    mobileNav.innerHTML = `
      <button
        type="button"
        class="mobile-section-nav-prev"
        aria-label="Sezione precedente"
      >←</button>

      <span
        class="mobile-section-nav-current"
      >01 — L'INIZIO</span>

      <button
        type="button"
        class="mobile-section-nav-next"
        aria-label="Sezione successiva"
      >→</button>
    `;

    body.appendChild(mobileNav);

    const previous =
      qs(
        ".mobile-section-nav-prev",
        mobileNav
      );

    const next =
      qs(
        ".mobile-section-nav-next",
        mobileNav
      );

    previous.addEventListener(
      "click",
      () => {
        const current =
          getCurrentSection();

        const index =
          sections.indexOf(current);

        const target =
          sections[
            clamp(
              index - 1,
              0,
              sections.length - 1
            )
          ];

        navigateToSection(target);
      }
    );

    next.addEventListener(
      "click",
      () => {
        const current =
          getCurrentSection();

        const index =
          sections.indexOf(current);

        const target =
          sections[
            clamp(
              index + 1,
              0,
              sections.length - 1
            )
          ];

        navigateToSection(target);
      }
    );

    updateMobileSectionNav(
      sections[0]
    );
  }

  function updateMobileSectionNav(
    section
  ) {
    if (!mobileNav || !section) return;

    const current =
      qs(
        ".mobile-section-nav-current",
        mobileNav
      );

    if (!current) return;

    const index =
      section.dataset.index ||
      String(
        getSections().indexOf(section) + 1
      ).padStart(2, "0");

    const heading =
      qs(
        "h1, h2",
        section
      );

    const title =
      heading?.textContent
        ?.replace(/\s+/g, " ")
        .trim() ||
      "SEZIONE";

    current.textContent =
      `${String(index).padStart(2, "0")} — ${title}`;
  }

  function initMobileSectionNav() {
    createMobileSectionNav();

    const media =
      window.matchMedia(
        "(max-width: 760px)"
      );

    const update = () => {
      if (!mobileNav) return;

      if (media.matches) {
        mobileNav.classList.add(
          "is-visible"
        );
      } else {
        mobileNav.classList.remove(
          "is-visible"
        );
      }
    };

    media.addEventListener?.(
      "change",
      update
    );

    update();
  }


  /* =======================================================
     13. DIRECTIONS INTERACTION
     ======================================================= */

  function initDirections() {
    const items =
      qsa(
        SELECTORS.directionItems
      );

    if (!items.length) return;

    items.forEach(item => {
      item.addEventListener(
        "pointerenter",
        () => {
          items.forEach(other =>
            other.classList.remove(
              "is-active"
            )
          );

          item.classList.add(
            "is-active"
          );
        }
      );

      item.addEventListener(
        "focusin",
        () => {
          items.forEach(other =>
            other.classList.remove(
              "is-active"
            )
          );

          item.classList.add(
            "is-active"
          );
        }
      );

      item.addEventListener(
        "pointerleave",
        () => {
          item.classList.remove(
            "is-active"
          );
        }
      );
    });
  }


  /* =======================================================
     14. MAGNETIC INTERACTIONS
     ======================================================= */

  function initMagnetic() {
    if (
      state.reducedMotion ||
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
    ) {
      return;
    }

    qsa(
      SELECTORS.magnetic
    ).forEach(element => {
      let raf = null;

      element.addEventListener(
        "pointermove",
        event => {
          if (raf) {
            cancelAnimationFrame(
              raf
            );
          }

          raf =
            requestAnimationFrame(() => {
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

              element.style.transform =
                `translate3d(${x * .12}px, ${y * .12}px, 0)`;
            });
        }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          element.style.transform =
            "translate3d(0,0,0)";
        }
      );
    });
  }


  /* =======================================================
     15. CUSTOM CURSOR
     ======================================================= */

  function initCursor() {
    if (
      state.reducedMotion ||
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
    ) {
      return;
    }

    cursor =
      document.createElement("div");

    cursor.className =
      "cp-cursor";

    cursor.setAttribute(
      "aria-hidden",
      "true"
    );

    body.appendChild(cursor);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    let targetX = x;
    let targetY = y;

    const render = () => {
      x += (targetX - x) * .2;
      y += (targetY - y) * .2;

      cursor.style.transform =
        `translate3d(${x}px, ${y}px, 0)`;

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    window.addEventListener(
      "pointermove",
      event => {
        targetX = event.clientX;
        targetY = event.clientY;

        cursor.classList.add(
          "is-visible"
        );
      },
      { passive: true }
    );

    const interactive =
      "a, button, [role='button'], input, textarea, select";

    document.addEventListener(
      "pointerover",
      event => {
        if (
          event.target.closest(
            interactive
          )
        ) {
          cursor.classList.add(
            "is-hover"
          );
        }
      }
    );

    document.addEventListener(
      "pointerout",
      event => {
        if (
          event.target.closest(
            interactive
          )
        ) {
          cursor.classList.remove(
            "is-hover"
          );
        }
      }
    );

    window.addEventListener(
      "blur",
      () => {
        cursor.classList.remove(
          "is-visible"
        );
      }
    );
  }


  /* =======================================================
     16. STANDBY SYSTEM
     ======================================================= */

  function createStandbyScreen() {
    let screen =
      qs(".standby-screen");

    if (screen) return screen;

    screen =
      document.createElement("aside");

    screen.className =
      "standby-screen";

    screen.setAttribute(
      "aria-hidden",
      "true"
    );

    screen.innerHTML = `
      <div class="standby-inner">

        <div class="standby-logo-wrap">
          <img
            class="standby-logo"
            src="/assets/images/cp-mark.png"
            alt="Cesare Paratore"
            width="180"
            height="180"
          >
        </div>

        <div class="standby-title">
          IN ATTESA.
        </div>

        <div class="standby-copy">
          Il movimento si è fermato.
          La direzione è ancora qui.
        </div>

        <button
          class="standby-wake"
          type="button"
        >
          Riprendi
        </button>

      </div>
    `;

    body.appendChild(screen);

    return screen;
  }

  function enterStandby() {
    if (
      state.standby ||
      state.menuOpen
    ) {
      return;
    }

    if (
      document.visibilityState !==
      "visible"
    ) {
      return;
    }

    const screen =
      createStandbyScreen();

    state.standby = true;

    body.classList.add(
      "standby-active"
    );

    root.classList.add(
      "standby-mode"
    );

    screen.setAttribute(
      "aria-hidden",
      "false"
    );

    const wake =
      qs(
        ".standby-wake",
        screen
      );

    window.setTimeout(() => {
      wake?.focus();
    }, 100);

    screen.addEventListener(
      "click",
      handleStandbyClick,
      { once: true }
    );

    document.dispatchEvent(
      new CustomEvent(
        "cp:standby-enter"
      )
    );
  }

  function handleStandbyClick(event) {
    if (
      event.target.closest(
        ".standby-wake"
      )
    ) {
      wakeFromStandby();
    }
  }

  function wakeFromStandby() {
    const screen =
      qs(".standby-screen");

    state.standby = false;

    body.classList.remove(
      "standby-active"
    );

    root.classList.remove(
      "standby-mode"
    );

    if (screen) {
      screen.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "cp:standby-wake"
      )
    );

    resetStandbyTimer();
  }

  function clearStandbyTimer() {
    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );

      standbyTimer = null;
    }
  }

  function resetStandbyTimer() {
    clearStandbyTimer();

    if (
      state.reducedMotion ||
      state.standby ||
      state.menuOpen
    ) {
      return;
    }

    standbyTimer =
      window.setTimeout(
        enterStandby,
        STANDBY_DELAY
      );
  }

  function initStandby() {
    createStandbyScreen();

    const activityEvents = [
      "pointerdown",
      "pointermove",
      "wheel",
      "touchstart",
      "keydown",
      "scroll"
    ];

    activityEvents.forEach(
      eventName => {
        window.addEventListener(
          eventName,
          () => {
            if (state.standby) {
              if (
                eventName !==
                "pointermove"
              ) {
                wakeFromStandby();
              }
            } else {
              resetStandbyTimer();
            }
          },
          {
            passive:
              eventName !== "keydown"
          }
        );
      }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          resetStandbyTimer();
        } else {
          clearStandbyTimer();
        }
      }
    );

    resetStandbyTimer();
  }


  /* =======================================================
     17. PAGE TRANSITIONS
     ======================================================= */

  function createPageTransition() {
    let transition =
      qs(".page-transition");

    if (transition) return transition;

    transition =
      document.createElement("div");

    transition.className =
      "page-transition";

    transition.setAttribute(
      "aria-hidden",
      "true"
    );

    body.appendChild(
      transition
    );

    return transition;
  }

  function navigateToPage(url) {
    const transition =
      createPageTransition();

    if (
      state.reducedMotion
    ) {
      window.location.href =
        url.href;
      return;
    }

    body.classList.add(
      "is-page-leaving"
    );

    transition.classList.add(
      "is-active"
    );

    window.setTimeout(() => {
      window.location.href =
        url.href;
    }, 650);
  }

  function initPageTransitions() {
    document.addEventListener(
      "click",
      event => {
        const link =
          event.target.closest(
            "a[href]"
          );

        if (!link) return;

        if (
          link.target === "_blank" ||
          link.hasAttribute("download") ||
          link.getAttribute("href")?.startsWith(
            "mailto:"
          ) ||
          link.getAttribute("href")?.startsWith(
            "tel:"
          )
        ) {
          return;
        }

        const url =
          new URL(
            link.href,
            window.location.href
          );

        if (
          url.origin !==
          window.location.origin
        ) {
          return;
        }

        if (isSamePage(url)) {
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

        event.preventDefault();

        navigateToPage(url);
      }
    );
  }


  /* =======================================================
     18. HASH / INITIAL POSITION
     ======================================================= */

  function handleInitialHash() {
    if (!window.location.hash) return;

    const target =
      qs(
        window.location.hash
      );

    if (!target) return;

    window.setTimeout(() => {
      navigateToSection(
        target,
        {
          smooth: false
        }
      );
    }, 100);
  }


  /* =======================================================
     19. VIEWPORT / RESIZE
     ======================================================= */

  function initResize() {
    let timeout = null;

    window.addEventListener(
      "resize",
      () => {
        clearTimeout(timeout);

        timeout =
          window.setTimeout(() => {
            updateScrollProgress();

            if (
              window.matchMedia(
                "(pointer: coarse)"
              ).matches &&
              cursor
            ) {
              cursor.remove();
              cursor = null;
            }
          }, 150);
      },
      { passive: true }
    );
  }


  /* =======================================================
     20. VISIBILITY
     ======================================================= */

  function initVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          clearStandbyTimer();
        } else {
          resetStandbyTimer();
        }
      }
    );
  }


  /* =======================================================
     21. DEBUG API
     ======================================================= */

  function exposeDebugAPI() {
    window.CP = {
      version: "2026.09.17",
      state,

      openMenu: () => {
        const toggle =
          qs(SELECTORS.menuToggle);

        toggle?.click();
      },

      closeMenu: () => {
        const menu =
          qs(SELECTORS.menu);

        const toggle =
          qs(SELECTORS.menuToggle);

        if (
          menu?.classList.contains(
            "is-open"
          )
        ) {
          toggle?.click();
        }
      },

      enterStandby,
      wakeFromStandby,

      goTo: id => {
        const target =
          document.getElementById(id);

        if (target) {
          navigateToSection(target);
        }
      }
    };
  }


  /* =======================================================
     22. CLEANUP / SAFETY
     ======================================================= */

  window.addEventListener(
    "pageshow",
    () => {
      body.classList.remove(
        "is-page-leaving"
      );

      const transition =
        qs(".page-transition");

      transition?.classList.remove(
        "is-active"
      );

      resetStandbyTimer();
    }
  );


  /* =======================================================
     23. INITIALIZATION
     ======================================================= */

  function init() {
    initLoader();

    initHeader();

    initScrollProgress();

    initSectionObserver();

    initRevealSystem();

    initHeroParallax();

    initMenu();

    initAnchorNavigation();

    initKeyboardNavigation();

    initMobileSectionNav();

    initDirections();

    initMagnetic();

    initCursor();

    initStandby();

    initPageTransitions();

    initVisibility();

    initResize();

    handleInitialHash();

    exposeDebugAPI();
  }


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
