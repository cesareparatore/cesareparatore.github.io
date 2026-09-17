/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01 — CONFIGURATION
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
    magneticRadius: 90,

    directionTilt: 4
  };


  /* =======================================================
     02 — STATE
     ======================================================= */

  const state = {
    loaded: false,

    menuOpen: false,

    standbyActive: false,

    activeSection: null,

    standbyTimer: null,

    resizeTimer: null,

    rafId: null,

    lastScrollY: window.scrollY,

    lastActivity: Date.now(),

    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,

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
      targetDrift: 0,

      scale: 1,
      targetScale: 1,

      opacity: 1,
      targetOpacity: 1
    }
  };


  /* =======================================================
     03 — DOM
     ======================================================= */

  const dom = {
    body: document.body,

    loader:
      document.querySelector(".page-loader"),

    transition:
      document.querySelector(".page-transition"),

    transitionCircle:
      document.querySelector(".page-transition-circle"),

    standby:
      document.querySelector(".standby-screen"),

    standbyWake:
      document.querySelector(".standby-wake"),

    cursor:
      document.querySelector(".custom-cursor"),

    cursorDot:
      document.querySelector(".custom-cursor-dot"),

    cursorRing:
      document.querySelector(".custom-cursor-ring"),

    header:
      document.querySelector(".site-header"),

    headerCounter:
      document.querySelector(".site-header-section-counter"),

    menu:
      document.querySelector(".site-menu"),

    menuInner:
      document.querySelector(".site-menu-inner"),

    menuTrigger:
      document.querySelector(".menu-trigger"),

    menuLinks:
      Array.from(
        document.querySelectorAll(".site-menu a")
      ),

    progress:
      document.querySelector(".scroll-progress-bar"),

    sectionNav:
      document.querySelector(".home-section-nav"),

    sectionNavCurrentNumber:
      document.querySelector(
        ".home-section-nav-current-number"
      ),

    sectionNavCurrentLabel:
      document.querySelector(
        ".home-section-nav-current-label"
      ),

    sectionNavRoute:
      document.querySelector(
        ".home-section-nav-route"
      ),

    sectionNavRoutePoint:
      document.querySelector(
        ".home-section-nav-route-point"
      ),

    sectionNavRouteProgress:
      document.querySelector(
        ".home-section-nav-route-progress"
      ),

    sectionNavItems:
      Array.from(
        document.querySelectorAll(
          ".home-section-nav-item"
        )
      ),

    sections:
      Array.from(
        document.querySelectorAll(".home-section")
      ),

    reveals:
      Array.from(
        document.querySelectorAll(".reveal")
      ),

    directionCards:
      Array.from(
        document.querySelectorAll(".direction-card")
      ),

    magneticElements:
      Array.from(
        document.querySelectorAll(
          ".contact-cta, .menu-trigger"
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

  const clamp = (value, min, max) => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  const lerp = (current, target, amount) => {
    return current + (
      target - current
    ) * amount;
  };


  const getDocumentHeight = () => {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
  };


  const getMaxScroll = () => {
    return Math.max(
      getDocumentHeight() - window.innerHeight,
      1
    );
  };


  const getScrollProgress = () => {
    return clamp(
      window.scrollY / getMaxScroll(),
      0,
      1
    );
  };


  const isMobile = () => {
    return window.matchMedia(
      "(max-width: 900px)"
    ).matches;
  };


  /* =======================================================
     05 — LOADER
     ======================================================= */

  const initLoader = () => {
    if (!dom.loader) {
      state.loaded = true;
      return;
    }

    const startTime = performance.now();

    const finish = () => {
      if (state.loaded) return;

      const elapsed =
        performance.now() - startTime;

      const remaining =
        Math.max(
          0,
          CONFIG.loaderMinimumTime - elapsed
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
      document.readyState === "complete"
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
     06 — PAGE TRANSITION
     ======================================================= */

  const showPageTransition = () => {
    if (!dom.transition) return;

    dom.transition.classList.add(
      "is-active"
    );
  };


  const hidePageTransition = () => {
    if (!dom.transition) return;

    dom.transition.classList.remove(
      "is-active"
    );
  };


  const initPageTransitions = () => {
    if (!dom.transitionLinks.length) {
      return;
    }

    dom.transitionLinks.forEach(link => {
      link.addEventListener(
        "click",
        event => {

          const href =
            link.getAttribute("href");

          if (!href) return;

          if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
          ) {
            return;
          }

          if (
            link.hasAttribute("download") ||
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

          showPageTransition();

          window.setTimeout(() => {
            window.location.href =
              url.href;
          }, CONFIG.transitionDuration);
        }
      );
    });

    window.addEventListener(
      "pageshow",
      hidePageTransition
    );
  };


  /* =======================================================
     07 — MENU
     ======================================================= */

  const openMenu = () => {
    if (!dom.menu) return;

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

    const firstLink =
      dom.menuLinks[0];

    window.setTimeout(() => {
      firstLink?.focus();
    }, 300);
  };


  const closeMenu = () => {
    if (!dom.menu) return;

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

    dom.menuTrigger?.focus();
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

    dom.menuLinks.forEach(link => {
      link.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );
    });

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
  };


  /* =======================================================
     08 — SCROLL PROGRESS
     ======================================================= */

  const updateScrollProgress = () => {
    if (!dom.progress) return;

    const progress =
      getScrollProgress();

    dom.progress.style.width =
      `${progress * 100}%`;
  };


  /* =======================================================
     09 — SECTION NAVIGATION
     CRITICAL ARCHITECTURE
     
     JS DOES NOT POSITION THE NAV.
     
     No fixed.
     No sticky.
     No viewport anchoring.
     
     The CSS owns normal document flow.
     ======================================================= */

  const getSectionId = section => {
    return section?.id || "";
  };


  const getSectionLabel = section => {
    if (!section) return "";

    const heading =
      section.querySelector(
        "h1, h2"
      );

    if (heading) {
      return heading.textContent
        .trim()
        .replace(/\s+/g, " ");
    }

    return "";
  };


  const updateSectionNavigation = (
    section,
    index
  ) => {

    if (!section) return;

    const number =
      String(index + 1)
        .padStart(2, "0");

    const label =
      getSectionLabel(section);

    const id =
      getSectionId(section);


    /* Current section */

    if (
      dom.sectionNavCurrentNumber
    ) {
      dom.sectionNavCurrentNumber
        .textContent = number;
    }

    if (
      dom.sectionNavCurrentLabel
    ) {
      dom.sectionNavCurrentLabel
        .textContent =
        label || "SEZIONE";
    }


    /* Header counter */

    if (dom.headerCounter) {
      dom.headerCounter.textContent =
        `${number} / ${String(
          dom.sections.length
        ).padStart(2, "0")}`;
    }


    /* Items */

    dom.sectionNavItems.forEach(
      item => {

        const target =
          item.dataset.sectionTarget ||
          item.getAttribute("href")
            ?.replace("#", "");

        const active =
          target === id;

        item.classList.toggle(
          "is-active",
          active
        );

        if (active) {
          item.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          item.removeAttribute(
            "aria-current"
          );
        }
      }
    );


    /*
     * Mobile:
     * the navigation itself remains in normal flow.
     *
     * Only the internal horizontal list
     * moves to expose the active number.
     */
    if (
      isMobile() &&
      dom.sectionNavItems.length
    ) {

      const activeItem =
        dom.sectionNavItems.find(
          item =>
            item.classList.contains(
              "is-active"
            )
        );

      if (activeItem) {

        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  };


  const updateSectionRoute = (
    section,
    index
  ) => {

    if (
      !section ||
      !dom.sectionNavRoutePoint ||
      !dom.sectionNavRouteProgress
    ) {
      return;
    }

    const total =
      Math.max(
        dom.sections.length - 1,
        1
      );

    const progress =
      clamp(
        index / total,
        0,
        1
      );


    /*
     * The route point is part of the
     * normal navigation component.
     *
     * It is never attached to the viewport.
     */
    dom.sectionNavRoutePoint.style.left =
      `${progress * 100}%`;

    dom.sectionNavRouteProgress.style.width =
      `${progress * 100}%`;
  };


  const navigateToSection = section => {
    if (!section) return;

    const navHeight =
      dom.sectionNav
        ? dom.sectionNav.offsetHeight
        : 0;

    const headerHeight =
      dom.header
        ? dom.header.offsetHeight
        : 0;

    /*
     * The nav is NOT fixed.
     *
     * Therefore it does NOT need to be
     * compensated as an overlay.
     *
     * Only the actual header is considered.
     */
    const offset =
      Math.max(
        0,
        headerHeight +
        CONFIG.scrollNavigationOffset
      );

    const targetTop =
      window.scrollY +
      section.getBoundingClientRect().top -
      offset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });
  };


  const initSectionNavigation = () => {

    if (
      !dom.sections.length ||
      !dom.sectionNavItems.length
    ) {
      return;
    }


    dom.sectionNavItems.forEach(
      item => {

        item.addEventListener(
          "click",
          event => {

            event.preventDefault();

            const targetId =
              item.dataset.sectionTarget ||
              item.getAttribute("href")
                ?.replace("#", "");

            if (!targetId) return;

            const section =
              document.getElementById(
                targetId
              );

            navigateToSection(
              section
            );
          }
        );
      }
    );
  };


  /* =======================================================
     10 — SECTION DETECTION
     ======================================================= */

  const getCurrentSection = () => {

    if (!dom.sections.length) {
      return {
        section: null,
        index: -1
      };
    }

    const reference =
      window.innerHeight *
      CONFIG.sectionThreshold;

    let bestSection = null;
    let bestIndex = -1;
    let bestDistance = Infinity;

    dom.sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const center =
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            center -
            reference
          );

        const visible =
          rect.bottom > 0 &&
          rect.top <
            window.innerHeight;

        if (
          visible &&
          distance < bestDistance
        ) {
          bestDistance = distance;

          bestSection = section;
          bestIndex = index;
        }
      }
    );

    /*
     * Fallback based on scroll position.
     */
    if (!bestSection) {

      const scrollY =
        window.scrollY;

      dom.sections.forEach(
        (section, index) => {

          const top =
            section.offsetTop;

          if (
            top <= scrollY +
              window.innerHeight * .5
          ) {
            bestSection = section;
            bestIndex = index;
          }
        }
      );
    }

    return {
      section: bestSection,
      index: bestIndex
    };
  };


  const updateActiveSection = () => {

    const {
      section,
      index
    } = getCurrentSection();

    if (
      !section ||
      index < 0
    ) {
      return;
    }

    const id =
      section.id;

    if (
      state.activeSection !== id
    ) {
      state.activeSection = id;

      updateSectionNavigation(
        section,
        index
      );
    }

    updateSectionRoute(
      section,
      index
    );
  };


  /* =======================================================
     11 — SECTION OBSERVER
     ======================================================= */

  const initSectionObserver = () => {

    if (
      !("IntersectionObserver" in window)
    ) {
      updateActiveSection();
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {

          let visibleEntry = null;

          entries.forEach(entry => {

            if (
              entry.isIntersecting
            ) {

              if (
                !visibleEntry ||
                entry.intersectionRatio >
                  visibleEntry.intersectionRatio
              ) {
                visibleEntry = entry;
              }
            }
          });

          if (!visibleEntry) return;

          const section =
            visibleEntry.target;

          const index =
            dom.sections.indexOf(
              section
            );

          if (index < 0) return;

          state.activeSection =
            section.id;

          updateSectionNavigation(
            section,
            index
          );

          updateSectionRoute(
            section,
            index
          );
        },
        {
          root: null,

          threshold: [
            0.15,
            0.35,
            0.55,
            0.75
          ],

          rootMargin:
            "-10% 0px -35% 0px"
        }
      );

    dom.sections.forEach(
      section => {
        observer.observe(section);
      }
    );
  };


  /* =======================================================
     12 — REVEAL SYSTEM
     ======================================================= */

  const initRevealSystem = () => {

    if (!dom.reveals.length) {
      return;
    }

    if (
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

          entries.forEach(entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
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
        observer.observe(element);
      }
    );
  };


  /* =======================================================
     13 — TRAJECTORY ENGINE
     ======================================================= */

  const getTrajectoryProgress = () => {

    if (dom.sections.length < 2) {
      return 0;
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

    if (end <= start) {
      return 0;
    }

    return clamp(
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
  };


  const updateTrajectoryTargets = () => {

    const progress =
      getTrajectoryProgress();

    state.trajectory.targetProgress =
      progress;


    /*
     * Small horizontal drift.
     * Never changes document layout.
     */
    state.trajectory.targetDrift =
      Math.sin(
        progress *
        Math.PI *
        2
      ) *
      CONFIG.trajectoryDrift;


    /*
     * Controlled depth moment around
     * sections 06 → 07.
     */
    const {
      index
    } = getCurrentSection();

    if (
      index === 5 ||
      index === 6
    ) {

      state.trajectory.targetScale =
        1.035;

      state.trajectory.targetOpacity =
        .78;

    } else {

      state.trajectory.targetScale =
        1;

      state.trajectory.targetOpacity =
        1;
    }
  };


  const updateTrajectoryFrame = () => {

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

    state.trajectory.scale =
      lerp(
        state.trajectory.scale,
        state.trajectory.targetScale,
        CONFIG.trajectoryLerp
      );

    state.trajectory.opacity =
      lerp(
        state.trajectory.opacity,
        state.trajectory.targetOpacity,
        CONFIG.trajectoryLerp
      );


    document.documentElement.style.setProperty(
      "--trajectory-progress",
      state.trajectory.progress.toFixed(4)
    );

    document.documentElement.style.setProperty(
      "--trajectory-drift",
      `${state.trajectory.drift.toFixed(2)}px`
    );

    document.documentElement.style.setProperty(
      "--trajectory-scale",
      state.trajectory.scale.toFixed(4)
    );

    document.documentElement.style.setProperty(
      "--trajectory-opacity",
      state.trajectory.opacity.toFixed(4)
    );


    const {
      section
    } = getCurrentSection();

    if (section) {

      const rect =
        section.getBoundingClientRect();

      const sectionProgress =
        clamp(
          (
            window.innerHeight -
            rect.top
          ) /
          (
            window.innerHeight +
            rect.height
          ),
          0,
          1
        );

      const drift =
        (
          sectionProgress -
          .5
        ) *
        2 *
        CONFIG.trajectoryDrift;

      section.style.setProperty(
        "--section-progress",
        sectionProgress.toFixed(4)
      );

      section.style.setProperty(
        "--section-drift",
        `${drift.toFixed(2)}px`
      );
    }
  };


  /* =======================================================
     14 — CURSOR
     ======================================================= */

  const initCursor = () => {

    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing
    ) {
      return;
    }

    if (
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
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
        "a, button, .direction-card"
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
      !dom.cursorRing
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
     15 — MAGNETIC INTERACTIONS
     ======================================================= */

  const initMagneticElements = () => {

    if (
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
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

            element.style.transform =
              "";
          }
        );
      }
    );
  };


  /* =======================================================
     16 — DIRECTION CARD TILT
     ======================================================= */

  const initDirectionCards = () => {

    if (
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
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
              (
                event.clientX -
                rect.left
              ) /
              rect.width;

            const y =
              (
                event.clientY -
                rect.top
              ) /
              rect.height;

            const rotateY =
              (
                x - .5
              ) *
              CONFIG.directionTilt;

            const rotateX =
              (
                .5 - y
              ) *
              CONFIG.directionTilt;

            card.style.transform =
              `perspective(900px)
               rotateX(${rotateX}deg)
               rotateY(${rotateY}deg)`;
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
  };


  /* =======================================================
     17 — STANDBY
     
     IMPORTANT:
     Wake is movement based.
     
     Pointer movement,
     touch movement,
     wheel,
     scroll,
     keyboard activity
     all restore activity.
     
     A click is NOT required.
     ======================================================= */

  const activateStandby = () => {

    if (
      state.standbyActive ||
      state.menuOpen
    ) {
      return;
    }

    state.standbyActive = true;

    dom.body.classList.add(
      "is-standby"
    );

    dom.standby?.classList.add(
      "is-active"
    );

    dom.standby?.setAttribute(
      "aria-hidden",
      "false"
    );
  };


  const wakeStandby = () => {

    if (
      !state.standbyActive
    ) {
      return;
    }

    state.standbyActive = false;

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

    resetStandbyTimer();
  };


  const resetStandbyTimer = () => {

    window.clearTimeout(
      state.standbyTimer
    );

    state.lastActivity =
      Date.now();

    if (
      state.standbyActive
    ) {
      return;
    }

    state.standbyTimer =
      window.setTimeout(
        activateStandby,
        CONFIG.standbyDelay
      );
  };


  const registerActivity = () => {

    state.lastActivity =
      Date.now();

    if (
      state.standbyActive
    ) {
      return;
    }

    resetStandbyTimer();
  };


  const handleMovementWake = event => {

    if (
      !state.standbyActive
    ) {
      registerActivity();
      return;
    }


    if (
      event.type === "wheel" ||
      event.type === "scroll" ||
      event.type === "touchmove" ||
      event.type === "keydown"
    ) {
      wakeStandby();
      return;
    }


    if (
      event.type === "pointermove"
    ) {

      const x =
        event.clientX;

      const y =
        event.clientY;

      const dx =
        x -
        state.pointer.targetX;

      const dy =
        y -
        state.pointer.targetY;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      state.pointer.targetX = x;
      state.pointer.targetY = y;

      if (
        distance >=
        CONFIG.standbyWakeDistance
      ) {
        wakeStandby();
      }
    }
  };


  const initStandby = () => {

    if (!dom.standby) {
      return;
    }


    dom.standbyWake?.addEventListener(
      "click",
      wakeStandby
    );


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


    document.addEventListener(
      "wheel",
      handleMovementWake,
      {
        passive: true
      }
    );


    document.addEventListener(
      "scroll",
      handleMovementWake,
      {
        passive: true
      }
    );


    document.addEventListener(
      "keydown",
      handleMovementWake
    );


    /*
     * Deliberately NOT using:
     *
     * pointerdown → wake
     * click → wake
     *
     * Movement is the primary wake gesture.
     */

    resetStandbyTimer();
  };


  /* =======================================================
     18 — HASH NAVIGATION
     ======================================================= */

  const initHashNavigation = () => {

    if (!window.location.hash) {
      return;
    }

    const id =
      window.location.hash
        .replace("#", "");

    const target =
      document.getElementById(id);

    if (!target) return;

    window.setTimeout(() => {

      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

    }, 500);
  };


  /* =======================================================
     19 — KEYBOARD SECTION NAVIGATION
     ======================================================= */

  const initKeyboardNavigation = () => {

    document.addEventListener(
      "keydown",
      event => {

        if (
          state.menuOpen ||
          state.standbyActive
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

        const {
          index
        } = getCurrentSection();

        if (index < 0) return;

        const nextIndex =
          event.key === "PageDown"
            ? index + 1
            : index - 1;

        const target =
          dom.sections[
            clamp(
              nextIndex,
              0,
              dom.sections.length - 1
            )
          ];

        navigateToSection(target);
      }
    );
  };


  /* =======================================================
     20 — ACTIVITY TRACKING
     ======================================================= */

  const initActivityTracking = () => {

    const events = [
      "pointermove",
      "wheel",
      "touchmove",
      "scroll",
      "keydown"
    ];

    events.forEach(
      eventName => {

        document.addEventListener(
          eventName,
          () => {

            if (
              !state.standbyActive
            ) {
              registerActivity();
            }

          },
          {
            passive:
              eventName !== "keydown"
          }
        );
      }
    );
  };


  /* =======================================================
     21 — RESIZE
     ======================================================= */

  const handleResize = () => {

    window.clearTimeout(
      state.resizeTimer
    );

    state.resizeTimer =
      window.setTimeout(() => {

        updateScrollProgress();
        updateActiveSection();
        updateTrajectoryTargets();

      }, CONFIG.resizeDebounce);
  };


  /* =======================================================
     22 — SCROLL
     ======================================================= */

  const handleScroll = () => {

    const currentY =
      window.scrollY;

    state.lastScrollY =
      currentY;

    updateScrollProgress();

    updateActiveSection();

    updateTrajectoryTargets();
  };


  /* =======================================================
     23 — MAIN RAF
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
     24 — INITIAL STATE
     ======================================================= */

  const setInitialSectionState = () => {

    if (!dom.sections.length) {
      return;
    }

    const first =
      dom.sections[0];

    state.activeSection =
      first.id;

    updateSectionNavigation(
      first,
      0
    );

    updateSectionRoute(
      first,
      0
    );
  };


  /* =======================================================
     25 — INIT
     ======================================================= */

  const init = () => {

    initLoader();

    initMenu();

    initPageTransitions();

    initSectionNavigation();

    initSectionObserver();

    initRevealSystem();

    initCursor();

    initMagneticElements();

    initDirectionCards();

    initStandby();

    initHashNavigation();

    initKeyboardNavigation();

    initActivityTracking();

    setInitialSectionState();

    updateScrollProgress();

    updateActiveSection();

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
     26 — START
     ======================================================= */

  if (
    document.readyState === "loading"
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
