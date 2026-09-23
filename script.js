(() => {
  "use strict";

  /*
   * CESARE PARATORE
   * Homepage interaction layer
   *
   * Principles:
   * - navigation must work without animation
   * - GSAP is progressive enhancement
   * - no circular section navigation
   * - menu is keyboard accessible
   * - reduced motion is respected dynamically
   * - active section is determined by a reading line
   */

  const body = document.body;
  const html = document.documentElement;

  const loader = document.getElementById("loader");
  const loaderInner = loader?.querySelector(".loader-inner");

  const standby = document.getElementById("standby");

  const menu = document.getElementById("menu");
  const menuTrigger = document.getElementById("menu-trigger");
  const menuLabel = menuTrigger?.querySelector(".menu-label");

  const main = document.getElementById("main-content");
  const footer = document.querySelector(".site-footer");

  const sectionNav = document.getElementById("section-nav");
  const sectionPrev = document.getElementById("section-prev");
  const sectionNext = document.getElementById("section-next");
  const sectionTitle = document.getElementById("section-title");

  const year = document.getElementById("current-year");

  const sections = Array.from(
    document.querySelectorAll(".story-section")
  );

  const menuLinks = menu
    ? Array.from(menu.querySelectorAll("a"))
    : [];

  const GSAP = window.gsap || null;
  const ScrollTrigger = window.ScrollTrigger || null;

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 3500,

    activeLineRatio: 0.32,
    activeLineMax: 260,

    scrollOffset: 12,

    pointerThrottle: 700
  };

  let activeIndex = 0;
  let menuOpen = false;
  let loaderHidden = false;
  let standbyVisible = false;

  let standbyTimer = null;
  let pointerActivityTimer = null;

  let previousFocusedElement = null;
  let resizeFrame = null;
  let pointerFrame = null;

  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* --------------------------------
     UTILITIES
  -------------------------------- */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const getHeaderHeight = () => {
    const header = document.querySelector(".site-header");

    return header
      ? header.getBoundingClientRect().height
      : 0;
  };

  const isVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) !== 0
    );
  };

  /* --------------------------------
     MENU ACCESSIBILITY
  -------------------------------- */

  const setMenuTabState = (disabled) => {
    menuLinks.forEach((link) => {
      if (disabled) {
        link.dataset.previousTabindex =
          link.getAttribute("tabindex") ?? "";
        link.setAttribute("tabindex", "-1");
      } else {
        const previous =
          link.dataset.previousTabindex;

        if (previous) {
          link.setAttribute("tabindex", previous);
        } else {
          link.removeAttribute("tabindex");
        }

        delete link.dataset.previousTabindex;
      }
    });
  };

  const setInert = (element, value) => {
    if (!element) return;

    if ("inert" in element) {
      element.inert = value;
    } else {
      if (value) {
        element.setAttribute("aria-hidden", "true");
      } else {
        element.removeAttribute("aria-hidden");
      }
    }
  };

  const updateMenuLabel = () => {
    if (!menuTrigger) return;

    const label = menuOpen ? "Chiudi menu" : "Apri menu";

    menuTrigger.setAttribute(
      "aria-label",
      label
    );

    if (menuLabel) {
      menuLabel.textContent = menuOpen
        ? "Chiudi"
        : "Menu";
    }
  };

  const setBackgroundInteraction = (disabled) => {
    setInert(main, disabled);
    setInert(footer, disabled);
  };

  const updateMenuState = (open, options = {}) => {
    if (!menu || !menuTrigger) return;

    menuOpen = Boolean(open);

    menu.classList.toggle(
      "is-open",
      menuOpen
    );

    body.classList.toggle(
      "menu-open",
      menuOpen
    );

    menu.setAttribute(
      "aria-hidden",
      String(!menuOpen)
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      String(menuOpen)
    );

    setMenuTabState(!menuOpen);
    setBackgroundInteraction(menuOpen);

    if (menuOpen) {
      menu.removeAttribute("inert");
    } else {
      menu.setAttribute("inert", "");
    }

    updateMenuLabel();

    if (menuOpen) {
      if (!options.skipFocus) {
        window.requestAnimationFrame(() => {
          menuLinks[0]?.focus();
        });
      }
    } else if (
      !options.skipRestoreFocus &&
      previousFocusedElement
    ) {
      window.requestAnimationFrame(() => {
        previousFocusedElement.focus?.();
      });
    }
  };

  const openMenu = () => {
    if (menuOpen) return;

    previousFocusedElement =
      document.activeElement;

    updateMenuState(true);
  };

  const closeMenu = () => {
    if (!menuOpen) return;

    updateMenuState(false);
  };

  /* --------------------------------
     FOCUS TRAP
  -------------------------------- */

  const trapFocus = (event) => {
    if (!menuOpen || event.key !== "Tab") {
      return;
    }

    const focusable = menuLinks.filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        element.getAttribute("tabindex") !== "-1"
    );

    if (!focusable.length) {
      event.preventDefault();
      menuTrigger?.focus();
      return;
    }

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
  };

  /* --------------------------------
     MENU EVENTS
  -------------------------------- */

  menuTrigger?.addEventListener(
    "click",
    () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  );

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      closeMenu();
      return;
    }

    trapFocus(event);
  });

  /* --------------------------------
     SECTION NAVIGATION
  -------------------------------- */

  const getSectionTitle = (section) => {
    const title =
      section?.querySelector(".story-title");

    return title?.textContent
      ?.trim()
      .replace(/\s+/g, " ") || "";
  };

  const updateSectionNav = () => {
    const section = sections[activeIndex];

    if (!section) return;

    const title = getSectionTitle(section);

    if (sectionTitle) {
      sectionTitle.textContent = title;
    }

    if (sectionPrev) {
      sectionPrev.disabled =
        activeIndex <= 0;
    }

    if (sectionNext) {
      sectionNext.disabled =
        activeIndex >= sections.length - 1;
    }

    const isLight =
      section.classList.contains("story-light");

    if (sectionNav) {
      sectionNav.dataset.theme =
        isLight ? "light" : "dark";
    }

    html.dataset.activeSection =
      String(activeIndex);
  };

  const getReadingLine = () => {
    const headerHeight =
      getHeaderHeight();

    const offset = Math.min(
      window.innerHeight *
        CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );

    return headerHeight + offset;
  };

  const findActiveSection = () => {
    if (!sections.length) return;

    const readingLine =
      getReadingLine();

    let containingIndex = -1;

    sections.forEach((section, index) => {
      const rect =
        section.getBoundingClientRect();

      if (
        rect.top <= readingLine &&
        rect.bottom > readingLine
      ) {
        containingIndex = index;
      }
    });

    if (containingIndex >= 0) {
      setActiveSection(containingIndex);
      return;
    }

    let closestIndex = 0;
    let closestDistance = Infinity;

    sections.forEach((section, index) => {
      const rect =
        section.getBoundingClientRect();

      const distance =
        Math.abs(rect.top - readingLine);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveSection(closestIndex);
  };

  const setActiveSection = (index) => {
    const nextIndex = clamp(
      index,
      0,
      Math.max(0, sections.length - 1)
    );

    if (nextIndex === activeIndex) {
      updateSectionNav();
      return;
    }

    activeIndex = nextIndex;

    updateSectionNav();
  };

  const getScrollTarget = (section) => {
    const rect =
      section.getBoundingClientRect();

    const currentScroll =
      window.scrollY ||
      window.pageYOffset;

    const headerOffset =
      getHeaderHeight();

    return (
      currentScroll +
      rect.top -
      headerOffset -
      CONFIG.scrollOffset
    );
  };

  const scrollToSection = (index) => {
    if (!sections[index]) return;

    const target =
      getScrollTarget(sections[index]);

    if (reducedMotion) {
      window.scrollTo({
        top: target,
        behavior: "auto"
      });
      return;
    }

    window.scrollTo({
      top: target,
      behavior: "smooth"
    });
  };

  sectionPrev?.addEventListener(
    "click",
    () => {
      if (activeIndex <= 0) return;

      scrollToSection(
        activeIndex - 1
      );
    }
  );

  sectionNext?.addEventListener(
    "click",
    () => {
      if (
        activeIndex >=
        sections.length - 1
      ) {
        return;
      }

      scrollToSection(
        activeIndex + 1
      );
    }
  );

  /* --------------------------------
     ACTIVE SECTION OBSERVER
  -------------------------------- */

  let activeObserver = null;

  const initSectionObserver = () => {
    if (activeObserver) {
      activeObserver.disconnect();
    }

    if (
      !("IntersectionObserver" in window)
    ) {
      window.addEventListener(
        "scroll",
        findActiveSection,
        { passive: true }
      );

      findActiveSection();
      return;
    }

    activeObserver =
      new IntersectionObserver(
        () => {
          findActiveSection();
        },
        {
          threshold: [
            0,
            0.15,
            0.35,
            0.6,
            0.85
          ]
        }
      );

    sections.forEach((section) => {
      activeObserver.observe(section);
    });

    findActiveSection();
  };

  /* --------------------------------
     GSAP
  -------------------------------- */

  let storyTriggers = [];

  const killStoryAnimations = () => {
    storyTriggers.forEach((trigger) => {
      try {
        trigger.kill();
      } catch {
        /* no-op */
      }
    });

    storyTriggers = [];

    if (ScrollTrigger) {
      ScrollTrigger.getAll()
        .filter(
          (trigger) =>
            trigger.vars?.id?.startsWith(
              "story-"
            )
        )
        .forEach((trigger) => {
          trigger.kill();
        });
    }
  };

  const registerTrigger = (animation) => {
    if (animation) {
      storyTriggers.push(animation);
    }
  };

  const initStoryAnimations = () => {
    if (!GSAP || !ScrollTrigger || reducedMotion) {
      return;
    }

    killStoryAnimations();

    GSAP.registerPlugin(ScrollTrigger);

    sections.forEach((section, index) => {
      const title =
        section.querySelector(".story-title");

      const bodyElements =
        section.querySelectorAll(
          ".story-body p, .story-lead"
        );

      const meta =
        section.querySelector(".story-meta");

      const frame =
        section.querySelector(
          ".place-map, .person-frame"
        );

      /*
       * Opening
       */
      if (
        section.classList.contains(
          "story-opening"
        )
      ) {
        GSAP.set(title, {
          opacity: 0,
          y: 50
        });

        GSAP.set(bodyElements, {
          opacity: 0,
          y: 24
        });

        registerTrigger(
          GSAP.to(title, {
            opacity: 1,
            y: 0,
            duration: 1.15,
            ease: "power4.out",
            scrollTrigger: {
              id: `story-${index}-title`,
              trigger: section,
              start: "top 75%",
              once: true
            }
          })
        );

        registerTrigger(
          GSAP.to(bodyElements, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            delay: 0.22,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-body`,
              trigger: section,
              start: "top 68%",
              once: true
            }
          })
        );

        return;
      }

      /*
       * Understand
       */
      if (
        section.classList.contains(
          "story-understand"
        )
      ) {
        GSAP.set(title, {
          opacity: 0,
          x: -40
        });

        GSAP.set(bodyElements, {
          opacity: 0,
          y: 25
        });

        registerTrigger(
          GSAP.to(title, {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-title`,
              trigger: section,
              start: "top 70%",
              once: true
            }
          })
        );

        registerTrigger(
          GSAP.to(bodyElements, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-body`,
              trigger: section,
              start: "top 65%",
              once: true
            }
          })
        );

        return;
      }

      /*
       * Return
       */
      if (
        section.classList.contains(
          "story-return"
        )
      ) {
        GSAP.set(title, {
          opacity: 0,
          scale: 0.94,
          y: 30
        });

        GSAP.set(bodyElements, {
          opacity: 0,
          y: 20
        });

        registerTrigger(
          GSAP.to(title, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.15,
            ease: "power4.out",
            scrollTrigger: {
              id: `story-${index}-title`,
              trigger: section,
              start: "top 70%",
              once: true
            }
          })
        );

        registerTrigger(
          GSAP.to(bodyElements, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            delay: 0.25,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-body`,
              trigger: section,
              start: "top 62%",
              once: true
            }
          })
        );

        return;
      }

      /*
       * Connect
       */
      if (
        section.classList.contains(
          "story-connect"
        )
      ) {
        GSAP.set(title, {
          opacity: 0,
          y: 30
        });

        GSAP.set(bodyElements, {
          opacity: 0,
          y: 20
        });

        registerTrigger(
          GSAP.to(title, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              id: `story-${index}-title`,
              trigger: section,
              start: "top 68%",
              once: true
            }
          })
        );

        registerTrigger(
          GSAP.to(bodyElements, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-body`,
              trigger: section,
              start: "top 60%",
              once: true
            }
          })
        );

        return;
      }

      /*
       * Today
       */
      if (
        section.classList.contains(
          "story-today"
        )
      ) {
        GSAP.set(title, {
          opacity: 0,
          y: 35
        });

        GSAP.set(bodyElements, {
          opacity: 0,
          y: 25
        });

        registerTrigger(
          GSAP.to(title, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              id: `story-${index}-title`,
              trigger: section,
              start: "top 70%",
              once: true
            }
          })
        );

        registerTrigger(
          GSAP.to(bodyElements, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            delay: 0.18,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-body`,
              trigger: section,
              start: "top 60%",
              once: true
            }
          })
        );

        return;
      }

      /*
       * Generic sections
       */
      GSAP.set(
        [meta, title],
        {
          opacity: 0,
          y: 28
        }
      );

      GSAP.set(bodyElements, {
        opacity: 0,
        y: 22
      });

      registerTrigger(
        GSAP.to([meta, title], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-header`,
            trigger: section,
            start: "top 72%",
            once: true
          }
        })
      );

      registerTrigger(
        GSAP.to(bodyElements, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-body`,
            trigger: section,
            start: "top 64%",
            once: true
          }
        })
      );

      if (frame) {
        GSAP.set(frame, {
          opacity: 0,
          y: 30
        });

        registerTrigger(
          GSAP.to(frame, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-frame`,
              trigger: section,
              start: "top 70%",
              once: true
            }
          })
        );
      }
    });

    ScrollTrigger.refresh();
  };

  /* --------------------------------
     LOADER
  -------------------------------- */

  const hideLoader = () => {
    if (loaderHidden || !loader) {
      return;
    }

    loaderHidden = true;

    if (!GSAP || reducedMotion) {
      loader.style.display = "none";
      return;
    }

    GSAP.to(loaderInner, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });

    GSAP.to(loader, {
      opacity: 0,
      duration: 0.7,
      delay: 0.15,
      ease: "power3.inOut",
      onComplete: () => {
        loader.style.display = "none";
      }
    });
  };

  const initLoader = () => {
    if (!loader) return;

    if (reducedMotion || !GSAP) {
      hideLoader();
      return;
    }

    GSAP.set(loaderInner, {
      opacity: 0,
      y: 8
    });

    GSAP.to(loaderInner, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out"
    });

    window.setTimeout(
      hideLoader,
      CONFIG.loaderFailsafe
    );
  };

  window.addEventListener(
    "load",
    () => {
      hideLoader();
    },
    { once: true }
  );

  /* --------------------------------
     STANDBY
  -------------------------------- */

  const hideStandby = () => {
    if (!standby || !standbyVisible) {
      return;
    }

    standbyVisible = false;

    body.classList.remove(
      "standby-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    if (!GSAP || reducedMotion) {
      standby.style.opacity = "0";
      standby.style.visibility = "hidden";
      return;
    }

    GSAP.to(standby, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
      onComplete: () => {
        standby.style.visibility =
          "hidden";
      }
    });
  };

  const showStandby = () => {
    if (
      !standby ||
      standbyVisible ||
      menuOpen ||
      document.hidden
    ) {
      return;
    }

    standbyVisible = true;

    body.classList.add(
      "standby-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

    standby.style.visibility =
      "visible";

    if (!GSAP || reducedMotion) {
      standby.style.opacity = "1";
      return;
    }

    GSAP.to(standby, {
      opacity: 1,
      duration: 0.7,
      ease: "power3.out"
    });
  };

  const resetStandbyTimer = () => {
    window.clearTimeout(
      standbyTimer
    );

    hideStandby();

    standbyTimer = window.setTimeout(
      showStandby,
      CONFIG.standbyDelay
    );
  };

  const handleActivity = () => {
    if (pointerFrame) {
      return;
    }

    pointerFrame =
      window.requestAnimationFrame(() => {
        pointerFrame = null;

        resetStandbyTimer();
      });
  };

  /* --------------------------------
     ACTIVITY EVENTS
  -------------------------------- */

  [
    "keydown",
    "click",
    "wheel",
    "touchstart",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      handleActivity,
      {
        passive:
          eventName !== "keydown" &&
          eventName !== "click"
      }
    );
  });

  window.addEventListener(
    "pointermove",
    () => {
      if (pointerActivityTimer) {
        return;
      }

      pointerActivityTimer =
        window.setTimeout(() => {
          pointerActivityTimer = null;
          resetStandbyTimer();
        }, CONFIG.pointerThrottle);
    },
    { passive: true }
  );

  /* --------------------------------
     VISIBILITY
  -------------------------------- */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        window.clearTimeout(
          standbyTimer
        );
        return;
      }

      resetStandbyTimer();

      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }

      findActiveSection();
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }

      findActiveSection();
      resetStandbyTimer();
    }
  );

  /* --------------------------------
     RESIZE / ORIENTATION
  -------------------------------- */

  const refreshLayout = () => {
    if (resizeFrame) {
      return;
    }

    resizeFrame =
      window.requestAnimationFrame(() => {
        resizeFrame = null;

        findActiveSection();

        if (ScrollTrigger) {
          ScrollTrigger.refresh();
        }
      });
  };

  window.addEventListener(
    "resize",
    refreshLayout,
    { passive: true }
  );

  window.addEventListener(
    "orientationchange",
    () => {
      window.setTimeout(
        refreshLayout,
        150
      );
    },
    { passive: true }
  );

  /* --------------------------------
     REDUCED MOTION
  -------------------------------- */

  const reducedMotionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const handleReducedMotionChange = (
    event
  ) => {
    reducedMotion = event.matches;

    if (reducedMotion) {
      killStoryAnimations();

      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }

      hideStandby();
    } else {
      initStoryAnimations();

      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }
  };

  if (
    typeof reducedMotionQuery.addEventListener ===
    "function"
  ) {
    reducedMotionQuery.addEventListener(
      "change",
      handleReducedMotionChange
    );
  } else {
    reducedMotionQuery.addListener(
      handleReducedMotionChange
    );
  }

  /* --------------------------------
     HASH NAVIGATION
  -------------------------------- */

  const scrollToHash = () => {
    const hash =
      window.location.hash;

    if (!hash) return;

    let target = null;

    try {
      target =
        document.querySelector(hash);
    } catch {
      return;
    }

    if (!target) return;

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        scrollToSection(
          sections.indexOf(target)
        );
      }, 80);
    });
  };

  window.addEventListener(
    "hashchange",
    scrollToHash
  );

  /* --------------------------------
     YEAR
  -------------------------------- */

  if (year) {
    year.textContent =
      String(new Date().getFullYear());
  }

  /* --------------------------------
     INITIAL STATE
  -------------------------------- */

  const init = () => {
    /*
     * Closed menu must be truly non-interactive
     * from the very first frame.
     */
    updateMenuState(false, {
      skipFocus: true,
      skipRestoreFocus: true
    });

    updateSectionNav();

    initSectionObserver();

    initLoader();

    initStoryAnimations();

    scrollToHash();

    /*
     * Hash navigation can change the active
     * section after layout has settled.
     */
    window.setTimeout(
      findActiveSection,
      120
    );

    resetStandbyTimer();

    if (ScrollTrigger) {
      window.setTimeout(
        () => ScrollTrigger.refresh(),
        150
      );
    }
  };

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
