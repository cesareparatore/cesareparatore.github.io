/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   Global JavaScript
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. DOM REFERENCES
  ======================================================= */

  const body = document.body;

  const intro = document.getElementById("intro");

  const header = document.getElementById("site-header");

  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const siteMenu = document.getElementById("site-menu");

  const scrollProgress = document.getElementById("scroll-progress");

  const hero = document.querySelector(".hero");
  const heroTrajectory = document.querySelector(".hero-trajectory");

  const directionItems = [
    ...document.querySelectorAll(".direction-item")
  ];

  const standby = document.getElementById("standby");

  const currentYear = document.getElementById("current-year");


  /* =======================================================
     02. CONFIGURATION
  ========================================================== */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const INTRO_DELAY = prefersReducedMotion ? 650 : 2400;

  const STANDBY_DELAY = 28000;

  const PARALLAX_LIMIT = 16;


  /* =======================================================
     03. UTILITIES
  ========================================================== */

  const isElementVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  };


  /* =======================================================
     04. CURRENT YEAR
  ========================================================== */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* =======================================================
     05. INTRO
  ========================================================== */

  const hideIntro = () => {
    if (!intro) return;

    intro.classList.add("is-hidden");

    window.setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
    }, prefersReducedMotion ? 50 : 850);
  };

  if (intro) {
    intro.setAttribute("aria-hidden", "false");

    window.setTimeout(hideIntro, INTRO_DELAY);
  }


  /* =======================================================
     06. SCROLL UI
  ========================================================== */

  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || window.pageYOffset;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      documentHeight > 0
        ? Math.min(Math.max(scrollTop / documentHeight, 0), 1)
        : 0;

    if (scrollProgress) {
      scrollProgress.style.transform = `scaleY(${progress})`;
    }

    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 50);
    }

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(updateScrollUI);
  };

  window.addEventListener("scroll", requestScrollUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestScrollUpdate);

  updateScrollUI();


  /* =======================================================
     07. MENU
  ========================================================== */

  let menuOpen = false;
  let previousFocusedElement = null;

  const getMenuFocusableElements = () => {
    if (!siteMenu) return [];

    return [
      ...siteMenu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ].filter(isElementVisible);
  };

  const openMenu = () => {
    if (!siteMenu || menuOpen) return;

    previousFocusedElement = document.activeElement;

    menuOpen = true;

    siteMenu.classList.add("is-open");
    siteMenu.setAttribute("aria-hidden", "false");
    siteMenu.removeAttribute("inert");

    body.classList.add("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Chiudi il menu");
    }

    window.setTimeout(() => {
      const focusable = getMenuFocusableElements();

      if (focusable.length) {
        focusable[0].focus();
      }
    }, 50);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!siteMenu || !menuOpen) return;

    menuOpen = false;

    siteMenu.classList.remove("is-open");
    siteMenu.setAttribute("aria-hidden", "true");
    siteMenu.setAttribute("inert", "");

    body.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri il menu");
    }

    if (
      restoreFocus &&
      previousFocusedElement &&
      typeof previousFocusedElement.focus === "function"
    ) {
      previousFocusedElement.focus();
    }

    previousFocusedElement = null;
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", () => {
      closeMenu();
    });
  }

  if (siteMenu) {
    siteMenu.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (!link) return;

      closeMenu({
        restoreFocus: false
      });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getMenuFocusableElements();

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });


  /* =======================================================
     08. CLOSE MENU ON ESC / VIEWPORT CHANGES
  ========================================================== */

  const desktopBreakpoint = window.matchMedia("(min-width: 901px)");

  const handleBreakpointChange = () => {
    if (desktopBreakpoint.matches && menuOpen) {
      closeMenu({
        restoreFocus: false
      });
    }
  };

  if (desktopBreakpoint.addEventListener) {
    desktopBreakpoint.addEventListener(
      "change",
      handleBreakpointChange
    );
  } else {
    desktopBreakpoint.addListener(handleBreakpointChange);
  }


  /* =======================================================
     09. HERO PARALLAX
  ========================================================== */

  let pointerX = 0;
  let pointerY = 0;

  let currentX = 0;
  let currentY = 0;

  let parallaxFrame = null;

  const updateParallax = () => {
    currentX += (pointerX - currentX) * 0.08;
    currentY += (pointerY - currentY) * 0.08;

    if (heroTrajectory) {
      const x = currentX * PARALLAX_LIMIT;
      const y = currentY * PARALLAX_LIMIT;

      heroTrajectory.style.transform =
        `translate3d(${x}px, ${y}px, 0) translateY(-50%)`;
    }

    parallaxFrame = window.requestAnimationFrame(updateParallax);
  };

  const stopParallax = () => {
    if (parallaxFrame) {
      window.cancelAnimationFrame(parallaxFrame);
      parallaxFrame = null;
    }
  };

  const resetParallax = () => {
    pointerX = 0;
    pointerY = 0;
  };

  if (
    hero &&
    heroTrajectory &&
    !prefersReducedMotion &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();

      pointerX =
        (event.clientX - rect.left) / rect.width - 0.5;

      pointerY =
        (event.clientY - rect.top) / rect.height - 0.5;

      if (!parallaxFrame) {
        parallaxFrame = window.requestAnimationFrame(
          updateParallax
        );
      }
    });

    hero.addEventListener("pointerleave", resetParallax);

    updateParallax();
  } else if (heroTrajectory) {
    heroTrajectory.style.transform =
      "translate3d(0, 0, 0) translateY(-50%)";
  }


  /* =======================================================
     10. FIVE DIRECTIONS
  ========================================================== */

  const activateDirection = (item) => {
    directionItems.forEach((direction) => {
      direction.classList.remove("is-active");
    });

    if (item) {
      item.classList.add("is-active");
    }
  };

  directionItems.forEach((item) => {

    item.addEventListener("mouseenter", () => {
      activateDirection(item);
    });

    item.addEventListener("focus", () => {
      activateDirection(item);
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-active");
    });

    item.addEventListener("blur", () => {
      item.classList.remove("is-active");
    });

  });


  /* =======================================================
     11. ACTIVE DIRECTION BY VISIBILITY
  ========================================================== */

  if (
    directionItems.length &&
    "IntersectionObserver" in window
  ) {
    const directionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateDirection(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.65
      }
    );

    directionItems.forEach((item) => {
      directionObserver.observe(item);
    });
  }


  /* =======================================================
     12. STANDBY / INACTIVITY
  ========================================================== */

  let standbyTimer = null;
  let standbyVisible = false;

  const showStandby = () => {
    if (!standby || menuOpen || standbyVisible) return;

    standbyVisible = true;

    standby.classList.add("is-visible");
    standby.setAttribute("aria-hidden", "false");
  };

  const hideStandby = () => {
    if (!standby || !standbyVisible) return;

    standbyVisible = false;

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  };

  const resetStandbyTimer = () => {
    if (!standby) return;

    hideStandby();

    if (standbyTimer) {
      window.clearTimeout(standbyTimer);
    }

    standbyTimer = window.setTimeout(
      showStandby,
      STANDBY_DELAY
    );
  };

  const userActivityEvents = [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ];

  userActivityEvents.forEach((eventName) => {
    window.addEventListener(
      eventName,
      resetStandbyTimer,
      {
        passive: eventName !== "keydown"
      }
    );
  });

  if (standby) {
    standby.addEventListener("click", hideStandby);
  }

  resetStandbyTimer();


  /* =======================================================
     13. INTERNAL ANCHOR NAVIGATION
  ========================================================== */

  document.addEventListener("click", (event) => {

    const link = event.target.closest(
      'a[href^="#"]:not([href="#"])'
    );

    if (!link) return;

    const targetId = link.getAttribute("href");

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    if (menuOpen) {
      closeMenu({
        restoreFocus: false
      });
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion
        ? "auto"
        : "smooth",
      block: "start"
    });

    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }

    window.setTimeout(() => {
      target.focus({
        preventScroll: true
      });
    }, prefersReducedMotion ? 0 : 500);
  });


  /* =======================================================
     14. IMAGE ERROR HANDLING
  ========================================================== */

  document.querySelectorAll("img").forEach((image) => {

    image.addEventListener("error", () => {
      image.classList.add("image-error");
    });

  });


  /* =======================================================
     15. PAGE VISIBILITY
  ========================================================== */

  document.addEventListener("visibilitychange", () => {

    if (document.hidden) {
      if (parallaxFrame) {
        stopParallax();
      }

      if (standbyTimer) {
        window.clearTimeout(standbyTimer);
      }

      return;
    }

    resetStandbyTimer();

    if (
      hero &&
      heroTrajectory &&
      !prefersReducedMotion &&
      window.matchMedia("(pointer: fine)").matches &&
      !parallaxFrame
    ) {
      parallaxFrame =
        window.requestAnimationFrame(updateParallax);
    }

  });


  /* =======================================================
     16. RESIZE
  ========================================================== */

  let resizeTimer = null;

  window.addEventListener("resize", () => {

    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }

    resizeTimer = window.setTimeout(() => {

      updateScrollUI();

      if (window.matchMedia("(pointer: fine)").matches === false) {
        resetParallax();
      }

    }, 120);

  });


  /* =======================================================
     17. INITIAL STATE
  ========================================================== */

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (siteMenu) {
    siteMenu.setAttribute("aria-hidden", "true");
    siteMenu.setAttribute("inert", "");
  }

  if (standby) {
    standby.setAttribute("aria-hidden", "true");
  }

})();
