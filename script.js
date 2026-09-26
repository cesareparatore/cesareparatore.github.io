/* ============================================================
   CESARE PARATORE
   GUARDARE. CAPIRE. FARE.
   HOMEPAGE SCRIPT
============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     CONFIG
  ========================================================== */

  const CONFIG = {
    standbyDelay: 45000,
    loaderFailsafe: 3500,
    scrollOffset: 12,
    scrollTrackingRaf: true,
    resizeDebounce: 180,
    standbyWakeThrottle: 650,
    navigationReleaseDelay: 900
  };


  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    menuOpen: false,
    ticking: false,
    activeIndex: 0,
    sections: [],
    reducedMotion: false,
    standby: false,
    standbyTimer: null,
    standbyWakeTimer: null,
    resizeTimer: null,
    navigationTimer: null,
    isNavigating: false
  };


  /* ==========================================================
     DOM
  ========================================================== */

  const dom = {
    body: document.body,
    html: document.documentElement,

    loader: document.querySelector("#site-loader"),
    standby: document.querySelector("#standby"),

    header: document.querySelector("#site-header"),

    menuToggle: document.querySelector("#menu-toggle"),
    menu: document.querySelector("#site-menu"),
    menuLinks: [...document.querySelectorAll(".menu-nav a")],

    main: document.querySelector("#main-content"),

    sections: [...document.querySelectorAll(".story")],

    activeTitle: document.querySelector("#active-section-title"),
    progressFill: document.querySelector("#section-progress-fill"),
    progressDot: document.querySelector("#section-progress-dot"),

    previousButton: document.querySelector("#section-prev"),
    nextButton: document.querySelector("#section-next"),

    footer: document.querySelector(".site-footer")
  };


  /* ==========================================================
     UTILITIES
  ========================================================== */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };


  const debounce = (callback, delay) => {
    return (...args) => {
      window.clearTimeout(state.resizeTimer);

      state.resizeTimer = window.setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };


  const prefersReducedMotion = () => {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  };


  const getSectionTitle = (section) => {
    return section?.dataset?.title || "";
  };


  const getCurrentScrollY = () => {
    return window.scrollY || window.pageYOffset || 0;
  };


  /* ==========================================================
     LOADER
  ========================================================== */

  const hideLoader = () => {
    if (!dom.loader) return;

    dom.loader.classList.add("is-hidden");
    dom.body.classList.remove("is-loading");
  };


  const initLoader = () => {
    dom.body.classList.add("is-loading");

    window.setTimeout(hideLoader, CONFIG.loaderFailsafe);

    if (document.readyState === "complete") {
      window.setTimeout(hideLoader, 300);
      return;
    }

    window.addEventListener(
      "load",
      () => {
        window.setTimeout(hideLoader, 350);
      },
      { once: true }
    );
  };


  /* ==========================================================
     MENU
  ========================================================== */

  const setMenuState = (open) => {
    state.menuOpen = open;

    dom.body.classList.toggle(
      "menu-is-open",
      open
    );

    dom.menu?.classList.toggle(
      "is-open",
      open
    );

    dom.menuToggle?.setAttribute(
      "aria-expanded",
      String(open)
    );

    dom.menu?.setAttribute(
      "aria-hidden",
      String(!open)
    );

    if (open) {
      document.addEventListener(
        "keydown",
        handleMenuKeydown
      );

      const firstLink = dom.menuLinks[0];

      window.setTimeout(() => {
        firstLink?.focus();
      }, 250);

    } else {
      document.removeEventListener(
        "keydown",
        handleMenuKeydown
      );

      dom.menuToggle?.focus();
    }
  };


  const toggleMenu = () => {
    setMenuState(!state.menuOpen);
  };


  const handleMenuKeydown = (event) => {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [
      dom.menuToggle,
      ...dom.menuLinks
    ].filter(Boolean);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };


  const initMenu = () => {
    dom.menuToggle?.addEventListener(
      "click",
      toggleMenu
    );

    dom.menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });
  };


  /* ==========================================================
     SECTION NAVIGATION
  ========================================================== */

  const updateHeaderSectionUI = (index) => {
    const section = state.sections[index];

    if (!section) return;

    const title = getSectionTitle(section);

    if (dom.activeTitle) {
      dom.activeTitle.textContent = title;
    }

    dom.previousButton?.toggleAttribute(
      "disabled",
      index <= 0
    );

    dom.nextButton?.toggleAttribute(
      "disabled",
      index >= state.sections.length - 1
    );

    const progress = state.sections.length > 1
      ? index / (state.sections.length - 1)
      : 0;

    if (dom.progressFill) {
      dom.progressFill.style.width =
        `${progress * 100}%`;
    }

    if (dom.progressDot) {
      dom.progressDot.style.left =
        `${progress * 100}%`;
    }

    state.activeIndex = index;
  };


  const calculateActiveSection = () => {
    const viewportPoint =
      getCurrentScrollY() +
      window.innerHeight * 0.38;

    let closestIndex = 0;
    let closestDistance = Infinity;

    state.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      const absoluteTop =
        rect.top + getCurrentScrollY();

      const distance =
        Math.abs(absoluteTop - viewportPoint);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };


  const updateSectionUI = () => {
    const index = calculateActiveSection();

    if (index !== state.activeIndex) {
      updateHeaderSectionUI(index);
    } else if (!dom.activeTitle?.textContent) {
      updateHeaderSectionUI(index);
    }
  };


  const scrollToSection = (index) => {
    const target = state.sections[index];

    if (!target) return;

    state.isNavigating = true;

    window.clearTimeout(
      state.navigationTimer
    );

    updateHeaderSectionUI(index);

    const targetTop =
      target.getBoundingClientRect().top +
      getCurrentScrollY() -
      CONFIG.scrollOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: state.reducedMotion
        ? "auto"
        : "smooth"
    });

    state.navigationTimer = window.setTimeout(() => {
      state.isNavigating = false;
    }, CONFIG.navigationReleaseDelay);
  };


  const goPrevious = () => {
    const targetIndex =
      clamp(
        state.activeIndex - 1,
        0,
        state.sections.length - 1
      );

    scrollToSection(targetIndex);
  };


  const goNext = () => {
    const targetIndex =
      clamp(
        state.activeIndex + 1,
        0,
        state.sections.length - 1
      );

    scrollToSection(targetIndex);
  };


  const handleHash = () => {
    const hash = window.location.hash;

    if (!hash) return;

    const target = document.querySelector(hash);

    if (!target || !target.classList.contains("story")) {
      return;
    }

    const index = state.sections.indexOf(target);

    if (index < 0) return;

    window.setTimeout(() => {
      scrollToSection(index);
    }, 150);
  };


  const initSectionNavigation = () => {
    state.sections = dom.sections;

    updateHeaderSectionUI(0);

    dom.previousButton?.addEventListener(
      "click",
      goPrevious
    );

    dom.nextButton?.addEventListener(
      "click",
      goNext
    );

    window.addEventListener(
      "hashchange",
      handleHash
    );

    handleHash();
  };


  /* ==========================================================
     SCROLL
  ========================================================== */

  const handleScroll = () => {
    if (state.ticking) return;

    state.ticking = true;

    const update = () => {
      updateSectionUI();
      state.ticking = false;
    };

    if (
      state.reducedMotion ||
      !CONFIG.scrollTrackingRaf
    ) {
      update();
    } else {
      window.requestAnimationFrame(update);
    }

    wakeFromStandby();
  };


  const initScroll = () => {
    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
  };


  /* ==========================================================
     STANDBY
  ========================================================== */

  const setStandby = (visible) => {
    state.standby = visible;

    dom.standby?.classList.toggle(
      "is-visible",
      visible
    );

    dom.standby?.setAttribute(
      "aria-hidden",
      String(!visible)
    );
  };


  const resetStandbyTimer = () => {
    window.clearTimeout(
      state.standbyTimer
    );

    if (document.hidden) return;

    state.standbyTimer = window.setTimeout(() => {
      setStandby(true);
    }, CONFIG.standbyDelay);
  };


  const wakeFromStandby = () => {
    if (!state.standby) {
      resetStandbyTimer();
      return;
    }

    window.clearTimeout(
      state.standbyWakeTimer
    );

    state.standbyWakeTimer = window.setTimeout(() => {
      setStandby(false);
      resetStandbyTimer();
    }, CONFIG.standbyWakeThrottle);
  };


  const initStandby = () => {
    [
      "pointerdown",
      "mousemove",
      "touchstart",
      "keydown"
    ].forEach((eventName) => {
      window.addEventListener(
        eventName,
        wakeFromStandby,
        { passive: true }
      );
    });

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          window.clearTimeout(
            state.standbyTimer
          );
        } else {
          resetStandbyTimer();
        }
      }
    );

    resetStandbyTimer();
  };


  /* ==========================================================
     REDUCED MOTION
  ========================================================== */

  const updateReducedMotion = () => {
    state.reducedMotion =
      prefersReducedMotion();
  };


  const initReducedMotion = () => {
    updateReducedMotion();

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    mediaQuery.addEventListener?.(
      "change",
      updateReducedMotion
    );
  };


  /* ==========================================================
     GSAP — GENERIC REVEALS
  ========================================================== */

  const initGsap = () => {
    if (
      state.reducedMotion ||
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      initSimpleVisibility();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initTextReveals();
    initMovement();
    initSystemList();
    initMethod();
    initPlace();
    initPerson();
    initPrinciple();
    initContact();
  };


  /* ==========================================================
     TEXT REVEALS
  ========================================================== */

  const initTextReveals = () => {
    const sections = document.querySelectorAll(
      ".story"
    );

    sections.forEach((section) => {
      const eyebrow = section.querySelector(
        ".reveal-line"
      );

      const title = section.querySelector(
        ".story-title"
      );

      const paragraphs = section.querySelectorAll(
        ".narrative-copy p"
      );

      const timeline = gsap.timeline({
        paused: true
      });

      if (eyebrow) {
        timeline.to(
          eyebrow,
          {
            opacity: 1,
            y: 0,
            duration: .65,
            ease: "power3.out"
          },
          0
        );
      }

      if (title) {
        timeline.fromTo(
          title,
          {
            opacity: 0,
            y: 45
          },
          {
            opacity: 1,
            y: 0,
            duration: .9,
            ease: "power3.out"
          },
          .12
        );
      }

      if (paragraphs.length) {
        timeline.fromTo(
          paragraphs,
          {
            opacity: 0,
            y: 24
          },
          {
            opacity: 1,
            y: 0,
            duration: .55,
            stagger: .045,
            ease: "power2.out"
          },
          .28
        );
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top 72%",
        once: true,
        onEnter: () => timeline.play()
      });
    });
  };


  /* ==========================================================
     MOVIMENTO
  ========================================================== */

  const initMovement = () => {
    const section =
      document.querySelector("#movimento");

    if (!section) return;

    const words =
      section.querySelectorAll(
        ".movement-word span"
      );

    gsap.fromTo(
      words,
      {
        x: 90,
        opacity: 0
      },
      {
        x: 0,
        opacity: (index) =>
          index === 2 ? 1 : .55,
        duration: 1.1,
        stagger: .12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true
        }
      }
    );
  };


  /* ==========================================================
     SYSTEM LIST
  ========================================================== */

  const initSystemList = () => {
    const section =
      document.querySelector("#progettare");

    if (!section) return;

    const items =
      section.querySelectorAll(
        ".system-item"
      );

    gsap.fromTo(
      items,
      {
        opacity: 0,
        x: -24
      },
      {
        opacity: 1,
        x: 0,
        duration: .7,
        stagger: .1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section.querySelector(
            ".system-list"
          ),
          start: "top 78%",
          once: true
        }
      }
    );
  };


  /* ==========================================================
     METHOD
  ========================================================== */

  const initMethod = () => {
    const section =
      document.querySelector("#metodo");

    if (!section) return;

    const steps =
      section.querySelectorAll(
        ".method-step"
      );

    const arrows =
      section.querySelectorAll(
        ".method-arrow"
      );

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section.querySelector(
          ".method-sequence"
        ),
        start: "top 75%",
        once: true
      }
    });

    timeline.fromTo(
      steps,
      {
        opacity: 0,
        y: 24
      },
      {
        opacity: 1,
        y: 0,
        duration: .65,
        stagger: .14,
        ease: "power2.out"
      }
    );

    timeline.fromTo(
      arrows,
      {
        opacity: 0
      },
      {
        opacity: 1,
        duration: .35,
        stagger: .1
      },
      "-=.6"
    );
  };


  /* ==========================================================
     PLACE / MAP
  ========================================================== */

  const initPlace = () => {
    const section =
      document.querySelector("#luogo");

    if (!section) return;

    const map =
      section.querySelector(
        ".place-map-wrap"
      );

    if (!map) return;

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
          trigger: section,
          start: "top 65%",
          once: true
        }
      }
    );
  };


  /* ==========================================================
     PERSON
  ========================================================== */

  const initPerson = () => {
    const section =
      document.querySelector("#chi-sono");

    if (!section) return;

    const image =
      section.querySelector(
        ".person-image-frame"
      );

    if (!image) return;

    gsap.fromTo(
      image,
      {
        clipPath: "inset(0 100% 0 0)"
      },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.2,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true
        }
      }
    );

    const img =
      section.querySelector(
        ".person-image"
      );

    if (img) {
      gsap.fromTo(
        img,
        {
          scale: 1.12
        },
        {
          scale: 1.04,
          duration: 1.5,
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


  /* ==========================================================
     PRINCIPLE
  ========================================================== */

  const initPrinciple = () => {
    const section =
      document.querySelector("#principio");

    if (!section) return;

    const words =
      section.querySelectorAll(
        ".principle-words span"
      );

    const copy =
      section.querySelector(
        ".principle-copy"
      );

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 65%",
        once: true
      }
    });

    timeline.fromTo(
      words,
      {
        opacity: 0,
        y: 40
      },
      {
        opacity: (index) => {
          if (index === 0) return 1;
          if (index === 2) return 1;
          return .18;
        },
        y: 0,
        duration: 1,
        stagger: .18,
        ease: "power3.out"
      }
    );

    if (copy) {
      timeline.fromTo(
        copy,
        {
          opacity: 0,
          y: 25
        },
        {
          opacity: 1,
          y: 0,
          duration: .7,
          ease: "power2.out"
        },
        "-=.35"
      );
    }
  };


  /* ==========================================================
     CONTACT
  ========================================================== */

  const initContact = () => {
    const section =
      document.querySelector("#da-qui");

    if (!section) return;

    const link =
      section.querySelector(
        ".contact-link"
      );

    if (!link) return;

    gsap.fromTo(
      link,
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration: .7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: link,
          start: "top 85%",
          once: true
        }
      }
    );
  };


  /* ==========================================================
     FALLBACK VISIBILITY
  ========================================================== */

  const initSimpleVisibility = () => {
    const elements = document.querySelectorAll(
      ".reveal-line, .story-title, .narrative-copy p, .system-item, .method-step, .contact-link"
    );

    elements.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  };


  /* ==========================================================
     RESIZE
  ========================================================== */

  const handleResize = debounce(() => {
    updateSectionUI();

    if (
      typeof window.ScrollTrigger !== "undefined"
    ) {
      ScrollTrigger.refresh();
    }
  }, CONFIG.resizeDebounce);


  const initResize = () => {
    window.addEventListener(
      "resize",
      handleResize
    );
  };


  /* ==========================================================
     KEYBOARD SECTION NAVIGATION
  ========================================================== */

  const initKeyboardNavigation = () => {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          state.menuOpen ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey
        ) {
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          goNext();
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          goPrevious();
        }
      }
    );
  };


  /* ==========================================================
     INIT
  ========================================================== */

  const init = () => {

    initReducedMotion();

    initLoader();

    initMenu();

    initSectionNavigation();

    initScroll();

    initStandby();

    initResize();

    initKeyboardNavigation();

    /*
     * Attende il caricamento di GSAP/ScrollTrigger
     * senza bloccare la homepage.
     */
    const waitForGsap = () => {
      if (
        typeof window.gsap !== "undefined" &&
        typeof window.ScrollTrigger !== "undefined"
      ) {
        initGsap();
        return;
      }

      window.setTimeout(
        waitForGsap,
        100
      );
    };

    waitForGsap();

    updateSectionUI();
  };


  /* ==========================================================
     DOM READY
  ========================================================== */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
