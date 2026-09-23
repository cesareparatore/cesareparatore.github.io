/* =========================================================
   CESARE PARATORE
   Main script — V3.2
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     DOM
     ======================================================= */

  const body = document.body;

  const header =
    document.querySelector(".site-header");

  const menu =
    document.querySelector(".site-menu");

  const menuTrigger =
    document.querySelector(".menu-trigger");

  const menuLinks = menu
    ? [...menu.querySelectorAll("a")]
    : [];

  const main =
    document.querySelector("main");

  const footer =
    document.querySelector(".site-footer");

  const loader =
    document.querySelector(".loader");

  const standby =
    document.querySelector(".standby");

  const sections = [
    ...document.querySelectorAll(".story-section")
  ];

  const sectionNav =
    document.querySelector(".section-nav");

  const prevButton =
    document.querySelector(".section-nav-prev");

  const nextButton =
    document.querySelector(".section-nav-next");

  const navTitle =
    document.querySelector(".section-nav-title");


  /* =======================================================
     STATE
     ======================================================= */

  let activeIndex = 0;

  let menuOpen = false;

  let lastFocusedElement = null;

  let standbyTimer = null;

  let standbyVisible = false;

  let loaderHidden = false;

  let scrollTicking = false;

  let resizeTimer = null;

  let activityQueued = false;


  /* =======================================================
     CONFIG
     ======================================================= */

  const STANDBY_DELAY = 40000;

  const reducedMotionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  /* =======================================================
     GSAP
     ======================================================= */

  const GSAP =
    window.gsap || null;

  const ScrollTrigger =
    window.ScrollTrigger || null;

  const hasGSAP =
    Boolean(GSAP);


  /* =======================================================
     UTILITIES
     ======================================================= */

  const getReducedMotion = () => {
    return reducedMotionQuery.matches;
  };


  const getHeaderHeight = () => {
    return header
      ? Math.ceil(
          header.getBoundingClientRect().height
        )
      : 0;
  };


  const clamp = (
    value,
    min,
    max
  ) => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  /* =======================================================
     ACCESSIBILITY
     ======================================================= */

  const setMainInert = (value) => {

    if (main) {
      if (value) {
        main.setAttribute("inert", "");
      } else {
        main.removeAttribute("inert");
      }
    }

    if (footer) {
      if (value) {
        footer.setAttribute("inert", "");
      } else {
        footer.removeAttribute("inert");
      }
    }

  };


  /* =======================================================
     MENU
     ======================================================= */

  const updateMenuState = (
    open
  ) => {

    if (!menu || !menuTrigger) {
      return;
    }

    menuOpen = open;

    menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menu.classList.toggle(
      "is-open",
      open
    );

    menuTrigger.classList.toggle(
      "is-open",
      open
    );

    body.classList.toggle(
      "menu-open",
      open
    );

    setMainInert(open);

  };


  const openMenu = () => {

    if (menuOpen) {
      return;
    }

    lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuTrigger;

    updateMenuState(true);

    window.requestAnimationFrame(() => {
      menuLinks[0]?.focus();
    });

  };


  const closeMenu = ({
    restoreFocus = true
  } = {}) => {

    if (!menuOpen) {
      return;
    }

    updateMenuState(false);

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        "function"
    ) {

      window.requestAnimationFrame(() => {
        lastFocusedElement.focus();
      });

    }

    lastFocusedElement = null;

  };


  const toggleMenu = () => {

    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  };


  menuTrigger?.addEventListener(
    "click",
    toggleMenu
  );


  menuLinks.forEach((link) => {

    link.addEventListener(
      "click",
      () => {
        closeMenu({
          restoreFocus: false
        });
      }
    );

  });


  /* =======================================================
     MENU KEYBOARD
     ======================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        menuOpen
      ) {

        event.preventDefault();

        closeMenu();

        return;
      }


      if (
        event.key !== "Tab" ||
        !menuOpen ||
        !menuLinks.length
      ) {
        return;
      }


      const first =
        menuLinks[0];

      const last =
        menuLinks[
          menuLinks.length - 1
        ];


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


  /* =======================================================
     INTERNAL MENU LINKS
     ======================================================= */

  menuLinks.forEach((link) => {

    const href =
      link.getAttribute("href");

    if (
      !href ||
      !href.startsWith("#")
    ) {
      return;
    }


    link.addEventListener(
      "click",
      (event) => {

        const target =
          document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        closeMenu({
          restoreFocus: false
        });

        const index =
          sections.indexOf(target);

        if (index >= 0) {
          scrollToSection(index);
        }

      }
    );

  });


  /* =======================================================
     SECTION NAVIGATION
     ======================================================= */

  const getSectionTitle = (
    section
  ) => {

    if (!section) {
      return "";
    }

    const title =
      section.querySelector(
        ".story-title"
      );

    return title
      ? title.textContent.trim()
      : "";

  };


  const updateSectionNavigation = () => {

    if (!sections.length) {
      return;
    }


    const current =
      sections[activeIndex];


    if (navTitle) {

      navTitle.textContent =
        getSectionTitle(current);

    }


    if (prevButton) {

      const disabled =
        activeIndex <= 0;

      prevButton.disabled =
        disabled;

      prevButton.setAttribute(
        "aria-disabled",
        String(disabled)
      );

    }


    if (nextButton) {

      const disabled =
        activeIndex >=
        sections.length - 1;

      nextButton.disabled =
        disabled;

      nextButton.setAttribute(
        "aria-disabled",
        String(disabled)
      );

    }


    sections.forEach(
      (section, index) => {

        section.dataset.active =
          index === activeIndex
            ? "true"
            : "false";

      }
    );

  };


  const setActiveSection = (
    index,
    {
      force = false
    } = {}
  ) => {

    if (!sections.length) {
      return;
    }

    const nextIndex =
      clamp(
        index,
        0,
        sections.length - 1
      );


    if (
      !force &&
      nextIndex === activeIndex
    ) {
      return;
    }


    activeIndex =
      nextIndex;

    updateSectionNavigation();

  };


  const scrollToSection = (
    index
  ) => {

    if (
      index < 0 ||
      index >= sections.length
    ) {
      return;
    }


    const section =
      sections[index];

    if (!section) {
      return;
    }


    setActiveSection(index);


    const headerHeight =
      getHeaderHeight();


    const targetTop =
      window.scrollY +
      section.getBoundingClientRect().top -
      headerHeight;


    window.scrollTo({
      top: Math.max(
        0,
        targetTop
      ),
      behavior:
        getReducedMotion()
          ? "auto"
          : "smooth"
    });

  };


  prevButton?.addEventListener(
    "click",
    () => {
      scrollToSection(
        activeIndex - 1
      );
    }
  );


  nextButton?.addEventListener(
    "click",
    () => {
      scrollToSection(
        activeIndex + 1
      );
    }
  );


  /* =======================================================
     ACTIVE SECTION ENGINE
     ======================================================= */

  const updateActiveSectionFromScroll =
    () => {

      if (!sections.length) {
        return;
      }


      const headerHeight =
        getHeaderHeight();


      const readingLine =
        headerHeight +
        Math.min(
          window.innerHeight * 0.32,
          260
        );


      let closestIndex =
        activeIndex;

      let closestDistance =
        Infinity;


      sections.forEach(
        (section, index) => {

          const rect =
            section.getBoundingClientRect();


          /*
           * Se la reading line è dentro
           * la sezione, quella è la sezione
           * attiva.
           */

          if (
            rect.top <= readingLine &&
            rect.bottom >= readingLine
          ) {

            closestIndex =
              index;

            closestDistance =
              0;

            return;
          }


          /*
           * Fallback per le zone tra
           * una sezione e l'altra.
           */

          const distance =
            readingLine < rect.top
              ? rect.top -
                readingLine
              : readingLine -
                rect.bottom;


          if (
            distance <
            closestDistance
          ) {

            closestDistance =
              distance;

            closestIndex =
              index;

          }

        }
      );


      if (
        closestIndex !==
        activeIndex
      ) {

        setActiveSection(
          closestIndex
        );

      }

    };


  const requestScrollUpdate =
    () => {

      if (scrollTicking) {
        return;
      }

      scrollTicking = true;


      window.requestAnimationFrame(
        () => {

          updateActiveSectionFromScroll();

          scrollTicking = false;

        }
      );

    };


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive: true
    }
  );


  /* =======================================================
     GSAP ANIMATIONS
     ======================================================= */

  const animateSection = (
    section
  ) => {

    if (
      !hasGSAP ||
      !section ||
      getReducedMotion()
    ) {
      return;
    }


    const title =
      section.querySelector(
        ".story-title"
      );

    const bodyCopy =
      section.querySelector(
        ".story-body"
      );

    const eyebrow =
      section.querySelector(
        ".story-eyebrow"
      );

    const index =
      section.querySelector(
        ".story-index"
      );

    const media =
      section.querySelector(
        ".place-map, .portrait-frame"
      );

    const contact =
      section.querySelector(
        ".contact-link"
      );


    /* -----------------------------------------------------
       Base title
       ----------------------------------------------------- */

    if (title) {

      GSAP.fromTo(
        title,
        {
          yPercent: 12,
          opacity: 0
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 76%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       Eyebrow
       ----------------------------------------------------- */

    if (eyebrow) {

      GSAP.fromTo(
        eyebrow,
        {
          y: 12,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.08,
          ease: "power2.out",

          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       Body
       ----------------------------------------------------- */

    if (bodyCopy) {

      GSAP.fromTo(
        bodyCopy,
        {
          y: 18,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.16,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       Index
       ----------------------------------------------------- */

    if (index) {

      GSAP.fromTo(
        index,
        {
          opacity: 0
        },
        {
          opacity: 1,
          duration: 1,
          ease: "none",

          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       GUARDA
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-opening"
      ) &&
      title
    ) {

      GSAP.fromTo(
        title,
        {
          yPercent: 18,
          opacity: 0,
          scale: 0.985
        },
        {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 1.3,
          ease: "power4.out",

          scrollTrigger: {
            trigger: section,
            start: "top top",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       CAPIRE
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-understand"
      ) &&
      bodyCopy
    ) {

      GSAP.fromTo(
        bodyCopy,
        {
          x: 30,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       RITORNA
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-return"
      ) &&
      title
    ) {

      GSAP.fromTo(
        title,
        {
          letterSpacing: "0.14em",
          opacity: 0
        },
        {
          letterSpacing: "normal",
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       COLLEGARE
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-connect"
      ) &&
      bodyCopy
    ) {

      const paragraphs =
        bodyCopy.querySelectorAll(
          "p"
        );


      if (paragraphs.length) {

        GSAP.fromTo(
          paragraphs,
          {
            y: 16,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.06,
            ease: "power2.out",

            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              once: true
            }
          }
        );

      }

    }


    /* -----------------------------------------------------
       OGGI
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-today"
      )
    ) {

      const lead =
        section.querySelector(
          ".story-lead"
        );


      if (lead) {

        GSAP.fromTo(
          lead,
          {
            y: 24,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power4.out",

            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true
            }
          }
        );

      }

    }


    /* -----------------------------------------------------
       QUI
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-place"
      ) &&
      media
    ) {

      GSAP.fromTo(
        media,
        {
          y: 20,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       ECCOMI
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-person"
      ) &&
      media
    ) {

      GSAP.fromTo(
        media,
        {
          scale: 0.97,
          opacity: 0
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true
          }
        }
      );

    }


    /* -----------------------------------------------------
       SCRIVIMI
       ----------------------------------------------------- */

    if (
      section.classList.contains(
        "story-contact"
      ) &&
      contact
    ) {

      GSAP.fromTo(
        contact,
        {
          y: 14,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.25,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true
          }
        }
      );

    }

  };


  const initAnimations = () => {

    if (
      !hasGSAP ||
      getReducedMotion()
    ) {
      return;
    }


    if (ScrollTrigger) {
      GSAP.registerPlugin(
        ScrollTrigger
      );
    }


    sections.forEach(
      animateSection
    );


    window.requestAnimationFrame(
      () => {

        if (ScrollTrigger) {
          ScrollTrigger.refresh();
        }

      }
    );

  };


  /* =======================================================
     LOADER
     ======================================================= */

  const hideLoader = () => {

    if (
      !loader ||
      loaderHidden
    ) {
      return;
    }


    loaderHidden = true;


    if (getReducedMotion()) {

      loader.classList.add(
        "is-hidden"
      );

      return;
    }


    if (hasGSAP) {

      GSAP.to(
        loader,
        {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",

          onComplete: () => {

            loader.classList.add(
              "is-hidden"
            );

          }
        }
      );

    } else {

      loader.classList.add(
        "is-hidden"
      );

    }

  };


  const initLoader = () => {

    if (!loader) {
      return;
    }


    const minimumDisplayTime =
      getReducedMotion()
        ? 150
        : 700;


    const startedAt =
      performance.now();


    const finish = () => {

      const elapsed =
        performance.now() -
        startedAt;


      const remaining =
        Math.max(
          0,
          minimumDisplayTime -
            elapsed
        );


      window.setTimeout(
        hideLoader,
        remaining
      );

    };


    if (
      document.readyState ===
      "complete"
    ) {

      finish();

    } else {

      window.addEventListener(
        "load",
        finish,
        {
          once: true
        }
      );

    }


    /*
     * Failsafe assoluto.
     * Il loader non deve mai bloccare
     * l'accesso al sito.
     */

    window.setTimeout(
      hideLoader,
      3500
    );

  };


  /* =======================================================
     STANDBY
     ======================================================= */

  const showStandby = () => {

    if (
      !standby ||
      standbyVisible
    ) {
      return;
    }


    standbyVisible = true;


    standby.setAttribute(
      "aria-hidden",
      "false"
    );


    body.classList.add(
      "standby-active"
    );


    if (
      hasGSAP &&
      !getReducedMotion()
    ) {

      GSAP.fromTo(
        standby,
        {
          autoAlpha: 0
        },
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",

          onStart: () => {
            standby.classList.add(
              "is-visible"
            );
          }
        }
      );

    } else {

      standby.classList.add(
        "is-visible"
      );

    }

  };


  const hideStandby = () => {

    if (
      !standby ||
      !standbyVisible
    ) {
      return;
    }


    standbyVisible = false;


    body.classList.remove(
      "standby-active"
    );


    if (
      hasGSAP &&
      !getReducedMotion()
    ) {

      GSAP.to(
        standby,
        {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.out",

          onComplete: () => {

            standby.classList.remove(
              "is-visible"
            );

            standby.setAttribute(
              "aria-hidden",
              "true"
            );

          }
        }
      );

    } else {

      standby.classList.remove(
        "is-visible"
      );

      standby.setAttribute(
        "aria-hidden",
        "true"
      );

    }

  };


  const scheduleStandby = () => {

    window.clearTimeout(
      standbyTimer
    );


    standbyTimer =
      window.setTimeout(
        showStandby,
        STANDBY_DELAY
      );

  };


  const registerActivity = () => {

    if (standbyVisible) {
      hideStandby();
    }

    scheduleStandby();

  };


  const handlePointerActivity = () => {

    if (activityQueued) {
      return;
    }


    activityQueued = true;


    window.requestAnimationFrame(
      () => {

        registerActivity();

        activityQueued = false;

      }
    );

  };


  [
    "pointerdown",
    "pointermove",
    "touchstart",
    "wheel",
    "keydown"
  ].forEach(
    (eventName) => {

      window.addEventListener(
        eventName,
        handlePointerActivity,
        {
          passive:
            eventName !==
            "keydown"
        }
      );

    }
  );


  /* =======================================================
     VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState ===
        "hidden"
      ) {

        window.clearTimeout(
          standbyTimer
        );

        return;
      }


      scheduleStandby();

      requestScrollUpdate();


      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }

    }
  );


  /* =======================================================
     RESIZE
     ======================================================= */

  const handleResize = () => {

    window.clearTimeout(
      resizeTimer
    );


    resizeTimer =
      window.setTimeout(
        () => {

          updateSectionNavigation();

          updateActiveSectionFromScroll();


          if (ScrollTrigger) {
            ScrollTrigger.refresh();
          }

        },
        150
      );

  };


  window.addEventListener(
    "resize",
    handleResize,
    {
      passive: true
    }
  );


  window.addEventListener(
    "orientationchange",
    handleResize,
    {
      passive: true
    }
  );


  /* =======================================================
     REDUCED MOTION CHANGE
     ======================================================= */

  const handleMotionPreferenceChange =
    () => {

      if (
        getReducedMotion() &&
        ScrollTrigger
      ) {

        ScrollTrigger.getAll()
          .forEach(
            (trigger) => {
              trigger.kill();
            }
          );

      }

    };


  if (
    typeof reducedMotionQuery.addEventListener ===
    "function"
  ) {

    reducedMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );

  } else if (
    typeof reducedMotionQuery.addListener ===
    "function"
  ) {

    reducedMotionQuery.addListener(
      handleMotionPreferenceChange
    );

  }


  /* =======================================================
     PAGE SHOW
     ======================================================= */

  window.addEventListener(
    "pageshow",
    () => {

      if (menuOpen) {

        closeMenu({
          restoreFocus: false
        });

      }


      if (loader) {

        window.setTimeout(
          hideLoader,
          2500
        );

      }

    },
    {
      once: true
    }
  );


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  const init = () => {

    if (!sections.length) {
      return;
    }


    setActiveSection(
      0,
      {
        force: true
      }
    );


    updateActiveSectionFromScroll();

    initLoader();

    initAnimations();

    scheduleStandby();

  };


  /* =======================================================
     START
     ======================================================= */

  init();

})();
