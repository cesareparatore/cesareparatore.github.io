(() => {
  "use strict";

  const root = document.documentElement;

  /*
   * JavaScript enabled
   * Activates progressive-enhancement styles.
   */
  root.classList.add("js-enabled");

  /*
   * Reduced motion
   */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /*
   * Header behavior
   * Adds a subtle state after the user scrolls.
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

    window.addEventListener("scroll", updateHeader, {
      passive: true
    });
  }

  /*
   * Progressive reveal
   */
  const revealElements = document.querySelectorAll(
    ".section, .final-signature"
  );

  if (prefersReducedMotion.matches) {
    revealElements.forEach((element) => {
      element.classList.add("reveal", "is-visible");
    });
  } else if ("IntersectionObserver" in window) {
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
      element.classList.add("reveal");
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("reveal", "is-visible");
    });
  }

  /*
   * Smooth anchor scrolling
   */
  if (!prefersReducedMotion.matches) {
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((link) => {
        link.addEventListener("click", (event) => {
          const targetId = link.getAttribute("href");

          if (!targetId || targetId === "#") return;

          let target;

          try {
            target = document.querySelector(targetId);
          } catch {
            return;
          }

          if (!target) return;

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

          /*
           * Keep keyboard navigation / URL state meaningful.
           */
          if (history.pushState) {
            history.pushState(null, "", targetId);
          }
        });
      });
  }
})();
