/* =========================================================
   CESARE PARATORE
   Main JavaScript
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 3500,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    scrollOffset: 12,
    pointerThrottle: 700,
    menuTransition: 550
  };

  const dom = {
    body: document.body,
    loader: document.getElementById("loader"),
    standby: document.getElementById("standby"),
    menuToggle: document.getElementById("menu-toggle"),
    menu: document.getElementById("menu"),
    main: document.getElementById("main-content"),
    footer: document.querySelector(".site-footer"),

    stories: Array.from(document.querySelectorAll(".story")),

    sectionNav: document.querySelector(".section-nav"),
    sectionPrev: document.querySelector(".section-nav-prev"),
    sectionNext: document.querySelector(".section-nav-next"),
    sectionNumber: document.querySelector(".section-nav-number"),
    sectionTitle: document.querySelector(".section-nav-title")
  };

  const state = {
    currentIndex: 0,
    menuOpen: false,
    standbyTimer: null,
    standbyVisible: false,
    loaderHidden: false,
    lastPointerActivity: 0,
    menuFocusables: [],
    restoreFocusElement: null,
    scrollRaf: null
  };

  /* =======================================================
     HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const gsapAvailable = () =>
    typeof window.gsap !== "undefined";

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getFocusableElements = (container) => {
    if (!container) return [];

    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  };

  const isVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  };

  /* =======================================================
     MENU
     ======================================================= */

  const setMenuTabState = (isOpen) => {
    if (!dom.menu) return;

    const links = dom.menu.querySelectorAll("a");

    links.forEach((link) => {
      link.tabIndex = isOpen ? 0 : -1;
    });

    state.menuFocusables = isOpen
      ? getFocusableElements(dom.menu)
      : [];
  };

  const setBackgroundInteractionDisabled = (disabled) => {
    if (dom.main) {
      dom.main.inert = disabled;
      dom.main.setAttribute("aria-hidden", disabled ? "true" : "false");
    }

    if (dom.footer) {
      dom.footer.inert = disabled;
      dom.footer.setAttribute(
        "aria-hidden",
        disabled ? "true" : "false"
      );
    }
  };

  const updateMenuLabel = (isOpen) => {
    if (!dom.menuToggle) return;

    const label = dom.menuToggle.querySelector(".menu-toggle-label");

    if (label) {
      label.textContent = isOpen ? "CHIUDI" : "MENU";
    }

    dom.menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Chiudi menu" : "Apri menu"
    );

    dom.menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  };

  const updateMenuState = (open, { restoreFocus = true } = {}) => {
    if (!dom.menu || !dom.menuToggle) return;

    if (open === state.menuOpen) {
      return;
    }

    if (open) {
      state.restoreFocusElement =
        document.activeElement &&
        document.activeElement !== document.body
          ? document.activeElement
          : dom.menuToggle;

      state.menuOpen = true;

      dom.body.classList.add("menu-open");
      dom.menu.classList.add("is-open");

      dom.menu.setAttribute("aria-hidden", "false");
      dom.menu.inert = false;

      setBackgroundInteractionDisabled(true);
      setMenuTabState(true);
      updateMenuLabel(true);

      window.setTimeout(() => {
        if (!state.menuOpen) return;

        const firstFocusable = state.menuFocusables[0];

        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 60);

      return;
    }

    state.menuOpen = false;

    dom.body.classList.remove("menu-open");
    dom.menu.classList.remove("is-open");

    dom.menu.setAttribute("aria-hidden", "true");
    dom.menu.inert = true;

    setMenuTabState(false);
    setBackgroundInteractionDisabled(false);
    updateMenuLabel(false);

    if (restoreFocus) {
      window.setTimeout(() => {
        if (state.restoreFocusElement instanceof HTMLElement) {
          state.restoreFocusElement.focus();
        } else {
          dom.menuToggle.focus();
        }
      }, CONFIG.menuTransition);
    }
  };

  const toggleMenu = () => {
    updateMenuState(!state.menuOpen);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (state.menuOpen) {
      updateMenuState(false, { restoreFocus });
    }
  };

  const handleMenuKeydown = (event) => {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    state.menuFocusables = getFocusableElements(dom.menu);

    if (!state.menuFocusables.length) {
      event.preventDefault();
      return;
    }

    const first = state.menuFocusables[0];
    const last =
      state.menuFocusables[state.menuFocusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleMenuLinkClick = () => {
    /*
     * A menu destination should return focus to the menu button
     * rather than to the link that is about to disappear.
     */
    state.restoreFocusElement = dom.menuToggle;

    closeMenu({ restoreFocus: false });
  };

  /* =======================================================
     STANDBY
     ======================================================= */

  const hideStandby = () => {
    if (!dom.standby || !state.standbyVisible) return;

    state.standbyVisible = false;

    if (gsapAvailable() && !reducedMotion()) {
      gsap.to(dom.standby, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          dom.standby.setAttribute("aria-hidden", "true");
        }
      });
    } else {
      dom.standby.style.opacity = "0";
      dom.standby.style.visibility = "hidden";
      dom.standby.setAttribute("aria-hidden", "true");
    }
  };

  const showStandby = () => {
    if (!dom.standby || state.menuOpen || state.standbyVisible) {
      return;
    }

    state.standbyVisible = true;

    dom.standby.setAttribute("aria-hidden", "false");

    if (gsapAvailable() && !reducedMotion()) {
      gsap.to(dom.standby, {
        autoAlpha: 1,
        duration: 0.7,
        ease: "power2.out"
      });
    } else {
      dom.standby.style.opacity = "1";
      dom.standby.style.visibility = "visible";
    }
  };

  const resetStandbyTimer = () => {
    if (state.standbyTimer) {
      window.clearTimeout(state.standbyTimer);
    }

    hideStandby();

    state.standbyTimer = window.setTimeout(
      showStandby,
      CONFIG.standbyDelay
    );
  };

  const handleActivity = () => {
    const now = performance.now();

    if (
      now - state.lastPointerActivity <
      CONFIG.pointerThrottle
    ) {
      return;
    }

    state.lastPointerActivity = now;
    resetStandbyTimer();
  };

  /* =======================================================
     LOADER
     ======================================================= */

  const hideLoader = () => {
    if (!dom.loader || state.loaderHidden) return;

    state.loaderHidden = true;

    const complete = () => {
      dom.loader.setAttribute("aria-hidden", "true");
      dom.loader.style.display = "none";
    };

    if (gsapAvailable() && !reducedMotion()) {
      gsap.to(dom.loader, {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: complete
      });
    } else {
      complete();
    }
  };

  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  const getReadingLine = () => {
    return clamp(
      window.innerHeight * CONFIG.activeLineRatio,
      140,
      CONFIG.activeLineMax
    );
  };

  const getActiveSectionIndex = () => {
    if (!dom.stories.length) return 0;

    const readingLine = getReadingLine();

    let closestIndex = 0;
    let closestDistance = Infinity;

    dom.stories.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      const distance = Math.abs(
        rect.top - readingLine
      );

      if (
        rect.top <= readingLine &&
        rect.bottom >= readingLine
      ) {
        closestIndex = index;
        closestDistance = 0;
        return;
      }

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const updateSectionNavigation = () => {
    if (!dom.stories.length) return;

    const index = getActiveSectionIndex();

    if (index === state.currentIndex && dom.sectionTitle?.textContent) {
      return;
    }

    state.currentIndex = index;

    const section = dom.stories[index];

    if (!section) return;

    const number =
      section.querySelector(".story-index")?.textContent?.trim() ||
      String(index + 1).padStart(2, "0");

    const title =
      section.dataset.title ||
      section.querySelector("h1, h2")?.textContent?.trim() ||
      "";

    if (dom.sectionNumber) {
      dom.sectionNumber.textContent = number;
    }

    if (dom.sectionTitle) {
      dom.sectionTitle.textContent = title;
    }

    updateSectionTheme(section);
    updateSectionButtons();
  };

  const updateSectionTheme = (section) => {
    if (!dom.sectionNav || !section) return;

    dom.sectionNav.style.color =
      section.classList.contains("story-dark")
        ? "var(--light)"
        : "var(--dark)";
  };

  const updateSectionButtons = () => {
    if (!dom.sectionPrev || !dom.sectionNext) return;

    dom.sectionPrev.disabled = state.currentIndex <= 0;
    dom.sectionNext.disabled =
      state.currentIndex >= dom.stories.length - 1;

    dom.sectionPrev.style.opacity =
      state.currentIndex <= 0 ? "0.25" : "1";

    dom.sectionNext.style.opacity =
      state.currentIndex >= dom.stories.length - 1
        ? "0.25"
        : "1";
  };

  const scrollToSection = (index) => {
    if (
      index < 0 ||
      index >= dom.stories.length
    ) {
      return;
    }

    const section = dom.stories[index];

    if (!section) return;

    closeMenu({ restoreFocus: false });

    const headerHeight =
      document.getElementById("site-header")?.offsetHeight ||
      0;

    const top =
      window.scrollY +
      section.getBoundingClientRect().top -
      headerHeight -
      CONFIG.scrollOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion() ? "auto" : "smooth"
    });
  };

  const goPrevious = () => {
    scrollToSection(state.currentIndex - 1);
  };

  const goNext = () => {
    scrollToSection(state.currentIndex + 1);
  };

  const handleArrowNavigation = (event) => {
    if (state.menuOpen) return;

    if (
      document.activeElement !== document.body &&
      document.activeElement !== document.documentElement
    ) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      goNext();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      goPrevious();
    }
  };

  /* =======================================================
     GSAP STORY ANIMATIONS
     ======================================================= */

  const killStoryAnimations = () => {
    if (!gsapAvailable()) return;

    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.id?.startsWith("story-")) {
          trigger.kill();
        }
      });
    }

    dom.stories.forEach((section) => {
      gsap.killTweensOf(section.querySelectorAll("*"));
    });
  };

  const setReducedMotionState = () => {
    dom.stories.forEach((section) => {
      const elements = section.querySelectorAll(
        "h1, h2, p, .story-index, .connect-words span, .today-lead span, .objective-flow span, .person-frame, .map-frame"
      );

      gsap.set(elements, {
        clearProps: "all",
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      });
    });
  };

  const initStoryAnimations = () => {
    if (!gsapAvailable() || !window.ScrollTrigger) {
      return;
    }

    killStoryAnimations();

    if (reducedMotion()) {
      setReducedMotionState();
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);

    dom.stories.forEach((section, index) => {
      const heading = section.querySelector("h1, h2");
      const paragraphs = section.querySelectorAll(".narrative-copy p");
      const indexMark = section.querySelector(".story-index");

      /*
       * Opening section:
       * deliberately minimal. Only the main word moves.
       */
      if (section.classList.contains("story-opening")) {
        if (!heading) return;

        gsap.fromTo(
          heading,
          {
            opacity: 0,
            y: 45
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-opening`,
              trigger: section,
              start: "top 75%",
              end: "bottom 25%",
              toggleActions: "play reverse play reverse"
            }
          }
        );

        return;
      }

      /*
       * General section title.
       */
      if (heading) {
        gsap.fromTo(
          heading,
          {
            opacity: 0,
            y: 45
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-heading`,
              trigger: section,
              start: "top 78%",
              end: "top 35%",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      }

      /*
       * Section number.
       */
      if (indexMark) {
        gsap.fromTo(
          indexMark,
          {
            opacity: 0
          },
          {
            opacity: 0.55,
            duration: 0.6,
            scrollTrigger: {
              id: `story-${index}-index`,
              trigger: section,
              start: "top 80%",
              end: "top 40%",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      }

      /*
       * Narrative paragraphs.
       */
      if (paragraphs.length) {
        gsap.fromTo(
          paragraphs,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-copy`,
              trigger: section,
              start: "top 65%",
              end: "top 25%",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      }

      /*
       * COLLEGARE:
       * the five fields appear independently before
       * the text completes the relationship.
       */
      if (section.classList.contains("story-connect")) {
        const words =
          section.querySelectorAll(".connect-words span");

        if (words.length) {
          gsap.fromTo(
            words,
            {
              opacity: 0,
              x: -35
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.65,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                id: `story-${index}-connect`,
                trigger: section,
                start: "top 70%",
                end: "top 25%",
                toggleActions: "play reverse play reverse"
              }
            }
          );
        }
      }

      /*
       * OGGI:
       * verbs enter one by one as a method.
       */
      if (section.classList.contains("story-today")) {
        const verbs =
          section.querySelectorAll(".today-lead span");

        if (verbs.length) {
          gsap.fromTo(
            verbs,
            {
              opacity: 0,
              y: 25
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                id: `story-${index}-today`,
                trigger: section,
                start: "top 70%",
                end: "top 25%",
                toggleActions: "play reverse play reverse"
              }
            }
          );
        }
      }

      /*
       * OBIETTIVO:
       * the flow is treated as a single visual sequence.
       */
      if (section.classList.contains("story-objective")) {
        const flow =
          section.querySelectorAll(".objective-flow span");

        if (flow.length) {
          gsap.fromTo(
            flow,
            {
              opacity: 0,
              y: 20
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                id: `story-${index}-objective`,
                trigger: section,
                start: "top 68%",
                end: "top 25%",
                toggleActions: "play reverse play reverse"
              }
            }
          );
        }
      }

      /*
       * Visual frames.
       */
      const frame =
        section.querySelector(".person-frame, .map-frame");

      if (frame) {
        gsap.fromTo(
          frame,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              id: `story-${index}-frame`,
              trigger: section,
              start: "top 68%",
              end: "top 25%",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      }
    });

    window.ScrollTrigger.refresh();
  };

  /* =======================================================
     MOTION PREFERENCE
     ======================================================= */

  const handleMotionPreferenceChange = () => {
    if (gsapAvailable()) {
      killStoryAnimations();
    }

    initStoryAnimations();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  };

  /* =======================================================
     HASH NAVIGATION
     ======================================================= */

  const handleHashNavigation = () => {
    const hash = window.location.hash;

    if (!hash) return;

    const target = document.querySelector(hash);

    if (!target || !target.classList.contains("story")) {
      return;
    }

    window.setTimeout(() => {
      const index = dom.stories.indexOf(target);

      if (index >= 0) {
        scrollToSection(index);
      }
    }, 100);
  };

  /* =======================================================
     RESIZE / SCROLL
     ======================================================= */

  const requestSectionUpdate = () => {
    if (state.scrollRaf) return;

    state.scrollRaf = window.requestAnimationFrame(() => {
      state.scrollRaf = null;
      updateSectionNavigation();
    });
  };

  const handleResize = () => {
    requestSectionUpdate();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  };

  /* =======================================================
     EVENT LISTENERS
     ======================================================= */

  dom.menuToggle?.addEventListener("click", toggleMenu);

  dom.menu?.addEventListener(
    "keydown",
    handleMenuKeydown
  );

  dom.menu
    ?.querySelectorAll("a")
    .forEach((link) => {
      link.addEventListener("click", handleMenuLinkClick);
    });

  dom.sectionPrev?.addEventListener(
    "click",
    goPrevious
  );

  dom.sectionNext?.addEventListener(
    "click",
    goNext
  );

  document.addEventListener(
    "keydown",
    handleArrowNavigation
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && state.standbyVisible) {
        hideStandby();
        resetStandbyTimer();
      }
    }
  );

  window.addEventListener(
    "scroll",
    requestSectionUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    handleResize,
    { passive: true }
  );

  window.addEventListener(
    "pointermove",
    handleActivity,
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    resetStandbyTimer,
    { passive: true }
  );

  window.addEventListener(
    "keydown",
    resetStandbyTimer
  );

  window.addEventListener(
    "wheel",
    resetStandbyTimer,
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    resetStandbyTimer,
    { passive: true }
  );

  window.addEventListener(
    "load",
    () => {
      hideLoader();
      updateSectionNavigation();
      initStoryAnimations();
      handleHashNavigation();

      window.setTimeout(() => {
        updateSectionNavigation();

        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 100);
    },
    { once: true }
  );

  window.addEventListener(
    "pageshow",
    () => {
      updateSectionNavigation();

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }
  );

  /* =======================================================
     REDUCED MOTION MEDIA QUERY
     ======================================================= */

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );
  } else if (
    typeof motionQuery.addListener === "function"
  ) {
    motionQuery.addListener(
      handleMotionPreferenceChange
    );
  }

  /* =======================================================
     FAILSAFE
     ======================================================= */

  window.setTimeout(
    hideLoader,
    CONFIG.loaderFailsafe
  );

  /* =======================================================
     INITIAL STATE
     ======================================================= */

  setMenuTabState(false);

  if (dom.menu) {
    dom.menu.inert = true;
    dom.menu.setAttribute("aria-hidden", "true");
  }

  if (dom.main) {
    dom.main.inert = false;
    dom.main.setAttribute("aria-hidden", "false");
  }

  if (dom.footer) {
    dom.footer.inert = false;
    dom.footer.setAttribute("aria-hidden", "false");
  }

  updateMenuLabel(false);
  updateSectionNavigation();
  resetStandbyTimer();

})();
