(() => {
  "use strict";

  const initHeader = () => {
    const header = document.querySelector(".site-header");

    if (!header) {
      return;
    }

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true
    });
  };

  const initReveal = () => {
    const elements = document.querySelectorAll(
      ".content-section, .content-card, .link-card, .credential"
    );

    if (!elements.length) {
      return;
    }

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    if (!("IntersectionObserver" in window)) {
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
          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    elements.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  };

  const initCurrentYear = () => {
    const yearElements = document.querySelectorAll(
      "[data-current-year]"
    );

    if (!yearElements.length) {
      return;
    }

    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initReveal();
    initCurrentYear();
  });
})();
