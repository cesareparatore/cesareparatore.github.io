(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1200,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260
  };

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const standby = doc.getElementById("standby");

  const header = doc.getElementById("site-header");
  const menu = doc.getElementById("menu");
  const menuToggle = doc.getElementById("menu-toggle");
  const menuLinks = [...doc.querySelectorAll(".menu-list a")];

  const main = doc.getElementById("main-content");
  const footer = doc.querySelector(".site-footer");

  const storyNav = doc.getElementById("story-nav");
  const activeStoryTitle = doc.getElementById("active-story-title");
  const storyProgress = doc.getElementById("story-progress");
  const storyProgressFill = doc.querySelector(".story-progress-fill");
  const storyProgressOrb = doc.querySelector(".story-progress-orb");
  const storyPrev = doc.getElementById("story-prev");
  const storyNext = doc.getElementById("story-next");

  const stories = [...doc.querySelectorAll(".story")];
  const year = doc.getElementById("year");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let activeIndex = 0;
  let scrollFrame = 0;
  let standbyTimer = 0;
  let menuOpen = false;
  let lastFocusedElement = null;
  let loaderHidden = false;

  /* --------------------------------------------------
     BASIC STATE
  -------------------------------------------------- */

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function setThemeColor(value) {
    let meta = doc.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = doc.createElement("meta");
      meta.name = "theme-color";
      doc.head.appendChild(meta);
    }

    meta.content = value;
  }

  function updateHeaderChrome() {
    header?.setAttribute("data-theme", "dark");
    setThemeColor("#0b0b0a");
  }

  updateHeaderChrome();

  /* --------------------------------------------------
     LOADER
  -------------------------------------------------- */

  function hideLoader() {
    if (loaderHidden || !loader) {
      return;
    }

    loaderHidden = true;
    loader.classList.add("is-hidden");
    window.setTimeout(() => {
      loader.hidden = true;
    }, 700);
  }

  if (doc.readyState === "complete") {
    window.setTimeout(hideLoader, 80);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(hideLoader, 80);
    }, { once: true });
  }

  window.setTimeout(hideLoader, CONFIG.loaderMax);

  /* --------------------------------------------------
     MENU / FOCUS MANAGEMENT
  -------------------------------------------------- */

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function setMenuFocusable(enabled) {
    menuLinks.forEach((link) => {
      if (enabled) {
        link.removeAttribute("tabindex");
      } else {
        link.setAttribute("tabindex", "-1");
      }
    });
  }

  function setBackgroundInert(isInert) {
    [main, footer, storyNav].forEach((element) => {
      if (!element) {
        return;
      }

      element.inert = isInert;

      if (isInert) {
        element.setAttribute("aria-hidden", "true");
      } else {
        element.removeAttribute("aria-hidden");
      }
    });
  }

  function updateMenuAria(open) {
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute(
      "aria-label",
      open ? "Chiudi menu" : "Apri menu"
    );

    menu?.setAttribute("aria-hidden", String(!open));
  }

  function openMenu() {
    if (!menu || menuOpen) {
      return;
    }

    lastFocusedElement = doc.activeElement;
    menuOpen = true;

    setMenuFocusable(true);
    setBackgroundInert(true);

    menu.removeAttribute("inert");
    menu.inert = false;

    menu.classList.add("is-open");
    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "Chiudi menu");

    body.classList.add("menu-open");

    window.requestAnimationFrame(() => {
      menuLinks[0]?.focus({ preventScroll: true });
    });
  }

  function closeMenu(restoreFocus = true) {
    if (!menu) {
      return;
    }

    menuOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
    menu.inert = true;

    setMenuFocusable(false);
    setBackgroundInert(false);

    body.classList.remove("menu-open");

    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Apri menu");

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      window.requestAnimationFrame(() => {
        lastFocusedElement.focus({ preventScroll: true });
      });
    }

    lastFocusedElement = null;
  }

  function trapMenuFocus(event) {
    if (!menuOpen || event.key !== "Tab") {
      return;
    }

    const focusables = [...menu.querySelectorAll(focusableSelector)]
      .filter((element) => !element.hasAttribute("disabled"));

    if (!focusables.length) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  menuToggle?.addEventListener("click", () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      event.preventDefault();
      closeMenu();
      return;
    }

    trapMenuFocus(event);
  });

  setMenuFocusable(false);
  if (menu) {
    menu.setAttribute("inert", "");
    menu.inert = true;
    menu.setAttribute("aria-hidden", "true");
  }

  /* --------------------------------------------------
     STORY NAVIGATION
  -------------------------------------------------- */

  function getStoryId(index) {
    return stories[index]?.id || "";
  }

  function getStoryTitle(index) {
    return stories[index]?.dataset.title || "";
  }

  function getReadingLine() {
    const headerHeight = header?.offsetHeight || 0;
    return headerHeight + Math.min(
      window.innerHeight * CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );
  }

  function calculateActiveIndex() {
    if (!stories.length) {
      return 0;
    }

    const readingLine = getReadingLine();
    let candidate = 0;

    for (let index = 0; index < stories.length; index += 1) {
      const rect = stories[index].getBoundingClientRect();

      if (rect.top <= readingLine) {
        candidate = index;
      } else {
        break;
      }
    }

    return Math.max(0, Math.min(candidate, stories.length - 1));
  }

  function updateMenuCurrentState(index) {
    const currentId = getStoryId(index);

    menuLinks.forEach((link) => {
      const matches = link.hash === `#${currentId}`;

      if (matches) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateNavigationState(index) {
    if (!stories[index]) {
      return;
    }

    activeIndex = index;

    const title = getStoryTitle(index);

    if (activeStoryTitle && activeStoryTitle.textContent !== title) {
      activeStoryTitle.textContent = title;
    }

    if (storyPrev) {
      storyPrev.disabled = index <= 0;
      storyPrev.setAttribute(
        "aria-label",
        index <= 0
          ? "Sezione precedente non disponibile"
          : `Sezione precedente: ${getStoryTitle(index - 1)}`
      );
    }

    if (storyNext) {
      storyNext.disabled = index >= stories.length - 1;
      storyNext.setAttribute(
        "aria-label",
        index >= stories.length - 1
          ? "Sezione successiva non disponibile"
          : `Sezione successiva: ${getStoryTitle(index + 1)}`
      );
    }

    updateMenuCurrentState(index);
  }

  function getSectionProgress(section) {
    if (!section) {
      return 0;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionHeight = Math.max(section.offsetHeight, viewportHeight);

    const start = viewportHeight;
    const end = -sectionHeight;
    const current = rect.top;

    const progress = (start - current) / (start - end);

    return Math.max(0, Math.min(1, progress));
  }

  function updateProgress() {
    const section = stories[activeIndex];

    if (!section || !storyProgress) {
      return;
    }

    const progress = getSectionProgress(section);
    const percentage = progress * 100;

    if (storyProgressFill) {
      storyProgressFill.style.width = `${percentage}%`;
    }

    if (storyProgressOrb) {
      storyProgressOrb.style.left = `${percentage}%`;
    }

    storyProgress.setAttribute(
      "aria-valuenow",
      String(Math.round(percentage))
    );
  }

  function updateScrollState() {
    const nextIndex = calculateActiveIndex();

    if (nextIndex !== activeIndex) {
      updateNavigationState(nextIndex);
    }

    updateProgress();

    scrollFrame = 0;
  }

  function requestScrollStateUpdate() {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(updateScrollState);
  }

  function scrollToStory(index, updateHash = true) {
    if (!stories[index]) {
      return;
    }

    const target = stories[index];
    const offset = header?.offsetHeight || 0;
    const targetTop =
      window.scrollY +
      target.getBoundingClientRect().top -
      offset -
      CONFIG.scrollOffset;

    if (updateHash) {
      const nextHash = `#${target.id}`;

      if (window.location.hash !== nextHash) {
        history.pushState(
          { story: target.id },
          "",
          nextHash
        );
      }
    }

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });

    updateNavigationState(index);
  }

  storyPrev?.addEventListener("click", () => {
    if (activeIndex > 0) {
      scrollToStory(activeIndex - 1);
    }
  });

  storyNext?.addEventListener("click", () => {
    if (activeIndex < stories.length - 1) {
      scrollToStory(activeIndex + 1);
    }
  });

  window.addEventListener("scroll", requestScrollStateUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestScrollStateUpdate, {
    passive: true
  });

  window.addEventListener("orientationchange", requestScrollStateUpdate, {
    passive: true
  });

  /* --------------------------------------------------
     HASH / HISTORY
  -------------------------------------------------- */

  function indexFromHash() {
    const hash = window.location.hash.replace(/^#/, "");

    if (!hash) {
      return -1;
    }

    return stories.findIndex((story) => story.id === hash);
  }

  function handleHash(initial = false) {
    const index = indexFromHash();

    if (index < 0) {
      if (initial) {
        updateNavigationState(calculateActiveIndex());
        updateProgress();
      }
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToStory(index, false);
      });
    });
  }

  window.addEventListener("hashchange", () => {
    handleHash(false);
  });

  window.addEventListener("popstate", () => {
    handleHash(false);
  });

  /* --------------------------------------------------
     KEYBOARD STORY CONTROL
  -------------------------------------------------- */

  function isTypingContext(element) {
    if (!element) {
      return false;
    }

    const tag = element.tagName;

    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      element.isContentEditable
    );
  }

  doc.addEventListener("keydown", (event) => {
    if (menuOpen || isTypingContext(doc.activeElement)) {
      return;
    }

    const target = doc.activeElement;

    if (
      target &&
      target !== doc.body &&
      target !== doc.documentElement
    ) {
      const isInteractive =
        target.matches("a, button, input, textarea, select, [contenteditable]");

      if (isInteractive) {
        return;
      }
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();

      if (activeIndex < stories.length - 1) {
        scrollToStory(activeIndex + 1);
      }
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();

      if (activeIndex > 0) {
        scrollToStory(activeIndex - 1);
      }
    }
  });

  /* --------------------------------------------------
     STANDBY
  -------------------------------------------------- */

  function hideStandby() {
    standby?.classList.remove("is-visible");
  }

  function resetStandbyTimer() {
    hideStandby();

    window.clearTimeout(standbyTimer);

    standbyTimer = window.setTimeout(() => {
      if (!menuOpen && document.visibilityState === "visible") {
        standby?.classList.add("is-visible");
      }
    }, CONFIG.standbyDelay);
  }

  [
    "scroll",
    "wheel",
    "touchstart",
    "pointerdown",
    "keydown",
    "click"
  ].forEach((eventName) => {
    window.addEventListener(eventName, resetStandbyTimer, {
      passive: eventName !== "keydown"
    });
  });

  resetStandbyTimer();

  /* --------------------------------------------------
     GSAP / SCROLLTRIGGER
  -------------------------------------------------- */

  function initAnimations() {
    if (
      prefersReducedMotion.matches ||
      typeof window.gsap === "undefined"
    ) {
      return;
    }

    if (typeof window.ScrollTrigger === "undefined") {
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);

    stories.forEach((section, index) => {
      const heading = section.querySelector(".story-heading");
      const copy = section.querySelector(".story-copy");
      const indexLabel = section.querySelector(".story-index");
      const image = section.querySelector(".person-image");
      const map = section.querySelector(".map-frame");

      const elements = [
        indexLabel,
        heading,
        copy,
        image,
        map
      ].filter(Boolean);

      if (!elements.length) {
        return;
      }

      window.gsap.set(elements, {
        y: 22,
        opacity: 0
      });

      window.gsap.to(elements, {
        y: 0,
        opacity: 1,
        duration: .85,
        stagger: .07,
        ease: "power3.out",
        overwrite: "auto",
        scrollTrigger: {
          id: `story-${index}`,
          trigger: section,
          start: "top 76%",
          once: true
        }
      });
    });

    window.ScrollTrigger.refresh();
  }

  /* --------------------------------------------------
     REDUCED MOTION CHANGES
  -------------------------------------------------- */

  function handleMotionPreference() {
    if (prefersReducedMotion.matches) {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars?.id?.startsWith("story-")) {
            trigger.kill();
          }
        });
      }
    } else {
      initAnimations();
    }
  }

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", handleMotionPreference);
  }

  /* --------------------------------------------------
     VISIBILITY / BF CACHE
  -------------------------------------------------- */

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      requestScrollStateUpdate();
      resetStandbyTimer();
    } else {
      hideStandby();
    }
  });

  window.addEventListener("pageshow", () => {
    requestScrollStateUpdate();

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  });

  /* --------------------------------------------------
     INITIALISE
  -------------------------------------------------- */

  updateHeaderChrome();
  updateNavigationState(calculateActiveIndex());
  updateProgress();
  initAnimations();
  handleHash(true);

  window.requestAnimationFrame(() => {
    requestScrollStateUpdate();
  });
})();
