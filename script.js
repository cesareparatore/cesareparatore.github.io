(() => {
  "use strict";

  /* =======================================================
     01. CONFIG
     ======================================================= */

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1200,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260
  };


  /* =======================================================
     02. DOM
     ======================================================= */

  const body = document.body;
  const html = document.documentElement;

  const loader = document.getElementById("loader");
  const standby = document.getElementById("standby");

  const header = document.getElementById("site-header");
  const storyNav = document.getElementById("story-nav");

  const menu = document.getElementById("menu");
  const menuToggle = document.getElementById("menu-toggle");
  const menuLinks = [...document.querySelectorAll(".site-menu-link")];

  const activeStoryTitle =
    document.getElementById("active-story-title");

  const prevButton =
    document.getElementById("story-prev");

  const nextButton =
    document.getElementById("story-next");

  const progress =
    document.getElementById("story-progress");

  const progressFill =
    document.querySelector(".story-progress-fill");

  const progressOrb =
    document.querySelector(".story-progress-orb");

  const sections =
    [...document.querySelectorAll(".story-section[data-story-title]")];


  /* =======================================================
     03. STATE
     ======================================================= */

  let activeIndex = 0;
  let menuOpen = false;

  let ticking = false;
  let resizeTimer = 0;
  let standbyTimer = 0;

  let previousFocus = null;

  let suppressHashScroll = false;

  let lastScrollY = window.scrollY;

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)");


  /* =======================================================
     04. HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const getHeaderHeight = () =>
    header?.getBoundingClientRect().height || 0;


  const getReadingLine = () =>
    getHeaderHeight() +
    Math.min(
      window.innerHeight * CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );


  const getSectionData = (section) => ({
    title: section.dataset.storyTitle || "",
    meta: section.dataset.storyMeta || ""
  });


  const getSectionId = (index) =>
    sections[index]?.id || "";


  const getIndexFromHash = () => {
    const hash = window.location.hash.slice(1);

    if (!hash) {
      return -1;
    }

    return sections.findIndex(
      (section) => section.id === hash
    );
  };


  /* =======================================================
     05. HEADER THEME
     ======================================================= */

  const updateHeaderChrome = () => {
    if (!header) {
      return;
    }

    header.style.background = "#0b0b0a";
    header.style.color = "#f1efe8";

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#0b0b0a");
  };


  /* =======================================================
     06. MENU ARIA
     ======================================================= */

  const updateMenuAria = (open) => {
    if (!menu || !menuToggle) {
      return;
    }

    menu.setAttribute("aria-hidden", String(!open));

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuToggle.setAttribute(
      "aria-label",
      open ? "Chiudi menu" : "Apri menu"
    );

    if (open) {
      menu.removeAttribute("inert");
      menu.inert = false;
    } else {
      menu.setAttribute("inert", "");
      menu.inert = true;
    }
  };


  /* =======================================================
     07. BACKGROUND INERT
     ======================================================= */

  const setBackgroundInert = (inert) => {
    const main = document.getElementById("main-content");

    if (main) {
      main.inert = inert;
    }

    if (storyNav) {
      storyNav.inert = inert;
      storyNav.setAttribute(
        "aria-hidden",
        String(inert)
      );
    }
  };


  /* =======================================================
     08. MENU
     ======================================================= */

  const openMenu = () => {
    if (menuOpen || !menu || !menuToggle) {
      return;
    }

    previousFocus = document.activeElement;
    menuOpen = true;

    body.classList.add("menu-open");
    menu.classList.add("is-open");

    setBackgroundInert(true);
    updateMenuAria(true);

    requestAnimationFrame(() => {
      const firstLink = menuLinks[0];

      if (firstLink) {
        firstLink.focus();
      }
    });
  };


  const closeMenu = ({
    restoreFocus = true
  } = {}) => {
    if (!menuOpen || !menu || !menuToggle) {
      return;
    }

    menuOpen = false;

    body.classList.remove("menu-open");
    menu.classList.remove("is-open");

    setBackgroundInert(false);
    updateMenuAria(false);

    if (
      restoreFocus &&
      previousFocus &&
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus();
    }

    previousFocus = null;
  };


  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };


  /* =======================================================
     09. FOCUS TRAP
     ======================================================= */

  const trapMenuFocus = (event) => {
    if (!menuOpen || event.key !== "Tab") {
      return;
    }

    const focusable = menuLinks.filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true"
    );

    if (!focusable.length) {
      event.preventDefault();
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
  };


  /* =======================================================
     10. ACTIVE SECTION
     ======================================================= */

  const calculateActiveIndex = () => {
    if (!sections.length) {
      return 0;
    }

    const readingLine = getReadingLine();

    let index = 0;

    sections.forEach((section, currentIndex) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= readingLine) {
        index = currentIndex;
      }
    });

    return clamp(
      index,
      0,
      sections.length - 1
    );
  };


  const setActiveSection = (index) => {
    if (!sections.length) {
      return;
    }

    const nextIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const changed = nextIndex !== activeIndex;

    activeIndex = nextIndex;

    const section = sections[activeIndex];
    const data = getSectionData(section);

    if (activeStoryTitle) {
      activeStoryTitle.textContent = data.title;
    }

    menuLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isCurrent =
        href === `#${section.id}`;

      if (isCurrent) {
        link.setAttribute(
          "aria-current",
          "location"
        );
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (prevButton) {
      prevButton.disabled =
        activeIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled =
        activeIndex === sections.length - 1;
    }

    if (changed) {
      updateProgress();
    }
  };


  /* =======================================================
     11. SECTION PROGRESS
     ======================================================= */

  const calculateSectionProgress = (section) => {
    const rect = section.getBoundingClientRect();

    const viewportHeight =
      window.innerHeight;

    const sectionTop =
      window.scrollY + rect.top;

    const sectionHeight =
      Math.max(section.offsetHeight, 1);

    const start =
      sectionTop - viewportHeight;

    const end =
      sectionTop + sectionHeight;

    const progressValue =
      (window.scrollY - start) /
      Math.max(end - start, 1);

    return clamp(
      progressValue,
      0,
      1
    );
  };


  const updateProgress = () => {
    if (
      !sections.length ||
      !progress ||
      !progressFill ||
      !progressOrb
    ) {
      return;
    }

    const section =
      sections[activeIndex];

    if (!section) {
      return;
    }

    const value =
      calculateSectionProgress(section);

    const percentage =
      Math.round(value * 100);

    progress.setAttribute(
      "aria-valuenow",
      String(percentage)
    );

    progressFill.style.width =
      `${percentage}%`;

    progressOrb.style.left =
      `${percentage}%`;
  };


  /* =======================================================
     12. SCROLL UPDATE
     ======================================================= */

  const updateScrollState = () => {
    ticking = false;

    const nextIndex =
      calculateActiveIndex();

    setActiveSection(nextIndex);
    updateProgress();

    lastScrollY = window.scrollY;
  };


  const requestScrollUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(
      updateScrollState
    );
  };


  /* =======================================================
     13. NAVIGATION
     ======================================================= */

  const scrollToStory = (
    index,
    {
      updateHash = true,
      smooth = true
    } = {}
  ) => {
    if (!sections.length) {
      return;
    }

    const targetIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const target =
      sections[targetIndex];

    if (!target) {
      return;
    }

    if (menuOpen) {
      closeMenu({
        restoreFocus: false
      });
    }

    const targetTop =
      window.scrollY +
      target.getBoundingClientRect().top -
      getHeaderHeight() -
      CONFIG.scrollOffset;

    const behavior =
      !reduceMotion.matches &&
      smooth
        ? "smooth"
        : "auto";

    if (updateHash) {
      const hash =
        `#${target.id}`;

      if (window.location.hash !== hash) {
        suppressHashScroll = true;

        history.pushState(
          {
            storyIndex: targetIndex
          },
          "",
          hash
        );
      }
    }

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior
    });

    setActiveSection(targetIndex);

    window.setTimeout(() => {
      suppressHashScroll = false;
      requestScrollUpdate();
    }, smooth ? 700 : 0);
  };


  const navigateRelative = (direction) => {
    scrollToStory(
      activeIndex + direction
    );
  };


  /* =======================================================
     14. HASH / HISTORY
     ======================================================= */

  const handleHash = ({
    smooth = true
  } = {}) => {
    if (suppressHashScroll) {
      return;
    }

    const index =
      getIndexFromHash();

    if (index < 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollToStory(
        index,
        {
          updateHash: false,
          smooth
        }
      );
    });
  };


  /* =======================================================
     15. STANDBY
     ======================================================= */

  const hideStandby = () => {
    if (!standby) {
      return;
    }

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  };


  const showStandby = () => {
    if (!standby || menuOpen) {
      return;
    }

    standby.classList.add("is-visible");
    standby.setAttribute("aria-hidden", "false");
  };


  const resetStandbyTimer = () => {
    hideStandby();

    window.clearTimeout(
      standbyTimer
    );

    standbyTimer =
      window.setTimeout(
        showStandby,
        CONFIG.standbyDelay
      );
  };


  /* =======================================================
     16. LOADER
     ======================================================= */

  let loaderHidden = false;

  const hideLoader = () => {
    if (loaderHidden || !loader) {
      return;
    }

    loaderHidden = true;

    loader.classList.add("is-hidden");

    loader.setAttribute(
      "aria-hidden",
      "true"
    );
  };


  /* =======================================================
     17. KEYBOARD NAVIGATION
     ======================================================= */

  const handleKeyboard = (event) => {
    if (menuOpen) {
      trapMenuFocus(event);

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }

      return;
    }

    const tagName =
      event.target?.tagName;

    const isFormElement =
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      tagName === "BUTTON" ||
      event.target?.isContentEditable;

    if (isFormElement) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "PageDown":
        event.preventDefault();
        navigateRelative(1);
        break;

      case "ArrowUp":
      case "PageUp":
        event.preventDefault();
        navigateRelative(-1);
        break;

      case "Home":
        event.preventDefault();
        scrollToStory(0);
        break;

      case "End":
        event.preventDefault();
        scrollToStory(
          sections.length - 1
        );
        break;

      default:
        break;
    }
  };


  /* =======================================================
     18. GSAP / OPTIONAL MOTION
     ======================================================= */

  const initMotion = () => {
    if (
      reduceMotion.matches ||
      typeof window.gsap === "undefined"
    ) {
      return;
    }

    if (
      typeof window.ScrollTrigger === "undefined"
    ) {
      return;
    }

    window.gsap.registerPlugin(
      window.ScrollTrigger
    );

    const motionSections =
      document.querySelectorAll(
        ".story-section-content"
      );

    motionSections.forEach((content) => {
      window.gsap.fromTo(
        content,
        {
          y: 28,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: content,
            start: "top 84%",
            once: true
          }
        }
      );
    });
  };


  /* =======================================================
     19. EVENTS
     ======================================================= */

  menuToggle?.addEventListener(
    "click",
    toggleMenu
  );

  prevButton?.addEventListener(
    "click",
    () => navigateRelative(-1)
  );

  nextButton?.addEventListener(
    "click",
    () => navigateRelative(1)
  );

  menuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href =
        link.getAttribute("href");

      if (!href?.startsWith("#")) {
        return;
      }

      const index =
        sections.findIndex(
          (section) =>
            `#${section.id}` === href
        );

      if (index < 0) {
        return;
      }

      event.preventDefault();

      scrollToStory(index);
    });
  });

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(() => {
          requestScrollUpdate();

          if (
            typeof window.ScrollTrigger !==
            "undefined"
          ) {
            window.ScrollTrigger.refresh();
          }
        }, 120);
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "orientationchange",
    () => {
      window.setTimeout(
        requestScrollUpdate,
        180
      );
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "keydown",
    handleKeyboard
  );

  window.addEventListener(
    "hashchange",
    () => handleHash({
      smooth: true
    })
  );

  window.addEventListener(
    "popstate",
    () => handleHash({
      smooth: false
    })
  );

  window.addEventListener(
    "pointerdown",
    resetStandbyTimer,
    {
      passive: true
    }
  );

  window.addEventListener(
    "touchstart",
    resetStandbyTimer,
    {
      passive: true
    }
  );

  window.addEventListener(
    "keydown",
    resetStandbyTimer
  );

  window.addEventListener(
    "mousemove",
    resetStandbyTimer,
    {
      passive: true
    }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "visible") {
        requestScrollUpdate();
        resetStandbyTimer();
      } else {
        hideStandby();
      }
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      updateHeaderChrome();
      requestScrollUpdate();
    }
  );


  /* =======================================================
     20. INITIALIZATION
     ======================================================= */

  updateHeaderChrome();
  updateMenuAria(false);
  setBackgroundInert(false);

  setActiveSection(
    calculateActiveIndex()
  );

  requestScrollUpdate();

  /*
   * Il loader è volutamente breve.
   * Non blocca la lettura in attesa di immagini,
   * iframe o risorse esterne.
   */
  window.setTimeout(
    hideLoader,
    CONFIG.loaderMax
  );

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener(
      "load",
      hideLoader,
      {
        once: true
      }
    );
  }

  window.addEventListener(
    "load",
    () => {
      initMotion();
      requestScrollUpdate();
    },
    {
      once: true
    }
  );

  const initialHash =
    getIndexFromHash();

  if (initialHash >= 0) {
    window.setTimeout(() => {
      scrollToStory(
        initialHash,
        {
          updateHash: false,
          smooth: false
        }
      );
    }, 0);
  }

  resetStandbyTimer();

})();
