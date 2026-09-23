(() => {
  "use strict";

  /* =========================================================
     DOM
     ========================================================= */

  const body = document.body;
  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".site-menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuLinks = menu
    ? [...menu.querySelectorAll("a")]
    : [];

  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");

  const loader = document.querySelector(".loader");
  const standby = document.querySelector(".standby");

  const sections = [
    ...document.querySelectorAll(".story-section")
  ];

  const nav = document.querySelector(".section-nav");
  const prevButton = document.querySelector(".section-nav-prev");
  const nextButton = document.querySelector(".section-nav-next");
  const navTitle = document.querySelector(".section-nav-title");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  /* =========================================================
     STATE
     ========================================================= */

  let activeIndex = 0;
  let menuOpen = false;
  let lastFocusedElement = null;

  let standbyTimer = null;
  let standbyVisible = false;

  let scrollTicking = false;
  let resizeTimer = null;

  const STANDBY_DELAY = 40000;


  /* =========================================================
     UTILITIES
     ========================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const getHeaderHeight = () => {
    return header
      ? Math.ceil(header.getBoundingClientRect().height)
      : 0;
  };


  const getReducedMotion = () => {
    return prefersReducedMotion.matches;
  };


  const setBodyScrollLock = (locked) => {
    body.classList.toggle("menu-open", locked);
  };


  /* =========================================================
     MENU / ACCESSIBILITY
     ========================================================= */

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


  const updateMenuState = (open) => {
    if (!menu || !menuTrigger) return;

    menuOpen = open;

    menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menu.classList.toggle("is-open", open);

    setBodyScrollLock(open);
    setMainInert(open);

    if (open) {
      menuTrigger.classList.add("is-open");
    } else {
      menuTrigger.classList.remove("is-open");
    }
  };


  const openMenu = () => {
    if (menuOpen) return;

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
    if (!menuOpen) return;

    updateMenuState(false);

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
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
    link.addEventListener("click", () => {
      closeMenu({
        restoreFocus: false
      });
    });
  });


  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (
        event.key === "Tab" &&
        menuOpen &&
        menuLinks.length
      ) {
        const first = menuLinks[0];
        const last = menuLinks[menuLinks.length - 1];

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
    }
  );


  /* =========================================================
     MENU LINK — INTERNAL SECTION SUPPORT
     ========================================================= */

  menuLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) {
      return;
    }

    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      closeMenu({
        restoreFocus: false
      });

      scrollToSection(
        sections.indexOf(target)
      );
    });
  });


  /* =========================================================
     SECTION NAVIGATION
     ========================================================= */

  const getSectionTitle = (section) => {
    if (!section) return "";

    const title =
      section.querySelector(".story-title");

    return title
      ? title.textContent.trim()
      : "";
  };


  const updateSectionNavigation = () => {
    if (!sections.length) return;

    const currentSection =
      sections[activeIndex];

    if (navTitle) {
      navTitle.textContent =
        getSectionTitle(currentSection);
    }

    if (prevButton) {
      const disabled = activeIndex <= 0;

      prevButton.disabled = disabled;
      prevButton.setAttribute(
        "aria-disabled",
        String(disabled)
      );
    }

    if (nextButton) {
      const disabled =
        activeIndex >= sections.length - 1;

      nextButton.disabled = disabled;
      nextButton.setAttribute(
        "aria-disabled",
        String(disabled)
      );
    }

    sections.forEach((section, index) => {
      section.dataset.active =
        index === activeIndex
          ? "true"
          : "false";
    });
  };


  const setActiveSection = (
    index,
    {
      force = false
    } = {}
  ) => {
    if (!sections.length) return;

    const nextIndex = clamp(
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

    activeIndex = nextIndex;

    updateSectionNavigation();
  };


  const scrollToSection = (index) => {
    if (
      index < 0 ||
      index >= sections.length
    ) {
      return;
    }

    const section = sections[index];

    if (!section) return;

    const headerHeight =
      getHeaderHeight();

    const targetTop =
      window.scrollY +
      section.getBoundingClientRect().top -
      headerHeight;

    const behavior =
      getReducedMotion()
        ? "auto"
        : "smooth";

    setActiveSection(index);

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior
    });
  };


  prevButton?.addEventListener(
    "click",
    () => {
      scrollToSection(activeIndex - 1);
    }
  );


  nextButton?.addEventListener(
    "click",
    () => {
      scrollToSection(activeIndex + 1);
    }
  );


  /* =========================================================
     ACTIVE SECTION ENGINE
     
     Single source of truth:
     the section whose visual reading line is closest
     to the viewport's upper narrative area.
     ========================================================= */

  const updateActiveSectionFromScroll = () => {
    if (!sections.length) return;

    const headerHeight =
      getHeaderHeight();

    const readingLine =
      headerHeight +
      Math.min(
        window.innerHeight * 0.28,
        220
      );

    let closestIndex = activeIndex;
    let closestDistance = Infinity;

    sections.forEach((section, index) => {
      const rect =
        section.getBoundingClientRect();

      const sectionCenter =
        rect.top +
        Math.min(
          rect.height * 0.5,
          window.innerHeight * 0.5
        );

      const distance =
        Math.abs(sectionCenter - readingLine);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (
      closestIndex !== activeIndex &&
      closestDistance < window.innerHeight * 0.65
    ) {
      setActiveSection(closestIndex);
    }
  };


  const requestScrollUpdate = () => {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(() => {
      updateActiveSectionFromScroll();
      scrollTicking = false;
    });
  };


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive: true
    }
  );


  /* =========================================================
     GSAP
     ========================================================= */

  const hasGSAP =
    typeof window.gsap !== "undefined";


  const animateSection = (section) => {
    if (!hasGSAP || !section) return;

    if (getReducedMotion()) {
      gsap.set(
        section.querySelectorAll(
          ".story-title, .story-body, .story-eyebrow, .story-index, .place-map, .portrait-frame, .contact-link"
        ),
        {
          clearProps: "all"
        }
      );

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


    /* -------------------------------------------------------
       Base
       ------------------------------------------------------- */

    gsap.set(
      [title, bodyCopy, eyebrow, index, media, contact]
        .filter(Boolean),
      {
        willChange: "transform, opacity"
      }
    );


    /* -------------------------------------------------------
       Default
       ------------------------------------------------------- */

    if (title) {
      gsap.fromTo(
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


    if (eyebrow) {
      gsap.fromTo(
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


    if (bodyCopy) {
      gsap.fromTo(
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


    if (index) {
      gsap.fromTo(
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


    /* -------------------------------------------------------
       GUARDa
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-opening"
      )
    ) {
      if (title) {
        gsap.fromTo(
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
    }


    /* -------------------------------------------------------
       CAPIRE
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-understand"
      )
    ) {
      if (bodyCopy) {
        gsap.fromTo(
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
    }


    /* -------------------------------------------------------
       RITORNA
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-return"
      )
    ) {
      if (title) {
        gsap.fromTo(
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
    }


    /* -------------------------------------------------------
       COLLEGARE
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-connect"
      )
    ) {
      if (bodyCopy) {
        const paragraphs =
          bodyCopy.querySelectorAll("p");

        if (paragraphs.length) {
          gsap.fromTo(
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
    }


    /* -------------------------------------------------------
       OGGI
       ------------------------------------------------------- */

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
        gsap.fromTo(
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


    /* -------------------------------------------------------
       QUI
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-place"
      )
    ) {
      if (media) {
        gsap.fromTo(
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
    }


    /* -------------------------------------------------------
       ECCOMI
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-person"
      )
    ) {
      if (media) {
        gsap.fromTo(
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
    }


    /* -------------------------------------------------------
       SCRIVIMI
       ------------------------------------------------------- */

    if (
      section.classList.contains(
        "story-contact"
      )
    ) {
      if (contact) {
        gsap.fromTo(
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
    }
  };


  const initAnimations = () => {
    if (!hasGSAP) return;

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {
      gsap.registerPlugin(
        window.ScrollTrigger
      );
    }

    sections.forEach(
      animateSection
    );

    window.requestAnimationFrame(() => {
      if (
        typeof window.ScrollTrigger !==
        "undefined"
      ) {
        window.ScrollTrigger.refresh();
      }
    });
  };


  /* =========================================================
     LOADER
     ========================================================= */

  const hideLoader = () => {
    if (!loader) return;

    if (getReducedMotion()) {
      loader.classList.add("is-hidden");
      return;
    }

    if (hasGSAP) {
      gsap.to(loader, {
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.out",
        onComplete: () => {
          loader.classList.add("is-hidden");
        }
      });
    } else {
      loader.classList.add("is-hidden");
    }
  };


  const initLoader = () => {
    if (!loader) return;

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
      Failsafe: il sito non deve mai restare
      bloccato dal loader.
    */
    window.setTimeout(
      hideLoader,
      3500
    );
  };


  /* =========================================================
     STANDBY
     ========================================================= */

  const showStandby = () => {
    if (!standby || standbyVisible) {
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

    if (hasGSAP && !getReducedMotion()) {
      gsap.fromTo(
        standby,
        {
          autoAlpha: 0
        },
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out"
        }
      );
    } else {
      standby.classList.add(
        "is-visible"
      );
    }
  };


  const hideStandby = () => {
    if (!standby || !standbyVisible) {
      return;
    }

    standbyVisible = false;

    body.classList.remove(
      "standby-active"
    );

    if (hasGSAP && !getReducedMotion()) {
      gsap.to(standby, {
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          standby.setAttribute(
            "aria-hidden",
            "true"
          );
        }
      });
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


  /*
    Non registriamo pointermove a ogni singolo
    movimento: viene limitato per evitare lavoro
    inutile sul main thread.
  */
  let activityQueued = false;

  const handlePointerActivity = () => {
    if (activityQueued) return;

    activityQueued = true;

    window.requestAnimationFrame(() => {
      registerActivity();
      activityQueued = false;
    });
  };


  [
    "pointerdown",
    "pointermove",
    "touchstart",
    "wheel",
    "keydown"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      handlePointerActivity,
      {
        passive:
          eventName !== "keydown"
      }
    );
  });


  /* =========================================================
     VISIBILITY
     ========================================================= */

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

      if (hasGSAP) {
        if (
          typeof window.ScrollTrigger !==
          "undefined"
        ) {
          window.ScrollTrigger.refresh();
        }
      }

      requestScrollUpdate();
    }
  );


  /* =========================================================
     RESIZE / ORIENTATION
     ========================================================= */

  const handleResize = () => {
    window.clearTimeout(
      resizeTimer
    );

    resizeTimer =
      window.setTimeout(() => {
        updateSectionNavigation();
        updateActiveSectionFromScroll();

        if (
          hasGSAP &&
          typeof window.ScrollTrigger !==
            "undefined"
        ) {
          window.ScrollTrigger.refresh();
        }
      }, 150);
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


  /* =========================================================
     INITIAL STATE
     ========================================================= */

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


  /* =========================================================
     SAFETY
     ========================================================= */

  window.addEventListener(
    "pageshow",
    () => {
      if (body.classList.contains("menu-open")) {
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


  /*
    Se il browser non supporta inert,
    il sito rimane comunque utilizzabile.
  */
  if (
    !("inert" in HTMLElement.prototype)
  ) {
    console.info(
      "Inert non supportato nativamente dal browser."
    );
  }


  init();

})();
