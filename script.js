/* =========================================================
   CESARE PARATORE — LANDING PAGE
   JavaScript
   Progressive enhancement only
   ========================================================= */

(() => {
  "use strict";


  /* =========================================================
     01. JS ENABLED
     ========================================================= */

  document.documentElement.classList.add("js-enabled");


  /* =========================================================
     02. HEADER — SCROLLED STATE
     ========================================================= */

  const header = document.querySelector(".site-header");

  if (header) {
    const SCROLL_THRESHOLD = 24;

    const updateHeader = () => {
      header.classList.toggle(
        "is-scrolled",
        window.scrollY > SCROLL_THRESHOLD
      );
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }


  /* =========================================================
     03. REVEAL — INTERSECTION OBSERVER
     ========================================================= */

  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length) {

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


    /* -------------------------------------------------------
       Reduced motion
       ------------------------------------------------------- */

    if (reducedMotion) {

      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });

    } else {

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");

            observer.unobserve(entry.target);
          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );


      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });

    }
  }


  /* =========================================================
     04. ANCHOR LINKS
     ========================================================= */

  const internalLinks = document.querySelectorAll(
    'a[href^="#"]:not([href="#"])'
  );

  internalLinks.forEach((link) => {

    link.addEventListener("click", () => {

      const targetId = link.getAttribute("href");

      if (!targetId) {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      /*
       * La posizione viene gestita da:
       * html { scroll-behavior: smooth; }
       * html { scroll-padding-top: ...; }
       *
       * Non forziamo quindi una seconda logica
       * di scroll via JavaScript.
       */

    });

  });


  /* =========================================================
     05. PAGE VISIBILITY
     ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.visibilityState === "hidden") {
        return;
      }

      /*
       * Ri-sincronizza l'header quando l'utente
       * torna sulla pagina dopo aver cambiato scheda.
       */

      if (header) {
        header.classList.toggle(
          "is-scrolled",
          window.scrollY > 24
        );
      }

    }
  );

})();
