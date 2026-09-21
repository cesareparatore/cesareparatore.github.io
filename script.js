(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE
     Movimento / Con Direzione
     Main interaction layer
     ========================================================= */

  const CFG = {
    loaderMin: 3200,
    loaderMax: 3800,
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

  /* =========================================================
     UTILITIES
     ========================================================= */

  const qs = (selector, scope = document) =>
    scope.querySelector(selector);

  const qsa = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hasFinePointer = () =>
    window.matchMedia("(pointer: fine)").matches;

  const canHover = () =>
    window.matchMedia("(hover: hover)").matches;

  const getRandom = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  /* =========================================================
     DOM
     ========================================================= */

  const dom = {
    html: document.documentElement,
    body: document.body,

    loader: qs(".page-loader"),

    transition: qs(".page-transition"),

    cursor: qs(".custom-cursor"),
    cursorDot: qs(".custom-cursor-dot"),
    cursorRing: qs(".custom-cursor-ring"),

    header: qs(".site-header"),
    brand: qs(".site-brand"),

    progressCurrent: qs("#progress-current"),
    progressFill: qs("#progress-fill"),
    progressPoint: qs("#progress-point"),

    previous: qs("#previous-section"),
    previousLabel: qs("#previous-section-label"),

    next: qs("#next-section"),
    nextLabel: qs("#next-section-label"),

    menuTrigger: qs(".menu-trigger"),
    menu: qs("#site-menu"),
    menuLinks: qsa(".site-menu-link"),

    sections: qsa(".home-section"),
    reveal: qsa(".reveal"),

    trajectoryLinks: qsa("[data-trajectory-node]"),
    networkNodes: qsa(".network-node"),

    magnetic: qsa(".magnetic"),

    standby: qs(".standby-screen")
  };

  /* =========================================================
     STATE
     ========================================================= */

  const st = {
    active: 0,

    menuOpen: false,
    menuReturn: null,

    reduced: prefersReducedMotion(),

    cursorEnabled:
      hasFinePointer() &&
      canHover() &&
      !prefersReducedMotion(),

    cursor: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      ringX: window.innerWidth / 2,
      ringY: window.innerHeight / 2
    },

    scroll: {
      y: window.scrollY,
      lastY: window.scrollY,
      direction: 0,
      ticking: false
    },

    trajectory: {
      current: 0,
      target: 0
    },

    magnetic: new WeakMap(),

    idleTimer: null,
    standbyOpen: false,

    loaderReleased: false,
    loaderReady: false,
    windowLoaded: document.readyState === "complete",

    resizeTimer: null,

    revealObserver: null,
    sectionObserver: null
  };

  /* =========================================================
     INITIAL DOCUMENT STATE
     ========================================================= */

  dom.html.classList.add("is-loading");

  /* =========================================================
     LOADER
     ========================================================= */

  function initLoader() {
    if (!dom.loader) {
      dom.html.classList.remove("is-loading");
      return;
    }

    const minimumDuration = getRandom(
      CFG.loaderMin,
      CFG.loaderMax
    );

    const startedAt = performance.now();

    const release = () => {
      if (st.loaderReleased) return;

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(
        0,
        minimumDuration - elapsed
      );

      window.setTimeout(() => {
        if (st.loaderReleased) return;

        st.loaderReleased = true;

        dom.loader.classList.add("is-hidden");
        dom.html.classList.remove("is-loading");
        dom.body.classList.remove("is-loading");

        window.setTimeout(() => {
          dom.loader?.setAttribute("aria-hidden", "true");
        }, 900);

        revealInitialContent();
        startStandbyTimer();
      }, remaining);
    };

    if (st.windowLoaded) {
      release();
    } else {
      window.addEventListener("load", () => {
        st.windowLoaded = true;
        release();
      }, { once: true });

      /*
       * Fallback: the page must never remain blocked forever
       * if a resource fails to fire the load event.
       */
      window.setTimeout(() => {
        release();
      }, CFG.loaderMax + 1000);
    }
  }

  function revealInitialContent() {
    const firstSection = dom.sections[0];

    if (firstSection) {
      firstSection.classList.add("is-active");
    }

    dom.reveal
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.9;
      })
      .forEach((element) => {
        element.classList.add("is-visible");
      });
  }

  /* =========================================================
     MENU
     ========================================================= */

  function menuOpen() {
    if (!dom.menu || st.menuOpen) return;

    st.menuOpen = true;
    st.menuReturn = document.activeElement;

    dom.body.classList.add("is-menu-open");

    dom.menu.classList.add("is-open");
    dom.menu.setAttribute("aria-hidden", "false");
    dom.menu.removeAttribute("inert");

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "true"
    );

    dom.menuTrigger?.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    resetStandbyTimer();

    window.setTimeout(() => {
      dom.menuLinks[0]?.focus();
    }, 180);
  }

  function menuClose(restoreFocus = true) {
    if (!dom.menu || !st.menuOpen) return;

    st.menuOpen = false;

    dom.body.classList.remove("is-menu-open");

    dom.menu.classList.remove("is-open");
    dom.menu.setAttribute("aria-hidden", "true");
    dom.menu.setAttribute("inert", "");

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "false"
    );

    dom.menuTrigger?.setAttribute(
      "aria-label",
      "Apri menu"
    );

    if (
      restoreFocus &&
      st.menuReturn instanceof HTMLElement
    ) {
      st.menuReturn.focus();
    }

    st.menuReturn = null;
  }

  function toggleMenu() {
    if (st.menuOpen) {
      menuClose();
    } else {
      menuOpen();
    }
  }

  function menuKeyboard(event) {
    if (!st.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      menuClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = dom.menuLinks.filter(
      (link) => !link.hasAttribute("aria-hidden")
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

  function menuInit() {
    if (!dom.menuTrigger || !dom.menu) return;

    dom.menuTrigger.addEventListener("click", toggleMenu);

    dom.menu.addEventListener("click", (event) => {
      if (event.target === dom.menu) {
        menuClose();
      }
    });

    dom.menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuClose(false);
      });
    });

    document.addEventListener("keydown", menuKeyboard);
  }

  /* =========================================================
     SECTION NAVIGATION
     ========================================================= */

  function getSectionTop(section) {
    if (!section) return 0;

    const rect = section.getBoundingClientRect();
    const headerHeight =
      dom.header?.offsetHeight || 0;

    return (
      window.scrollY +
      rect.top -
      headerHeight -
      CFG.navOffset
    );
  }

  function getSectionNumber(index) {
    return String(index + 1).padStart(2, "0");
  }

  function updateSectionHash(index) {
    const number = getSectionNumber(index);

    if (
      window.location.hash === `#${number}`
    ) {
      return;
    }

    try {
      history.replaceState(
        null,
        "",
        `#${number}`
      );
    } catch {
      /* no-op */
    }
  }

  function goTo(index, options = {}) {
    if (!dom.sections.length) return;

    const clamped = clamp(
      index,
      0,
      dom.sections.length - 1
    );

    const section = dom.sections[clamped];

    if (!section) return;

    const target = getSectionTop(section);

    const behavior =
      options.instant || st.reduced
        ? "auto"
        : "smooth";

    window.scrollTo({
      top: Math.max(0, target),
      behavior
    });

    st.active = clamped;

    updateProgress(clamped);
    updateSectionHash(clamped);
  }

  function updateProgress(index) {
    if (!dom.sections.length) return;

    const safeIndex = clamp(
      index,
      0,
      dom.sections.length - 1
    );

    const section =
      dom.sections[safeIndex];

    const title =
      section?.dataset.sectionTitle || "";

    const progress =
      dom.sections.length > 1
        ? safeIndex / (dom.sections.length - 1)
        : 0;

    if (dom.progressCurrent) {
      dom.progressCurrent.textContent = title;
    }

    if (dom.progressFill) {
      dom.progressFill.style.width =
        `${progress * 100}%`;
    }

    if (dom.progressPoint) {
      dom.progressPoint.style.left =
        `${progress * 100}%`;
    }

    const previousIndex =
      safeIndex - 1;

    const nextIndex =
      safeIndex + 1;

    /*
     * Previous
     */

    if (
      dom.previous &&
      dom.previousLabel
    ) {
      if (previousIndex >= 0) {
        dom.previous.classList.remove(
          "is-disabled"
        );

        dom.previous.removeAttribute(
          "aria-hidden"
        );

        dom.previous.removeAttribute(
          "tabindex"
        );

        dom.previous.href =
          `#${getSectionNumber(previousIndex)}`;

        dom.previousLabel.textContent =
          getSectionNumber(previousIndex);

        dom.previous.setAttribute(
          "aria-label",
          `Vai alla sezione ${getSectionNumber(previousIndex)}`
        );
      } else {
        dom.previous.classList.add(
          "is-disabled"
        );

        dom.previous.setAttribute(
          "aria-hidden",
          "true"
        );

        dom.previous.setAttribute(
          "tabindex",
          "-1"
        );

        dom.previous.href = "#01";
        dom.previousLabel.textContent = "";
      }
    }

    /*
     * Next
     */

    if (
      dom.next &&
      dom.nextLabel
    ) {
      if (
        nextIndex <
        dom.sections.length
      ) {
        dom.next.classList.remove(
          "is-disabled"
        );

        dom.next.removeAttribute(
          "aria-hidden"
        );

        dom.next.removeAttribute(
          "tabindex"
        );

        dom.next.href =
          `#${getSectionNumber(nextIndex)}`;

        dom.nextLabel.textContent =
          getSectionNumber(nextIndex);

        dom.next.setAttribute(
          "aria-label",
          `Vai alla sezione ${getSectionNumber(nextIndex)}`
        );
      } else {
        dom.next.classList.add(
          "is-disabled"
        );

        dom.next.setAttribute(
          "aria-hidden",
          "true"
        );

        dom.next.setAttribute(
          "tabindex",
          "-1"
        );

        dom.nextLabel.textContent = "";
      }
    }

    dom.sections.forEach(
      (item, itemIndex) => {
        item.classList.toggle(
          "is-active",
          itemIndex === safeIndex
        );
      }
    );
  }

  function detectActiveSection() {
    if (!dom.sections.length) return;

    const viewportPoint =
      window.scrollY +
      window.innerHeight * 0.42;

    let closestIndex = 0;
    let closestDistance = Infinity;

    dom.sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        const center =
          window.scrollY +
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            center - viewportPoint
          );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    );

    if (closestIndex !== st.active) {
      st.active = closestIndex;
      updateProgress(closestIndex);
    }
  }

  function navigationInit() {
    if (dom.previous) {
      dom.previous.addEventListener(
        "click",
        (event) => {
          if (st.active <= 0) {
            event.preventDefault();
            return;
          }

          event.preventDefault();
          goTo(st.active - 1);
        }
      );
    }

    if (dom.next) {
      dom.next.addEventListener(
        "click",
        (event) => {
          if (
            st.active >=
            dom.sections.length - 1
          ) {
            event.preventDefault();
            return;
          }

          event.preventDefault();
          goTo(st.active + 1);
        }
      );
    }

    if (dom.brand) {
      dom.brand.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          goTo(0);
        }
      );
    }

    /*
     * Handle #01, #02, etc. when a hash
     * is loaded directly.
     */

    const hash =
      window.location.hash
        .replace("#", "")
        .trim();

    if (/^\d{2}$/.test(hash)) {
      const index =
        Number(hash) - 1;

      if (
        index >= 0 &&
        index < dom.sections.length
      ) {
        window.setTimeout(() => {
          goTo(index, {
            instant: true
          });
        }, 100);
      }
    }
  }

  /* =========================================================
     SCROLL
     ========================================================= */

  function onScroll() {
    st.scroll.y = window.scrollY;

    if (
      st.scroll.y >
      st.scroll.lastY
    ) {
      st.scroll.direction = 1;
    } else if (
      st.scroll.y <
      st.scroll.lastY
    ) {
      st.scroll.direction = -1;
    }

    st.scroll.lastY = st.scroll.y;

    if (st.scroll.ticking) return;

    st.scroll.ticking = true;

    window.requestAnimationFrame(() => {
      detectActiveSection();
      updateTrajectoryDrift();

      st.scroll.ticking = false;
    });

    resetStandbyTimer();
  }

  function scrollInit() {
    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );
  }

  /* =========================================================
     REVEAL
     ========================================================= */

  function revealInit() {
    if (!dom.reveal.length) return;

    if (st.reduced) {
      dom.reveal.forEach((element) => {
        element.classList.add(
          "is-visible"
        );
      });

      return;
    }

    st.revealObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            st.revealObserver?.unobserve(
              entry.target
            );
          });
        },
        {
          threshold:
            CFG.revealThreshold,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    dom.reveal.forEach((element) => {
      st.revealObserver.observe(element);
    });
  }

  /* =========================================================
     TRAJECTORY
     ========================================================= */

  function updateTrajectoryDrift() {
    const maxScroll =
      Math.max(
        1,
        document.documentElement.scrollHeight -
          window.innerHeight
      );

    const progress = clamp(
      window.scrollY / maxScroll,
      0,
      1
    );

    st.trajectory.target =
      (progress - 0.5) *
      CFG.trajectoryDrift;

    if (st.reduced) {
      st.trajectory.current =
        st.trajectory.target;
    } else {
      st.trajectory.current +=
        (
          st.trajectory.target -
          st.trajectory.current
        ) *
        CFG.trajectoryLerp;
    }

    const value =
      st.trajectory.current.toFixed(2);

    document.documentElement.style.setProperty(
      "--trajectory-drift",
      `${value}px`
    );
  }

  function getTrajectoryKey(element) {
    return element?.dataset
      ?.trajectoryNode
      ?.trim()
      .toLowerCase();
  }

  function getNetworkNode(key) {
    if (!key) return null;

    return dom.networkNodes.find(
      (node) =>
        node.dataset.node
          ?.trim()
          .toLowerCase() === key
    );
  }

  function setTrajectoryActive(key, active) {
    const node =
      getNetworkNode(key);

    if (!node) return;

    node.classList.toggle(
      "is-highlighted",
      active
    );
  }

  function trajectoryInit() {
    dom.trajectoryLinks.forEach(
      (link) => {
        const key =
          getTrajectoryKey(link);

        if (!key) return;

        link.addEventListener(
          "pointerenter",
          () => {
            setTrajectoryActive(
              key,
              true
            );
          }
        );

        link.addEventListener(
          "pointerleave",
          () => {
            setTrajectoryActive(
              key,
              false
            );
          }
        );

        link.addEventListener(
          "focus",
          () => {
            setTrajectoryActive(
              key,
              true
            );
          }
        );

        link.addEventListener(
          "blur",
          () => {
            setTrajectoryActive(
              key,
              false
            );
          }
        );
      }
    );

    dom.networkNodes.forEach(
      (node) => {
        node.addEventListener(
          "pointerenter",
          () => {
            node.classList.add(
              "is-highlighted"
            );
          }
        );

        node.addEventListener(
          "pointerleave",
          () => {
            node.classList.remove(
              "is-highlighted"
            );
          }
        );
      }
    );
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */

  function cursorInit() {
    if (
      !st.cursorEnabled ||
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing
    ) {
      return;
    }

    dom.body.classList.add(
      "has-custom-cursor"
    );

    dom.cursor.classList.add(
      "is-enabled"
    );

    const pointerMove = (event) => {
      st.cursor.targetX = event.clientX;
      st.cursor.targetY = event.clientY;

      dom.cursorDot.style.transform =
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };

    window.addEventListener(
      "pointermove",
      pointerMove,
      { passive: true }
    );

    const loop = () => {
      st.cursor.x +=
        (
          st.cursor.targetX -
          st.cursor.x
        ) *
        CFG.cursorLerp;

      st.cursor.y +=
        (
          st.cursor.targetY -
          st.cursor.y
        ) *
        CFG.cursorLerp;

      st.cursor.ringX +=
        (
          st.cursor.x -
          st.cursor.ringX
        ) *
        CFG.cursorLerp;

      st.cursor.ringY +=
        (
          st.cursor.y -
          st.cursor.ringY
        ) *
        CFG.cursorLerp;

      dom.cursorRing.style.transform =
        `translate3d(${st.cursor.ringX}px, ${st.cursor.ringY}px, 0)`;

      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);

    const interactive = qsa(
      "a, button, [role='button'], input, textarea, select"
    );

    interactive.forEach((element) => {
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
    });

    document.addEventListener(
      "mouseleave",
      () => {
        dom.cursor.classList.add(
          "is-hidden"
        );
      }
    );

    document.addEventListener(
      "mouseenter",
      () => {
        dom.cursor.classList.remove(
          "is-hidden"
        );
      }
    );
  }

  /* =========================================================
     MAGNETIC ELEMENTS
     ========================================================= */

  function magneticInit() {
    if (
      !hasFinePointer() ||
      !canHover() ||
      st.reduced
    ) {
      return;
    }

    dom.magnetic.forEach(
      (element) => {
        const state = {
          x: 0,
          y: 0,
          targetX: 0,
          targetY: 0
        };

        st.magnetic.set(
          element,
          state
        );

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
              CFG.magneticRadius
            ) {
              state.targetX = 0;
              state.targetY = 0;
              return;
            }

            state.targetX =
              dx *
              CFG.magneticStrength;

            state.targetY =
              dy *
              CFG.magneticStrength;
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            state.targetX = 0;
            state.targetY = 0;
          }
        );
      }
    );

    const animate = () => {
      dom.magnetic.forEach(
        (element) => {
          const state =
            st.magnetic.get(element);

          if (!state) return;

          state.x +=
            (
              state.targetX -
              state.x
            ) *
            0.18;

          state.y +=
            (
              state.targetY -
              state.y
            ) *
            0.18;

          element.style.setProperty(
            "--magnetic-x",
            `${state.x.toFixed(2)}px`
          );

          element.style.setProperty(
            "--magnetic-y",
            `${state.y.toFixed(2)}px`
          );
        }
      );

      window.requestAnimationFrame(
        animate
      );
    };

    window.requestAnimationFrame(
      animate
    );
  }

  /* =========================================================
     PAGE TRANSITIONS
     ========================================================= */

  function isModifiedClick(event) {
    return (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    );
  }

  function isDownloadLink(link) {
    return (
      link.hasAttribute("download") ||
      /\.(pdf|zip|jpg|jpeg|png|webp|gif|svg|mp4|mp3)$/i.test(
        link.pathname
      )
    );
  }

  function isExternalLink(link) {
    return (
      link.origin !==
      window.location.origin
    );
  }

  function isHashLink(link) {
    const href =
      link.getAttribute("href");

    return (
      href &&
      href.startsWith("#")
    );
  }

  function transitionTo(url) {
    if (
      !dom.transition ||
      st.reduced
    ) {
      window.location.href = url;
      return;
    }

    dom.body.classList.add(
      "is-transitioning"
    );

    dom.transition.classList.add(
      "is-active"
    );

    window.setTimeout(() => {
      window.location.href = url;
    }, CFG.transitionMs);
  }

  function pageTransitionInit() {
    if (!dom.transition) return;

    dom.transition.classList.remove(
      "is-active"
    );

    const links = qsa(
      "a[href]"
    );

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          if (isModifiedClick(event)) {
            return;
          }

          if (
            link.target &&
            link.target !== "_self"
          ) {
            return;
          }

          if (isHashLink(link)) {
            return;
          }

          if (isDownloadLink(link)) {
            return;
          }

          if (isExternalLink(link)) {
            return;
          }

          const url =
            link.href;

          if (!url) return;

          event.preventDefault();

          if (st.menuOpen) {
            menuClose(false);
          }

          transitionTo(url);
        }
      );
    });

    window.addEventListener(
      "pageshow",
      () => {
        dom.transition.classList.remove(
          "is-active"
        );

        dom.body.classList.remove(
          "is-transitioning"
        );
      }
    );
  }

  /* =========================================================
     STANDBY
     ========================================================= */

  function openStandby() {
    if (
      !dom.standby ||
      st.standbyOpen ||
      st.menuOpen
    ) {
      return;
    }

    st.standbyOpen = true;

    dom.standby.classList.add(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );

    dom.standby.removeAttribute(
      "inert"
    );
  }

  function closeStandby() {
    if (
      !dom.standby ||
      !st.standbyOpen
    ) {
      return;
    }

    st.standbyOpen = false;

    dom.standby.classList.remove(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.standby.setAttribute(
      "inert",
      ""
    );
  }

  function resetStandbyTimer() {
    if (
      !dom.standby ||
      !st.loaderReleased
    ) {
      return;
    }

    closeStandby();

    if (st.idleTimer) {
      window.clearTimeout(
        st.idleTimer
      );
    }

    st.idleTimer =
      window.setTimeout(
        openStandby,
        CFG.standbyDelay
      );
  }

  function startStandbyTimer() {
    if (!dom.standby) return;

    resetStandbyTimer();
  }

  function standbyInit() {
    if (!dom.standby) return;

    const activityEvents = [
      "pointerdown",
      "keydown",
      "touchstart",
      "wheel"
    ];

    activityEvents.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          resetStandbyTimer,
          {
            passive: true
          }
        );
      }
    );

    window.addEventListener(
      "scroll",
      resetStandbyTimer,
      {
        passive: true
      }
    );

    dom.standby.addEventListener(
      "click",
      closeStandby
    );

    dom.standby.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          closeStandby();
          resetStandbyTimer();
        }
      }
    );
  }

  /* =========================================================
     RESIZE
     ========================================================= */

  function resizeInit() {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          st.resizeTimer
        );

        st.resizeTimer =
          window.setTimeout(
            () => {
              st.reduced =
                prefersReducedMotion();

              st.cursorEnabled =
                hasFinePointer() &&
                canHover() &&
                !st.reduced;

              detectActiveSection();
              updateTrajectoryDrift();
            },
            CFG.resizeDebounce
          );
      },
      { passive: true }
    );
  }

  /* =========================================================
     KEYBOARD SECTION NAVIGATION
     ========================================================= */

  function keyboardNavigationInit() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          st.menuOpen ||
          st.standbyOpen
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

        if (event.key === "ArrowDown") {
          event.preventDefault();

          if (
            st.active <
            dom.sections.length - 1
          ) {
            goTo(st.active + 1);
          }
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();

          if (st.active > 0) {
            goTo(st.active - 1);
          }
        }

        if (event.key === "PageDown") {
          event.preventDefault();

          if (
            st.active <
            dom.sections.length - 1
          ) {
            goTo(st.active + 1);
          }
        }

        if (event.key === "PageUp") {
          event.preventDefault();

          if (st.active > 0) {
            goTo(st.active - 1);
          }
        }
      }
    );
  }

  /* =========================================================
     INITIAL STATE
     ========================================================= */

  function setInitialState() {
    if (!dom.sections.length) return;

    st.active = 0;

    updateProgress(0);

    updateTrajectoryDrift();

    dom.sections[0]?.classList.add(
      "is-active"
    );

    if (dom.menu) {
      dom.menu.setAttribute(
        "aria-hidden",
        "true"
      );

      dom.menu.setAttribute(
        "inert",
        ""
      );
    }

    if (dom.menuTrigger) {
      dom.menuTrigger.setAttribute(
        "aria-expanded",
        "false"
      );

      dom.menuTrigger.setAttribute(
        "aria-label",
        "Apri menu"
      );
    }

    if (dom.standby) {
      dom.standby.setAttribute(
        "aria-hidden",
        "true"
      );

      dom.standby.setAttribute(
        "inert",
        ""
      );
    }
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    setInitialState();

    initLoader();

    menuInit();

    navigationInit();

    scrollInit();

    revealInit();

    trajectoryInit();

    cursorInit();

    magneticInit();

    pageTransitionInit();

    standbyInit();

    resizeInit();

    keyboardNavigationInit();

    detectActiveSection();

    updateTrajectoryDrift();
  }

  /*
   * Script is loaded at the end of the document / defer.
   * DOM should already exist, but this guard keeps the file
   * safe if the loading strategy changes later.
   */

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
