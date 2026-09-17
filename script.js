(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE
     MOVIMENTO / CON DIREZIONE.
     EXPERIENCE ENGINE — 17/09/2026
     ========================================================= */

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  /* ---------------------------------------------------------
     CONFIG
     --------------------------------------------------------- */

  const CONFIG = {
    loaderMaxWait: 4200,
    loaderMinimumTime: 450,
    standbyDelay: 30000,
    scrollRevealThreshold: 0.12,
    sectionThreshold: 0.45,
    reducedMotionQuery: "(prefers-reduced-motion: reduce)"
  };

  const SECTION_IDS = [
    "inizio",
    "centro",
    "direzioni",
    "persona",
    "direzione",
    "tracce",
    "territorio",
    "adesso",
    "tua-direzione",
    "contatto"
  ];

  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */

  const state = {
    reducedMotion: window.matchMedia(CONFIG.reducedMotionQuery).matches,
    currentSection: 0,
    menuOpen: false,
    standby: false,
    lastScrollY: window.scrollY,
    scrollDirection: "down",
    idleTimer: null,
    loaderHidden: false,
    initialized: false
  };

  /* ---------------------------------------------------------
     UTILITIES
     --------------------------------------------------------- */

  const qs = (selector, scope = document) =>
    scope.querySelector(selector);

  const qsa = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isSamePageLink = (link) => {
    if (!link || !link.href) return false;

    try {
      const url = new URL(link.href, window.location.href);

      return (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.hash
      );
    } catch {
      return false;
    }
  };

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------------------------------------------------------
     LOADER
     ---------------------------------------------------------
     IMPORTANT:
     - Never recolors the CP logo.
     - Never injects filters.
     - Never depends on another script.
     - Always gets a fail-safe exit.
     --------------------------------------------------------- */

  function hideLoader(force = false) {
    const loader = qs("#page-loader");

    if (!loader || state.loaderHidden) return;

    state.loaderHidden = true;

    if (force) {
      loader.classList.add("is-hidden", "is-complete");
      root.classList.add("page-ready");
      body.classList.add("page-ready");
      return;
    }

    loader.classList.add("is-complete");

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      root.classList.add("page-ready");
      body.classList.add("page-ready");
    }, 120);
  }

  function initLoader() {
    const loader = qs("#page-loader");

    if (!loader) {
      root.classList.add("page-ready");
      body.classList.add("page-ready");
      return;
    }

    const start = performance.now();

    const complete = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        hideLoader();
      }, remaining);
    };

    /*
      DOMContentLoaded is enough for the interface to become
      usable. We deliberately do NOT wait indefinitely for
      images, fonts or external resources.
    */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", complete, {
        once: true
      });
    } else {
      complete();
    }

    /*
      Absolute fail-safe.
      Even if something elsewhere throws an exception,
      the loading screen cannot trap the user forever.
    */
    window.setTimeout(() => {
      hideLoader(true);
    }, CONFIG.loaderMaxWait);
  }

  /* ---------------------------------------------------------
     HEADER
     --------------------------------------------------------- */

  function initHeader() {
    const header = qs(".site-header");

    if (!header) return;

    let ticking = false;

    const updateHeader = () => {
      const currentY = window.scrollY;

      if (currentY <= 20) {
        header.classList.remove("is-scrolled", "is-hidden");
      } else {
        header.classList.add("is-scrolled");

        if (
          currentY > state.lastScrollY &&
          currentY > 140 &&
          !state.menuOpen &&
          !state.standby
        ) {
          header.classList.add("is-hidden");
          state.scrollDirection = "down";
        } else if (currentY < state.lastScrollY) {
          header.classList.remove("is-hidden");
          state.scrollDirection = "up";
        }
      }

      state.lastScrollY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true
    });

    updateHeader();
  }

  /* ---------------------------------------------------------
     SCROLL PROGRESS
     --------------------------------------------------------- */

  function initScrollProgress() {
    const progress =
      qs("[data-scroll-progress]") ||
      qs(".scroll-progress");

    if (!progress) return;

    let ticking = false;

    const update = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;

      const scrollHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        scrollHeight > 0
          ? clamp(scrollTop / scrollHeight, 0, 1)
          : 0;

      progress.style.setProperty(
        "--progress",
        percentage.toString()
      );

      if (progress.tagName === "PROGRESS") {
        progress.value = percentage * 100;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true
    });

    update();
  }

  /* ---------------------------------------------------------
     SECTION INDEX
     --------------------------------------------------------- */

  function initSectionIndex() {
    const index =
      qs("#section-index") ||
      qs("[data-section-index]");

    const current =
      qs("#section-current") ||
      qs("[data-section-current]");

    const total =
      qs("#section-total") ||
      qs("[data-section-total]");

    if (total) {
      total.textContent = String(SECTION_IDS.length).padStart(2, "0");
    }

    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const update = (section) => {
      const indexValue = sections.indexOf(section);

      if (indexValue < 0) return;

      state.currentSection = indexValue;

      const number = String(indexValue + 1).padStart(2, "0");

      if (current) {
        current.textContent = number;
      }

      if (index) {
        index.dataset.current = number;
      }

      document.body.style.setProperty(
        "--current-section",
        String(indexValue + 1)
      );
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              update(entry.target);
            }
          });
        },
        {
          threshold: CONFIG.sectionThreshold,
          rootMargin: "-10% 0px -35% 0px"
        }
      );

      sections.forEach((section) =>
        observer.observe(section)
      );
    } else {
      update(sections[0]);
    }
  }

  /* ---------------------------------------------------------
     REVEAL SYSTEM
     --------------------------------------------------------- */

  function initReveal() {
    const elements = qsa(
      "[data-reveal], .reveal, [data-reveal-item]"
    );

    if (!elements.length) return;

    if (state.reducedMotion) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    root.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.scrollRevealThreshold,
        rootMargin: "0px 0px -7% 0px"
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  /* ---------------------------------------------------------
     HERO ATMOSPHERE
     --------------------------------------------------------- */

  function initHeroAtmosphere() {
    const hero =
      qs("#inizio") ||
      qs(".chapter-hero") ||
      qs(".hero");

    if (!hero || state.reducedMotion) return;

    const visual =
      qs(".visual-field", hero) ||
      qs("[data-visual]", hero);

    if (!visual) return;

    let ticking = false;

    const update = () => {
      const rect = hero.getBoundingClientRect();

      const progress = clamp(
        -rect.top / Math.max(rect.height, 1),
        0,
        1
      );

      visual.style.setProperty(
        "--visual-progress",
        progress.toFixed(3)
      );

      visual.style.setProperty(
        "--visual-shift",
        `${progress * -24}px`
      );

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true
    });

    update();
  }

  /* ---------------------------------------------------------
     VISUAL FIELDS
     --------------------------------------------------------- */

  function initVisualFields() {
    const fields = qsa(
      ".visual-field, [data-visual-field]"
    );

    if (!fields.length || state.reducedMotion) return;

    fields.forEach((field) => {
      field.addEventListener(
        "pointermove",
        (event) => {
          const rect = field.getBoundingClientRect();

          const x =
            ((event.clientX - rect.left) / rect.width) * 100;

          const y =
            ((event.clientY - rect.top) / rect.height) * 100;

          field.style.setProperty(
            "--pointer-x",
            `${x}%`
          );

          field.style.setProperty(
            "--pointer-y",
            `${y}%`
          );
        },
        { passive: true }
      );

      field.addEventListener("pointerleave", () => {
        field.style.setProperty("--pointer-x", "50%");
        field.style.setProperty("--pointer-y", "50%");
      });
    });
  }

  /* ---------------------------------------------------------
     FULLSCREEN MENU
     --------------------------------------------------------- */

  function initMenu() {
    const toggle = qs("#menu-toggle");
    const menu = qs("#site-menu");

    if (!toggle || !menu) return;

    const panel =
      qs(".menu-panel", menu) ||
      qs("[data-menu-panel]", menu);

    const backdrop =
      qs(".menu-backdrop", menu) ||
      qs("[data-menu-backdrop]", menu);

    const links = qsa(
      'a[href^="#"]',
      menu
    );

    let lastFocusedElement = null;

    const open = () => {
      lastFocusedElement =
        document.activeElement;

      state.menuOpen = true;

      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      body.classList.add("menu-open");

      if (panel) {
        panel.setAttribute("tabindex", "-1");
        window.setTimeout(() => panel.focus(), 80);
      }
    };

    const close = (restoreFocus = true) => {
      state.menuOpen = false;

      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      body.classList.remove("menu-open");

      if (
        restoreFocus &&
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
      ) {
        window.setTimeout(() => {
          lastFocusedElement.focus();
        }, 50);
      }
    };

    toggle.addEventListener("click", () => {
      if (state.menuOpen) {
        close();
      } else {
        open();
      }
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => {
        close();
      });
    }

    links.forEach((link) => {
      link.addEventListener("click", () => {
        close(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!state.menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = qsa(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        menu
      ).filter((element) => {
        return element.offsetParent !== null;
      });

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
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     SMOOTH NAVIGATION
     --------------------------------------------------------- */

  function scrollToTarget(target) {
    if (!target) return;

    const header =
      qs(".site-header");

    const headerHeight =
      header ? header.offsetHeight : 0;

    const offset =
      window.innerWidth <= 760
        ? Math.min(headerHeight + 18, 110)
        : Math.min(headerHeight + 28, 130);

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      offset;

    if (state.reducedMotion) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({
        top,
        behavior: "smooth"
      });
    }
  }

  function initAnchorNavigation() {
    const links = qsa(
      'a[href^="#"]'
    );

    links.forEach((link) => {
      if (link.dataset.navigationBound) return;

      link.dataset.navigationBound = "true";

      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.getElementById(
          href.slice(1)
        );

        if (!target) return;

        event.preventDefault();

        scrollToTarget(target);

        if (
          history.pushState &&
          href !== "#"
        ) {
          history.pushState(
            null,
            "",
            href
          );
        }
      });
    });
  }

  /* ---------------------------------------------------------
     MOBILE SECTION NAVIGATION
     --------------------------------------------------------- */

  function initMobileNavigation() {
    const existingNav =
      qs(".mobile-section-nav");

    if (existingNav) {
      bindMobileNavigation(existingNav);
      return;
    }

    if (!SECTION_IDS.some((id) =>
      document.getElementById(id)
    )) {
      return;
    }

    const nav =
      document.createElement("nav");

    nav.className =
      "mobile-section-nav";

    nav.setAttribute(
      "aria-label",
      "Navigazione sezioni"
    );

    nav.innerHTML = `
      <button
        class="mobile-section-trigger"
        type="button"
        aria-expanded="false"
        aria-controls="mobile-section-list"
      >
        <span class="mobile-section-current">01</span>
        <span class="mobile-section-label">SEZIONE</span>
        <span class="mobile-section-arrow" aria-hidden="true">↓</span>
      </button>

      <div
        class="mobile-section-list"
        id="mobile-section-list"
        hidden
      >
        ${SECTION_IDS.map((id, index) => {
          const section = document.getElementById(id);
          const title =
            section?.querySelector("h1, h2")?.textContent?.trim() ||
            `Sezione ${index + 1}`;

          return `
            <a
              href="#${id}"
              data-section-link="${id}"
            >
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${title}</strong>
            </a>
          `;
        }).join("")}
      </div>
    `;

    body.appendChild(nav);

    bindMobileNavigation(nav);
  }

  function bindMobileNavigation(nav) {
    const trigger =
      qs(".mobile-section-trigger", nav);

    const list =
      qs(".mobile-section-list", nav);

    const current =
      qs(".mobile-section-current", nav);

    if (!trigger || !list) return;

    const close = () => {
      trigger.setAttribute(
        "aria-expanded",
        "false"
      );

      list.hidden = true;
      nav.classList.remove("is-open");
    };

    const open = () => {
      trigger.setAttribute(
        "aria-expanded",
        "true"
      );

      list.hidden = false;
      nav.classList.add("is-open");
    };

    trigger.addEventListener("click", () => {
      const expanded =
        trigger.getAttribute("aria-expanded") === "true";

      expanded ? close() : open();
    });

    qsa(
      "a[data-section-link]",
      nav
    ).forEach((link) => {
      link.addEventListener("click", () => {
        close();
      });
    });

    window.addEventListener("scroll", () => {
      if (!current) return;

      current.textContent =
        String(state.currentSection + 1)
          .padStart(2, "0");
    }, { passive: true });

    document.addEventListener("click", (event) => {
      if (
        !nav.contains(event.target) &&
        nav.classList.contains("is-open")
      ) {
        close();
      }
    });
  }

  /* ---------------------------------------------------------
     KEYBOARD SECTION NAVIGATION
     --------------------------------------------------------- */

  function initKeyboardNavigation() {
    document.addEventListener("keydown", (event) => {
      if (
        state.menuOpen ||
        state.standby
      ) {
        return;
      }

      const activeElement =
        document.activeElement;

      const isTyping =
        activeElement &&
        (
          activeElement.matches("input") ||
          activeElement.matches("textarea") ||
          activeElement.matches("select") ||
          activeElement.isContentEditable
        );

      if (isTyping) return;

      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp"
      ) {
        return;
      }

      const sections = SECTION_IDS
        .map((id) =>
          document.getElementById(id)
        )
        .filter(Boolean);

      if (!sections.length) return;

      event.preventDefault();

      const direction =
        event.key === "ArrowDown"
          ? 1
          : -1;

      const nextIndex = clamp(
        state.currentSection + direction,
        0,
        sections.length - 1
      );

      scrollToTarget(
        sections[nextIndex]
      );
    });
  }

  /* ---------------------------------------------------------
     DIRECTION ITEMS
     --------------------------------------------------------- */

  function initDirectionInteractions() {
    const items = qsa(
      ".direction-item, .direction-door, [data-direction]"
    );

    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        items.forEach((other) => {
          other.classList.toggle(
            "is-active",
            other === item
          );
        });
      });

      item.addEventListener("mouseleave", () => {
        items.forEach((other) => {
          other.classList.remove(
            "is-active"
          );
        });
      });

      item.addEventListener("focusin", () => {
        items.forEach((other) => {
          other.classList.toggle(
            "is-active",
            other === item
          );
        });
      });

      item.addEventListener("focusout", () => {
        items.forEach((other) => {
          other.classList.remove(
            "is-active"
          );
        });
      });
    });
  }

  /* ---------------------------------------------------------
     MAGNETIC INTERACTIONS
     --------------------------------------------------------- */

  function initMagnetic() {
    if (state.reducedMotion) return;

    const elements = qsa(
      "[data-magnetic], .magnetic"
    );

    elements.forEach((element) => {
      element.addEventListener(
        "pointermove",
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
            Number(
              element.dataset.magneticStrength || 0.16
            );

          element.style.transform =
            `translate3d(${x * strength}px, ${y * strength}px, 0)`;
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

  /* ---------------------------------------------------------
     CUSTOM CURSOR
     --------------------------------------------------------- */

  function initCursor() {
    if (
      state.reducedMotion ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    if (qs(".cp-cursor")) return;

    const cursor =
      document.createElement("div");

    cursor.className = "cp-cursor";
    cursor.setAttribute(
      "aria-hidden",
      "true"
    );

    cursor.innerHTML = `
      <span class="cp-cursor-dot"></span>
      <span class="cp-cursor-ring"></span>
    `;

    body.appendChild(cursor);

    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener(
      "pointermove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      },
      { passive: true }
    );

    const render = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;

      cursor.style.transform =
        `translate3d(${x}px, ${y}px, 0)`;

      window.requestAnimationFrame(render);
    };

    render();

    qsa(
      "a, button, [role='button']"
    ).forEach((element) => {
      element.addEventListener(
        "mouseenter",
        () => {
          cursor.classList.add("is-hover");
        }
      );

      element.addEventListener(
        "mouseleave",
        () => {
          cursor.classList.remove("is-hover");
        }
      );
    });
  }

  /* ---------------------------------------------------------
     STANDBY MODE
     ---------------------------------------------------------
     REAL FULLSCREEN LOCK SCREEN.

     IMPORTANT:
     The central circle is intentionally left to CSS.
     CSS must provide the LIGHT/PAPER circle.
     The original CP logo remains untouched.
     --------------------------------------------------------- */

  function createStandby() {
    if (qs(".standby-screen")) {
      return qs(".standby-screen");
    }

    const screen =
      document.createElement("div");

    screen.className = "standby-screen";

    screen.setAttribute(
      "aria-hidden",
      "true"
    );

    screen.innerHTML = `
      <div class="standby-atmosphere" aria-hidden="true">
        <span class="standby-orbit standby-orbit-1"></span>
        <span class="standby-orbit standby-orbit-2"></span>
        <span class="standby-orbit standby-orbit-3"></span>
        <span class="standby-line standby-line-1"></span>
        <span class="standby-line standby-line-2"></span>
      </div>

      <div class="standby-center">
        <div class="standby-logo-circle">
          <img
            src="/assets/images/cp-mark.png"
            alt="Cesare Paratore — CP"
          >
        </div>

        <div class="standby-copy">
          <span class="standby-kicker">CESARE PARATORE</span>
          <strong>IN ATTESA.</strong>
          <span>MOVIMENTO / CON DIREZIONE.</span>
        </div>

        <button
          class="standby-wake"
          type="button"
        >
          <span>RIPRENDI</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    `;

    body.appendChild(screen);

    const wake =
      qs(".standby-wake", screen);

    if (wake) {
      wake.addEventListener(
        "click",
        () => wakeStandby()
      );
    }

    return screen;
  }

  function enterStandby() {
    if (
      state.reducedMotion ||
      state.standby ||
      state.menuOpen
    ) {
      return;
    }

    const screen =
      createStandby();

    if (!screen) return;

    state.standby = true;

    root.classList.add("standby-mode");
    body.classList.add("standby-active");

    screen.classList.add("is-active");
    screen.setAttribute(
      "aria-hidden",
      "false"
    );

    /*
      Lock page interaction while standby is active.
    */
    body.setAttribute(
      "data-standby-lock",
      "true"
    );
  }

  function wakeStandby() {
    const screen =
      qs(".standby-screen");

    state.standby = false;

    root.classList.remove("standby-mode");
    body.classList.remove("standby-active");
    body.removeAttribute(
      "data-standby-lock"
    );

    if (screen) {
      screen.classList.remove("is-active");
      screen.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    resetStandbyTimer();
  }

  function resetStandbyTimer() {
    if (state.reducedMotion) return;

    window.clearTimeout(
      state.idleTimer
    );

    state.idleTimer =
      window.setTimeout(
        enterStandby,
        CONFIG.standbyDelay
      );
  }

  function initStandby() {
    if (state.reducedMotion) return;

    createStandby();

    const activityEvents = [
      "pointermove",
      "pointerdown",
      "wheel",
      "touchstart",
      "keydown",
      "scroll"
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        () => {
          if (state.standby) {
            /*
              Do not wake merely because of mouse
              movement over the screen.
            */
            if (
              eventName === "pointerdown" ||
              eventName === "touchstart" ||
              eventName === "keydown"
            ) {
              wakeStandby();
            }

            return;
          }

          resetStandbyTimer();
        },
        {
          passive: true
        }
      );
    });

    resetStandbyTimer();
  }

  /* ---------------------------------------------------------
     PAGE TRANSITIONS
     --------------------------------------------------------- */

  function createPageTransition() {
    if (qs(".page-transition")) {
      return qs(".page-transition");
    }

    const transition =
      document.createElement("div");

    transition.className =
      "page-transition";

    transition.setAttribute(
      "aria-hidden",
      "true"
    );

    transition.innerHTML = `
      <div class="page-transition-line"></div>
      <div class="page-transition-mark">
        <img
          src="/assets/images/cp-mark.png"
          alt=""
        >
      </div>
    `;

    body.appendChild(transition);

    return transition;
  }

  function initPageTransitions() {
    const transition =
      createPageTransition();

    if (!transition) return;

    qsa(
      "a[href]"
    ).forEach((link) => {
      if (link.dataset.transitionBound) return;

      link.dataset.transitionBound = "true";

      if (
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.href.startsWith("mailto:") ||
        link.href.startsWith("tel:") ||
        isSamePageLink(link)
      ) {
        return;
      }

      link.addEventListener(
        "click",
        (event) => {
          if (
            state.reducedMotion ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          const href = link.href;

          if (!href) return;

          event.preventDefault();

          transition.classList.add(
            "is-leaving"
          );

          window.setTimeout(() => {
            window.location.href = href;
          }, 420);
        }
      );
    });
  }

  /* ---------------------------------------------------------
     ENTRY TRANSITION / BF CACHE
     --------------------------------------------------------- */

  function initPageEntry() {
    const transition =
      qs(".page-transition");

    if (!transition) return;

    window.requestAnimationFrame(() => {
      transition.classList.add(
        "is-entered"
      );
    });

    window.addEventListener(
      "pageshow",
      () => {
        transition.classList.remove(
          "is-leaving"
        );

        transition.classList.add(
          "is-entered"
        );
      }
    );
  }

  /* ---------------------------------------------------------
     HASH ENTRY
     --------------------------------------------------------- */

  function initInitialHash() {
    const hash =
      window.location.hash;

    if (!hash || hash === "#") return;

    const target =
      document.getElementById(
        hash.slice(1)
      );

    if (!target) return;

    window.setTimeout(() => {
      scrollToTarget(target);
    }, 700);
  }

  /* ---------------------------------------------------------
     VISIBILITY
     --------------------------------------------------------- */

  function initVisibilityHandling() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.visibilityState === "hidden"
        ) {
          window.clearTimeout(
            state.idleTimer
          );
        } else if (
          !state.standby
        ) {
          resetStandbyTimer();
        }
      }
    );
  }

  /* ---------------------------------------------------------
     RESIZE
     --------------------------------------------------------- */

  function initResize() {
    let timeout;

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(timeout);

        timeout = window.setTimeout(() => {
          document.body.style.setProperty(
            "--viewport-width",
            `${window.innerWidth}px`
          );

          document.body.style.setProperty(
            "--viewport-height",
            `${window.innerHeight}px`
          );
        }, 120);
      },
      { passive: true }
    );

    document.body.style.setProperty(
      "--viewport-width",
      `${window.innerWidth}px`
    );

    document.body.style.setProperty(
      "--viewport-height",
      `${window.innerHeight}px`
    );
  }

  /* ---------------------------------------------------------
     REDUCED MOTION
     --------------------------------------------------------- */

  function initReducedMotionWatcher() {
    const media =
      window.matchMedia(
        CONFIG.reducedMotionQuery
      );

    const update = () => {
      state.reducedMotion =
        media.matches;

      root.classList.toggle(
        "reduced-motion",
        state.reducedMotion
      );

      if (state.reducedMotion) {
        window.clearTimeout(
          state.idleTimer
        );

        if (state.standby) {
          wakeStandby();
        }
      } else {
        resetStandbyTimer();
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener(
        "change",
        update
      );
    } else if (
      typeof media.addListener === "function"
    ) {
      media.addListener(update);
    }

    update();
  }

  /* ---------------------------------------------------------
     EXPERIENCE READY
     --------------------------------------------------------- */

  function markExperienceReady() {
    window.requestAnimationFrame(() => {
      root.classList.add(
        "experience-ready"
      );

      body.classList.add(
        "experience-ready"
      );
    });
  }

  /* ---------------------------------------------------------
     DEBUG API
     --------------------------------------------------------- */

  function initDebugAPI() {
    window.CP = {
      version: "17.09.2026",
      get currentSection() {
        return state.currentSection + 1;
      },
      get standby() {
        return state.standby;
      },
      get menuOpen() {
        return state.menuOpen;
      },
      wakeStandby,
      enterStandby,
      scrollToSection(id) {
        const target =
          document.getElementById(id);

        if (target) {
          scrollToTarget(target);
        }
      }
    };
  }

  /* ---------------------------------------------------------
     INITIALIZATION
     --------------------------------------------------------- */

  function init() {
    if (state.initialized) return;

    state.initialized = true;

    initHeader();
    initScrollProgress();
    initSectionIndex();
    initReveal();
    initHeroAtmosphere();
    initVisualFields();

    initMenu();
    initAnchorNavigation();
    initMobileNavigation();
    initKeyboardNavigation();

    initDirectionInteractions();
    initMagnetic();
    initCursor();

    initStandby();

    initPageTransitions();
    initPageEntry();

    initInitialHash();
    initVisibilityHandling();
    initResize();
    initReducedMotionWatcher();

    initDebugAPI();
    markExperienceReady();
  }

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */

  initLoader();

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

  /*
    Final emergency protection:
    if another script or browser edge-case throws before
    the normal boot completes, the page still becomes usable.
  */
  window.setTimeout(() => {
    root.classList.add("page-ready");
    body.classList.add("page-ready");

    const loader = qs("#page-loader");

    if (loader && !state.loaderHidden) {
      hideLoader(true);
    }
  }, CONFIG.loaderMaxWait + 250);

})();
