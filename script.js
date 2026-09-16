/* =========================================================
   CESARE PARATORE — MOVIMENTO / CON DIREZIONE
   JavaScript V3 — stable / progressive enhancement
   ========================================================= */

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const body = document.body;

  /* -------------------------------------------------------
     ELEMENTS
     ------------------------------------------------------- */

  const loader = document.querySelector(".site-loader");
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");

  const menu = document.querySelector(".site-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuPanel = document.querySelector(".menu-panel");
  const menuBackdrop = document.querySelector(".menu-backdrop");
  const menuLinks = menu
    ? Array.from(menu.querySelectorAll("a"))
    : [];

  const revealElements = Array.from(
    document.querySelectorAll("[data-reveal]")
  );

  const directionItems = Array.from(
    document.querySelectorAll(".direction-item")
  );

  const sections = Array.from(
    document.querySelectorAll("main section[id]")
  );

  /* -------------------------------------------------------
     STATE
     ------------------------------------------------------- */

  let menuOpen = false;
  let previousFocus = null;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* -------------------------------------------------------
     LOADER
     ------------------------------------------------------- */

  function hideLoader() {
    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.setAttribute("aria-hidden", "true");
      }
    }, 750);
  }

  if (reduceMotion.matches) {
    hideLoader();
  } else {
    window.setTimeout(hideLoader, 900);
  }

  /* -------------------------------------------------------
     HEADER
     ------------------------------------------------------- */

  function updateHeader() {
    if (!header) return;

    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  /* -------------------------------------------------------
     SCROLL PROGRESS
     ------------------------------------------------------- */

  function updateProgress() {
    if (!progress) return;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (documentHeight <= 0) {
      progress.style.transform = "scaleX(0)";
      return;
    }

    const value = Math.min(
      1,
      Math.max(0, window.scrollY / documentHeight)
    );

    progress.style.transform = `scaleX(${value})`;
  }

  /* -------------------------------------------------------
     SECTION INDEX
     ------------------------------------------------------- */

  function updateSectionIndex() {
    const index = document.querySelector(".header-index");

    if (!index || !sections.length) return;

    const reference = window.scrollY + window.innerHeight * 0.35;

    let activeSection = sections[0];

    for (const section of sections) {
      if (section.offsetTop <= reference) {
        activeSection = section;
      }
    }

    const number = Array.from(
      sections
    ).indexOf(activeSection) + 1;

    if (number > 0) {
      index.textContent = String(number).padStart(2, "0");
    }
  }

  function handleScroll() {
    updateHeader();
    updateProgress();
    updateSectionIndex();
  }

  window.addEventListener("scroll", handleScroll, {
    passive: true
  });

  /* -------------------------------------------------------
     REVEALS
     ------------------------------------------------------- */

  function revealAll() {
    revealElements.forEach((element) => {
      element.classList.add("is-revealed");
    });
  }

  /*
   * If reduced motion is enabled, show everything immediately.
   */
  if (reduceMotion.matches) {
    revealAll();
  } else if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {
    revealAll();
  }

  /* -------------------------------------------------------
     MENU
     ------------------------------------------------------- */

  function getFocusableMenuElements() {
    if (!menu) return [];

    return Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      return element.offsetParent !== null;
    });
  }

  function openMenu() {
    if (!menu || !menuToggle) return;

    previousFocus = document.activeElement;

    menuOpen = true;

    body.classList.add("menu-open");

    menu.setAttribute("aria-hidden", "false");
    menu.removeAttribute("inert");

    menuToggle.setAttribute("aria-expanded", "true");

    const focusable = getFocusableMenuElements();

    if (focusable.length) {
      window.setTimeout(() => {
        focusable[0].focus();
      }, 50);
    }
  }

  function closeMenu(restoreFocus = true) {
    if (!menu || !menuToggle) return;

    menuOpen = false;

    body.classList.remove("menu-open");

    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");

    menuToggle.setAttribute("aria-expanded", "false");

    if (
      restoreFocus &&
      previousFocus &&
      typeof previousFocus.focus === "function"
    ) {
      window.setTimeout(() => {
        previousFocus.focus();
      }, 50);
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", () => {
      closeMenu();
    });
  }

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  /* -------------------------------------------------------
     MENU KEYBOARD ACCESS
     ------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableMenuElements();

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

  /* -------------------------------------------------------
     DIRECTION ITEMS
     ------------------------------------------------------- */

  if (directionItems.length) {

    directionItems.forEach((item) => {

      item.addEventListener("mouseenter", () => {
        directionItems.forEach((other) => {
          other.classList.remove("is-active");
        });

        item.classList.add("is-active");
      });

      item.addEventListener("focus", () => {
        directionItems.forEach((other) => {
          other.classList.remove("is-active");
        });

        item.classList.add("is-active");
      });

    });
  }

  /* -------------------------------------------------------
     INTERNAL LINKS
     ------------------------------------------------------- */

  document.addEventListener("click", (event) => {

    const link = event.target.closest("a");

    if (!link) return;

    const href = link.getAttribute("href");

    if (!href) return;

    /*
     * Only intercept same-page anchors.
     * Normal page navigation remains completely native.
     */
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();

    closeMenu(false);

    const headerHeight = header
      ? header.offsetHeight
      : 0;

    const targetTop =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: reduceMotion.matches
        ? "auto"
        : "smooth"
    });

    /*
     * Keep URL hash without forcing a page reload.
     */
    if (history.pushState) {
      history.pushState(null, "", href);
    }
  });

  /* -------------------------------------------------------
     KEYBOARD USER STATE
     ------------------------------------------------------- */

  let keyboardUser = false;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      keyboardUser = true;
      document.documentElement.classList.add(
        "keyboard-user"
      );
    }
  });

  document.addEventListener("pointerdown", () => {
    if (!keyboardUser) return;

    keyboardUser = false;

    document.documentElement.classList.remove(
      "keyboard-user"
    );
  });

  /* -------------------------------------------------------
     RESIZE
     ------------------------------------------------------- */

  let resizeTimer = null;

  window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {

      /*
       * Never leave the interface in an impossible state
       * after orientation change / resize.
       */
      if (window.innerWidth > 900 && menuOpen) {
        closeMenu(false);
      }

      handleScroll();

    }, 150);

  }, {
    passive: true
  });

  /* -------------------------------------------------------
     VISIBILITY
     ------------------------------------------------------- */

  document.addEventListener("visibilitychange", () => {

    if (document.hidden) return;

    handleScroll();

  });

  /* -------------------------------------------------------
     INITIAL STATE
     ------------------------------------------------------- */

  /*
   * The menu starts closed.
   */
  if (menu) {
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
  }

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }

  /*
   * Initial calculations.
   */
  handleScroll();

})();
