(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE — MOVIMENTO / CON DIREZIONE.
     EXPERIENCE ENGINE
     17.09.2026
     ========================================================= */

  const root = document.documentElement;
  const body = document.body;

  const CONFIG = {
    standbyDelay: 30000,
    standbyFade: 900,
    scrollEase: 0.12,
    parallaxStrength: 0.018,
    magneticStrength: 0.18,
    cursorEnabled: true,
    pageTransitionDuration: 700
  };

  const state = {
    loaded: false,
    menuOpen: false,
    standby: false,
    reducedMotion: false,
    lastScrollY: window.scrollY,
    ticking: false,
    standbyTimer: null,
    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,
    targetCursorX: window.innerWidth / 2,
    targetCursorY: window.innerHeight / 2
  };

  /* =========================================================
     UTILITIES
     ========================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (a, b, amount) =>
    a + (b - a) * amount;

  const isReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     ROOT STATE
     ========================================================= */

  root.classList.add("js");

  state.reducedMotion = isReducedMotion();

  if (state.reducedMotion) {
    root.classList.add("reduced-motion");
  }

  /* =========================================================
     LOADER
     ========================================================= */

  const loader = $(".site-loader");

  const hideLoader = () => {
    if (!loader || state.loaded) return;

    state.loaded = true;
    loader.classList.add("is-hidden");
    root.classList.add("is-ready");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 1000);
  };

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 500);
  }, { once: true });

  /* fail-safe */
  window.setTimeout(hideLoader, 3800);

  /* =========================================================
     HEADER — AUTO HIDE / REVEAL
     ========================================================= */

  const header = $(".site-header");

  const updateHeader = () => {
    if (!header || state.menuOpen || state.standby) return;

    const currentY = window.scrollY;
    const delta = currentY - state.lastScrollY;

    if (currentY <= 40) {
      header.classList.remove("is-hidden");
    } else if (delta > 7) {
      header.classList.add("is-hidden");
    } else if (delta < -7) {
      header.classList.remove("is-hidden");
    }

    state.lastScrollY = currentY;
  };

  /* =========================================================
     SCROLL PROGRESS
     ========================================================= */

  const progress = $(".scroll-progress");

  const updateProgress = () => {
    if (!progress) return;

    const max =
      document.documentElement.scrollHeight - window.innerHeight;

    const value = max > 0
      ? clamp(window.scrollY / max, 0, 1)
      : 0;

    progress.style.setProperty("--progress", value.toFixed(4));
  };

  /* =========================================================
     SECTION INDEX
     ========================================================= */

  const sections = $$("main > section[data-section]");

  const sectionIndex = $("#section-index");
  const sectionCurrent = sectionIndex
    ? $("#section-current", sectionIndex)
    : null;

  const sectionTotal = sectionIndex
    ? $("#section-total", sectionIndex)
    : null;

  if (sectionTotal) {
    sectionTotal.textContent =
      String(sections.length || 10).padStart(2, "0");
  }

  const updateSectionIndex = (section) => {
    if (!section || !sectionCurrent) return;

    const number =
      section.dataset.section ||
      section.querySelector(".section-number")?.textContent ||
      "01";

    sectionCurrent.textContent =
      String(number).padStart(2, "0");
  };

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateSectionIndex(entry.target);

            sections.forEach(section => {
              section.classList.remove("is-current");
            });

            entry.target.classList.add("is-current");
          }
        });
      },
      {
        threshold: 0.42,
        rootMargin: "-8% 0px -8% 0px"
      }
    );

    sections.forEach(section =>
      sectionObserver.observe(section)
    );
  }

  /* =========================================================
     REVEAL SYSTEM
     ========================================================= */

  const revealElements = $$("[data-reveal]");

  if (!state.reducedMotion) {
    root.classList.add("reveal-ready");

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      revealElements.forEach(element =>
        revealObserver.observe(element)
      );
    } else {
      revealElements.forEach(element =>
        element.classList.add("is-visible")
      );
    }
  } else {
    revealElements.forEach(element =>
      element.classList.add("is-visible")
    );
  }

  /* =========================================================
     HERO — CONTROLLED PARALLAX
     ========================================================= */

  const hero = $("#inizio");
  const heroVisual = hero
    ? $(".hero-visual", hero)
    : null;

  let heroX = 0;
  let heroY = 0;
  let targetHeroX = 0;
  let targetHeroY = 0;

  if (hero && heroVisual && !state.reducedMotion) {
    hero.addEventListener("pointermove", event => {
      const rect = hero.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      targetHeroX = x * 22;
      targetHeroY = y * 16;
    });

    hero.addEventListener("pointerleave", () => {
      targetHeroX = 0;
      targetHeroY = 0;
    });

    const animateHero = () => {
      heroX = lerp(heroX, targetHeroX, 0.06);
      heroY = lerp(heroY, targetHeroY, 0.06);

      heroVisual.style.transform =
        `translate3d(${heroX}px, ${heroY}px, 0)`;

      requestAnimationFrame(animateHero);
    };

    requestAnimationFrame(animateHero);
  }

  /* =========================================================
     SCROLL-BASED ATMOSPHERE
     ========================================================= */

  const visualFields = $$(".visual-field");

  const updateVisualFields = () => {
    if (state.reducedMotion || !visualFields.length) return;

    const viewportCenter = window.innerHeight * 0.5;

    visualFields.forEach(field => {
      const rect = field.getBoundingClientRect();

      const center =
        rect.top + rect.height * 0.5;

      const distance =
        (center - viewportCenter) / window.innerHeight;

      const amount = clamp(distance, -1, 1);

      field.style.setProperty(
        "--field-progress",
        (1 - Math.abs(amount)).toFixed(3)
      );

      field.style.setProperty(
        "--field-y",
        `${amount * -18}px`
      );
    });
  };

  /* =========================================================
     NAVIGATION MENU
     ========================================================= */

  const menuToggle = $("#menu-toggle");
  const menu = $("#site-menu");
  const menuBackdrop = $(".menu-backdrop", menu || undefined);
  const menuPanel = $(".menu-panel", menu || undefined);
  const menuLinks = $$(".menu-link", menu || undefined);

  const setMenu = open => {
    if (!menu || !menuToggle) return;

    state.menuOpen = open;

    menu.classList.toggle("is-open", open);
    body.classList.toggle("menu-open", open);

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    root.classList.toggle(
      "menu-is-open",
      open
    );

    if (open) {
      const firstLink = menuLinks[0];

      window.setTimeout(() => {
        firstLink?.focus();
      }, 120);
    } else {
      menuToggle.focus();
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenu(!state.menuOpen);
  });

  menuBackdrop?.addEventListener("click", () => {
    setMenu(false);
  });

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      setMenu(false);
    });
  });

  /* =========================================================
     MENU KEYBOARD TRAP
     ========================================================= */

  document.addEventListener("keydown", event => {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
      return;
    }

    if (event.key !== "Tab" || !menu) return;

    const focusable = $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      menu
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
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

  /* =========================================================
     SAME-PAGE NAVIGATION
     ========================================================= */

  const navigationLinks = $$(
    'a[href^="#"]:not([href="#"])'
  );

  const goToSection = target => {
    if (!target) return;

    const headerOffset =
      header?.getBoundingClientRect().height || 0;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      Math.max(headerOffset * 0.25, 20);

    if (state.reducedMotion) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({
        top,
        behavior: "smooth"
      });
    }
  };

  navigationLinks.forEach(link => {
    link.addEventListener("click", event => {
      const hash = link.getAttribute("href");

      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);

      if (!target) return;

      event.preventDefault();

      if (state.menuOpen) {
        setMenu(false);
      }

      goToSection(target);

      history.pushState(
        null,
        "",
        hash
      );
    });
  });

  /* =========================================================
     MOBILE SECTION NAVIGATION
     ========================================================= */

  const createMobileNavigation = () => {
    if (
      document.querySelector(".mobile-section-nav") ||
      sections.length < 2
    ) {
      return;
    }

    const nav = document.createElement("nav");

    nav.className = "mobile-section-nav";
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
        <span class="mobile-section-label">
          L'INIZIO
        </span>
        <span class="mobile-section-icon" aria-hidden="true">
          +
        </span>
      </button>

      <div
        class="mobile-section-list"
        id="mobile-section-list"
        hidden
      ></div>
    `;

    const list = $(".mobile-section-list", nav);

    sections.forEach(section => {
      const id = section.id;
      const number =
        String(section.dataset.section || "").padStart(2, "0");

      const title =
        section.dataset.title ||
        section.querySelector("h2")?.textContent?.trim() ||
        section.querySelector("h1")?.textContent?.trim() ||
        `SEZIONE ${number}`;

      if (!id) return;

      const item = document.createElement("a");

      item.href = `#${id}`;
      item.className = "mobile-section-link";
      item.dataset.section = number;

      item.innerHTML = `
        <span>${number}</span>
        <strong>${title}</strong>
      `;

      list.appendChild(item);
    });

    body.appendChild(nav);

    const trigger =
      $(".mobile-section-trigger", nav);

    const current =
      $(".mobile-section-current", nav);

    const label =
      $(".mobile-section-label", nav);

    const toggle = open => {
      trigger.setAttribute(
        "aria-expanded",
        String(open)
      );

      nav.classList.toggle("is-open", open);

      if (open) {
        list.hidden = false;
      } else {
        window.setTimeout(() => {
          if (!nav.classList.contains("is-open")) {
            list.hidden = true;
          }
        }, 350);
      }
    };

    trigger.addEventListener("click", () => {
      toggle(
        trigger.getAttribute("aria-expanded") !== "true"
      );
    });

    $$(".mobile-section-link", nav).forEach(link => {
      link.addEventListener("click", () => {
        toggle(false);
      });
    });

    window.CP = window.CP || {};
    window.CP.mobileNavigation = {
      nav,
      current,
      label
    };
  };

  createMobileNavigation();

  /* =========================================================
     UPDATE MOBILE NAV CURRENT SECTION
     ========================================================= */

  const updateMobileNavigation = section => {
    const api = window.CP?.mobileNavigation;

    if (!api || !section) return;

    const number =
      String(section.dataset.section || "01")
        .padStart(2, "0");

    const title =
      section.dataset.title ||
      section.querySelector("h2")?.textContent?.trim() ||
      section.querySelector("h1")?.textContent?.trim() ||
      "";

    api.current.textContent = number;
    api.label.textContent = title;

    $$(".mobile-section-link", api.nav).forEach(link => {
      link.classList.toggle(
        "is-active",
        link.dataset.section === number
      );
    });
  };

  if ("IntersectionObserver" in window) {
    const mobileObserver =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              updateMobileNavigation(entry.target);
            }
          });
        },
        {
          threshold: 0.35
        }
      );

    sections.forEach(section =>
      mobileObserver.observe(section)
    );
  }

  /* =========================================================
     DIRECTION ITEMS — INTERACTION SYSTEM
     ========================================================= */

  const directionItems =
    $$(".direction-item");

  directionItems.forEach((item, index) => {
    item.dataset.directionIndex =
      String(index + 1).padStart(2, "0");

    item.addEventListener("pointerenter", () => {
      directionItems.forEach(other => {
        other.classList.remove("is-active");
      });

      item.classList.add("is-active");
    });

    item.addEventListener("pointerleave", () => {
      item.classList.remove("is-active");
    });
  });

  /* =========================================================
     MAGNETIC INTERACTIONS
     ========================================================= */

  const magneticElements =
    $$("[data-magnetic]");

  if (!state.reducedMotion) {
    magneticElements.forEach(element => {
      let tx = 0;
      let ty = 0;
      let targetX = 0;
      let targetY = 0;

      const strength =
        Number(element.dataset.magnetic) ||
        CONFIG.magneticStrength;

      const animate = () => {
        tx = lerp(tx, targetX, 0.12);
        ty = lerp(ty, targetY, 0.12);

        element.style.transform =
          `translate3d(${tx}px, ${ty}px, 0)`;

        requestAnimationFrame(animate);
      };

      element.addEventListener("pointermove", event => {
        const rect =
          element.getBoundingClientRect();

        const x =
          event.clientX -
          (rect.left + rect.width / 2);

        const y =
          event.clientY -
          (rect.top + rect.height / 2);

        targetX = x * strength;
        targetY = y * strength;
      });

      element.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
      });

      requestAnimationFrame(animate);
    });
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */

  let cursor;
  let cursorDot;

  const createCursor = () => {
    if (
      !CONFIG.cursorEnabled ||
      state.reducedMotion ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    cursor = document.createElement("div");
    cursor.className = "cp-cursor";
    cursor.setAttribute("aria-hidden", "true");

    cursorDot = document.createElement("div");
    cursorDot.className = "cp-cursor-dot";
    cursorDot.setAttribute("aria-hidden", "true");

    body.appendChild(cursor);
    body.appendChild(cursorDot);

    document.addEventListener("pointermove", event => {
      state.targetCursorX = event.clientX;
      state.targetCursorY = event.clientY;
    });

    const animateCursor = () => {
      state.cursorX =
        lerp(
          state.cursorX,
          state.targetCursorX,
          0.18
        );

      state.cursorY =
        lerp(
          state.cursorY,
          state.targetCursorY,
          0.18
        );

      cursor.style.transform =
        `translate3d(${state.cursorX}px, ${state.cursorY}px, 0)`;

      cursorDot.style.transform =
        `translate3d(${state.targetCursorX}px, ${state.targetCursorY}px, 0)`;

      requestAnimationFrame(animateCursor);
    };

    requestAnimationFrame(animateCursor);

    $$(
      "a, button, [data-magnetic]"
    ).forEach(element => {
      element.addEventListener("pointerenter", () => {
        cursor.classList.add("is-hovering");
      });

      element.addEventListener("pointerleave", () => {
        cursor.classList.remove("is-hovering");
      });
    });
  };

  createCursor();

  /* =========================================================
     STANDBY — FULLSCREEN LOCK SCREEN
     ========================================================= */

  let standby;

  const createStandby = () => {
    if (standby || state.reducedMotion) return;

    standby = document.createElement("div");

    standby.className = "standby-screen";
    standby.setAttribute("aria-hidden", "true");

    standby.innerHTML = `
      <div class="standby-atmosphere" aria-hidden="true">
        <span class="standby-line standby-line-a"></span>
        <span class="standby-line standby-line-b"></span>
        <span class="standby-orbit standby-orbit-a"></span>
        <span class="standby-orbit standby-orbit-b"></span>
      </div>

      <div class="standby-lock">
        <div class="standby-logo">
          <img
            src="/assets/images/cp-mark.png"
            alt=""
          />
        </div>

        <div class="standby-copy">
          <span class="standby-kicker">
            MOVIMENTO / CON DIREZIONE.
          </span>

          <strong>
            IN ATTESA.
          </strong>

          <span>
            Muoviti per continuare.
          </span>
        </div>

        <button
          class="standby-wake"
          type="button"
        >
          RIPRENDI
        </button>
      </div>
    `;

    body.appendChild(standby);

    const wakeButton =
      $(".standby-wake", standby);

    wakeButton?.addEventListener(
      "click",
      wakeFromStandby
    );
  };

  const enterStandby = () => {
    if (
      !standby ||
      state.standby ||
      state.menuOpen ||
      document.hidden
    ) {
      return;
    }

    state.standby = true;

    standby.classList.add("is-active");
    standby.setAttribute(
      "aria-hidden",
      "false"
    );

    body.classList.add("standby-active");
    root.classList.add("standby-mode");

    window.setTimeout(() => {
      $(".standby-wake", standby)?.focus();
    }, 500);
  };

  function wakeFromStandby() {
    if (!state.standby) return;

    state.standby = false;

    standby.classList.remove("is-active");
    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove("standby-active");
    root.classList.remove("standby-mode");

    resetStandbyTimer();
  }

  const resetStandbyTimer = () => {
    if (state.reducedMotion) return;

    window.clearTimeout(state.standbyTimer);

    if (state.standby) return;

    state.standbyTimer =
      window.setTimeout(
        enterStandby,
        CONFIG.standbyDelay
      );
  };

  const activityEvents = [
    "pointermove",
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown"
  ];

  activityEvents.forEach(eventName => {
    window.addEventListener(
      eventName,
      () => {
        if (state.standby) {
          wakeFromStandby();
        } else {
          resetStandbyTimer();
        }
      },
      {
        passive:
          eventName !== "keydown"
      }
    );
  });

  createStandby();
  resetStandbyTimer();

  /* =========================================================
     PAGE TRANSITIONS
     ========================================================= */

  const createPageTransition = () => {
    if (document.querySelector(".page-transition")) {
      return document.querySelector(".page-transition");
    }

    const transition =
      document.createElement("div");

    transition.className = "page-transition";

    transition.innerHTML = `
      <div class="page-transition-inner">
        <div class="page-transition-logo">
          <img
            src="/assets/images/cp-mark.png"
            alt=""
          />
        </div>

        <span>
          MOVIMENTO / CON DIREZIONE.
        </span>
      </div>
    `;

    body.appendChild(transition);

    return transition;
  };

  const pageTransition =
    createPageTransition();

  const leavePage = url => {
    if (!pageTransition) {
      window.location.href = url;
      return;
    }

    pageTransition.classList.add(
      "is-leaving"
    );

    body.classList.add(
      "is-page-leaving"
    );

    window.setTimeout(() => {
      window.location.href = url;
    }, CONFIG.pageTransitionDuration);
  };

  $$(
    'a[href]:not([href^="#"]):not([target="_blank"]):not([href^="mailto:"]):not([href^="tel:"])'
  ).forEach(link => {
    link.addEventListener("click", event => {
      const href = link.href;

      if (!href) return;

      const current =
        window.location.origin +
        window.location.pathname;

      if (href === current) return;

      if (
        link.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      leavePage(href);
    });
  });

  /* =========================================================
     ENTRY TRANSITION
     ========================================================= */

  window.addEventListener("pageshow", () => {
    pageTransition?.classList.remove(
      "is-leaving"
    );

    body.classList.remove(
      "is-page-leaving"
    );
  });

  /* =========================================================
     KEYBOARD SECTION NAVIGATION
     ========================================================= */

  document.addEventListener("keydown", event => {
    if (
      state.menuOpen ||
      state.standby ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(
        document.activeElement?.tagName
      )
    ) {
      return;
    }

    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp"
    ) {
      return;
    }

    if (!sections.length) return;

    const currentIndex =
      sections.findIndex(section =>
        section.classList.contains("is-current")
      );

    let nextIndex =
      currentIndex < 0
        ? 0
        : currentIndex +
          (event.key === "ArrowDown" ? 1 : -1);

    nextIndex = clamp(
      nextIndex,
      0,
      sections.length - 1
    );

    event.preventDefault();

    goToSection(sections[nextIndex]);
  });

  /* =========================================================
     SCROLL LOOP
     ========================================================= */

  const onScroll = () => {
    if (state.ticking) return;

    state.ticking = true;

    requestAnimationFrame(() => {
      updateHeader();
      updateProgress();
      updateVisualFields();

      state.ticking = false;
    });
  };

  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );

  updateProgress();
  updateVisualFields();

  /* =========================================================
     HASH ENTRY
     ========================================================= */

  if (window.location.hash) {
    window.setTimeout(() => {
      const target =
        document.querySelector(
          window.location.hash
        );

      if (target) {
        goToSection(target);
      }
    }, 800);
  }

  /* =========================================================
     RESIZE
     ========================================================= */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        updateProgress();
        updateVisualFields();
      }, 120);
    },
    { passive: true }
  );

  /* =========================================================
     VISIBILITY
     ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        window.clearTimeout(
          state.standbyTimer
        );
      } else {
        resetStandbyTimer();
      }
    }
  );

  /* =========================================================
     REDUCED MOTION — LIVE UPDATE
     ========================================================= */

  const motionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const handleMotionChange = event => {
    state.reducedMotion = event.matches;

    root.classList.toggle(
      "reduced-motion",
      event.matches
    );

    if (event.matches) {
      wakeFromStandby();
      window.clearTimeout(
        state.standbyTimer
      );
    } else {
      resetStandbyTimer();
    }
  };

  motionQuery.addEventListener?.(
    "change",
    handleMotionChange
  );

  /* =========================================================
     DEBUG / PUBLIC API
     ========================================================= */

  window.CP = window.CP || {};

  Object.assign(window.CP, {
    version: "17.09.2026",
    state,
    goToSection,
    enterStandby,
    wakeFromStandby,
    setMenu
  });

  /* =========================================================
     INIT
     ========================================================= */

  requestAnimationFrame(() => {
    root.classList.add("experience-ready");
  });

})();
