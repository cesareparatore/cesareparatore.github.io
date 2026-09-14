/* =========================================================
   CESARE PARATORE — LANDING PAGE
   JavaScript (Progressive Enhancement)
   ========================================================= */

(() => {
  "use strict";

  /* 01. JS ENABLED INITIALIZATION */
  document.documentElement.classList.add("js-enabled");

  /* 02. HEADER — SCROLLED STATE */
  const header = document.querySelector(".site-header");
  const SCROLL_THRESHOLD = 24;

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

  if (header) {
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

  /* 03. REVEAL — INTERSECTION OBSERVER */
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length) {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    const handleMotionPreference = () => {
      if (motionQuery.matches) {
        revealElements.forEach((element) => {
          element.classList.add("is-visible");
          revealObserver.unobserve(element);
        });
      } else {
        revealElements.forEach((element) => {
          if (!element.classList.contains("is-visible")) {
            revealObserver.observe(element);
          }
        });
      }
    };

    handleMotionPreference();
    motionQuery.addEventListener("change", handleMotionPreference);
  }

  /* 04. ANCHOR LINKS & ACCESSIBLE FOCUS MANAGEMENT */
  const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  internalLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href");
      if (!targetId) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true }
        );
      }
      target.focus({ preventScroll: true });
    });
  });

  /* 05. PAGE VISIBILITY & TAB RESYNC */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateHeaderState();
    }
  });
})();
