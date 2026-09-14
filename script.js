/* =========================================================
   CESARE PARATORE — LANDING PAGE
   JavaScript
   Progressive Enhancement
   ========================================================= */

(() => {
  "use strict";


  /* =========================================================
     01. DOCUMENT STATE
     ========================================================= */

  document.documentElement.classList.add("js-enabled");


  /* =========================================================
     02. HEADER — SCROLLED STATE
     ========================================================= */

  const header = document.querySelector(".site-header");

  if (header) {

    const updateHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };


    updateHeaderState();


    window.addEventListener(
      "scroll",
      updateHeaderState,
      {
        passive: true
      }
    );

  }


  /* =========================================================
     03. REVEAL — INTERSECTION OBSERVER
     ========================================================= */

  const revealElements = document.querySelectorAll(".reveal");


  if (revealElements.length) {

    /*
     * Se il browser supporta IntersectionObserver,
     * gli elementi vengono animati quando entrano
     * nel viewport.
     */

    if ("IntersectionObserver" in window) {

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
          root: null,
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.05
        }
      );


      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });

    } else {

      /*
       * Fallback per browser molto vecchi.
       */

      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });

    }

  }


  /* =========================================================
     04. REDUCED MOTION
     ========================================================= */

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  if (reducedMotionQuery.matches) {

    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

  }


  /* =========================================================
     05. KEYBOARD / HASH NAVIGATION
     ========================================================= */

  /*
   * Quando si arriva a una sezione tramite un anchor,
   * il browser gestisce già lo scroll grazie a CSS.
   *
   * Questo blocco evita che un elemento con focus
   * rimanga in una posizione poco leggibile.
   */

  window.addEventListener("hashchange", () => {

    const targetId = window.location.hash.slice(1);

    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    window.setTimeout(() => {

      target.setAttribute("tabindex", "-1");

      target.focus({
        preventScroll: true
      });

    }, 50);

  });


  /* =========================================================
     06. INITIAL HASH
     ========================================================= */

  if (window.location.hash) {

    window.setTimeout(() => {

      const targetId = window.location.hash.slice(1);

      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      target.setAttribute("tabindex", "-1");

    }, 0);

  }

})();
