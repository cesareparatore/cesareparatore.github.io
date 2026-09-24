(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderMax: 1200,
    scrollOffset: 12,
    activeLineRatio: 0.32,
    activeLineMax: 260,
    progressEpsilon: 0.001
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const dom = {
    body: document.body,
    header: document.getElementById("site-header"),
    loader: document.getElementById("page-loader"),
    standby: document.getElementById("standby"),
    menu: document.getElementById("menu"),
    menuToggle: document.getElementById("menu-toggle"),
    menuLinks: [...document.querySelectorAll(".menu-list a")],
    activeTitle: document.getElementById("active-story-title"),
    previous: document.getElementById("story-prev"),
    next: document.getElementById("story-next"),
    progress: document.getElementById("story-progress"),
    progressFill: document.querySelector(".story-progress-fill"),
    progressOrb: document.querySelector(".story-progress-orb"),
    currentYear: document.getElementById("current-year"),
    sections: [...document.querySelectorAll(".story[data-story-title]")]
  };

  if (!dom.header || !dom.sections.length) return;

  let activeIndex = 0;
  let ticking = false;
  let standbyTimer = null;
  let menuOpen = false;
  let previousFocus = null;
  let lastHash = "";

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const getHeaderHeight = () =>
    dom.header ? dom.header.getBoundingClientRect().height : 0;

  const getActiveLine = () =>
    getHeaderHeight() +
    Math.min(
      window.innerHeight * CONFIG.activeLineRatio,
      CONFIG.activeLineMax
    );

  function updateMenuAria(isOpen) {
    dom.menu.setAttribute("aria-hidden", String(!isOpen));
    dom.menu.toggleAttribute("inert", !isOpen);
  }

  function updateMenuLinks() {
    dom.menuLinks.forEach((link) => {
      const isCurrent = link.dataset.section === dom.sections[activeIndex].id;

      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setMenuState(isOpen, { restoreFocus = true } = {}) {
    menuOpen = isOpen;

    if (isOpen) {
      previousFocus = document.activeElement;
      dom.body.classList.add("menu-open");
      dom.menuToggle.setAttribute("aria-expanded", "true");
      dom.menuToggle.setAttribute("aria-label", "Chiudi menu");
      dom.menu.classList.add("is-open");
      updateMenuAria(true);

      requestAnimationFrame(() => {
        const currentLink = dom.menuLinks.find(
          (link) => link.dataset.section === dom.sections[activeIndex].id
        );

        (currentLink || dom.menuLinks[0])?.focus();
      });
    } else {
      dom.body.classList.remove("menu-open");
      dom.menuToggle.setAttribute("aria-expanded", "false");
      dom.menuToggle.setAttribute("aria-label", "Apri menu");
      dom.menu.classList.remove("is-open");
      updateMenuAria(false);

      if (restoreFocus && previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
      }

      previousFocus = null;
    }
  }

  function openMenu() {
    if (!menuOpen) setMenuState(true);
  }

  function closeMenu(options) {
    if (menuOpen) setMenuState(false, options);
  }

  function toggleMenu() {
    setMenuState(!menuOpen);
  }

  function focusTrap(event) {
    if (!menuOpen || event.key !== "Tab") return;

    const focusable = [
      ...dom.menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ].filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        !element.hasAttribute("disabled") &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    if (!focusable.length) {
      event.preventDefault();
      dom.menuToggle.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getSectionProgress(section) {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const travel = Math.max(height - window.innerHeight, 1);

    if (height <= window.innerHeight) {
      return clamp(
        (window.scrollY - top + window.innerHeight * 0.15) /
          Math.max(height, 1)
      );
    }

    return clamp((window.scrollY - top) / travel);
  }

  function findActiveSection() {
    const readingLine = getActiveLine();
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    dom.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top;
      const bottom = rect.bottom;

      if (top <= readingLine && bottom > readingLine) {
        bestIndex = index;
        bestDistance = 0;
        return;
      }

      if (bestDistance !== 0) {
        const distance =
          readingLine < top
            ? top - readingLine
            : readingLine - bottom;

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });

    return bestIndex;
  }

  function updateProgress() {
    const section = dom.sections[activeIndex];
    if (!section) return;

    const progress = getSectionProgress(section);
    const percentage = Math.round(progress * 100);

    dom.progressFill.style.transform = `scaleX(${progress})`;
    dom.progressOrb.style.left = `${progress * 100}%`;

    dom.progress.setAttribute("aria-valuenow", String(percentage));
  }

  function updateHeaderChrome(force = false) {
    if (!force && !dom.header) return;

    dom.header.style.backgroundColor = "var(--bg)";
    dom.header.style.color = "var(--light)";

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", "#0b0b0a");
    }
  }

  function updateActiveSection({ force = false } = {}) {
    const nextIndex = findActiveSection();

    if (force || nextIndex !== activeIndex) {
      activeIndex = nextIndex;

      const title = dom.sections[activeIndex].dataset.storyTitle || "";
      dom.activeTitle.textContent = title;

      dom.previous.disabled = activeIndex === 0;
      dom.next.disabled = activeIndex === dom.sections.length - 1;

      updateMenuLinks();
      updateHeaderChrome();
    }

    updateProgress();
  }

  function scrollToSection(index, updateHistory = true) {
    const targetIndex = clamp(
      index,
      0,
      dom.sections.length - 1
    );

    const target = dom.sections[targetIndex];
    if (!target) return;

    closeMenu({ restoreFocus: false });

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderHeight() -
      CONFIG.scrollOffset;

    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";

    window.scrollTo({
      top: Math.max(0, top),
      behavior
    });

    if (updateHistory) {
      const newHash = `#${target.id}`;

      if (window.location.hash !== newHash) {
        history.pushState(
          { section: target.id },
          "",
          newHash
        );
      }
    }

    lastHash = target.id;
    activeIndex = targetIndex;
    dom.activeTitle.textContent = target.dataset.storyTitle || "";
    dom.previous.disabled = targetIndex === 0;
    dom.next.disabled = targetIndex === dom.sections.length - 1;
    updateMenuLinks();
    updateProgress();
  }

  function handleHash({ initial = false } = {}) {
    const hash = window.location.hash.replace(/^#/, "");

    if (!hash) {
      if (initial) {
        updateActiveSection({ force: true });
      }
      return;
    }

    const index = dom.sections.findIndex(
      (section) => section.id === hash
    );

    if (index === -1) return;

    lastHash = hash;

    const target = dom.sections[index];
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderHeight() -
      CONFIG.scrollOffset;

    activeIndex = index;
    dom.activeTitle.textContent = target.dataset.storyTitle || "";
    dom.previous.disabled = index === 0;
    dom.next.disabled = index === dom.sections.length - 1;
    updateMenuLinks();
    updateProgress();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: initial || prefersReducedMotion.matches ? "auto" : "smooth"
    });
  }

  function handleScroll() {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });
  }

  function handleKeydown(event) {
    focusTrap(event);

    if (event.key === "Escape") {
      if (menuOpen) {
        event.preventDefault();
        closeMenu();
      }
      return;
    }

    if (menuOpen) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "PageDown"
    ) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      scrollToSection(activeIndex + 1);
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      scrollToSection(activeIndex - 1);
    }
  }

  function resetStandby() {
    window.clearTimeout(standbyTimer);
    dom.standby.classList.remove("is-visible");

    standbyTimer = window.setTimeout(() => {
      if (!document.hidden && !menuOpen) {
        dom.standby.classList.add("is-visible");
      }
    }, CONFIG.standbyDelay);
  }

  function hideStandby() {
    window.clearTimeout(standbyTimer);
    dom.standby.classList.remove("is-visible");
  }

  function initMotion() {
    if (
      prefersReducedMotion.matches ||
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);

    const animatedSections = dom.sections.filter(
      (section) =>
        !section.classList.contains("story--opening")
    );

    animatedSections.forEach((section) => {
      const targets = section.querySelectorAll(
        ".story-kicker, .story-title, .story-copy, .story-aside, .system-words span, .map-frame, .portrait-frame, .contact-link"
      );

      if (!targets.length) return;

      window.gsap.fromTo(
        targets,
        {
          y: 22,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.035,
          clearProps: "transform",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true
          }
        }
      );
    });
  }

  function updateYear() {
    if (dom.currentYear) {
      dom.currentYear.textContent = String(new Date().getFullYear());
    }
  }

  function bindEvents() {
    dom.menuToggle.addEventListener("click", toggleMenu);

    dom.previous.addEventListener("click", () => {
      scrollToSection(activeIndex - 1);
    });

    dom.next.addEventListener("click", () => {
      scrollToSection(activeIndex + 1);
    });

    dom.menuLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const sectionId = link.dataset.section;
        const index = dom.sections.findIndex(
          (section) => section.id === sectionId
        );

        if (index === -1) return;

        event.preventDefault();
        scrollToSection(index);
      });
    });

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    window.addEventListener("resize", handleScroll, {
      passive: true
    });

    window.addEventListener("orientationchange", handleScroll, {
      passive: true
    });

    window.addEventListener("keydown", handleKeydown);

    window.addEventListener("hashchange", () => {
      handleHash();
    });

    window.addEventListener("popstate", () => {
      handleHash();
    });

    window.addEventListener("pointerdown", () => {
      hideStandby();
      resetStandby();
    }, { passive: true });

    window.addEventListener("mousemove", resetStandby, {
      passive: true
    });

    window.addEventListener("keydown", resetStandby);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        hideStandby();
      } else {
        resetStandby();
        updateActiveSection({ force: true });
      }
    });

    window.addEventListener("pageshow", () => {
      updateActiveSection({ force: true });

      if (window.location.hash) {
        handleHash({ initial: false });
      }

      resetStandby();
    });

    prefersReducedMotion.addEventListener?.("change", () => {
      if (prefersReducedMotion.matches && window.gsap) {
        window.gsap.globalTimeline?.clear();
      }
    });
  }

  function hideLoader() {
    if (!dom.loader) return;

    dom.loader.classList.add("is-hidden");

    window.setTimeout(() => {
      dom.loader.setAttribute("hidden", "");
    }, 550);
  }

  function init() {
    updateYear();
    updateMenuAria(false);
    updateHeaderChrome(true);
    updateActiveSection({ force: true });
    bindEvents();
    resetStandby();

    if (window.location.hash) {
      handleHash({ initial: true });
    }

    window.setTimeout(hideLoader, CONFIG.loaderMax);

    window.setTimeout(initMotion, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();
