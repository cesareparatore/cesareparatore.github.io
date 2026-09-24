/* =========================================================
   CESARE PARATORE — HOME
   STANDARD OPERATIVO — MAXIMUM QUALITY
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 3500,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    scrollOffset: 12,
    pointerThrottle: 700
  };

  /* =======================================================
     DOM
     ======================================================= */

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const standby = doc.getElementById("standby");

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

  /* =======================================================
     STATE
     ======================================================= */

  let currentIndex = 0;
  let menuOpen = false;
  let standbyTimer = null;
  let loaderHidden = false;
  let lastPointerActivity = 0;

  let menuFocusables = [];
  let restoreFocusElement = null;

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* =======================================================
     HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
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
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter(isVisible);
  };

  /* =======================================================
     CURRENT YEAR
     ======================================================= */

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  /* =======================================================
     ACCESSIBILITY / MENU
     ======================================================= */

  function setMenuTabState(disabled) {
    if (!menu) return;

    const focusables = getFocusableElements(menu);

    focusables.forEach((element) => {
      if (disabled) {
        element.dataset.menuTabindex = element.getAttribute("tabindex") ?? "";
        element.setAttribute("tabindex", "-1");
      } else {
        const previous = element.dataset.menuTabindex;

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
      main.setAttribute("aria-hidden", disabled ? "true" : "false");
    }

    if (footer) {
      footer.inert = disabled;
      footer.setAttribute("aria-hidden", disabled ? "true" : "false");
    }
  }

  function updateMenuLabel() {
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
  }

  function updateMenuState(forceOpen = null) {
    if (!menu || !menuToggle) return;

    const shouldOpen =
      forceOpen === null ? !menuOpen : Boolean(forceOpen);

    menuOpen = shouldOpen;

    menu.classList.toggle("is-open", menuOpen);
    menu.setAttribute(
      "aria-hidden",
      String(!menuOpen)
    );

    setBackgroundInteractionDisabled(menuOpen);
    setMenuTabState(!menuOpen);
    updateMenuLabel();

    html.classList.toggle("menu-is-open", menuOpen);
    body.classList.toggle("menu-is-open", menuOpen);

    if (menuOpen) {
      restoreFocusElement = doc.activeElement;

      requestAnimationFrame(() => {
        menuFocusables = getFocusableElements(menu);

        if (menuFocusables.length) {
          menuFocusables[0].focus();
        }
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
    if (!menuOpen || event.key !== "Tab") return;

    menuFocusables = getFocusableElements(menu);

    if (!menuFocusables.length) {
      event.preventDefault();
      return;
    }

    const first = menuFocusables[0];
    const last = menuFocusables[menuFocusables.length - 1];

    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  menuToggle?.addEventListener("click", () => {
    updateMenuState();
  });

  menu?.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (!link) return;

    updateMenuState(false);
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      event.preventDefault();
      updateMenuState(false);
      return;
    }

    trapMenuFocus(event);
  });

  /* =======================================================
     STANDBY
     ======================================================= */

  function hideStandby() {
    if (!standby) return;

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  }

  function showStandby() {
    if (!standby) return;
    if (menuOpen || doc.hidden) return;

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

  function handleActivity() {
    hideStandby();
    resetStandbyTimer();
  }

  ["scroll", "wheel", "touchstart", "keydown", "click"].forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, {
      passive: true
    });
  });

  window.addEventListener("pointermove", () => {
    const now = Date.now();

    if (
      now - lastPointerActivity <
      CONFIG.pointerThrottle
    ) {
      return;
    }

    lastPointerActivity = now;
    handleActivity();
  }, {
    passive: true
  });

  /* =======================================================
     LOADER
     ======================================================= */

  function hideLoader() {
    if (loaderHidden || !loader) return;

    loaderHidden = true;

    const finish = () => {
      loader.setAttribute("aria-hidden", "true");
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
    window.setTimeout(
      hideLoader,
      CONFIG.loaderFailsafe
    );

    if (document.readyState === "complete") {
      window.setTimeout(hideLoader, 120);
      return;
    }

    window.addEventListener("load", () => {
      window.setTimeout(hideLoader, 120);
    }, {
      once: true
    });
  }

  /* =======================================================
     SECTION STATE
     ======================================================= */

  function getReadingLine() {
    const headerHeight =
      document.querySelector(".site-header")?.offsetHeight || 0;

    return (
      headerHeight +
      Math.min(
        window.innerHeight * CONFIG.activeLineRatio,
        CONFIG.activeLineMax
      )
    );
  }

  function getActiveSectionIndex() {
    if (!sections.length) return 0;

    const readingLine = getReadingLine();

    let bestIndex = 0;
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

      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - readingLine);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function updateSectionNavigation(index = getActiveSectionIndex()) {
    if (!sections.length || !sectionNav) return;

    index = clamp(
      index,
      0,
      sections.length - 1
    );

    currentIndex = index;

    const section = sections[index];

    const title =
      section.dataset.title ||
      section.querySelector("h1, h2")?.textContent?.trim() ||
      "";

    if (sectionNumber) {
      sectionNumber.textContent =
        String(index + 1).padStart(2, "0");
    }

    if (sectionTitle) {
      sectionTitle.textContent = title;
    }

    if (sectionPrev) {
      sectionPrev.disabled = index === 0;
      sectionPrev.setAttribute(
        "aria-label",
        index === 0
          ? "Sezione precedente non disponibile"
          : `Vai a ${sections[index - 1].dataset.title || "sezione precedente"}`
      );
    }

    if (sectionNext) {
      sectionNext.disabled =
        index === sections.length - 1;

      sectionNext.setAttribute(
        "aria-label",
        index === sections.length - 1
          ? "Sezione successiva non disponibile"
          : `Vai a ${sections[index + 1].dataset.title || "sezione successiva"}`
      );
    }

    const isLight =
      section.classList.contains("story-light");

    sectionNav.dataset.theme =
      isLight ? "light" : "dark";

    html.dataset.activeSection =
      section.id || "";

    sections.forEach((item, itemIndex) => {
      item.setAttribute(
        "aria-current",
        itemIndex === index ? "true" : "false"
      );
    });
  }

  function scrollToSection(index) {
    if (!sections[index]) return;

    const section = sections[index];

    const top =
      window.scrollY +
      section.getBoundingClientRect().top -
      CONFIG.scrollOffset;

    if (
      reduceMotionQuery.matches
    ) {
      window.scrollTo({
        top,
        behavior: "auto"
      });
      return;
    }

    window.scrollTo({
      top,
      behavior: "smooth"
    });
  }

  sectionPrev?.addEventListener("click", () => {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1);
    }
  });

  sectionNext?.addEventListener("click", () => {
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1);
    }
  });

  /* =======================================================
     KEYBOARD SECTION NAVIGATION
     ======================================================= */

  doc.addEventListener("keydown", (event) => {
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

      if (currentIndex < sections.length - 1) {
        scrollToSection(currentIndex + 1);
      }
    }

    if (
      event.key === "ArrowUp" &&
      doc.activeElement === body
    ) {
      event.preventDefault();

      if (currentIndex > 0) {
        scrollToSection(currentIndex - 1);
      }
    }
  });

  /* =======================================================
     SCROLL / ACTIVE SECTION
     ======================================================= */

  let scrollTicking = false;

  function requestSectionUpdate() {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(() => {
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
     GSAP / SCROLLTRIGGER
     ======================================================= */

  function gsapAvailable() {
    return (
      !reduceMotionQuery.matches &&
      window.gsap &&
      window.ScrollTrigger
    );
  }

  function killStoryAnimations() {
    if (!window.ScrollTrigger) return;

    window.ScrollTrigger.getAll()
      .filter((trigger) =>
        trigger.vars &&
        trigger.vars.id &&
        String(trigger.vars.id).startsWith("story-")
      )
      .forEach((trigger) => trigger.kill());
  }

  function initStoryAnimations() {
    if (!gsapAvailable()) {
      sections.forEach((section) => {
        section
          .querySelectorAll(
            ".eyebrow, h1, h2, p, .return-list span, .connect-words span, .person-frame, .map-frame"
          )
          .forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "none";
          });
      });

      return;
    }

    window.gsap.registerPlugin(
      window.ScrollTrigger
    );

    killStoryAnimations();

    sections.forEach((section, index) => {
      const eyebrow =
        section.querySelector(".eyebrow");

      const heading =
        section.querySelector("h1, h2");

      const paragraphs =
        section.querySelectorAll(
          ".narrative-copy p, .opening-copy p, .today-lead, .contact-lead"
        );

      const frame =
        section.querySelector(
          ".person-frame, .map-frame"
        );

      /* Opening */
      if (
        section.classList.contains("story-opening")
      ) {
        const tl = window.gsap.timeline({
          scrollTrigger: {
            id: `story-${index}-opening`,
            trigger: section,
            start: "top 70%",
            once: true
          }
        });

        tl.from(eyebrow, {
          opacity: 0,
          y: 18,
          duration: 0.6,
          ease: "power3.out"
        })
        .from(heading, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: "power4.out"
        }, "-=0.35")
        .from(paragraphs, {
          opacity: 0,
          y: 20,
          duration: 0.65,
          stagger: 0.12,
          ease: "power3.out"
        }, "-=0.35");

        return;
      }

      /* Understand */
      if (
        section.classList.contains("story-understand")
      ) {
        const items = section.querySelectorAll(
          ".understand-lead, .narrative-copy"
        );

        window.gsap.from(items, {
          opacity: 0,
          y: 45,
          duration: 0.85,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-understand`,
            trigger: section,
            start: "top 68%",
            once: true
          }
        });

        return;
      }

      /* Return */
      if (
        section.classList.contains("story-return")
      ) {
        const items = section.querySelectorAll(
          ".return-copy > p, .return-list span"
        );

        window.gsap.from(items, {
          opacity: 0,
          y: 35,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-return`,
            trigger: section,
            start: "top 68%",
            once: true
          }
        });

        return;
      }

      /* Connect */
      if (
        section.classList.contains("story-connect")
      ) {
        const words =
          section.querySelectorAll(
            ".connect-words span"
          );

        window.gsap.from(words, {
          opacity: 0,
          x: -35,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-connect`,
            trigger: section,
            start: "top 68%",
            once: true
          }
        });

        return;
      }

      /* Today */
      if (
        section.classList.contains("story-today")
      ) {
        const tl = window.gsap.timeline({
          scrollTrigger: {
            id: `story-${index}-today`,
            trigger: section,
            start: "top 68%",
            once: true
          }
        });

        tl.from(heading, {
          opacity: 0,
          y: 35,
          duration: 0.8,
          ease: "power4.out"
        })
        .from(section.querySelector(".today-lead"), {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power4.out"
        }, "-=0.35")
        .from(section.querySelector(".narrative-copy"), {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: "power3.out"
        }, "-=0.35");

        return;
      }

      /* Person / Map */
      if (frame) {
        window.gsap.from(frame, {
          opacity: 0,
          y: 45,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-frame`,
            trigger: section,
            start: "top 70%",
            once: true
          }
        });
      }

      /* Generic — deliberately restrained */
      const contentItems = [
        eyebrow,
        heading,
        ...Array.from(paragraphs)
      ].filter(Boolean);

      if (contentItems.length) {
        window.gsap.from(contentItems, {
          opacity: 0,
          y: 30,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            id: `story-${index}-generic`,
            trigger: section,
            start: "top 72%",
            once: true
          }
        });
      }
    });

    window.ScrollTrigger.refresh();
  }

  /* =======================================================
     REDUCED MOTION DYNAMIC CHANGE
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

  function handleInitialHash() {
    const hash = window.location.hash;

    if (!hash) return;

    const target = doc.getElementById(
      decodeURIComponent(hash.slice(1))
    );

    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: reduceMotionQuery.matches
          ? "auto"
          : "smooth",
        block: "start"
      });
    }, 250);
  }

  /* =======================================================
     PAGE VISIBILITY / BFCACHE
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        hideStandby();
      } else {
        resetStandbyTimer();

        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }
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
    setMenuTabState(true);
    updateMenuState(false);

    updateSectionNavigation(0);

    initLoader();
    initStoryAnimations();

    handleInitialHash();

    window.setTimeout(() => {
      updateSectionNavigation();
    }, 50);

    resetStandbyTimer();

    if (window.ScrollTrigger) {
      window.setTimeout(() => {
        window.ScrollTrigger.refresh();
      }, 150);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
