(() => {
  "use strict";

  /*
   * CP / CESARE PARATORE
   * Maximum Quality interaction layer
   *
   * Principi:
   * - nessun framework
   * - nessun listener scroll pesante
   * - progressive enhancement
   * - reduced motion rispettato
   * - navigazione hash robusta
   * - menu accessibile
   * - standby discreto
   */


  /* ==========================================================
     ELEMENTI
  ========================================================== */

  const body = document.body;

  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-scroll-progress]");

  const menu = document.querySelector("[data-menu]");
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");

  const menuLinks = [
    ...document.querySelectorAll("[data-menu-link]")
  ];

  const menuPreviewNumber =
    document.querySelector("[data-menu-preview-number]");

  const menuPreview =
    document.querySelector("[data-menu-preview]");

  const menuContact =
    document.querySelector("[data-menu-contact]");

  const sections = [
    ...document.querySelectorAll("[data-section]")
  ];

  const standby =
    document.querySelector("[data-standby]");

  const resume =
    document.querySelector("[data-resume]");


  /* ==========================================================
     SUPPORTO
  ========================================================== */

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)");

  const coarsePointer =
    window.matchMedia("(pointer: coarse)");

  let lastFocusedElement = null;

  let scrollTicking = false;

  let standbyTimer = null;

  let standbyVisible = false;


  /* ==========================================================
     HEADER + SCROLL PROGRESS
  ========================================================== */

  function updateScrollUI() {

    if (header) {
      header.classList.toggle(
        "scrolled",
        window.scrollY > 12
      );
    }


    if (progress) {

      const documentHeight =
        document.documentElement.scrollHeight;

      const viewportHeight =
        window.innerHeight;

      const maximum =
        Math.max(
          1,
          documentHeight - viewportHeight
        );

      const value =
        Math.min(
          1,
          window.scrollY / maximum
        );

      progress.style.transform =
        `scaleX(${value})`;
    }


    scrollTicking = false;
  }


  function requestScrollUpdate() {

    if (scrollTicking) {
      return;
    }

    scrollTicking = true;

    requestAnimationFrame(updateScrollUI);
  }


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestScrollUpdate,
    {
      passive: true
    }
  );


  updateScrollUI();


  /* ==========================================================
     SECTION REVEAL
  ========================================================== */

  sections.forEach(section => {
    section.classList.add("section-before-reveal");
  });


  const revealObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.remove(
            "section-before-reveal"
          );

          revealObserver.unobserve(
            entry.target
          );

        });

      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.01
      }
    );


  sections.forEach(section => {
    revealObserver.observe(section);
  });


  /* ==========================================================
     ACTIVE SECTION / SCROLL SPY
  ========================================================== */

  const menuSectionMap =
    new Map(
      menuLinks.map(link => [
        link.hash,
        link
      ])
    );


  const sectionObserver =
    new IntersectionObserver(
      entries => {

        const visible =
          entries
            .filter(entry => entry.isIntersecting)
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

        if (!visible.length) {
          return;
        }

        const id =
          `#${visible[0].target.id}`;

        menuLinks.forEach(link => {
          link.classList.toggle(
            "active",
            link.hash === id
          );
        });

      },
      {
        rootMargin: "-18% 0px -55% 0px",
        threshold: [
          0.1,
          0.35,
          0.6,
          0.85
        ]
      }
    );


  sections.forEach(section => {
    sectionObserver.observe(section);
  });


  /* ==========================================================
     MENU
  ========================================================== */

  function openMenu() {

    if (!menu) {
      return;
    }

    lastFocusedElement =
      document.activeElement;


    if (typeof menu.showModal === "function") {
      menu.showModal();
    } else {
      menu.setAttribute(
        "open",
        ""
      );
    }


    body.classList.add(
      "menu-open"
    );


    menuOpen?.setAttribute(
      "aria-expanded",
      "true"
    );


    requestAnimationFrame(() => {

      menuLinks[0]?.focus({
        preventScroll: true
      });

    });

  }


  function closeMenu(
    restoreFocus = true
  ) {

    if (!menu) {
      return;
    }


    if (menu.open) {

      if (
        typeof menu.close === "function"
      ) {
        menu.close();
      } else {
        menu.removeAttribute("open");
      }

    }


    body.classList.remove(
      "menu-open"
    );


    menuOpen?.setAttribute(
      "aria-expanded",
      "false"
    );


    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {

      lastFocusedElement.focus({
        preventScroll: true
      });

    }

  }


  menuOpen?.addEventListener(
    "click",
    openMenu
  );


  menuClose?.addEventListener(
    "click",
    () => closeMenu()
  );


  menu?.addEventListener(
    "click",
    event => {

      if (
        event.target === menu
      ) {
        closeMenu();
      }

    }
  );


  /* ==========================================================
     MENU PREVIEW
  ========================================================== */

  function updateMenuPreview(link) {

    if (!link) {
      return;
    }


    const index =
      menuLinks.indexOf(link);


    const number =
      String(index + 1).padStart(
        2,
        "0"
      );


    if (menuPreviewNumber) {
      menuPreviewNumber.textContent =
        number;
    }


    if (menuPreview) {
      menuPreview.textContent =
        link.dataset.menuDescription || "";
    }

  }


  menuLinks.forEach(link => {

    link.addEventListener(
      "mouseenter",
      () => updateMenuPreview(link)
    );


    link.addEventListener(
      "focus",
      () => updateMenuPreview(link)
    );

  });


  /* ==========================================================
     FOCUS TRAP
  ========================================================== */

  menu?.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Tab") {
        return;
      }


      const focusable = [
        ...menu.querySelectorAll(
          'a[href], button:not([disabled])'
        )
      ];


      if (!focusable.length) {
        return;
      }


      const first =
        focusable[0];

      const last =
        focusable[focusable.length - 1];


      if (
        event.shiftKey &&
        document.activeElement === first
      ) {

        event.preventDefault();

        last.focus();

      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {

        event.preventDefault();

        first.focus();

      }

    }
  );


  /* ==========================================================
     ESCAPE
  ========================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        menu?.open
      ) {

        closeMenu();

        return;
      }


      if (
        event.key === "Escape" &&
        standbyVisible
      ) {

        hideStandby();

      }

    }
  );


  /* ==========================================================
     ANCHOR NAVIGATION
  ========================================================== */

  function getHeaderOffset() {

    return (
      header?.offsetHeight || 72
    );

  }


  function scrollToTarget(
    id,
    updateHistory = true
  ) {

    const target =
      document.getElementById(id);


    if (!target) {
      return;
    }


    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderOffset() -
      18;


    window.scrollTo({
      top: Math.max(0, top),
      behavior:
        reduceMotion.matches
          ? "auto"
          : "smooth"
    });


    if (updateHistory) {

      history.pushState(
        {
          section: id
        },
        "",
        `#${id}`
      );

    }


    window.setTimeout(
      () => {

        if (
          !target.hasAttribute(
            "tabindex"
          )
        ) {
          target.setAttribute(
            "tabindex",
            "-1"
          );
        }


        target.focus({
          preventScroll: true
        });

      },
      reduceMotion.matches
        ? 0
        : 500
    );

  }


  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const id =
            link.hash.slice(1);


          const target =
            document.getElementById(id);


          if (!target) {
            return;
          }


          event.preventDefault();


          if (menu?.open) {
            closeMenu(false);
          }


          scrollToTarget(
            id,
            true
          );

        }
      );

    });


  /* ==========================================================
     BROWSER BACK / FORWARD
  ========================================================== */

  window.addEventListener(
    "popstate",
    () => {

      const id =
        window.location.hash.slice(1);


      if (id) {

        scrollToTarget(
          id,
          false
        );

      } else {

        window.scrollTo({
          top: 0,
          behavior:
            reduceMotion.matches
              ? "auto"
              : "smooth"
        });

      }

    }
  );


  /* ==========================================================
     INITIAL HASH
  ========================================================== */

  if (window.location.hash) {

    window.setTimeout(
      () => {

        scrollToTarget(
          window.location.hash.slice(1),
          false
        );

      },
      80
    );

  }


  /* ==========================================================
     MENU CONTACT
  ========================================================== */

  menuContact?.addEventListener(
    "click",
    () => {

      if (menu?.open) {
        closeMenu(false);
      }

    }
  );


  /* ==========================================================
     STANDBY
  ========================================================== */

  function clearStandbyTimer() {

    if (standbyTimer) {

      window.clearTimeout(
        standbyTimer
      );

      standbyTimer = null;

    }

  }


  function showStandby() {

    if (
      reduceMotion.matches ||
      coarsePointer.matches ||
      body.classList.contains("menu-open") ||
      document.hidden
    ) {
      return;
    }


    standbyVisible = true;


    standby?.classList.add(
      "visible"
    );


    standby?.setAttribute(
      "aria-hidden",
      "false"
    );


    body.classList.add(
      "standby-open"
    );


    resume?.focus({
      preventScroll: true
    });

  }


  function hideStandby() {

    if (!standbyVisible) {
      return;
    }


    standbyVisible = false;


    standby?.classList.remove(
      "visible"
    );


    standby?.setAttribute(
      "aria-hidden",
      "true"
    );


    body.classList.remove(
      "standby-open"
    );


    resetStandbyTimer();

  }


  function resetStandbyTimer() {

    clearStandbyTimer();


    if (
      reduceMotion.matches ||
      coarsePointer.matches ||
      standbyVisible
    ) {
      return;
    }


    /*
     * 60 secondi:
     * abbastanza lunghi da non disturbare,
     * abbastanza brevi da rendere la funzione percepibile.
     */

    standbyTimer =
      window.setTimeout(
        showStandby,
        60000
      );

  }


  resume?.addEventListener(
    "click",
    hideStandby
  );


  [
    "pointerdown",
    "keydown",
    "wheel",
    "touchstart"
  ].forEach(type => {

    window.addEventListener(
      type,
      () => {

        if (standbyVisible) {
          hideStandby();
        }

        resetStandbyTimer();

      },
      {
        passive: true
      }
    );

  });


  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        clearStandbyTimer();

      } else {

        resetStandbyTimer();

      }

    }
  );


  resetStandbyTimer();


  /* ==========================================================
     DIALOG FALLBACK
  ========================================================== */

  menu?.addEventListener(
    "cancel",
    event => {

      event.preventDefault();

      closeMenu();

    }
  );


  /* ==========================================================
     PAGE LIFECYCLE
  ========================================================== */

  window.addEventListener(
    "pageshow",
    () => {

      updateScrollUI();
      resetStandbyTimer();

    }
  );


  /*
   * Se il browser supporta View Transitions,
   * non forziamo nulla: la piattaforma resta libera
   * di gestire le transizioni native.
   */

})();
