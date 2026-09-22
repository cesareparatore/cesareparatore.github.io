/* ============================================================
   CESARE PARATORE — HOME
   JS / GSAP / SCROLLTRIGGER
============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     DOM
  ========================================================== */

  const loader = document.getElementById("loader");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteMenu = document.getElementById("site-menu");
  const standby = document.getElementById("standby");

  const sections = Array.from(
    document.querySelectorAll(".narrative-section")
  );

  const prevButton = document.querySelector(
    "[data-narrative-prev]"
  );

  const nextButton = document.querySelector(
    "[data-narrative-next]"
  );

  const activeTitle = document.querySelector(
    "[data-active-title]"
  );


  /* ==========================================================
     STATE
  ========================================================== */

  let currentIndex = 0;
  let standbyTimer = null;
  let isNavigating = false;


  /* ==========================================================
     HELPERS
  ========================================================== */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const updateNavigation = () => {
    if (!prevButton || !nextButton || !activeTitle) {
      return;
    }

    const section = sections[currentIndex];

    if (!section) {
      return;
    }

    activeTitle.textContent =
      section.dataset.title || "";

    prevButton.disabled =
      currentIndex === 0;
  };


  const setCurrentSection = (index) => {
    currentIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    updateNavigation();
  };


  /* ==========================================================
     LOADER
  ========================================================== */

  const hideLoader = () => {
    if (!loader) {
      return;
    }

    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");

    document.body.classList.remove("is-locked");
  };


  const startLoader = () => {
    document.body.classList.add("is-locked");

    /*
      Il loader non dipende da GSAP.
      Deve poter scomparire anche se GSAP/CDN non è disponibile.
    */

    window.setTimeout(hideLoader, 1200);
  };


  /* ==========================================================
     MENU
  ========================================================== */

  const closeMenu = () => {
    if (!menuToggle || !siteMenu) {
      return;
    }

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    siteMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    siteMenu.classList.remove("is-open");

    document.body.classList.remove("is-locked");
  };


  const openMenu = () => {
    if (!menuToggle || !siteMenu) {
      return;
    }

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    siteMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    siteMenu.classList.add("is-open");

    document.body.classList.add("is-locked");
  };


  const toggleMenu = () => {
    if (!siteMenu) {
      return;
    }

    if (siteMenu.classList.contains("is-open")) {
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


  document
    .querySelectorAll(".site-menu__nav a")
    .forEach((link) => {

      link.addEventListener("click", () => {
        closeMenu();
      });

    });


  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {
        closeMenu();

        if (standby) {
          standby.classList.remove("is-active");
          standby.setAttribute(
            "aria-hidden",
            "true"
          );
        }
      }

    }
  );


  /* ==========================================================
     NARRATIVE NAVIGATION
  ========================================================== */

  const goToSection = (
    index,
    shouldLoop = false
  ) => {

    if (!sections.length || isNavigating) {
      return;
    }

    let targetIndex = index;

    if (
      shouldLoop &&
      targetIndex >= sections.length
    ) {
      targetIndex = 0;
    }

    targetIndex = clamp(
      targetIndex,
      0,
      sections.length - 1
    );

    const target = sections[targetIndex];

    if (!target) {
      return;
    }

    isNavigating = true;

    setCurrentSection(targetIndex);

    target.scrollIntoView({
      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
      block: "start"
    });

    window.setTimeout(() => {
      isNavigating = false;
    }, 900);

    resetStandbyTimer();
  };


  if (prevButton) {
    prevButton.addEventListener(
      "click",
      () => {
        if (currentIndex > 0) {
          goToSection(currentIndex - 1);
        }
      }
    );
  }


  if (nextButton) {
    nextButton.addEventListener(
      "click",
      () => {

        if (
          currentIndex ===
          sections.length - 1
        ) {
          goToSection(0, true);
          return;
        }

        goToSection(currentIndex + 1);
      }
    );
  }


  /* ==========================================================
     SECTION OBSERVER
  ========================================================== */

  if (sections.length) {

    const sectionObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (
              entry.isIntersecting &&
              entry.intersectionRatio >= 0.45
            ) {

              const index =
                sections.indexOf(entry.target);

              if (index !== -1) {
                setCurrentSection(index);
              }

            }

          });

        },
        {
          threshold: [0.45, 0.6]
        }
      );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

  }


  /* ==========================================================
     GSAP MOTION
  ========================================================== */

  const initMotion = () => {

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (
      reducedMotion ||
      typeof window.gsap === "undefined"
    ) {
      return;
    }

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {
      gsap.registerPlugin(ScrollTrigger);
    }


    /* --------------------------------------------------------
       INTRO
    -------------------------------------------------------- */

    const introTitle =
      document.querySelector(
        "#section-01 .section__title"
      );

    if (introTitle) {

      gsap.fromTo(
        introTitle,
        {
          opacity: 0,
          y: 28
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.3,
          ease: "power3.out",
          delay: 0.45
        }
      );

    }


    /* --------------------------------------------------------
       NARRATIVE BODY
    -------------------------------------------------------- */

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {

      sections
        .filter(
          (section) =>
            section.id !== "section-01"
        )
        .forEach((section) => {

          const body =
            section.querySelector(
              ".section__body"
            );

          if (!body) {
            return;
          }

          gsap.fromTo(
            body,
            {
              opacity: 0,
              y: 32
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",

              scrollTrigger: {
                trigger: section,
                start: "top 70%",
                end: "top 35%",
                toggleActions:
                  "play none none reverse"
              }
            }
          );

        });


      /* ------------------------------------------------------
         TERRITORY MAP
      ------------------------------------------------------ */

      const map =
        document.querySelector(
          ".territory-map"
        );

      if (map) {

        gsap.fromTo(
          map,
          {
            opacity: 0,
            y: 35
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",

            scrollTrigger: {
              trigger: "#section-11",
              start: "top 70%",
              toggleActions:
                "play none none reverse"
            }
          }
        );

      }


      /* ------------------------------------------------------
         PORTRAIT
      ------------------------------------------------------ */

      const portrait =
        document.querySelector(
          ".portrait"
        );

      if (portrait) {

        gsap.fromTo(
          portrait,
          {
            opacity: 0,
            y: 40
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",

            scrollTrigger: {
              trigger: "#section-13",
              start: "top 70%",
              toggleActions:
                "play none none reverse"
            }
          }
        );

      }

    }

  };


  /* ==========================================================
     STANDBY
  ========================================================== */

  const STANDBY_DELAY = 40000;


  const clearStandbyTimer = () => {

    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );

      standbyTimer = null;
    }

  };


  const showStandby = () => {

    if (!standby) {
      return;
    }

    closeMenu();

    standby.classList.add("is-active");

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

  };


  const hideStandby = () => {

    if (!standby) {
      return;
    }

    standby.classList.remove(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

  };


  const resetStandbyTimer = () => {

    clearStandbyTimer();

    hideStandby();

    standbyTimer =
      window.setTimeout(
        showStandby,
        STANDBY_DELAY
      );

  };


  [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach((eventName) => {

    window.addEventListener(
      eventName,
      () => {

        if (
          standby &&
          standby.classList.contains(
            "is-active"
          )
        ) {

          hideStandby();

          /*
            Dopo il ritorno dallo standby
            il browser conserva la posizione
            precedente del documento.
          */

        }

        resetStandbyTimer();

      },
      {
        passive: true
      }
    );

  });


  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  const init = () => {

    setCurrentSection(0);

    startLoader();

    initMotion();

    resetStandbyTimer();

  };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();

  }

})();
