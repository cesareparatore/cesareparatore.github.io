/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER INTERACTION SYSTEM — 3.1
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     PROGRESSIVE ENHANCEMENT — FIRST THING
     ======================================================= */

  const html = document.documentElement;

  html.classList.add("js");

  /* =======================================================
     CONFIG
     ======================================================= */

  const CONFIG = {
    loaderMinimumTime: 650,
    loaderMaximumWait: 3500,
    loaderRemoveDelay: 800,

    revealThreshold: 0.12,
    revealRootMargin: "0px 0px -8% 0px",

    cursorLerp: 0.16,

    resizeDebounce: 180,

    scrollNavigationOffset: 18,

    transitionDuration: 500,

    trajectoryLerp: 0.085,
    trajectoryDrift: 18,

    magneticStrength: 0.12,
    magneticRadius: 90,

    activeSectionReference: 0.52,

    hashNavigationDelay: 0
  };

  /* =======================================================
     STATE
     ======================================================= */

  const state = {
    initialized: false,

    loaded: false,

    menuOpen: false,

    activeIndex: 0,

    reducedMotion: false,

    finePointer: false,

    resizeTimer: null,

    loaderTimer: null,

    loaderRemovalTimer: null,

    transitionTimer: null,

    rafId: null,

    animationRunning: false,

    scrollTicking: false,

    transitionInProgress: false,

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

  /* =======================================================
     DOM
     ======================================================= */

  const dom = {
    html,

    body: document.body,

    loader: document.querySelector(".page-loader"),

    transition: document.querySelector(".page-transition"),

    cursor: document.querySelector(".custom-cursor"),

    cursorDot: document.querySelector(
      ".custom-cursor-dot"
    ),

    cursorRing: document.querySelector(
      ".custom-cursor-ring"
    ),

    header: document.querySelector(".site-header"),

    menu: document.querySelector(".site-menu"),

    menuTrigger: document.querySelector(
      ".menu-trigger"
    ),

    menuLinks: Array.from(
      document.querySelectorAll(".site-menu a")
    ),

    progressLabel: document.querySelector(
      "#progress-current"
    ),

    progressFill: document.querySelector(
      "#progress-fill"
    ),

    progressPoint: document.querySelector(
      "#progress-point"
    ),

    previousSection: document.querySelector(
      "#previous-section"
    ),

    previousLabel: document.querySelector(
      "#previous-section-label"
    ),

    nextSection: document.querySelector(
      "#next-section"
    ),

    nextLabel: document.querySelector(
      "#next-section-label"
    ),

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

    ctaTrajectory: document.querySelector(
      ".cta-trajectory"
    ),

    contactCta: document.querySelector(
      ".contact-cta"
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
    )
  };

  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (current, target, amount) =>
    current + (target - current) * amount;

  const getSectionNumber = index =>
    String(index + 1).padStart(2, "0");

  const getSectionByIndex = index => {
    if (!dom.sections.length) {
      return null;
    }

    return dom.sections[
      clamp(index, 0, dom.sections.length - 1)
    ];
  };

  const getSectionTitle = section =>
    section?.dataset.sectionTitle || "";

  const getFocusableElements = container => {
    if (!container) {
      return [];
    }

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
    ).filter(element => {
      const style =
        window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !element.hasAttribute("inert")
      );
    });
  };

  const isModifiedClick = event =>
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey;

  const isSameDocumentHash = url =>
    url.origin === window.location.origin &&
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    Boolean(url.hash);

  const isEditableElement = element =>
    Boolean(
      element &&
      (
        element.matches?.(
          "input, textarea, select"
        ) ||
        element.isContentEditable
      )
    );

  /* =======================================================
     MOTION / POINTER PREFERENCES
     ======================================================= */

  const initPreferences = () => {
    const motionMedia =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const pointerMedia =
      window.matchMedia(
        "(pointer: fine)"
      );

    const applyMotion = reduced => {
      state.reducedMotion = reduced;

      dom.html.classList.toggle(
        "reduced-motion",
        reduced
      );

      if (reduced) {
        state.trajectory.drift = 0;
        state.trajectory.targetDrift = 0;

        if (dom.cursor) {
          dom.cursor.classList.remove(
            "is-visible",
            "is-hovering"
          );
        }

        stopAnimationLoop();

        updateTrajectoryFrame();
      } else {
        updateAnimationRequirement();
      }
    };

    const applyPointer = fine => {
      state.finePointer = fine;

      dom.html.classList.toggle(
        "fine-pointer",
        fine
      );

      if (!fine) {
        dom.cursor?.classList.remove(
          "is-visible",
          "is-hovering"
        );
      }

      updateAnimationRequirement();
    };

    applyMotion(motionMedia.matches);
    applyPointer(pointerMedia.matches);

    if (
      typeof motionMedia.addEventListener ===
      "function"
    ) {
      motionMedia.addEventListener(
        "change",
        event => applyMotion(event.matches)
      );
    } else if (
      typeof motionMedia.addListener ===
      "function"
    ) {
      motionMedia.addListener(
        event => applyMotion(event.matches)
      );
    }

    if (
      typeof pointerMedia.addEventListener ===
      "function"
    ) {
      pointerMedia.addEventListener(
        "change",
        event => applyPointer(event.matches)
      );
    } else if (
      typeof pointerMedia.addListener ===
      "function"
    ) {
      pointerMedia.addListener(
        event => applyPointer(event.matches)
      );
    }
  };

  /* =======================================================
     LOADER
     ======================================================= */

  const removeLoader = () => {
    if (
      !dom.loader ||
      state.loaded
    ) {
      return;
    }

    state.loaded = true;

    if (state.loaderTimer) {
      clearTimeout(state.loaderTimer);
      state.loaderTimer = null;
    }

    dom.loader.classList.add(
      "is-hidden"
    );

    state.loaderRemovalTimer =
      window.setTimeout(() => {
        dom.loader?.remove();
        state.loaderRemovalTimer = null;
      }, CONFIG.loaderRemoveDelay);
  };

  const initLoader = () => {
    if (!dom.loader) {
      state.loaded = true;
      return;
    }

    const started =
      performance.now();

    let completed = false;

    const finish = () => {
      if (completed || state.loaded) {
        return;
      }

      completed = true;

      const elapsed =
        performance.now() - started;

      const remaining =
        Math.max(
          0,
          CONFIG.loaderMinimumTime -
            elapsed
        );

      window.setTimeout(
        removeLoader,
        remaining
      );
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

    state.loaderTimer =
      window.setTimeout(
        finish,
        CONFIG.loaderMaximumWait
      );
  };

  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  const shouldInterceptTransition =
    (event, link) => {
      if (
        !link ||
        isModifiedClick(event) ||
        state.transitionInProgress ||
        state.reducedMotion
      ) {
        return false;
      }

      if (
        link.hasAttribute("download") ||
        link.hasAttribute("data-no-transition") ||
        link.target === "_blank" ||
        link.target === "_parent" ||
        link.target === "_top"
      ) {
        return false;
      }

      const href =
        link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return false;
      }

      let url;

      try {
        url = new URL(
          href,
          window.location.href
        );
      } catch {
        return false;
      }

      if (
        url.origin !==
        window.location.origin
      ) {
        return false;
      }

      if (
        url.href ===
        window.location.href
      ) {
        return false;
      }

      if (
        isSameDocumentHash(url)
      ) {
        return false;
      }

      return true;
    };

  const initPageTransitions = () => {
    if (!dom.transition) {
      return;
    }

    dom.transitionLinks.forEach(
      link => {
        link.addEventListener(
          "click",
          event => {
            if (
              !shouldInterceptTransition(
                event,
                link
              )
            ) {
              return;
            }

            const href =
              link.getAttribute(
                "href"
              );

            let url;

            try {
              url = new URL(
                href,
                window.location.href
              );
            } catch {
              return;
            }

            event.preventDefault();

            state.transitionInProgress =
              true;

            closeMenu(false);

            dom.transition.classList.add(
              "is-active"
            );

            state.transitionTimer =
              window.setTimeout(() => {
                window.location.assign(
                  url.href
                );
              },
              CONFIG.transitionDuration);
          }
        );
      }
    );

    window.addEventListener(
      "pageshow",
      () => {
        state.transitionInProgress =
          false;

        if (state.transitionTimer) {
          clearTimeout(
            state.transitionTimer
          );

          state.transitionTimer = null;
        }

        dom.transition?.classList.remove(
          "is-active"
        );
      }
    );

    window.addEventListener(
      "pagehide",
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

  const setMenuAccessibility =
    isOpen => {
      if (!dom.menu) {
        return;
      }

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
        dom.menu.removeAttribute(
          "inert"
        );
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
      state.menuOpen
    ) {
      return;
    }

    state.menuReturnFocus =
      document.activeElement;

    state.menuOpen = true;

    setMenuAccessibility(true);

    dom.body.classList.add(
      "is-menu-open"
    );

    dom.menuTrigger?.classList.add(
      "is-active"
    );

    const focusFirst = () => {
      if (!state.menuOpen) {
        return;
      }

      getFocusableElements(
        dom.menu
      )[0]?.focus({
        preventScroll: true
      });
    };

    if (state.reducedMotion) {
      focusFirst();
    } else {
      window.setTimeout(
        focusFirst,
        80
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

    dom.menuTrigger?.classList.remove(
      "is-active"
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
  };

  const trapMenuFocus =
    event => {
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
        document.activeElement ===
          first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement ===
          last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

  const initMenu = () => {
    if (!dom.menu) {
      return;
    }

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

    dom.menu.addEventListener(
      "click",
      event => {
        if (
          event.target === dom.menu
        ) {
          closeMenu();
        }
      }
    );

    dom.menu.addEventListener(
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
     SECTION HEADER / PROGRESS
     ======================================================= */

  const updateSectionHeader =
    index => {
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

      const last =
        index === total - 1;

      if (last) {
        dom.nextSection?.classList.add(
          "is-home-return"
        );

        if (dom.nextSection) {
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

        const arrow =
          dom.nextSection?.querySelector(
            ".section-jump-arrow"
          );

        if (arrow) {
          arrow.textContent = "↑";
        }
      } else {
        const nextNumber =
          getSectionNumber(
            index + 1
          );

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

        const arrow =
          dom.nextSection?.querySelector(
            ".section-jump-arrow"
          );

        if (arrow) {
          arrow.textContent = "→";
        }
      }
    };

  const updateJumpControl = (
    control,
    label,
    targetIndex,
    disabled,
    direction
  ) => {
    if (!control) {
      return;
    }

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
      getSectionNumber(
        targetIndex
      );

    control.classList.remove(
      "is-disabled"
    );

    control.removeAttribute(
      "aria-hidden"
    );

    control.removeAttribute(
      "tabindex"
    );

    control.href =
      `#${number}`;

    control.setAttribute(
      "aria-label",
      `Vai alla sezione ${number}, ${direction}`
    );

    if (label) {
      label.textContent =
        number;
    }
  };

  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  const navigateToSection =
    (index, updateHash = true) => {
      const target =
        getSectionByIndex(index);

      if (!target) {
        return;
      }

      const headerHeight =
        dom.header?.offsetHeight || 0;

      const rect =
        target.getBoundingClientRect();

      const top =
        window.scrollY +
        rect.top -
        headerHeight -
        CONFIG.scrollNavigationOffset;

      const behavior =
        state.reducedMotion
          ? "auto"
          : "smooth";

      if (
        updateHash &&
        target.id
      ) {
        try {
          window.history.replaceState(
            null,
            "",
            `#${target.id}`
          );
        } catch {
          /* Native scrolling remains functional. */
        }
      }

      window.scrollTo({
        top: Math.max(0, top),
        behavior
      });

      state.activeIndex =
        index;

      updateSectionHeader(
        index
      );
    };

  const initSectionNavigation =
    () => {
      dom.previousSection?.addEventListener(
        "click",
        event => {
          if (
            isModifiedClick(event)
          ) {
            return;
          }

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
          if (
            isModifiedClick(event)
          ) {
            return;
          }

          event.preventDefault();

          const last =
            dom.sections.length - 1;

          const nextIndex =
            state.activeIndex === last
              ? 0
              : state.activeIndex + 1;

          navigateToSection(
            nextIndex
          );
        }
      );
    };

  /* =======================================================
     ACTIVE SECTION
     ======================================================= */

  const detectActiveSection =
    () => {
      if (
        !dom.sections.length
      ) {
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

          const visible =
            rect.bottom > 0 &&
            rect.top <
              window.innerHeight;

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
        bestIndex !==
        state.activeIndex
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

  const initRevealSystem =
    () => {
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
              CONFIG.revealRootMargin
          }
        );

      dom.reveals.forEach(
        element =>
          observer.observe(
            element
          )
      );
    };

  /* =======================================================
     DIRECTION INTERACTIONS
     ======================================================= */

  const initDirectionInteractions =
    () => {
      if (
        !dom.directionLinks.length ||
        !dom.directionNodes.length
      ) {
        return;
      }

      const setActive =
        (key, active) => {
          dom.directionLinks
            .filter(
              element =>
                element.dataset
                  .direction === key
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
                element.dataset
                  .direction === key
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

          if (!key) {
            return;
          }

          link.addEventListener(
            "pointerenter",
            () => {
              if (
                state.finePointer
              ) {
                setActive(
                  key,
                  true
                );
              }
            }
          );

          link.addEventListener(
            "pointerleave",
            () => {
              if (
                state.finePointer
              ) {
                setActive(
                  key,
                  false
                );
              }
            }
          );

          link.addEventListener(
            "focusin",
            () =>
              setActive(
                key,
                true
              )
          );

          link.addEventListener(
            "focusout",
            () =>
              setActive(
                key,
                false
              )
          );
        }
      );
    };

  /* =======================================================
     TRAJECTORY
     ======================================================= */

  const updateTrajectoryTargets =
    () => {
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
              ) / range,
              0,
              1
            );

      state.trajectory
        .targetProgress =
        progress;

      state.trajectory
        .targetDrift =
        state.reducedMotion
          ? 0
          : Math.sin(
              progress *
                Math.PI *
                2
            ) *
            CONFIG.trajectoryDrift;
    };

  const updateTrajectoryFrame =
    () => {
      const targetProgress =
        state.trajectory
          .targetProgress;

      if (
        state.reducedMotion
      ) {
        state.trajectory.progress =
          targetProgress;

        state.trajectory.drift =
          0;
      } else {
        state.trajectory.progress =
          lerp(
            state.trajectory.progress,
            targetProgress,
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
        state.trajectory.progress.toFixed(
          4
        )
      );

      dom.html.style.setProperty(
        "--trajectory-drift",
        `${state.trajectory.drift.toFixed(
          2
        )}px`
      );
    };

  /* =======================================================
     NARRATIVE LINKS
     ======================================================= */

  const initNarrativeLinks =
    () => {
      dom.narrativeLinks.forEach(
        link => {
          const node =
            link.dataset
              .trajectoryNode;

          if (!node) {
            return;
          }

          const targets = [
            ...document.querySelectorAll(
              `.network-node[data-node="${CSS.escape(
                node
              )}"]`
            ),
            ...document.querySelectorAll(
              `.direction-node[data-direction="${CSS.escape(
                node
              )}"]`
            )
          ];

          if (!targets.length) {
            return;
          }

          const setLinked =
            active => {
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
            () => {
              if (
                state.finePointer
              ) {
                setLinked(true);
              }
            }
          );

          link.addEventListener(
            "pointerleave",
            () => {
              if (
                state.finePointer
              ) {
                setLinked(false);
              }
            }
          );

          link.addEventListener(
            "focusin",
            () =>
              setLinked(true)
          );

          link.addEventListener(
            "focusout",
            () =>
              setLinked(false)
          );
        }
      );
    };

  /* =======================================================
     CUSTOM CURSOR
     ======================================================= */

  const initCursor =
    () => {
      if (
        !dom.cursor ||
        !dom.cursorDot ||
        !dom.cursorRing
      ) {
        return;
      }

      if (
        !state.finePointer ||
        state.reducedMotion
      ) {
        return;
      }

      document.addEventListener(
        "pointermove",
        event => {
          if (
            !state.finePointer ||
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
        { passive: true }
      );

      document
        .querySelectorAll(
          "a, button"
        )
        .forEach(element => {
          element.addEventListener(
            "pointerenter",
            () => {
              if (
                !state.finePointer ||
                state.reducedMotion
              ) {
                return;
              }

              dom.cursor.classList.add(
                "is-hovering"
              );

              updateAnimationRequirement();
            }
          );

          element.addEventListener(
            "pointerleave",
            () => {
              dom.cursor?.classList.remove(
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

  const updateCursorFrame =
    () => {
      if (
        !dom.cursor ||
        !dom.cursorDot ||
        !dom.cursorRing ||
        !state.finePointer ||
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

  const resetMagneticElement =
    element => {
      element.style.setProperty(
        "--magnetic-x",
        "0px"
      );

      element.style.setProperty(
        "--magnetic-y",
        "0px"
      );
    };

  const initMagneticElements =
    () => {
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
                !state.finePointer ||
                state.reducedMotion
              ) {
                return;
              }

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
                Math.hypot(
                  dx,
                  dy
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
                CONFIG.magneticStrength *
                (
                  1 -
                  distance /
                    CONFIG.magneticRadius
                );

              element.style.setProperty(
                "--magnetic-x",
                `${(
                  dx * strength
                ).toFixed(2)}px`
              );

              element.style.setProperty(
                "--magnetic-y",
                `${(
                  dy * strength
                ).toFixed(2)}px`
              );
            },
            { passive: true }
          );

          element.addEventListener(
            "pointerleave",
            () =>
              resetMagneticElement(
                element
              )
          );

          resetMagneticElement(
            element
          );
        }
      );
    };

  /* =======================================================
     CTA
     ======================================================= */

  const initCtaInteraction =
    () => {
      if (
        !dom.ctaTrajectory ||
        !dom.contactCta
      ) {
        return;
      }

      const engage =
        () =>
          dom.ctaTrajectory.classList.add(
            "is-engaged"
          );

      const disengage =
        () =>
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
     HASH NAVIGATION
     ======================================================= */

  const getSectionIndexFromHash =
    hash => {
      if (!hash) {
        return -1;
      }

      const id =
        decodeURIComponent(
          hash.replace(
            /^#/,
            ""
          )
        );

      return dom.sections.findIndex(
        section =>
          section.id === id
      );
    };

  const initHashNavigation =
    () => {
      const hash =
        window.location.hash;

      const index =
        getSectionIndexFromHash(
          hash
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
            CONFIG.hashNavigationDelay
          );
        }
      );
    };

  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  const initKeyboardNavigation =
    () => {
      document.addEventListener(
        "keydown",
        event => {
          if (
            state.menuOpen ||
            isEditableElement(
              document.activeElement
            )
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
              dom.sections.length -
                1
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

  const processScroll =
    () => {
      state.scrollTicking =
        false;

      detectActiveSection();

      updateTrajectoryTargets();

      updateAnimationRequirement();
    };

  const handleScroll =
    () => {
      if (
        state.scrollTicking
      ) {
        return;
      }

      state.scrollTicking =
        true;

      window.requestAnimationFrame(
        processScroll
      );
    };

  /* =======================================================
     RESIZE
     ======================================================= */

  const handleResize =
    () => {
      if (
        state.resizeTimer
      ) {
        clearTimeout(
          state.resizeTimer
        );
      }

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
     SMART ANIMATION LOOP
     ======================================================= */

  const animationIsNeeded =
    () => {
      if (
        state.reducedMotion ||
        document.hidden
      ) {
        return false;
      }

      const cursorVisible =
        state.finePointer &&
        dom.cursor?.classList.contains(
          "is-visible"
        );

      const trajectoryMoving =
        Math.abs(
          state.trajectory.progress -
            state.trajectory
              .targetProgress
        ) > 0.0005 ||
        Math.abs(
          state.trajectory.drift -
            state.trajectory
              .targetDrift
        ) > 0.05;

      return Boolean(
        cursorVisible ||
        trajectoryMoving
      );
    };

  const animationFrame =
    () => {
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
        state.rafId = null;
        state.animationRunning =
          false;
      }
    };

  const startAnimationLoop =
    () => {
      if (
        state.animationRunning ||
        state.reducedMotion ||
        document.hidden
      ) {
        return;
      }

      state.animationRunning =
        true;

      state.rafId =
        window.requestAnimationFrame(
          animationFrame
        );
    };

  const stopAnimationLoop =
    () => {
      if (
        state.rafId !== null
      ) {
        window.cancelAnimationFrame(
          state.rafId
        );
      }

      state.rafId = null;

      state.animationRunning =
        false;
    };

  const updateAnimationRequirement =
    () => {
      if (
        animationIsNeeded()
      ) {
        startAnimationLoop();
      }
    };

  /* =======================================================
     VISIBILITY / BFCache
     ======================================================= */

  const initVisibilityHandling =
    () => {
      document.addEventListener(
        "visibilitychange",
        () => {
          if (
            document.hidden
          ) {
            stopAnimationLoop();
          } else {
            updateTrajectoryTargets();

            updateAnimationRequirement();
          }
        }
      );

      window.addEventListener(
        "pageshow",
        () => {
          state.transitionInProgress =
            false;

          detectActiveSection();

          updateTrajectoryTargets();

          updateAnimationRequirement();
        }
      );
    };

  /* =======================================================
     INITIAL STATE
     ======================================================= */

  const setInitialState =
    () => {
      if (
        !dom.sections.length
      ) {
        return;
      }

      state.activeIndex = 0;

      updateSectionHeader(0);

      updateTrajectoryTargets();

      updateTrajectoryFrame();

      updateAnimationRequirement();
    };

  /* =======================================================
     GLOBAL CLEANUP
     ======================================================= */

  const initGlobalEvents =
    () => {
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
    };

  /* =======================================================
     INIT
     ======================================================= */

  const init = () => {
    if (
      state.initialized
    ) {
      return;
    }

    state.initialized =
      true;

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

    initHashNavigation();

    initKeyboardNavigation();

    initVisibilityHandling();

    initGlobalEvents();

    setInitialState();

    detectActiveSection();

    updateTrajectoryTargets();

    updateTrajectoryFrame();
  };

  /* =======================================================
     BOOT
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
