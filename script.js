(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1200,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260
  };

  const root = document.documentElement;
  const body = document.body;

  const header = document.querySelector(".site-header");
  const loader = document.querySelector("#site-loader");
  const standby = document.querySelector("#standby");

  const menu = document.querySelector("#menu");
  const menuToggle = document.querySelector("#menu-toggle");
  const menuLinks = [...document.querySelectorAll("#menu a")];

  const main = document.querySelector("#main-content");
  const footer = document.querySelector(".site-footer");

  const sections = [...document.querySelectorAll(".story")];

  const activeTitle = document.querySelector("#active-story-title");
  const storyNav = document.querySelector("#story-nav");
  const progress = document.querySelector(".story-progress");
  const progressFill = document.querySelector(".story-progress-fill");
  const progressOrb = document.querySelector(".story-progress-orb");

  const previousButton = document.querySelector("#story-prev");
  const nextButton = document.querySelector("#story-next");

  const currentYear = document.querySelector("#current-year");

  let activeIndex = 0;
  let ticking = false;
  let standbyTimer = 0;
  let menuOpen = false;
  let lastFocusedElement = null;
  let menuAnimation = null;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  /* ---------------------------------------------
     UTILITIES
  --------------------------------------------- */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const getHeaderHeight = () =>
    header?.getBoundingClientRect().height || 0;

  const getSectionLine = () =>
    getHeaderHeight() +
    Math.min(
      window.innerHeight * CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );

  const getFocusable = (container) =>
    [...container.querySelectorAll(focusableSelector)]
      .filter((element) => {
        const style = window.getComputedStyle(element);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      });

  const setInert = (element, value) => {
    if (!element) return;

    element.inert = value;

    if (value) {
      element.setAttribute("aria-hidden", "true");
    } else {
      element.removeAttribute("aria-hidden");
    }
  };

  /* ---------------------------------------------
     YEAR
  --------------------------------------------- */

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------
     MENU
  --------------------------------------------- */

  const getMenuFocusable = () => getFocusable(menu);

  const setMenuState = (open, { restoreFocus = true } = {}) => {
    if (!menu || !menuToggle) return;

    menuOpen = open;

    if (open) {
      lastFocusedElement = document.activeElement;

      body.classList.add("menu-is-open");

      menu.inert = false;
      menu.removeAttribute("aria-hidden");

      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Chiudi menu");

      if (main) setInert(main, true);
      if (footer) setInert(footer, true);
      if (storyNav) setInert(storyNav, true);

      /*
       * Il brand non deve diventare un punto di fuga
       * durante il focus trap del menu.
       */
      const brand = document.querySelector(".brand");
      if (brand) brand.setAttribute("tabindex", "-1");

      requestAnimationFrame(() => {
        const focusables = getMenuFocusable();
        (focusables[0] || menuToggle).focus();
      });
    } else {
      body.classList.remove("menu-is-open");

      menu.inert = true;
      menu.setAttribute("aria-hidden", "true");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri menu");

      if (main) setInert(main, false);
      if (footer) setInert(footer, false);
      if (storyNav) setInert(storyNav, false);

      const brand = document.querySelector(".brand");
      if (brand) brand.removeAttribute("tabindex");

      if (
        restoreFocus &&
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
      ) {
        lastFocusedElement.focus();
      }
    }
  };

  const closeMenu = () => {
    if (menuOpen) {
      setMenuState(false);
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenuState(!menuOpen);
  });

  menu?.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = [
      menuToggle,
      ...getMenuFocusable()
    ].filter(Boolean);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------------------------------------------
     STORY NAVIGATION
  --------------------------------------------- */

  const updateTheme = (section) => {
    if (!header || !section) return;

    const isLight =
      section.classList.contains("story-light") ||
      section.classList.contains("story-place") ||
      section.classList.contains("story-person") ||
      section.classList.contains("story-contact");

    header.dataset.theme = isLight ? "light" : "dark";

    const themeColor = isLight ? "#F1EFE8" : "#0B0B0A";
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    if (themeMeta) {
      themeMeta.setAttribute("content", themeColor);
    }
  };

  const setActiveSection = (index, force = false) => {
    if (!sections.length) return;

    const nextIndex = clamp(index, 0, sections.length - 1);

    if (!force && nextIndex === activeIndex) {
      updateProgress();
      return;
    }

    activeIndex = nextIndex;

    const section = sections[activeIndex];
    const title = section.dataset.title || "";

    sections.forEach((item, itemIndex) => {
      item.dataset.active = itemIndex === activeIndex
        ? "true"
        : "false";
    });

    if (activeTitle) {
      activeTitle.textContent = title;
    }

    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === sections.length - 1;

    previousButton.setAttribute(
      "aria-label",
      activeIndex > 0
        ? `Vai a ${sections[activeIndex - 1].dataset.title || "sezione precedente"}`
        : "Sezione precedente"
    );

    nextButton.setAttribute(
      "aria-label",
      activeIndex < sections.length - 1
        ? `Vai a ${sections[activeIndex + 1].dataset.title || "sezione successiva"}`
        : "Sezione successiva"
    );

    updateTheme(section);
    updateProgress();
  };

  const updateProgress = () => {
    if (!sections.length || !progress || !progressFill || !progressOrb) {
      return;
    }

    const section = sections[activeIndex];

    if (!section) return;

    const rect = section.getBoundingClientRect();
    const height = Math.max(section.offsetHeight, 1);

    const line = getSectionLine();

    /*
     * Progressione continua dentro la sezione:
     * 0% quando la linea entra nella sezione,
     * 100% quando la linea raggiunge la fine.
     */
    const localProgress = clamp(
      (line - rect.top) / height,
      0,
      1
    );

    const globalProgress =
      (activeIndex + localProgress) /
      Math.max(sections.length - 1, 1);

    const percent = clamp(globalProgress * 100, 0, 100);

    progressFill.style.width = `${percent}%`;
    progressOrb.style.left = `${percent}%`;

    progress.setAttribute(
      "aria-valuenow",
      String(Math.round(percent))
    );
  };

  const getActiveIndexFromViewport = () => {
    const line = getSectionLine();

    let bestIndex = 0;
    let bestDistance = Infinity;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      const distance =
        rect.top <= line && rect.bottom >= line
          ? 0
          : Math.min(
              Math.abs(rect.top - line),
              Math.abs(rect.bottom - line)
            );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const updateScrollState = () => {
    ticking = false;

    const nextIndex = getActiveIndexFromViewport();

    if (nextIndex !== activeIndex) {
      setActiveSection(nextIndex);
    } else {
      updateProgress();
    }
  };

  const requestScrollUpdate = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateScrollState);
  };

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollUpdate,
    { passive: true }
  );

  const scrollToSection = (index, { updateHash = true } = {}) => {
    const section = sections[clamp(index, 0, sections.length - 1)];

    if (!section) return;

    closeMenu();

    const top =
      window.scrollY +
      section.getBoundingClientRect().top -
      getHeaderHeight() -
      CONFIG.scrollOffset;

    const behavior = prefersReducedMotion.matches
      ? "auto"
      : "smooth";

    if (updateHash) {
      history.replaceState(
        null,
        "",
        `#${section.id}`
      );
    }

    window.scrollTo({
      top: Math.max(0, top),
      behavior
    });

    setActiveSection(
      sections.indexOf(section),
      true
    );
  };

  previousButton?.addEventListener("click", () => {
    if (activeIndex > 0) {
      scrollToSection(activeIndex - 1);
    }
  });

  nextButton?.addEventListener("click", () => {
    if (activeIndex < sections.length - 1) {
      scrollToSection(activeIndex + 1);
    }
  });

  /* ---------------------------------------------
     HASH / DEEP LINKS
  --------------------------------------------- */

  const handleHash = () => {
    const hash = window.location.hash.slice(1);

    if (!hash) {
      setActiveSection(
        getActiveIndexFromViewport(),
        true
      );
      return;
    }

    const target = document.getElementById(hash);

    if (!target || !target.classList.contains("story")) {
      return;
    }

    const index = sections.indexOf(target);

    if (index < 0) return;

    requestAnimationFrame(() => {
      setActiveSection(index, true);

      const top =
        window.scrollY +
        target.getBoundingClientRect().top -
        getHeaderHeight() -
        CONFIG.scrollOffset;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion.matches
          ? "auto"
          : "smooth"
      });
    });
  };

  window.addEventListener("hashchange", handleHash);
  window.addEventListener("popstate", handleHash);

  /* ---------------------------------------------
     STANDBY
  --------------------------------------------- */

  const resetStandby = () => {
    if (!standby) return;

    standby.classList.remove("is-visible");

    window.clearTimeout(standbyTimer);

    standbyTimer = window.setTimeout(() => {
      if (!menuOpen) {
        standby.classList.add("is-visible");
      }
    }, CONFIG.standbyDelay);
  };

  [
    "scroll",
    "wheel",
    "touchstart",
    "keydown",
    "click"
  ].forEach((eventName) => {
    window.addEventListener(eventName, resetStandby, {
      passive: eventName !== "keydown"
    });
  });

  /* ---------------------------------------------
     MOTION
  --------------------------------------------- */

  let gsapContext = null;

  const killMotion = () => {
    if (gsapContext) {
      gsapContext.revert();
      gsapContext = null;
    }
  };

  const initMotion = () => {
    killMotion();

    if (
      prefersReducedMotion.matches ||
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);

    gsapContext = window.gsap.context(() => {
      sections.forEach((section) => {
        const eyebrow = section.querySelector(".eyebrow");
        const heading = section.querySelector("h1, h2");
        const copy = section.querySelector(
          ".story-lead, .story-copy"
        );

        if (!heading) return;

        window.gsap.fromTo(
          [eyebrow, heading, copy].filter(Boolean),
          {
            y: 28,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: .9,
            stagger: .08,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${section.id}`,
              trigger: section,
              start: "top 72%",
              once: true
            }
          }
        );
      });

      window.gsap.fromTo(
        ".person-image",
        {
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            id: "story-person-image",
            trigger: "#eccomi",
            start: "top 72%",
            once: true
          }
        }
      );

      window.gsap.fromTo(
        ".map-frame",
        {
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            id: "story-map",
            trigger: "#qui",
            start: "top 72%",
            once: true
          }
        }
      );
    }, document);
  };

  prefersReducedMotion.addEventListener?.(
    "change",
    initMotion
  );

  /* ---------------------------------------------
     IMAGE FALLBACK
  --------------------------------------------- */

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("is-broken");
      },
      { once: true }
    );
  });

  /* ---------------------------------------------
     PAGE VISIBILITY / BFCache
  --------------------------------------------- */

  window.addEventListener("pageshow", () => {
    requestScrollUpdate();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      requestScrollUpdate();

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }
  });

  /* ---------------------------------------------
     LOADER
  --------------------------------------------- */

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.remove();
    }, 650);
  };

  const startLoader = () => {
    if (!loader) return;

    const maxTimer = window.setTimeout(
      hideLoader,
      CONFIG.loaderMax
    );

    window.addEventListener(
      "load",
      () => {
        window.clearTimeout(maxTimer);

        window.setTimeout(
          hideLoader,
          prefersReducedMotion.matches ? 0 : 120
        );
      },
      { once: true }
    );
  };

  /* ---------------------------------------------
     INIT
  --------------------------------------------- */

  menu?.setAttribute("inert", "");
  menu?.setAttribute("aria-hidden", "true");

  setActiveSection(
    getActiveIndexFromViewport(),
    true
  );

  initMotion();
  startLoader();
  resetStandby();

  if (window.location.hash) {
    handleHash();
  }

  requestAnimationFrame(() => {
    updateProgress();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  });
})();
