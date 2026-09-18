/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01 — CONFIG
     ======================================================= */

  const CONFIG = {
    loaderMinimumTime: 450,
    loaderMaximumWait: 4500,

    revealThreshold: 0.12,

    cursorLerp: 0.16,

    resizeDebounce: 180,

    scrollNavigationOffset: 18,

    transitionDuration: 700,

    trajectoryLerp: 0.085,
    trajectoryDrift: 18,

    magneticStrength: 0.12,
    magneticRadius: 90
  };


  /* =======================================================
     02 — STATE
     ======================================================= */

  const state = {
    loaded: false,

    menuOpen: false,

    activeIndex: 0,

    resizeTimer: null,

    rafId: null,

    reducedMotion: false,

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
     03 — DOM
     ======================================================= */

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

    magneticElements:
      Array.from(
        document.querySelectorAll(
          ".menu-trigger, .contact-cta"
        )
      ),

    narrativeLinks:
      Array.from(
        document.querySelectorAll(
          ".narrative-link"
        )
      ),

    transitionLinks:
      Array.from(
        document.querySelectorAll(
          'a[href]:not([target="_blank"])'
        )
      )
  };


  /* =======================================================
     04 — HELPERS
     ======================================================= */

  const clamp = (
    value,
    min,
    max
  ) => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  const lerp = (
    current,
    target,
    amount
  ) => {
    return current + (
      target - current
    ) * amount;
  };


  const isReducedMotion = () => {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  };


  const isFinePointer = () => {
    return window.matchMedia(
      "(pointer: fine)"
    ).matches;
  };


  const getMaxScroll = () => {
    return Math.max(
      document.documentElement.scrollHeight -
      window.innerHeight,
      1
    );
  };


  const getScrollProgress = () => {
    return clamp(
      window.scrollY /
      getMaxScroll(),
      0,
      1
    );
  };


  const getSectionTitle = section => {
    return (
      section?.dataset.sectionTitle ||
      ""
    );
  };


  const getSectionNumber = index => {
    return String(index + 1)
      .padStart(2, "0");
  };


  const getSectionByIndex = index => {
    return dom.sections[
      clamp(
        index,
        0,
        dom.sections.length - 1
      )
    ];
  };


  /* =======================================================
     05 — REDUCED MOTION
     ======================================================= */

  const initMotionPreference = () => {

    state.reducedMotion =
      isReducedMotion();

    dom.html.classList.toggle(
      "reduced-motion",
      state.reducedMotion
    );

    const media =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    media.addEventListener(
      "change",
      event => {

        state.reducedMotion =
          event.matches;

        dom.html.classList.toggle(
          "reduced-motion",
          state.reducedMotion
        );
      }
    );
  };


  /* =======================================================
     06 — LOADER
     ======================================================= */

  const initLoader = () => {

    if (!dom.loader) {
      state.loaded = true;
      return;
    }

    const started =
      performance.now();

    const finish = () => {

      if (state.loaded) {
        return;
      }

      const elapsed =
        performance.now() - started;

      const remaining =
        Math.max(
          0,
          CONFIG.loaderMinimumTime -
          elapsed
        );

      window.setTimeout(() => {

        state.loaded = true;

        dom.loader.classList.add(
          "is-hidden"
        );

        window.setTimeout(() => {
          dom.loader?.remove();
        }, 800);

      }, remaining);
    };


    if (
      document.readyState ===
      "complete"
    ) {
      finish();
    } else {
      window.addEventListener(
        "load",
        finish,
        { once: true }
      );
    }


    window.setTimeout(
      finish,
      CONFIG.loaderMaximumWait
    );
  };


  /* =======================================================
     07 — PAGE TRANSITIONS
     ======================================================= */

  const initPageTransitions = () => {

    if (
      !dom.transition ||
      state.reducedMotion
    ) {
      return;
    }


    dom.transitionLinks.forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const href =
              link.getAttribute(
                "href"
              );

            if (!href) {
              return;
            }

            if (
              href.startsWith("#") ||
              href.startsWith("mailto:") ||
              href.startsWith("tel:")
            ) {
              return;
            }

            if (
              link.hasAttribute(
                "download"
              ) ||
              link.target === "_blank"
            ) {
              return;
            }


            let url;

            try {
              url = new URL(
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


            event.preventDefault();

            dom.transition.classList.add(
              "is-active"
            );

            window.setTimeout(() => {

              window.location.href =
                url.href;

            }, CONFIG.transitionDuration);
          }
        );
      }
    );


    window.addEventListener(
      "pageshow",
      () => {
        dom.transition.classList.remove(
          "is-active"
        );
      }
    );
  };


  /* =======================================================
     08 — MENU
     ======================================================= */

  const openMenu = () => {

    if (!dom.menu) {
      return;
    }

    state.menuOpen = true;

    dom.menu.setAttribute(
      "aria-hidden",
      "false"
    );

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "true"
    );

    dom.body.classList.add(
      "is-menu-open"
    );


    if (
      !state.reducedMotion
    ) {
      dom.menu.classList.add(
        "is-opening"
      );

      window.setTimeout(() => {
        dom.menu.classList.remove(
          "is-opening"
        );
      }, 500);
    }


    window.setTimeout(() => {
      dom.menuLinks[0]?.focus();
    }, 250);
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

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "false"
    );

    dom.body.classList.remove(
      "is-menu-open"
    );


    if (
      returnFocus &&
      document.activeElement !==
      dom.menuTrigger
    ) {
      dom.menuTrigger?.focus();
    }
  };


  const toggleMenu = () => {

    if (state.menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };


  const initMenu = () => {

    dom.menuTrigger?.addEventListener(
      "click",
      toggleMenu
    );


    dom.menuLinks.forEach(
      link => {

        link.addEventListener(
          "click",
          () => {
            closeMenu(false);
          }
        );
      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          state.menuOpen
        ) {
          closeMenu();
        }
      }
    );


    dom.menu?.addEventListener(
      "click",
      event => {

        if (
          event.target === dom.menu
        ) {
          closeMenu();
        }
      }
    );
  };


  /* =======================================================
     09 — WOW HEADER
     ======================================================= */

  const updateWowHeader = index => {

    const section =
      getSectionByIndex(index);

    if (!section) {
      return;
    }


    const total =
      dom.sections.length;

    const title =
      getSectionTitle(section);

    const number =
      getSectionNumber(index);


    if (dom.progressLabel) {
      dom.progressLabel.textContent =
        title;
    }


    const progress =
      total <= 1
        ? 0
        : index /
          (total - 1);


    if (dom.progressFill) {
      dom.progressFill.style.width =
        `${progress * 100}%`;
    }


    if (dom.progressPoint) {
      dom.progressPoint.style.left =
        `${progress * 100}%`;
    }


    /* -----------------------------------------------
       PREVIOUS
       ----------------------------------------------- */

    if (index === 0) {

      if (dom.previousSection) {
        dom.previousSection.href =
          "#01";
        dom.previousSection.setAttribute(
          "aria-disabled",
          "true"
        );
      }

      if (dom.previousLabel) {
        dom.previousLabel.textContent =
          "Inizio";
      }

    } else {

      const previous =
        getSectionByIndex(
          index - 1
        );

      dom.previousSection.href =
        `#${getSectionNumber(index - 1)}`;

      dom.previousSection.removeAttribute(
        "aria-disabled"
      );

      dom.previousLabel.textContent =
        isMobile()
          ? getSectionNumber(index - 1)
          : getSectionTitle(previous);
    }


    /* -----------------------------------------------
       NEXT
       ----------------------------------------------- */

    if (
      index >= total - 1
    ) {

      dom.nextSection.href =
        "#01";

      dom.nextSection.classList.add(
        "is-home-return"
      );

      dom.nextLabel.textContent =
        isMobile()
          ? "INIZIO"
          : "Torna all'inizio";

    } else {

      const next =
        getSectionByIndex(
          index + 1
        );

      dom.nextSection.href =
        `#${getSectionNumber(index + 1)}`;

      dom.nextSection.classList.remove(
        "is-home-return"
      );

      dom.nextLabel.textContent =
        isMobile()
          ? getSectionNumber(index + 1)
          : getSectionTitle(next);
    }
  };


  const isMobile = () => {
    return window.matchMedia(
      "(max-width: 900px)"
    ).matches;
  };


  const navigateToSection = (
    index
  ) => {

    const target =
      getSectionByIndex(index);

    if (!target) {
      return;
    }


    if (
      index ===
      dom.sections.length
    ) {
      return;
    }


    const headerHeight =
      dom.header
        ? dom.header.offsetHeight
        : 0;


    const top =
      window.scrollY +
      target.getBoundingClientRect().top -
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
          state.activeIndex === 0
        ) {
          return;
        }

        navigateToSection(
          state.activeIndex - 1
        );
      }
    );


    dom.nextSection?.addEventListener(
      "click",
      event => {

        event.preventDefault();

        if (
          state.activeIndex ===
          dom.sections.length - 1
        ) {
          navigateToSection(0);
          return;
        }

        navigateToSection(
          state.activeIndex + 1
        );
      }
    );
  };


  /* =======================================================
     10 — ACTIVE SECTION
     ======================================================= */

  const detectActiveSection = () => {

    if (!dom.sections.length) {
      return;
    }


    const reference =
      window.innerHeight * 0.52;


    let bestIndex = 0;
    let bestDistance =
      Infinity;


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


        const visible =
          rect.bottom > 0 &&
          rect.top <
          window.innerHeight;


        if (
          visible &&
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
     11 — REVEALS
     ======================================================= */

  const initRevealSystem = () => {

    if (
      !dom.reveals.length
    ) {
      return;
    }


    if (
      state.reducedMotion ||
      !("IntersectionObserver" in window)
    ) {

      dom.reveals.forEach(
        element => {
          element.classList.add(
            "is-visible"
          );
        }
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
      element => {
        observer.observe(
          element
        );
      }
    );
  };


  /* =======================================================
     12 — TRAJECTORY
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


    const start =
      first.offsetTop;


    const end =
      last.offsetTop +
      last.offsetHeight -
      window.innerHeight;


    const progress =
      end <= start
        ? 0
        : clamp(
            (
              window.scrollY -
              start
            ) /
            (
              end -
              start
            ),
            0,
            1
          );


    state.trajectory.targetProgress =
      progress;


    /*
     * Movimento laterale minimo.
     * Non deve sembrare un effetto parallax.
     */
    state.trajectory.targetDrift =
      Math.sin(
        progress *
        Math.PI *
        2
      ) *
      CONFIG.trajectoryDrift;
  };


  const updateTrajectoryFrame = () => {

    if (
      state.reducedMotion
    ) {
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
     13 — NARRATIVE LINK INTERACTION
     ======================================================= */

  const initNarrativeLinks = () => {

    dom.narrativeLinks.forEach(
      link => {

        const node =
          link.dataset.trajectoryNode;


        if (!node) {
          return;
        }


        const nodes =
          document.querySelectorAll(
            `.trajectory-node--${node}, .network-node--${node}`
          );


        link.addEventListener(
          "pointerenter",
          () => {

            nodes.forEach(
              target => {
                target.classList.add(
                  "is-linked"
                );
              }
            );
          }
        );


        link.addEventListener(
          "pointerleave",
          () => {

            nodes.forEach(
              target => {
                target.classList.remove(
                  "is-linked"
                );
              }
            );
          }
        );


        link.addEventListener(
          "focus",
          () => {

            nodes.forEach(
              target => {
                target.classList.add(
                  "is-linked"
                );
              }
            );
          }
        );


        link.addEventListener(
          "blur",
          () => {

            nodes.forEach(
              target => {
                target.classList.remove(
                  "is-linked"
                );
              }
            );
          }
        );
      }
    );
  };


  /* =======================================================
     14 — CURSOR
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
      },
      {
        passive: true
      }
    );


    const hoverTargets =
      document.querySelectorAll(
        "a, button"
      );


    hoverTargets.forEach(
      element => {

        element.addEventListener(
          "pointerenter",
          () => {
            dom.cursor.classList.add(
              "is-hovering"
            );
          }
        );


        element.addEventListener(
          "pointerleave",
          () => {
            dom.cursor.classList.remove(
              "is-hovering"
            );
          }
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
      ) translate(-50%, -50%)`;


    dom.cursorRing.style.transform =
      `translate3d(
        ${state.cursor.x}px,
        ${state.cursor.y}px,
        0
      ) translate(-50%, -50%)`;
  };


  /* =======================================================
     15 — MAGNETIC ELEMENTS
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


            const centerX =
              rect.left +
              rect.width / 2;


            const centerY =
              rect.top +
              rect.height / 2;


            const dx =
              event.clientX -
              centerX;


            const dy =
              event.clientY -
              centerY;


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
     16 — HASH NAVIGATION
     ======================================================= */

  const initHashNavigation = () => {

    if (!window.location.hash) {
      return;
    }


    const id =
      window.location.hash.slice(1);


    const index =
      dom.sections.findIndex(
        section =>
          section.id === id
      );


    if (index < 0) {
      return;
    }


    window.setTimeout(() => {
      navigateToSection(index);
    }, 350);
  };


  /* =======================================================
     17 — KEYBOARD SECTION NAVIGATION
     ======================================================= */

  const initKeyboardNavigation = () => {

    document.addEventListener(
      "keydown",
      event => {

        if (
          state.menuOpen
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
     18 — SCROLL
     ======================================================= */

  const handleScroll = () => {

    detectActiveSection();

    updateTrajectoryTargets();
  };


  /* =======================================================
     19 — RESIZE
     ======================================================= */

  const handleResize = () => {

    window.clearTimeout(
      state.resizeTimer
    );


    state.resizeTimer =
      window.setTimeout(() => {

        detectActiveSection();

        updateTrajectoryTargets();

        updateWowHeader(
          state.activeIndex
        );

      }, CONFIG.resizeDebounce);
  };


  /* =======================================================
     20 — RAF
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
     21 — INITIAL STATE
     ======================================================= */

  const setInitialState = () => {

    if (!dom.sections.length) {
      return;
    }


    state.activeIndex = 0;

    updateWowHeader(0);

    updateTrajectoryTargets();
  };


  /* =======================================================
     22 — INIT
     ======================================================= */

  const init = () => {

    initMotionPreference();

    initLoader();

    initPageTransitions();

    initMenu();

    initWowNavigation();

    initRevealSystem();

    initNarrativeLinks();

    initCursor();

    initMagneticElements();

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


  /* =======================================================
     23 — START
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
