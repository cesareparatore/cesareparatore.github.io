/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM — 2.3
   ========================================================= */

(() => {
  "use strict";


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


  const state = {
    loaded: false,
    menuOpen: false,
    standby: false,

    activeIndex: 0,

    resizeTimer: null,
    standbyTimer: null,
    loaderTimer: null,
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


  const dom = {

    html: document.documentElement,
    body: document.body,

    loader:
      document.querySelector(".page-loader"),

    transition:
      document.querySelector(".page-transition"),

    cursor:
      document.querySelector(".custom-cursor"),

    cursorDot:
      document.querySelector(".custom-cursor-dot"),

    cursorRing:
      document.querySelector(".custom-cursor-ring"),

    header:
      document.querySelector(".site-header"),

    main:
      document.querySelector("#main-content"),

    footer:
      document.querySelector(".site-footer"),

    menu:
      document.querySelector(".site-menu"),

    menuTrigger:
      document.querySelector(".menu-trigger"),

    menuLinks:
      Array.from(
        document.querySelectorAll(".site-menu a")
      ),

    progressLabel:
      document.querySelector("#progress-current"),

    progressFill:
      document.querySelector("#progress-fill"),

    progressPoint:
      document.querySelector("#progress-point"),

    previousSection:
      document.querySelector("#previous-section"),

    previousLabel:
      document.querySelector("#previous-section-label"),

    nextSection:
      document.querySelector("#next-section"),

    nextLabel:
      document.querySelector("#next-section-label"),

    sections:
      Array.from(
        document.querySelectorAll(".home-section")
      ),

    reveals:
      Array.from(
        document.querySelectorAll(".reveal")
      ),

    narrativeLinks:
      Array.from(
        document.querySelectorAll(".narrative-link")
      ),

    magneticElements:
      Array.from(
        document.querySelectorAll(
          ".site-brand, .menu-trigger, .contact-cta"
        )
      ),

    transitionLinks:
      Array.from(
        document.querySelectorAll(
          'a[href]:not([target="_blank"])'
        )
      ),

    standby:
      document.querySelector(".standby-screen"),

    standbyWake:
      document.querySelector(".standby-wake"),

    ctaTrajectories:
      Array.from(
        document.querySelectorAll(".cta-trajectory")
      ),

    directionLinks:
      Array.from(
        document.querySelectorAll(
          ".hero-direction[data-direction]"
        )
      ),

    directionNodes:
      Array.from(
        document.querySelectorAll(
          ".direction-node[data-direction]"
        )
      )
  };


  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      Math.max(value, min),
      max
    );


  const lerp = (
    current,
    target,
    amount
  ) =>
    current +
    (target - current) *
    amount;


  const getSectionNumber = index =>
    String(index + 1).padStart(2, "0");


  const getSectionByIndex = index => {

    if (!dom.sections.length) {
      return null;
    }

    return dom.sections[
      clamp(
        index,
        0,
        dom.sections.length - 1
      )
    ];
  };


  const getSectionTitle = section =>
    section?.dataset.sectionTitle || "";


  const isFinePointer = () =>
    window.matchMedia(
      "(pointer: fine)"
    ).matches;


  /* =======================================================
     MOTION PREFERENCE
     ======================================================= */

  const initMotionPreference = () => {

    const media =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );


    const apply = matches => {

      state.reducedMotion = matches;

      dom.html.classList.toggle(
        "reduced-motion",
        matches
      );


      dom.standby?.classList.toggle(
        "is-reduced",
        matches
      );


      if (!state.standby) {
        resetStandbyTimer();
      }

    };


    apply(media.matches);


    if (
      typeof media.addEventListener ===
      "function"
    ) {

      media.addEventListener(
        "change",
        event =>
          apply(event.matches)
      );

    }

  };


  /* =======================================================
     LOADER
     ======================================================= */

  const initLoader = () => {

    if (!dom.loader) {
      state.loaded = true;
      return;
    }


    const started =
      performance.now();


    const minimumTime =
      Math.max(
        5000,
        CONFIG.loaderMinimumTime
      );


    const complete = () => {

      if (state.loaded) {
        return;
      }


      state.loaded = true;


      if (state.loaderTimer) {
        window.clearTimeout(
          state.loaderTimer
        );

        state.loaderTimer = null;
      }


      dom.loader.classList.add(
        "is-hidden"
      );


      window.setTimeout(
        () =>
          dom.loader?.remove(),
        950
      );

    };


    const finish = force => {

      if (state.loaded) {
        return;
      }


      if (force) {

        complete();

        return;

      }


      const elapsed =
        performance.now() - started;


      const remaining =
        Math.max(
          0,
          minimumTime - elapsed
        );


      if (state.loaderTimer) {
        return;
      }


      state.loaderTimer =
        window.setTimeout(
          complete,
          remaining
        );

    };


    if (
      document.readyState ===
      "complete"
    ) {

      finish(false);

    } else {

      window.addEventListener(
        "load",
        () => finish(false),
        { once: true }
      );

    }


    window.setTimeout(
      () => finish(true),
      Math.max(
        CONFIG.loaderMaximumWait,
        minimumTime + 100
      )
    );

  };


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  const initPageTransitions = () => {

    if (!dom.transition) {
      return;
    }


    dom.transitionLinks.forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const href =
              link.getAttribute("href");


            if (
              !href ||
              href.startsWith("#") ||
              href.startsWith("mailto:") ||
              href.startsWith("tel:") ||
              link.hasAttribute("download") ||
              link.target === "_blank"
            ) {
              return;
            }


            let url;


            try {

              url =
                new URL(
                  href,
                  window.location.href
                );

            } catch {

              return;

            }


            if (
              url.origin !==
              window.location.origin
            ) {
              return;
            }


            if (state.reducedMotion) {
              return;
            }


            event.preventDefault();


            dom.transition.classList.add(
              "is-active"
            );


            window.setTimeout(
              () => {
                window.location.href =
                  url.href;
              },
              CONFIG.transitionDuration
            );

          }
        );

      }
    );


    window.addEventListener(
      "pageshow",
      () => {

        dom.transition?.classList.remove(
          "is-active"
        );

      }
    );

  };


  /* =======================================================
     MENU
     ======================================================= */

  const setMenuInert = inert => {

    if (!dom.menu) {
      return;
    }


    if ("inert" in dom.menu) {

      dom.menu.inert = inert;

    } else if (inert) {

      dom.menu.setAttribute(
        "inert",
        ""
      );

    } else {

      dom.menu.removeAttribute(
        "inert"
      );

    }

  };


  const openMenu = () => {

    if (!dom.menu) {
      return;
    }


    if (state.standby) {
      exitStandby();
    }


    clearStandbyTimer();

    state.menuOpen = true;


    setMenuInert(false);


    dom.menu.setAttribute(
      "aria-hidden",
      "false"
    );


    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "true"
    );


    dom.menuTrigger?.setAttribute(
      "aria-label",
      "Chiudi menu"
    );


    dom.body.classList.add(
      "is-menu-open"
    );


    window.setTimeout(
      () =>
        dom.menuLinks[0]?.focus(),
      state.reducedMotion ? 0 : 250
    );

  };


  const closeMenu = (
    returnFocus = true
  ) => {

    if (!dom.menu) {
      return;
    }


    state.menuOpen = false;


    dom.menu.setAttribute(
      "aria-hidden",
      "true"
    );


    setMenuInert(true);


    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "false"
    );


    dom.menuTrigger?.setAttribute(
      "aria-label",
      "Apri menu"
    );


    dom.body.classList.remove(
      "is-menu-open"
    );


    if (
      returnFocus &&
      dom.menuTrigger &&
      document.activeElement !==
      dom.menuTrigger
    ) {

      dom.menuTrigger.focus();

    }


    resetStandbyTimer();

  };


  const initMenu = () => {

    setMenuInert(true);


    dom.menuTrigger?.addEventListener(
      "click",
      () =>
        state.menuOpen
          ? closeMenu()
          : openMenu()
    );


    dom.menuLinks.forEach(
      link =>
        link.addEventListener(
          "click",
          () => closeMenu(false)
        )
    );


    dom.menu?.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          dom.menu
        ) {
          closeMenu();
        }

      }
    );


    dom.menu?.addEventListener(
      "keydown",
      event => {

        if (
          !state.menuOpen
        ) {
          return;
        }


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
            element =>
              !element.hasAttribute(
                "disabled"
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

      }
    );

  };


  /* =======================================================
     WOW
     ======================================================= */

  const updateWowHeader = index => {

    const section =
      getSectionByIndex(index);


    if (!section) {
      return;
    }


    const total =
      dom.sections.length;


    const progress =
      total <= 1
        ? 0
        : index / (total - 1);


    if (dom.progressLabel) {

      dom.progressLabel.textContent =
        getSectionTitle(section);

    }


    if (dom.progressFill) {

      dom.progressFill.style.width =
        `${progress * 100}%`;

    }


    if (dom.progressPoint) {

      dom.progressPoint.style.left =
        `${progress * 100}%`;

    }


    const isFirst =
      index === 0;

    const isLast =
      index === total - 1;


    if (isFirst) {

      dom.previousSection?.classList.add(
        "is-disabled"
      );

      dom.previousSection?.setAttribute(
        "aria-hidden",
        "true"
      );

      dom.previousSection?.setAttribute(
        "tabindex",
        "-1"
      );

      if (dom.previousLabel) {
        dom.previousLabel.textContent = "";
      }

    } else {

      const previousNumber =
        getSectionNumber(index - 1);


      dom.previousSection?.classList.remove(
        "is-disabled"
      );

      dom.previousSection?.removeAttribute(
        "aria-hidden"
      );

      dom.previousSection?.removeAttribute(
        "tabindex"
      );


      if (dom.previousSection) {

        dom.previousSection.href =
          `#${previousNumber}`;

        dom.previousSection.setAttribute(
          "aria-label",
          `Vai alla sezione ${previousNumber}`
        );

      }


      if (dom.previousLabel) {

        dom.previousLabel.textContent =
          previousNumber;

      }

    }


    if (isLast) {

      if (dom.nextSection) {

        dom.nextSection.classList.add(
          "is-home-return"
        );

        dom.nextSection.href =
          "#01";

        dom.nextSection.setAttribute(
          "aria-label",
          "Torna all'inizio"
        );

      }


      if (dom.nextLabel) {

        dom.nextLabel.textContent =
          "01";

      }


      dom.nextSection
        ?.querySelector(
          ".section-jump-arrow"
        )
        ?.replaceChildren(
          document.createTextNode("↑")
        );

    } else {

      const nextNumber =
        getSectionNumber(index + 1);


      dom.nextSection?.classList.remove(
        "is-home-return"
      );


      if (dom.nextSection) {

        dom.nextSection.href =
          `#${nextNumber}`;

        dom.nextSection.setAttribute(
          "aria-label",
          `Vai alla sezione ${nextNumber}`
        );

      }


      if (dom.nextLabel) {

        dom.nextLabel.textContent =
          nextNumber;

      }


      dom.nextSection
        ?.querySelector(
          ".section-jump-arrow"
        )
        ?.replaceChildren(
          document.createTextNode("→")
        );

    }

  };


  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  const navigateToSection = index => {

    const target =
      getSectionByIndex(index);


    if (!target) {
      return;
    }


    const headerHeight =
      dom.header
        ? dom.header.offsetHeight
        : 0;


    const rect =
      target.getBoundingClientRect();


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


  const initWowNavigation = () => {

    dom.previousSection?.addEventListener(
      "click",
      event => {

        event.preventDefault();


        if (
          state.activeIndex > 0
        ) {

          navigateToSection(
            state.activeIndex - 1
          );

        }

      }
    );


    dom.nextSection?.addEventListener(
      "click",
      event => {

        event.preventDefault();


        const last =
          dom.sections.length - 1;


        navigateToSection(
          state.activeIndex === last
            ? 0
            : state.activeIndex + 1
        );

      }
    );

  };


  /* =======================================================
     ACTIVE SECTION
     ======================================================= */

  const detectActiveSection = () => {

    if (!dom.sections.length) {
      return;
    }


    const reference =
      window.innerHeight * .52;


    let bestIndex =
      state.activeIndex;


    let bestDistance =
      Infinity;


    dom.sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();


        const visible =
          rect.bottom > 0 &&
          rect.top < window.innerHeight;


        if (!visible) {
          return;
        }


        const distance =
          Math.abs(
            rect.top +
            rect.height / 2 -
            reference
          );


        if (
          distance <
          bestDistance
        ) {

          bestDistance =
            distance;

          bestIndex =
            index;

        }

      }
    );


    if (
      state.activeIndex !==
      bestIndex
    ) {

      state.activeIndex =
        bestIndex;


      updateWowHeader(
        bestIndex
      );

    }

  };


  /* =======================================================
     REVEAL
     ======================================================= */

  const initRevealSystem = () => {

    if (!dom.reveals.length) {
      return;
    }


    if (
      state.reducedMotion ||
      !("IntersectionObserver" in window)
    ) {

      dom.reveals.forEach(
        element =>
          element.classList.add(
            "is-visible"
          )
      );

      return;
    }


    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              if (
                !entry.isIntersecting
              ) {
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
      element =>
        observer.observe(element)
    );

  };


  /* =======================================================
     DIRECTION INTERACTIONS
     ======================================================= */

  const initDirectionInteractions = () => {

    if (
      !dom.directionLinks.length ||
      !dom.directionNodes.length
    ) {
      return;
    }


    const setActive = (
      key,
      active
    ) => {

      dom.directionLinks
        .filter(
          element =>
            element.dataset.direction === key
        )
        .forEach(
          element =>
            element.classList.toggle(
              "is-active",
              active
            )
        );


      dom.directionNodes
        .filter(
          element =>
            element.dataset.direction === key
        )
        .forEach(
          element =>
            element.classList.toggle(
              "is-active",
              active
            )
        );

    };


    dom.directionLinks.forEach(
      link => {

        const key =
          link.dataset.direction;


        link.addEventListener(
          "pointerenter",
          () => setActive(key, true)
        );


        link.addEventListener(
          "pointerleave",
          () => setActive(key, false)
        );


        link.addEventListener(
          "focusin",
          () => setActive(key, true)
        );


        link.addEventListener(
          "focusout",
          () => setActive(key, false)
        );

      }
    );

  };


  /* =======================================================
     TRAJECTORY
     ======================================================= */

  const updateTrajectoryTargets = () => {

    if (
      dom.sections.length < 2
    ) {
      return;
    }


    const first =
      dom.sections[0];


    const last =
      dom.sections[
        dom.sections.length - 1
      ];


    const firstRect =
      first.getBoundingClientRect();


    const lastRect =
      last.getBoundingClientRect();


    const start =
      firstRect.top +
      window.scrollY;


    const end =
      lastRect.bottom +
      window.scrollY -
      window.innerHeight;


    const range =
      end - start;


    const progress =
      range <= 0
        ? 0
        : clamp(
            (
              window.scrollY -
              start
            ) /
            range,
            0,
            1
          );


    state.trajectory.targetProgress =
      progress;


    state.trajectory.targetDrift =
      state.reducedMotion
        ? 0
        : Math.sin(
            progress *
            Math.PI *
            2
          ) *
          CONFIG.trajectoryDrift;

  };


  const updateTrajectoryFrame = () => {

    if (state.reducedMotion) {

      state.trajectory.progress =
        state.trajectory.targetProgress;

      state.trajectory.drift = 0;

    } else {

      state.trajectory.progress =
        lerp(
          state.trajectory.progress,
          state.trajectory.targetProgress,
          CONFIG.trajectoryLerp
        );


      state.trajectory.drift =
        lerp(
          state.trajectory.drift,
          state.trajectory.targetDrift,
          CONFIG.trajectoryLerp
        );

    }


    dom.html.style.setProperty(
      "--trajectory-progress",
      state.trajectory.progress.toFixed(4)
    );


    dom.html.style.setProperty(
      "--trajectory-drift",
      `${state.trajectory.drift.toFixed(2)}px`
    );

  };


  /* =======================================================
     NARRATIVE LINKS
     ======================================================= */

  const initNarrativeLinks = () => {

    dom.narrativeLinks.forEach(
      link => {

        const node =
          link.dataset.trajectoryNode;


        if (!node) {
          return;
        }


        const targets = [
          ...document.querySelectorAll(
            `.network-node[data-node="${node}"]`
          ),
          ...document.querySelectorAll(
            `.direction-node[data-direction="${node}"]`
          )
        ];


        if (!targets.length) {
          return;
        }


        const activate = () => {

          targets.forEach(
            target =>
              target.classList.add(
                "is-linked"
              )
          );

        };


        const deactivate = () => {

          targets.forEach(
            target =>
              target.classList.remove(
                "is-linked"
              )
          );

        };


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
     CUSTOM CURSOR
     ======================================================= */

  const initCursor = () => {

    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing ||
      !isFinePointer() ||
      state.reducedMotion
    ) {
      return;
    }


    document.addEventListener(
      "pointermove",
      event => {

        state.pointer.targetX =
          event.clientX;

        state.pointer.targetY =
          event.clientY;


        dom.cursor.classList.add(
          "is-visible"
        );

      },
      {
        passive: true
      }
    );


    document
      .querySelectorAll("a, button")
      .forEach(
        element => {

          element.addEventListener(
            "pointerenter",
            () =>
              dom.cursor.classList.add(
                "is-hovering"
              )
          );


          element.addEventListener(
            "pointerleave",
            () =>
              dom.cursor.classList.remove(
                "is-hovering"
              )
          );

        }
      );


    window.addEventListener(
      "pointerleave",
      () => {

        dom.cursor?.classList.remove(
          "is-visible",
          "is-hovering"
        );

      }
    );


    window.addEventListener(
      "pointerenter",
      () => {

        dom.cursor?.classList.add(
          "is-visible"
        );

      }
    );

  };


  const updateCursorFrame = () => {

    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing ||
      !isFinePointer() ||
      state.reducedMotion
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
      `translate3d(
        ${state.pointer.targetX}px,
        ${state.pointer.targetY}px,
        0
      ) translate(-50%,-50%)`;


    dom.cursorRing.style.transform =
      `translate3d(
        ${state.cursor.x}px,
        ${state.cursor.y}px,
        0
      ) translate(-50%,-50%)`;

  };


  /* =======================================================
     MAGNETIC ELEMENTS
     ======================================================= */

  const initMagneticElements = () => {

    if (
      !isFinePointer() ||
      state.reducedMotion
    ) {
      return;
    }


    dom.magneticElements.forEach(
      element => {

        element.addEventListener(
          "pointermove",
          event => {

            const rect =
              element.getBoundingClientRect();


            const dx =
              event.clientX -
              (
                rect.left +
                rect.width / 2
              );


            const dy =
              event.clientY -
              (
                rect.top +
                rect.height / 2
              );


            const distance =
              Math.sqrt(
                dx * dx +
                dy * dy
              );


            if (
              distance >
              CONFIG.magneticRadius
            ) {
              return;
            }


            const strength =
              CONFIG.magneticStrength *
              (
                1 -
                distance /
                CONFIG.magneticRadius
              );


            element.style.setProperty(
              "--magnetic-x",
              `${dx * strength}px`
            );


            element.style.setProperty(
              "--magnetic-y",
              `${dy * strength}px`
            );

          }
        );


        element.addEventListener(
          "pointerleave",
          () => {

            element.style.setProperty(
              "--magnetic-x",
              "0px"
            );


            element.style.setProperty(
              "--magnetic-y",
              "0px"
            );

          }
        );

      }
    );

  };


  /* =======================================================
     CTA
     ======================================================= */

  const initCtaInteraction = () => {

    if (
      !dom.ctaTrajectories.length
    ) {
      return;
    }


    dom.ctaTrajectories.forEach(
      container => {

        const cta =
          container.querySelector(
            ".contact-cta"
          );


        if (!cta) {
          return;
        }


        const engage = () => {

          container.classList.add(
            "is-engaged"
          );

        };


        const disengage = () => {

          container.classList.remove(
            "is-engaged"
          );

        };


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

    if (state.standbyTimer) {

      window.clearTimeout(
        state.standbyTimer
      );

      state.standbyTimer = null;

    }

  };


  const setInert = (
    element,
    inert
  ) => {

    if (!element) {
      return;
    }


    if ("inert" in element) {

      element.inert = inert;

    } else if (inert) {

      element.setAttribute(
        "inert",
        ""
      );

    } else {

      element.removeAttribute(
        "inert"
      );

    }

  };


  const setUnderlyingInert = inert => {

    const elements = [
      dom.header,
      dom.main,
      dom.footer
    ].filter(Boolean);


    if (inert) {

      state.standbyUnderlying =
        elements.map(
          element => ({
            element,
            hadInert:
              element.hasAttribute("inert")
          })
        );


      elements.forEach(
        element =>
          setInert(element, true)
      );

    } else {

      state.standbyUnderlying.forEach(
        record => {

          if (!record.hadInert) {
            setInert(
              record.element,
              false
            );
          }

        }
      );


      state.standbyUnderlying = [];

    }

  };


  const getStandbyFocusable = () => {

    if (!dom.standby) {
      return [];
    }


    return Array.from(
      dom.standby.querySelectorAll(
        'button, a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      element =>
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true"
    );

  };


  const enterStandby = () => {

    if (
      state.menuOpen ||
      state.standby ||
      !dom.standby
    ) {
      return;
    }


    state.standbyReturnFocus =
      document.activeElement;


    state.standby = true;


    clearStandbyTimer();


    dom.body.classList.add(
      "is-standby"
    );


    setUnderlyingInert(true);


    setInert(
      dom.standby,
      false
    );


    dom.standby.classList.add(
      "is-active"
    );


    dom.standby.classList.toggle(
      "is-reduced",
      state.reducedMotion
    );


    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );


    window.requestAnimationFrame(
      () => {

        dom.standbyWake?.focus({
          preventScroll: true
        });

      }
    );

  };


  const exitStandby = () => {

    if (!state.standby) {
      return;
    }


    state.standby = false;


    dom.body.classList.remove(
      "is-standby"
    );


    dom.standby?.classList.remove(
      "is-active"
    );


    dom.standby?.setAttribute(
      "aria-hidden",
      "true"
    );


    setInert(
      dom.standby,
      true
    );


    setUnderlyingInert(false);


    const returnFocus =
      state.standbyReturnFocus;


    state.standbyReturnFocus = null;


    if (
      returnFocus &&
      returnFocus !== document.body &&
      typeof returnFocus.focus ===
        "function" &&
      document.contains(returnFocus)
    ) {

      window.requestAnimationFrame(
        () => {

          returnFocus.focus({
            preventScroll: true
          });

        }
      );

    }


    resetStandbyTimer();

  };


  const initStandby = () => {

    if (!dom.standby) {
      return;
    }


    setInert(
      dom.standby,
      true
    );


    dom.standbyWake?.addEventListener(
      "click",
      exitStandby
    );


    dom.standby?.addEventListener(
      "keydown",
      event => {

        if (!state.standby) {
          return;
        }


        if (event.key === "Escape") {

          event.preventDefault();

          exitStandby();

          return;

        }


        if (event.key !== "Tab") {
          return;
        }


        const focusable =
          getStandbyFocusable();


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

          last.focus({
            preventScroll: true
          });

        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {

          event.preventDefault();

          first.focus({
            preventScroll: true
          });

        }

      }
    );


    [
      "pointerdown",
      "wheel",
      "touchstart",
      "keydown",
      "scroll"
    ].forEach(
      eventName => {

        window.addEventListener(
          eventName,
          event => {

            if (state.standby) {

              if (
                eventName === "keydown" &&
                event.key === "Escape"
              ) {
                return;
              }

              if (
                eventName === "keydown" &&
                dom.standby?.contains(
                  event.target
                )
              ) {
                return;
              }

              exitStandby();

              return;

            }


            if (
              eventName !== "scroll" ||
              event.isTrusted
            ) {
              resetStandbyTimer();
            }

          },
          {
            passive:
              eventName !== "keydown"
          }
        );

      }
    );


    document.addEventListener(
      "visibilitychange",
      () => {

        if (document.hidden) {

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


    if (!hash) {
      return;
    }


    const index =
      dom.sections.findIndex(
        section =>
          `#${section.id}` ===
          hash
      );


    if (index < 0) {
      return;
    }


    window.setTimeout(
      () =>
        navigateToSection(index),
      500
    );

  };


  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  const initKeyboardNavigation = () => {

    document.addEventListener(
      "keydown",
      event => {

        if (
          state.menuOpen ||
          state.standby
        ) {
          return;
        }


        if (
          event.key !== "PageDown" &&
          event.key !== "PageUp"
        ) {
          return;
        }


        event.preventDefault();


        const direction =
          event.key === "PageDown"
            ? 1
            : -1;


        const nextIndex =
          clamp(
            state.activeIndex +
            direction,
            0,
            dom.sections.length - 1
          );


        navigateToSection(
          nextIndex
        );

      }
    );

  };


  /* =======================================================
     SCROLL
     ======================================================= */

  const handleScroll = () => {

    detectActiveSection();

    updateTrajectoryTargets();

  };


  /* =======================================================
     RESIZE
     ======================================================= */

  const handleResize = () => {

    window.clearTimeout(
      state.resizeTimer
    );


    state.resizeTimer =
      window.setTimeout(
        () => {

          detectActiveSection();

          updateTrajectoryTargets();

          updateWowHeader(
            state.activeIndex
          );

        },
        CONFIG.resizeDebounce
      );

  };


  /* =======================================================
     ANIMATION FRAME
     ======================================================= */

  const animationFrame = () => {

    updateCursorFrame();

    updateTrajectoryFrame();


    state.rafId =
      requestAnimationFrame(
        animationFrame
      );

  };


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  const setInitialState = () => {

    if (!dom.sections.length) {
      return;
    }


    state.activeIndex = 0;


    updateWowHeader(0);

    updateTrajectoryTargets();

    resetStandbyTimer();

  };


  /* =======================================================
     INIT
     ======================================================= */

  const init = () => {

    initMotionPreference();

    initLoader();

    initPageTransitions();

    initMenu();

    initWowNavigation();

    initRevealSystem();

    initDirectionInteractions();

    initNarrativeLinks();

    initCursor();

    initMagneticElements();

    initCtaInteraction();

    initStandby();

    initHashNavigation();

    initKeyboardNavigation();

    setInitialState();

    detectActiveSection();

    updateTrajectoryTargets();


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


    animationFrame();

  };


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
