(() => {
  "use strict";

  const body = document.body;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /*
   * JavaScript enabled
   *
   * Aggiungiamo questa classe solo quando JS è realmente disponibile.
   * In questo modo, se JS non viene caricato, tutti gli elementi
   * rimangono immediatamente visibili.
   */
  body.classList.add("js-enabled");

  /*
   * Header behavior
   *
   * Stato leggermente diverso dopo lo scroll.
   */
  const header = document.querySelector(".site-header");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle(
        "is-scrolled",
        window.scrollY > 24
      );
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }

  /*
   * Progressive reveal
   *
   * Gli elementi con .reveal vengono mostrati quando entrano
   * nella viewport.
   */
  const revealElements = document.querySelectorAll(".reveal");

  if (
    revealElements.length &&
    "IntersectionObserver" in window &&
    !prefersReducedMotion.matches
  ) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    /*
     * Reduced motion oppure browser senza IntersectionObserver:
     * tutto immediatamente visibile.
     */
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  /*
   * Smooth anchor scrolling
   *
   * Attivo solo quando l'utente non richiede reduced motion.
   */
  if (!prefersReducedMotion.matches) {
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((link) => {
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
        });
      });
  }
})();
