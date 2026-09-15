/* =========================================================
   CESARE PARATORE — DIGITAL HEADQUARTERS
   INTERACTION SYSTEM
   Version: 15.09.2026
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     01. DOM READY
     ------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    initYear();
    initReveal();
    initSmoothAnchors();
    initHeader();
    initActiveNavigation();
    initExternalLinks();
    initImageProtection();
  });


  /* -------------------------------------------------------
     02. CURRENT YEAR
     ------------------------------------------------------- */

  function initYear() {
    const yearElements = document.querySelectorAll("[data-year]");

    if (!yearElements.length) return;

    const year = new Date().getFullYear();

    yearElements.forEach((element) => {
      element.textContent = year;
    });
  }


  /* -------------------------------------------------------
     03. REVEAL ON SCROLL
     ------------------------------------------------------- */

  function initReveal() {
    const elements = document.querySelectorAll(
      ".reveal, [data-reveal]"
    );

    if (!elements.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }


  /* -------------------------------------------------------
     04. SMOOTH ANCHOR NAVIGATION
     ------------------------------------------------------- */

  function initSmoothAnchors() {
    const anchors = document.querySelectorAll(
      'a[href^="#"]'
    );

    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });

        /*
         * Aggiorna l'URL senza provocare il salto
         * automatico del browser.
         */
        if (history.pushState) {
          history.pushState(null, "", targetId);
        }
      });
    });
  }


  /* -------------------------------------------------------
     05. HEADER — SCROLL STATE
     ------------------------------------------------------- */

  function initHeader() {
    const header = document.querySelector(
      ".site-header, header"
    );

    if (!header) return;

    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;

      header.classList.toggle(
        "is-scrolled",
        scrollY > 40
      );

      ticking = false;
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        window.requestAnimationFrame(updateHeader);
        ticking = true;
      },
      { passive: true }
    );
  }


  /* -------------------------------------------------------
     06. ACTIVE NAVIGATION
     ------------------------------------------------------- */

  function initActiveNavigation() {
    const navigationLinks = document.querySelectorAll(
      'nav a[href^="#"], .nav a[href^="#"]'
    );

    if (!navigationLinks.length) return;

    const sections = [];

    navigationLinks.forEach((link) => {
      const id = link.getAttribute("href");

      if (!id || id === "#") return;

      const section = document.querySelector(id);

      if (section) {
        sections.push({
          section,
          link
        });
      }
    });

    if (!sections.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          sections.forEach(({ link }) => {
            link.classList.remove("is-active");
          });

          const current = sections.find(
            ({ section }) => section === entry.target
          );

          if (current) {
            current.link.classList.add("is-active");
          }
        });
      },
      {
        threshold: reduceMotion ? 0.1 : 0.35,
        rootMargin: "-15% 0px -55% 0px"
      }
    );

    sections.forEach(({ section }) => {
      observer.observe(section);
    });
  }


  /* -------------------------------------------------------
     07. EXTERNAL LINKS
     ------------------------------------------------------- */

  function initExternalLinks() {
    const links = document.querySelectorAll(
      'a[href^="http://"], a[href^="https://"]'
    );

    links.forEach((link) => {
      const currentHost = window.location.hostname;

      try {
        const url = new URL(link.href);

        if (
          url.hostname &&
          url.hostname !== currentHost
        ) {
          link.setAttribute(
            "rel",
            "noopener noreferrer"
          );
        }
      } catch {
        /* URL non valida: nessuna modifica */
      }
    });
  }


  /* -------------------------------------------------------
     08. IMAGE LOADING
     ------------------------------------------------------- */

  function initImageProtection() {
    const images = document.querySelectorAll(
      "img"
    );

    images.forEach((image) => {
      /*
       * Lazy loading solo per immagini non critiche.
       * Logo e immagini già esplicitamente eager
       * non vengono modificati.
       */
      if (
        !image.hasAttribute("loading") &&
        !image.closest(".hero")
      ) {
        image.setAttribute(
          "loading",
          "lazy"
        );
      }

      if (
        !image.hasAttribute("decoding")
      ) {
        image.setAttribute(
          "decoding",
          "async"
        );
      }
    });
  }


  /* -------------------------------------------------------
     09. KEYBOARD ACCESSIBILITY
     ------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    /*
     * Evita effetti grafici o comportamenti invasivi
     * quando l'utente naviga da tastiera.
     */
    if (event.key === "Tab") {
      document.documentElement.classList.add(
        "keyboard-navigation"
      );
    }
  });


  document.addEventListener("mousedown", () => {
    document.documentElement.classList.remove(
      "keyboard-navigation"
    );
  });


  /* -------------------------------------------------------
     10. PAGE VISIBILITY
     ------------------------------------------------------- */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        document.documentElement.classList.add(
          "page-hidden"
        );
      } else {
        document.documentElement.classList.remove(
          "page-hidden"
        );
      }
    }
  );


  /* -------------------------------------------------------
     11. BACK / FORWARD NAVIGATION
     ------------------------------------------------------- */

  window.addEventListener("popstate", () => {
    /*
     * Mantiene il comportamento naturale del browser
     * quando si utilizzano avanti/indietro.
     */
    const hash = window.location.hash;

    if (!hash) return;

    const target = document.querySelector(hash);

    if (!target) return;

    target.scrollIntoView({
      behavior: "auto",
      block: "start"
    });
  });

})();
