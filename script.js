/* =========================================================
   CESARE PARATORE — SCRIPT.JS
   MASTER PRE-CODICE FINALE
   ========================================================= */

(() => {
  "use strict";


  /* =========================================================
     01 — INITIAL STATE
  ========================================================= */

  document.documentElement.classList.add("js-enabled");


  /* =========================================================
     02 — ELEMENTS
  ========================================================= */

  const body = document.body;

  const loader = document.getElementById("loader");
  const standby = document.getElementById("standby");

  const menuToggle = document.querySelector(".menu-toggle");
  const globalMenu = document.getElementById("global-menu");

  const sections = [
    ...document.querySelectorAll(".narrative-section")
  ];

  const navigation = document.querySelector(".narrative-navigation");

  const navigationTitle =
    document.querySelector(".narrative-navigation__title");

  const previousButton =
    document.querySelector(".narrative-navigation__arrow--prev");

  const nextButton =
    document.querySelector(".narrative-navigation__arrow--next");


  /* =========================================================
     03 — CONFIGURATION
  ========================================================= */

  const CONFIG = {
    loaderDuration: 1500,
    standbyDelay: 40000,
    navigationThreshold: 0.5,
    sectionScrollBehavior: "smooth"
  };


  /* =========================================================
     04 — STATE
  ========================================================= */

  let activeIndex = 0;
  let standbyTimer = null;
  let isStandbyActive = false;
  let isMenuOpen = false;

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  /* =========================================================
     05 — HELPERS
  ========================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const getSectionTitle = (section) =>
    section?.dataset?.title || "";


  const scrollToSection = (index) => {
    if (!sections.length) return;

    const safeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const target = sections[safeIndex];

    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion
        ? "auto"
        : CONFIG.sectionScrollBehavior,
      block: "start"
    });
  };


  /* =========================================================
     06 — LOADER
  ========================================================= */

  const hideLoader = () => {
    if (!loader) return;

    window.setTimeout(() => {
      loader.classList.add("is-hidden");

      window.setTimeout(() => {
        loader.setAttribute("aria-hidden", "true");
      }, 1100);

    }, CONFIG.loaderDuration);
  };


  /* =========================================================
     07 — MENU
  ========================================================= */

  const openMenu = () => {
    if (!menuToggle || !globalMenu) return;

    isMenuOpen = true;

    menuToggle.setAttribute("aria-expanded", "true");

    globalMenu.setAttribute("aria-hidden", "false");
    globalMenu.classList.add("is-open");

    body.classList.add("is-menu-open");

    resetStandby();
  };


  const closeMenu = () => {
    if (!menuToggle || !globalMenu) return;

    isMenuOpen = false;

    menuToggle.setAttribute("aria-expanded", "false");

    globalMenu.classList.remove("is-open");
    globalMenu.setAttribute("aria-hidden", "true");

    body.classList.remove("is-menu-open");

    resetStandby();
  };


  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };


  if (menuToggle) {
    menuToggle.addEventListener(
      "click",
      toggleMenu
    );
  }


  /* =========================================================
     08 — MENU LINKS
  ========================================================= */

  document
    .querySelectorAll(".global-menu__nav a")
    .forEach((link) => {

      link.addEventListener("click", () => {
        closeMenu();
        resetStandby();
      });

    });


  /* =========================================================
     09 — ESCAPE
  ========================================================= */

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

      if (isMenuOpen) {
        closeMenu();
      }

      if (isStandbyActive) {
        exitStandby();
      }

    }

  });


  /* =========================================================
     10 — REVEAL SYSTEM
  ========================================================= */

  const revealSection = (section) => {

    if (!section) return;

    section.classList.add("is-revealed");

    const portrait =
      section.querySelector(".portrait-section");

    if (portrait) {
      portrait.classList.add("is-revealed");
    }

  };


  if ("IntersectionObserver" in window) {

    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {
              revealSection(entry.target);
            }

          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );


    sections.forEach((section) => {
      revealObserver.observe(section);
    });

  } else {

    sections.forEach(revealSection);

  }


  /* =========================================================
     11 — ACTIVE SECTION
  ========================================================= */

  const setActiveSection = (index) => {

    if (!sections.length) return;

    activeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    sections.forEach(
      (section, sectionIndex) => {

        section.classList.toggle(
          "is-active",
          sectionIndex === activeIndex
        );

      }
    );


    if (navigationTitle) {

      const title =
        getSectionTitle(
          sections[activeIndex]
        );

      navigationTitle.style.opacity = "0";
      navigationTitle.style.transform =
        "translateY(8px)";


      window.setTimeout(() => {

        navigationTitle.textContent = title;

        navigationTitle.style.opacity = "1";
        navigationTitle.style.transform =
          "translateY(0)";

      }, prefersReducedMotion ? 0 : 160);

    }


    updateNavigationButtons();

  };


  /* =========================================================
     12 — SECTION OBSERVER
  ========================================================= */

  if ("IntersectionObserver" in window) {

    const sectionObserver =
      new IntersectionObserver(
        (entries) => {

          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );


          if (!visibleEntries.length) {
            return;
          }


          const currentSection =
            visibleEntries[0].target;

          const index =
            sections.indexOf(
              currentSection
            );


          if (index !== -1) {
            setActiveSection(index);
          }

        },
        {
          threshold: [
            0.2,
            0.35,
            0.5,
            0.65,
            0.8
          ],
          rootMargin:
            "-10% 0px -10% 0px"
        }
      );


    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

  }


  /* =========================================================
     13 — NAVIGATION BUTTONS
  ========================================================= */

  const updateNavigationButtons = () => {

    if (!previousButton || !nextButton) {
      return;
    }


    previousButton.disabled =
      activeIndex <= 0;


    /*
      Alla fine della sequenza il pulsante
      successivo rimane attivo e torna a GUARDA.
    */

    nextButton.disabled = false;

  };


  const goPrevious = () => {

    if (activeIndex <= 0) {
      return;
    }

    scrollToSection(activeIndex - 1);

    resetStandby();

  };


  const goNext = () => {

    if (!sections.length) return;


    if (activeIndex >= sections.length - 1) {

      scrollToSection(0);

    } else {

      scrollToSection(activeIndex + 1);

    }


    resetStandby();

  };


  if (previousButton) {
    previousButton.addEventListener(
      "click",
      goPrevious
    );
  }


  if (nextButton) {
    nextButton.addEventListener(
      "click",
      goNext
    );
  }


  /* =========================================================
     14 — KEYBOARD NAVIGATION
  ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (isMenuOpen || isStandbyActive) {
        return;
      }


      if (event.key === "ArrowLeft") {

        event.preventDefault();

        goPrevious();

      }


      if (event.key === "ArrowRight") {

        event.preventDefault();

        goNext();

      }

    }
  );


  /* =========================================================
     15 — STANDBY
  ========================================================= */

  const enterStandby = () => {

    if (
      isStandbyActive ||
      isMenuOpen ||
      document.visibilityState !== "visible"
    ) {
      return;
    }


    isStandbyActive = true;

    body.classList.add("is-standby");

    standby?.classList.add("is-active");

    standby?.setAttribute(
      "aria-hidden",
      "false"
    );

  };


  const exitStandby = () => {

    if (!isStandbyActive) {
      return;
    }


    isStandbyActive = false;

    body.classList.remove("is-standby");

    standby?.classList.remove("is-active");

    standby?.setAttribute(
      "aria-hidden",
      "true"
    );


    resetStandby();

  };


  const resetStandby = () => {

    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );
    }


    if (isStandbyActive) {
      exitStandby();
    }


    standbyTimer =
      window.setTimeout(
        enterStandby,
        CONFIG.standbyDelay
      );

  };


  /* =========================================================
     16 — ACTIVITY DETECTION
  ========================================================= */

  [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "touchmove",
    "keydown",
    "scroll"
  ].forEach((eventName) => {

    window.addEventListener(
      eventName,
      () => {
        resetStandby();
      },
      {
        passive: true
      }
    );

  });


  /* =========================================================
     17 — STANDBY FIRST INTERACTION
  ========================================================= */

  if (standby) {

    standby.addEventListener(
      "pointerdown",
      () => {
        exitStandby();
      }
    );

  }


  /* =========================================================
     18 — SMOOTH INTERNAL LINKS
  ========================================================= */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute("href");


          if (
            !href ||
            href === "#" ||
            href === "#guarda"
          ) {

            event.preventDefault();

            scrollToSection(0);

            closeMenu();

            return;

          }


          const target =
            document.querySelector(href);


          if (!target) {
            return;
          }


          event.preventDefault();

          closeMenu();

          target.scrollIntoView({
            behavior:
              prefersReducedMotion
                ? "auto"
                : "smooth",
            block: "start"
          });


          resetStandby();

        }
      );

    });


  /* =========================================================
     19 — GSAP
  ========================================================= */

  const hasGSAP =
    typeof window.gsap !== "undefined";


  const hasScrollTrigger =
    typeof window.ScrollTrigger !== "undefined";


  if (
    hasGSAP &&
    hasScrollTrigger &&
    !prefersReducedMotion
  ) {

    gsap.registerPlugin(
      ScrollTrigger
    );


    /* -------------------------------------------------------
       TITLE PRESENCE
    ------------------------------------------------------- */

    sections.forEach((section) => {

      const title =
        section.querySelector(
          ".section__title"
        );


      if (!title) return;


      if (
        section.classList.contains(
          "narrative-section--opening"
        )
      ) {
        return;
      }


      gsap.fromTo(
        title,
        {
          opacity: 0,
          y: 34
        },
        {
          opacity: 1,
          y: 0,

          ease: "none",

          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "center 42%",

            scrub: true,

            invalidateOnRefresh: true
          }
        }
      );


      gsap.to(
        title,
        {
          opacity: 0,
          y: -28,

          ease: "none",

          scrollTrigger: {
            trigger: section,
            start: "center 30%",
            end: "bottom 12%",

            scrub: true,

            invalidateOnRefresh: true
          }
        }
      );

    });


    /* -------------------------------------------------------
       BODY PRESENCE
    ------------------------------------------------------- */

    sections.forEach((section) => {

      const bodyContent =
        section.querySelector(
          ".section__body"
        );


      if (!bodyContent) return;


      gsap.fromTo(
        bodyContent,
        {
          opacity: 0,
          y: 22
        },
        {
          opacity: 1,
          y: 0,

          duration: 1,

          ease: "power2.out",

          scrollTrigger: {
            trigger: section,
            start: "top 65%",
            toggleActions:
              "play none none reverse",

            invalidateOnRefresh: true
          }
        }
      );

    });


    /* -------------------------------------------------------
       PORTRAIT
    ------------------------------------------------------- */

    document
      .querySelectorAll(
        ".portrait-section__image img"
      )
      .forEach((image) => {

        gsap.fromTo(
          image,
          {
            opacity: 0,
            scale: 1.025
          },
          {
            opacity: 1,
            scale: 1,

            duration: 1.4,

            ease: "power3.out",

            scrollTrigger: {
              trigger: image,
              start: "top 78%",
              toggleActions:
                "play none none reverse",

              invalidateOnRefresh: true
            }
          }
        );

      });


    /* -------------------------------------------------------
       TERRITORY MAP
    ------------------------------------------------------- */

    document
      .querySelectorAll(
        ".territory__map"
      )
      .forEach((map) => {

        gsap.fromTo(
          map,
          {
            opacity: 0,
            y: 24
          },
          {
            opacity: 1,
            y: 0,

            duration: 1,

            ease: "power3.out",

            scrollTrigger: {
              trigger: map,
              start: "top 78%",
              toggleActions:
                "play none none reverse",

              invalidateOnRefresh: true
            }
          }
        );

      });


    /* -------------------------------------------------------
       OPENING
       ------------------------------------------------------- */

    const openingTitle =
      document.querySelector(
        ".narrative-section--opening .section__title"
      );


    if (openingTitle) {

      gsap.fromTo(
        openingTitle,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,

          duration: 1.25,

          ease: "power3.out",

          delay: 0.15
        }
      );

    }


    /* -------------------------------------------------------
       RESIZE / REFRESH
       ------------------------------------------------------- */

    window.addEventListener(
      "resize",
      () => {

        ScrollTrigger.refresh();

      },
      {
        passive: true
      }
    );

  }


  /* =========================================================
     20 — VIEW TRANSITIONS
  ========================================================= */

  const supportsViewTransition =
    "startViewTransition" in document;


  if (supportsViewTransition) {

    document.addEventListener(
      "click",
      (event) => {

        const link =
          event.target.closest(
            'a[href]'
          );


        if (!link) return;

        const url =
          new URL(
            link.href,
            window.location.href
          );


        if (
          url.origin !==
          window.location.origin
        ) {
          return;
        }


        if (
          url.pathname ===
            window.location.pathname &&
          url.hash
        ) {
          return;
        }


        if (
          link.target === "_blank" ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }


        /*
          Il browser gestisce la navigazione.
          View Transitions vengono utilizzate
          soltanto quando la pagina interna
          espone la relativa API.
        */

      }
    );

  }


  /* =========================================================
     21 — VISIBILITY
  ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState ===
        "hidden"
      ) {

        if (standbyTimer) {
          window.clearTimeout(
            standbyTimer
          );
        }

      } else {

        resetStandby();

      }

    }
  );


  /* =========================================================
     22 — INITIALIZATION
  ========================================================= */

  setActiveSection(0);

  hideLoader();

  resetStandby();


  /* =========================================================
     23 — FINAL REFRESH
  ========================================================= */

  window.setTimeout(() => {

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {
      window.ScrollTrigger.refresh();
    }

  }, 1800);


})();
