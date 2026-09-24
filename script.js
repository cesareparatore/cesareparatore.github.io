(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1200,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    progressEpsilon: 0.001
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const html = document.documentElement;
  const body = document.body;

  const header = document.getElementById("site-header");
  const main = document.getElementById("main-content");
  const footer = document.querySelector(".site-footer");

  const loader = document.getElementById("site-loader");
  const standby = document.getElementById("standby");

  const menu = document.getElementById("menu");
  const menuToggle = document.getElementById("menu-toggle");
  const brand = document.querySelector(".brand");

  const menuLinks = Array.from(
    document.querySelectorAll("[data-menu-target]")
  );

  const storyNav = document.getElementById("story-nav");
  const storyPrev = document.getElementById("story-prev");
  const storyNext = document.getElementById("story-next");

  const storyProgress = document.getElementById("story-progress");
  const progressFill = document.querySelector(".story-progress-fill");
  const progressOrb = document.querySelector(".story-progress-orb");

  const activeStoryTitle = document.getElementById("active-story-title");

  const sections = Array.from(
    document.querySelectorAll(".story")
  );

  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (!sections.length) {
    return;
  }

  let activeIndex = 0;
  let ticking = false;
  let standbyTimer = null;
  let standbyPointerTimer = null;
  let isMenuOpen = false;
  let previousFocus = null;

  /*
   * -------------------------------------------------------
   * UTILITIES
   * -------------------------------------------------------
   */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const getHeaderHeight = () =>
    header ? header.getBoundingClientRect().height : 0;

  const getReadingLine = () => {
    const viewportHeight = window.innerHeight || 0;

    return (
      getHeaderHeight() +
      Math.min(
        viewportHeight * CONFIG.activeLineRatio,
        CONFIG.activeLineMax
      )
    );
  };

  const getFocusable = (container) => {
    if (!container) return [];

    return Array.from(
      container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter((element) => {
      const style = window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  };

  const getSectionIndex = (id) =>
    sections.findIndex((section) => section.id === id);

  const getSectionById = (id) =>
    sections.find((section) => section.id === id);

  const getCurrentHash = () =>
    window.location.hash.replace(/^#/, "");

  /*
   * -------------------------------------------------------
   * HEADER
   * -------------------------------------------------------
   *
   * The upper header is intentionally ALWAYS dark.
   * The active section never changes its visual theme.
   */

  const updateHeaderChrome = () => {
    if (!header) return;

    header.dataset.theme = "dark";

    const themeMeta = document.querySelector(
      'meta[name="theme-color"]'
    );

    if (themeMeta) {
      themeMeta.setAttribute("content", "#0B0B0A");
    }
  };

  /*
   * -------------------------------------------------------
   * PROGRESS
   * -------------------------------------------------------
   */

  const calculateSectionProgress = (section) => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;

    /*
     * Progress is based on the actual reading position
     * inside the current section rather than on global
     * document scroll.
     */
    const start =
      viewportHeight -
      getHeaderHeight();

    const distance =
      Math.max(
        section.offsetHeight - start,
        viewportHeight * 0.5
      );

    const traveled =
      viewportHeight - rect.top;

    return clamp(traveled / distance, 0, 1);
  };

  const updateProgress = (progress) => {
    const value = clamp(progress, 0, 1);
    const percent = value * 100;

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressOrb) {
      progressOrb.style.left = `${percent}%`;
    }

    if (storyProgress) {
      storyProgress.setAttribute(
        "aria-valuenow",
        String(Math.round(percent))
      );
    }
  };

  /*
   * -------------------------------------------------------
   * ACTIVE SECTION
   * -------------------------------------------------------
   */

  const findActiveSection = () => {
    const line = getReadingLine();

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      /*
       * Prefer the section containing the reading line.
       */
      if (
        rect.top <= line &&
        rect.bottom > line
      ) {
        bestIndex = index;
        bestDistance = 0;
        return;
      }

      const distance =
        rect.top > line
          ? rect.top - line
          : line - rect.bottom;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const updateNavigationState = (index) => {
    const section = sections[index];

    if (!section) return;

    activeIndex = index;

    const title =
      section.dataset.title ||
      section.querySelector("h1,h2")?.textContent?.trim() ||
      "";

    if (activeStoryTitle && title) {
      activeStoryTitle.textContent = title;
    }

    if (storyPrev) {
      storyPrev.disabled = index <= 0;
      storyPrev.setAttribute(
        "aria-label",
        index <= 0
          ? "Nessuna sezione precedente"
          : `Sezione precedente: ${sections[index - 1].dataset.title || ""}`
      );
    }

    if (storyNext) {
      storyNext.disabled = index >= sections.length - 1;
      storyNext.setAttribute(
        "aria-label",
        index >= sections.length - 1
          ? "Nessuna sezione successiva"
          : `Sezione successiva: ${sections[index + 1].dataset.title || ""}`
      );
    }

    sections.forEach((item, itemIndex) => {
      item.toggleAttribute(
        "data-active",
        itemIndex === index
      );
    });

    menuLinks.forEach((link) => {
      const isCurrent =
        link.dataset.menuTarget === section.id;

      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    updateHeaderChrome();
  };

  const updateActiveState = () => {
    const nextIndex = findActiveSection();

    if (nextIndex !== activeIndex) {
      updateNavigationState(nextIndex);
    }

    const activeSection = sections[activeIndex];

    if (activeSection) {
      updateProgress(
        calculateSectionProgress(activeSection)
      );
    }
  };

  const requestUpdate = () => {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updateActiveState();
      ticking = false;
    });
  };

  /*
   * -------------------------------------------------------
   * SCROLLING / HASH
   * -------------------------------------------------------
   */

  const scrollToSection = (
    section,
    {
      updateHash = true,
      behavior = null
    } = {}
  ) => {
    if (!section) return;

    const headerHeight = getHeaderHeight();

    const top =
      window.scrollY +
      section.getBoundingClientRect().top -
      headerHeight -
      CONFIG.scrollOffset;

    const scrollBehavior =
      behavior ||
      (prefersReducedMotion.matches
        ? "auto"
        : "smooth");

    window.scrollTo({
      top: Math.max(0, top),
      behavior: scrollBehavior
    });

    if (updateHash && section.id) {
      const nextUrl =
        `${window.location.pathname}` +
        `${window.location.search}` +
        `#${section.id}`;

      window.history.replaceState(
        {
          section: section.id
        },
        "",
        nextUrl
      );
    }
  };

  const goToSectionIndex = (index) => {
    const target = sections[index];

    if (!target) return;

    scrollToSection(target);
  };

  const handleHash = ({
    behavior = null
  } = {}) => {
    const hash = getCurrentHash();

    if (!hash) {
      requestUpdate();
      return;
    }

    const section = getSectionById(hash);

    if (!section) return;

    const index = getSectionIndex(hash);

    if (index >= 0) {
      updateNavigationState(index);
    }

    window.requestAnimationFrame(() => {
      scrollToSection(section, {
        updateHash: false,
        behavior
      });

      window.setTimeout(requestUpdate, 60);
    });
  };

  /*
   * -------------------------------------------------------
   * MENU / FOCUS MANAGEMENT
   * -------------------------------------------------------
   */

  const setBackgroundInert = (state) => {
    [
      main,
      footer,
      storyNav
    ].forEach((element) => {
      if (!element) return;

      element.inert = state;

      if (state) {
        element.setAttribute("aria-hidden", "true");
      } else {
        element.removeAttribute("aria-hidden");
      }
    });

    /*
     * The brand lives inside the header, outside storyNav,
     * so it must be handled separately.
     */
    if (brand) {
      if (state) {
        brand.setAttribute("tabindex", "-1");
        brand.setAttribute("aria-hidden", "true");
      } else {
        brand.removeAttribute("tabindex");
        brand.removeAttribute("aria-hidden");
      }
    }
  };

  const setMenuTabState = (disabled) => {
    menuLinks.forEach((link) => {
      if (disabled) {
        link.setAttribute("tabindex", "-1");
      } else {
        link.removeAttribute("tabindex");
      }
    });
  };

  const focusMenuStart = () => {
    const focusables = getFocusable(menu);

    if (focusables.length) {
      focusables[0].focus();
    }
  };

  const closeMenu = ({
    restoreFocus = true
  } = {}) => {
    if (!menu || !menuToggle) return;

    isMenuOpen = false;

    body.classList.remove("menu-open");

    menu.classList.remove("is-open");

    menu.setAttribute("inert", "");
    menu.inert = true;

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Apri menu"
    );

    setMenuTabState(true);
    setBackgroundInert(false);

    if (
      restoreFocus &&
      previousFocus &&
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus();
    }

    previousFocus = null;
  };

  const openMenu = () => {
    if (!menu || !menuToggle || isMenuOpen) {
      return;
    }

    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuToggle;

    isMenuOpen = true;

    body.classList.add("menu-open");

    setBackgroundInert(true);

    menu.removeAttribute("inert");
    menu.inert = false;

    setMenuTabState(false);

    menu.classList.add("is-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    window.requestAnimationFrame(() => {
      focusMenuStart();
    });
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleMenuKeydown = (event) => {
    if (!isMenuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = getFocusable(menu);

    if (!focusables.length) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

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
  };

  /*
   * -------------------------------------------------------
   * STANDBY
   * -------------------------------------------------------
   */

  const hideStandby = () => {
    if (!standby) return;

    standby.classList.remove("is-visible");
  };

  const showStandby = () => {
    if (!standby || isMenuOpen) return;

    standby.classList.add("is-visible");
  };

  const resetStandby = () => {
    hideStandby();

    window.clearTimeout(standbyTimer);

    standbyTimer = window.setTimeout(
      showStandby,
      CONFIG.standbyDelay
    );
  };

  const handlePointerMove = () => {
    if (standbyPointerTimer) return;

    standbyPointerTimer = window.setTimeout(() => {
      standbyPointerTimer = null;
      resetStandby();
    }, 700);
  };

  /*
   * -------------------------------------------------------
   * GSAP MOTION
   * -------------------------------------------------------
   */

  const initAnimations = () => {
    if (
      prefersReducedMotion.matches ||
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      return;
    }

    window.gsap.registerPlugin(
      window.ScrollTrigger
    );

    sections.forEach((section, index) => {
      const kicker =
        section.querySelector(".story-kicker");

      const heading =
        section.querySelector("h1, h2");

      const lead =
        section.querySelector(".story-lead");

      const copy =
        section.querySelector(".story-copy");

      const image =
        section.querySelector(".person-image");

      const targets = [
        kicker,
        heading,
        lead,
        copy,
        image
      ].filter(Boolean);

      if (!targets.length) return;

      window.gsap.set(targets, {
        opacity: 0,
        y: 24
      });

      window.gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: "power3.out",

        scrollTrigger: {
          id: `story-${index}`,
          trigger: section,
          start: "top 72%",
          once: true
        }
      });
    });
  };

  /*
   * -------------------------------------------------------
   * REFRESH / LIFECYCLE
   * -------------------------------------------------------
   */

  const refresh = () => {
    requestUpdate();

    if (
      window.ScrollTrigger &&
      typeof window.ScrollTrigger.refresh === "function"
    ) {
      window.ScrollTrigger.refresh();
    }
  };

  const killAnimations = () => {
    if (!window.ScrollTrigger) return;

    window.ScrollTrigger.getAll()
      .filter((trigger) =>
        String(trigger.vars?.id || "").startsWith("story-")
      )
      .forEach((trigger) => trigger.kill());
  };

  /*
   * -------------------------------------------------------
   * LOADER
   * -------------------------------------------------------
   */

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.remove();
    }, 700);
  };

  const initLoader = () => {
    if (!loader) return;

    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;

      window.setTimeout(
        hideLoader,
        prefersReducedMotion.matches ? 0 : 140
      );
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener(
        "load",
        finish,
        {
          once: true
        }
      );
    }

    window.setTimeout(
      finish,
      CONFIG.loaderMax
    );
  };

  /*
   * -------------------------------------------------------
   * EVENTS
   * -------------------------------------------------------
   */

  menuToggle?.addEventListener(
    "click",
    toggleMenu
  );

  menu?.addEventListener(
    "keydown",
    handleMenuKeydown
  );

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu({
        restoreFocus: false
      });
    });
  });

  storyPrev?.addEventListener(
    "click",
    () => {
      if (activeIndex > 0) {
        goToSectionIndex(activeIndex - 1);
      }
    }
  );

  storyNext?.addEventListener(
    "click",
    () => {
      if (activeIndex < sections.length - 1) {
        goToSectionIndex(activeIndex + 1);
      }
    }
  );

  window.addEventListener(
    "scroll",
    () => {
      requestUpdate();
      resetStandby();
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "wheel",
    resetStandby,
    {
      passive: true
    }
  );

  window.addEventListener(
    "touchstart",
    resetStandby,
    {
      passive: true
    }
  );

  window.addEventListener(
    "pointermove",
    handlePointerMove,
    {
      passive: true
    }
  );

  window.addEventListener(
    "click",
    resetStandby,
    {
      passive: true
    }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      resetStandby();

      if (event.key === "Escape") {
        hideStandby();

        if (isMenuOpen) {
          closeMenu();
        }

        return;
      }

      if (
        isMenuOpen ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const activeElement =
        document.activeElement;

      const isTyping =
        activeElement &&
        (
          activeElement.matches?.(
            "input, textarea, select"
          ) ||
          activeElement.isContentEditable
        );

      if (isTyping) return;

      if (
        event.key === "ArrowDown" &&
        activeIndex < sections.length - 1
      ) {
        event.preventDefault();
        goToSectionIndex(activeIndex + 1);
      }

      if (
        event.key === "ArrowUp" &&
        activeIndex > 0
      ) {
        event.preventDefault();
        goToSectionIndex(activeIndex - 1);
      }
    }
  );

  window.addEventListener(
    "hashchange",
    () => {
      handleHash();
    }
  );

  window.addEventListener(
    "popstate",
    () => {
      handleHash();
    }
  );

  window.addEventListener(
    "resize",
    () => {
      requestUpdate();
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      refresh();
    }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) {
        refresh();
      }
    }
  );

  prefersReducedMotion.addEventListener?.(
    "change",
    () => {
      killAnimations();

      if (!prefersReducedMotion.matches) {
        initAnimations();
      }

      refresh();
    }
  );

  /*
   * -------------------------------------------------------
   * INITIALIZATION
   * -------------------------------------------------------
   */

  menu?.setAttribute("inert", "");
  menu.inert = true;

  setMenuTabState(true);
  setBackgroundInert(false);

  updateHeaderChrome();

  const initialIndex = findActiveSection();

  updateNavigationState(initialIndex);
  updateProgress(
    calculateSectionProgress(
      sections[initialIndex]
    )
  );

  initLoader();
  initAnimations();
  resetStandby();

  if (getCurrentHash()) {
    handleHash({
      behavior: "auto"
    });
  }

  window.setTimeout(
    refresh,
    80
  );

})();
