(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE — HOME
     MASTER JAVASCRIPT
     ========================================================= */

  const body = document.body;
  const loader = document.querySelector(".loader");
  const menu = document.querySelector(".global-menu");
  const menuToggle = document.querySelector(".menu-toggle");

  const sections = Array.from(
    document.querySelectorAll(".narrative-section")
  );

  const revealElements = Array.from(
    document.querySelectorAll("[data-reveal]")
  );

  const navigation = document.querySelector(".narrative-navigation");
  const navigationTitle = document.querySelector(
    ".narrative-navigation__title"
  );

  const previousButton = document.querySelector(
    ".narrative-navigation__arrow--prev"
  );

  const nextButton = document.querySelector(
    ".narrative-navigation__arrow--next"
  );

  const navigationMarker = document.querySelector(
    ".narrative-navigation__marker"
  );

  const standby = document.querySelector(".standby");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* =========================================================
     01 — HELPERS
     ========================================================= */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const getSectionTitle = (section) => {
    if (!section) return "";

    const titleElement =
      section.querySelector(".section__heading") ||
      section.querySelector(".section__title");

    if (!titleElement) return "";

    return titleElement.textContent.trim();
  };


  const getSectionIndex = (section) => {
    return sections.indexOf(section);
  };


  const scrollToSection = (section, instant = false) => {
    if (!section) return;

    section.scrollIntoView({
      behavior:
        instant || prefersReducedMotion
          ? "auto"
          : "smooth",
      block: "start"
    });
  };


  /* =========================================================
     02 — LOADER
     ========================================================= */

  const hideLoader = () => {
    if (!loader) return;

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
    }, prefersReducedMotion ? 100 : 850);
  };


  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, {
      once: true
    });
  }


  /* =========================================================
     03 — MENU
     ========================================================= */

  const setMenuState = (isOpen) => {
    if (!menu || !menuToggle) return;

    menu.classList.toggle("is-open", isOpen);

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    body.classList.toggle("is-locked", isOpen);
  };


  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menu?.classList.contains("is-open");

      setMenuState(!isOpen);
    });
  }


  if (menu) {
    const menuLinks = menu.querySelectorAll("a");

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });
  }


  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });


  /* =========================================================
     04 — REVEAL
     ========================================================= */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-revealed");

        revealObserver.unobserve(entry.target);
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


  /* =========================================================
     05 — SECTION VISIBILITY
     ========================================================= */

  let activeSection = sections[0] || null;
  let activeSectionIndex = 0;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          return b.intersectionRatio - a.intersectionRatio;
        });

      if (!visibleEntries.length) return;

      const section = visibleEntries[0].target;

      if (section === activeSection) return;

      setActiveSection(section);
    },
    {
      threshold: [
        0.2,
        0.35,
        0.5,
        0.65,
        0.8
      ]
    }
  );


  sections.forEach((section) => {
    sectionObserver.observe(section);
  });


  /* =========================================================
     06 — NARRATIVE NAVIGATION
     ========================================================= */

  const updateNavigationMarker = () => {
    if (!navigationMarker || sections.length <= 1) return;

    const percentage =
      activeSectionIndex /
      (sections.length - 1);

    const track = navigationMarker.parentElement;

    if (!track) return;

    const availableWidth =
      track.getBoundingClientRect().width;

    const markerWidth =
      navigationMarker.getBoundingClientRect().width;

    const position = clamp(
      percentage *
        Math.max(0, availableWidth - markerWidth),
      0,
      Math.max(0, availableWidth - markerWidth)
    );

    navigationMarker.style.transform =
      `translateX(${position}px)`;
  };


  const updateNavigationButtons = () => {
    if (!previousButton || !nextButton) return;

    previousButton.disabled =
      activeSectionIndex <= 0;

    /*
     * The final arrow remains enabled.
     * From the last section it returns to GUARDA.
     */
    nextButton.disabled = false;
  };


  const updateNavigationTitle = () => {
    if (!navigationTitle) return;

    const title = getSectionTitle(activeSection);

    navigationTitle.textContent = title;
  };


  const updateNavigation = () => {
    updateNavigationTitle();
    updateNavigationButtons();
    updateNavigationMarker();
  };


  const setActiveSection = (section) => {
    const index = getSectionIndex(section);

    if (index === -1) return;

    activeSection = section;
    activeSectionIndex = index;

    updateNavigation();
  };


  const goPrevious = () => {
    if (activeSectionIndex <= 0) return;

    const previousSection =
      sections[activeSectionIndex - 1];

    scrollToSection(previousSection);
  };


  const goNext = () => {
    const lastIndex = sections.length - 1;

    if (activeSectionIndex >= lastIndex) {
      scrollToSection(sections[0]);
      return;
    }

    const nextSection =
      sections[activeSectionIndex + 1];

    scrollToSection(nextSection);
  };


  if (previousButton) {
    previousButton.addEventListener(
      "click",
      goPrevious
    );
  }


  if (nextButton) {
    nextButton.addEventListener(
      "click",
      goNext
    );
  }


  /* =========================================================
     07 — KEYBOARD NAVIGATION
     ========================================================= */

  document.addEventListener("keydown", (event) => {
    if (body.classList.contains("is-locked")) {
      return;
    }

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      goNext();
    }

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      goPrevious();
    }
  });


  /* =========================================================
     08 — RESIZE
     ========================================================= */

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      updateNavigation();
    }, 100);
  });


  /* =========================================================
     09 — STANDBY
     ========================================================= */

  const STANDBY_DELAY = 40000;

  let standbyTimer = null;
  let isStandby = false;


  const resetStandbyTimer = () => {
    window.clearTimeout(standbyTimer);

    if (isStandby) {
      return;
    }

    standbyTimer = window.setTimeout(
      activateStandby,
      STANDBY_DELAY
    );
  };


  const activateStandby = () => {
    if (!standby || isStandby) return;

    isStandby = true;

    standby.classList.add("is-active");

    body.classList.add("is-locked");
  };


  const deactivateStandby = () => {
    if (!standby || !isStandby) return;

    isStandby = false;

    standby.classList.remove("is-active");

    body.classList.remove("is-locked");

    /*
     * The page remains at the exact point where the user
     * stopped. No forced return to the beginning.
     */
    resetStandbyTimer();
  };


  [
    "mousemove",
    "mousedown",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        if (isStandby) {
          deactivateStandby();
        } else {
          resetStandbyTimer();
        }
      },
      {
        passive: true
      }
    );
  });


  if (standby) {
    standby.addEventListener("click", () => {
      deactivateStandby();
    });
  }


  /* =========================================================
     10 — INITIAL STATE
     ========================================================= */

  if (sections.length) {
    activeSection = sections[0];
    activeSectionIndex = 0;

    updateNavigation();
  }


  resetStandbyTimer();


  /* =========================================================
     11 — SMOOTH ANCHOR LINKS
     ========================================================= */

  const internalLinks = document.querySelectorAll(
    'a[href^="#"]'
  );


  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      setMenuState(false);

      scrollToSection(target);
    });
  });


  /* =========================================================
     12 — INITIAL VISIBILITY
     ========================================================= */

  const firstSection = sections[0];

  if (firstSection) {
    firstSection.classList.add("is-visible");
  }


  /* =========================================================
     13 — PORTRAIT SECTION
     ========================================================= */

  const portraitSection = document.querySelector(
    ".portrait-section"
  );


  if (portraitSection) {
    const portraitObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            portraitSection.classList.add(
              "is-visible"
            );

            portraitObserver.unobserve(
              portraitSection
            );
          });
        },
        {
          threshold: 0.35
        }
      );

    portraitObserver.observe(portraitSection);
  }


  /* =========================================================
     14 — FIRST SECTION
     ========================================================= */

  const openingSection = document.querySelector(
    ".narrative-section--opening"
  );


  if (openingSection) {
    const openingObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            openingSection.classList.add(
              "is-visible"
            );

            openingObserver.unobserve(
              openingSection
            );
          });
        },
        {
          threshold: 0.5
        }
      );

    openingObserver.observe(openingSection);
  }


  /* =========================================================
     15 — CLEANUP
     ========================================================= */

  window.addEventListener("pagehide", () => {
    window.clearTimeout(standbyTimer);
    window.clearTimeout(resizeTimer);
  });

})();
