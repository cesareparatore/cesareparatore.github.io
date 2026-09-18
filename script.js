/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM — 2.3
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     CONFIG
     ======================================================= */

  const CONFIG = {
    loaderMinimumTime: 5200,
    loaderMaximumWait: 8000,

    revealThreshold: 0.12,

    cursorLerp: 0.16,

    resizeDebounce: 180,

    scrollNavigationOffset: 18,

    transitionDuration: 700,

    trajectoryLerp: 0.085,
    trajectoryDrift: 18,

    magneticStrength: 0.12,
    magneticRadius: 90,

    standbyDelay: 30000
  };


  /* =======================================================
     STATE
     ======================================================= */

  const state = {
    loaded: false,

    menuOpen: false,
    standby: false,

    activeIndex: 0,

    resizeTimer: null,
    standbyTimer: null,
    loaderTimer: null,
    loaderFailsafeTimer: null,

    loaderStarted: null,
    loaderReady: false,
    loaderCompletionScheduled: false,

    rafId: null,

    reducedMotion: false,

    standbyReturnFocus: null,
    standbyUnderlying: [],

    pointer: {
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2
    },

    cursor: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    },

    trajectory: {
      progress: 0,
      targetProgress: 0,
      drift: 0,
      targetDrift: 0
    }
  };


  /* =======================================================
     DOM
     ======================================================= */

  const dom = {
    html: document.documentElement,
    body: document.body,

    loader: document.querySelector(".page-loader"),
    transition: document.querySelector(".page-transition"),

    cursor: document.querySelector(".custom-cursor"),
    cursorDot: document.querySelector(".custom-cursor-dot"),
    cursorRing: document.querySelector(".custom-cursor-ring"),

    header: document.querySelector(".site-header"),
    main: document.querySelector("#main-content"),
    footer: document.querySelector(".site-footer"),

    menu: document.querySelector(".site-menu"),
    menuTrigger: document.querySelector(".menu-trigger"),
    menuLinks: Array.from(
      document.querySelectorAll(".site-menu a")
    ),

    progressLabel: document.querySelector("#progress-current"),
    progressFill: document.querySelector("#progress-fill"),
    progressPoint: document.querySelector("#progress-point"),

    previousSection: document.querySelector("#previous-section"),
    previousLabel: document.querySelector("#previous-section-label"),

    nextSection: document.querySelector("#next-section"),
    nextLabel: document.querySelector("#next-section-label"),

    sections: Array.from(
      document.querySelectorAll(".home-section")
    ),

    reveals: Array.from(
      document.querySelectorAll(".reveal")
    ),

    narrativeLinks: Array.from(
      document.querySelectorAll(".narrative-link")
    ),

    magneticElements: Array.from(
      document.querySelectorAll(
        ".site-brand, .menu-trigger, .contact-cta"
      )
    ),

    transitionLinks: Array.from(
      document.querySelectorAll(
        'a[href]:not([target="_blank"])'
      )
    ),

    standby: document.querySelector(".standby-screen"),
    standbyWake: document.querySelector(".standby-wake"),

    ctaTrajectories: Array.from(
      document.querySelectorAll(".cta-trajectory")
    ),

    directionLinks: Array.from(
      document.querySelectorAll(
        ".hero-direction[data-direction]"
      )
    ),

    directionNodes: Array.from(
      document.querySelectorAll(
        ".direction-node[data-direction]"
      )
    ),

    networkNodes: Array.from(
      document.querySelectorAll(
        ".network-node[data-node]"
      )
    )
  };


  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const lerp = (current, target, amount) =>
    current + (target - current) * amount;


  const getSectionNumber = (index) =>
    String(index + 1).padStart(2, "0");


  const getSectionByIndex = (index) =>
    dom.sections[
      clamp(index, 0, dom.sections.length - 1)
    ];


  const getSectionTitle = (section) =>
    section?.dataset.sectionTitle || "";


  const isFinePointer = () =>
    window.matchMedia(
      "(pointer: fine)"
    ).matches;


  const prefersReducedMotion = () =>
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  /* =======================================================
     MOTION PREFERENCE
     ======================================================= */

  const updateMotionPreference = () => {
    state.reducedMotion = prefersReducedMotion();

    dom.html.classList.toggle(
      "reduced-motion",
      state.reducedMotion
    );

    if (dom.standby) {
      dom.standby.classList.toggle(
        "is-reduced",
        state.reducedMotion
      );
    }

    if (state.reducedMotion) {
      state.trajectory.targetDrift = 0;
      state.trajectory.drift = 0;
    }

    if (state.standby) {
      clearStandbyTimer();
    } else {
      resetStandbyTimer();
    }
  };


  /* =======================================================
     LOADER
     ======================================================= */

  const ensureLoaderLogo = () => {
    if (!dom.loader) return;

    const inner =
      dom.loader.querySelector(".page-loader-inner");

    const trajectory =
      dom.loader.querySelector(".loader-trajectory");

    if (!inner || !trajectory) return;

    if (
      inner.querySelector(".page-loader-logo")
    ) {
      return;
    }

    const logo =
      document.createElement("img");

    logo.className = "page-loader-logo";
    logo.src = "/assets/images/cp-mark.png";
    logo.alt = "Cesare Paratore";
    logo.setAttribute("aria-hidden", "true");

    inner.insertBefore(
      logo,
      trajectory
    );
  };


  const completeLoader = () => {
    if (
      !dom.loader ||
      state.loaderCompletionScheduled
    ) {
      return;
    }

    state.loaderCompletionScheduled = true;

    dom.loader.classList.add("is-ready");

    window.setTimeout(() => {
      dom.loader.classList.add("is-hidden");

      window.setTimeout(() => {
        dom.loader?.remove();
      }, 950);

    }, 120);
  };


  const tryCompleteLoader = () => {
    if (!state.loaderReady) return;

    const elapsed =
      performance.now() - state.loaderStarted;

    const minimum =
      Math.max(
        5000,
        CONFIG.loaderMinimumTime
      );

    const remaining =
      Math.max(
        0,
        minimum - elapsed
      );

    window.clearTimeout(
      state.loaderTimer
    );

    state.loaderTimer =
      window.setTimeout(
        completeLoader,
        remaining
      );
  };


  const initLoader = () => {
    if (!dom.loader) {
      state.loaderReady = true;
      state.loaderStarted = performance.now();
      return;
    }

    ensureLoaderLogo();

    state.loaderStarted =
      performance.now();

    const minimum =
      Math.max(
        5000,
        CONFIG.loaderMinimumTime
      );

    const maximumWait =
      Math.max(
        CONFIG.loaderMaximumWait,
        minimum + 500
      );

    state.loaderReady =
      document.readyState === "complete";

    if (state.loaderReady) {
      tryCompleteLoader();
    } else {
      window.addEventListener(
        "load",
        () => {
          state.loaderReady = true;
          tryCompleteLoader();
        },
        { once: true }
      );
    }

    state.loaderFailsafeTimer =
      window.setTimeout(() => {
        state.loaderReady = true;
        completeLoader();
      }, maximumWait);
  };


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  const isInternalTransitionLink = (link) => {
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

    if (link.hasAttribute("download")) {
      return false;
    }

    if (
      link.getAttribute("target") === "_blank"
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
  };


  const runPageTransition = (event, link) => {
    if (
      state.reducedMotion ||
      !dom.transition ||
      !isInternalTransitionLink(link)
    ) {
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const href =
      link.href;

    if (!href) return;

    event.preventDefault();

    closeMenu(false);

    dom.transition.classList.add(
      "is-active"
    );

    window.setTimeout(() => {
      window.location.href = href;
    }, CONFIG.transitionDuration);
  };


  const initPageTransitions = () => {
    dom.transitionLinks.forEach(
      (link) => {
        link.addEventListener(
          "click",
          (event) =>
            runPageTransition(event, link)
        );
      }
    );
  };


  /* =======================================================
     MENU
     ======================================================= */

  const setMenuState = (open, returnFocus = true) => {
    if (!dom.menu || !dom.menuTrigger) {
      return;
    }

    state.menuOpen = open;

    dom.menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    dom.menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    dom.menuTrigger.setAttribute(
      "aria-label",
      open
        ? "Chiudi menu"
        : "Apri menu"
    );

    if (open) {
      dom.menu.removeAttribute(
        "inert"
      );

      dom.body.classList.add(
        "menu-is-open"
      );

      window.setTimeout(() => {
        dom.menuLinks[0]?.focus();
      }, 250);

    } else {
      dom.menu.setAttribute(
        "inert",
        ""
      );

      dom.body.classList.remove(
        "menu-is-open"
      );

      if (returnFocus) {
        dom.menuTrigger.focus();
      }
    }
  };


  const openMenu = () => {
    if (state.menuOpen) return;
    setMenuState(true);
  };


  const closeMenu = (
    returnFocus = true
  ) => {
    if (!state.menuOpen) return;
    setMenuState(
      false,
      returnFocus
    );
  };


  const handleMenuKeydown = (event) => {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable =
      dom.menuLinks.filter(
        (link) =>
          !link.hasAttribute(
            "aria-disabled"
          )
      );

    if (!focusable.length) {
      return;
    }

    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length - 1
      ];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();

    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  };


  const initMenu = () => {
    if (
      !dom.menu ||
      !dom.menuTrigger
    ) {
      return;
    }

    dom.menuTrigger.addEventListener(
      "click",
      () => {
        state.menuOpen
          ? closeMenu()
          : openMenu();
      }
    );

    dom.menu.addEventListener(
      "keydown",
      handleMenuKeydown
    );

    dom.menuLinks.forEach(
      (link) => {
        link.addEventListener(
          "click",
          () => closeMenu(false)
        );
      }
    );
  };


  /* =======================================================
     WOW HEADER
     ======================================================= */

  const updateWowHeader = (
    index
  ) => {
    const section =
      getSectionByIndex(index);

    if (!section) return;

    const title =
      getSectionTitle(section);

    if (dom.progressLabel) {
      dom.progressLabel.textContent =
        title;
    }

    const total =
      Math.max(
        dom.sections.length - 1,
        1
      );

    const progress =
      index / total;

    if (dom.progressFill) {
      dom.progressFill.style.width =
        `${progress * 100}%`;
    }

    if (dom.progressPoint) {
      dom.progressPoint.style.left =
        `${progress * 100}%`;
    }

    const previousIndex =
      index - 1;

    const nextIndex =
      index + 1;

    if (
      dom.previousSection &&
      dom.previousLabel
    ) {
      if (previousIndex < 0) {
        dom.previousSection.classList.add(
          "is-disabled"
        );

        dom.previousSection.setAttribute(
          "aria-hidden",
          "true"
        );

        dom.previousSection.setAttribute(
          "tabindex",
          "-1"
        );

      } else {
        const previous =
          getSectionByIndex(
            previousIndex
          );

        dom.previousSection.classList.remove(
          "is-disabled"
        );

        dom.previousSection.setAttribute(
          "aria-hidden",
          "false"
        );

        dom.previousSection.setAttribute(
          "tabindex",
          "0"
        );

        dom.previousSection.href =
          `#${getSectionNumber(previousIndex)}`;

        dom.previousLabel.textContent =
          getSectionTitle(previous);
      }
    }

    if (
      dom.nextSection &&
      dom.nextLabel
    ) {
      if (
        nextIndex >=
        dom.sections.length
      ) {
        dom.nextSection.href = "#01";
        dom.nextLabel.textContent =
          "Torna all'inizio";

        dom.nextSection.setAttribute(
          "aria-label",
          "Torna all'inizio"
        );

        const arrow =
          dom.nextSection.querySelector(
            ".section-jump-arrow"
          );

        if (arrow) {
          arrow.textContent = "↑";
        }

      } else {
        const next =
          getSectionByIndex(
            nextIndex
          );

        dom.nextSection.href =
          `#${getSectionNumber(nextIndex)}`;

        dom.nextLabel.textContent =
          getSectionTitle(next);

        dom.nextSection.setAttribute(
          "aria-label",
          `Vai a ${getSectionTitle(next)}`
        );

        const arrow =
          dom.nextSection.querySelector(
            ".section-jump-arrow"
          );

        if (arrow) {
          arrow.textContent = "→";
        }
      }
    }
  };


  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  const scrollToSection = (
    index
  ) => {
    const section =
      getSectionByIndex(index);

    if (!section) return;

    const headerHeight =
      dom.header?.offsetHeight || 0;

    const rect =
      section.getBoundingClientRect();

    const top =
      window.scrollY +
      rect.top -
      headerHeight -
      CONFIG.scrollNavigationOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior:
        state.reducedMotion
          ? "auto"
          : "smooth"
    });
  };


  const initSectionNavigation = () => {
    const links = [
      dom.previousSection,
      dom.nextSection
    ].filter(Boolean);

    links.forEach(
      (link) => {
        link.addEventListener(
          "click",
          (event) => {
            const href =
              link.getAttribute("href");

            if (
              !href ||
              !href.startsWith("#")
            ) {
              return;
            }

            const target =
              document.querySelector(
                href
              );

            if (!target) return;

            event.preventDefault();

            const index =
              dom.sections.indexOf(
                target
              );

            if (index < 0) return;

            scrollToSection(index);
          }
        );
      }
    );
  };


  /* =======================================================
     ACTIVE SECTION
     ======================================================= */

  const updateActiveSection = () => {
    if (!dom.sections.length) return;

    const reference =
      window.innerHeight * 0.52;

    let closestIndex = 0;
    let closestDistance = Infinity;

    dom.sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        const center =
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            center - reference
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closestIndex =
            index;
        }
      }
    );

    if (
      closestIndex !==
      state.activeIndex
    ) {
      state.activeIndex =
        closestIndex;
    }

    updateWowHeader(
      closestIndex
    );
  };


  /* =======================================================
     REVEAL
     ======================================================= */

  const initReveal = () => {
    if (
      state.reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      dom.reveals.forEach(
        (element) => {
          element.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold:
            CONFIG.revealThreshold,

          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    dom.reveals.forEach(
      (element) =>
        observer.observe(element)
    );
  };


  /* =======================================================
     DIRECTION INTERACTION
     ======================================================= */

  const setDirectionState = (
    direction,
    active
  ) => {
    dom.directionLinks.forEach(
      (link) => {
        link.classList.toggle(
          "is-active",
          active &&
          link.dataset.direction ===
            direction
        );
      }
    );

    dom.directionNodes.forEach(
      (node) => {
        node.classList.toggle(
          "is-active",
          active &&
          node.dataset.direction ===
            direction
        );
      }
    );

    dom.networkNodes.forEach(
      (node) => {
        node.classList.toggle(
          "is-linked",
          active &&
          node.dataset.node ===
            direction
        );
      }
    );
  };


  const initDirectionInteraction = () => {
    dom.directionLinks.forEach(
      (link) => {
        const direction =
          link.dataset.direction;

        link.addEventListener(
          "pointerenter",
          () =>
            setDirectionState(
              direction,
              true
            )
        );

        link.addEventListener(
          "pointerleave",
          () =>
            setDirectionState(
              direction,
              false
            )
        );

        link.addEventListener(
          "focusin",
          () =>
            setDirectionState(
              direction,
              true
            )
        );

        link.addEventListener(
          "focusout",
          () =>
            setDirectionState(
              direction,
              false
            )
        );
      }
    );
  };


  /* =======================================================
     GLOBAL TRAJECTORY
     ======================================================= */

  const updateTrajectoryTarget = () => {
    if (
      dom.sections.length < 2
    ) {
      return;
    }

    const first =
      dom.sections[0]
        .getBoundingClientRect();

    const last =
      dom.sections[
        dom.sections.length - 1
      ].getBoundingClientRect();

    const firstCenter =
      first.top +
      window.scrollY;

    const lastCenter =
      last.top +
      window.scrollY +
      last.height;

    const current =
      window.scrollY +
      window.innerHeight / 2;

    const distance =
      Math.max(
        lastCenter - firstCenter,
        1
      );

    state.trajectory.targetProgress =
      clamp(
        (current - firstCenter) /
          distance,
        0,
        1
      );

    state.trajectory.targetDrift =
      state.reducedMotion
        ? 0
        : Math.sin(
            state.trajectory.targetProgress *
            Math.PI *
            2
          ) *
          CONFIG.trajectoryDrift;
  };


  const renderTrajectory = () => {
    state.trajectory.progress =
      lerp(
        state.trajectory.progress,
        state.trajectory.targetProgress,
        state.reducedMotion
          ? 1
          : CONFIG.trajectoryLerp
      );

    state.trajectory.drift =
      lerp(
        state.trajectory.drift,
        state.trajectory.targetDrift,
        state.reducedMotion
          ? 1
          : CONFIG.trajectoryLerp
      );

    dom.html.style.setProperty(
      "--trajectory-progress",
      state.trajectory.progress
    );

    dom.html.style.setProperty(
      "--trajectory-drift",
      `${state.trajectory.drift}px`
    );
  };


  /* =======================================================
     NARRATIVE LINKS
     ======================================================= */

  const setNarrativeLinkState = (
    direction,
    active
  ) => {
    dom.narrativeLinks.forEach(
      (link) => {
        if (
          link.dataset.trajectoryNode !==
          direction
        ) {
          return;
        }

        link.classList.toggle(
          "is-linked",
          active
        );
      }
    );

    dom.directionNodes.forEach(
      (node) => {
        if (
          node.dataset.direction !==
          direction
        ) {
          return;
        }

        node.classList.toggle(
          "is-linked",
          active
        );
      }
    );

    dom.networkNodes.forEach(
      (node) => {
        if (
          node.dataset.node !==
          direction
        ) {
          return;
        }

        node.classList.toggle(
          "is-linked",
          active
        );
      }
    );
  };


  const initNarrativeLinks = () => {
    dom.narrativeLinks.forEach(
      (link) => {
        const direction =
          link.dataset.trajectoryNode;

        if (!direction) return;

        const activate = () =>
          setNarrativeLinkState(
            direction,
            true
          );

        const deactivate = () =>
          setNarrativeLinkState(
            direction,
            false
          );

        link.addEventListener(
          "pointerenter",
          activate
        );

        link.addEventListener(
          "pointerleave",
          deactivate
        );

        link.addEventListener(
          "focusin",
          activate
        );

        link.addEventListener(
          "focusout",
          deactivate
        );
      }
    );
  };


  /* =======================================================
     CURSOR
     ======================================================= */

  const initCursor = () => {
    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing ||
      state.reducedMotion ||
      !isFinePointer()
    ) {
      return;
    }

    document.addEventListener(
      "pointermove",
      (event) => {
        state.pointer.targetX =
          event.clientX;

        state.pointer.targetY =
          event.clientY;

        dom.cursor.classList.add(
          "is-visible"
        );
      }
    );

    document.addEventListener(
      "pointerleave",
      () => {
        dom.cursor.classList.remove(
          "is-visible"
        );
      }
    );

    const interactiveSelector =
      "a, button, [role='button']";

    document.addEventListener(
      "pointerover",
      (event) => {
        if (
          event.target.closest(
            interactiveSelector
          )
        ) {
          dom.cursor.classList.add(
            "is-hovering"
          );
        }
      }
    );

    document.addEventListener(
      "pointerout",
      (event) => {
        if (
          event.target.closest(
            interactiveSelector
          )
        ) {
          dom.cursor.classList.remove(
            "is-hovering"
          );
        }
      }
    );
  };


  const renderCursor = () => {
    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing ||
      state.reducedMotion ||
      !isFinePointer()
    ) {
      return;
    }

    state.cursor.x =
      lerp(
        state.cursor.x,
        state.pointer.targetX,
        CONFIG.cursorLerp
      );

    state.cursor.y =
      lerp(
        state.cursor.y,
        state.pointer.targetY,
        CONFIG.cursorLerp
      );

    dom.cursorDot.style.transform =
      `translate3d(${state.pointer.targetX}px, ${state.pointer.targetY}px, 0) translate(-50%, -50%)`;

    dom.cursorRing.style.transform =
      `translate3d(${state.cursor.x}px, ${state.cursor.y}px, 0) translate(-50%, -50%)`;
  };


  /* =======================================================
     MAGNETIC ELEMENTS
     ======================================================= */

  const resetMagneticElement = (
    element
  ) => {
    element.style.setProperty(
      "--magnetic-x",
      "0px"
    );

    element.style.setProperty(
      "--magnetic-y",
      "0px"
    );
  };


  const initMagneticElements = () => {
    if (
      !isFinePointer() ||
      state.reducedMotion
    ) {
      return;
    }

    dom.magneticElements.forEach(
      (element) => {
        element.addEventListener(
          "pointermove",
          (event) => {
            const rect =
              element.getBoundingClientRect();

            const centerX =
              rect.left +
              rect.width / 2;

            const centerY =
              rect.top +
              rect.height / 2;

            const distanceX =
              event.clientX -
              centerX;

            const distanceY =
              event.clientY -
              centerY;

            const distance =
              Math.hypot(
                distanceX,
                distanceY
              );

            if (
              distance >
              CONFIG.magneticRadius
            ) {
              resetMagneticElement(
                element
              );

              return;
            }

            const strength =
              (1 -
                distance /
                  CONFIG.magneticRadius) *
              CONFIG.magneticStrength;

            element.style.setProperty(
              "--magnetic-x",
              `${distanceX * strength}px`
            );

            element.style.setProperty(
              "--magnetic-y",
              `${distanceY * strength}px`
            );
          }
        );

        element.addEventListener(
          "pointerleave",
          () =>
            resetMagneticElement(
              element
            )
        );
      }
    );
  };


  /* =======================================================
     CTA
     ======================================================= */

  const initCTA = () => {
    dom.ctaTrajectories.forEach(
      (trajectory) => {
        const cta =
          trajectory.querySelector(
            ".contact-cta"
          );

        if (!cta) return;

        const engage = () =>
          cta.classList.add(
            "is-engaged"
          );

        const disengage = () =>
          cta.classList.remove(
            "is-engaged"
          );

        cta.addEventListener(
          "pointerenter",
          engage
        );

        cta.addEventListener(
          "pointerleave",
          disengage
        );

        cta.addEventListener(
          "focusin",
          engage
        );

        cta.addEventListener(
          "focusout",
          disengage
        );

        cta.addEventListener(
          "pointerdown",
          engage
        );
      }
    );
  };


  /* =======================================================
     STANDBY
     ======================================================= */

  const clearStandbyTimer = () => {
    window.clearTimeout(
      state.standbyTimer
    );

    state.standbyTimer = null;
  };


  const resetStandbyTimer = () => {
    clearStandbyTimer();

    if (
      state.reducedMotion ||
      state.standby
    ) {
      return;
    }

    state.standbyTimer =
      window.setTimeout(
        enterStandby,
        CONFIG.standbyDelay
      );
  };


  const getStandbyUnderlying = () =>
    [
      dom.header,
      dom.main,
      dom.footer
    ].filter(Boolean);


  const enterStandby = () => {
    if (
      state.standby ||
      !dom.standby ||
      state.reducedMotion
    ) {
      return;
    }

    state.standby = true;

    clearStandbyTimer();

    state.standbyReturnFocus =
      document.activeElement instanceof
      HTMLElement
        ? document.activeElement
        : null;

    state.standbyUnderlying =
      getStandbyUnderlying();

    state.standbyUnderlying.forEach(
      (element) => {
        element.setAttribute(
          "inert",
          ""
        );
      }
    );

    dom.body.classList.add(
      "is-standby"
    );

    dom.standby.removeAttribute(
      "inert"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );

    window.setTimeout(() => {
      dom.standbyWake?.focus();
    }, 150);
  };


  const exitStandby = ({
    restoreFocus = true
  } = {}) => {
    if (!state.standby) {
      resetStandbyTimer();
      return;
    }

    state.standby = false;

    dom.standby?.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.standby?.setAttribute(
      "inert",
      ""
    );

    dom.body.classList.remove(
      "is-standby"
    );

    state.standbyUnderlying.forEach(
      (element) => {
        element.removeAttribute(
          "inert"
        );
      }
    );

    state.standbyUnderlying = [];

    if (
      restoreFocus &&
      state.standbyReturnFocus &&
      document.contains(
        state.standbyReturnFocus
      )
    ) {
      state.standbyReturnFocus.focus();
    }

    state.standbyReturnFocus = null;

    resetStandbyTimer();
  };


  const handleStandbyKeydown = (
    event
  ) => {
    if (!state.standby) return;

    if (event.key === "Escape") {
      event.preventDefault();
      exitStandby();
      return;
    }

    if (event.key !== "Tab") {
      exitStandby({
        restoreFocus: false
      });
      return;
    }

    event.preventDefault();

    dom.standbyWake?.focus();
  };


  const initStandby = () => {
    if (!dom.standby) {
      return;
    }

    dom.standbyWake?.addEventListener(
      "click",
      () => {
        exitStandby();
      }
    );

    document.addEventListener(
      "pointerdown",
      () => {
        if (state.standby) {
          exitStandby({
            restoreFocus: false
          });
        }
      }
    );

    document.addEventListener(
      "wheel",
      () => {
        if (state.standby) {
          exitStandby({
            restoreFocus: false
          });
        }
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "touchstart",
      () => {
        if (state.standby) {
          exitStandby({
            restoreFocus: false
          });
        }
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "keydown",
      handleStandbyKeydown
    );

    window.addEventListener(
      "scroll",
      () => {
        if (state.standby) {
          exitStandby({
            restoreFocus: false
          });
        }
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.hidden
        ) {
          clearStandbyTimer();
        } else {
          resetStandbyTimer();
        }
      }
    );
  };


  /* =======================================================
     HASH NAVIGATION
     ======================================================= */

  const initHashNavigation = () => {
    const hash =
      window.location.hash;

    if (!hash) return;

    window.setTimeout(() => {
      const target =
        document.querySelector(
          hash
        );

      if (!target) return;

      const index =
        dom.sections.indexOf(
          target
        );

      if (index >= 0) {
        scrollToSection(index);
      }
    }, 500);
  };


  /* =======================================================
     KEYBOARD SECTION NAVIGATION
     ======================================================= */

  const initKeyboardNavigation = () => {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          state.menuOpen ||
          state.standby
        ) {
          return;
        }

        const target =
          event.target;

        if (
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement ||
          target instanceof
            HTMLSelectElement ||
          target?.isContentEditable
        ) {
          return;
        }

        if (
          event.key === "PageDown"
        ) {
          event.preventDefault();

          scrollToSection(
            state.activeIndex + 1
          );
        }

        if (
          event.key === "PageUp"
        ) {
          event.preventDefault();

          scrollToSection(
            state.activeIndex - 1
          );
        }
      }
    );
  };


  /* =======================================================
     ACTIVITY / STANDBY
     ======================================================= */

  const initActivityTracking = () => {
    const activityEvents = [
      "pointermove",
      "pointerdown",
      "wheel",
      "touchstart",
      "keydown"
    ];

    const activity = () => {
      if (!state.standby) {
        resetStandbyTimer();
      }
    };

    activityEvents.forEach(
      (eventName) => {
        document.addEventListener(
          eventName,
          activity,
          {
            passive:
              eventName !== "keydown"
          }
        );
      }
    );

    window.addEventListener(
      "scroll",
      activity,
      {
        passive: true
      }
    );
  };


  /* =======================================================
     SCROLL / RESIZE
     ======================================================= */

  const handleScroll = () => {
    updateActiveSection();
    updateTrajectoryTarget();
  };


  const handleResize = () => {
    window.clearTimeout(
      state.resizeTimer
    );

    state.resizeTimer =
      window.setTimeout(() => {
        updateMotionPreference();
        updateActiveSection();
        updateTrajectoryTarget();
      }, CONFIG.resizeDebounce);
  };


  /* =======================================================
     RAF
     ======================================================= */

  const animationFrame = () => {
    renderCursor();
    renderTrajectory();

    state.rafId =
      window.requestAnimationFrame(
        animationFrame
      );
  };


  /* =======================================================
     INIT
     ======================================================= */

  const init = () => {
    updateMotionPreference();

    initLoader();

    initPageTransitions();

    initMenu();

    initSectionNavigation();

    initReveal();

    initDirectionInteraction();

    initNarrativeLinks();

    initCursor();

    initMagneticElements();

    initCTA();

    initStandby();

    initHashNavigation();

    initKeyboardNavigation();

    initActivityTracking();

    updateActiveSection();
    updateTrajectoryTarget();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true
      }
    );

    window
      .matchMedia(
        "(prefers-reduced-motion: reduce)"
      )
      .addEventListener(
        "change",
        updateMotionPreference
      );

    state.rafId =
      window.requestAnimationFrame(
        animationFrame
      );

    state.loaded = true;
  };


  /* =======================================================
     START
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
