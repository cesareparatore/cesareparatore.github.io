/* =========================================================
   CESARE PARATORE — HOME
   JAVASCRIPT
   Master-driven implementation
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01 — ELEMENTS
  ======================================================== */

  const body = document.body;
  const loader = document.getElementById("loader");
  const menuToggle = document.querySelector(".menu-toggle");
  const globalMenu = document.getElementById("global-menu");

  const sections = Array.from(
    document.querySelectorAll(".narrative-section")
  );

  const navigation = document.querySelector(".narrative-navigation");
  const navigationTitle = document.querySelector(
    ".narrative-navigation__title"
  );

  const previousButton = document.querySelector(
    ".narrative-navigation__button--prev"
  );

  const nextButton = document.querySelector(
    ".narrative-navigation__button--next"
  );

  const standby = document.getElementById("standby");


  /* =======================================================
     02 — STATE
  ======================================================== */

  let activeSectionIndex = 0;
  let standbyTimer = null;
  let loaderHidden = false;

  const STANDBY_DELAY = 40000;

  const sectionTitles = sections.map((section) => {
    const title = section.querySelector(".section__title");

    return title
      ? title.textContent.trim()
      : "";
  });


  /* =======================================================
     03 — SAFE LOADER
     
     Il loader non dipende da GSAP, ScrollTrigger
     o da nessun'altra parte del sistema.
  ======================================================== */

  const hideLoader = () => {
    if (loaderHidden || !loader) return;

    loaderHidden = true;

    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");

    body.classList.remove("is-loading");
  };


  body.classList.add("is-loading");


  /*
     Prima possibilità:
     DOM pronto.
  */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      hideLoader,
      { once: true }
    );

  } else {

    hideLoader();

  }


  /*
     Fallback assoluto.
     Il loader non può restare bloccato
     per un errore JavaScript.
  */

  window.setTimeout(hideLoader, 2500);


  /* =======================================================
     04 — MENU
  ======================================================== */

  const closeMenu = () => {

    if (!menuToggle || !globalMenu) return;

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    globalMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    globalMenu.classList.remove("is-open");

    body.classList.remove("is-menu-open");

  };


  const openMenu = () => {

    if (!menuToggle || !globalMenu) return;

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    globalMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    globalMenu.classList.add("is-open");

    body.classList.add("is-menu-open");

  };


  if (menuToggle && globalMenu) {

    menuToggle.addEventListener("click", () => {

      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }

    });


    globalMenu
      .querySelectorAll("a")
      .forEach((link) => {

        link.addEventListener(
          "click",
          closeMenu
        );

      });

  }


  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
      closeMenu();
    }

  });


  /* =======================================================
     05 — SECTION NAVIGATION
  ======================================================== */

  const updateNavigation = () => {

    if (!navigationTitle) return;

    navigationTitle.textContent =
      sectionTitles[activeSectionIndex] || "";

    if (previousButton) {

      previousButton.disabled =
        activeSectionIndex === 0;

    }

    if (nextButton) {

      nextButton.disabled = false;

    }

  };


  const setActiveSection = (index) => {

    if (!sections.length) return;

    activeSectionIndex = Math.max(
      0,
      Math.min(index, sections.length - 1)
    );

    updateNavigation();

  };


  const scrollToSection = (index) => {

    if (!sections.length) return;

    let targetIndex = index;

    /*
       Previous from first section remains disabled.
    */

    if (targetIndex < 0) {
      targetIndex = 0;
    }

    /*
       Next from the final section loops
       back to GUARDA.
    */

    if (targetIndex >= sections.length) {
      targetIndex = 0;
    }

    const target = sections[targetIndex];

    if (!target) return;

    setActiveSection(targetIndex);

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  };


  if (previousButton) {

    previousButton.addEventListener(
      "click",
      () => {

        if (activeSectionIndex <= 0) {
          return;
        }

        scrollToSection(
          activeSectionIndex - 1
        );

      }
    );

  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      () => {

        scrollToSection(
          activeSectionIndex + 1
        );

      }
    );

  }


  /* =======================================================
     06 — KEYBOARD NAVIGATION
  ======================================================== */

  document.addEventListener("keydown", (event) => {

    /*
       Do not hijack keyboard arrows while
       interacting with form controls.
    */

    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLButtonElement
    ) {
      return;
    }


    if (event.key === "ArrowLeft") {

      if (activeSectionIndex > 0) {

        scrollToSection(
          activeSectionIndex - 1
        );

      }

    }


    if (event.key === "ArrowRight") {

      scrollToSection(
        activeSectionIndex + 1
      );

    }

  });


  /* =======================================================
     07 — ACTIVE SECTION OBSERVER
  ======================================================== */

  if (sections.length) {

    const sectionObserver =
      new IntersectionObserver(
        (entries) => {

          const visibleSections =
            entries
              .filter(
                (entry) => entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (!visibleSections.length) {
            return;
          }

          const active =
            visibleSections[0].target;

          const index =
            sections.indexOf(active);

          if (index !== -1) {
            setActiveSection(index);
          }

        },
        {
          threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
          rootMargin:
            "-10% 0px -10% 0px"
        }
      );


    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

  }


  /* =======================================================
     08 — INITIAL SECTION
  ======================================================== */

  setActiveSection(0);


  /* =======================================================
     09 — NATIVE REVEAL
     
     Funziona anche senza GSAP.
  ======================================================== */

  const revealTargets = document.querySelectorAll(
    ".narrative-section:not(.narrative-section--opening)"
  );


  if (
    "IntersectionObserver" in window &&
    revealTargets.length
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );

          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );


    revealTargets.forEach((section) => {
      revealObserver.observe(section);
    });

  } else {

    revealTargets.forEach((section) => {
      section.classList.add("is-visible");
    });

  }


  /* =======================================================
     10 — INTERNAL LINKS
  ======================================================== */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener("click", (event) => {

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href === "#" ||
          href.length < 2
        ) {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        closeMenu();

        const index =
          sections.indexOf(target);

        if (index !== -1) {
          setActiveSection(index);
        }

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        /*
           Mantiene l'URL coerente con la sezione
           senza provocare un salto.
        */

        if (
          window.history &&
          window.history.replaceState
        ) {

          window.history.replaceState(
            null,
            "",
            href
          );

        }

      });

    });


  /* =======================================================
     11 — STANDBY
  ======================================================== */

  const resetStandbyTimer = () => {

    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );
    }

    if (
      document.hidden ||
      !standby ||
      body.classList.contains("is-menu-open")
    ) {
      return;
    }

    standbyTimer =
      window.setTimeout(
        enterStandby,
        STANDBY_DELAY
      );

  };


  function enterStandby() {

    if (!standby) return;

    if (
      body.classList.contains("is-menu-open")
    ) {
      resetStandbyTimer();
      return;
    }

    standby.classList.add(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

    body.classList.add(
      "is-standby"
    );

  }


  const exitStandby = () => {

    if (!standby) return;

    standby.classList.remove(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove(
      "is-standby"
    );

    /*
       Nessun scroll viene effettuato:
       la pagina torna esattamente al punto
       in cui si trovava.
    */

    resetStandbyTimer();

  };


  [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach((eventName) => {

    document.addEventListener(
      eventName,
      () => {

        if (
          standby &&
          standby.classList.contains("is-active")
        ) {
          exitStandby();
        }

        resetStandbyTimer();

      },
      {
        passive:
          eventName !== "keydown"
      }
    );

  });


  if (standby) {

    standby.addEventListener(
      "click",
      exitStandby
    );

  }


  resetStandbyTimer();


  /* =======================================================
     12 — VISIBILITY
  ======================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        if (standbyTimer) {
          window.clearTimeout(
            standbyTimer
          );
        }

      } else {

        resetStandbyTimer();

      }

    }
  );


  /* =======================================================
     13 — GSAP
     
     GSAP è un livello di enhancement.
     La Home rimane funzionante anche senza GSAP.
  ======================================================== */

  const initGSAP = () => {

    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger =
      window.ScrollTrigger;


    try {

      gsap.registerPlugin(
        ScrollTrigger
      );


      body.classList.add(
        "gsap-enabled"
      );


      /* =====================================================
         TITOLI
      ==================================================== */

      sections.forEach((section, index) => {

        const title =
          section.querySelector(
            ".section__title"
          );

        if (!title) return;


        if (
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
        ) {
          return;
        }


        /*
           La prima sezione entra immediatamente.
        */

        if (index === 0) {

          gsap.fromTo(
            title,
            {
              opacity: 0,
              y: 30
            },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "power3.out",
              delay: 0.25,
              overwrite: "auto"
            }
          );

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
            duration: 1.05,
            ease: "power3.out",
            overwrite: "auto",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              end: "top 28%",
              toggleActions:
                "play none none reverse"
            }
          }
        );

      });


      /* =====================================================
         BODY
      ==================================================== */

      sections.forEach((section) => {

        const bodyContent =
          section.querySelector(
            ".section__body"
          );

        if (!bodyContent) return;


        if (
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
        ) {
          return;
        }


        gsap.fromTo(
          bodyContent,
          {
            opacity: 0,
            y: 22
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.12,
            overwrite: "auto",
            scrollTrigger: {
              trigger: section,
              start: "top 62%",
              end: "top 25%",
              toggleActions:
                "play none none reverse"
            }
          }
        );

      });


      /* =====================================================
         PORTRAIT
      ==================================================== */

      document
        .querySelectorAll(".portrait img")
        .forEach((image) => {

          if (
            window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches
          ) {
            return;
          }


          gsap.fromTo(
            image,
            {
              opacity: 0,
              scale: 1.025
            },
            {
              opacity: 1,
              scale: 1,
              duration: 1.3,
              ease: "power3.out",
              overwrite: "auto",
              scrollTrigger: {
                trigger: image,
                start: "top 75%",
                toggleActions:
                  "play none none reverse"
              }
            }
          );

        });


      /* =====================================================
         MAP
      ==================================================== */

      document
        .querySelectorAll(".territory-map")
        .forEach((map) => {

          if (
            window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches
          ) {
            return;
          }


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
              overwrite: "auto",
              scrollTrigger: {
                trigger: map,
                start: "top 78%",
                toggleActions:
                  "play none none reverse"
              }
            }
          );

        });


      /*
         Ricalcolo dopo il caricamento delle immagini.
      */

      window.addEventListener(
        "load",
        () => {

          ScrollTrigger.refresh();

        },
        {
          once: true
        }
      );


      /*
         Resize controllato.
      */

      let resizeTimer = null;

      window.addEventListener(
        "resize",
        () => {

          window.clearTimeout(
            resizeTimer
          );

          resizeTimer =
            window.setTimeout(
              () => {
                ScrollTrigger.refresh();
              },
              250
            );

        }
      );


    } catch (error) {

      /*
         GSAP non deve mai compromettere
         il funzionamento della Home.
      */

      console.error(
        "GSAP initialization error:",
        error
      );

      body.classList.remove(
        "gsap-enabled"
      );

    }

  };


  /* =======================================================
     14 — GSAP LOAD
  ======================================================== */

  /*
     Gli script GSAP sono caricati con defer.
     Quando il DOM è pronto, attendiamo che le librerie
     siano disponibili.
  */

  const waitForGSAP = () => {

    if (
      typeof window.gsap !== "undefined" &&
      typeof window.ScrollTrigger !== "undefined"
    ) {

      initGSAP();

      return;

    }


    let attempts = 0;

    const maxAttempts = 40;

    const interval =
      window.setInterval(
        () => {

          attempts += 1;

          if (
            typeof window.gsap !== "undefined" &&
            typeof window.ScrollTrigger !== "undefined"
          ) {

            window.clearInterval(
              interval
            );

            initGSAP();

            return;

          }


          if (
            attempts >= maxAttempts
          ) {

            window.clearInterval(
              interval
            );

          }

        },
        100
      );

  };


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      waitForGSAP,
      {
        once: true
      }
    );

  } else {

    waitForGSAP();

  }


  /* =======================================================
     15 — START
  ======================================================== */

  /*
     Il loader viene comunque chiuso
     dal sistema indipendente definito all'inizio.
  */

  updateNavigation();
  resetStandbyTimer();

})();
