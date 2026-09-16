/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   JavaScript — MASTER
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     ROOT
     ------------------------------------------------------- */

  document.documentElement.classList.add("js");

  const body = document.body;

  /* -------------------------------------------------------
     ELEMENTS
     ------------------------------------------------------- */

  const loader = document.querySelector(".site-loader");
  const header = document.querySelector(".site-header");

  const progressBar = document.querySelector("#scroll-progress");
  const sectionIndex = document.querySelector("#section-index");

  const menu = document.querySelector("#site-menu");
  const menuToggle = document.querySelector("#menu-toggle");
  const menuBackdrop = document.querySelector(".menu-backdrop");

  const menuLinks = menu
    ? [...menu.querySelectorAll("nav a")]
    : [];

  const revealElements = [
    ...document.querySelectorAll("[data-reveal]")
  ];

  const sections = [
    ...document.querySelectorAll("main section[data-section]")
  ];

  const directionItems = [
    ...document.querySelectorAll(".direction-item")
  ];

  /* -------------------------------------------------------
     STATE
     ------------------------------------------------------- */

  let menuOpen = false;
  let lastFocusedElement = null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* =======================================================
     LOADER
     ======================================================= */

  function hideLoader() {

    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 800);
  }

  if (reducedMotion.matches) {
    hideLoader();
  } else {
    window.setTimeout(hideLoader, 1000);
  }

  /* =======================================================
     HEADER
     ======================================================= */

  function updateHeader() {

    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 20
    );
  }

  /* =======================================================
     SCROLL PROGRESS
     ======================================================= */

  function updateProgress() {

    if (!progressBar) return;

    const scrollable =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (scrollable <= 0) {
      progressBar.style.transform = "scaleX(0)";
      return;
    }

    const progress =
      Math.min(
        1,
        Math.max(
          0,
          window.scrollY / scrollable
        )
      );

    progressBar.style.transform =
      `scaleX(${progress})`;
  }

  /* =======================================================
     SECTION INDEX
     ======================================================= */

  function updateSectionIndex() {

    if (!sectionIndex || !sections.length) {
      return;
    }

    const reference =
      window.scrollY +
      window.innerHeight * 0.35;

    let current = sections[0];

    for (const section of sections) {

      if (section.offsetTop <= reference) {
        current = section;
      }
    }

    const number =
      current.dataset.section || "01";

    sectionIndex.textContent =
      `${number} / 10`;
  }

  /* =======================================================
     SCROLL
     ======================================================= */

  let ticking = false;

  function handleScroll() {

    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {

      updateHeader();
      updateProgress();
      updateSectionIndex();

      ticking = false;
    });
  }

  window.addEventListener(
    "scroll",
    handleScroll,
    {
      passive: true
    }
  );

  /* =======================================================
     REVEALS
     ======================================================= */

  function revealImmediately() {

    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  if (
    reducedMotion.matches ||
    !("IntersectionObserver" in window)
  ) {

    revealImmediately();

  } else {

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
          threshold: 0.08,
          rootMargin: "0px 0px -40px 0px"
        }
      );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /* =======================================================
     MENU
     ======================================================= */

  function getMenuFocusable() {

    if (!menu) return [];

    return [
      ...menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ].filter(
      (element) =>
        element.offsetParent !== null
    );
  }

  function openMenu() {

    if (!menu || !menuToggle) {
      return;
    }

    if (menuOpen) {
      return;
    }

    menuOpen = true;

    lastFocusedElement =
      document.activeElement;

    body.classList.add("menu-open");

    menu.removeAttribute("inert");

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Chiudi il menu"
    );

    const focusable =
      getMenuFocusable();

    if (focusable.length) {

      window.setTimeout(() => {
        focusable[0].focus();
      }, 80);
    }
  }

  function closeMenu(
    restoreFocus = true
  ) {

    if (!menu || !menuToggle) {
      return;
    }

    if (!menuOpen) {
      return;
    }

    menuOpen = false;

    body.classList.remove("menu-open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menu.setAttribute(
      "inert",
      ""
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Apri il menu"
    );

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {

      window.setTimeout(() => {
        lastFocusedElement.focus();
      }, 50);
    }
  }

  if (menuToggle) {

    menuToggle.addEventListener(
      "click",
      () => {

        if (menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );
  }

  if (menuBackdrop) {

    menuBackdrop.addEventListener(
      "click",
      () => {
        closeMenu();
      }
    );
  }

  menuLinks.forEach((link) => {

    link.addEventListener(
      "click",
      () => {
        closeMenu(false);
      }
    );
  });

  /* =======================================================
     MENU KEYBOARD
     ======================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (!menuOpen) return;

      if (event.key === "Escape") {

        event.preventDefault();

        closeMenu();

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable =
        getMenuFocusable();

      if (!focusable.length) {
        return;
      }

      const first =
        focusable[0];

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
     DIRECTIONS
     ======================================================= */

  directionItems.forEach((item) => {

    const activate = () => {

      directionItems.forEach(
        (other) => {
          other.classList.remove(
            "is-active"
          );
        }
      );

      item.classList.add(
        "is-active"
      );
    };

    item.addEventListener(
      "mouseenter",
      activate
    );

    item.addEventListener(
      "focus",
      activate
    );
  });

  /* =======================================================
     SAME PAGE ANCHORS
     ======================================================= */

  document.addEventListener(
    "click",
    (event) => {

      const link =
        event.target.closest("a");

      if (!link) return;

      const href =
        link.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        return;
      }

      const target =
        document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      closeMenu(false);

      const headerHeight =
        header
          ? header.offsetHeight
          : 0;

      const position =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: position,
        behavior:
          reducedMotion.matches
            ? "auto"
            : "smooth"
      });

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

  /* =======================================================
     ESCAPE ON RESIZE / ORIENTATION
     ======================================================= */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {

      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(() => {

          if (
            window.innerWidth > 1050 &&
            menuOpen
          ) {
            closeMenu(false);
          }

          handleScroll();

        }, 120);
    },
    {
      passive: true
    }
  );

  /* =======================================================
     VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState ===
        "visible"
      ) {
        handleScroll();
      }
    }
  );

  /* =======================================================
     INITIAL MENU STATE
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

    menuToggle.setAttribute(
      "aria-label",
      "Apri il menu"
    );
  }

  /* =======================================================
     INITIAL RENDER
     ======================================================= */

  handleScroll();

})();
