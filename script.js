/* =========================================================
   CESARE PARATORE — HOME
   MAXIMUM QUALITY
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderMaxDelay: 1100,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    scrollOffset: 16
  };

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const standby = doc.getElementById("standby");

  const header = doc.querySelector(".site-header");
  const brand = doc.querySelector(".brand");
  const menuToggle = doc.querySelector(".menu-toggle");
  const menu = doc.getElementById("menu");

  const main = doc.getElementById("main-content");
  const footer = doc.querySelector(".site-footer");
  const sectionNav = doc.querySelector(".section-nav");

  const sections = Array.from(doc.querySelectorAll(".story"));

  const sectionPrev = doc.querySelector(".section-nav-prev");
  const sectionNext = doc.querySelector(".section-nav-next");
  const sectionNumber = doc.querySelector(".section-nav-number");
  const sectionTitle = doc.querySelector(".section-nav-title");

  const currentYear = doc.getElementById("current-year");
  const themeColorMeta = doc.querySelector('meta[name="theme-color"]');

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let currentIndex = 0;
  let menuOpen = false;
  let restoreFocusElement = null;
  let standbyTimer = null;
  let scrollTicking = false;
  let animationsReady = false;
  let lastTheme = null;

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const motionReduced = () => reduceMotionQuery.matches;

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  const isVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.visibility !== "collapse"
    );
  };

  const getFocusable = (container) => {
    if (!container) return [];

    return Array.from(
      container.querySelectorAll(focusableSelector)
    ).filter(isVisible);
  };

  const getMenuFocusable = () => {
    const elements = getFocusable(menu);

    if (
      menuToggle &&
      !menuToggle.disabled &&
      isVisible(menuToggle)
    ) {
      elements.push(menuToggle);
    }

    return elements;
  };

  const setInert = (element, value) => {
    if (!element) return;

    element.inert = value;

    if (value) {
      element.setAttribute("aria-hidden", "true");
    } else {
      element.removeAttribute("aria-hidden");
    }
  };

  const updateYear = () => {
    if (currentYear) {
      currentYear.textContent = String(
        new Date().getFullYear()
      );
    }
  };

  const setMenuBackgroundState = (disabled) => {
    [main, footer, sectionNav, brand].forEach((element) => {
      setInert(element, disabled);
    });
  };

  const updateMenuLabel = () => {
    if (!menuToggle) return;

    const label = menuToggle.querySelector(".menu-label");

    menuToggle.setAttribute(
      "aria-expanded",
      String(menuOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      menuOpen ? "Chiudi menu" : "Apri menu"
    );

    if (label) {
      label.textContent = menuOpen ? "CHIUDI" : "MENU";
    }
  };

  const setMenuState = (open, { restoreFocus = true } = {}) => {
    if (!menu || !menuToggle) return;

    if (open === menuOpen) return;

    if (open) {
      restoreFocusElement = doc.activeElement;

      menuOpen = true;

      menu.inert = false;
      menu.removeAttribute("aria-hidden");
      menu.classList.add("is-open");

      setMenuBackgroundState(true);

      html.classList.add("menu-is-open");
      body.classList.add("menu-is-open");

      updateMenuLabel();

      window.requestAnimationFrame(() => {
        const links = getFocusable(menu);

        if (links.length) {
          links[0].focus();
        } else {
          menu.setAttribute("tabindex", "-1");
          menu.focus();
        }
      });

      return;
    }

    menuOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.inert = true;

    setMenuBackgroundState(false);

    html.classList.remove("menu-is-open");
    body.classList.remove("menu-is-open");

    updateMenuLabel();

    if (!restoreFocus) {
      restoreFocusElement = null;
      return;
    }

    const target =
      restoreFocusElement &&
      restoreFocusElement.isConnected &&
      typeof restoreFocusElement.focus === "function"
        ? restoreFocusElement
        : menuToggle;

    restoreFocusElement = null;

    window.requestAnimationFrame(() => {
      target.focus();
    });
  };

  const trapMenuFocus = (event) => {
    if (!menuOpen || event.key !== "Tab") return;

    const focusables = getMenuFocusable();

    if (!focusables.length) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (
      event.shiftKey &&
      doc.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (
      !event.shiftKey &&
      doc.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  };

  const keepFocusInsideMenu = (event) => {
    if (!menuOpen) return;

    if (
      menu.contains(event.target) ||
      event.target === menuToggle
    ) {
      return;
    }

    const first = getFocusable(menu)[0];

    if (first) {
      first.focus();
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenuState(!menuOpen);
  });

  menu?.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link) return;

    setMenuState(false, { restoreFocus: false });
  });

  menu?.addEventListener("click", (event) => {
    if (event.target === menu) {
      setMenuState(false);
    }
  });

  doc.addEventListener("focusin", keepFocusInsideMenu);

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    trapMenuFocus(event);
  });

  /* -------------------------------------------------------
     STANDBY
     ------------------------------------------------------- */

  const hideStandby = () => {
    if (!standby) return;

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  };

  const clearStandbyTimer = () => {
    if (!standbyTimer) return;

    window.clearTimeout(standbyTimer);
    standbyTimer = null;
  };

  const scheduleStandby = () => {
    if (!standby) return;

    clearStandbyTimer();

    if (doc.hidden || menuOpen) return;

    standbyTimer = window.setTimeout(() => {
      if (doc.hidden || menuOpen) return;

      standby.classList.add("is-visible");
      standby.setAttribute("aria-hidden", "false");
      standbyTimer = null;
    }, CONFIG.standbyDelay);
  };

  const registerActivity = () => {
    hideStandby();

    if (!standbyTimer && !doc.hidden && !menuOpen) {
      scheduleStandby();
    }
  };

  [
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      registerActivity,
      { passive: true }
    );
  });

  /* -------------------------------------------------------
     LOADER
     ------------------------------------------------------- */

  const hideLoader = () => {
    if (!loader || loader.classList.contains("is-hidden")) {
      return;
    }

    loader.classList.add("is-hidden");
  };

  const initLoader = () => {
    window.setTimeout(
      hideLoader,
      motionReduced()
        ? 0
        : CONFIG.loaderMaxDelay
    );
  };

  /* -------------------------------------------------------
     SECTION STATE
     ------------------------------------------------------- */

  const getReadingLine = () => {
    const headerHeight =
      header?.offsetHeight || 0;

    return (
      headerHeight +
      Math.min(
        window.innerHeight * CONFIG.activeLineRatio,
        CONFIG.activeLineMax
      )
    );
  };

  const getActiveSectionIndex = () => {
    if (!sections.length) return 0;

    const readingLine = getReadingLine();

    let bestIndex = currentIndex;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= readingLine &&
        rect.bottom >= readingLine
      ) {
        bestIndex = index;
        bestDistance = 0;
        return;
      }

      const center =
        rect.top + rect.height / 2;

      const distance = Math.abs(
        center - readingLine
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const getSectionTitle = (section) =>
    section?.dataset.title ||
    section?.querySelector("h1, h2")?.textContent?.trim() ||
    "";

  const updateTheme = (section) => {
    if (!section) return;

    const light = section.classList.contains(
      "story-light"
    );

    const theme = light ? "light" : "dark";

    if (theme === lastTheme) return;

    lastTheme = theme;

    if (header) {
      header.dataset.theme = theme;
    }

    if (sectionNav) {
      sectionNav.dataset.theme = theme;
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        "content",
        light ? "#F1EFE8" : "#0B0B0A"
      );
    }
  };

  const updateSectionNavigation = (
    index = getActiveSectionIndex()
  ) => {
    if (!sections.length) return;

    const nextIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const changed = nextIndex !== currentIndex;

    currentIndex = nextIndex;

    const section = sections[currentIndex];
    const title = getSectionTitle(section);

    if (sectionNumber) {
      sectionNumber.textContent = String(
        currentIndex + 1
      ).padStart(2, "0");
    }

    if (sectionTitle) {
      sectionTitle.textContent = title;
    }

    if (sectionPrev) {
      const disabled = currentIndex === 0;

      sectionPrev.disabled = disabled;
      sectionPrev.setAttribute(
        "aria-label",
        disabled
          ? "Sezione precedente non disponibile"
          : `Vai a ${getSectionTitle(
              sections[currentIndex - 1]
            )}`
      );

      if (!disabled) {
        sectionPrev.setAttribute(
          "aria-controls",
          sections[currentIndex - 1].id
        );
      } else {
        sectionPrev.removeAttribute("aria-controls");
      }
    }

    if (sectionNext) {
      const disabled =
        currentIndex === sections.length - 1;

      sectionNext.disabled = disabled;

      sectionNext.setAttribute(
        "aria-label",
        disabled
          ? "Sezione successiva non disponibile"
          : `Vai a ${getSectionTitle(
              sections[currentIndex + 1]
            )}`
      );

      if (!disabled) {
        sectionNext.setAttribute(
          "aria-controls",
          sections[currentIndex + 1].id
        );
      } else {
        sectionNext.removeAttribute("aria-controls");
      }
    }

    sections.forEach((item, itemIndex) => {
      item.toggleAttribute(
        "data-active",
        itemIndex === currentIndex
      );
    });

    updateTheme(section);

    return changed;
  };

  const getSectionTop = (section) => {
    const headerHeight =
      header?.offsetHeight || 0;

    return Math.max(
      0,
      window.scrollY +
        section.getBoundingClientRect().top -
        headerHeight -
        CONFIG.scrollOffset
    );
  };

  const updateHash = (section) => {
    if (!section?.id) return;

    const url = `${window.location.pathname}#${section.id}`;

    if (window.location.hash === `#${section.id}`) {
      return;
    }

    window.history.replaceState(
      { section: section.id },
      "",
      url
    );
  };

  const scrollToSection = (
    index,
    {
      updateUrl = true,
      focusHeading = false
    } = {}
  ) => {
    const section = sections[index];

    if (!section) return;

    const top = getSectionTop(section);

    window.scrollTo({
      top,
      behavior: motionReduced()
        ? "auto"
        : "smooth"
    });

    if (updateUrl) {
      updateHash(section);
    }

    if (focusHeading) {
      const heading =
        section.querySelector("h1, h2");

      if (heading) {
        const hadTabIndex =
          heading.getAttribute("tabindex");

        if (hadTabIndex === null) {
          heading.setAttribute(
            "tabindex",
            "-1"
          );
        }

        window.setTimeout(() => {
          heading.focus({
            preventScroll: true
          });

          if (hadTabIndex === null) {
            heading.removeAttribute("tabindex");
          }
        }, motionReduced() ? 0 : 500);
      }
    }
  };

  sectionPrev?.addEventListener("click", () => {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1, {
        updateUrl: true,
        focusHeading: true
      });
    }
  });

  sectionNext?.addEventListener("click", () => {
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1, {
        updateUrl: true,
        focusHeading: true
      });
    }
  });

  /* -------------------------------------------------------
     HASH / HISTORY
     ------------------------------------------------------- */

  const getHashTarget = () => {
    const rawHash = window.location.hash.slice(1);

    if (!rawHash) return null;

    let id = rawHash;

    try {
      id = decodeURIComponent(rawHash);
    } catch {
      return null;
    }

    return doc.getElementById(id);
  };

  const navigateToHash = ({
    behavior = "auto",
    focus = false
  } = {}) => {
    const target = getHashTarget();

    if (!target) return;

    const index = sections.indexOf(target);

    if (index >= 0) {
      const top = getSectionTop(target);

      window.scrollTo({
        top,
        behavior:
          motionReduced()
            ? "auto"
            : behavior
      });

      updateSectionNavigation(index);

      if (focus) {
        const heading =
          target.querySelector("h1, h2");

        if (heading) {
          heading.setAttribute(
            "tabindex",
            "-1"
          );

          window.setTimeout(() => {
            heading.focus({
              preventScroll: true
            });
          }, motionReduced() ? 0 : 350);
        }
      }

      return;
    }

    target.scrollIntoView({
      behavior:
        motionReduced()
          ? "auto"
          : behavior,
      block: "start"
    });
  };

  window.addEventListener("hashchange", () => {
    navigateToHash({
      behavior: "smooth",
      focus: true
    });
  });

  window.addEventListener("popstate", () => {
    navigateToHash({
      behavior: "smooth",
      focus: true
    });
  });

  /* -------------------------------------------------------
     SCROLL / RESIZE
     ------------------------------------------------------- */

  const requestSectionUpdate = () => {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(() => {
      updateSectionNavigation();
      scrollTicking = false;
    });
  };

  window.addEventListener(
    "scroll",
    requestSectionUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestSectionUpdate,
    { passive: true }
  );

  /* -------------------------------------------------------
     GSAP MOTION
     ------------------------------------------------------- */

  const gsapAvailable = () =>
    !motionReduced() &&
    window.gsap &&
    window.ScrollTrigger;

  const resetAnimatedElements = () => {
    sections.forEach((section) => {
      section
        .querySelectorAll(
          [
            ".eyebrow",
            "h1",
            "h2",
            ".narrative-copy > p",
            ".today-lead",
            ".contact-lead",
            ".statement",
            ".understand-lead",
            ".build-lead",
            ".return-list li",
            ".connect-words li",
            ".objective-list p",
            ".person-frame",
            ".map-frame"
          ].join(",")
        )
        .forEach((element) => {
          element.style.removeProperty("opacity");
          element.style.removeProperty("transform");
          element.style.removeProperty("visibility");
        });
    });
  };

  const createReveal = (
    targets,
    {
      trigger,
      start = "top 74%",
      y = 30,
      x = 0,
      duration = 0.75,
      stagger = 0.08,
      id
    } = {}
  ) => {
    const elements = Array.from(
      targets || []
    ).filter(Boolean);

    if (!elements.length) return;

    window.gsap.from(elements, {
      opacity: 0,
      y,
      x,
      duration,
      stagger,
      ease: "power3.out",
      clearProps: "opacity,transform",
      scrollTrigger: {
        id,
        trigger,
        start,
        once: true
      }
    });
  };

  const initStoryAnimations = () => {
    resetAnimatedElements();

    if (!gsapAvailable()) {
      animationsReady = false;
      return;
    }

    const {
      gsap,
      ScrollTrigger
    } = window;

    gsap.registerPlugin(ScrollTrigger);

    if (gsap.__cesareHomeContext) {
      gsap.__cesareHomeContext.revert();
    }

    const context = gsap.context(() => {
      const opening = sections[0];

      if (opening) {
        const eyebrow =
          opening.querySelector(".eyebrow");

        const heading =
          opening.querySelector("h1");

        const paragraphs =
          opening.querySelectorAll(
            ".opening-copy > p"
          );

        const timeline = gsap.timeline();

        if (eyebrow) {
          timeline.from(eyebrow, {
            opacity: 0,
            y: 14,
            duration: 0.55,
            ease: "power3.out"
          });
        }

        if (heading) {
          timeline.from(
            heading,
            {
              opacity: 0,
              y: 34,
              duration: 0.8,
              ease: "power4.out"
            },
            "-=0.25"
          );
        }

        if (paragraphs.length) {
          timeline.from(
            paragraphs,
            {
              opacity: 0,
              y: 18,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out"
            },
            "-=0.3"
          );
        }
      }

      sections.slice(1).forEach(
        (section, index) => {
          const number = index + 1;

          const eyebrow =
            section.querySelector(".eyebrow");

          const heading =
            section.querySelector("h1, h2");

          const paragraphs =
            section.querySelectorAll(
              ".narrative-copy > p"
            );

          const frame =
            section.querySelector(
              ".person-frame, .map-frame"
            );

          const selector = [
            eyebrow,
            heading,
            ...Array.from(paragraphs),
            frame
          ].filter(Boolean);

          if (!selector.length) return;

          createReveal(selector, {
            trigger: section,
            start: "top 76%",
            y: 28,
            duration: 0.72,
            stagger: 0.07,
            id: `story-${number}`
          });

          if (
            section.classList.contains(
              "story-connect"
            )
          ) {
            createReveal(
              section.querySelectorAll(
                ".connect-words li"
              ),
              {
                trigger: section,
                start: "top 72%",
                x: -22,
                y: 0,
                duration: 0.62,
                stagger: 0.07,
                id: `story-${number}-words`
              }
            );
          }

          if (
            section.classList.contains(
              "story-return"
            )
          ) {
            createReveal(
              section.querySelectorAll(
                ".return-list li"
              ),
              {
                trigger: section,
                start: "top 72%",
                y: 22,
                duration: 0.62,
                stagger: 0.08,
                id: `story-${number}-list`
              }
            );
          }

          if (
            section.classList.contains(
              "story-objective"
            )
          ) {
            createReveal(
              section.querySelectorAll(
                ".objective-list p"
              ),
              {
                trigger: section,
                start: "top 72%",
                x: 22,
                y: 0,
                duration: 0.62,
                stagger: 0.08,
                id: `story-${number}-method`
              }
            );
          }
        }
      );
    });

    gsap.__cesareHomeContext = context;
    animationsReady = true;

    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  const handleMotionPreferenceChange = () => {
    if (window.gsap?.__cesareHomeContext) {
      window.gsap.__cesareHomeContext.revert();
      window.gsap.__cesareHomeContext = null;
    }

    initStoryAnimations();

    requestSectionUpdate();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  };

  if (
    typeof reduceMotionQuery.addEventListener ===
    "function"
  ) {
    reduceMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );
  } else if (
    typeof reduceMotionQuery.addListener ===
    "function"
  ) {
    reduceMotionQuery.addListener(
      "change",
      handleMotionPreferenceChange
    );
  }

  /* -------------------------------------------------------
     MEDIA FALLBACKS
     ------------------------------------------------------- */

  doc.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("is-broken");
      },
      { once: true }
    );
  });

  /* -------------------------------------------------------
     PAGE LIFECYCLE
     ------------------------------------------------------- */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        hideStandby();
        clearStandbyTimer();
        return;
      }

      scheduleStandby();

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      requestSectionUpdate();
    }
  );

  window.addEventListener("pageshow", () => {
    scheduleStandby();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }

    requestSectionUpdate();
  });

  window.addEventListener(
    "pagehide",
    () => {
      clearStandbyTimer();
    },
    { passive: true }
  );

  /* -------------------------------------------------------
     INITIALIZATION
     ------------------------------------------------------- */

  const init = () => {
    updateYear();

    menuOpen = false;

    if (menu) {
      menu.inert = true;
      menu.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    setMenuBackgroundState(false);
    updateMenuLabel();

    updateSectionNavigation(
      getActiveSectionIndex()
    );

    initLoader();
    initStoryAnimations();
    scheduleStandby();

    if (window.location.hash) {
      window.setTimeout(() => {
        navigateToHash({
          behavior: "auto",
          focus: true
        });
      }, 80);
    }

    window.requestAnimationFrame(() => {
      updateSectionNavigation();

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    });
  };

  if (doc.readyState === "loading") {
    doc.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
