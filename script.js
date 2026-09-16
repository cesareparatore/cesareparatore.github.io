/* =========================================================
   CESARE PARATORE — MOVIMENTO / CON DIREZIONE.
   MASTER JS
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     00 — ROOT / STATE
     ======================================================= */

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  const state = {
    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    finePointer: window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches,

    menuOpen: false,
    ticking: false,
    heroFrame: null,

    pointer: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false
    },

    lastScrollY: window.scrollY,
    activeSection: "01"
  };


  /* =======================================================
     01 — DOM
     ======================================================= */

  const intro = document.querySelector("#intro");
  const header = document.querySelector("#site-header");
  const menu = document.querySelector("#site-menu");
  const menuToggle = document.querySelector("#menu-toggle");
  const progress = document.querySelector("#scroll-progress");
  const sectionIndex = document.querySelector("#section-index");

  const hero = document.querySelector("#inizio");
  const heroGrid = document.querySelector(".hero-grid");
  const heroOrbitA = document.querySelector(".hero-orbit-a");
  const heroOrbitB = document.querySelector(".hero-orbit-b");
  const heroNode = document.querySelector(".hero-node");

  const sections = [
    ...document.querySelectorAll(
      "main > section[data-section]"
    )
  ];

  const menuLinks = [
    ...document.querySelectorAll(
      ".site-menu a[href]"
    )
  ];

  const directionItems = [
    ...document.querySelectorAll(
      ".direction-item[data-direction]"
    )
  ];

  const samePageLinks = [
    ...document.querySelectorAll(
      'a[href^="#"]'
    )
  ];


  /* =======================================================
     02 — HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (start, end, amount) =>
    start + (end - start) * amount;

  const isModifiedClick = (event) =>
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey;

  const getScrollRoot = () =>
    document.scrollingElement || document.documentElement;

  const getScrollProgress = () => {
    const scrollRoot = getScrollRoot();

    const maxScroll =
      scrollRoot.scrollHeight -
      window.innerHeight;

    if (maxScroll <= 0) return 0;

    return clamp(
      window.scrollY / maxScroll,
      0,
      1
    );
  };

  const getHeaderOffset = () =>
    header
      ? header.getBoundingClientRect().height
      : 0;


  /* =======================================================
     03 — LOADER
     ======================================================= */

  let loaderHidden = false;

  const hideLoader = () => {
    if (!intro || loaderHidden) return;

    loaderHidden = true;

    intro.classList.add("is-hidden");

    window.setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
    }, 900);
  };

  /*
   * Safety fallback:
   * if something external prevents the normal load event,
   * the site must never remain blocked behind the loader.
   */
  window.setTimeout(hideLoader, 3200);

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 350);
  } else {
    window.addEventListener(
      "load",
      () => {
        window.setTimeout(
          hideLoader,
          state.reducedMotion ? 0 : 650
        );
      },
      { once: true }
    );
  }


  /* =======================================================
     04 — HEADER
     ======================================================= */

  const updateHeader = () => {
    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 24
    );
  };


  /* =======================================================
     05 — SCROLL PROGRESS
     ======================================================= */

  const updateProgress = () => {
    if (!progress) return;

    const value = getScrollProgress();

    progress.style.transform =
      `scaleY(${value})`;
  };


  /* =======================================================
     06 — SECTION INDEX
     ======================================================= */

  const updateSectionIndex = (section) => {
    if (!sectionIndex || !section) return;

    const number =
      section.dataset.section || "01";

    const title =
      section.dataset.title || "";

    state.activeSection = number;

    sectionIndex.textContent =
      `${number} / 10`;

    if (title) {
      sectionIndex.setAttribute(
        "aria-label",
        `Sezione ${number}: ${title}`
      );
    }
  };

  /*
   * Threshold-based detection instead of arbitrary
   * scroll positions. The active section is the section
   * occupying the visual center of the viewport.
   */
  const updateActiveSection = () => {
    if (!sections.length) return;

    const viewportCenter =
      window.innerHeight * 0.48;

    let closest = sections[0];
    let closestDistance = Infinity;

    sections.forEach((section) => {
      const rect =
        section.getBoundingClientRect();

      const center =
        rect.top + rect.height / 2;

      const distance =
        Math.abs(center - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = section;
      }
    });

    updateSectionIndex(closest);
  };


  /* =======================================================
     07 — SCROLL RAF
     ======================================================= */

  const updateScroll = () => {
    state.ticking = false;

    updateHeader();
    updateProgress();
    updateActiveSection();

    state.lastScrollY = window.scrollY;
  };

  const requestScrollUpdate = () => {
    if (state.ticking) return;

    state.ticking = true;

    window.requestAnimationFrame(
      updateScroll
    );
  };

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollUpdate,
    { passive: true }
  );


  /* =======================================================
     08 — REVEAL SYSTEM
     ======================================================= */

  const revealElements = [
    ...document.querySelectorAll(
      "[data-reveal]"
    )
  ];

  /*
   * Important:
   * the CSS keeps everything visible until this observer
   * is successfully initialized. This prevents a JS error
   * from producing an inaccessible blank page.
   */
  if (
    !state.reducedMotion &&
    revealElements.length &&
    "IntersectionObserver" in window
  ) {
    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
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
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

    root.classList.add("reveal-ready");
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }


  /* =======================================================
     09 — STAGGERED REVEAL
     ======================================================= */

  const staggerGroups = [
    ...document.querySelectorAll(
      ".trace-line, .visitor-doors"
    )
  ];

  staggerGroups.forEach((group) => {
    const children = [
      ...group.querySelectorAll(
        ".trace[data-reveal], .visitor-door"
      )
    ];

    children.forEach((child, index) => {
      child.style.setProperty(
        "--stagger-delay",
        `${index * 70}ms`
      );
    });
  });


  /* =======================================================
     10 — MENU
     ======================================================= */

  let previousFocus = null;

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  const getFocusableMenuElements = () => {
    if (!menu) return [];

    return [
      ...menu.querySelectorAll(
        focusableSelector
      )
    ].filter(
      (element) =>
        element.offsetParent !== null
    );
  };

  const openMenu = () => {
    if (!menu || !menuToggle || state.menuOpen) {
      return;
    }

    previousFocus =
      document.activeElement;

    state.menuOpen = true;

    menu.classList.add("is-open");
    body.classList.add("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    menu.removeAttribute("inert");

    window.setTimeout(() => {
      const focusable =
        getFocusableMenuElements();

      if (focusable[0]) {
        focusable[0].focus();
      }
    }, 80);
  };

  const closeMenu = () => {
    if (!menu || !menuToggle || !state.menuOpen) {
      return;
    }

    state.menuOpen = false;

    menu.classList.remove("is-open");
    body.classList.remove("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menu.setAttribute(
      "inert",
      ""
    );

    window.setTimeout(() => {
      if (
        previousFocus &&
        typeof previousFocus.focus === "function"
      ) {
        previousFocus.focus();
      } else {
        menuToggle.focus();
      }
    }, 500);
  };

  const toggleMenu = () => {
    if (state.menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener(
      "click",
      toggleMenu
    );
  }

  if (menu) {
    const backdrop =
      menu.querySelector(".menu-backdrop");

    if (backdrop) {
      backdrop.addEventListener(
        "click",
        closeMenu
      );
    }
  }

  menuLinks.forEach((link) => {
    link.addEventListener(
      "click",
      () => {
        closeMenu();
      }
    );
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (!state.menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable =
        getFocusableMenuElements();

      if (!focusable.length) return;

      const first = focusable[0];
      const last =
        focusable[focusable.length - 1];

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


  /* =======================================================
     11 — SAME PAGE NAVIGATION
     ======================================================= */

  samePageLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        if (isModifiedClick(event)) return;

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href === "#" ||
          href.length < 2
        ) {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        closeMenu();

        const targetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          getHeaderOffset();

        if (state.reducedMotion) {
          window.scrollTo(
            0,
            Math.max(0, targetTop)
          );
        } else {
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth"
          });
        }

        /*
         * Keep the URL meaningful without forcing
         * another navigation.
         */
        if (
          window.history &&
          window.history.pushState
        ) {
          window.history.pushState(
            null,
            "",
            href
          );
        }
      }
    );
  });


  /* =======================================================
     12 — HERO POINTER FIELD
     ======================================================= */

  const initHeroPointer = () => {
    if (
      !hero ||
      !state.finePointer ||
      state.reducedMotion
    ) {
      return;
    }

    const updatePointer = (event) => {
      const rect =
        hero.getBoundingClientRect();

      state.pointer.targetX =
        ((event.clientX - rect.left) / rect.width - 0.5);

      state.pointer.targetY =
        ((event.clientY - rect.top) / rect.height - 0.5);

      state.pointer.active = true;

      if (!state.heroFrame) {
        state.heroFrame =
          window.requestAnimationFrame(
            renderHeroPointer
          );
      }
    };

    const resetPointer = () => {
      state.pointer.targetX = 0;
      state.pointer.targetY = 0;
      state.pointer.active = false;

      if (!state.heroFrame) {
        state.heroFrame =
          window.requestAnimationFrame(
            renderHeroPointer
          );
      }
    };

    const renderHeroPointer = () => {
      state.heroFrame = null;

      state.pointer.x = lerp(
        state.pointer.x,
        state.pointer.targetX,
        0.085
      );

      state.pointer.y = lerp(
        state.pointer.y,
        state.pointer.targetY,
        0.085
      );

      const x = state.pointer.x;
      const y = state.pointer.y;

      if (heroGrid) {
        heroGrid.style.transform =
          `translate3d(${x * 18}px, ${y * 18}px, 0)`;
      }

      if (heroOrbitA) {
        heroOrbitA.style.transform =
          `translate(calc(-50% + ${x * 10}px), calc(-50% + ${y * 10}px)) rotate(-12deg)`;
      }

      if (heroOrbitB) {
        heroOrbitB.style.transform =
          `translate(calc(-50% - ${x * 16}px), calc(-50% - ${y * 16}px)) rotate(23deg)`;
      }

      if (heroNode) {
        heroNode.style.transform =
          `translate(calc(-50% + ${x * 8}px), calc(-50% + ${y * 8}px))`;
      }

      if (
        Math.abs(x - state.pointer.targetX) > 0.001 ||
        Math.abs(y - state.pointer.targetY) > 0.001
      ) {
        state.heroFrame =
          window.requestAnimationFrame(
            renderHeroPointer
          );
      }
    };

    hero.addEventListener(
      "pointermove",
      updatePointer,
      { passive: true }
    );

    hero.addEventListener(
      "pointerleave",
      resetPointer,
      { passive: true }
    );
  };

  initHeroPointer();


  /* =======================================================
     13 — FIVE DIRECTIONS INTERACTION
     ======================================================= */

  const setActiveDirection = (item) => {
    directionItems.forEach((direction) => {
      direction.classList.toggle(
        "is-active",
        direction === item
      );
    });
  };

  directionItems.forEach((item) => {
    item.addEventListener(
      "mouseenter",
      () => setActiveDirection(item)
    );

    item.addEventListener(
      "focus",
      () => setActiveDirection(item)
    );

    item.addEventListener(
      "mouseleave",
      () => {
        directionItems.forEach(
          (direction) =>
            direction.classList.remove(
              "is-active"
            )
        );
      }
    );

    item.addEventListener(
      "blur",
      () => {
        item.classList.remove(
          "is-active"
        );
      }
    );
  });


  /* =======================================================
     14 — MAGNETIC INTERACTION
     ======================================================= */

  const magneticElements = [
    ...document.querySelectorAll(
      ".contact-link, .visitor-door, .menu-toggle"
    )
  ];

  const initMagnetic = () => {
    if (
      !state.finePointer ||
      state.reducedMotion
    ) {
      return;
    }

    magneticElements.forEach((element) => {
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

          const strength =
            element.classList.contains(
              "contact-link"
            )
              ? 0.12
              : 0.07;

          element.style.transform =
            `translate(${x * strength}px, ${y * strength}px)`;
        },
        { passive: true }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          element.style.transform = "";
        },
        { passive: true }
      );
    });
  };

  initMagnetic();


  /* =======================================================
     15 — PAGE VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        if (state.heroFrame) {
          window.cancelAnimationFrame(
            state.heroFrame
          );

          state.heroFrame = null;
        }
      } else {
        requestScrollUpdate();
      }
    }
  );


  /* =======================================================
     16 — VIEW TRANSITIONS
     ======================================================= */

  const isSameOrigin = (url) =>
    url.origin === window.location.origin;

  const isDocumentNavigation = (url) =>
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search;

  const navigateWithTransition = (url) => {
    if (
      !document.startViewTransition ||
      state.reducedMotion
    ) {
      window.location.href = url.href;
      return;
    }

    document.startViewTransition(() => {
      window.location.href = url.href;
    });
  };

  document.addEventListener(
    "click",
    (event) => {
      if (isModifiedClick(event)) return;

      const link =
        event.target.closest("a[href]");

      if (!link) return;

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
        !isSameOrigin(url) ||
        !isDocumentNavigation(url)
      ) {
        return;
      }

      /*
       * Only intercept normal document links.
       * Download/external/custom browser behaviour
       * remains untouched.
       */
      if (
        link.hasAttribute("download") ||
        link.target === "_blank"
      ) {
        return;
      }

      event.preventDefault();

      closeMenu();
      navigateWithTransition(url);
    }
  );


  /* =======================================================
     17 — INITIAL STATE
     ======================================================= */

  if (menu) {
    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menu.setAttribute(
      "inert",
      ""
    );
  }

  if (menuToggle) {
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  /*
   * Initial synchronous state avoids a first-frame jump.
   */
  updateHeader();
  updateProgress();
  updateActiveSection();


  /* =======================================================
     18 — RESIZE / MEDIA QUERY CHANGES
     ======================================================= */

  const reducedMotionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const finePointerQuery =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

  const handleMotionPreference = (event) => {
    state.reducedMotion =
      event.matches;

    if (state.reducedMotion) {
      revealElements.forEach(
        (element) =>
          element.classList.add(
            "is-visible"
          )
      );

      root.classList.add(
        "reduced-motion"
      );
    } else {
      root.classList.remove(
        "reduced-motion"
      );
    }
  };

  const handlePointerPreference = (event) => {
    state.finePointer =
      event.matches;
  };

  if (
    typeof reducedMotionQuery.addEventListener ===
    "function"
  ) {
    reducedMotionQuery.addEventListener(
      "change",
      handleMotionPreference
    );
  } else {
    reducedMotionQuery.addListener(
      handleMotionPreference
    );
  }

  if (
    typeof finePointerQuery.addEventListener ===
    "function"
  ) {
    finePointerQuery.addEventListener(
      "change",
      handlePointerPreference
    );
  } else {
    finePointerQuery.addListener(
      handlePointerPreference
    );
  }


  /* =======================================================
     19 — HASH ON INITIAL LOAD
     ======================================================= */

  if (window.location.hash) {
    const target = document.querySelector(
      window.location.hash
    );

    if (target) {
      window.setTimeout(() => {
        const targetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          getHeaderOffset();

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "auto"
        });
      }, 100);
    }
  }


  /* =======================================================
     20 — FINAL READY STATE
     ======================================================= */

  root.classList.add("motion-ready");

})();
