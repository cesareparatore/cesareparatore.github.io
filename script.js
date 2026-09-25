(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 45000,
    loaderFailsafe: 3500,
    scrollOffset: 12,
    scrollTrackingRaf: true,
    resizeDebounce: 180,
    standbyWakeThrottle: 650,
    navigationReleaseDelay: 900
  };

  const state = {
    menuOpen: false,
    lastFocused: null,
    sections: [],
    activeIndex: 0,
    ticking: false,
    standbyTimer: null,
    standbyVisible: false,
    standbyWakeTimer: null,
    navigationTimer: null,
    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,
    gsapMM: null,
    isNavigating: false
  };

  const dom = {
    body: document.body,
    html: document.documentElement,

    loader: document.getElementById("loader"),
    standby: document.getElementById("standby"),

    menuToggle: document.getElementById("menu-toggle"),
    menuToggleLabel: document.querySelector(".menu-toggle-label"),
    menu: document.getElementById("site-menu"),

    main: document.getElementById("main-content"),
    footer: document.querySelector(".site-footer"),

    sectionCurrent: document.getElementById("section-current"),

    sections: [
      ...document.querySelectorAll(".story")
    ],

    menuLinks: [
      ...document.querySelectorAll(".menu-nav a")
    ],

    sectionButtons: [
      ...document.querySelectorAll(".section-nav-button")
    ]
  };

  state.sections = dom.sections;

  /*
   * --------------------------------------------------------------------------
   * UTILITIES
   * --------------------------------------------------------------------------
   */

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "summary",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function getFocusable(container) {
    if (!container) return [];

    return [...container.querySelectorAll(focusableSelector)]
      .filter((element) => {
        const style = window.getComputedStyle(element);

        return (
          !element.hasAttribute("disabled") &&
          !element.hasAttribute("inert") &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      });
  }

  function isTextEntryTarget(element) {
    if (!element) return false;

    return (
      element.matches("input, textarea, select") ||
      element.isContentEditable
    );
  }

  function prefersReducedMotion() {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  function setHash(id) {
    if (!id) return;

    const currentHash = window.location.hash.slice(1);

    if (currentHash === id) return;

    history.replaceState(
      null,
      "",
      `#${encodeURIComponent(id)}`
    );
  }

  /*
   * --------------------------------------------------------------------------
   * ACCESSIBILITY / MENU
   * --------------------------------------------------------------------------
   */

  function initMenuSemantics() {
    if (!dom.menu) return;

    dom.menu.setAttribute("role", "dialog");
    dom.menu.setAttribute("aria-modal", "true");
    dom.menu.setAttribute(
      "aria-label",
      "Navigazione principale"
    );

    dom.menu.setAttribute("aria-hidden", "true");
    dom.menu.setAttribute("inert", "");

    if (dom.menuToggle) {
      dom.menuToggle.setAttribute(
        "aria-controls",
        dom.menu.id
      );

      dom.menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      dom.menuToggle.setAttribute(
        "aria-label",
        "Apri menu"
      );
    }
  }

  function setMenuState(
    open,
    { restoreFocus = true } = {}
  ) {
    if (!dom.menu || !dom.menuToggle) return;

    if (open === state.menuOpen) return;

    if (open) {
      state.lastFocused = document.activeElement;
      state.menuOpen = true;

      dom.menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      dom.menuToggle.setAttribute(
        "aria-label",
        "Chiudi menu"
      );

      if (dom.menuToggleLabel) {
        dom.menuToggleLabel.textContent = "CHIUDI";
      }

      dom.menu.classList.add("is-open");
      dom.menu.removeAttribute("inert");
      dom.menu.setAttribute("aria-hidden", "false");

      dom.body.classList.add("menu-open");

      stopStandbyTimer();

      requestAnimationFrame(() => {
        const focusables = getFocusable(dom.menu);
        const first = focusables[0];

        if (first) {
          first.focus({
            preventScroll: true
          });
        }
      });

      return;
    }

    state.menuOpen = false;

    dom.menu.classList.remove("is-open");
    dom.menu.setAttribute("aria-hidden", "true");
    dom.menu.setAttribute("inert", "");

    dom.menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    dom.menuToggle.setAttribute(
      "aria-label",
      "Apri menu"
    );

    if (dom.menuToggleLabel) {
      dom.menuToggleLabel.textContent = "MENU";
    }

    dom.body.classList.remove("menu-open");

    startStandbyTimer();

    if (
      restoreFocus &&
      state.lastFocused &&
      document.contains(state.lastFocused) &&
      typeof state.lastFocused.focus === "function"
    ) {
      requestAnimationFrame(() => {
        state.lastFocused.focus({
          preventScroll: true
        });
      });
    }

    state.lastFocused = null;
  }

  function handleMenuKeydown(event) {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = getFocusable(dom.menu);

    if (!focusables.length) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  function initMenu() {
    if (!dom.menu || !dom.menuToggle) return;

    initMenuSemantics();

    dom.menuToggle.addEventListener(
      "click",
      () => {
        setMenuState(!state.menuOpen);
      }
    );

    dom.menu.addEventListener(
      "keydown",
      handleMenuKeydown
    );

    dom.menuLinks.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const target =
            link.getAttribute("href");

          if (
            !target ||
            !target.startsWith("#")
          ) {
            setMenuState(false);
            return;
          }

          const id = target.slice(1);

          const index =
            state.sections.findIndex(
              (section) =>
                section.id === id
            );

          if (index === -1) {
            setMenuState(false);
            return;
          }

          event.preventDefault();

          setMenuState(false, {
            restoreFocus: false
          });

          window.setTimeout(() => {
            scrollToSection(index);
          }, 20);
        }
      );
    });
  }

  /*
   * --------------------------------------------------------------------------
   * SECTION TRACKING
   * --------------------------------------------------------------------------
   */

  function updateSectionUI(index) {
    const section = state.sections[index];

    if (!section) return;

    if (state.activeIndex === index) {
      updateSectionButtons();
      return;
    }

    state.activeIndex = index;

    if (dom.sectionCurrent) {
      dom.sectionCurrent.textContent =
        String(index + 1).padStart(2, "0");
    }

    dom.sections.forEach(
      (item, itemIndex) => {
        item.toggleAttribute(
          "data-active",
          itemIndex === index
        );
      }
    );

    dom.menuLinks.forEach((link) => {
      const target =
        link.getAttribute("href");

      const isCurrent =
        target === `#${section.id}`;

      if (isCurrent) {
        link.setAttribute(
          "aria-current",
          "location"
        );
      } else {
        link.removeAttribute(
          "aria-current"
        );
      }
    });

    updateSectionButtons();
  }

  function updateSectionButtons() {
    if (!dom.sectionButtons.length) return;

    dom.sectionButtons.forEach(
      (button) => {
        const direction =
          button.dataset.direction;

        const disabled =
          direction === "prev"
            ? state.activeIndex <= 0
            : state.activeIndex >=
              state.sections.length - 1;

        button.disabled = disabled;

        button.setAttribute(
          "aria-disabled",
          String(disabled)
        );
      }
    );
  }

  function calculateActiveSection() {
    const sections = state.sections;

    if (!sections.length) return;

    const marker =
      window.innerHeight *
      (window.innerWidth <= 700
        ? 0.32
        : 0.42);

    let containingIndex = -1;

    for (
      let index = 0;
      index < sections.length;
      index += 1
    ) {
      const rect =
        sections[index].getBoundingClientRect();

      if (
        rect.top <= marker &&
        rect.bottom > marker
      ) {
        containingIndex = index;
        break;
      }
    }

    if (containingIndex !== -1) {
      updateSectionUI(containingIndex);
      return;
    }

    let closestIndex =
      state.activeIndex;

    let closestDistance =
      Infinity;

    sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        const distance =
          Math.abs(
            rect.top - marker
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    );

    updateSectionUI(closestIndex);
  }

  function handleScroll() {
    if (!CONFIG.scrollTrackingRaf) {
      calculateActiveSection();
      return;
    }

    if (state.ticking) return;

    state.ticking = true;

    requestAnimationFrame(() => {
      calculateActiveSection();
      state.ticking = false;
    });
  }

  function scrollToSection(
    index,
    behavior = "smooth"
  ) {
    const sections = state.sections;

    if (!sections.length) return;

    const nextIndex = Math.max(
      0,
      Math.min(
        index,
        sections.length - 1
      )
    );

    const section =
      sections[nextIndex];

    state.isNavigating = true;

    updateSectionUI(nextIndex);
    setHash(section.id);

    section.scrollIntoView({
      behavior:
        state.reducedMotion ||
        prefersReducedMotion()
          ? "auto"
          : behavior,
      block: "start"
    });

    clearTimeout(
      state.navigationTimer
    );

    state.navigationTimer =
      window.setTimeout(() => {
        state.isNavigating = false;
        calculateActiveSection();
      }, CONFIG.navigationReleaseDelay);
  }

  function handleHash({
    initial = false
  } = {}) {
    let hash = "";

    try {
      hash = decodeURIComponent(
        window.location.hash.slice(1)
      );
    } catch {
      hash = "";
    }

    if (!hash) {
      updateSectionUI(0);

      if (initial) {
        window.scrollTo({
          top: 0,
          behavior: "auto"
        });
      }

      return;
    }

    const index =
      state.sections.findIndex(
        (section) =>
          section.id === hash
      );

    if (index === -1) {
      if (initial) {
        history.replaceState(
          null,
          "",
          window.location.pathname +
            window.location.search
        );

        updateSectionUI(0);
      }

      return;
    }

    state.activeIndex = index;

    requestAnimationFrame(() => {
      state.sections[index].scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      updateSectionUI(index);
    });
  }

  function initSectionNavigation() {
    dom.sectionButtons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            if (button.disabled) return;

            const direction =
              button.dataset.direction;

            const delta =
              direction === "prev"
                ? -1
                : 1;

            scrollToSection(
              state.activeIndex +
                delta
            );
          }
        );
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (state.menuOpen) return;

        if (
          isTextEntryTarget(
            event.target
          )
        ) {
          return;
        }

        if (
          event.key === "ArrowDown"
        ) {
          event.preventDefault();

          scrollToSection(
            state.activeIndex + 1
          );
        }

        if (
          event.key === "ArrowUp"
        ) {
          event.preventDefault();

          scrollToSection(
            state.activeIndex - 1
          );
        }
      }
    );
  }

  /*
   * --------------------------------------------------------------------------
   * STANDBY
   * --------------------------------------------------------------------------
   */

  function stopStandbyTimer() {
    clearTimeout(
      state.standbyTimer
    );

    state.standbyTimer = null;
  }

  function showStandby() {
    if (!dom.standby) return;
    if (state.menuOpen) return;
    if (document.hidden) return;
    if (state.reducedMotion) return;

    state.standbyVisible = true;

    dom.standby.classList.add(
      "is-visible"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function hideStandby() {
    if (!dom.standby) return;

    state.standbyVisible = false;

    dom.standby.classList.remove(
      "is-visible"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function startStandbyTimer() {
    stopStandbyTimer();

    if (
      state.reducedMotion ||
      state.menuOpen ||
      document.hidden
    ) {
      return;
    }

    state.standbyTimer =
      window.setTimeout(
        showStandby,
        CONFIG.standbyDelay
      );
  }

  function wakeFromStandby() {
    hideStandby();
    startStandbyTimer();
  }

  function initStandby() {
    if (!dom.standby) return;

    dom.standby.setAttribute(
      "aria-hidden",
      "true"
    );

    const activityEvents = [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart"
    ];

    activityEvents.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          () => {
            if (
              state.standbyWakeTimer
            ) {
              return;
            }

            wakeFromStandby();

            state.standbyWakeTimer =
              window.setTimeout(() => {
                state.standbyWakeTimer =
                  null;
              },
              CONFIG.standbyWakeThrottle);
          },
          {
            passive: true
          }
        );
      }
    );

    window.addEventListener(
      "pointermove",
      () => {
        if (
          state.standbyWakeTimer ||
          state.menuOpen
        ) {
          return;
        }

        wakeFromStandby();

        state.standbyWakeTimer =
          window.setTimeout(() => {
            state.standbyWakeTimer =
              null;
          },
          CONFIG.standbyWakeThrottle);
      },
      {
        passive: true
      }
    );

    startStandbyTimer();
  }

  /*
   * --------------------------------------------------------------------------
   * LOADER
   * --------------------------------------------------------------------------
   */

  function initLoader() {
    if (!dom.loader) return;

    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;

      if (
        !window.gsap ||
        state.reducedMotion
      ) {
        dom.loader.style.opacity = "0";
        dom.loader.style.visibility =
          "hidden";
        dom.loader.style.pointerEvents =
          "none";

        return;
      }

      gsap.to(dom.loader, {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          dom.loader.style.pointerEvents =
            "none";
        }
      });
    };

    window.addEventListener(
      "load",
      finish,
      {
        once: true
      }
    );

    window.setTimeout(
      finish,
      CONFIG.loaderFailsafe
    );
  }

  /*
   * --------------------------------------------------------------------------
   * SVG HELPERS
   * --------------------------------------------------------------------------
   */

  function prepareStroke(element) {
    if (
      !element ||
      typeof element.getTotalLength !==
        "function"
    ) {
      return 1000;
    }

    const length =
      element.getTotalLength();

    gsap.set(element, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    return length;
  }

  function drawElements(
    timeline,
    elements,
    position,
    options = {}
  ) {
    const {
      duration = 0.55,
      stagger = 0.05,
      ease = "power2.out"
    } = options;

    const validElements =
      [...elements].filter(
        (element) =>
          element &&
          typeof element.getTotalLength ===
            "function"
      );

    validElements.forEach(
      (element) => {
        prepareStroke(element);
      }
    );

    if (!validElements.length) {
      return;
    }

    timeline.to(
      validElements,
      {
        strokeDashoffset: 0,
        duration,
        stagger,
        ease
      },
      position
    );
  }

  /*
   * --------------------------------------------------------------------------
   * GSAP
   * --------------------------------------------------------------------------
   */

  function initGsap() {
    if (
      state.reducedMotion ||
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      return;
    }

    gsap.registerPlugin(
      ScrollTrigger
    );

    if (state.gsapMM) {
      state.gsapMM.revert();
    }

    state.gsapMM =
      gsap.matchMedia();

    /*
     * ----------------------------------------------------------------------
     * ALL DEVICES
     * ----------------------------------------------------------------------
     */

    state.gsapMM.add(
      "(prefers-reduced-motion: no-preference)",
      () => {

        /*
         * Generic story reveal.
         *
         * Science is deliberately excluded because its text enters
         * only after the visual system has completed.
         */
        gsap.utils.toArray(
          ".story-copy > *, .section-heading > *, .narrative-copy > *"
        )
          .filter(
            (element) =>
              !element.closest(
                ".science-text-block"
              )
          )
          .forEach((element) => {
            gsap.fromTo(
              element,
              {
                y: 28,
                opacity: 0
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 82%",
                  once: true
                }
              }
            );
          });

        /*
         * ------------------------------------------------------------------
         * SPORT
         *
         * Fotogramma impossibile:
         * posizione → posizione → sovrapposizione → traiettoria.
         * ------------------------------------------------------------------
         */

        const sportFrames =
          gsap.utils.toArray(
            ".sport-motion-frame"
          );

        const sportTraces =
          gsap.utils.toArray(
            ".sport-motion-trace"
          );

        if (
          sportFrames.length &&
          document.querySelector(
            ".story-sport"
          )
        ) {
          const sportTimeline =
            gsap.timeline({
              scrollTrigger: {
                trigger:
                  ".story-sport",
                start: "top 68%",
                once: true
              }
            });

          sportFrames.forEach(
            (frame, index) => {
              const segments =
                frame.querySelectorAll(
                  ".motion-segment"
                );

              const points =
                frame.querySelectorAll(
                  ".motion-point"
                );

              gsap.set(frame, {
                opacity: 0,
                transformOrigin:
                  "center center"
              });

              gsap.set(points, {
                scale: 0.35,
                transformOrigin:
                  "center center"
              });

              segments.forEach(
                (segment) => {
                  prepareStroke(
                    segment
                  );
                }
              );

              const revealPosition =
                index === 0
                  ? 0
                  : `+=${0.18}`;

              sportTimeline.to(
                frame,
                {
                  opacity:
                    index ===
                    sportFrames.length - 1
                      ? 0.82
                      : 0.55,
                  duration: 0.28,
                  ease: "power2.out"
                },
                revealPosition
              );

              sportTimeline.to(
                segments,
                {
                  strokeDashoffset: 0,
                  duration: 0.48,
                  stagger: 0.045,
                  ease: "power2.inOut"
                },
                "<"
              );

              sportTimeline.to(
                points,
                {
                  scale: 1,
                  duration: 0.34,
                  stagger: 0.035,
                  ease: "power2.out"
                },
                "<0.08"
              );

              if (
                index <
                sportFrames.length - 1
              ) {
                sportTimeline.to(
                  frame,
                  {
                    opacity: 0.22,
                    duration: 0.28,
                    ease: "power2.out"
                  },
                  ">"
                );
              }
            }
          );

          prepareStroke(
            sportTraces[0]
          );

          prepareStroke(
            sportTraces[1]
          );

          prepareStroke(
            sportTraces[2]
          );

          sportTimeline.to(
            sportTraces,
            {
              strokeDashoffset: 0,
              duration: 0.9,
              stagger: 0.13,
              ease: "power2.inOut"
            },
            ">"
          );
        }

        /*
         * ------------------------------------------------------------------
         * SCIENZE MOTORIE
         *
         * CORPO → CONNESSIONI → SISTEMA → RETE → TESTO
         * ------------------------------------------------------------------
         */

        const scienceSection =
          document.querySelector(
            ".story-science"
          );

        const scienceText =
          document.querySelector(
            ".science-text-block"
          );

        const scienceBodySegments =
          gsap.utils.toArray(
            ".science-body-segment"
          );

        const scienceBodyNodes =
          gsap.utils.toArray(
            ".science-body-node"
          );

        const scienceConnections =
          gsap.utils.toArray(
            ".science-connection"
          );

        const scienceField =
          gsap.utils.toArray(
            ".science-field-ring"
          );

        const scienceNetworkLinks =
          gsap.utils.toArray(
            ".science-network-link"
          );

        const scienceNetworkNodes =
          gsap.utils.toArray(
            ".science-network-node"
          );

        if (
          scienceSection &&
          scienceText
        ) {
          const scienceTimeline =
            gsap.timeline({
              scrollTrigger: {
                trigger:
                  scienceSection,
                start: "top 68%",
                once: true
              }
            });

          /*
           * CORPO
           */
          gsap.set(
            scienceBodyNodes,
            {
              scale: 0,
              transformOrigin:
                "center center"
            }
          );

          scienceBodySegments.forEach(
            (segment) => {
              prepareStroke(
                segment
              );
            }
          );

          scienceTimeline.to(
            scienceBodyNodes,
            {
              scale: 1,
              duration: 0.42,
              stagger: 0.055,
              ease: "power2.out"
            }
          );

          scienceTimeline.to(
            scienceBodySegments,
            {
              strokeDashoffset: 0,
              duration: 0.75,
              stagger: 0.055,
              ease: "power2.inOut"
            },
            "<0.08"
          );

          /*
           * CONNESSIONI
           */
          scienceConnections.forEach(
            (connection) => {
              prepareStroke(
                connection
              );
            }
          );

          scienceTimeline.to(
            scienceConnections,
            {
              strokeDashoffset: 0,
              duration: 0.65,
              stagger: 0.06,
              ease: "power2.inOut"
            },
            "+=0.08"
          );

          /*
           * SISTEMA
           */
          gsap.set(
            scienceField,
            {
              opacity: 0,
              scale: 0.82,
              transformOrigin:
                "center center"
            }
          );

          scienceTimeline.to(
            scienceField,
            {
              opacity: 0.12,
              scale: 1,
              duration: 0.8,
              stagger: 0.08,
              ease: "power2.out"
            },
            "+=0.05"
          );

          /*
           * RETE
           */
          scienceNetworkLinks.forEach(
            (link) => {
              prepareStroke(link);
            }
          );

          gsap.set(
            scienceNetworkNodes,
            {
              scale: 0,
              transformOrigin:
                "center center"
            }
          );

          scienceTimeline.to(
            scienceNetworkLinks,
            {
              strokeDashoffset: 0,
              duration: 0.85,
              stagger: 0.06,
              ease: "power2.inOut"
            },
            "+=0.05"
          );

          scienceTimeline.to(
            scienceNetworkNodes,
            {
              scale: 1,
              duration: 0.5,
              stagger: 0.045,
              ease: "power2.out"
            },
            "<0.1"
          );

          /*
           * TESTO — entra solo dopo il sistema.
           */
          const scienceTextElements =
            scienceText.querySelectorAll(
              ".section-heading > *, .narrative-copy > p, .practice-theory"
            );

          gsap.set(
            scienceTextElements,
            {
              opacity: 0,
              y: 26
            }
          );

          scienceTimeline.to(
            scienceTextElements,
            {
              opacity: 1,
              y: 0,
              duration: 0.72,
              stagger: 0.1,
              ease: "power3.out"
            },
            "+=0.2"
          );
        }

        /*
         * Education network
         */
        gsap.utils.toArray(
          ".edu-path"
        ).forEach((path) => {
          const length =
            prepareStroke(path);

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger:
                ".story-education",
              start: "top 70%",
              once: true
            }
          });
        });

        gsap.fromTo(
          ".edu-node",
          {
            scale: 0,
            transformOrigin:
              "center"
          },
          {
            scale: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger:
                ".story-education",
              start: "top 65%",
              once: true
            }
          }
        );

        /*
         * Network
         */
        gsap.fromTo(
          ".network-link",
          {
            strokeDasharray: 1800,
            strokeDashoffset: 1800
          },
          {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger:
                ".story-connect",
              start: "top 70%",
              once: true
            }
          }
        );

        gsap.fromTo(
          ".network-node",
          {
            scale: 0,
            transformOrigin:
              "center"
          },
          {
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger:
                ".story-connect",
              start: "top 65%",
              once: true
            }
          }
        );

        /*
         * Presence
         */
        gsap.fromTo(
          ".presence-main, .presence-branch",
          {
            strokeDasharray: 1200,
            strokeDashoffset: 1200
          },
          {
            strokeDashoffset: 0,
            duration: 1.8,
            stagger: 0.1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger:
                ".story-from-here",
              start: "top 70%",
              once: true
            }
          }
        );

        gsap.fromTo(
          ".presence-node, .presence-end",
          {
            scale: 0,
            transformOrigin:
              "center"
          },
          {
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger:
                ".story-from-here",
              start: "top 65%",
              once: true
            }
          }
        );

        /*
         * Portrait
         */
        gsap.fromTo(
          ".person-frame",
          {
            clipPath:
              "inset(0 0 100% 0)"
          },
          {
            clipPath:
              "inset(0 0 0% 0)",
            duration: 1.3,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger:
                ".story-person",
              start: "top 65%",
              once: true
            }
          }
        );

        /*
         * Firma autoriale
         */
        document
          .querySelectorAll(
            ".author-signature"
          )
          .forEach((signature) => {

            const strokes =
              signature.querySelectorAll(
                ".signature-stroke, .signature-flourish"
              );

            strokes.forEach(
              (stroke) => {
                prepareStroke(
                  stroke
                );
              }
            );

            const trigger =
              signature.closest(
                ".story-person"
              ) ||
              signature.closest(
                ".site-footer"
              ) ||
              signature;

            const timeline =
              gsap.timeline({
                scrollTrigger: {
                  trigger,
                  start:
                    trigger.classList.contains(
                      "site-footer"
                    )
                      ? "top 88%"
                      : "top 68%",
                  once: true
                }
              });

            timeline.to(
              strokes,
              {
                strokeDashoffset: 0,
                duration: 1.35,
                stagger: 0.075,
                ease: "power2.inOut"
              }
            );
          });

        /*
         * Contact
         */
        gsap.fromTo(
          ".contact-lead",
          {
            y: 45,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger:
                ".story-contact",
              start: "top 70%",
              once: true
            }
          }
        );

        return () => {};
      }
    );

    /*
     * ----------------------------------------------------------------------
     * DESKTOP / LARGE TABLET
     * ----------------------------------------------------------------------
     */

    state.gsapMM.add(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      () => {

        /*
         * CRT
         */
        const crt =
          document.querySelector(
            ".crt-monitor"
          );

        if (crt) {
          gsap.fromTo(
            crt,
            {
              opacity: 0,
              y: 35,
              rotateY: -13
            },
            {
              opacity: 1,
              y: 0,
              rotateY: -7,
              duration: 1.25,
              ease: "power3.out",
              scrollTrigger: {
                trigger:
                  ".story-computer",
                start: "top 70%",
                once: true
              }
            }
          );
        }

        /*
         * Management
         */
        gsap.fromTo(
          ".management-line",
          {
            strokeDasharray: 1000,
            strokeDashoffset: 1000
          },
          {
            strokeDashoffset: 0,
            duration: 1.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger:
                ".story-management",
              start: "top 65%",
              once: true
            }
          }
        );

        gsap.fromTo(
          ".management-core, .management-end",
          {
            scale: 0,
            transformOrigin:
              "center"
          },
          {
            scale: 1,
            duration: 0.65,
            stagger: 0.15,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger:
                ".story-management",
              start: "top 60%",
              once: true
            }
          }
        );

        /*
         * Digital transformation
         */
        const digitalTimeline =
          gsap.timeline({
            scrollTrigger: {
              trigger:
                ".story-digital",
              start: "top bottom",
              end: "center center",
              scrub: 1.2
            }
          });

        digitalTimeline
          .fromTo(
            ".digital-device",
            {
              scale: 0.88,
              y: 70,
              rotateY: -15
            },
            {
              scale: 1,
              y: 0,
              rotateY: -7,
              ease: "none"
            }
          )
          .fromTo(
            ".digital-grid",
            {
              opacity: 0.1,
              scale: 0.8
            },
            {
              opacity: 0.8,
              scale: 1.15,
              ease: "none"
            },
            "<"
          )
          .fromTo(
            ".digital-emergence",
            {
              opacity: 0,
              x: 80,
              scale: 0.7
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              ease: "none"
            },
            "<0.1"
          );

        /*
         * Today
         */
        const todayWords =
          gsap.utils.toArray(
            ".today-method span"
          );

        todayWords.forEach(
          (word, index) => {

            gsap.fromTo(
              word,
              {
                opacity: 0.12,
                x: 50
              },
              {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: word,
                  start: "top 82%",
                  end: "top 55%",
                  scrub: 0.7
                }
              }
            );

            if (
              index <
              todayWords.length - 1
            ) {
              gsap.to(word, {
                opacity: 0.25,
                scrollTrigger: {
                  trigger:
                    todayWords[
                      index + 1
                    ],
                  start: "top 68%",
                  end: "top 48%",
                  scrub: 0.5
                }
              });
            }
          }
        );

        /*
         * Objective
         */
        const objectiveProgress =
          document.querySelector(
            ".objective-progress"
          );

        const objectiveBase =
          document.querySelector(
            ".objective-base"
          );

        if (
          objectiveProgress &&
          objectiveBase
        ) {
          const length =
            typeof objectiveBase.getTotalLength ===
            "function"
              ? objectiveBase.getTotalLength()
              : 1000;

          gsap.set(
            objectiveProgress,
            {
              strokeDasharray: length,
              strokeDashoffset: length
            }
          );

          gsap.to(
            objectiveProgress,
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger:
                  ".story-objective",
                start: "top 70%",
                end: "bottom 60%",
                scrub: 1
              }
            }
          );
        }

        return () => {};
      }
    );

    /*
     * ----------------------------------------------------------------------
     * MOBILE
     * ----------------------------------------------------------------------
     */

    state.gsapMM.add(
      "(max-width: 700px) and (prefers-reduced-motion: no-preference)",
      () => {

        gsap.utils.toArray(
          ".digital-device, .crt-monitor"
        ).forEach((element) => {

          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 24
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 82%",
                once: true
              }
            }
          );

        });

        /*
         * SVG più leggere su mobile.
         */
        gsap.utils.toArray(
          ".management-line"
        ).forEach((path) => {

          const length =
            typeof path.getTotalLength ===
            "function"
              ? path.getTotalLength()
              : 1000;

          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
          });

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: path,
              start: "top 82%",
              once: true
            }
          });

        });

        /*
         * Il network mantiene un'unica animazione:
         * non viene duplicato dal blocco desktop.
         */
        gsap.utils.toArray(
          ".network-link"
        ).forEach((path) => {

          const length =
            typeof path.getTotalLength ===
            "function"
              ? path.getTotalLength()
              : 1000;

          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
          });

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: path,
              start: "top 82%",
              once: true
            }
          });

        });

        return () => {};
      }
    );

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  /*
   * --------------------------------------------------------------------------
   * VISIBILITY / PAGE LIFECYCLE
   * --------------------------------------------------------------------------
   */

  function initVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          stopStandbyTimer();
          return;
        }

        startStandbyTimer();

        if (window.ScrollTrigger) {
          window.setTimeout(() => {
            window.ScrollTrigger.refresh();
            calculateActiveSection();
          }, 120);
        }
      }
    );

    window.addEventListener(
      "pageshow",
      () => {
        if (window.ScrollTrigger) {
          window.setTimeout(() => {
            window.ScrollTrigger.refresh();
          }, 80);
        }

        calculateActiveSection();
        startStandbyTimer();
      }
    );
  }

  /*
   * --------------------------------------------------------------------------
   * RESIZE
   * --------------------------------------------------------------------------
   */

  function initResize() {
    let resizeTimer;

    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          window.setTimeout(() => {

            if (window.ScrollTrigger) {
              window.ScrollTrigger.refresh();
            }

            calculateActiveSection();

          }, CONFIG.resizeDebounce);
      },
      {
        passive: true
      }
    );
  }

  /*
   * --------------------------------------------------------------------------
   * REDUCED MOTION LIVE UPDATE
   * --------------------------------------------------------------------------
   */

  function initReducedMotionListener() {
    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const update = (event) => {

      state.reducedMotion =
        event.matches;

      if (state.reducedMotion) {

        stopStandbyTimer();
        hideStandby();

        if (state.gsapMM) {
          state.gsapMM.revert();
          state.gsapMM = null;
        }

        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }

      } else {

        startStandbyTimer();
        initGsap();

      }
    };

    if (
      typeof mediaQuery.addEventListener ===
      "function"
    ) {
      mediaQuery.addEventListener(
        "change",
        update
      );
    } else {
      mediaQuery.addListener(update);
    }
  }

  /*
   * --------------------------------------------------------------------------
   * INIT
   * --------------------------------------------------------------------------
   */

  function init() {

    initMenu();
    initSectionNavigation();
    initStandby();
    initLoader();
    initVisibility();
    initResize();
    initReducedMotionListener();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true
      }
    );

    window.addEventListener(
      "hashchange",
      () => {
        handleHash();
      }
    );

    handleHash({
      initial: true
    });

    calculateActiveSection();

    window.setTimeout(
      initGsap,
      50
    );
  }

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
