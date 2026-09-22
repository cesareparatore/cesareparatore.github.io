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


  /* ==========================================================
     STATE
  ========================================================== */

  let currentIndex = 0;
  let standbyTimer = null;
  let standbyActive = false;


  /* ==========================================================
     LOADER
  ========================================================== */

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");

    document.body.classList.remove("is-locked");
  };


  const startLoader = () => {
    document.body.classList.add("is-locked");

    /*
      Il loader non dipende da GSAP.
      La pagina può quindi entrare anche se
      il motion engine non è disponibile.
    */

    window.setTimeout(hideLoader, 1200);
  };


  /* ==========================================================
     MENU
  ========================================================== */

  const openMenu = () => {
    if (!menuToggle || !siteMenu) return;

    siteMenu.classList.add("is-open");

    siteMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    document.body.classList.add("is-locked");
  };


  const closeMenu = () => {
    if (!menuToggle || !siteMenu) return;

    siteMenu.classList.remove("is-open");

    siteMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove("is-locked");
  };


  if (menuToggle) {

    menuToggle.addEventListener(
      "click",
      () => {

        if (
          siteMenu.classList.contains("is-open")
        ) {
          closeMenu();
        } else {
          openMenu();
        }

      }
    );

  }


  document
    .querySelectorAll(".site-menu__nav a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        closeMenu
      );

    });


  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {
        closeMenu();
        hideStandby();
      }

    }
  );


  /* ==========================================================
     NARRATIVE NAVIGATION
     NORMAL DOCUMENT FLOW
  ========================================================== */

  const scrollToSection = (index) => {

    if (!sections[index]) return;

    sections[index].scrollIntoView({
      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
      block: "start"
    });

    resetStandbyTimer();

  };


  document
    .querySelectorAll("[data-next]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          if (
            currentIndex ===
            sections.length - 1
          ) {

            scrollToSection(0);

            return;
          }

          scrollToSection(
            currentIndex + 1
          );

        }
      );

    });


  document
    .querySelectorAll("[data-prev]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          if (currentIndex <= 0) {
            return;
          }

          scrollToSection(
            currentIndex - 1
          );

        }
      );

    });


  /* ==========================================================
     ACTIVE SECTION
  ========================================================== */

  const updateActiveSection = (index) => {

    currentIndex = index;

    document
      .querySelectorAll(".narrative-navigation")
      .forEach((navigation, navigationIndex) => {

        const section =
          navigation.closest(
            ".narrative-section"
          );

        if (!section) return;

        const sectionIndex =
          sections.indexOf(section);

        const title =
          navigation.querySelector(
            ".narrative-navigation__title"
          );

        const previous =
          navigation.querySelector(
            "[data-prev]"
          );

        if (title) {
          title.textContent =
            section.dataset.title || "";
        }

        if (previous) {
          previous.disabled =
            sectionIndex === 0;
        }

        /*
          La navigazione appartiene alla singola
          sezione e rimane nel normale document flow.
        */

        navigation.dataset.active =
          sectionIndex === index
            ? "true"
            : "false";

      });

  };


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
              updateActiveSection(index);
            }

          }

        });

      },
      {
        threshold: [0.45]
      }
    );


  sections.forEach((section) => {
    sectionObserver.observe(section);
  });


  /* ==========================================================
     MOTION
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

      gsap.registerPlugin(
        ScrollTrigger
      );

    }


    /* --------------------------------------------------------
       GUARDA.
    -------------------------------------------------------- */

    const introTitle =
      document.querySelector(
        ".narrative-section--intro .section__title"
      );

    if (introTitle) {

      gsap.fromTo(
        introTitle,
        {
          opacity: 0,
          y: 24
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.25,
          ease: "power3.out",
          delay: 0.35
        }
      );

    }


    if (
      typeof window.ScrollTrigger ===
      "undefined"
    ) {
      return;
    }


    /* --------------------------------------------------------
       BODY
    -------------------------------------------------------- */

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

        if (!body) return;

        gsap.fromTo(
          body,
          {
            opacity: 0,
            y: 28
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",

            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              end: "top 42%",
              toggleActions:
                "play none none reverse"
            }

          }
        );

      });


    /* --------------------------------------------------------
       TERRITORY
    -------------------------------------------------------- */

    const map =
      document.querySelector(
        ".territory-map"
      );

    if (map) {

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
            trigger: "#section-11",
            start: "top 72%",
            toggleActions:
              "play none none reverse"
          }
        }
      );

    }


    /* --------------------------------------------------------
       PORTRAIT
    -------------------------------------------------------- */

    const portrait =
      document.querySelector(
        ".portrait"
      );

    if (portrait) {

      gsap.fromTo(
        portrait,
        {
          opacity: 0,
          y: 24
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",

          scrollTrigger: {
            trigger: "#section-13",
            start: "top 72%",
            toggleActions:
              "play none none reverse"
          }
        }
      );

    }

  };


  /* ==========================================================
     STANDBY
  ========================================================== */

  const STANDBY_DELAY = 40000;


  const clearStandbyTimer = () => {

    if (standbyTimer !== null) {

      window.clearTimeout(
        standbyTimer
      );

      standbyTimer = null;

    }

  };


  const showStandby = () => {

    if (!standby) return;

    standbyActive = true;

    standby.classList.add(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

  };


  function hideStandby() {

    if (!standby) return;

    standbyActive = false;

    standby.classList.remove(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  const resetStandbyTimer = () => {

    clearStandbyTimer();

    if (standbyActive) {
      hideStandby();
    }

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

    updateActiveSection(0);

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
