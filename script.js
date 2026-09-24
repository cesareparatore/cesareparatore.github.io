/* =========================================================
   CESARE PARATORE — HOME
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 3500,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    scrollOffset: 12,
    pointerThrottle: 700
  };

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const standby = doc.getElementById("standby");

  const menuToggle = doc.querySelector(".menu-toggle");
  const menu = doc.getElementById("menu");

  const main = doc.getElementById("main-content");
  const footer = doc.querySelector(".site-footer");

  const sections = Array.from(doc.querySelectorAll(".story"));

  const sectionNav = doc.querySelector(".section-nav");
  const sectionPrev = doc.querySelector(".section-nav-prev");
  const sectionNext = doc.querySelector(".section-nav-next");
  const sectionNumber = doc.querySelector(".section-nav-number");
  const sectionTitle = doc.querySelector(".section-nav-title");

  const currentYear = doc.getElementById("current-year");

  let currentIndex = 0;
  let menuOpen = false;
  let standbyTimer = null;
  let loaderHidden = false;
  let lastPointerActivity = 0;
  let menuFocusables = [];
  let restoreFocusElement = null;
  let scrollTicking = false;

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

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
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter((element) => {
      const style = window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    });
  };

  /* =======================================================
     YEAR
     ======================================================= */

  if (currentYear) {
    currentYear.textContent =
      String(new Date().getFullYear());
  }

  /* =======================================================
     MENU
     ======================================================= */

  function setMenuTabState(disabled) {
    if (!menu) return;

    getFocusableElements(menu).forEach((element) => {
      if (disabled) {
        element.dataset.menuTabindex =
          element.getAttribute("tabindex") ?? "";

        element.setAttribute("tabindex", "-1");
      } else {
        const previous =
          element.dataset.menuTabindex;

        if (previous === "") {
          element.removeAttribute("tabindex");
        } else if (previous !== undefined) {
          element.setAttribute("tabindex", previous);
        }

        delete element.dataset.menuTabindex;
      }
    });
  }

  function setBackgroundInteractionDisabled(disabled) {
    if (main) {
      main.inert = disabled;
      main.setAttribute(
        "aria-hidden",
        disabled ? "true" : "false"
      );
    }

    if (footer) {
      footer.inert = disabled;
      footer.setAttribute(
        "aria-hidden",
        disabled ? "true" : "false"
      );
    }
  }

  function updateMenuLabel() {
    if (!menuToggle) return;

    const label =
      menuToggle.querySelector(".menu-label");

    menuToggle.setAttribute(
      "aria-expanded",
      String(menuOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      menuOpen ? "Chiudi menu" : "Apri menu"
    );

    if (label) {
      label.textContent =
        menuOpen ? "CHIUDI" : "MENU";
    }
  }

  function updateMenuState(forceOpen = null) {
    if (!menu || !menuToggle) return;

    const shouldOpen =
      forceOpen === null
        ? !menuOpen
        : Boolean(forceOpen);

    menuOpen = shouldOpen;

    menu.classList.toggle(
      "is-open",
      menuOpen
    );

    menu.setAttribute(
      "aria-hidden",
      String(!menuOpen)
    );

    setBackgroundInteractionDisabled(menuOpen);
    setMenuTabState(!menuOpen);
    updateMenuLabel();

    html.classList.toggle(
      "menu-is-open",
      menuOpen
    );

    body.classList.toggle(
      "menu-is-open",
      menuOpen
    );

    if (menuOpen) {
      restoreFocusElement = doc.activeElement;

      requestAnimationFrame(() => {
        menuFocusables =
          getFocusableElements(menu);

        menuFocusables[0]?.focus();
      });
    } else {
      const target =
        restoreFocusElement &&
        typeof restoreFocusElement.focus === "function"
          ? restoreFocusElement
          : menuToggle;

      requestAnimationFrame(() => {
        target.focus?.();
      });

      restoreFocusElement = null;
    }
  }

  function trapMenuFocus(event) {
    if (!menuOpen || event.key !== "Tab") {
      return;
    }

    menuFocusables =
      getFocusableElements(menu);

    if (!menuFocusables.length) {
      event.preventDefault();
      return;
    }

    const first = menuFocusables[0];
    const last =
      menuFocusables[menuFocusables.length - 1];

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
  }

  menuToggle?.addEventListener(
    "click",
    () => updateMenuState()
  );

  menu?.addEventListener(
    "click",
    (event) => {
      const link =
        event.target.closest("a");

      if (link) {
        updateMenuState(false);
      }
    }
  );

  doc.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        menuOpen
      ) {
        event.preventDefault();
        updateMenuState(false);
        return;
      }

      trapMenuFocus(event);
    }
  );

  /* =======================================================
     STANDBY
     ======================================================= */

  function hideStandby() {
    if (!standby) return;

    standby.classList.remove(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function showStandby() {
    if (
      !standby ||
      menuOpen ||
      doc.hidden
    ) {
      return;
    }

    standby.classList.add(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function resetStandbyTimer() {
    if (standbyTimer) {
      clearTimeout(standbyTimer);
    }

    hideStandby();

    standbyTimer = setTimeout(
      showStandby,
      CONFIG.standbyDelay
    );
  }

  function handleActivity() {
    resetStandbyTimer();
  }

  [
    "scroll",
    "wheel",
    "touchstart",
    "keydown",
    "click"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      handleActivity,
      { passive: true }
    );
  });

  window.addEventListener(
    "pointermove",
    () => {
      const now = Date.now();

      if (
        now - lastPointerActivity <
        CONFIG.pointerThrottle
      ) {
        return;
      }

      lastPointerActivity = now;
      handleActivity();
    },
    { passive: true }
  );

  /* =======================================================
     LOADER
     ======================================================= */

  function hideLoader() {
    if (
      loaderHidden ||
      !loader
    ) {
      return;
    }

    loaderHidden = true;

    const finish = () => {
      loader.setAttribute(
        "aria-hidden",
        "true"
      );

      loader.style.display = "none";
    };

    if (
      reduceMotionQuery.matches ||
      !window.gsap
    ) {
      finish();
      return;
    }

    window.gsap.to(loader, {
      opacity: 0,
      duration: 0.65,
      ease: "power2.out",
      onComplete: finish
    });
  }

  function initLoader() {
    setTimeout(
      hideLoader,
      CONFIG.loaderFailsafe
    );

    if (
      document.readyState ===
      "complete"
    ) {
      setTimeout(hideLoader, 120);
      return;
    }

    window.addEventListener(
      "load",
      () => setTimeout(hideLoader, 120),
      { once: true }
    );
  }

  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  function getReadingLine() {
    const headerHeight =
      document.querySelector(
        ".site-header"
      )?.offsetHeight || 0;

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

    const line =
      getReadingLine();

    let bestIndex = 0;
    let bestDistance =
      Number.POSITIVE_INFINITY;

    sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <= line &&
          rect.bottom >= line
        ) {
          bestIndex = index;
          bestDistance = 0;
          return;
        }

        const center =
          rect.top + rect.height / 2;

        const distance =
          Math.abs(center - line);

        if (
          distance < bestDistance
        ) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    );

    return bestIndex;
  }

  function updateSectionNavigation(
    index = getActiveSectionIndex()
  ) {
    if (
      !sections.length ||
      !sectionNav
    ) {
      return;
    }

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
      sectionPrev.disabled =
        index === 0;

      sectionPrev.setAttribute(
        "aria-label",
        index === 0
          ? "Sezione precedente non disponibile"
          : `Vai a ${
              sections[index - 1]
                .dataset.title ||
              "sezione precedente"
            }`
      );
    }

    if (sectionNext) {
      sectionNext.disabled =
        index === sections.length - 1;

      sectionNext.setAttribute(
        "aria-label",
        index === sections.length - 1
          ? "Sezione successiva non disponibile"
          : `Vai a ${
              sections[index + 1]
                .dataset.title ||
              "sezione successiva"
            }`
      );
    }

    sectionNav.dataset.theme =
      section.classList.contains(
        "story-light"
      )
        ? "light"
        : "dark";

    html.dataset.activeSection =
      section.id || "";

    sections.forEach(
      (item, itemIndex) => {
        item.setAttribute(
          "aria-current",
          itemIndex === index
            ? "true"
            : "false"
        );
      }
    );
  }

  function scrollToSection(index) {
    const section =
      sections[index];

    if (!section) return;

    const top =
      window.scrollY +
      section.getBoundingClientRect().top -
      CONFIG.scrollOffset;

    window.scrollTo({
      top,
      behavior:
        reduceMotionQuery.matches
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
     KEYBOARD
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

      if (
        event.key === "ArrowDown" &&
        doc.activeElement === body
      ) {
        event.preventDefault();

        scrollToSection(
          Math.min(
            currentIndex + 1,
            sections.length - 1
          )
        );
      }

      if (
        event.key === "ArrowUp" &&
        doc.activeElement === body
      ) {
        event.preventDefault();

        scrollToSection(
          Math.max(
            currentIndex - 1,
            0
          )
        );
      }
    }
  );

  /* =======================================================
     SCROLL
     ======================================================= */

  function requestSectionUpdate() {
    if (scrollTicking) return;

    scrollTicking = true;

    requestAnimationFrame(() => {
      updateSectionNavigation();
      scrollTicking = false;
    });
  }

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

  /* =======================================================
     GSAP
     ======================================================= */

  function gsapAvailable() {
    return (
      !reduceMotionQuery.matches &&
      window.gsap &&
      window.ScrollTrigger
    );
  }

  function prepareAnimationElements(
    elements
  ) {
    if (!elements.length) return;

    window.gsap.set(elements, {
      opacity: 0,
      y: 30
    });
  }

  function showImmediately() {
    sections.forEach(
      (section) => {
        section
          .querySelectorAll(
            [
              "h1",
              "h2",
              ".narrative-copy",
              ".today-lead",
              ".contact-lead",
              ".connect-words span",
              ".return-list span",
              ".objective-flow span",
              ".map-frame",
              ".person-frame"
            ].join(",")
          )
          .forEach((element) => {
            element.style.opacity = "1";
            element.style.transform =
              "none";
          });
      }
    );
  }

  function killStoryAnimations() {
    if (!window.ScrollTrigger) {
      return;
    }

    window.ScrollTrigger.getAll()
      .filter(
        (trigger) =>
          trigger.vars?.id &&
          String(trigger.vars.id)
            .startsWith("story-")
      )
      .forEach((trigger) => {
        trigger.kill();
      });
  }

  function animateSection(
    section,
    index
  ) {
    const heading =
      section.querySelector(
        "h1, h2"
      );

    const copy =
      section.querySelectorAll(
        ".narrative-copy p"
      );

    const special =
      section.querySelectorAll(
        [
          ".connect-words span",
          ".return-list span",
          ".objective-flow span",
          ".presence-online",
          ".map-frame",
          ".person-frame"
        ].join(",")
      );

    const elements = [
      heading,
      ...Array.from(copy),
      ...Array.from(special)
    ].filter(Boolean);

    if (!elements.length) return;

    prepareAnimationElements(
      elements
    );

    const timeline =
      window.gsap.timeline({
        scrollTrigger: {
          id: `story-${index}`,
          trigger: section,
          start: "top 78%",
          end: "bottom 22%",
          toggleActions:
            "play reverse play reverse"
        }
      });

    if (heading) {
      timeline.to(heading, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power4.out"
      });
    }

    if (copy.length) {
      timeline.to(
        copy,
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out"
        },
        "-=0.35"
      );
    }

    if (special.length) {
      timeline.to(
        special,
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: "power3.out"
        },
        "-=0.3"
      );
    }
  }

  function initStoryAnimations() {
    killStoryAnimations();

    if (!gsapAvailable()) {
      showImmediately();
      return;
    }

    window.gsap.registerPlugin(
      window.ScrollTrigger
    );

    sections.forEach(
      animateSection
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
     HASH
     ======================================================= */

  function handleInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) return;

    let id;

    try {
      id = decodeURIComponent(
        hash.slice(1)
      );
    } catch {
      return;
    }

    const target =
      doc.getElementById(id);

    if (!target) return;

    setTimeout(() => {
      target.scrollIntoView({
        behavior:
          reduceMotionQuery.matches
            ? "auto"
            : "smooth",
        block: "start"
      });
    }, 250);
  }

  /* =======================================================
     VISIBILITY / BFCACHE
     ======================================================= */

  doc.addEventListener(
    "visibilitychange",
    () => {
      if (doc.hidden) {
        hideStandby();
      } else {
        resetStandbyTimer();

        window.ScrollTrigger?.refresh();
      }
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      resetStandbyTimer();

      window.ScrollTrigger?.refresh();

      requestSectionUpdate();
    }
  );

  /* =======================================================
     INIT
     ======================================================= */

  function init() {
    setMenuTabState(true);
    updateMenuState(false);

    updateSectionNavigation(0);

    initLoader();
    initStoryAnimations();

    handleInitialHash();

    setTimeout(
      updateSectionNavigation,
      50
    );

    resetStandbyTimer();

    if (window.ScrollTrigger) {
      setTimeout(() => {
        window.ScrollTrigger.refresh();
        requestSectionUpdate();
      }, 150);
    }
  }

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
