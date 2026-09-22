/* CESARE PARATORE — HOME
   Master → Implementation
   No autonomous content or design decisions.
*/

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const body = document.body;
  const loader = document.querySelector("[data-loader]");
  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuClose = document.querySelector("[data-menu-close]");
  const standby = document.querySelector("[data-standby]");

  const sections = Array.from(
    document.querySelectorAll("[data-section]")
  );

  const titles = Array.from(
    document.querySelectorAll("[data-section-title]")
  );

  const prevButton = document.querySelector("[data-nav-prev]");
  const nextButton = document.querySelector("[data-nav-next]");
  const activeTitle = document.querySelector("[data-active-title]");

  let currentIndex = 0;
  let standbyTimer = null;
  let isNavigating = false;

  /* -------------------------------------------------------
     LOADER / SIPARIO
  ------------------------------------------------------- */

  function enterSite() {
    if (!loader) {
      body.classList.add("is-ready");
      return;
    }

    const enter = () => {
      loader.classList.add("is-hidden");
      body.classList.add("is-ready");

      window.setTimeout(() => {
        loader.setAttribute("aria-hidden", "true");
      }, reducedMotion ? 0 : 900);
    };

    if (reducedMotion) {
      enter();
      return;
    }

    window.setTimeout(enter, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enterSite, {
      once: true
    });
  } else {
    enterSite();
  }

  /* -------------------------------------------------------
     MENU
  ------------------------------------------------------- */

  function openMenu() {
    if (!menu) return;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    body.classList.add("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
    }
  }

  function closeMenu() {
    if (!menu) return;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (menu && menu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  if (menu) {
    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        closeMenu();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  /* -------------------------------------------------------
     NARRATIVE SECTIONS
  ------------------------------------------------------- */

  function updateNavigation(index) {
    currentIndex = index;

    if (activeTitle && titles[index]) {
      activeTitle.textContent = titles[index].textContent;
    }

    if (prevButton) {
      prevButton.disabled = index === 0;
      prevButton.setAttribute(
        "aria-disabled",
        index === 0 ? "true" : "false"
      );
    }

    if (nextButton) {
      nextButton.disabled = false;
      nextButton.setAttribute("aria-disabled", "false");
    }

    sections.forEach((section, sectionIndex) => {
      const isActive = sectionIndex === index;

      section.classList.toggle("is-active", isActive);
      section.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  function goToSection(index) {
    if (!sections.length || isNavigating) return;

    const targetIndex = Math.max(
      0,
      Math.min(index, sections.length - 1)
    );

    if (targetIndex === currentIndex) return;

    isNavigating = true;

    const currentSection = sections[currentIndex];
    const targetSection = sections[targetIndex];

    if (!currentSection || !targetSection) {
      isNavigating = false;
      return;
    }

    if (reducedMotion) {
      currentSection.classList.remove("is-active");
      targetSection.classList.add("is-active");
      updateNavigation(targetIndex);

      targetSection.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      isNavigating = false;
      return;
    }

    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    window.setTimeout(() => {
      updateNavigation(targetIndex);
      isNavigating = false;
    }, 700);
  }

  function goPrevious() {
    if (currentIndex <= 0) return;
    goToSection(currentIndex - 1);
  }

  function goNext() {
    if (!sections.length) return;

    if (currentIndex >= sections.length - 1) {
      goToSection(0);
      return;
    }

    goToSection(currentIndex + 1);
  }

  if (prevButton) {
    prevButton.addEventListener("click", goPrevious);
  }

  if (nextButton) {
    nextButton.addEventListener("click", goNext);
  }

  /* -------------------------------------------------------
     ACTIVE SECTION DETECTION
  ------------------------------------------------------- */

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (!visible.length || isNavigating) return;

        const index = sections.indexOf(visible[0].target);

        if (index !== -1 && index !== currentIndex) {
          updateNavigation(index);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-10% 0px -10% 0px"
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* -------------------------------------------------------
     KEYBOARD NAVIGATION
  ------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (body.classList.contains("menu-open")) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  });

  /* -------------------------------------------------------
     STANDBY
  ------------------------------------------------------- */

  function showStandby() {
    if (!standby) return;

    standby.classList.add("is-visible");
    standby.setAttribute("aria-hidden", "false");
  }

  function hideStandby() {
    if (!standby) return;

    standby.classList.remove("is-visible");
    standby.setAttribute("aria-hidden", "true");
  }

  function resetStandbyTimer() {
    if (!standby) return;

    if (standbyTimer) {
      window.clearTimeout(standbyTimer);
    }

    hideStandby();

    standbyTimer = window.setTimeout(() => {
      showStandby();
    }, 40000);
  }

  [
    "pointermove",
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(eventName, resetStandbyTimer, {
      passive: eventName !== "keydown"
    });
  });

  if (standby) {
    standby.addEventListener("click", () => {
      hideStandby();

      const currentSection = sections[currentIndex];

      if (currentSection) {
        currentSection.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }

      resetStandbyTimer();
    });
  }

  resetStandbyTimer();

  /* -------------------------------------------------------
     GSAP / SCROLLTRIGGER
  ------------------------------------------------------- */

  function initMotion() {
    if (reducedMotion) return;

    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    sections.forEach((section) => {
      const title = section.querySelector(
        "[data-section-heading]"
      );

      const content = section.querySelector(
        "[data-section-content]"
      );

      if (title) {
        gsap.fromTo(
          title,
          {
            opacity: 0,
            y: 24,
            scale: 0.985
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true
            }
          }
        );
      }

      if (content) {
        gsap.fromTo(
          content,
          {
            opacity: 0,
            y: 18
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 66%",
              once: true
            }
          }
        );
      }
    });

    ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotion, {
      once: true
    });
  } else {
    initMotion();
  }

  /* -------------------------------------------------------
     INITIAL STATE
  ------------------------------------------------------- */

  if (sections.length) {
    updateNavigation(0);
  }

})();
