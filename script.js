/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER JS — 17/09/2026
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01 — CONFIG
     ======================================================= */

  const CONFIG = {
    loaderMinimumTime: 450,
    loaderMaximumWait: 4500,

    standbyDelay: 30000,
    standbyWakeDistance: 4,

    revealThreshold: 0.12,
    sectionThreshold: 0.52,

    cursorLerp: 0.16,

    resizeDebounce: 180,

    scrollNavigationOffset: 18,

    transitionDuration: 700,

    trajectoryLerp: 0.085,
    trajectoryDrift: 34,

    magneticStrength: 0.18,
    magneticRadius: 90
  };


  /* =======================================================
     02 — STATE
     ======================================================= */

  const state = {
    loaded: false,

    menuOpen: false,

    standbyActive: false,

    activeSection: 0,

    activityTimer: null,

    standbyWakeLock: false,

    rafId: null,

    resizeTimer: null,

    lastScrollY: window.scrollY,

    scrollDirection: 1,

    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,

      previousX: window.innerWidth / 2,
      previousY: window.innerHeight / 2,

      hasMoved: false
    },

    cursor: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,

      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2
    },

    trajectory: {
      progress: 0,
      targetProgress: 0,

      drift: 0,
      targetDrift: 0,

      pointPosition: 0,
      targetPointPosition: 0
    }
  };


  /* =======================================================
     03 — DOM
     ======================================================= */

  const dom = {
    body: document.body,

    loader: document.querySelector("#page-loader"),

    transition: document.querySelector(".page-transition"),

    standby: document.querySelector(".standby-screen"),
    standbyWake: document.querySelector(".standby-wake"),

    cursor: document.querySelector(".cursor"),
    cursorDot: document.querySelector(".cursor-dot"),
    cursorRing: document.querySelector(".cursor-ring"),

    header: document.querySelector(".site-header"),
    headerCounter: document.querySelector(".site-header-section-counter"),

    menuTrigger: document.querySelector(".menu-trigger"),
    menu: document.querySelector(".site-menu"),
    menuPanel: document.querySelector(".site-menu-panel"),
    menuBackdrop: document.querySelector(".site-menu-backdrop"),
    menuClose: document.querySelector(".site-menu-close"),

    scrollProgress: document.querySelector(".scroll-progress-bar"),

    sectionNav: document.querySelector(".home-section-nav"),
    sectionNavCurrentNumber:
      document.querySelector(".home-section-nav-current-number"),
    sectionNavCurrentLabel:
      document.querySelector(".home-section-nav-current-label"),
    sectionNavRoute:
      document.querySelector(".home-section-nav-route"),
    sectionNavRouteProgress:
      document.querySelector(".home-section-nav-route-progress"),
    sectionNavRoutePoint:
      document.querySelector(".home-section-nav-route-point"),
    sectionNavItems:
      Array.from(document.querySelectorAll(".home-section-nav-item")),

    sections:
      Array.from(document.querySelectorAll(".home-section")),

    reveals:
      Array.from(document.querySelectorAll(".reveal")),

    directionCards:
      Array.from(document.querySelectorAll(".direction-card")),

    magnetic:
      Array.from(document.querySelectorAll("[data-magnetic]")),

    transitionLinks:
      Array.from(document.querySelectorAll("a[href]"))
  };


  /* =======================================================
     04 — UTILITIES
     ======================================================= */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const lerp = (current, target, amount) => {
    return current + (target - current) * amount;
  };


  const prefersReducedMotion = () => {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  };


  const isTouchDevice = () => {
    return window.matchMedia("(hover: none)").matches;
  };


  /* =======================================================
     05 — LOADER
     ======================================================= */

  function initLoader() {
    if (!dom.loader) {
      state.loaded = true;
      return;
    }

    const startedAt = performance.now();

    let completed = false;

    const finish = () => {
      if (completed) return;

      completed = true;
      state.loaded = true;

      const elapsed = performance.now() - startedAt;

      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        dom.loader.classList.add("is-hidden");

        window.setTimeout(() => {
          dom.loader.setAttribute("aria-hidden", "true");
        }, 800);
      }, remaining);
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

    window.setTimeout(finish, CONFIG.loaderMaximumWait);
  }


  /* =======================================================
     06 — MENU
     ======================================================= */

  function openMenu() {
    if (!dom.menu || state.menuOpen) return;

    state.menuOpen = true;

    dom.menu.classList.add("is-open");

    if (dom.menuTrigger) {
      dom.menuTrigger.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    dom.body.classList.add("is-menu-open");

    requestAnimationFrame(() => {
      const firstLink =
        dom.menu.querySelector(".site-menu-link");

      if (firstLink) {
        firstLink.focus();
      }
    });
  }


  function closeMenu(options = {}) {
    if (!dom.menu || !state.menuOpen) return;

    const {
      restoreFocus = true
    } = options;

    state.menuOpen = false;

    dom.menu.classList.remove("is-open");

    if (dom.menuTrigger) {
      dom.menuTrigger.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    dom.body.classList.remove("is-menu-open");

    if (restoreFocus && dom.menuTrigger) {
      requestAnimationFrame(() => {
        dom.menuTrigger.focus();
      });
    }
  }


  function initMenu() {
    if (dom.menuTrigger) {
      dom.menuTrigger.addEventListener(
        "click",
        () => {
          registerActivity();

          if (state.menuOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }
      );
    }

    if (dom.menuClose) {
      dom.menuClose.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );
    }

    if (dom.menuBackdrop) {
      dom.menuBackdrop.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );
    }

    if (dom.menu) {
      dom.menu.addEventListener(
        "click",
        event => {
          const link =
            event.target.closest("a[href]");

          if (!link) return;

          closeMenu({
            restoreFocus: false
          });
        }
      );
    }
  }


  /* =======================================================
     07 — KEYBOARD
     ======================================================= */

  function initKeyboard() {
    document.addEventListener(
      "keydown",
      event => {
        registerActivity();

        if (event.key === "Escape") {
          if (state.menuOpen) {
            closeMenu();
            return;
          }

          if (state.standbyActive) {
            wakeStandby();
          }
        }

        if (
          event.key === "PageDown" &&
          !state.menuOpen &&
          !state.standbyActive
        ) {
          event.preventDefault();

          navigateSection(
            state.activeSection + 1
          );
        }

        if (
          event.key === "PageUp" &&
          !state.menuOpen &&
          !state.standbyActive
        ) {
          event.preventDefault();

          navigateSection(
            state.activeSection - 1
          );
        }
      }
    );
  }


  /* =======================================================
     08 — SCROLL PROGRESS
     ======================================================= */

  function updateScrollProgress() {
    if (!dom.scrollProgress) return;

    const scrollTop =
      window.scrollY || document.documentElement.scrollTop;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      documentHeight > 0
        ? clamp(scrollTop / documentHeight, 0, 1)
        : 0;

    dom.scrollProgress.style.transform =
      `scaleX(${progress})`;
  }


  /* =======================================================
     09 — SECTION NAVIGATION
     ======================================================= */

  function getSectionProgress() {
    if (!dom.sections.length) {
      return 0;
    }

    const scrollTop = window.scrollY;

    const firstSection =
      dom.sections[0];

    const lastSection =
      dom.sections[dom.sections.length - 1];

    const start =
      firstSection.offsetTop;

    const end =
      lastSection.offsetTop +
      lastSection.offsetHeight -
      window.innerHeight;

    if (end <= start) {
      return 0;
    }

    return clamp(
      (scrollTop - start) /
      (end - start),
      0,
      1
    );
  }


  function updateSectionNavigation() {
    if (!dom.sections.length) return;

    const viewportPoint =
      window.scrollY +
      window.innerHeight * CONFIG.sectionThreshold;

    let closestIndex = 0;
    let closestDistance = Infinity;

    dom.sections.forEach(
      (section, index) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;

        const center =
          top + height * 0.5;

        const distance =
          Math.abs(viewportPoint - center);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    );

    setActiveSection(closestIndex);
  }


  function setActiveSection(index) {
    if (!dom.sections.length) return;

    const safeIndex = clamp(
      index,
      0,
      dom.sections.length - 1
    );

    state.activeSection = safeIndex;

    const section =
      dom.sections[safeIndex];

    const item =
      dom.sectionNavItems[safeIndex];

    const number =
      String(safeIndex + 1).padStart(2, "0");

    const label =
      item?.getAttribute("aria-label") ||
      section?.dataset?.sectionLabel ||
      section?.id ||
      "";

    const cleanLabel =
      label.includes("—")
        ? label.split("—").slice(1).join("—").trim()
        : label;

    if (dom.sectionNavCurrentNumber) {
      dom.sectionNavCurrentNumber.textContent =
        number;
    }

    if (dom.sectionNavCurrentLabel) {
      dom.sectionNavCurrentLabel.textContent =
        cleanLabel;
    }

    if (dom.headerCounter) {
      dom.headerCounter.textContent =
        `${number} / ${String(dom.sections.length).padStart(2, "0")}`;
    }

    dom.sectionNavItems.forEach(
      (navItem, navIndex) => {
        const active =
          navIndex === safeIndex;

        navItem.classList.toggle(
          "is-active",
          active
        );

        if (active) {
          navItem.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          navItem.removeAttribute(
            "aria-current"
          );
        }
      }
    );

    updateSectionRoute();
  }


  function updateSectionRoute() {
    if (!dom.sections.length) return;

    const progress =
      getSectionProgress();

    state.trajectory.targetProgress =
      progress;

    state.trajectory.targetPointPosition =
      clamp(
        state.activeSection /
        Math.max(dom.sections.length - 1, 1),
        0,
        1
      );

    if (dom.sectionNavRouteProgress) {
      dom.sectionNavRouteProgress.style.width =
        `${progress * 100}%`;
    }

    if (dom.sectionNavRoutePoint) {
      dom.sectionNavRoutePoint.style.left =
        `${state.trajectory.targetPointPosition * 100}%`;
    }
  }


  function navigateSection(index) {
    if (!dom.sections.length) return;

    const safeIndex = clamp(
      index,
      0,
      dom.sections.length - 1
    );

    const target =
      dom.sections[safeIndex];

    if (!target) return;

    registerActivity();

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      CONFIG.scrollNavigationOffset;

    window.scrollTo({
      top,
      behavior:
        prefersReducedMotion()
          ? "auto"
          : "smooth"
    });
  }


  function initSectionNavigation() {
    if (!dom.sections.length) return;

    dom.sectionNavItems.forEach(
      (item, index) => {
        item.addEventListener(
          "click",
          event => {
            event.preventDefault();

            navigateSection(index);
          }
        );
      }
    );

    updateSectionNavigation();
  }


  /* =======================================================
     10 — MOBILE TRAJECTORY AUTO-SCROLL
     ======================================================= */

  function keepActiveNavigationVisible() {
    if (
      !dom.sectionNavRoute ||
      !dom.sectionNavItems.length
    ) {
      return;
    }

    if (window.innerWidth > 900) {
      return;
    }

    const active =
      dom.sectionNavItems[state.activeSection];

    if (!active) return;

    const route =
      dom.sectionNavRoute;

    const targetLeft =
      active.offsetLeft -
      route.clientWidth / 2 +
      active.offsetWidth / 2;

    const current =
      route.scrollLeft;

    const difference =
      targetLeft - current;

    if (Math.abs(difference) < 8) {
      return;
    }

    route.scrollTo({
      left: targetLeft,
      behavior:
        prefersReducedMotion()
          ? "auto"
          : "smooth"
    });
  }


  /* =======================================================
     11 — SECTION OBSERVER
     ======================================================= */

  function initSectionObserver() {
    if (!dom.sections.length) return;

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const index =
              dom.sections.indexOf(entry.target);

            if (index !== -1) {
              setActiveSection(index);
              keepActiveNavigationVisible();
            }
          });
        },
        {
          root: null,

          rootMargin:
            "-40% 0px -40% 0px",

          threshold: 0
        }
      );

    dom.sections.forEach(
      section => observer.observe(section)
    );
  }


  /* =======================================================
     12 — REVEAL
     ======================================================= */

  function initReveal() {
    if (!dom.reveals.length) return;

    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      dom.reveals.forEach(
        element => {
          element.classList.add("is-visible");
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold:
            CONFIG.revealThreshold
        }
      );

    dom.reveals.forEach(
      element => observer.observe(element)
    );
  }


  /* =======================================================
     13 — TRAJECTORY ENGINE
     ======================================================= */

  function updateTrajectoryTargets() {
    if (!dom.sections.length) return;

    const scrollTop =
      window.scrollY;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const globalProgress =
      documentHeight > 0
        ? clamp(
            scrollTop / documentHeight,
            0,
            1
          )
        : 0;

    state.trajectory.targetProgress =
      globalProgress;

    const scrollDelta =
      scrollTop - state.lastScrollY;

    state.scrollDirection =
      scrollDelta >= 0 ? 1 : -1;

    const velocity =
      clamp(
        Math.abs(scrollDelta),
        0,
        30
      );

    state.trajectory.targetDrift =
      velocity *
      state.scrollDirection *
      CONFIG.trajectoryDrift;

    state.lastScrollY =
      scrollTop;
  }


  function updateSectionMotion() {
    if (!dom.sections.length) return;

    const viewportCenter =
      window.innerHeight / 2;

    dom.sections.forEach(
      section => {
        const rect =
          section.getBoundingClientRect();

        const sectionCenter =
          rect.top +
          rect.height / 2;

        const distance =
          (sectionCenter - viewportCenter) /
          window.innerHeight;

        const progress =
          clamp(
            .5 - distance * .5,
            0,
            1
          );

        const drift =
          clamp(
            distance * -CONFIG.trajectoryDrift,
            -CONFIG.trajectoryDrift,
            CONFIG.trajectoryDrift
          );

        section.style.setProperty(
          "--section-progress",
          progress.toFixed(4)
        );

        section.style.setProperty(
          "--section-drift",
          drift.toFixed(2)
        );
      }
    );
  }


  function animateTrajectory() {
    const reduced =
      prefersReducedMotion();

    const amount =
      reduced
        ? 1
        : CONFIG.trajectoryLerp;

    state.trajectory.progress =
      lerp(
        state.trajectory.progress,
        state.trajectory.targetProgress,
        amount
      );

    state.trajectory.drift =
      lerp(
        state.trajectory.drift,
        state.trajectory.targetDrift,
        amount
      );

    state.trajectory.pointPosition =
      lerp(
        state.trajectory.pointPosition,
        state.trajectory.targetPointPosition,
        amount
      );

    if (dom.sectionNavRouteProgress) {
      dom.sectionNavRouteProgress.style.width =
        `${state.trajectory.progress * 100}%`;
    }

    if (dom.sectionNavRoutePoint) {
      dom.sectionNavRoutePoint.style.left =
        `${state.trajectory.pointPosition * 100}%`;
    }

    if (dom.sectionNav) {
      dom.sectionNav.style.setProperty(
        "--trajectory-progress",
        state.trajectory.progress.toFixed(4)
      );

      dom.sectionNav.style.setProperty(
        "--trajectory-drift",
        state.trajectory.drift.toFixed(2)
      );
    }
  }


  /* =======================================================
     14 — SECTION 06 → 07 TRANSITION
     CONTROLLED "IMPOSSIBLE MOMENT"
     ======================================================= */

  function updateTrajectoryDepthMoment() {
    if (
      prefersReducedMotion() ||
      dom.sections.length < 7
    ) {
      return;
    }

    const sectionSix =
      dom.sections[5];

    const sectionSeven =
      dom.sections[6];

    if (!sectionSix || !sectionSeven) {
      return;
    }

    const rectSix =
      sectionSix.getBoundingClientRect();

    const rectSeven =
      sectionSeven.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const distance =
      Math.min(
        Math.abs(rectSix.bottom - viewport * .5),
        Math.abs(rectSeven.top - viewport * .5)
      );

    const intensity =
      clamp(
        1 - distance / (viewport * .75),
        0,
        1
      );

    document.documentElement.style.setProperty(
      "--trajectory-scale",
      (1 + intensity * .035).toFixed(4)
    );

    document.documentElement.style.setProperty(
      "--trajectory-opacity",
      (1 - intensity * .08).toFixed(4)
    );
  }


  /* =======================================================
     15 — CURSOR
     ======================================================= */

  function initCursor() {
    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing
    ) {
      return;
    }

    if (isTouchDevice()) {
      return;
    }

    dom.body.classList.add(
      "has-custom-cursor"
    );

    document.addEventListener(
      "pointermove",
      event => {
        state.pointer.x =
          event.clientX;

        state.pointer.y =
          event.clientY;

        state.pointer.hasMoved =
          true;

        state.cursor.targetX =
          event.clientX;

        state.cursor.targetY =
          event.clientY;

        registerActivity();

        updateCursorHover(event);
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "pointerleave",
      () => {
        dom.body.classList.remove(
          "cursor-hover"
        );
      }
    );
  }


  function updateCursorHover(event) {
    const target =
      event.target.closest(
        "a, button, [data-magnetic]"
      );

    dom.body.classList.toggle(
      "cursor-hover",
      Boolean(target)
    );
  }


  function animateCursor() {
    if (
      !dom.cursor ||
      isTouchDevice()
    ) {
      return;
    }

    state.cursor.x =
      lerp(
        state.cursor.x,
        state.cursor.targetX,
        CONFIG.cursorLerp
      );

    state.cursor.y =
      lerp(
        state.cursor.y,
        state.cursor.targetY,
        CONFIG.cursorLerp
      );

    dom.cursor.style.transform =
      `translate3d(${state.cursor.x}px, ${state.cursor.y}px, 0)`;

    if (dom.cursorDot) {
      dom.cursorDot.style.transform =
        "translate(-50%, -50%)";
    }

    if (dom.cursorRing) {
      dom.cursorRing.style.transform =
        "translate(-50%, -50%)";
    }
  }


  /* =======================================================
     16 — MAGNETIC ELEMENTS
     ======================================================= */

  function initMagnetic() {
    if (
      isTouchDevice() ||
      !dom.magnetic.length
    ) {
      return;
    }

    dom.magnetic.forEach(
      element => {
        element.addEventListener(
          "pointermove",
          event => {
            const rect =
              element.getBoundingClientRect();

            const centerX =
              rect.left +
              rect.width / 2;

            const centerY =
              rect.top +
              rect.height / 2;

            const dx =
              event.clientX - centerX;

            const dy =
              event.clientY - centerY;

            const distance =
              Math.hypot(dx, dy);

            if (
              distance >
              CONFIG.magneticRadius
            ) {
              element.style.transform =
                "";

              return;
            }

            const strength =
              CONFIG.magneticStrength *
              (1 - distance / CONFIG.magneticRadius);

            element.style.transform =
              `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            element.style.transform =
              "";
          }
        );
      }
    );
  }


  /* =======================================================
     17 — DIRECTION CARDS
     ======================================================= */

  function initDirectionCards() {
    if (
      isTouchDevice() ||
      !dom.directionCards.length
    ) {
      return;
    }

    dom.directionCards.forEach(
      card => {
        card.addEventListener(
          "pointermove",
          event => {
            const rect =
              card.getBoundingClientRect();

            const x =
              event.clientX - rect.left;

            const y =
              event.clientY - rect.top;

            const rotateX =
              ((y / rect.height) - .5) * -4;

            const rotateY =
              ((x / rect.width) - .5) * 4;

            card.style.transform =
              `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
          }
        );

        card.addEventListener(
          "pointerleave",
          () => {
            card.style.transform =
              "";
          }
        );
      }
    );
  }


  /* =======================================================
     18 — STANDBY
     ======================================================= */

  function scheduleStandby() {
    window.clearTimeout(
      state.activityTimer
    );

    if (
      state.standbyActive ||
      document.hidden
    ) {
      return;
    }

    state.activityTimer =
      window.setTimeout(
        enterStandby,
        CONFIG.standbyDelay
      );
  }


  function enterStandby() {
    if (
      state.standbyActive ||
      state.menuOpen ||
      document.hidden
    ) {
      return;
    }

    state.standbyActive = true;

    dom.body.classList.add(
      "is-standby"
    );

    if (dom.standby) {
      dom.standby.classList.add(
        "is-active"
      );

      dom.standby.setAttribute(
        "aria-hidden",
        "false"
      );
    }
  }


  function wakeStandby() {
    if (!state.standbyActive) {
      return;
    }

    state.standbyActive = false;

    dom.body.classList.remove(
      "is-standby"
    );

    if (dom.standby) {
      dom.standby.classList.remove(
        "is-active"
      );

      dom.standby.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    state.pointer.previousX =
      state.pointer.x;

    state.pointer.previousY =
      state.pointer.y;

    scheduleStandby();
  }


  function registerActivity() {
    if (state.standbyActive) {
      return;
    }

    scheduleStandby();
  }


  function handleMovementWake(event) {
    if (!state.standbyActive) {
      registerActivity();
      return;
    }

    let moved = false;

    if (
      event.type === "pointermove"
    ) {
      const dx =
        event.clientX -
        state.pointer.previousX;

      const dy =
        event.clientY -
        state.pointer.previousY;

      const distance =
        Math.hypot(dx, dy);

      if (
        distance >=
        CONFIG.standbyWakeDistance
      ) {
        moved = true;
      }

      state.pointer.previousX =
        event.clientX;

      state.pointer.previousY =
        event.clientY;
    }

    if (
      event.type === "touchmove" ||
      event.type === "wheel" ||
      event.type === "scroll"
    ) {
      moved = true;
    }

    if (moved) {
      wakeStandby();
    }
  }


  function initStandby() {
    if (!dom.standby) {
      return;
    }

    /*
     * Movement wakes the page.
     * Pointer down/touch tap does NOT wake it.
     */

    document.addEventListener(
      "pointermove",
      handleMovementWake,
      {
        passive: true
      }
    );

    document.addEventListener(
      "touchmove",
      handleMovementWake,
      {
        passive: true
      }
    );

    window.addEventListener(
      "wheel",
      handleMovementWake,
      {
        passive: true
      }
    );

    window.addEventListener(
      "scroll",
      handleMovementWake,
      {
        passive: true
      }
    );

    if (dom.standbyWake) {
      dom.standbyWake.addEventListener(
        "click",
        wakeStandby
      );
    }

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          window.clearTimeout(
            state.activityTimer
          );

          return;
        }

        if (state.standbyActive) {
          wakeStandby();
        } else {
          scheduleStandby();
        }
      }
    );

    scheduleStandby();
  }


  /* =======================================================
     19 — PAGE TRANSITIONS
     ======================================================= */

  function isInternalPageLink(link) {
    if (!link) return false;

    const href =
      link.getAttribute("href");

    if (!href) return false;

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return false;
    }

    if (
      link.hasAttribute("download") ||
      link.target === "_blank"
    ) {
      return false;
    }

    try {
      const url =
        new URL(
          href,
          window.location.href
        );

      return (
        url.origin ===
        window.location.origin
      );
    } catch {
      return false;
    }
  }


  function initPageTransitions() {
    if (!dom.transition) {
      return;
    }

    dom.transitionLinks.forEach(
      link => {
        if (!isInternalPageLink(link)) {
          return;
        }

        link.addEventListener(
          "click",
          event => {
            if (
              event.defaultPrevented ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            ) {
              return;
            }

            const href =
              link.getAttribute("href");

            if (!href) return;

            const targetUrl =
              new URL(
                href,
                window.location.href
              );

            if (
              targetUrl.pathname ===
                window.location.pathname &&
              targetUrl.hash
            ) {
              return;
            }

            event.preventDefault();

            closeMenu({
              restoreFocus: false
            });

            dom.transition.classList.add(
              "is-active"
            );

            window.setTimeout(
              () => {
                window.location.href =
                  targetUrl.href;
              },
              CONFIG.transitionDuration
            );
          }
        );
      }
    );
  }


  /* =======================================================
     20 — HASH NAVIGATION
     ======================================================= */

  function initHashNavigation() {
    if (!window.location.hash) {
      return;
    }

    const hash =
      window.location.hash;

    window.setTimeout(
      () => {
        const target =
          document.querySelector(hash);

        if (!target) return;

        target.scrollIntoView({
          behavior:
            prefersReducedMotion()
              ? "auto"
              : "smooth"
        });
      },
      500
    );
  }


  /* =======================================================
     21 — RESIZE
     ======================================================= */

  function initResize() {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );

        state.resizeTimer =
          window.setTimeout(
            () => {
              updateSectionNavigation();
              updateScrollProgress();
              updateTrajectoryTargets();
              updateSectionMotion();
            },
            CONFIG.resizeDebounce
          );
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     22 — SCROLL
     ======================================================= */

  function initScroll() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(
          () => {
            updateScrollProgress();

            updateSectionNavigation();

            updateTrajectoryTargets();

            updateSectionMotion();

            updateTrajectoryDepthMoment();

            keepActiveNavigationVisible();

            ticking = false;
          }
        );
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     23 — ACTIVITY
     ======================================================= */

  function initActivityTracking() {
    const passiveEvents = [
      "mousemove",
      "pointermove",
      "touchmove",
      "wheel"
    ];

    passiveEvents.forEach(
      eventName => {
        document.addEventListener(
          eventName,
          () => {
            if (!state.standbyActive) {
              registerActivity();
            }
          },
          {
            passive: true
          }
        );
      }
    );

    document.addEventListener(
      "click",
      () => {
        if (!state.standbyActive) {
          registerActivity();
        }
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     24 — MAIN RAF
     ======================================================= */

  function animationLoop() {
    animateCursor();

    animateTrajectory();

    state.trajectory.targetDrift *= .92;

    state.rafId =
      requestAnimationFrame(
        animationLoop
      );
  }


  /* =======================================================
     25 — INITIAL STATE
     ======================================================= */

  function initInitialState() {
    setActiveSection(0);

    updateScrollProgress();

    updateTrajectoryTargets();

    updateSectionMotion();

    if (dom.transition) {
      dom.transition.classList.remove(
        "is-active"
      );
    }

    if (dom.standby) {
      dom.standby.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  }


  /* =======================================================
     26 — INIT
     ======================================================= */

  function init() {
    initLoader();

    initMenu();

    initKeyboard();

    initSectionNavigation();

    initSectionObserver();

    initReveal();

    initCursor();

    initMagnetic();

    initDirectionCards();

    initStandby();

    initPageTransitions();

    initHashNavigation();

    initResize();

    initScroll();

    initActivityTracking();

    initInitialState();

    animationLoop();
  }


  /* =======================================================
     27 — START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
