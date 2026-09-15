/* =========================================================
   CESARE PARATORE — MAIN SCRIPT
   Static GitHub Pages
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01 — YEAR
     ======================================================= */

  const initYear = () => {
    const yearElements = document.querySelectorAll("[data-year]");

    if (!yearElements.length) {
      return;
    }

    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  };


  /* =======================================================
     02 — HEADER / SCROLL STATE
     ======================================================= */

  const initHeader = () => {
    const header = document.querySelector(".site-header");

    if (!header) {
      return;
    }

    const updateHeader = () => {
      if (window.scrollY > 24) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  };


  /* =======================================================
     03 — SMOOTH SCROLL
     ======================================================= */

  const initSmoothScroll = () => {
    const links = document.querySelectorAll(
      'a[href^="#"]'
    );

    if (!links.length) {
      return;
    }

    links.forEach((link) => {
      link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        /*
         * Aggiorna l'URL senza generare un salto.
         * Se l'utente preferisce non avere hash nell'URL,
         * questa parte può essere rimossa.
         */
        if (history.replaceState) {
          history.replaceState(
            null,
            "",
            targetId
          );
        }
      });
    });
  };


  /* =======================================================
     04 — ACTIVE NAVIGATION
     ======================================================= */

  const initActiveNavigation = () => {
    const sections = document.querySelectorAll(
      "main section[id]"
    );

    const navLinks = document.querySelectorAll(
      '.nav a[href^="#"]'
    );

    if (!sections.length || !navLinks.length) {
      return;
    }

    const linkMap = new Map();

    navLinks.forEach((link) => {
      const targetId = link.getAttribute("href");

      if (targetId) {
        linkMap.set(targetId.substring(1), link);
      }
    });


    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => {
            link.removeAttribute("aria-current");
            link.classList.remove("is-active");
          });

          const activeLink = linkMap.get(
            entry.target.id
          );

          if (activeLink) {
            activeLink.setAttribute(
              "aria-current",
              "page"
            );

            activeLink.classList.add("is-active");
          }
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );


    sections.forEach((section) => {
      observer.observe(section);
    });
  };


  /* =======================================================
     05 — REVEAL ON SCROLL
     ======================================================= */

  const initReveal = () => {
    const elements = document.querySelectorAll(
      "[data-reveal]"
    );

    if (!elements.length) {
      return;
    }

    /*
     * Rispetta le preferenze di accessibilità.
     */
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }


    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observerInstance.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -5% 0px"
      }
    );


    elements.forEach((element) => {
      observer.observe(element);
    });
  };


  /* =======================================================
     06 — REDUCED MOTION
     ======================================================= */

  const initReducedMotion = () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) {
      document.documentElement.classList.add(
        "reduce-motion"
      );
    }


    const handleChange = (event) => {

      if (event.matches) {
        document.documentElement.classList.add(
          "reduce-motion"
        );
      } else {
        document.documentElement.classList.remove(
          "reduce-motion"
        );
      }

    };


    if (
      typeof reducedMotion.addEventListener ===
      "function"
    ) {
      reducedMotion.addEventListener(
        "change",
        handleChange
      );
    }
  };


  /* =======================================================
     07 — ESC KEY
     ======================================================= */

  const initKeyboardSupport = () => {
    document.addEventListener(
      "keydown",
      (event) => {

        if (event.key !== "Escape") {
          return;
        }

        document.activeElement?.blur();
      }
    );
  };


  /* =======================================================
     08 — INITIALIZATION
     ======================================================= */

  const init = () => {

    initYear();

    initHeader();

    initSmoothScroll();

    initActiveNavigation();

    initReveal();

    initReducedMotion();

    initKeyboardSupport();

  };


  /* =======================================================
     DOM READY
     ======================================================= */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();
