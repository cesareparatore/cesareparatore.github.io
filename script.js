/* =========================================================
   CESARE PARATORE — HOME
   script.js
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01 — DOM
     ======================================================= */

  const body = document.body;

  const loader = document.querySelector(".loader");

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuClose = document.querySelector("[data-menu-close]");
  const globalMenu = document.querySelector(".global-menu");
  const globalMenuLinks = document.querySelectorAll(".global-menu a");

  const pageTurn = document.querySelector(".page-turn");
  const pageTurnTitle = document.querySelector(".page-turn__title");
  const pageTurnMarker = document.querySelector(".page-turn__marker");
  const pageTurnPrev = document.querySelector("[data-page-prev]");
  const pageTurnNext = document.querySelector("[data-page-next]");

  const sections = Array.from(
    document.querySelectorAll("[data-section]")
  );

  const revealElements = Array.from(
    document.querySelectorAll(".reveal")
  );

  const standby = document.querySelector(".standby");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  /* =======================================================
     02 — STATE
     ======================================================= */

  let currentSectionIndex = 0;

  let menuIsOpen = false;

  let standbyTimer = null;

  let standbyActive = false;

  let lastScrollY = 0;

  let loaderFinished = false;


  /* =======================================================
     03 — HELPERS
     ======================================================= */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const getHeaderHeight = () => {
    const header = document.querySelector(".site-header");

    if (!header) {
      return 0;
    }

    return header.getBoundingClientRect().height;
  };


  const getSectionTop = (section) => {
    const rect = section.getBoundingClientRect();

    return (
      window.scrollY +
      rect.top -
      getHeaderHeight()
    );
  };


  const scrollToSection = (index) => {
    if (!sections.length) {
      return;
    }

    const safeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const section = sections[safeIndex];

    if (!section) {
      return;
    }

    const top = Math.max(
      0,
      getSectionTop(section)
    );

    window.scrollTo({
      top,
      behavior: prefersReducedMotion.matches
        ? "auto"
        : "smooth"
    });
  };


  const setBodyLocked = (locked) => {
    body.classList.toggle(
      "is-locked",
      locked
    );
  };


  /* =======================================================
     04 — LOADER
     ======================================================= */

  const finishLoader = () => {
    if (loaderFinished) {
      return;
    }

    loaderFinished = true;

    if (!loader) {
      return;
    }

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 1000);
  };


  const startLoader = () => {
    if (!loader) {
      loaderFinished = true;
      return;
    }

    if (prefersReducedMotion.matches) {
      window.setTimeout(
        finishLoader,
        500
      );

      return;
    }

    /*
     * The visual sequence is controlled primarily
     * by CSS animations. JS only controls when the
     * threshold disappears.
     */
    window.setTimeout(
      finishLoader,
      2600
    );
  };


  /* =======================================================
     05 — GLOBAL MENU
     ======================================================= */

  const openMenu = () => {
    if (!globalMenu || menuIsOpen) {
      return;
    }

    menuIsOpen = true;

    globalMenu.classList.add("is-open");

    globalMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    if (menuToggle) {
      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    setBodyLocked(true);

    resetStandbyTimer();
  };


  const closeMenu = () => {
    if (!globalMenu || !menuIsOpen) {
      return;
    }

    menuIsOpen = false;

    globalMenu.classList.remove("is-open");

    globalMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    if (menuToggle) {
      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    setBodyLocked(false);

    resetStandbyTimer();
  };


  if (menuToggle) {
    menuToggle.addEventListener(
      "click",
      openMenu
    );
  }


  if (menuClose) {
    menuClose.addEventListener(
      "click",
      closeMenu
    );
  }


  globalMenuLinks.forEach((link) => {
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
      if (event.key === "Escape" && menuIsOpen) {
        closeMenu();
      }
    }
  );


  /* =======================================================
     06 — PAGE TURN
     ======================================================= */

  const updatePageTurn = (index) => {
    if (!sections.length) {
      return;
    }

    currentSectionIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const section =
      sections[currentSectionIndex];

    if (!section) {
      return;
    }

    const title =
      section.dataset.sectionTitle ||
      section.getAttribute("aria-label") ||
      "";

    if (pageTurnTitle) {
      pageTurnTitle.textContent = title;
    }

    if (pageTurnMarker) {
      const percentage =
        sections.length <= 1
          ? 0
          : currentSectionIndex /
            (sections.length - 1);

      pageTurnMarker.style.left =
        `${percentage * 100}%`;
    }

    if (pageTurnPrev) {
      pageTurnPrev.disabled =
        currentSectionIndex === 0;

      pageTurnPrev.setAttribute(
        "aria-disabled",
        String(currentSectionIndex === 0)
      );
    }

    if (pageTurnNext) {
      pageTurnNext.disabled =
        currentSectionIndex ===
        sections.length - 1;

      pageTurnNext.setAttribute(
        "aria-disabled",
        String(
          currentSectionIndex ===
          sections.length - 1
        )
      );
    }
  };


  const goToPreviousSection = () => {
    if (currentSectionIndex <= 0) {
      return;
    }

    scrollToSection(
      currentSectionIndex - 1
    );
  };


  const goToNextSection = () => {
    if (
      currentSectionIndex >=
      sections.length - 1
    ) {
      return;
    }

    scrollToSection(
      currentSectionIndex + 1
    );
  };


  if (pageTurnPrev) {
    pageTurnPrev.addEventListener(
      "click",
      goToPreviousSection
    );
  }


  if (pageTurnNext) {
    pageTurnNext.addEventListener(
      "click",
      goToNextSection
    );
  }


  /* =======================================================
     07 — SECTION OBSERVER
     ======================================================= */

  if ("IntersectionObserver" in window) {
    const sectionObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const index =
              sections.indexOf(entry.target);

            if (index === -1) {
              return;
            }

            updatePageTurn(index);
          });
        },
        {
          root: null,

          /*
           * The center of the viewport becomes
           * the narrative reference point.
           */
          rootMargin:
            "-35% 0px -35% 0px",

          threshold: 0
        }
      );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  } else {
    updatePageTurn(0);
  }


  /* =======================================================
     08 — REVEAL OBSERVER
     ======================================================= */

  if (
    "IntersectionObserver" in window &&
    !prefersReducedMotion.matches
  ) {
    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
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
          root: null,
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.05
        }
      );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add(
        "is-visible"
      );
    });
  }


  /* =======================================================
     09 — KEYBOARD NAVIGATION
     ======================================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      /*
       * Do not hijack keyboard input while the
       * user is interacting with form fields.
       */
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable;

      if (isTyping || menuIsOpen) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown"
      ) {
        event.preventDefault();

        goToNextSection();

        return;
      }

      if (
        event.key === "ArrowUp" ||
        event.key === "PageUp"
      ) {
        event.preventDefault();

        goToPreviousSection();

        return;
      }

      if (event.key === "Home") {
        event.preventDefault();

        scrollToSection(0);

        return;
      }

      if (event.key === "End") {
        event.preventDefault();

        scrollToSection(
          sections.length - 1
        );
      }
    }
  );


  /* =======================================================
     10 — STANDBY
     ======================================================= */

  const showStandby = () => {
    if (!standby || standbyActive) {
      return;
    }

    if (menuIsOpen) {
      return;
    }

    standbyActive = true;

    lastScrollY = window.scrollY;

    standby.classList.add(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

    setBodyLocked(true);
  };


  const hideStandby = () => {
    if (!standby || !standbyActive) {
      return;
    }

    standbyActive = false;

    standby.classList.remove(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    setBodyLocked(false);

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: lastScrollY,
        behavior: "auto"
      });
    });

    resetStandbyTimer();
  };


  const resetStandbyTimer = () => {
    if (!standby) {
      return;
    }

    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );
    }

    if (standbyActive || menuIsOpen) {
      return;
    }

    standbyTimer = window.setTimeout(
      showStandby,
      40000
    );
  };


  if (standby) {
    standby.addEventListener(
      "click",
      hideStandby
    );

    standby.addEventListener(
      "pointerdown",
      hideStandby
    );
  }


  [
    "mousemove",
    "pointermove",
    "wheel",
    "touchstart",
    "touchmove",
    "keydown",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        if (standbyActive) {
          return;
        }

        resetStandbyTimer();
      },
      {
        passive: true
      }
    );
  });


  /* =======================================================
     11 — PAGE TURN VISIBILITY
     ======================================================= */

  let pageTurnVisibilityTimer = null;

  const showPageTurn = () => {
    if (!pageTurn) {
      return;
    }

    pageTurn.classList.remove(
      "is-hidden"
    );
  };


  const hidePageTurnTemporarily = () => {
    if (!pageTurn || menuIsOpen) {
      return;
    }

    pageTurn.classList.add(
      "is-hidden"
    );

    if (pageTurnVisibilityTimer) {
      window.clearTimeout(
        pageTurnVisibilityTimer
      );
    }

    pageTurnVisibilityTimer =
      window.setTimeout(
        showPageTurn,
        1400
      );
  };


  let scrollTimeout = null;

  window.addEventListener(
    "scroll",
    () => {
      hidePageTurnTemporarily();

      if (scrollTimeout) {
        window.clearTimeout(
          scrollTimeout
        );
      }

      scrollTimeout =
        window.setTimeout(
          showPageTurn,
          500
        );
    },
    {
      passive: true
    }
  );


  /* =======================================================
     12 — INITIAL STATE
     ======================================================= */

  updatePageTurn(0);

  /*
   * Avoid restoring a previous scroll position when
   * entering the Home.
   */
  if ("scrollRestoration" in history) {
    history.scrollRestoration =
      "manual";
  }

  window.scrollTo(0, 0);

  resetStandbyTimer();

  startLoader();


  /* =======================================================
     13 — INITIAL REVEAL
     ======================================================= */

  if (prefersReducedMotion.matches) {
    revealElements.forEach((element) => {
      element.classList.add(
        "is-visible"
      );
    });
  }


  /* =======================================================
     14 — RESIZE
     ======================================================= */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {
      if (resizeTimer) {
        window.clearTimeout(
          resizeTimer
        );
      }

      resizeTimer =
        window.setTimeout(
          () => {
            /*
             * Recalculate the current narrative
             * state after viewport changes.
             */
            updatePageTurn(
              currentSectionIndex
            );
          },
          150
        );
    },
    {
      passive: true
    }
  );


  /* =======================================================
     15 — VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        if (standbyTimer) {
          window.clearTimeout(
            standbyTimer
          );
        }

        return;
      }

      resetStandbyTimer();
    }
  );


  /* =======================================================
     16 — MENU LINK SAFETY
     ======================================================= */

  globalMenuLinks.forEach((link) => {
    link.addEventListener(
      "click",
      () => {
        /*
         * Give the overlay enough time to disappear
         * before the browser navigates.
         */
        globalMenu.classList.remove(
          "is-open"
        );

        menuIsOpen = false;

        setBodyLocked(false);
      }
    );
  });


  /* =======================================================
     17 — EXPOSE MINIMAL DEBUG STATE
     ======================================================= */

  /*
   * Useful during development without creating
   * a visible debug interface.
   */
  window.CesareHome = {
    getCurrentSection: () =>
      currentSectionIndex,

    getSections: () =>
      sections,

    goToSection: (index) =>
      scrollToSection(index)
  };

})();
