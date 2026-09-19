/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM — 5.0
   ========================================================= */

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const CONFIG = {
    loaderMinimumTime: 650,
    loaderMaximumWait: 3500,

    revealThreshold: 0.12,

    cursorLerp: 0.16,

    resizeDebounce: 180,

    scrollNavigationOffset: 18,
    transitionDuration: 500,

    trajectoryLerp: 0.085,
    trajectoryDrift: 18,

    magneticStrength: 0.12,
    magneticRadius: 90,

    standbyDelay: 30000,

    activeSectionReference: 0.52,

    focusDelay: 120
  };

  const state = {
    loaded: false,
    menuOpen: false,
    standby: false,

    activeIndex: 0,

    reducedMotion: false,
    finePointer: false,

    resizeTimer: null,
    standbyTimer: null,
    loaderTimer: null,
    rafId: null,

    animationRunning: false,
    scrollTicking: false,

    standbyReturnFocus: null,
    menuReturnFocus: null,

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

    loader: document.querySelector(".page-loader"),
    transition: document.querySelector(".page-transition"),

    cursor: document.querySelector(".custom-cursor"),
    cursorDot: document.querySelector(".custom-cursor-dot"),
    cursorRing: document.querySelector(".custom-cursor-ring"),

    header: document.querySelector(".site-header"),

    menu: document.querySelector(".site-menu"),
    menuTrigger: document.querySelector(".menu-trigger"),
    menuLinks: Array.from(document.querySelectorAll(".site-menu a")),

    progressLabel: document.querySelector("#progress-current"),
    progressFill: document.querySelector("#progress-fill"),
    progressPoint: document.querySelector("#progress-point"),

    previousSection: document.querySelector("#previous-section"),
    previousLabel: document.querySelector("#previous-section-label"),

    nextSection: document.querySelector("#next-section"),
    nextLabel: document.querySelector("#next-section-label"),

    sections: Array.from(document.querySelectorAll(".home-section")),

    reveals: Array.from(document.querySelectorAll(".reveal")),

    narrativeLinks: Array.from(document.querySelectorAll(".narrative-link")),

    magneticElements: Array.from(
      document.querySelectorAll(".site-brand, .menu-trigger, .contact-cta")
    ),

    transitionLinks: Array.from(
      document.querySelectorAll('a[href]:not([target="_blank"])')
    ),

    standby: document.querySelector(".standby-screen"),
    standbyWake: document.querySelector(".standby-wake"),

    ctaTrajectory: document.querySelector(".cta-trajectory"),
    contactCta: document.querySelector(".contact-cta"),

    directionLinks: Array.from(
      document.querySelectorAll(".hero-direction[data-direction]")
    ),

    directionNodes: Array.from(
      document.querySelectorAll(".direction-node[data-direction]")
    ),

    currentYear: document.querySelector("#current-year")
  };

  /* =======================================================
     HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (current, target, amount) =>
    current + (target - current) * amount;

  const getSectionNumber = index =>
    String(index + 1).padStart(2, "0");

  const getSectionByIndex = index => {
    if (!dom.sections.length) return null;

    return dom.sections[
      clamp(index, 0, dom.sections.length - 1)
    ];
  };

  const getSectionTitle = section =>
    section?.dataset.sectionTitle || "";

  const isFinePointer = () =>
    state.finePointer;

  const isModifiedClick = event =>
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey;

  const isEditableElement = element => {
    if (!element) return false;

    return (
      element.matches?.(
        "input, textarea, select, [contenteditable='true']"
      ) ||
      element.isContentEditable
    );
  };

  const getFocusableElements = container => {
    if (!container) return [];

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    return Array.from(
      container.querySelectorAll(selector)
    ).filter(element => {
      const style = window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !element.hasAttribute("hidden")
      );
    });
  };

  const setStyleVariable = (element, property, value) => {
    element?.style.setProperty(property, value);
  };

  const cssEscape = value => {
    if (window.CSS?.escape) {
      return window.CSS.escape(value);
    }

    return String(value).replace(
      /([^\w-])/g,
      "\\$1"
    );
  };

  /* =======================================================
     PREFERENCES
     ======================================================= */

  const initPreferences = () => {
    const motionMedia = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const pointerMedia = window.matchMedia(
      "(pointer: fine)"
    );

    const applyMotion = matches => {
      state.reducedMotion = matches;

      dom.html.classList.toggle(
        "reduced-motion",
        matches
      );

      if (matches) {
        state.trajectory.drift = 0;
        state.trajectory.targetDrift = 0;

        dom.cursor?.classList.remove(
          "is-visible",
          "is-hovering"
        );

        clearStandbyTimer();
        stopAnimationLoop();

        dom.reveals.forEach(element => {
          element.classList.add("is-visible");
        });
      } else {
        updateTrajectoryTargets();
        resetStandbyTimer();
        updateAnimationRequirement();
      }
    };

    const applyPointer = matches => {
      state.finePointer = matches;

      dom.html.classList.toggle(
        "fine-pointer",
        matches
      );

      if (!matches) {
        dom.cursor?.classList.remove(
          "is-visible",
          "is-hovering"
        );
      }

      updateAnimationRequirement();
    };

    applyMotion(motionMedia.matches);
    applyPointer(pointerMedia.matches);

    const addMediaListener = (
      media,
      callback
    ) => {
      if (typeof media.addEventListener === "function") {
        media.addEventListener(
          "change",
          event => callback(event.matches)
        );
      } else if (typeof media.addListener === "function") {
        media.addListener(
          event => callback(event.matches)
        );
      }
    };

    addMediaListener(motionMedia, applyMotion);
    addMediaListener(pointerMedia, applyPointer);
  };

  /* =======================================================
     LOADER
     ======================================================= */

  const initLoader = () => {
    if (!dom.loader) {
      state.loaded = true;
      return;
    }

    const started = performance.now();
    let finished = false;

    const removeLoader = () => {
      if (finished || state.loaded) return;

      finished = true;

      if (state.loaderTimer !== null) {
        window.clearTimeout(state.loaderTimer);
        state.loaderTimer = null;
      }

      const elapsed =
        performance.now() - started;

      const remaining = Math.max(
        0,
        CONFIG.loaderMinimumTime - elapsed
      );

      window.setTimeout(() => {
        if (state.loaded) return;

        state.loaded = true;

        dom.loader.classList.add("is-hidden");

        window.setTimeout(() => {
          dom.loader?.remove();
        }, 800);
      }, remaining);
    };

    if (document.readyState === "complete") {
      removeLoader();
    } else {
      window.addEventListener(
        "load",
        removeLoader,
        { once: true }
      );
    }

    state.loaderTimer = window.setTimeout(
      removeLoader,
      CONFIG.loaderMaximumWait
    );
  };

  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  const initPageTransitions = () => {
    if (!dom.transition) return;

    dom.transitionLinks.forEach(link => {
      link.addEventListener("click", event => {
        if (isModifiedClick(event)) return;

        if (
          link.hasAttribute("download") ||
          (link.target && link.target !== "_self")
        ) {
          return;
        }

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
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

        if (
          url.href ===
          window.location.href
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

        window.setTimeout(() => {
          window.location.assign(
            url.href
          );
        }, CONFIG.transitionDuration);
      });
    });

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
     MENU ACCESSIBILITY
     ======================================================= */

  const setMenuAccessibility = isOpen => {
    if (!dom.menu) return;

    dom.menu.setAttribute(
      "aria-hidden",
      String(!isOpen)
    );

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    dom.menuTrigger?.setAttribute(
      "aria-label",
      isOpen
        ? "Chiudi menu"
        : "Apri menu"
    );

    if ("inert" in dom.menu) {
      dom.menu.inert = !isOpen;
    } else if (isOpen) {
      dom.menu.removeAttribute("inert");
    } else {
      dom.menu.setAttribute(
        "inert",
        ""
      );
    }
  };

  const openMenu = () => {
    if (
      !dom.menu ||
      state.menuOpen ||
      state.standby
    ) {
      return;
    }

    clearStandbyTimer();

    state.menuReturnFocus =
      document.activeElement;

    state.menuOpen = true;

    setMenuAccessibility(true);

    dom.body.classList.add(
      "is-menu-open"
    );

    const focusFirst = () => {
      const first =
        getFocusableElements(
          dom.menu
        )[0];

      first?.focus({
        preventScroll: true
      });
    };

    if (state.reducedMotion) {
      focusFirst();
    } else {
      window.setTimeout(
        focusFirst,
        CONFIG.focusDelay
      );
    }
  };

  const closeMenu = (
    returnFocus = true
  ) => {
    if (
      !dom.menu ||
      !state.menuOpen
    ) {
      return;
    }

    state.menuOpen = false;

    setMenuAccessibility(false);

    dom.body.classList.remove(
      "is-menu-open"
    );

    const returnTarget =
      state.menuReturnFocus ||
      dom.menuTrigger;

    state.menuReturnFocus = null;

    if (
      returnFocus &&
      returnTarget &&
      typeof returnTarget.focus ===
        "function" &&
      document.contains(returnTarget)
    ) {
      window.requestAnimationFrame(
        () => {
          returnTarget.focus({
            preventScroll: true
          });
        }
      );
    }

    resetStandbyTimer();
  };

  const trapMenuFocus = event => {
    if (
      !state.menuOpen ||
      event.key !== "Tab"
    ) {
      return;
    }

    const focusable =
      getFocusableElements(
        dom.menu
      );

    if (!focusable.length) {
      event.preventDefault();
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
    setMenuAccessibility(false);

    dom.menuTrigger?.addEventListener(
      "click",
      () => {
        if (state.menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );

    dom.menuLinks.forEach(link => {
      link.addEventListener(
        "click",
        () => closeMenu(false)
      );
    });

    dom.menu?.addEventListener(
      "keydown",
      trapMenuFocus
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape" &&
          state.menuOpen
        ) {
          event.preventDefault();
          closeMenu();
        }
      }
    );
  };

  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  const updateJumpControl = (
    control,
    label,
    targetIndex,
    disabled,
    direction
  ) => {
    if (!control) return;

    if (disabled) {
      control.classList.add(
        "is-disabled"
      );

      control.setAttribute(
        "aria-hidden",
        "true"
      );

      control.setAttribute(
        "tabindex",
        "-1"
      );

      if (label) {
        label.textContent = "";
      }

      return;
    }

    const number =
      getSectionNumber(targetIndex);

    control.classList.remove(
      "is-disabled"
    );

    control.removeAttribute(
      "aria-hidden"
    );

    control.removeAttribute(
      "tabindex"
    );

    control.href = `#${number}`;

    control.setAttribute(
      "aria-label",
      `Vai alla sezione ${number}, ${direction}`
    );

    if (label) {
      label.textContent = number;
    }
  };

  const updateSectionHeader = index => {
    const section =
      getSectionByIndex(index);

    if (!section) return;

    const total =
      dom.sections.length;

    const progress =
      total <= 1
        ? 0
        : index / (total - 1);

    const title =
      getSectionTitle(section);

    if (dom.progressLabel) {
      dom.progressLabel.textContent =
        title;

      dom.progressLabel.setAttribute(
        "aria-label",
        `Sezione ${getSectionNumber(index)}: ${title}`
      );
    }

    if (dom.progressFill) {
      dom.progressFill.style.width =
        `${progress * 100}%`;
    }

    if (dom.progressPoint) {
      dom.progressPoint.style.left =
        `${progress * 100}%`;
    }

    updateJumpControl(
      dom.previousSection,
      dom.previousLabel,
      index - 1,
      index === 0,
      "precedente"
    );

    const isLast =
      index === total - 1;

    if (isLast) {
      dom.nextSection?.classList.add(
        "is-home-return"
      );

      if (dom.nextSection) {
        dom.nextSection.href = "#01";

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

  const navigateToSection = (
    index,
    updateUrl = true
  ) => {
    const target =
      getSectionByIndex(index);

    if (!target) return;

    const headerHeight =
      dom.header?.offsetHeight || 0;

    const rect =
      target.getBoundingClientRect();

    const top =
      window.scrollY +
      rect.top -
      headerHeight -
      CONFIG.scrollNavigationOffset;

    if (
      updateUrl &&
      target.id
    ) {
      const hash =
        `#${target.id}`;

      if (
        window.location.hash !==
        hash
      ) {
        window.history.replaceState(
          null,
          "",
          hash
        );
      }
    }

    window.scrollTo({
      top: Math.max(0, top),
      behavior:
        state.reducedMotion
          ? "auto"
          : "smooth"
    });
  };

  const initSectionNavigation = () => {
    dom.previousSection?.addEventListener(
      "click",
      event => {
        if (isModifiedClick(event)) {
          return;
        }

        event.preventDefault();

        if (state.activeIndex > 0) {
          navigateToSection(
            state.activeIndex - 1
          );
        }
      }
    );

    dom.nextSection?.addEventListener(
      "click",
      event => {
        if (isModifiedClick(event)) {
          return;
        }

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

  const detectActiveSection = () => {
    if (!dom.sections.length) {
      return;
    }

    const reference =
      window.innerHeight *
      CONFIG.activeSectionReference;

    let bestIndex =
      state.activeIndex;

    let bestDistance =
      Infinity;

    dom.sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        if (
          rect.bottom <= 0 ||
          rect.top >= window.innerHeight
        ) {
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
          bestDistance = distance;
          bestIndex = index;
        }
      }
    );

    if (
      state.activeIndex !==
      bestIndex
    ) {
      state.activeIndex =
        bestIndex;

      updateSectionHeader(
        bestIndex
      );
    }
  };

  /* =======================================================
     REVEALS
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
     HERO DIRECTIONS
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
            element.dataset.direction ===
            key
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
            element.dataset.direction ===
            key
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
            (window.scrollY - start) /
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
            progress * Math.PI * 2
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

    setStyleVariable(
      dom.html,
      "--trajectory-progress",
      state.trajectory.progress.toFixed(4)
    );

    setStyleVariable(
      dom.html,
      "--trajectory-drift",
      `${state.trajectory.drift.toFixed(2)}px`
    );
  };

  /* =======================================================
     NARRATIVE CONNECTIONS
     ======================================================= */

  const initNarrativeLinks = () => {
    dom.narrativeLinks.forEach(
      link => {
        const node =
          link.dataset.trajectoryNode;

        if (!node) return;

        const escaped =
          cssEscape(node);

        const targets = [
          ...document.querySelectorAll(
            `.network-node[data-node="${escaped}"]`
          ),
          ...document.querySelectorAll(
            `.direction-node[data-direction="${escaped}"]`
          )
        ];

        if (!targets.length) {
          return;
        }

        const setLinked = active => {
          targets.forEach(
            target =>
              target.classList.toggle(
                "is-linked",
                active
              )
          );
        };

        link.addEventListener(
          "pointerenter",
          () => setLinked(true)
        );

        link.addEventListener(
          "pointerleave",
          () => setLinked(false)
        );

        link.addEventListener(
          "focusin",
          () => setLinked(true)
        );

        link.addEventListener(
          "focusout",
          () => setLinked(false)
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
      !dom.cursorRing
    ) {
      return;
    }

    document.addEventListener(
      "pointermove",
      event => {
        if (
          !isFinePointer() ||
          state.reducedMotion
        ) {
          return;
        }

        state.pointer.targetX =
          event.clientX;

        state.pointer.targetY =
          event.clientY;

        dom.cursor.classList.add(
          "is-visible"
        );

        updateAnimationRequirement();
      },
      {
        passive: true
      }
    );

    document
      .querySelectorAll("a, button")
      .forEach(element => {
        element.addEventListener(
          "pointerenter",
          () => {
            if (
              !isFinePointer() ||
              state.reducedMotion
            ) {
              return;
            }

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
      });

    window.addEventListener(
      "pointerleave",
      () => {
        dom.cursor?.classList.remove(
          "is-visible",
          "is-hovering"
        );

        updateAnimationRequirement();
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
      `translate3d(${state.pointer.targetX}px, ${state.pointer.targetY}px, 0) translate(-50%, -50%)`;

    dom.cursorRing.style.transform =
      `translate3d(${state.cursor.x}px, ${state.cursor.y}px, 0) translate(-50%, -50%)`;
  };

  /* =======================================================
     MAGNETIC ELEMENTS
     ======================================================= */

  const initMagneticElements = () => {
    if (
      !dom.magneticElements.length
    ) {
      return;
    }

    dom.magneticElements.forEach(
      element => {
        element.addEventListener(
          "pointermove",
          event => {
            if (
              !isFinePointer() ||
              state.reducedMotion
            ) {
              return;
            }

            const rect =
              element.getBoundingClientRect();

            const dx =
              event.clientX -
              (rect.left +
                rect.width / 2);

            const dy =
              event.clientY -
              (rect.top +
                rect.height / 2);

            const distance =
              Math.hypot(dx, dy);

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

            setStyleVariable(
              element,
              "--magnetic-x",
              `${dx * strength}px`
            );

            setStyleVariable(
              element,
              "--magnetic-y",
              `${dy * strength}px`
            );

            updateAnimationRequirement();
          },
          {
            passive: true
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            setStyleVariable(
              element,
              "--magnetic-x",
              "0px"
            );

            setStyleVariable(
              element,
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
      !dom.ctaTrajectory ||
      !dom.contactCta
    ) {
      return;
    }

    const engage = () =>
      dom.ctaTrajectory.classList.add(
        "is-engaged"
      );

    const disengage = () =>
      dom.ctaTrajectory.classList.remove(
        "is-engaged"
      );

    dom.contactCta.addEventListener(
      "pointerenter",
      engage
    );

    dom.contactCta.addEventListener(
      "pointerleave",
      disengage
    );

    dom.contactCta.addEventListener(
      "focusin",
      engage
    );

    dom.contactCta.addEventListener(
      "focusout",
      disengage
    );
  };

  /* =======================================================
     STANDBY
     ======================================================= */

  const clearStandbyTimer = () => {
    if (
      state.standbyTimer !== null
    ) {
      window.clearTimeout(
        state.standbyTimer
      );

      state.standbyTimer = null;
    }
  };

  const enterStandby = () => {
    if (
      state.menuOpen ||
      state.standby ||
      !dom.standby ||
      state.reducedMotion ||
      document.hidden
    ) {
      return;
    }

    if (
      isEditableElement(
        document.activeElement
      )
    ) {
      resetStandbyTimer();
      return;
    }

    state.standbyReturnFocus =
      document.activeElement;

    state.standby = true;

    clearStandbyTimer();

    dom.body.classList.add(
      "is-standby"
    );

    dom.standby.classList.add(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );

    if ("inert" in dom.standby) {
      dom.standby.inert = false;
    } else {
      dom.standby.removeAttribute(
        "inert"
      );
    }

    dom.standbyWake?.focus({
      preventScroll: true
    });
  };

  const exitStandby = (
    restoreFocus = true
  ) => {
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

    if (dom.standby) {
      if ("inert" in dom.standby) {
        dom.standby.inert = true;
      } else {
        dom.standby.setAttribute(
          "inert",
          ""
        );
      }
    }

    const returnFocus =
      state.standbyReturnFocus;

    state.standbyReturnFocus = null;

    if (
      restoreFocus &&
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

  const resetStandbyTimer = () => {
    clearStandbyTimer();

    if (
      state.menuOpen ||
      state.standby ||
      document.hidden ||
      state.reducedMotion
    ) {
      return;
    }

    state.standbyTimer =
      window.setTimeout(
        enterStandby,
        CONFIG.standbyDelay
      );
  };

  const trapStandbyFocus = event => {
    if (
      !state.standby ||
      event.key !== "Tab"
    ) {
      return;
    }

    event.preventDefault();

    dom.standbyWake?.focus({
      preventScroll: true
    });
  };

  const initStandby = () => {
    if (!dom.standby) {
      return;
    }

    dom.standby.setAttribute(
      "aria-hidden",
      "true"
    );

    if ("inert" in dom.standby) {
      dom.standby.inert = true;
    } else {
      dom.standby.setAttribute(
        "inert",
        ""
      );
    }

    dom.standbyWake?.addEventListener(
      "click",
      () => exitStandby()
    );

    dom.standby?.addEventListener(
      "keydown",
      trapStandbyFocus
    );

    [
      "pointerdown",
      "wheel",
      "touchstart"
    ].forEach(eventName => {
      window.addEventListener(
        eventName,
        () => {
          if (state.standby) {
            exitStandby();
            return;
          }

          resetStandbyTimer();
        },
        {
          passive: true
        }
      );
    });

    window.addEventListener(
      "keydown",
      event => {
        if (state.standby) {
          if (
            event.key === "Tab"
          ) {
            return;
          }

          exitStandby();
          return;
        }

        if (
          event.key !== "Shift"
        ) {
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

    const normalizedHash =
      hash.toLowerCase();

    const index =
      dom.sections.findIndex(
        section =>
          `#${section.id}`.toLowerCase() ===
          normalizedHash
      );

    if (index < 0) {
      return;
    }

    window.requestAnimationFrame(
      () => {
        window.setTimeout(
          () => {
            navigateToSection(
              index,
              false
            );
          },
          0
        );
      }
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

        if (
          isEditableElement(
            document.activeElement
          )
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
     SCROLL / RESIZE
     ======================================================= */

  const handleScrollFrame = () => {
    state.scrollTicking = false;

    detectActiveSection();
    updateTrajectoryTargets();
    updateAnimationRequirement();
  };

  const handleScroll = () => {
    if (state.scrollTicking) {
      return;
    }

    state.scrollTicking = true;

    window.requestAnimationFrame(
      handleScrollFrame
    );
  };

  const handleResize = () => {
    window.clearTimeout(
      state.resizeTimer
    );

    state.resizeTimer =
      window.setTimeout(
        () => {
          detectActiveSection();
          updateTrajectoryTargets();
          updateSectionHeader(
            state.activeIndex
          );
          updateAnimationRequirement();
        },
        CONFIG.resizeDebounce
      );
  };

  /* =======================================================
     ANIMATION LOOP
     ======================================================= */

  const animationIsNeeded = () => {
    if (
      state.reducedMotion ||
      document.hidden
    ) {
      return false;
    }

    const cursorVisible =
      isFinePointer() &&
      dom.cursor?.classList.contains(
        "is-visible"
      );

    const trajectoryMoving =
      Math.abs(
        state.trajectory.progress -
          state.trajectory.targetProgress
      ) > 0.0005 ||
      Math.abs(
        state.trajectory.drift -
          state.trajectory.targetDrift
      ) > 0.05;

    return (
      cursorVisible ||
      trajectoryMoving
    );
  };

  const animationFrame = () => {
    updateCursorFrame();
    updateTrajectoryFrame();

    if (
      animationIsNeeded()
    ) {
      state.rafId =
        window.requestAnimationFrame(
          animationFrame
        );
    } else {
      state.animationRunning =
        false;

      state.rafId = null;
    }
  };

  const startAnimationLoop = () => {
    if (
      state.animationRunning ||
      state.reducedMotion ||
      document.hidden
    ) {
      return;
    }

    state.animationRunning = true;

    state.rafId =
      window.requestAnimationFrame(
        animationFrame
      );
  };

  const stopAnimationLoop = () => {
    if (
      state.rafId !== null
    ) {
      window.cancelAnimationFrame(
        state.rafId
      );
    }

    state.rafId = null;
    state.animationRunning = false;
  };

  const updateAnimationRequirement = () => {
    if (
      animationIsNeeded()
    ) {
      startAnimationLoop();
    }
  };

  /* =======================================================
     VISIBILITY / BFCACHE
     ======================================================= */

  const initVisibilityHandling = () => {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          stopAnimationLoop();
          clearStandbyTimer();
          return;
        }

        updateTrajectoryTargets();
        resetStandbyTimer();
        updateAnimationRequirement();
      }
    );

    window.addEventListener(
      "pageshow",
      event => {
        if (!event.persisted) {
          return;
        }

        updateTrajectoryTargets();
        detectActiveSection();
        updateSectionHeader(
          state.activeIndex
        );
        resetStandbyTimer();
        updateAnimationRequirement();
      }
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

    updateSectionHeader(0);
    updateTrajectoryTargets();
    resetStandbyTimer();
    updateAnimationRequirement();
  };

  /* =======================================================
     YEAR
     ======================================================= */

  const initYear = () => {
    if (!dom.currentYear) {
      return;
    }

    dom.currentYear.textContent =
      String(new Date().getFullYear());
  };

  /* =======================================================
     INIT
     ======================================================= */

  const init = () => {
    initPreferences();
    initLoader();

    initPageTransitions();

    initMenu();
    initSectionNavigation();

    initRevealSystem();

    initDirectionInteractions();
    initNarrativeLinks();

    initCursor();
    initMagneticElements();
    initCtaInteraction();

    initStandby();

    initHashNavigation();
    initKeyboardNavigation();

    initVisibilityHandling();

    initYear();

    setInitialState();

    detectActiveSection();
    updateTrajectoryTargets();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
    );

    updateAnimationRequirement();
  };

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
