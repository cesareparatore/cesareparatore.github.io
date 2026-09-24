/* =========================================================
   CESARE PARATORE — HOME
   MAXIMUM QUALITY
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = Object.freeze({
    standbyDelay: 40000,
    loaderFailsafe: 3500,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    scrollOffset: 8,
    activityThrottle: 500,
    resizeDebounce: 120
  });

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const standby = doc.getElementById("standby");

  const header = doc.querySelector(".site-header");
  const menuToggle = doc.querySelector(".menu-toggle");
  const menu = doc.getElementById("menu");

  const main = doc.getElementById("main-content");
  const footer = doc.querySelector(".site-footer");

  const sections = Array.from(
    doc.querySelectorAll(".story")
  );

  const sectionNav = doc.querySelector(".section-nav");
  const sectionPrev = doc.querySelector(".section-nav-prev");
  const sectionNext = doc.querySelector(".section-nav-next");
  const sectionNumber = doc.querySelector(".section-nav-number");
  const sectionTitle = doc.querySelector(".section-nav-title");

  const currentYear = doc.getElementById("current-year");

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let currentIndex = 0;
  let menuOpen = false;
  let standbyTimer = null;
  let loaderHidden = false;
  let lastActivity = 0;
  let scrollFrame = 0;
  let resizeTimer = 0;
  let restoreFocusElement = null;

  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isElementVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      parseFloat(style.opacity || "1") > 0
    );
  };

  const getFocusableElements = (container) => {
    if (!container) return [];

    return Array.from(
      container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "summary",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter(isElementVisible);
  };

  const getGsap = () =>
    window.gsap && window.ScrollTrigger
      ? window.gsap
      : null;

  const prefersReducedMotion = () =>
    reduceMotionQuery.matches;

  /* =======================================================
     YEAR
     ======================================================= */

  if (currentYear) {
    currentYear.textContent = String(
      new Date().getFullYear()
    );
  }

  /* =======================================================
     STANDBY
     ======================================================= */

  function hideStandby() {
    if (!standby) return;

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  }

  function showStandby() {
    if (!standby || menuOpen || doc.hidden) return;

    standby.classList.add("is-visible");
    standby.setAttribute("aria-hidden", "false");
  }

  function resetStandbyTimer() {
    if (standbyTimer) {
      window.clearTimeout(standbyTimer);
    }

    hideStandby();

    standbyTimer = window.setTimeout(
      showStandby,
      CONFIG.standbyDelay
    );
  }

  function registerActivity() {
    const now = Date.now();

    if (
      now - lastActivity <
      CONFIG.activityThrottle
    ) {
      return;
    }

    lastActivity = now;
    resetStandbyTimer();
  }

  [
    "scroll",
    "wheel",
    "touchstart",
    "keydown",
    "click",
    "pointerdown"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      registerActivity,
      {
        passive: true
      }
    );
  });

  window.addEventListener(
    "pointermove",
    registerActivity,
    {
      passive: true
    }
  );

  /* =======================================================
     MENU
     ======================================================= */

  function updateMenuVisualState() {
    if (!menuToggle) return;

    const label =
      menuToggle.querySelector(".menu-label");

    menuToggle.setAttribute(
      "aria-expanded",
      String(menuOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      menuOpen
        ? "Chiudi menu"
        : "Apri menu"
    );

    if (label) {
      label.textContent =
        menuOpen
          ? "CHIUDI"
          : "MENU";
    }

    if (header) {
      header.classList.toggle(
        "menu-active",
        menuOpen
      );
    }
  }

  function setBackgroundInert(isInert) {
    [main, footer].forEach((element) => {
      if (!element) return;

      element.inert = isInert;

      if (isInert) {
        element.setAttribute(
          "aria-hidden",
          "true"
        );
      } else {
        element.removeAttribute("aria-hidden");
      }
    });
  }

  function updateMenuState(forceState = null) {
    if (!menu || !menuToggle) return;

    const nextState =
      forceState === null
        ? !menuOpen
        : Boolean(forceState);

    if (nextState === menuOpen) return;

    if (nextState) {
      restoreFocusElement = doc.activeElement;
      menuOpen = true;

      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      menu.inert = false;

      setBackgroundInert(true);

      html.classList.add("menu-is-open");
      body.classList.add("menu-is-open");

      updateMenuVisualState();

      requestAnimationFrame(() => {
        const focusables =
          getFocusableElements(menu);

        focusables[0]?.focus();
      });

      return;
    }

    menuOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.inert = true;

    setBackgroundInert(false);

    html.classList.remove("menu-is-open");
    body.classList.remove("menu-is-open");

    updateMenuVisualState();

    const target =
      restoreFocusElement &&
      typeof restoreFocusElement.focus === "function"
        ? restoreFocusElement
        : menuToggle;

    restoreFocusElement = null;

    requestAnimationFrame(() => {
      target?.focus?.();
    });
  }

  menuToggle?.addEventListener(
    "click",
    () => {
      updateMenuState();
    }
  );

  menu?.addEventListener(
    "click",
    (event) => {
      const link =
        event.target.closest("a");

      if (!link) return;

      updateMenuState(false);
    }
  );

  doc.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        updateMenuState(false);
        return;
      }

      if (
        !menuOpen ||
        event.key !== "Tab"
      ) {
        return;
      }

      const focusables =
        getFocusableElements(menu);

      if (!focusables.length) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last =
        focusables[focusables.length - 1];

      if (
        event.shiftKey &&
        doc.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        doc.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  );

  /* =======================================================
     LOADER
     ======================================================= */

  function hideLoader() {
    if (loaderHidden || !loader) return;

    loaderHidden = true;

    const finish = () => {
      loader.setAttribute(
        "aria-hidden",
        "true"
      );

      loader.style.display = "none";
    };

    const gsap = getGsap();

    if (
      prefersReducedMotion() ||
      !gsap
    ) {
      finish();
      return;
    }

    gsap.to(loader, {
      opacity: 0,
      duration: 0.55,
      ease: "power2.out",
      onComplete: finish
    });
  }

  function initLoader() {
    window.setTimeout(
      hideLoader,
      CONFIG.loaderFailsafe
    );

    if (doc.readyState === "complete") {
      window.setTimeout(
        hideLoader,
        100
      );
      return;
    }

    window.addEventListener(
      "load",
      () => {
        window.setTimeout(
          hideLoader,
          100
        );
      },
      { once: true }
    );
  }

  /* =======================================================
     SECTION STATE
     ======================================================= */

  function getReadingLine() {
    const headerHeight =
      header?.offsetHeight || 0;

    return (
      headerHeight +
      Math.min(
        window.innerHeight *
          CONFIG.activeLineRatio,
        CONFIG.activeLineMax
      )
    );
  }

  function getActiveSectionIndex() {
    if (!sections.length) return 0;

    const readingLine =
      getReadingLine();

    let bestIndex = 0;
    let bestDistance =
      Number.POSITIVE_INFINITY;

    sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <= readingLine &&
          rect.bottom >= readingLine
        ) {
          bestIndex = index;
          bestDistance = 0;
          return;
        }

        const center =
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            center - readingLine
          );

        if (
          distance <
          bestDistance
        ) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    );

    return bestIndex;
  }

  function updateHeaderTheme(section) {
    if (!header || !section) return;

    const isLight =
      section.classList.contains(
        "story-light"
      );

    header.dataset.headerTheme =
      isLight
        ? "light"
        : "dark";
  }

  function updateSectionNavigation(
    index = getActiveSectionIndex()
  ) {
    if (!sections.length) return;

    index = clamp(
      index,
      0,
      sections.length - 1
    );

    currentIndex = index;

    const section =
      sections[index];

    const title =
      section.dataset.title ||
      section.querySelector(
        "h1, h2"
      )?.textContent?.trim() ||
      "";

    if (sectionNumber) {
      sectionNumber.textContent =
        String(index + 1)
          .padStart(2, "0");
    }

    if (sectionTitle) {
      sectionTitle.textContent =
        title;
    }

    if (sectionPrev) {
      const disabled =
        index === 0;

      sectionPrev.disabled =
        disabled;

      sectionPrev.setAttribute(
        "aria-label",
        disabled
          ? "Sezione precedente non disponibile"
          : `Vai a ${
              sections[index - 1]
                .dataset.title ||
              "sezione precedente"
            }`
      );
    }

    if (sectionNext) {
      const disabled =
        index ===
        sections.length - 1;

      sectionNext.disabled =
        disabled;

      sectionNext.setAttribute(
        "aria-label",
        disabled
          ? "Sezione successiva non disponibile"
          : `Vai a ${
              sections[index + 1]
                .dataset.title ||
              "sezione successiva"
            }`
      );
    }

    if (sectionNav) {
      sectionNav.dataset.theme =
        section.classList.contains(
          "story-light"
        )
          ? "light"
          : "dark";
    }

    updateHeaderTheme(section);

    html.dataset.activeSection =
      section.id || "";
  }

  function updateUrl(section) {
    if (
      !section?.id ||
      !window.history?.replaceState
    ) {
      return;
    }

    const url =
      `${window.location.pathname}` +
      `${window.location.search}` +
      `#${encodeURIComponent(section.id)}`;

    window.history.replaceState(
      null,
      "",
      url
    );
  }

  function scrollToSection(
    index,
    updateHash = true
  ) {
    const section =
      sections[index];

    if (!section) return;

    const top =
      window.scrollY +
      section.getBoundingClientRect()
        .top -
      CONFIG.scrollOffset;

    if (updateHash) {
      updateUrl(section);
    }

    window.scrollTo({
      top,
      behavior:
        prefersReducedMotion()
          ? "auto"
          : "smooth"
    });
  }

  sectionPrev?.addEventListener(
    "click",
    () => {
      if (currentIndex > 0) {
        scrollToSection(
          currentIndex - 1
        );
      }
    }
  );

  sectionNext?.addEventListener(
    "click",
    () => {
      if (
        currentIndex <
        sections.length - 1
      ) {
        scrollToSection(
          currentIndex + 1
        );
      }
    }
  );

  /* =======================================================
     KEYBOARD SECTION NAVIGATION
     ======================================================= */

  doc.addEventListener(
    "keydown",
    (event) => {
      if (
        menuOpen ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      const target =
        event.target;

      const isFormControl =
        target instanceof
          HTMLInputElement ||
        target instanceof
          HTMLTextAreaElement ||
        target instanceof
          HTMLSelectElement ||
        target instanceof
          HTMLButtonElement ||
        target?.isContentEditable;

      if (isFormControl) {
        return;
      }

      if (
        event.key === "ArrowDown"
      ) {
        event.preventDefault();

        if (
          currentIndex <
          sections.length - 1
        ) {
          scrollToSection(
            currentIndex + 1
          );
        }
      }

      if (
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        if (currentIndex > 0) {
          scrollToSection(
            currentIndex - 1
          );
        }
      }
    }
  );

  /* =======================================================
     SCROLL / RESIZE
     ======================================================= */

  function requestSectionUpdate() {
    if (scrollFrame) return;

    scrollFrame =
      window.requestAnimationFrame(
        () => {
          updateSectionNavigation();
          scrollFrame = 0;
        }
      );
  }

  window.addEventListener(
    "scroll",
    requestSectionUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(
          () => {
            requestSectionUpdate();

            if (window.ScrollTrigger) {
              window.ScrollTrigger.refresh();
            }
          },
          CONFIG.resizeDebounce
        );
    },
    { passive: true }
  );

  /* =======================================================
     GSAP
     ======================================================= */

  function revealWithoutAnimation() {
    sections.forEach(
      (section) => {
        section
          .querySelectorAll(
            [
              ".eyebrow",
              "h1",
              "h2",
              "p",
              ".return-list span",
              ".connect-words span",
              ".person-frame",
              ".map-frame",
              ".understand-lead",
              ".build-lead",
              ".from-here-lead",
              ".objective-list"
            ].join(",")
          )
          .forEach(
            (element) => {
              element.style.opacity = "1";
              element.style.transform =
                "none";
            }
          );
      }
    );
  }

  function killStoryAnimations() {
    if (!window.ScrollTrigger) {
      return;
    }

    window.ScrollTrigger
      .getAll()
      .filter(
        (trigger) =>
          String(
            trigger.vars?.id || ""
          ).startsWith("story-")
      )
      .forEach(
        (trigger) => trigger.kill()
      );
  }

  function initStoryAnimations() {
    const gsap = getGsap();

    killStoryAnimations();

    if (
      !gsap ||
      prefersReducedMotion()
    ) {
      revealWithoutAnimation();
      return;
    }

    gsap.registerPlugin(
      window.ScrollTrigger
    );

    sections.forEach(
      (section, index) => {
        const eyebrow =
          section.querySelector(
            ".eyebrow"
          );

        const heading =
          section.querySelector(
            "h1, h2"
          );

        const paragraphs =
          Array.from(
            section.querySelectorAll(
              ".narrative-copy p, " +
              ".opening-copy p, " +
              ".today-lead, " +
              ".contact-lead"
            )
          );

        const animate = (
          targets,
          options = {}
        ) => {
          const validTargets =
            Array.from(
              targets || []
            ).filter(Boolean);

          if (!validTargets.length) {
            return;
          }

          gsap.from(
            validTargets,
            {
              opacity: 0,
              y: 30,
              duration: 0.75,
              stagger: 0.08,
              ease: "power3.out",
              ...options,
              scrollTrigger: {
                id:
                  `story-${index}-${options.name || "content"}`,
                trigger: section,
                start:
                  options.start ||
                  "top 72%",
                once: true
              }
            }
          );
        };

        if (
          section.classList.contains(
            "story-opening"
          )
        ) {
          const timeline =
            gsap.timeline({
              scrollTrigger: {
                id:
                  `story-${index}-opening`,
                trigger: section,
                start: "top 70%",
                once: true
              }
            });

          if (eyebrow) {
            timeline.from(
              eyebrow,
              {
                opacity: 0,
                y: 18,
                duration: 0.55,
                ease: "power3.out"
              }
            );
          }

          if (heading) {
            timeline.from(
              heading,
              {
                opacity: 0,
                y: 40,
                duration: 0.85,
                ease: "power4.out"
              },
              "-=0.3"
            );
          }

          if (paragraphs.length) {
            timeline.from(
              paragraphs,
              {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out"
              },
              "-=0.25"
            );
          }

          return;
        }

        if (
          section.classList.contains(
            "story-understand"
          )
        ) {
          animate(
            section.querySelectorAll(
              ".understand-lead, .narrative-copy"
            ),
            {
              name: "understand",
              y: 38,
              duration: 0.8,
              stagger: 0.12,
              start: "top 68%"
            }
          );

          return;
        }

        if (
          section.classList.contains(
            "story-return"
          )
        ) {
          animate(
            section.querySelectorAll(
              ".return-copy > p, .return-list span"
            ),
            {
              name: "return",
              y: 28,
              duration: 0.7,
              stagger: 0.1,
              start: "top 68%"
            }
          );

          return;
        }

        if (
          section.classList.contains(
            "story-connect"
          )
        ) {
          animate(
            section.querySelectorAll(
              ".connect-words span"
            ),
            {
              name: "connect",
              x: -28,
              y: 0,
              duration: 0.62,
              stagger: 0.09,
              start: "top 68%"
            }
          );

          animate(
            [
              section.querySelector(
                ".narrative-copy"
              )
            ],
            {
              name: "connect-copy",
              y: 28,
              duration: 0.7,
              start: "top 68%"
            }
          );

          return;
        }

        if (
          section.classList.contains(
            "story-today"
          )
        ) {
          const timeline =
            gsap.timeline({
              scrollTrigger: {
                id:
                  `story-${index}-today`,
                trigger: section,
                start: "top 68%",
                once: true
              }
            });

          if (heading) {
            timeline.from(
              heading,
              {
                opacity: 0,
                y: 35,
                duration: 0.75,
                ease: "power4.out"
              }
            );
          }

          const todayLead =
            section.querySelector(
              ".today-lead"
            );

          if (todayLead) {
            timeline.from(
              todayLead,
              {
                opacity: 0,
                y: 35,
                duration: 0.75,
                ease: "power4.out"
              },
              "-=0.3"
            );
          }

          const copy =
            section.querySelector(
              ".narrative-copy"
            );

          if (copy) {
            timeline.from(
              copy,
              {
                opacity: 0,
                y: 25,
                duration: 0.65,
                ease: "power3.out"
              },
              "-=0.3"
            );
          }

          return;
        }

        const frame =
          section.querySelector(
            ".person-frame, .map-frame"
          );

        if (frame) {
          animate(
            [frame],
            {
              name: "frame",
              y: 35,
              duration: 0.9,
              start: "top 70%"
            }
          );
        }

        animate(
          [
            eyebrow,
            heading,
            ...paragraphs
          ],
          {
            name: "generic",
            y: 28,
            duration: 0.72,
            stagger: 0.08,
            start: "top 72%"
          }
        );
      }
    );

    window.ScrollTrigger.refresh();
  }

  /* =======================================================
     MOTION PREFERENCE
     ======================================================= */

  function handleMotionPreferenceChange() {
    initStoryAnimations();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }

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
      handleMotionPreferenceChange
    );
  }

  /* =======================================================
     HASH NAVIGATION
     ======================================================= */

  function getHashTarget() {
    const rawHash =
      window.location.hash;

    if (!rawHash) return null;

    const id =
      decodeURIComponent(
        rawHash.slice(1)
      );

    return doc.getElementById(id);
  }

  function handleInitialHash() {
    const target =
      getHashTarget();

    if (!target) return;

    const index =
      sections.indexOf(target);

    if (index === -1) return;

    window.setTimeout(
      () => {
        scrollToSection(
          index,
          false
        );
        updateSectionNavigation(
          index
        );
      },
      80
    );
  }

  window.addEventListener(
    "hashchange",
    () => {
      const target =
        getHashTarget();

      if (!target) return;

      const index =
        sections.indexOf(target);

      if (index === -1) return;

      scrollToSection(
        index,
        false
      );
    }
  );

  /* =======================================================
     VISIBILITY / BF CACHE
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (doc.hidden) {
        hideStandby();
        return;
      }

      resetStandbyTimer();

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      requestSectionUpdate();
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      resetStandbyTimer();

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      requestSectionUpdate();
    }
  );

  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function init() {
    if (menu) {
      menuOpen = false;
      menu.inert = true;
      menu.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    updateMenuVisualState();

    updateSectionNavigation(0);

    initLoader();
    initStoryAnimations();
    handleInitialHash();
    resetStandbyTimer();

    window.setTimeout(
      () => {
        updateSectionNavigation();
      },
      50
    );

    if (window.ScrollTrigger) {
      window.setTimeout(
        () => {
          window.ScrollTrigger.refresh();
        },
        150
      );
    }
  }

  if (
    doc.readyState === "loading"
  ) {
    doc.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
