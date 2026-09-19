/* =========================================================
   CESARE PARATORE
   HOME — MOVIMENTO CON DIREZIONE
   MASTER BEST SELLER
   ========================================================= */

(() => {
  "use strict";

  const CFG = {
    loaderMin: 700,
    loaderMax: 2200,
    revealThreshold: 0.12,
    cursorLerp: 0.18,
    resizeDebounce: 160,
    navOffset: 18,
    transitionMs: 620,
    trajectoryLerp: 0.09,
    trajectoryDrift: 18,
    magneticStrength: 0.12,
    magneticRadius: 90,
    standbyDelay: 45000
  };


  /* =======================================================
     DOM
     ======================================================= */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  const body = document.body;

  const loader = $(".page-loader");

  const header = $("#site-header");

  const sections = $$(".chapter");

  const progressCurrent = $("#progress-current");
  const progressTotal = $("#progress-total");
  const progressFill = $("#progress-fill");

  const previousButton = $("#previous-section");
  const nextButton = $("#next-section");

  const menuTrigger = $("#menu-trigger");
  const menu = $("#site-menu");
  const menuLinks = $$("a", menu);

  const standby = $("#standby-screen");
  const standbyWake = $(".standby-wake");

  const directionLinks = $$(".direction-link");

  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    body.classList.add("reduced-motion");
  }


  /* =======================================================
     STATE
     ======================================================= */

  let currentIndex = 0;
  let loaderRemoved = false;
  let menuOpen = false;
  let standbyTimer = null;
  let lastFocusedElement = null;
  let resizeTimer = null;

  const visitedDirections = new Set();


  /* =======================================================
     HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const formatNumber = (value) =>
    String(value).padStart(2, "0");

  const isFinePointer =
    window.matchMedia("(pointer:fine)").matches;


  /* =======================================================
     LOADER — FROZEN BEHAVIOR
     ======================================================= */

  function removeLoader() {

    if (loaderRemoved || !loader) return;

    loaderRemoved = true;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.remove();
    }, 900);
  }

  function initLoader() {

    if (!loader) return;

    const startedAt = performance.now();

    const finish = () => {

      const elapsed = performance.now() - startedAt;

      const remaining =
        Math.max(0, CFG.loaderMin - elapsed);

      window.setTimeout(removeLoader, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener(
        "load",
        finish,
        { once: true }
      );
    }

    window.setTimeout(removeLoader, CFG.loaderMax);
  }


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  function isSameOriginInternalLink(link) {

    if (!link) return false;

    if (
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return false;
    }

    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) {
      return false;
    }

    try {

      const url =
        new URL(href, window.location.href);

      return (
        url.origin === window.location.origin &&
        !url.pathname.endsWith(".pdf")
      );

    } catch {
      return false;
    }
  }

  function initPageTransitions() {

    $$("a").forEach(link => {

      if (!isSameOriginInternalLink(link)) {
        return;
      }

      link.addEventListener("click", event => {

        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();

        const href = link.href;

        body.classList.add("page-leaving");

        window.setTimeout(() => {
          window.location.href = href;
        }, CFG.transitionMs);

      });

    });

  }


  /* =======================================================
     MENU
     ======================================================= */

  function openMenu() {

    if (!menu || !menuTrigger) return;

    lastFocusedElement = document.activeElement;

    menuOpen = true;

    body.classList.add("is-locked");

    menu.classList.add("is-open");

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    const firstLink = menuLinks[0];

    if (firstLink) {
      window.setTimeout(() => {
        firstLink.focus();
      }, 120);
    }
  }

  function closeMenu(
    restoreFocus = true
  ) {

    if (!menu || !menuTrigger) return;

    menuOpen = false;

    body.classList.remove("is-locked");

    menu.classList.remove("is-open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      lastFocusedElement.focus();
    }
  }

  function toggleMenu() {

    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  }

  function initMenu() {

    if (!menuTrigger) return;

    menuTrigger.addEventListener(
      "click",
      toggleMenu
    );

    menuLinks.forEach(link => {

      link.addEventListener(
        "click",
        () => closeMenu(false)
      );

    });

    document.addEventListener(
      "keydown",
      event => {

        if (event.key === "Escape") {

          if (menuOpen) {
            closeMenu();
          }

          if (standby?.classList.contains("is-active")) {
            closeStandby();
          }

        }

      }
    );

  }


  /* =======================================================
     MENU FOCUS TRAP
     ======================================================= */

  function initMenuFocusTrap() {

    document.addEventListener(
      "keydown",
      event => {

        if (!menuOpen || event.key !== "Tab") {
          return;
        }

        const focusable = $$(
          "a[href], button:not([disabled])",
          menu
        );

        if (!focusable.length) return;

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

      }
    );

  }


  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  function getSectionTop(section) {

    const rect =
      section.getBoundingClientRect();

    return (
      window.scrollY +
      rect.top -
      CFG.navOffset
    );
  }

  function goTo(index, smooth = true) {

    const next =
      clamp(index, 0, sections.length - 1);

    const target =
      sections[next];

    if (!target) return;

    if (smooth) {

      target.scrollIntoView({
        behavior: reducedMotion
          ? "auto"
          : "smooth",
        block: "start"
      });

    } else {

      window.scrollTo({
        top: getSectionTop(target),
        behavior: "auto"
      });

    }

  }

  function goNext() {

    if (currentIndex < sections.length - 1) {
      goTo(currentIndex + 1);
    }

  }

  function goPrevious() {

    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }

  }

  function initSectionNavigation() {

    previousButton?.addEventListener(
      "click",
      goPrevious
    );

    nextButton?.addEventListener(
      "click",
      goNext
    );

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        ) {
          return;
        }

        if (menuOpen) return;

        if (event.key === "PageDown") {

          event.preventDefault();
          goNext();

        }

        if (event.key === "PageUp") {

          event.preventDefault();
          goPrevious();

        }

      }
    );

  }


  /* =======================================================
     ACTIVE SECTION / PROGRESS
     ======================================================= */

  function updateProgress(index) {

    const total =
      sections.length;

    const percent =
      total <= 1
        ? 100
        : (index / (total - 1)) * 100;

    if (progressCurrent) {
      progressCurrent.textContent =
        formatNumber(index + 1);
    }

    if (progressTotal) {
      progressTotal.textContent =
        formatNumber(total);
    }

    if (progressFill) {
      progressFill.style.transform =
        `scaleX(${percent / 100})`;
    }

    if (previousButton) {
      previousButton.disabled =
        index === 0;
    }

    if (nextButton) {
      nextButton.disabled =
        index === total - 1;
    }

  }

  function updateActiveSection() {

    const viewportCenter =
      window.innerHeight * 0.45;

    let closestIndex = currentIndex;

    let closestDistance = Infinity;

    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const center =
          rect.top + rect.height / 2;

        const distance =
          Math.abs(center - viewportCenter);

        if (distance < closestDistance) {

          closestDistance = distance;
          closestIndex = index;

        }

      }
    );

    if (closestIndex !== currentIndex) {

      currentIndex = closestIndex;

      updateProgress(currentIndex);

      applyJourneyState();

    }

  }


  /* =======================================================
     JOURNEY SYSTEM
     ======================================================= */

  const JOURNEY = [
    "origin",
    "sport",
    "exploration",
    "converged",
    "pause",
    "territory",
    "integrated",
    "possibility",
    "reader",
    "complete"
  ];

  function applyJourneyState() {

    const state =
      JOURNEY[currentIndex] || "origin";

    body.dataset.journeyState = state;

    sections.forEach(
      (section, index) => {

        section.dataset.journeyState =
          JOURNEY[index] || "origin";

        section.classList.toggle(
          "is-current",
          index === currentIndex
        );

      }
    );

    directionLinks.forEach(link => {

      const direction =
        link.dataset.direction;

      link.classList.toggle(
        "is-visited",
        visitedDirections.has(direction)
      );

    });

  }


  /* =======================================================
     DIRECTION INTERACTION
     ======================================================= */

  function markDirectionVisited(direction) {

    if (!direction) return;

    visitedDirections.add(direction);

    directionLinks.forEach(link => {

      if (
        link.dataset.direction === direction
      ) {

        link.classList.add("is-visited");

      }

    });

  }

  function initDirections() {

    directionLinks.forEach(link => {

      link.addEventListener(
        "click",
        () => {

          markDirectionVisited(
            link.dataset.direction
          );

        }
      );

      link.addEventListener(
        "pointerenter",
        () => {

          if (!isFinePointer) return;

          link.classList.add("is-hovered");

        }
      );

      link.addEventListener(
        "pointerleave",
        () => {

          link.classList.remove("is-hovered");

        }
      );

    });

  }


  /* =======================================================
     REVEAL
     ======================================================= */

  function initReveal() {

    const elements =
      $$(".reveal");

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {

      elements.forEach(
        element =>
          element.classList.add("is-visible")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );

          });

        },
        {
          threshold:CFG.revealThreshold,
          rootMargin:"0px 0px -8% 0px"
        }
      );

    elements.forEach(
      element =>
        observer.observe(element)
    );

  }


  /* =======================================================
     CURSOR
     ======================================================= */

  function initCursor() {

    if (
      !isFinePointer ||
      reducedMotion
    ) {
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;

    document.addEventListener(
      "pointermove",
      event => {

        mouseX = event.clientX;
        mouseY = event.clientY;

      },
      { passive:true }
    );

    const tick = () => {

      currentX +=
        (mouseX - currentX) *
        CFG.cursorLerp;

      currentY +=
        (mouseY - currentY) *
        CFG.cursorLerp;

      document.documentElement.style.setProperty(
        "--cursor-x",
        `${currentX}px`
      );

      document.documentElement.style.setProperty(
        "--cursor-y",
        `${currentY}px`
      );

      requestAnimationFrame(tick);

    };

    requestAnimationFrame(tick);

  }


  /* =======================================================
     MAGNETIC INTERACTION
     ======================================================= */

  function initMagnetic() {

    if (
      !isFinePointer ||
      reducedMotion
    ) {
      return;
    }

    const elements = [
      ...$$(".final-cta"),
      ...$$(".direction-link"),
      ...$$(".section-jump button"),
      ...$$(".menu-trigger")
    ];

    elements.forEach(element => {

      let rect = null;

      element.addEventListener(
        "pointerenter",
        () => {
          rect =
            element.getBoundingClientRect();
        }
      );

      element.addEventListener(
        "pointermove",
        event => {

          if (!rect) {
            rect =
              element.getBoundingClientRect();
          }

          const centerX =
            rect.left + rect.width / 2;

          const centerY =
            rect.top + rect.height / 2;

          const dx =
            event.clientX - centerX;

          const dy =
            event.clientY - centerY;

          const distance =
            Math.sqrt(dx * dx + dy * dy);

          if (
            distance >
            CFG.magneticRadius
          ) {
            return;
          }

          const strength =
            CFG.magneticStrength *
            (1 - distance / CFG.magneticRadius);

          element.style.setProperty(
            "--magnetic-x",
            `${dx * strength}px`
          );

          element.style.setProperty(
            "--magnetic-y",
            `${dy * strength}px`
          );

          element.style.transform =
            `translate3d(
              ${dx * strength}px,
              ${dy * strength}px,
              0
            )`;

        }
      );

      element.addEventListener(
        "pointerleave",
        () => {

          rect = null;

          element.style.removeProperty(
            "--magnetic-x"
          );

          element.style.removeProperty(
            "--magnetic-y"
          );

          element.style.transform = "";

        }
      );

    });

  }


  /* =======================================================
     TRAJECTORY
     ======================================================= */

  function initTrajectory() {

    if (reducedMotion) {
      return;
    }

    let targetDrift = 0;
    let currentDrift = 0;

    const updateTarget = () => {

      const progress =
        window.scrollY /
        Math.max(
          1,
          document.documentElement.scrollHeight -
          window.innerHeight
        );

      targetDrift =
        (
          progress -
          0.5
        ) *
        CFG.trajectoryDrift;

    };

    window.addEventListener(
      "scroll",
      updateTarget,
      { passive:true }
    );

    const tick = () => {

      currentDrift +=
        (
          targetDrift -
          currentDrift
        ) *
        CFG.trajectoryLerp;

      document.documentElement.style.setProperty(
        "--trajectory-drift",
        `${currentDrift}px`
      );

      requestAnimationFrame(tick);

    };

    updateTarget();

    requestAnimationFrame(tick);

  }


  /* =======================================================
     CTA ENGAGEMENT
     ======================================================= */

  function initCTA() {

    const cta =
      $(".final-cta");

    if (!cta) return;

    cta.addEventListener(
      "click",
      () => {

        cta.classList.add(
          "is-engaged"
        );

      }
    );

  }


  /* =======================================================
     STANDBY — FROZEN
     ======================================================= */

  function closeStandby() {

    if (!standby) return;

    standby.classList.remove(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove(
      "is-locked"
    );

    resetStandbyTimer();

  }

  function openStandby() {

    if (
      !standby ||
      reducedMotion ||
      window.innerWidth < 700
    ) {
      return;
    }

    standby.classList.add(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

    body.classList.add(
      "is-locked"
    );

    standbyWake?.focus();
  }

  function resetStandbyTimer() {

    if (standbyTimer) {
      clearTimeout(standbyTimer);
    }

    if (
      reducedMotion ||
      window.innerWidth < 700
    ) {
      return;
    }

    standbyTimer =
      window.setTimeout(
        openStandby,
        CFG.standbyDelay
      );

  }

  function initStandby() {

    if (!standby) return;

    standbyWake?.addEventListener(
      "click",
      closeStandby
    );

    ["pointerdown","wheel","touchstart","keydown"]
      .forEach(eventName => {

        window.addEventListener(
          eventName,
          () => {

            if (
              !standby.classList.contains(
                "is-active"
              )
            ) {
              resetStandbyTimer();
            }

          },
          {
            passive:
              eventName !== "keydown"
          }
        );

      });

    resetStandbyTimer();

  }


  /* =======================================================
     HASH NAVIGATION
     ======================================================= */

  function initHashNavigation() {

    if (!window.location.hash) {
      return;
    }

    const target =
      document.querySelector(
        window.location.hash
      );

    if (!target) return;

    window.setTimeout(() => {

      target.scrollIntoView({
        behavior:"auto",
        block:"start"
      });

    }, CFG.loaderMin + 50);

  }


  /* =======================================================
     RESIZE
     ======================================================= */

  function initResize() {

    window.addEventListener(
      "resize",
      () => {

        clearTimeout(resizeTimer);

        resizeTimer =
          window.setTimeout(
            () => {

              resetStandbyTimer();
              updateActiveSection();

            },
            CFG.resizeDebounce
          );

      },
      { passive:true }
    );

  }


  /* =======================================================
     SCROLL
     ======================================================= */

  function initScroll() {

    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {

        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {

          updateActiveSection();

          ticking = false;

        });

      },
      { passive:true }
    );

  }


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function init() {

    updateProgress(0);
    applyJourneyState();

    initLoader();

    initPageTransitions();

    initMenu();
    initMenuFocusTrap();

    initSectionNavigation();

    initDirections();

    initReveal();

    initCursor();

    initMagnetic();

    initTrajectory();

    initCTA();

    initStandby();

    initHashNavigation();

    initResize();

    initScroll();

    updateActiveSection();

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once:true }
    );

  } else {

    init();

  }

})();
