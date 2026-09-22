/* =========================================================
   CESARE PARATORE — MAIN SCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ---------------------------------------------------------
     ELEMENTS
     --------------------------------------------------------- */

  const loader = document.querySelector(".loader");
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".global-menu");
  const menuLinks = document.querySelectorAll(".global-menu a");

  const sections = Array.from(
    document.querySelectorAll(".narrative-section")
  );

  const navigation = document.querySelector(".narrative-navigation");
  const navigationTitle = document.querySelector(
    ".narrative-navigation__title"
  );
  const navigationPrev = document.querySelector(
    ".narrative-navigation__arrow--prev"
  );
  const navigationNext = document.querySelector(
    ".narrative-navigation__arrow--next"
  );
  const navigationLine = document.querySelector(
    ".narrative-navigation__line"
  );
  const navigationMarker = document.querySelector(
    ".narrative-navigation__marker"
  );

  const standby = document.querySelector(".standby");

  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */

  let currentSectionIndex = 0;
  let standbyTimer = null;
  let isStandbyActive = false;
  let isNavigating = false;

  /* ---------------------------------------------------------
     HELPERS
     --------------------------------------------------------- */

  const getSectionTitle = (section) => {
    if (!section) return "";

    return (
      section.dataset.sectionTitle ||
      section.querySelector("h1, h2, h3")?.textContent.trim() ||
      ""
    );
  };

  const getCurrentSection = () => {
    return sections[currentSectionIndex];
  };

  const scrollToSection = (index, behavior = "smooth") => {
    if (!sections.length) return;

    const targetIndex = Math.max(
      0,
      Math.min(index, sections.length - 1)
    );

    const target = sections[targetIndex];

    if (!target) return;

    currentSectionIndex = targetIndex;
    isNavigating = true;

    target.scrollIntoView({
      behavior,
      block: "start"
    });

    updateNavigation(targetIndex);
    resetStandbyTimer();

    window.setTimeout(() => {
      isNavigating = false;
    }, 900);
  };

  /* ---------------------------------------------------------
     LOADER
     --------------------------------------------------------- */

  const hideLoader = () => {
    if (!loader) return;

    window.setTimeout(() => {
      loader.classList.add("is-hidden");

      window.setTimeout(() => {
        loader.setAttribute("aria-hidden", "true");
      }, 900);
    }, 1200);
  };

  hideLoader();

  /* ---------------------------------------------------------
     MENU
     --------------------------------------------------------- */

  const openMenu = () => {
    if (!menu || !menuToggle) return;

    menu.classList.add("is-open");
    menuToggle.classList.add("is-active");

    menuToggle.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");

    body.classList.add("menu-open");

    resetStandbyTimer();
  };

  const closeMenu = () => {
    if (!menu || !menuToggle) return;

    menu.classList.remove("is-open");
    menuToggle.classList.remove("is-active");

    menuToggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");

    body.classList.remove("menu-open");

    resetStandbyTimer();
  };

  const toggleMenu = () => {
    if (!menu) return;

    if (menu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
      resetStandbyTimer();
    });
  });

  /* ---------------------------------------------------------
     REVEAL SYSTEM
     --------------------------------------------------------- */

  const revealElements = document.querySelectorAll(
    "[data-reveal], .reveal"
  );

  if ("IntersectionObserver" in window && revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------
     SECTION OBSERVER
     --------------------------------------------------------- */

  const updateCurrentSection = (index) => {
    if (index < 0 || index >= sections.length) return;

    currentSectionIndex = index;
    updateNavigation(index);
  };

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (!visibleSections.length) return;

        const visibleSection = visibleSections[0].target;
        const index = sections.indexOf(visibleSection);

        if (index !== -1) {
          updateCurrentSection(index);
        }
      },
      {
        threshold: [0.15, 0.35, 0.55, 0.75],
        rootMargin: "-10% 0px -10% 0px"
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------
     NARRATIVE NAVIGATION
     --------------------------------------------------------- */

  const updateNavigation = (index) => {
    if (!sections.length) return;

    const section = sections[index];

    if (navigationTitle) {
      navigationTitle.textContent = getSectionTitle(section);
    }

    if (navigationPrev) {
      navigationPrev.disabled = index === 0;
      navigationPrev.setAttribute(
        "aria-disabled",
        index === 0 ? "true" : "false"
      );
    }

    if (navigationNext) {
      navigationNext.disabled = false;
      navigationNext.setAttribute(
        "aria-disabled",
        "false"
      );
    }

    if (navigationMarker && navigationLine) {
      const percentage =
        sections.length > 1
          ? (index / (sections.length - 1)) * 100
          : 0;

      navigationMarker.style.left = `${percentage}%`;
    }

    if (navigation) {
      navigation.dataset.current = String(index);
    }
  };

  if (navigationPrev) {
    navigationPrev.addEventListener("click", () => {
      if (currentSectionIndex <= 0) return;

      scrollToSection(currentSectionIndex - 1);
    });
  }

  if (navigationNext) {
    navigationNext.addEventListener("click", () => {
      if (!sections.length) return;

      /*
       * Last section loops back to GUARDA.
       */
      if (currentSectionIndex >= sections.length - 1) {
        scrollToSection(0);
        return;
      }

      scrollToSection(currentSectionIndex + 1);
    });
  }

  /* ---------------------------------------------------------
     KEYBOARD NAVIGATION
     --------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (menu?.classList.contains("is-open")) {
        closeMenu();
        return;
      }

      if (isStandbyActive) {
        exitStandby();
        return;
      }
    }

    if (body.classList.contains("menu-open")) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();

      if (currentSectionIndex < sections.length - 1) {
        scrollToSection(currentSectionIndex + 1);
      } else {
        scrollToSection(0);
      }

      return;
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();

      if (currentSectionIndex > 0) {
        scrollToSection(currentSectionIndex - 1);
      }

      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      scrollToSection(0);
    }

    if (event.key === "End") {
      event.preventDefault();

      if (sections.length) {
        scrollToSection(sections.length - 1);
      }
    }
  });

  /* ---------------------------------------------------------
     ANCHOR LINKS
     --------------------------------------------------------- */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        const index = sections.indexOf(target);

        if (index !== -1) {
          scrollToSection(index);
        } else {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }

        closeMenu();
        resetStandbyTimer();
      });
    });

  /* ---------------------------------------------------------
     STANDBY
     --------------------------------------------------------- */

  const STANDBY_DELAY = 40000;

  const enterStandby = () => {
    if (!standby || isStandbyActive) return;

    isStandbyActive = true;

    standby.classList.add("is-active");
    standby.setAttribute("aria-hidden", "false");

    body.classList.add("standby-active");
  };

  const exitStandby = () => {
    if (!standby || !isStandbyActive) return;

    isStandbyActive = false;

    standby.classList.remove("is-active");
    standby.setAttribute("aria-hidden", "true");

    body.classList.remove("standby-active");

    resetStandbyTimer();
  };

  const resetStandbyTimer = () => {
    window.clearTimeout(standbyTimer);

    if (isStandbyActive) return;

    standbyTimer = window.setTimeout(
      enterStandby,
      STANDBY_DELAY
    );
  };

  [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "wheel",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        if (isStandbyActive) {
          exitStandby();
        } else {
          resetStandbyTimer();
        }
      },
      {
        passive: true
      }
    );
  });

  /* ---------------------------------------------------------
     RESIZE
     --------------------------------------------------------- */

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      updateNavigation(currentSectionIndex);
    }, 150);
  });

  /* ---------------------------------------------------------
     INITIAL STATE
     --------------------------------------------------------- */

  if (sections.length) {
    updateNavigation(0);
  }

  if (menu) {
    menu.setAttribute("aria-hidden", "true");
  }

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (standby) {
    standby.setAttribute("aria-hidden", "true");
  }

  resetStandbyTimer();

  /* ---------------------------------------------------------
     OPENING REVEAL
     --------------------------------------------------------- */

  window.requestAnimationFrame(() => {
    document.documentElement.classList.add("is-ready");
    body.classList.add("is-ready");
  });
});
