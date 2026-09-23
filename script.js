/* ============================================================
   CESARE PARATORE
   V3.3 — MAXIMUM QUALITY
   ============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     01. DOM
     ========================================================== */

  const body = document.body;
  const html = document.documentElement;

  const loader = document.getElementById("site-loader");
  const standby = document.getElementById("standby");

  const header = document.querySelector(".site-header");

  const menu = document.getElementById("menu");
  const menuTrigger = document.getElementById("menu-trigger");
  const menuLabel = menuTrigger?.querySelector(".menu-label");
  const menuLinks = Array.from(
    document.querySelectorAll("[data-menu-link]")
  );

  const main = document.getElementById("main-content");
  const footer = document.querySelector(".site-footer");

  const sections = Array.from(
    document.querySelectorAll(".story-section")
  );

  const sectionNav = document.getElementById("section-nav");
  const sectionNavTitle = document.getElementById("section-nav-title");

  const prevButton = document.getElementById("nav-prev");
  const nextButton = document.getElementById("nav-next");

  const currentYear = document.getElementById("current-year");


  /* ==========================================================
     02. EXTERNAL MOTION ENGINE
     ========================================================== */

  const GSAP = window.gsap || null;
  const ScrollTrigger = window.ScrollTrigger || null;


  /* ==========================================================
     03. CONFIG
     ========================================================== */

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 3500,
    activeLineViewportRatio: 0.32,
    activeLineMax: 260,
    scrollOffset: 12,
    pointerActivityThrottle: 700
  };


  /* ==========================================================
     04. STATE
     ========================================================== */

  let menuOpen = false;
  let activeIndex = 0;

  let standbyTimer = null;
  let standbyVisible = false;

  let loaderHidden = false;

  let scrollFrame = null;
  let resizeFrame = null;

  let lastActivityTime = 0;

  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let animationsInitialized = false;

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  /* ==========================================================
     05. UTILS
     ========================================================== */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const getHeaderHeight = () => {
    return header?.getBoundingClientRect().height || 76;
  };


  const getSectionNavHeight = () => {
    return sectionNav?.getBoundingClientRect().height || 86;
  };


  const isPageHidden = () => {
    return document.hidden;
  };


  /* ==========================================================
     06. MENU ACCESSIBILITY
     ========================================================== */

  function setMenuTabState(disabled) {
    menuLinks.forEach((link) => {
      if (disabled) {
        link.setAttribute("tabindex", "-1");
        return;
      }

      link.removeAttribute("tabindex");
    });
  }


  function setInert(element, inert) {
    if (!element) {
      return;
    }

    if ("inert" in element) {
      element.inert = inert;
    }

    if (inert) {
      element.setAttribute("inert", "");
    } else {
      element.removeAttribute("inert");
    }
  }


  function setBackgroundInteractionDisabled(disabled) {
    setInert(main, disabled);
    setInert(footer, disabled);

    if (main) {
      if (disabled) {
        main.setAttribute("aria-hidden", "true");
      } else {
        main.removeAttribute("aria-hidden");
      }
    }

    if (footer) {
      if (disabled) {
        footer.setAttribute("aria-hidden", "true");
      } else {
        footer.removeAttribute("aria-hidden");
      }
    }
  }


  function updateMenuLabel(open) {
    if (!menuTrigger) {
      return;
    }

    menuTrigger.setAttribute(
      "aria-label",
      open ? "Chiudi menu" : "Apri menu"
    );

    if (menuLabel) {
      menuLabel.textContent = open ? "Chiudi" : "Menu";
    }
  }


  function updateMenuState(open) {
    menuOpen = open;

    if (!menu || !menuTrigger) {
      return;
    }

    menu.classList.toggle("is-open", open);
    menuTrigger.classList.toggle("is-open", open);

    menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    setInert(menu, !open);
    setMenuTabState(!open);
    setBackgroundInteractionDisabled(open);

    body.classList.toggle("menu-open", open);

    updateMenuLabel(open);

    if (open) {
      hideStandby();
      clearStandbyTimer();
    } else {
      scheduleStandby();
    }
  }


  function getMenuFocusableElements() {
    if (!menu) {
      return [];
    }

    return Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      return !element.hasAttribute("disabled");
    });
  }


  let lastFocusedElement = null;


  function openMenu() {
    if (menuOpen) {
      return;
    }

    lastFocusedElement = document.activeElement;

    updateMenuState(true);

    requestAnimationFrame(() => {
      const focusable = getMenuFocusableElements();

      if (focusable.length) {
        focusable[0].focus();
      }
    });
  }


  function closeMenu(options = {}) {
    if (!menuOpen) {
      return;
    }

    const {
      restoreFocus = true
    } = options;

    updateMenuState(false);

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      requestAnimationFrame(() => {
        lastFocusedElement.focus();
      });
    }

    lastFocusedElement = null;
  }


  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  function trapMenuFocus(event) {
    if (!menuOpen || event.key !== "Tab") {
      return;
    }

    const focusable = getMenuFocusableElements();

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
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }


  menuTrigger?.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      event.preventDefault();
      closeMenu();
      return;
    }

    trapMenuFocus(event);
  });


  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu({
        restoreFocus: false
      });
    });
  });


  /* ==========================================================
     07. SECTION NAVIGATION
     ========================================================== */

  function setActiveSection(index) {
    if (!sections.length) {
      return;
    }

    const nextIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    activeIndex = nextIndex;

    const section = sections[activeIndex];

    if (!section) {
      return;
    }

    const label =
      section.dataset.label ||
      section.querySelector(".story-eyebrow")?.textContent?.trim() ||
      "";

    if (sectionNavTitle) {
      sectionNavTitle.textContent = label;
    }

    if (prevButton) {
      prevButton.disabled = activeIndex <= 0;

      prevButton.setAttribute(
        "aria-disabled",
        String(activeIndex <= 0)
      );
    }

    if (nextButton) {
      nextButton.disabled =
        activeIndex >= sections.length - 1;

      nextButton.setAttribute(
        "aria-disabled",
        String(activeIndex >= sections.length - 1)
      );
    }

    if (sectionNav) {
      const isLight = section.classList.contains("story-light");

      sectionNav.dataset.theme = isLight
        ? "light"
        : "dark";
    }

    html.dataset.activeSection =
      section.id || String(activeIndex + 1);
  }


  function getActiveSection() {
    if (!sections.length) {
      return 0;
    }

    const viewportHeight = window.innerHeight;

    const readingLine =
      getHeaderHeight() +
      Math.min(
        viewportHeight * CONFIG.activeLineViewportRatio,
        CONFIG.activeLineMax
      );

    let containingSection = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= readingLine &&
        rect.bottom > readingLine
      ) {
        containingSection = section;
        break;
      }
    }

    if (containingSection) {
      return sections.indexOf(containingSection);
    }

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      const distance = Math.abs(
        rect.top - readingLine
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }


  function updateActiveSection() {
    if (scrollFrame) {
      return;
    }

    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;

      const nextIndex = getActiveSection();

      if (nextIndex !== activeIndex) {
        setActiveSection(nextIndex);
      } else {
        setActiveSection(activeIndex);
      }
    });
  }


  function scrollToSection(index, smooth = true) {
    if (!sections[index]) {
      return;
    }

    const section = sections[index];

    const absoluteTop =
      window.scrollY +
      section.getBoundingClientRect().top;

    const target =
      absoluteTop -
      getHeaderHeight() -
      CONFIG.scrollOffset;

    window.scrollTo({
      top: Math.max(0, target),
      behavior:
        smooth && !reducedMotion
          ? "smooth"
          : "auto"
    });

    setActiveSection(index);
  }


  prevButton?.addEventListener("click", () => {
    if (activeIndex > 0) {
      scrollToSection(activeIndex - 1);
    }
  });


  nextButton?.addEventListener("click", () => {
    if (activeIndex < sections.length - 1) {
      scrollToSection(activeIndex + 1);
    }
  });


  /* ==========================================================
     08. SCROLL / ACTIVE SECTION
     ========================================================== */

  window.addEventListener(
    "scroll",
    updateActiveSection,
    { passive: true }
  );


  /* ==========================================================
     09. GSAP STORY ANIMATIONS
     ========================================================== */

  function killStoryScrollTriggers() {
    if (!ScrollTrigger) {
      return;
    }

    ScrollTrigger.getAll().forEach((trigger) => {
      const id = trigger.vars?.id || "";

      if (id.startsWith("story-")) {
        trigger.kill();
      }
    });
  }


  function initStoryAnimations() {
    if (!GSAP || !ScrollTrigger) {
      return;
    }

    killStoryScrollTriggers();

    animationsInitialized = false;

    if (reducedMotion) {
      sections.forEach((section) => {
        GSAP.set(
          section.querySelectorAll(
            ".story-title, .story-body, .story-eyebrow, .place-map, .person-frame"
          ),
          {
            clearProps: "all"
          }
        );
      });

      ScrollTrigger.refresh();

      animationsInitialized = true;

      return;
    }

    GSAP.registerPlugin(ScrollTrigger);

    sections.forEach((section) => {
      const title =
        section.querySelector(".story-title");

      const bodyCopy =
        section.querySelector(".story-body");

      const eyebrow =
        section.querySelector(".story-eyebrow");

      const map =
        section.querySelector(".place-map");

      const personFrame =
        section.querySelector(".person-frame");

      const opening =
        section.classList.contains("story-opening");

      const understand =
        section.classList.contains("story-understand");

      const returnSection =
        section.classList.contains("story-return");

      const connect =
        section.classList.contains("story-connect");

      const today =
        section.classList.contains("story-today");

      const tl = GSAP.timeline({
        id: `story-${section.id}`,
        defaults: {
          ease: "power3.out"
        },
        scrollTrigger: {
          id: `story-${section.id}`,
          trigger: section,
          start: "top 72%",
          once: true
        }
      });


      /* --------------------------------------------------------
         EYEBROW
         -------------------------------------------------------- */

      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          {
            opacity: 0,
            y: 16
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.55
          },
          0
        );
      }


      /* --------------------------------------------------------
         OPENING
         -------------------------------------------------------- */

      if (opening) {
        if (title) {
          tl.fromTo(
            title,
            {
              opacity: 0,
              y: 70,
              scale: 0.98
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.05
            },
            0.05
          );
        }

        if (bodyCopy) {
          tl.fromTo(
            bodyCopy,
            {
              opacity: 0,
              y: 32
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7
            },
            0.35
          );
        }

        return;
      }


      /* --------------------------------------------------------
         CAPIRE
         -------------------------------------------------------- */

      if (understand) {
        if (title) {
          tl.fromTo(
            title,
            {
              opacity: 0,
              x: -35
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.8
            },
            0.05
          );
        }

        if (bodyCopy) {
          const paragraphs =
            bodyCopy.querySelectorAll("p");

          tl.fromTo(
            paragraphs,
            {
              opacity: 0,
              y: 24
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.12
            },
            0.25
          );
        }

        return;
      }


      /* --------------------------------------------------------
         RITORNA
         -------------------------------------------------------- */

      if (returnSection) {
        if (title) {
          tl.fromTo(
            title,
            {
              opacity: 0,
              x: -50
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.9
            },
            0.05
          );
        }

        if (bodyCopy) {
          tl.fromTo(
            bodyCopy,
            {
              opacity: 0,
              y: 30
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7
            },
            0.35
          );
        }

        return;
      }


      /* --------------------------------------------------------
         COLLEGARE
         -------------------------------------------------------- */

      if (connect) {
        if (title) {
          tl.fromTo(
            title,
            {
              opacity: 0,
              y: 30
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.75
            },
            0.05
          );
        }

        const paragraphs =
          bodyCopy?.querySelectorAll("p");

        if (paragraphs?.length) {
          tl.fromTo(
            paragraphs,
            {
              opacity: 0,
              y: 18
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.08
            },
            0.28
          );
        }

        return;
      }


      /* --------------------------------------------------------
         OGGI
         -------------------------------------------------------- */

      if (today) {
        if (title) {
          tl.fromTo(
            title,
            {
              opacity: 0,
              y: 55
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.9
            },
            0.05
          );
        }

        const lead =
          section.querySelector(".story-body-lead");

        const finalLine =
          section.querySelector(".story-today-final");

        if (lead) {
          tl.fromTo(
            lead,
            {
              opacity: 0,
              y: 25
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6
            },
            0.3
          );
        }

        if (finalLine) {
          tl.fromTo(
            finalLine,
            {
              opacity: 0,
              y: 20
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.55
            },
            0.5
          );
        }

        return;
      }


      /* --------------------------------------------------------
         PLACE
         -------------------------------------------------------- */

      if (map) {
        tl.fromTo(
          map,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75
          },
          0.25
        );
      }


      /* --------------------------------------------------------
         PERSON
         -------------------------------------------------------- */

      if (personFrame) {
        tl.fromTo(
          personFrame,
          {
            opacity: 0,
            y: 35,
            scale: 0.985
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9
          },
          0.2
        );
      }


      /* --------------------------------------------------------
         GENERIC STORY
         -------------------------------------------------------- */

      if (title) {
        tl.fromTo(
          title,
          {
            opacity: 0,
            y: 36
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8
          },
          0.08
        );
      }

      if (bodyCopy) {
        tl.fromTo(
          bodyCopy,
          {
            opacity: 0,
            y: 24
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.65
          },
          0.28
        );
      }
    });

    animationsInitialized = true;

    ScrollTrigger.refresh();
  }


  /* ==========================================================
     10. LOADER
     ========================================================== */

  function hideLoader() {
    if (loaderHidden || !loader) {
      return;
    }

    loaderHidden = true;

    if (reducedMotion || !GSAP) {
      loader.classList.add("is-hidden");
      return;
    }

    GSAP.to(loader, {
      autoAlpha: 0,
      duration: 0.65,
      ease: "power2.out",
      onComplete: () => {
        loader.classList.add("is-hidden");
      }
    });
  }


  function initLoader() {
    if (!loader) {
      return;
    }

    window.addEventListener(
      "load",
      hideLoader,
      { once: true }
    );

    window.setTimeout(
      hideLoader,
      CONFIG.loaderFailsafe
    );
  }


  /* ==========================================================
     11. STANDBY
     ========================================================== */

  function clearStandbyTimer() {
    if (standbyTimer) {
      window.clearTimeout(standbyTimer);
      standbyTimer = null;
    }
  }


  function showStandby() {
    if (
      !standby ||
      menuOpen ||
      isPageHidden()
    ) {
      return;
    }

    standbyVisible = true;

    standby.classList.add("is-visible");
    standby.setAttribute("aria-hidden", "false");
  }


  function hideStandby() {
    if (!standby) {
      return;
    }

    standbyVisible = false;

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  }


  function scheduleStandby() {
    clearStandbyTimer();

    if (
      menuOpen ||
      isPageHidden()
    ) {
      return;
    }

    standbyTimer = window.setTimeout(() => {
      if (
        !menuOpen &&
        !isPageHidden()
      ) {
        showStandby();
      }
    }, CONFIG.standbyDelay);
  }


  function registerActivity(event) {
    const now = performance.now();

    if (
      event?.type === "pointermove" &&
      now - lastActivityTime <
      CONFIG.pointerActivityThrottle
    ) {
      return;
    }

    lastActivityTime = now;

    if (standbyVisible) {
      hideStandby();
    }

    if (!menuOpen) {
      scheduleStandby();
    }
  }


  [
    "pointerdown",
    "keydown",
    "wheel",
    "touchstart",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      registerActivity,
      {
        passive: eventName !== "keydown"
      }
    );
  });


  window.addEventListener(
    "pointermove",
    registerActivity,
    { passive: true }
  );


  standby?.addEventListener(
    "click",
    () => {
      hideStandby();
      scheduleStandby();
    }
  );


  /* ==========================================================
     12. RESPONSIVE / VIEWPORT
     ========================================================== */

  function refreshLayout() {
    if (resizeFrame) {
      return;
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;

      updateActiveSection();

      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    });
  }


  window.addEventListener(
    "resize",
    refreshLayout,
    { passive: true }
  );


  window.addEventListener(
    "orientationchange",
    refreshLayout,
    { passive: true }
  );


  /* ==========================================================
     13. VISIBILITY / BFCACHE
     ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        clearStandbyTimer();
        return;
      }

      scheduleStandby();
      updateActiveSection();

      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }
  );


  window.addEventListener(
    "pageshow",
    (event) => {
      if (menuOpen) {
        closeMenu({
          restoreFocus: false
        });
      }

      if (event.persisted && ScrollTrigger) {
        ScrollTrigger.refresh();
      }

      updateActiveSection();
      scheduleStandby();
    }
  );


  /* ==========================================================
     14. REDUCED MOTION
     ========================================================== */

  function handleMotionPreferenceChange() {
    reducedMotion = motionQuery.matches;

    html.classList.toggle(
      "reduced-motion",
      reducedMotion
    );

    initStoryAnimations();

    if (reducedMotion) {
      hideStandby();
    }

    updateActiveSection();
  }


  if (
    typeof motionQuery.addEventListener === "function"
  ) {
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


  /* ==========================================================
     15. INITIAL HASH
     ========================================================== */

  function handleInitialHash() {
    if (!window.location.hash) {
      return;
    }

    const rawId =
      window.location.hash.slice(1);

    if (!rawId) {
      return;
    }

    const target =
      document.getElementById(rawId);

    if (!target || !sections.includes(target)) {
      return;
    }

    const index =
      sections.indexOf(target);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(index, false);
      });
    });
  }


  /* ==========================================================
     16. CURRENT YEAR
     ========================================================== */

  if (currentYear) {
    currentYear.textContent =
      String(new Date().getFullYear());
  }


  /* ==========================================================
     17. INITIALIZATION
     ========================================================== */

  function init() {
    updateMenuState(false);

    setActiveSection(0);

    initLoader();

    initStoryAnimations();

    handleInitialHash();

    updateActiveSection();

    scheduleStandby();

    if (ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }


  init();

})();
