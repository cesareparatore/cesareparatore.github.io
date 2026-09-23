/* =========================================================
   CESARE PARATORE
   Main interaction layer
   No external libraries.
   No dependency on GSAP.
   No dependency for page visibility.
========================================================= */

(() => {
  "use strict";


  /* =======================================================
     DOM READY
  ======================================================= */

  const init = () => {

    document.documentElement.classList.add("js");


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const body = document.body;

    const loader = document.getElementById("site-loader");

    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("site-menu");

    const activeChapter =
      document.getElementById("active-chapter");

    const previousButton =
      document.getElementById("prev-section");

    const nextButton =
      document.getElementById("next-section");

    const progress =
      document.getElementById("wow-progress");

    const activeDot =
      document.getElementById("wow-dot-active");

    const brand =
      document.querySelector(".brand");

    const menuLinks =
      document.querySelectorAll(".menu-links a");

    const sections =
      Array.from(document.querySelectorAll(".story"));


    if (!sections.length) {
      return;
    }


    /* =====================================================
       SECTION DATA
    ===================================================== */

    const sectionData = sections.map((section, index) => ({
      element: section,
      index,
      title: section.dataset.title || "",
      id: section.id
    }));


    let activeIndex = 0;
    let ticking = false;
    let menuOpen = false;


    /* =====================================================
       LOADER
       Progressive enhancement only.

       CSS hides loader by default.
       Therefore a JS failure can never create
       a permanent black screen.
    ===================================================== */

    const runLoader = () => {

      if (!loader) {
        return;
      }

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      if (reducedMotion) {
        loader.remove();
        return;
      }

      /*
       * The loader is activated only after the page exists.
       * This guarantees that the underlying page is already
       * available if anything interrupts the sequence.
       */

      loader.setAttribute("aria-hidden", "false");
      loader.classList.add("is-active");

      window.setTimeout(() => {

        loader.classList.add("is-exiting");

        window.setTimeout(() => {

          loader.classList.remove("is-active");
          loader.remove();

        }, 900);

      }, 2100);
    };


    /* =====================================================
       MENU
    ===================================================== */

    const openMenu = () => {

      if (menuOpen) {
        return;
      }

      menuOpen = true;

      body.classList.add("menu-open");

      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menu.setAttribute(
        "aria-hidden",
        "false"
      );

      /*
       * Focus first navigation item after the opening
       * animation starts.
       */

      window.setTimeout(() => {

        if (menuLinks[0]) {
          menuLinks[0].focus();
        }

      }, 120);
    };


    const closeMenu = (restoreFocus = true) => {

      if (!menuOpen) {
        return;
      }

      menuOpen = false;

      body.classList.remove("menu-open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menu.setAttribute(
        "aria-hidden",
        "true"
      );

      if (restoreFocus) {
        menuToggle.focus();
      }
    };


    menuToggle.addEventListener("click", () => {

      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }

    });


    menuLinks.forEach((link) => {

      link.addEventListener("click", () => {
        closeMenu(false);
      });

    });


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener("keydown", (event) => {

      if (event.key === "Escape" && menuOpen) {
        closeMenu();
      }

    });


    /* =====================================================
       ACTIVE SECTION
    ===================================================== */

    const setActiveSection = (index) => {

      const safeIndex =
        Math.max(
          0,
          Math.min(index, sectionData.length - 1)
        );

      activeIndex = safeIndex;

      const data = sectionData[safeIndex];

      sections.forEach((section, sectionIndex) => {

        section.classList.toggle(
          "is-active",
          sectionIndex === safeIndex
        );

      });

      if (activeChapter) {
        activeChapter.textContent = data.title;
      }

      if (previousButton) {
        previousButton.disabled =
          safeIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled =
          safeIndex === sectionData.length - 1;
      }

      /*
       * Narrative progress:
       * first chapter = 0%
       * last chapter = 100%
       */

      const percentage =
        sectionData.length <= 1
          ? 0
          : (safeIndex / (sectionData.length - 1)) * 100;

      if (progress) {
        progress.style.width = `${percentage}%`;
      }

      if (activeDot) {
        activeDot.style.left = `${percentage}%`;
      }
    };


    /* =====================================================
       FIND ACTIVE SECTION FROM SCROLL POSITION
    ===================================================== */

    const updateActiveFromScroll = () => {

      const viewportCenter =
        window.innerHeight * 0.5;

      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {

        const rect =
          section.getBoundingClientRect();

        const sectionCenter =
          rect.top + rect.height / 2;

        const distance =
          Math.abs(
            viewportCenter - sectionCenter
          );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }

      });

      setActiveSection(closestIndex);

      ticking = false;
    };


    const requestScrollUpdate = () => {

      if (ticking) {
        return;
      }

      ticking = true;

      window.requestAnimationFrame(
        updateActiveFromScroll
      );
    };


    window.addEventListener(
      "scroll",
      requestScrollUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestScrollUpdate
    );


    /* =====================================================
       SECTION SCROLL
    ===================================================== */

    const goToSection = (index) => {

      const safeIndex =
        Math.max(
          0,
          Math.min(index, sectionData.length - 1)
        );

      const target =
        sectionData[safeIndex].element;

      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior:
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
        block: "start"
      });
    };


    previousButton.addEventListener(
      "click",
      () => {
        goToSection(activeIndex - 1);
      }
    );


    nextButton.addEventListener(
      "click",
      () => {
        goToSection(activeIndex + 1);
      }
    );


    /* =====================================================
       KEYBOARD ARROW NAVIGATION
    ===================================================== */

    document.addEventListener("keydown", (event) => {

      /*
       * Don't hijack keyboard arrows when user is typing.
       */

      const tag =
        document.activeElement?.tagName;

      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT";

      if (isTyping || menuOpen) {
        return;
      }

      if (event.key === "ArrowDown") {

        event.preventDefault();

        goToSection(activeIndex + 1);
      }

      if (event.key === "ArrowUp") {

        event.preventDefault();

        goToSection(activeIndex - 1);
      }

    });


    /* =====================================================
       BRAND → TOP
    ===================================================== */

    if (brand) {

      brand.addEventListener("click", () => {

        if (menuOpen) {
          closeMenu(false);
        }

      });

    }


    /* =====================================================
       URL HASH
    ===================================================== */

    const initialHash =
      window.location.hash.replace("#", "");

    if (initialHash) {

      const initialIndex =
        sectionData.findIndex(
          item => item.id === initialHash
        );

      if (initialIndex >= 0) {

        window.setTimeout(() => {

          sectionData[
            initialIndex
          ].element.scrollIntoView({
            behavior: "auto",
            block: "start"
          });

          setActiveSection(initialIndex);

        }, 0);

      }

    }


    /* =====================================================
       INTERSECTION OBSERVER
       Used only for narrative reveal states.
       If unsupported, the page remains fully visible.
    ===================================================== */

    if ("IntersectionObserver" in window) {

      const observer =
        new IntersectionObserver(
          (entries) => {

            entries.forEach((entry) => {

              if (entry.isIntersecting) {

                entry.target.classList.add(
                  "is-active"
                );

              }

            });

          },
          {
            root: null,
            threshold: 0.22
          }
        );

      sections.forEach((section) => {

        observer.observe(section);

      });

    } else {

      sections.forEach((section) => {

        section.classList.add("is-active");

      });

    }


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    setActiveSection(0);

    /*
     * Opening section is intentionally pure:
     * GUARDA. only.
     */

    sections[0].classList.add("is-active");


    /* =====================================================
       START CINEMATIC INTRO
    ===================================================== */

    runLoader();

  };


  /* =======================================================
     START SAFELY
  ======================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();
