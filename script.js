(() => {
  "use strict";

  /*
   * CESARE PARATORE
   * MOVIMENTO / CON DIREZIONE.
   *
   * script.js — V2
   *
   * Principi:
   * - progressive enhancement
   * - nessuna dipendenza esterna
   * - animazioni via requestAnimationFrame
   * - rispetto di prefers-reduced-motion
   * - navigazione da tastiera
   * - focus management
   * - IntersectionObserver per reveal e capitoli
   * - nessuna manipolazione continua del layout
   */


  /* =========================================================
     01 — ROOT / CAPABILITIES
     ========================================================= */

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const finePointerQuery = window.matchMedia(
    "(pointer: fine)"
  );

  const reducedMotion = () => reducedMotionQuery.matches;


  /* =========================================================
     02 — DOM
     ========================================================= */

  const intro = document.getElementById("intro");

  const header = document.getElementById("site-header");

  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("site-menu");
  const menuBackdrop = menu?.querySelector(".menu-backdrop");
  const menuPanel = menu?.querySelector(".menu-panel");

  const scrollProgress = document.getElementById("scroll-progress");
  const sectionIndex = document.getElementById("section-index");

  const hero = document.querySelector(".hero");
  const heroOrbitA = document.querySelector(".hero-orbit-a");
  const heroOrbitB = document.querySelector(".hero-orbit-b");
  const heroNode = document.querySelector(".hero-node");

  const directionItems = [
    ...document.querySelectorAll(".direction-item")
  ];

  const revealItems = [
    ...document.querySelectorAll("[data-reveal]")
  ];

  const sections = [
    ...document.querySelectorAll("[data-section]")
  ];

  const year = document.getElementById("year");


  /* =========================================================
     03 — UTILITIES
     ========================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const isVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  };


  const getFocusable = (container) => {
    if (!container) return [];

    return [
      ...container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ].filter(isVisible);
  };


  /* =========================================================
     04 — CURRENT YEAR
     ========================================================= */

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }


  /* =========================================================
     05 — INTRO / LOADER
     ========================================================= */

  let introTimer = null;

  const closeIntro = () => {
    if (!intro || intro.dataset.closed === "true") {
      return;
    }

    intro.dataset.closed = "true";
    intro.setAttribute("aria-hidden", "true");

    root.classList.add("intro-complete");

    const delay = reducedMotion() ? 0 : 520;

    window.setTimeout(() => {
      intro.hidden = true;
    }, delay);
  };


  if (intro) {
    introTimer = window.setTimeout(
      closeIntro,
      reducedMotion() ? 650 : 1900
    );
  }


  /* =========================================================
     06 — HEADER / SCROLL STATE
     ========================================================= */

  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      scrollHeight > 0
        ? clamp(scrollTop / scrollHeight, 0, 1)
        : 0;

    if (scrollProgress) {
      scrollProgress.style.transform =
        `scaleY(${progress})`;
    }

    if (header) {
      header.classList.toggle(
        "is-scrolled",
        scrollTop > 48
      );
    }

    scrollTicking = false;
  };


  const requestScrollUI = () => {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(updateScrollUI);
  };


  window.addEventListener(
    "scroll",
    requestScrollUI,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollUI,
    { passive: true }
  );

  updateScrollUI();


  /* =========================================================
     07 — SECTION INDEX
     ========================================================= */

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio - a.intersectionRatio
        );

      if (!visibleSections.length) return;

      const activeSection =
        visibleSections[0].target;

      const number =
        activeSection.dataset.section || "01";

      const total =
        String(sections.length).padStart(2, "0");

      if (sectionIndex) {
        sectionIndex.textContent =
          `${number} / ${total}`;
      }

      sections.forEach((section) => {
        section.classList.toggle(
          "is-current",
          section === activeSection
        );
      });
    },
    {
      threshold: [0.2, 0.45, 0.65],
      rootMargin: "-10% 0px -35% 0px"
    }
  );


  sections.forEach((section) => {
    sectionObserver.observe(section);
  });


  /* =========================================================
     08 — MENU
     ========================================================= */

  let menuOpen = false;
  let lastFocusedElement = null;

  const openMenu = () => {
    if (!menu || !menuToggle || menuOpen) {
      return;
    }

    menuOpen = true;
    lastFocusedElement = document.activeElement;

    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    menu.removeAttribute("inert");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Chiudi il menu"
    );

    root.classList.add("menu-open");
    body.classList.add("menu-open");

    const focusable = getFocusable(menu);

    if (focusable.length) {
      window.requestAnimationFrame(() => {
        focusable[0].focus();
      });
    }
  };


  const closeMenu = ({
    restoreFocus = true
  } = {}) => {
    if (!menu || !menuToggle || !menuOpen) {
      return;
    }

    menuOpen = false;

    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Apri il menu"
    );

    root.classList.remove("menu-open");
    body.classList.remove("menu-open");

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      window.requestAnimationFrame(() => {
        lastFocusedElement.focus();
      });
    }
  };


  if (menu) {
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
  }


  menuToggle?.addEventListener("click", () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });


  menuBackdrop?.addEventListener(
    "click",
    () => closeMenu()
  );


  menu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu({
        restoreFocus: false
      });
    });
  });


  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusable(menu);

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

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
  });


  /* =========================================================
     09 — HERO PARALLAX
     ========================================================= */

  let pointerX = 0;
  let pointerY = 0;

  let currentX = 0;
  let currentY = 0;

  let parallaxFrame = null;

  const resetHeroParallax = () => {
    pointerX = 0;
    pointerY = 0;

    currentX = 0;
    currentY = 0;

    if (heroOrbitA) {
      heroOrbitA.style.transform = "";
    }

    if (heroOrbitB) {
      heroOrbitB.style.transform = "";
    }

    if (heroNode) {
      heroNode.style.transform = "";
    }
  };


  const renderHeroParallax = () => {
    parallaxFrame = null;

    if (
      reducedMotion() ||
      !finePointerQuery.matches ||
      !hero
    ) {
      resetHeroParallax();
      return;
    }

    const smoothing = 0.075;

    currentX +=
      (pointerX - currentX) * smoothing;

    currentY +=
      (pointerY - currentY) * smoothing;

    const x = currentX;
    const y = currentY;

    if (heroOrbitA) {
      heroOrbitA.style.transform =
        `translate3d(${x * 0.65}px, ${y * 0.65}px, 0)`;
    }

    if (heroOrbitB) {
      heroOrbitB.style.transform =
        `translate3d(${x * -0.45}px, ${y * -0.45}px, 0)`;
    }

    if (heroNode) {
      heroNode.style.transform =
        `translate3d(${x * 1.15}px, ${y * 1.15}px, 0)`;
    }

    parallaxFrame =
      window.requestAnimationFrame(
        renderHeroParallax
      );
  };


  const handlePointerMove = (event) => {
    if (
      reducedMotion() ||
      !finePointerQuery.matches ||
      !hero
    ) {
      return;
    }

    const rect = hero.getBoundingClientRect();

    if (
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return;
    }

    const relativeX =
      (event.clientX - rect.left) / rect.width - 0.5;

    const relativeY =
      (event.clientY - rect.top) / rect.height - 0.5;

    const limit = 16;

    pointerX = relativeX * limit;
    pointerY = relativeY * limit;

    if (!parallaxFrame) {
      parallaxFrame =
        window.requestAnimationFrame(
          renderHeroParallax
        );
    }
  };


  const handlePointerLeave = () => {
    resetHeroParallax();

    if (parallaxFrame) {
      window.cancelAnimationFrame(
        parallaxFrame
      );

      parallaxFrame = null;
    }
  };


  if (hero) {
    hero.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    hero.addEventListener(
      "pointerleave",
      handlePointerLeave,
      { passive: true }
    );
  }


  /* =========================================================
     10 — DIRECTIONS INTERACTION
     ========================================================= */

  const clearDirectionState = () => {
    directionItems.forEach((item) => {
      item.classList.remove("is-active");
    });
  };


  directionItems.forEach((item) => {

    item.addEventListener("mouseenter", () => {
      clearDirectionState();
      item.classList.add("is-active");
    });


    item.addEventListener("focusin", () => {
      clearDirectionState();
      item.classList.add("is-active");
    });


    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-active");
    });


    item.addEventListener("focusout", () => {
      item.classList.remove("is-active");
    });

  });


  const directionObserver = new IntersectionObserver(
    (entries) => {

      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio -
            a.intersectionRatio
        );

      if (!visible.length) return;

      const active =
        visible[0].target;

      clearDirectionState();
      active.classList.add("is-active");
    },
    {
      threshold: 0.65,
      rootMargin: "-15% 0px -15% 0px"
    }
  );


  directionItems.forEach((item) => {
    directionObserver.observe(item);
  });


  /* =========================================================
     11 — REVEAL SYSTEM
     ========================================================= */

  if (
    "IntersectionObserver" in window &&
    revealItems.length
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "is-revealed"
            );

            observer.unobserve(
              entry.target
            );

          });

        },
        {
          threshold: reducedMotion() ? 0.05 : 0.18,
          rootMargin: "0px 0px -8% 0px"
        }
      );


    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });

  } else {

    revealItems.forEach((item) => {
      item.classList.add("is-revealed");
    });

  }


  /* =========================================================
     12 — INTERNAL ANCHORS
     ========================================================= */

  const prefersNativeSmoothScroll =
    !reducedMotion();


  const getAnchorTarget = (href) => {
    if (!href || href === "#") {
      return null;
    }

    if (!href.startsWith("#")) {
      return null;
    }

    const id =
      decodeURIComponent(
        href.slice(1)
      );

    if (!id) return null;

    return document.getElementById(id);
  };


  const focusTarget = (target) => {
    if (!target) return;

    const hadTabIndex =
      target.hasAttribute("tabindex");

    if (!hadTabIndex) {
      target.setAttribute(
        "tabindex",
        "-1"
      );
    }

    target.focus({
      preventScroll: true
    });

    if (!hadTabIndex) {
      window.setTimeout(() => {
        target.removeAttribute("tabindex");
      }, 1000);
    }
  };


  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener("click", (event) => {

        const target =
          getAnchorTarget(
            link.getAttribute("href")
          );

        if (!target) return;

        event.preventDefault();

        const headerHeight =
          header?.offsetHeight || 0;

        const targetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          16;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior:
            prefersNativeSmoothScroll
              ? "smooth"
              : "auto"
        });

        history.pushState(
          null,
          "",
          `#${target.id}`
        );

        window.setTimeout(() => {
          focusTarget(target);
        }, reducedMotion() ? 0 : 450);

      });

    });


  /* =========================================================
     13 — CLOSE MENU WHEN ESCAPE / HASH NAVIGATION
     ========================================================= */

  window.addEventListener("hashchange", () => {

    if (menuOpen) {
      closeMenu({
        restoreFocus: false
      });
    }

  });


  /* =========================================================
     14 — VIEWPORT / VISIBILITY
     ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {
        if (parallaxFrame) {
          window.cancelAnimationFrame(
            parallaxFrame
          );

          parallaxFrame = null;
        }

        return;
      }

      requestScrollUI();

    }
  );


  /* =========================================================
     15 — REDUCED MOTION CHANGES
     ========================================================= */

  const handleMotionPreferenceChange = () => {

    if (reducedMotion()) {
      resetHeroParallax();

      if (parallaxFrame) {
        window.cancelAnimationFrame(
          parallaxFrame
        );

        parallaxFrame = null;
      }

    }

  };


  if (
    typeof reducedMotionQuery.addEventListener ===
    "function"
  ) {

    reducedMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );

  } else if (
    typeof reducedMotionQuery.addListener ===
    "function"
  ) {

    reducedMotionQuery.addListener(
      handleMotionPreferenceChange
    );

  }


  /* =========================================================
     16 — FOCUS VISIBILITY
     ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Tab") {
        root.classList.add("keyboard-user");
      }

    },
    { passive: true }
  );


  document.addEventListener(
    "pointerdown",
    () => {
      root.classList.remove("keyboard-user");
    },
    { passive: true }
  );


  /* =========================================================
     17 — ESCAPE FROM OPEN UI
     ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        menuOpen
      ) {
        closeMenu();
      }

    }
  );


  /* =========================================================
     18 — RESIZE SAFETY
     ========================================================= */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {

      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(() => {

          resetHeroParallax();
          requestScrollUI();

        }, 120);

    },
    { passive: true }
  );


  /* =========================================================
     19 — INITIAL STATE
     ========================================================= */

  document.body.classList.add(
    "site-ready"
  );

  directionItems[0]?.classList.add(
    "is-active"
  );

  updateScrollUI();


  /* =========================================================
     20 — CLEANUP ON PAGE UNLOAD
     ========================================================= */

  window.addEventListener(
    "pagehide",
    () => {

      if (introTimer) {
        window.clearTimeout(
          introTimer
        );
      }

      if (parallaxFrame) {
        window.cancelAnimationFrame(
          parallaxFrame
        );
      }

    },
    { passive: true }
  );

})();
