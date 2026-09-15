(() => {
  "use strict";


  /* ==========================================================
     DOM READY
  ========================================================== */

  const ready = (callback) => {

    if (document.readyState === "loading") {

      document.addEventListener(
        "DOMContentLoaded",
        callback,
        { once: true }
      );

    } else {

      callback();

    }
  };


  ready(() => {

    /* ========================================================
       ELEMENTS
    ======================================================== */

    const body =
      document.body;

    const header =
      document.querySelector("[data-header]");

    const menuToggle =
      document.querySelector("[data-menu-toggle]");

    const navigation =
      document.querySelector("[data-nav]");

    const navigationLinks =
      [...document.querySelectorAll("[data-nav-link]")];

    const year =
      document.querySelector("[data-year]");

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );


    /* ========================================================
       YEAR
    ======================================================== */

    if (year) {

      year.textContent =
        new Date().getFullYear();

    }


    /* ========================================================
       HEADER STATE
    ======================================================== */

    const updateHeader =
      () => {

        if (!header) {
          return;
        }

        header.classList.toggle(
          "is-scrolled",
          window.scrollY > 8
        );

      };


    updateHeader();


    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
    );


    /* ========================================================
       MOBILE NAVIGATION
    ======================================================== */

    const closeMenu =
      ({
        restoreFocus = false
      } = {}) => {

        if (!menuToggle || !navigation) {
          return;
        }

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        menuToggle.setAttribute(
          "aria-label",
          "Apri il menu"
        );

        navigation.classList.remove(
          "is-open"
        );

        body.classList.remove(
          "menu-open"
        );

        if (restoreFocus) {

          menuToggle.focus();

        }

      };


    const openMenu =
      () => {

        if (!menuToggle || !navigation) {
          return;
        }

        menuToggle.setAttribute(
          "aria-expanded",
          "true"
        );

        menuToggle.setAttribute(
          "aria-label",
          "Chiudi il menu"
        );

        navigation.classList.add(
          "is-open"
        );

        body.classList.add(
          "menu-open"
        );

        const firstLink =
          navigation.querySelector("a");

        if (firstLink) {

          firstLink.focus();

        }

      };


    if (menuToggle) {

      menuToggle.addEventListener(
        "click",
        () => {

          const isOpen =
            menuToggle.getAttribute(
              "aria-expanded"
            ) === "true";


          if (isOpen) {

            closeMenu();

          } else {

            openMenu();

          }

        }
      );

    }


    /* ========================================================
       CLOSE MOBILE MENU ON LINK
    ======================================================== */

    navigationLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {

            closeMenu();

          }
        );

      }
    );


    /* ========================================================
       ESCAPE
    ======================================================== */

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          menuToggle?.getAttribute(
            "aria-expanded"
          ) === "true"
        ) {

          closeMenu({
            restoreFocus: true
          });

        }

      }
    );


    /* ========================================================
       RESIZE
    ======================================================== */

    window.addEventListener(
      "resize",
      () => {

        if (
          window.innerWidth > 760 &&
          menuToggle?.getAttribute(
            "aria-expanded"
          ) === "true"
        ) {

          closeMenu();

        }

      },
      {
        passive: true
      }
    );


    /* ========================================================
       ACTIVE SECTION / SCROLL SPY
    ======================================================== */

    const sections =
      [
        ...document.querySelectorAll(
          "main section[id]"
        )
      ];


    const trackedSections =
      sections.filter(
        (section) => {

          return navigationLinks.some(
            (link) =>
              link.getAttribute("href") ===
              `#${section.id}`
          );

        }
      );


    if (
      "IntersectionObserver" in window &&
      trackedSections.length
    ) {

      const rootMargin =
        getComputedStyle(
          document.documentElement
        ).getPropertyValue(
          "--header-height"
        );


      const observer =
        new IntersectionObserver(
          (entries) => {

            entries.forEach(
              (entry) => {

                if (!entry.isIntersecting) {
                  return;
                }


                navigationLinks.forEach(
                  (link) => {

                    const isActive =
                      link.getAttribute("href") ===
                      `#${entry.target.id}`;


                    if (isActive) {

                      link.setAttribute(
                        "aria-current",
                        "true"
                      );

                    } else {

                      link.removeAttribute(
                        "aria-current"
                      );

                    }

                  }
                );

              }
            );

          },
          {
            rootMargin:
              `-${parseInt(rootMargin, 10) || 72}px 0px -55% 0px`,

            threshold: 0
          }
        );


      trackedSections.forEach(
        (section) =>
          observer.observe(section)
      );

    }


    /* ========================================================
       SAME PAGE ANCHOR NAVIGATION
    ======================================================== */

    document
      .querySelectorAll('a[href^="#"]')
      .forEach(
        (link) => {

          link.addEventListener(
            "click",
            (event) => {

              const hash =
                link.getAttribute("href");


              if (
                !hash ||
                hash === "#"
              ) {

                return;

              }


              const target =
                document.querySelector(hash);


              if (!target) {
                return;
              }


              event.preventDefault();


              target.scrollIntoView({
                behavior:
                  reducedMotion.matches
                    ? "auto"
                    : "smooth",

                block: "start"
              });


              /*
                Aggiorniamo l'URL senza ricaricare
                la pagina.
              */

              history.pushState(
                null,
                "",
                hash
              );


              /*
                Dopo la navigazione rendiamo il target
                disponibile alla tastiera.
              */

              target.setAttribute(
                "tabindex",
                "-1"
              );


              window.setTimeout(
                () => {

                  target.focus({
                    preventScroll: true
                  });

                },
                reducedMotion.matches
                  ? 0
                  : 450
              );

            }
          );

        }
      );


    /* ========================================================
       HASH NAVIGATION DIRECT
    ======================================================== */

    const focusHashTarget =
      () => {

        if (!window.location.hash) {
          return;
        }


        const target =
          document.querySelector(
            window.location.hash
          );


        if (!target) {
          return;
        }


        target.setAttribute(
          "tabindex",
          "-1"
        );


        window.setTimeout(
          () => {

            target.focus({
              preventScroll: true
            });

          },
          50
        );

      };


    window.addEventListener(
      "hashchange",
      focusHashTarget
    );


    /*
      Eseguito solo quando la pagina viene aperta
      direttamente con un hash.
    */

    if (window.location.hash) {

      focusHashTarget();

    }

  });

})();
