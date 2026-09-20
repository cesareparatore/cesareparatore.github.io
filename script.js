/* ============================================================
   MOVIMENTO / CON DIREZIONE
   EXPERIENCE ENGINE
   ============================================================ */

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const CONFIG = {
    loaderMaxWait: 4200,
    loaderMinimum: 900,
    idleDelay: 18000,
    scrollEndDelay: 120,
    magneticMax: 4,
    magneticRadius: 90
  };

  const DOM = {
    body: document.body,
    html: document.documentElement,

    loader: document.getElementById("loader"),

    header: document.getElementById("site-header"),
    progressCurrent: document.getElementById("progress-current"),
    progressFill: document.getElementById("progress-fill"),
    progressPoint: document.getElementById("progress-point"),

    previous: document.getElementById("previous-section"),
    previousLabel: document.getElementById("previous-section-label"),
    next: document.getElementById("next-section"),
    nextLabel: document.getElementById("next-section-label"),

    menuTrigger: document.getElementById("menu-trigger"),
    menu: document.getElementById("site-menu"),
    menuLinks: [...document.querySelectorAll("[data-menu-link]")],

    idleMark: document.getElementById("idle-mark"),

    sections: [...document.querySelectorAll("[data-chapter]")],
    cover: document.getElementById("cover")
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  const STATE = {
    currentIndex: 0,
    currentProgress: 0,
    targetScroll: 0,
    scrollY: window.scrollY,
    viewportHeight: window.innerHeight,
    ticking: false,
    scrolling: false,
    menuOpen: false,
    idleTimer: null,
    scrollEndTimer: null,
    lastInteraction: performance.now()
  };

  /* ==========================================================
     HELPERS
     ========================================================== */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const prefersMotion = () =>
    !prefersReducedMotion.matches;

  const getSectionTop = (section) => {
    const rect = section.getBoundingClientRect();
    return rect.top + window.scrollY;
  };

  const getSectionProgress = (section) => {
    const rect = section.getBoundingClientRect();
    const height = Math.max(rect.height, 1);

    return clamp(
      (window.innerHeight * 0.48 - rect.top) / height
    );
  };

  const setCssProgress = (section, progress) => {
    section.style.setProperty(
      "--local-progress",
      progress.toFixed(4)
    );
  };

  const safeFocus = (element) => {
    if (!element) return;

    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  };

  /* ==========================================================
     LOADER
     ========================================================== */

  const loader = {
    startedAt: performance.now(),
    finished: false,

    finish() {
      if (this.finished) return;
      this.finished = true;

      const elapsed = performance.now() - this.startedAt;
      const delay = prefersMotion()
        ? Math.max(0, CONFIG.loaderMinimum - elapsed)
        : 80;

      window.setTimeout(() => {
        DOM.loader?.classList.add("is-hidden");

        window.setTimeout(() => {
          if (DOM.loader) {
            DOM.loader.hidden = true;
          }
        }, prefersMotion() ? 850 : 100);
      }, delay);
    }
  };

  const loaderFallback = window.setTimeout(
    () => loader.finish(),
    CONFIG.loaderMaxWait
  );

  if (document.readyState === "complete") {
    window.setTimeout(() => {
      clearTimeout(loaderFallback);
      loader.finish();
    }, 50);
  } else {
    window.addEventListener(
      "load",
      () => {
        clearTimeout(loaderFallback);
        loader.finish();
      },
      { once: true }
    );
  }

  /* ==========================================================
     CHAPTER STATE
     ========================================================== */

  const updateNavigation = () => {
    const index = STATE.currentIndex;
    const current = DOM.sections[index];

    if (!current) return;

    const title =
      current.dataset.title ||
      "MOVIMENTO / CON DIREZIONE";

    DOM.progressCurrent.textContent = title;

    const total = DOM.sections.length;

    const globalProgress =
      total <= 1
        ? 0
        : clamp(
            (index + STATE.currentProgress) /
            total
          );

    DOM.progressFill.style.width =
      `${globalProgress * 100}%`;

    DOM.progressPoint.style.left =
      `${globalProgress * 100}%`;

    const previousIndex = index - 1;
    const nextIndex = index + 1;

    if (previousIndex >= 0) {
      const previous = DOM.sections[previousIndex];

      DOM.previous.href =
        `#${previous.id}`;

      DOM.previousLabel.textContent =
        previous.dataset.chapter || "";

      DOM.previous.classList.remove("is-disabled");
      DOM.previous.removeAttribute("aria-hidden");
      DOM.previous.removeAttribute("tabindex");
      DOM.previous.setAttribute(
        "aria-label",
        `Vai alla sezione ${previous.dataset.chapter}`
      );
    } else {
      DOM.previous.href = "#cover";
      DOM.previousLabel.textContent = "";
      DOM.previous.classList.add("is-disabled");
      DOM.previous.setAttribute("aria-hidden", "true");
      DOM.previous.setAttribute("tabindex", "-1");
    }

    if (nextIndex < total) {
      const next = DOM.sections[nextIndex];

      DOM.next.href =
        `#${next.id}`;

      DOM.nextLabel.textContent =
        next.dataset.chapter || "";

      DOM.next.classList.remove("is-disabled");
      DOM.next.setAttribute(
        "aria-label",
        `Vai alla sezione ${next.dataset.chapter}`
      );
    } else {
      DOM.next.href = "#footer";
      DOM.nextLabel.textContent = "";
      DOM.next.classList.add("is-disabled");
      DOM.next.setAttribute("aria-hidden", "true");
      DOM.next.setAttribute("tabindex", "-1");
    }
  };

  const updateChapterState = () => {
    const viewportCenter =
      window.innerHeight * 0.5;

    let bestIndex = 0;
    let bestDistance = Infinity;

    DOM.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      const sectionCenter =
        rect.top + rect.height * 0.5;

      const distance =
        Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    STATE.currentIndex = bestIndex;

    DOM.sections.forEach((section, index) => {
      const progress = getSectionProgress(section);

      setCssProgress(section, progress);

      section.toggleAttribute(
        "data-active",
        index === bestIndex
      );
    });

    STATE.currentProgress =
      getSectionProgress(
        DOM.sections[bestIndex]
      );

    updateNavigation();
  };

  /* ==========================================================
     CENTRAL FRAME
     ========================================================== */

  const render = () => {
    STATE.ticking = false;

    if (STATE.menuOpen) return;

    STATE.scrollY = window.scrollY;

    updateChapterState();

    DOM.body.style.setProperty(
      "--scroll-progress",
      clamp(
        STATE.scrollY /
        Math.max(
          document.documentElement.scrollHeight -
          window.innerHeight,
          1
        )
      ).toFixed(4)
    );
  };

  const requestRender = () => {
    if (STATE.ticking) return;

    STATE.ticking = true;
    requestAnimationFrame(render);
  };

  /* ==========================================================
     SCROLL
     ========================================================== */

  const onScroll = () => {
    STATE.scrolling = true;

    resetIdle();

    if (STATE.scrollEndTimer) {
      clearTimeout(STATE.scrollEndTimer);
    }

    STATE.scrollEndTimer = window.setTimeout(() => {
      STATE.scrolling = false;
    }, CONFIG.scrollEndDelay);

    requestRender();
  };

  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );

  /* ==========================================================
     RESIZE
     ========================================================== */

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = window.setTimeout(() => {
      STATE.viewportHeight =
        window.innerHeight;

      requestRender();
    }, 80);
  });

  /* ==========================================================
     INTERSECTION OBSERVER
     SEMANTIC STATE SUPPORT
     ========================================================== */

  if ("IntersectionObserver" in window) {
    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.toggleAttribute(
              "data-near",
              entry.isIntersecting
            );
          });

          requestRender();
        },
        {
          rootMargin: "20% 0px 20% 0px",
          threshold: 0
        }
      );

    DOM.sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /* ==========================================================
     ANCHOR NAVIGATION
     ========================================================== */

  const getTargetElement = (href) => {
    if (!href || !href.startsWith("#")) {
      return null;
    }

    return document.getElementById(
      href.slice(1)
    );
  };

  const navigateTo = (element) => {
    if (!element) return;

    const top =
      getSectionTop(element);

    window.scrollTo({
      top,
      behavior: prefersMotion()
        ? "smooth"
        : "auto"
    });
  };

  const handleInternalLink = (event) => {
    const href =
      event.currentTarget.getAttribute("href");

    const target =
      getTargetElement(href);

    if (!target) return;

    event.preventDefault();

    closeMenu({
      restoreFocus: false
    });

    navigateTo(target);

    if (window.history?.pushState) {
      window.history.pushState(
        null,
        "",
        href
      );
    }
  };

  [
    DOM.previous,
    DOM.next,
    DOM.menuTrigger
  ].forEach((element) => {
    if (!element) return;
  });

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const target =
            getTargetElement(
              link.getAttribute("href")
            );

          if (!target) return;

          if (
            link.hasAttribute("data-menu-link")
          ) {
            event.preventDefault();

            closeMenu({
              restoreFocus: false
            });

            navigateTo(target);

            if (window.history?.pushState) {
              window.history.pushState(
                null,
                "",
                `#${target.id}`
              );
            }

            return;
          }

          handleInternalLink(event);
        }
      );
    });

  /* ==========================================================
     DEEP LINK / HASH
     ========================================================== */

  const resolveInitialHash = () => {
    const hash = window.location.hash;

    if (!hash) {
      requestRender();
      return;
    }

    const target =
      getTargetElement(hash);

    if (!target) {
      requestRender();
      return;
    }

    window.setTimeout(() => {
      navigateTo(target);
      requestRender();
    }, 80);
  };

  window.addEventListener(
    "popstate",
    () => {
      resolveInitialHash();
    }
  );

  window.addEventListener(
    "hashchange",
    () => {
      resolveInitialHash();
    }
  );

  /* ==========================================================
     MENU
     ========================================================== */

  let menuLastFocused = null;

  const setMenuAccessibility = (open) => {
    DOM.menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    if (open) {
      DOM.menu.removeAttribute("inert");
    } else {
      DOM.menu.setAttribute(
        "inert",
        ""
      );
    }

    DOM.menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    DOM.menuTrigger.setAttribute(
      "aria-label",
      open ? "Chiudi menu" : "Apri menu"
    );
  };

  const openMenu = () => {
    if (STATE.menuOpen) return;

    menuLastFocused =
      document.activeElement;

    STATE.menuOpen = true;

    DOM.body.classList.add(
      "is-menu-open"
    );

    setMenuAccessibility(true);

    resetIdle();

    window.setTimeout(() => {
      const first =
        DOM.menu.querySelector(
          "[data-menu-link]"
        );

      safeFocus(first);
    }, 50);
  };

  const closeMenu = ({
    restoreFocus = true
  } = {}) => {
    if (!STATE.menuOpen) return;

    STATE.menuOpen = false;

    DOM.body.classList.remove(
      "is-menu-open"
    );

    setMenuAccessibility(false);

    if (
      restoreFocus &&
      menuLastFocused &&
      typeof menuLastFocused.focus === "function"
    ) {
      safeFocus(menuLastFocused);
    }

    menuLastFocused = null;

    requestRender();
  };

  DOM.menuTrigger.addEventListener(
    "click",
    () => {
      if (STATE.menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    }
  );

  /* ==========================================================
     MENU FOCUS TRAP
     ========================================================== */

  DOM.menu.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Tab" ||
        !STATE.menuOpen
      ) {
        return;
      }

      const focusable =
        [
          ...DOM.menu.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ].filter(
          (element) =>
            !element.hasAttribute("disabled")
        );

      if (!focusable.length) return;

      const first = focusable[0];
      const last =
        focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        safeFocus(last);
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        safeFocus(first);
      }
    }
  );

  /* ==========================================================
     MAGNETIC
     ========================================================== */

  const magneticElements = [
    ...document.querySelectorAll(".magnetic")
  ];

  if (
    !isTouch &&
    prefersMotion()
  ) {
    magneticElements.forEach((element) => {
      const reset = () => {
        element.style.setProperty(
          "--magnetic-x",
          "0px"
        );

        element.style.setProperty(
          "--magnetic-y",
          "0px"
        );
      };

      element.addEventListener(
        "pointermove",
        (event) => {
          const rect =
            element.getBoundingClientRect();

          const x =
            event.clientX -
            (rect.left + rect.width / 2);

          const y =
            event.clientY -
            (rect.top + rect.height / 2);

          const distance =
            Math.hypot(x, y);

          if (
            distance >
            CONFIG.magneticRadius
          ) {
            reset();
            return;
          }

          const strength =
            1 -
            distance /
            CONFIG.magneticRadius;

          element.style.setProperty(
            "--magnetic-x",
            `${x * strength * .045}px`
          );

          element.style.setProperty(
            "--magnetic-y",
            `${y * strength * .045}px`
          );
        }
      );

      element.addEventListener(
        "pointerleave",
        reset
      );
    });
  }

  /* ==========================================================
     IDLE
     ========================================================== */

  const clearIdleTimer = () => {
    if (STATE.idleTimer) {
      clearTimeout(STATE.idleTimer);
      STATE.idleTimer = null;
    }
  };

  const resetIdle = () => {
    clearIdleTimer();

    DOM.body.classList.remove(
      "is-idle"
    );

    if (
      STATE.menuOpen ||
      prefersReducedMotion.matches
    ) {
      return;
    }

    STATE.lastInteraction =
      performance.now();

    STATE.idleTimer =
      window.setTimeout(() => {
        if (!STATE.menuOpen) {
          DOM.body.classList.add(
            "is-idle"
          );
        }
      }, CONFIG.idleDelay);
  };

  [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      resetIdle,
      {
        passive: true
      }
    );
  });

  /* ==========================================================
     REDUCED MOTION CHANGE
     ========================================================== */

  const handleMotionPreference = () => {
    if (prefersReducedMotion.matches) {
      DOM.body.classList.remove(
        "is-idle"
      );

      clearIdleTimer();

      if (DOM.loader) {
        DOM.loader.classList.add(
          "is-hidden"
        );
      }
    } else {
      resetIdle();
    }

    requestRender();
  };

  if (
    typeof prefersReducedMotion.addEventListener ===
    "function"
  ) {
    prefersReducedMotion.addEventListener(
      "change",
      handleMotionPreference
    );
  } else if (
    typeof prefersReducedMotion.addListener ===
    "function"
  ) {
    prefersReducedMotion.addListener(
      handleMotionPreference
    );
  }

  /* ==========================================================
     HISTORY INITIALIZATION
     ========================================================== */

  const preventBrowserJumpUntilReady = () => {
    if (!window.location.hash) return;

    const hash =
      window.location.hash;

    const target =
      getTargetElement(hash);

    if (!target) return;

    window.scrollTo(
      0,
      0
    );
  };

  preventBrowserJumpUntilReady();

  /* ==========================================================
     INITIAL STATE
     ========================================================== */

  setMenuAccessibility(false);

  DOM.sections.forEach(
    (section) => {
      setCssProgress(
        section,
        getSectionProgress(section)
      );
    }
  );

  requestRender();
  resetIdle();

  window.addEventListener(
    "load",
    () => {
      resolveInitialHash();
      requestRender();
    },
    { once: true }
  );

})();
