(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE
     MASTER — COPY LOCKED / PRE-CODE
     JAVASCRIPT
     ========================================================= */


  /* =========================================================
     01 — DOM
     ========================================================= */

  const body = document.body;

  const loader = document.getElementById("loader");

  const header = document.getElementById("site-header");

  const menuToggle = document.getElementById("menu-toggle");
  const globalMenu = document.getElementById("global-menu");

  const sectionNavigation =
    document.getElementById("section-navigation");

  const sectionNavigationTitle =
    document.getElementById("section-navigation-title");

  const sectionNavigationMarker =
    document.getElementById("section-navigation-marker");

  const sectionPrev =
    document.getElementById("section-prev");

  const sectionNext =
    document.getElementById("section-next");

  const standby =
    document.getElementById("standby");

  const sections = Array.from(
    document.querySelectorAll("[data-section]")
  );

  const revealElements = Array.from(
    document.querySelectorAll("[data-reveal]")
  );


  /* =========================================================
     02 — STATE
     ========================================================= */

  let currentSectionIndex = 0;

  let isMenuOpen = false;

  let isStandbyActive = false;

  let loaderComplete = false;

  let standbyTimer = null;

  let scrollTimer = null;

  let lastScrollY = window.scrollY;

  let isProgrammaticScroll = false;


  /* =========================================================
     03 — HELPERS
     ========================================================= */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const getSectionTop = (section) => {
    const headerHeight =
      header?.getBoundingClientRect().height || 0;

    const rect = section.getBoundingClientRect();

    return window.scrollY + rect.top - headerHeight;
  };


  const updateBodyState = () => {
    body.classList.toggle(
      "is-menu-open",
      isMenuOpen
    );

    body.classList.toggle(
      "is-standby",
      isStandbyActive
    );
  };


  /* =========================================================
     04 — LOADER
     ========================================================= */

  const startLoader = () => {
    if (!loader) {
      loaderComplete = true;
      return;
    }

    body.classList.add("is-loading");

    requestAnimationFrame(() => {
      loader.classList.add("is-active");
    });

    window.setTimeout(() => {
      loader.classList.add("is-hidden");

      body.classList.remove("is-loading");

      loaderComplete = true;

      startStandbyTimer();
    }, 2600);
  };


  /* =========================================================
     05 — MENU
     ========================================================= */

  const openMenu = () => {
    if (!globalMenu || !menuToggle) {
      return;
    }

    isMenuOpen = true;

    globalMenu.classList.add("is-open");

    globalMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    updateBodyState();

    stopStandbyTimer();
  };


  const closeMenu = () => {
    if (!globalMenu || !menuToggle) {
      return;
    }

    isMenuOpen = false;

    globalMenu.classList.remove("is-open");

    globalMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    updateBodyState();

    startStandbyTimer();
  };


  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };


  menuToggle?.addEventListener(
    "click",
    toggleMenu
  );


  globalMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });


  /* =========================================================
     06 — SECTION NAVIGATION
     ========================================================= */

  const updateSectionNavigation = () => {
    if (!sections.length) {
      return;
    }

    const currentSection =
      sections[currentSectionIndex];

    if (!currentSection) {
      return;
    }

    const title =
      currentSection.dataset.sectionTitle || "";

    if (sectionNavigationTitle) {
      sectionNavigationTitle.textContent = title;
    }

    if (sectionPrev) {
      sectionPrev.disabled =
        currentSectionIndex === 0;
    }

    if (sectionNext) {
      sectionNext.disabled =
        currentSectionIndex === sections.length - 1;
    }

    if (sectionNavigationMarker) {
      const progress =
        sections.length <= 1
          ? 0
          : currentSectionIndex /
            (sections.length - 1);

      sectionNavigationMarker.style.left =
        `${progress * 100}%`;
    }
  };


  const setCurrentSection = (index) => {
    if (!sections.length) {
      return;
    }

    currentSectionIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    updateSectionNavigation();
  };


  const scrollToSection = (index) => {
    if (!sections[index]) {
      return;
    }

    setCurrentSection(index);

    const targetTop =
      getSectionTop(sections[index]);

    isProgrammaticScroll = true;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });

    window.setTimeout(() => {
      isProgrammaticScroll = false;
    }, 900);
  };


  sectionPrev?.addEventListener(
    "click",
    () => {
      if (currentSectionIndex > 0) {
        scrollToSection(
          currentSectionIndex - 1
        );
      }
    }
  );


  sectionNext?.addEventListener(
    "click",
    () => {
      if (
        currentSectionIndex <
        sections.length - 1
      ) {
        scrollToSection(
          currentSectionIndex + 1
        );
      }
    }
  );


  /* =========================================================
     07 — SECTION OBSERVER
     ========================================================= */

  const sectionObserver =
    new IntersectionObserver(
      (entries) => {
        const visibleEntries =
          entries
            .filter(
              (entry) =>
                entry.isIntersecting
            )
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

        if (!visibleEntries.length) {
          return;
        }

        const section =
          visibleEntries[0].target;

        const index =
          sections.indexOf(section);

        if (index === -1) {
          return;
        }

        setCurrentSection(index);
      },
      {
        root: null,
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    );


  sections.forEach((section) => {
    sectionObserver.observe(section);
  });


  /* =========================================================
     08 — SECTION NAVIGATION VISIBILITY
     ========================================================= */

  const updateSectionNavigationVisibility = () => {
    if (!sectionNavigation) {
      return;
    }

    const scrollY = window.scrollY;

    const firstSection =
      sections[0];

    if (!firstSection) {
      return;
    }

    const firstSectionBottom =
      firstSection.offsetTop +
      firstSection.offsetHeight;

    const shouldShow =
      scrollY > firstSectionBottom * 0.15;

    sectionNavigation.classList.toggle(
      "is-visible",
      shouldShow
    );
  };


  /* =========================================================
     09 — HEADER VISIBILITY
     ========================================================= */

  const updateHeaderVisibility = () => {
    if (!header || isMenuOpen) {
      return;
    }

    const currentScrollY =
      window.scrollY;

    if (currentScrollY <= 20) {
      header.classList.remove("is-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    const difference =
      currentScrollY - lastScrollY;

    if (difference > 8) {
      header.classList.add("is-hidden");
    }

    if (difference < -8) {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
  };


  /* =========================================================
     10 — REVEAL
     ========================================================= */

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
        threshold: 0.08
      }
    );


  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });


  /* =========================================================
     11 — STANDBY / QUIET MODE
     ========================================================= */

  const stopStandbyTimer = () => {
    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );

      standbyTimer = null;
    }
  };


  const startStandbyTimer = () => {
    stopStandbyTimer();

    if (
      !loaderComplete ||
      isMenuOpen ||
      isStandbyActive
    ) {
      return;
    }

    standbyTimer = window.setTimeout(() => {
      activateStandby();
    }, 40000);
  };


  const activateStandby = () => {
    if (
      isMenuOpen ||
      isStandbyActive
    ) {
      return;
    }

    isStandbyActive = true;

    standby?.classList.add(
      "is-active"
    );

    standby?.setAttribute(
      "aria-hidden",
      "false"
    );

    updateBodyState();
  };


  const deactivateStandby = () => {
    if (!isStandbyActive) {
      return;
    }

    isStandbyActive = false;

    standby?.classList.remove(
      "is-active"
    );

    standby?.setAttribute(
      "aria-hidden",
      "true"
    );

    updateBodyState();

    startStandbyTimer();
  };


  const registerActivity = () => {
    if (isStandbyActive) {
      deactivateStandby();
      return;
    }

    if (
      loaderComplete &&
      !isMenuOpen
    ) {
      startStandbyTimer();
    }
  };


  [
    "pointermove",
    "pointerdown",
    "touchstart",
    "keydown",
    "wheel"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      registerActivity,
      {
        passive: true
      }
    );
  });


  /* =========================================================
     12 — KEYBOARD NAVIGATION
     ========================================================= */

  window.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        if (isMenuOpen) {
          closeMenu();
          return;
        }

        if (isStandbyActive) {
          deactivateStandby();
          return;
        }
      }


      if (
        event.key === "ArrowRight" &&
        !isMenuOpen &&
        !isStandbyActive
      ) {
        if (
          currentSectionIndex <
          sections.length - 1
        ) {
          scrollToSection(
            currentSectionIndex + 1
          );
        }
      }


      if (
        event.key === "ArrowLeft" &&
        !isMenuOpen &&
        !isStandbyActive
      ) {
        if (currentSectionIndex > 0) {
          scrollToSection(
            currentSectionIndex - 1
          );
        }
      }
    }
  );


  /* =========================================================
     13 — SCROLL
     ========================================================= */

  window.addEventListener(
    "scroll",
    () => {

      if (scrollTimer) {
        window.cancelAnimationFrame(
          scrollTimer
        );
      }

      scrollTimer =
        window.requestAnimationFrame(() => {

          updateSectionNavigationVisibility();

          updateHeaderVisibility();

          if (
            !isProgrammaticScroll &&
            !isMenuOpen &&
            !isStandbyActive
          ) {
            startStandbyTimer();
          }

        });
    },
    {
      passive: true
    }
  );


  /* =========================================================
     14 — RESIZE
     ========================================================= */

  window.addEventListener(
    "resize",
    () => {
      updateSectionNavigation();
      updateSectionNavigationVisibility();
    },
    {
      passive: true
    }
  );


  /* =========================================================
     15 — VISIBILITY
     ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {
        stopStandbyTimer();
        return;
      }

      if (
        loaderComplete &&
        !isMenuOpen &&
        !isStandbyActive
      ) {
        startStandbyTimer();
      }
    }
  );


  /* =========================================================
     16 — INITIAL STATE
     ========================================================= */

  setCurrentSection(0);

  updateSectionNavigationVisibility();

  updateHeaderVisibility();

  updateBodyState();

  startLoader();

})();
