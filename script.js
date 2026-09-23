/* ============================================================
   CESARE PARATORE
   V3.4 — PRODUCTION
============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     DOM
  ========================================================== */

  const menu = document.querySelector("#menu");

  const menuTrigger =
    document.querySelector(".menu-trigger");

  const menuLabel =
    document.querySelector(".menu-trigger-label");

  const menuLinks = menu
    ? [...menu.querySelectorAll("a")]
    : [];

  const main =
    document.querySelector("#main-content");

  const footer =
    document.querySelector(".site-footer");

  const sectionNav =
    document.querySelector(".section-nav");

  const navPrev =
    document.querySelector("[data-nav-prev]");

  const navNext =
    document.querySelector("[data-nav-next]");

  const navTitle =
    document.querySelector("[data-nav-title]");

  const sections = [
    ...document.querySelectorAll(".story-section")
  ];

  const loader =
    document.querySelector(".site-loader");

  const standby =
    document.querySelector(".standby");

  const year =
    document.querySelector("[data-current-year]");


  /* ==========================================================
     LIBRARIES
  ========================================================== */

  const GSAP =
    window.gsap || null;

  const ScrollTrigger =
    window.ScrollTrigger || null;


  /* ==========================================================
     STATE
  ========================================================== */

  const motionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const state = {

    menuOpen: false,

    activeIndex: 0,

    loaderHidden: false,

    standbyTimer: null,

    standbyVisible: false,

    pointerActivityTimer: null,

    reducedMotion: motionQuery.matches

  };


  /* ==========================================================
     CONFIG
  ========================================================== */

  const CONFIG = {

    standbyDelay: 40000,

    sectionReadingOffset: 0.32,

    pointerThrottle: 800

  };


  /* ==========================================================
     UTILITIES
  ========================================================== */

  function getHeaderHeight() {

    const header =
      document.querySelector(".site-header");

    return (
      header?.getBoundingClientRect().height ||
      0
    );

  }


  function getNavHeight() {

    return (
      sectionNav?.getBoundingClientRect().height ||
      0
    );

  }


  /* ==========================================================
     MENU
  ========================================================== */

  function setMenuTabState(disabled) {

    menuLinks.forEach((link) => {

      if (disabled) {

        if (
          !link.hasAttribute(
            "data-menu-tabindex"
          )
        ) {

          link.setAttribute(
            "data-menu-tabindex",
            link.getAttribute("tabindex") ?? ""
          );

        }

        link.setAttribute(
          "tabindex",
          "-1"
        );

      } else {

        const previous =
          link.getAttribute(
            "data-menu-tabindex"
          );

        if (previous === "") {

          link.removeAttribute(
            "tabindex"
          );

        } else if (previous !== null) {

          link.setAttribute(
            "tabindex",
            previous
          );

        }

        link.removeAttribute(
          "data-menu-tabindex"
        );

      }

    });


    if (
      menu &&
      "inert" in HTMLElement.prototype
    ) {

      menu.inert = disabled;

    }

  }


  function setMainInert(inert) {

    [main, footer].forEach(
      (element) => {

        if (!element) return;

        if (inert) {

          element.setAttribute(
            "inert",
            ""
          );

        } else {

          element.removeAttribute(
            "inert"
          );

        }

      }
    );

  }


  function updateMenuState(open) {

    if (
      !menu ||
      !menuTrigger
    ) {
      return;
    }


    state.menuOpen = open;


    menu.classList.toggle(
      "is-open",
      open
    );


    menu.setAttribute(
      "aria-hidden",
      String(!open)
    );


    menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );


    menuTrigger.setAttribute(
      "aria-label",
      open
        ? "Chiudi menu"
        : "Apri menu"
    );


    if (menuLabel) {

      menuLabel.textContent =
        open
          ? "Chiudi"
          : "Menu";

    }


    menuTrigger.classList.toggle(
      "is-open",
      open
    );


    setMenuTabState(!open);

    setMainInert(open);


    document.body.classList.toggle(
      "menu-open",
      open
    );


    if (open) {

      stopStandby();

      requestAnimationFrame(() => {

        menuLinks[0]?.focus();

      });

    } else {

      scheduleStandby();

    }

  }


  function openMenu() {

    updateMenuState(true);

  }


  function closeMenu({
    restoreFocus = true
  } = {}) {

    if (!state.menuOpen) {
      return;
    }


    updateMenuState(false);


    if (
      restoreFocus &&
      menuTrigger
    ) {

      menuTrigger.focus();

    }

  }


  function trapFocus(event) {

    if (!state.menuOpen) {
      return;
    }


    if (event.key !== "Tab") {
      return;
    }


    const focusable = [

      menuTrigger,

      ...menuLinks

    ].filter(
      (element) =>

        element &&

        !element.hasAttribute(
          "disabled"
        ) &&

        element.tabIndex !== -1
    );


    if (!focusable.length) {
      return;
    }


    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length - 1
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


  function initMenu() {

    if (
      !menu ||
      !menuTrigger
    ) {
      return;
    }


    updateMenuState(false);


    menuTrigger.addEventListener(
      "click",
      () => {

        state.menuOpen
          ? closeMenu()
          : openMenu();

      }
    );


    menuLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {

            closeMenu({
              restoreFocus: false
            });

          }
        );

      }
    );


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          state.menuOpen
        ) {

          closeMenu();

        }

        trapFocus(event);

      }
    );

  }


  /* ==========================================================
     STANDBY
  ========================================================== */

  function hideStandby() {

    if (!standby) {
      return;
    }


    standby.classList.remove(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    state.standbyVisible = false;

  }


  function stopStandby() {

    clearTimeout(
      state.standbyTimer
    );

    state.standbyTimer = null;

    hideStandby();

  }


  function scheduleStandby() {

    clearTimeout(
      state.standbyTimer
    );


    if (
      state.menuOpen ||
      document.hidden
    ) {

      return;

    }


    state.standbyTimer =
      setTimeout(() => {

        if (
          state.menuOpen ||
          document.hidden
        ) {

          return;

        }


        standby?.classList.add(
          "is-visible"
        );


        standby?.setAttribute(
          "aria-hidden",
          "false"
        );


        state.standbyVisible = true;

      }, CONFIG.standbyDelay);

  }


  function registerActivity() {

    hideStandby();

    scheduleStandby();

  }


  function registerPointerActivity() {

    if (
      state.pointerActivityTimer
    ) {
      return;
    }


    state.pointerActivityTimer =
      setTimeout(() => {

        state.pointerActivityTimer =
          null;

        registerActivity();

      }, CONFIG.pointerThrottle);

  }


  window.addEventListener(
    "pointermove",
    registerPointerActivity,
    { passive: true }
  );


  window.addEventListener(
    "pointerdown",
    registerActivity,
    { passive: true }
  );


  window.addEventListener(
    "touchstart",
    registerActivity,
    { passive: true }
  );


  window.addEventListener(
    "wheel",
    registerActivity,
    { passive: true }
  );


  window.addEventListener(
    "keydown",
    registerActivity
  );


  /* ==========================================================
     SECTION NAVIGATION
  ========================================================== */

  function getScrollTarget(section) {

    const headerHeight =
      getHeaderHeight();

    const navHeight =
      getNavHeight();


    return Math.max(

      0,

      window.scrollY +

      section.getBoundingClientRect().top -

      headerHeight +

      Math.min(
        navHeight * 0.15,
        20
      )

    );

  }


  function goToSection(index) {

    const section =
      sections[index];

    if (!section) {
      return;
    }


    window.scrollTo({

      top:
        getScrollTarget(section),

      behavior:
        state.reducedMotion
          ? "auto"
          : "smooth"

    });

  }


  function setActiveSection(index) {

    if (!sections[index]) {
      return;
    }


    state.activeIndex =
      index;


    const section =
      sections[index];


    const isLight =
      section.classList.contains(
        "story-light"
      );


    document.documentElement.dataset
      .activeSection =
        String(index);


    sectionNav?.setAttribute(
      "data-theme",
      isLight
        ? "light"
        : "dark"
    );


    if (navTitle) {

      navTitle.textContent =
        section.dataset.sectionTitle ||
        "";

    }


    if (navPrev) {

      const disabled =
        index === 0;

      navPrev.disabled =
        disabled;

      navPrev.setAttribute(
        "aria-disabled",
        String(disabled)
      );

    }


    if (navNext) {

      const disabled =
        index ===
        sections.length - 1;

      navNext.disabled =
        disabled;

      navNext.setAttribute(
        "aria-disabled",
        String(disabled)
      );

    }

  }


  function updateActiveSection() {

    if (!sections.length) {
      return;
    }


    const readingLine =
      getHeaderHeight() +

      Math.min(
        window.innerHeight *
          CONFIG.sectionReadingOffset,

        260
      );


    let active = -1;


    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();


        if (
          rect.top <= readingLine &&
          rect.bottom >= readingLine
        ) {

          active = index;

        }

      }
    );


    if (active === -1) {

      let closestDistance =
        Infinity;


      sections.forEach(
        (section, index) => {

          const rect =
            section.getBoundingClientRect();


          const distance =
            Math.abs(
              rect.top -
              readingLine
            );


          if (
            distance <
            closestDistance
          ) {

            closestDistance =
              distance;

            active =
              index;

          }

        }
      );

    }


    if (
      active !==
      state.activeIndex
    ) {

      setActiveSection(
        active
      );

    }

  }


  if (navPrev) {

    navPrev.addEventListener(
      "click",
      () => {

        goToSection(
          Math.max(
            0,
            state.activeIndex - 1
          )
        );

      }
    );

  }


  if (navNext) {

    navNext.addEventListener(
      "click",
      () => {

        goToSection(
          Math.min(
            sections.length - 1,
            state.activeIndex + 1
          )
        );

      }
    );

  }


  /* ==========================================================
     GSAP ANIMATIONS
  ========================================================== */

  function initAnimations() {

    if (
      !GSAP ||
      !ScrollTrigger ||
      state.reducedMotion
    ) {

      return;

    }


    GSAP.registerPlugin(
      ScrollTrigger
    );


    sections.forEach(
      (section) => {

        const title =
          section.querySelector(
            ".story-title"
          );


        const body =
          section.querySelector(
            ".story-body"
          );


        const isOpening =
          section.classList.contains(
            "story-opening"
          );


        const isUnderstand =
          section.classList.contains(
            "story-understand"
          );


        const isReturn =
          section.classList.contains(
            "story-return"
          );


        const isConnect =
          section.classList.contains(
            "story-connect"
          );


        const isToday =
          section.classList.contains(
            "story-today"
          );


        if (
          title &&
          !isOpening &&
          !isReturn
        ) {

          GSAP.fromTo(

            title,

            {
              y: 36,
              opacity: 0
            },

            {
              y: 0,
              opacity: 1,

              duration: 1,

              ease:
                "power3.out",

              scrollTrigger: {

                trigger: section,

                start: "top 76%",

                once: true

              }

            }

          );

        }


        if (
          body &&
          !isUnderstand &&
          !isConnect &&
          !isToday
        ) {

          GSAP.fromTo(

            body,

            {
              y: 24,
              opacity: 0
            },

            {
              y: 0,
              opacity: 1,

              duration: 0.9,

              delay: 0.08,

              ease:
                "power2.out",

              scrollTrigger: {

                trigger: section,

                start: "top 70%",

                once: true

              }

            }

          );

        }


        /* ------------------------------------------------------
           OPENING
        ------------------------------------------------------ */

        if (isOpening) {

          const lines = [
            ...section.querySelectorAll(
              ".story-body p"
            )
          ];


          if (title) {

            GSAP.fromTo(

              title,

              {
                y: 70,
                opacity: 0
              },

              {
                y: 0,
                opacity: 1,

                duration: 1.25,

                ease:
                  "power4.out",

                scrollTrigger: {

                  trigger: section,

                  start: "top 80%",

                  once: true

                }

              }

            );

          }


          if (lines.length) {

            GSAP.fromTo(

              lines,

              {
                y: 20,
                opacity: 0
              },

              {
                y: 0,
                opacity: 1,

                duration: 0.8,

                stagger: 0.08,

                delay: 0.15,

                ease:
                  "power2.out",

                scrollTrigger: {

                  trigger: section,

                  start: "top 65%",

                  once: true

                }

              }

            );

          }

        }


        /* ------------------------------------------------------
           UNDERSTAND
        ------------------------------------------------------ */

        if (
          isUnderstand &&
          body
        ) {

          GSAP.fromTo(

            body,

            {
              x: 42,
              opacity: 0
            },

            {
              x: 0,
              opacity: 1,

              duration: 1,

              ease:
                "power3.out",

              scrollTrigger: {

                trigger: section,

                start: "top 70%",

                once: true

              }

            }

          );

        }


        /* ------------------------------------------------------
           RETURN
        ------------------------------------------------------ */

        if (
          isReturn &&
          title
        ) {

          GSAP.fromTo(

            title,

            {
              scale: 0.94,
              opacity: 0
            },

            {
              scale: 1,
              opacity: 1,

              duration: 1.1,

              ease:
                "power3.out",

              scrollTrigger: {

                trigger: section,

                start: "top 72%",

                once: true

              }

            }

          );

        }


        /* ------------------------------------------------------
           CONNECT
        ------------------------------------------------------ */

        if (
          isConnect &&
          body
        ) {

          const paragraphs = [
            ...body.querySelectorAll(
              ".story-connect-word"
            )
          ];


          if (paragraphs.length) {

            GSAP.fromTo(

              paragraphs,

              {
                y: 24,
                opacity: 0
              },

              {
                y: 0,
                opacity: 1,

                duration: 0.75,

                stagger: 0.1,

                ease:
                  "power2.out",

                scrollTrigger: {

                  trigger: section,

                  start: "top 70%",

                  once: true

                }

              }

            );

          }


          const final =
            body.querySelector(
              ".story-connect-final"
            );


          if (final) {

            GSAP.fromTo(

              final,

              {
                y: 18,
                opacity: 0
              },

              {
                y: 0,
                opacity: 1,

                duration: 0.8,

                delay: 0.4,

                ease:
                  "power2.out",

                scrollTrigger: {

                  trigger: section,

                  start: "top 65%",

                  once: true

                }

              }

            );

          }

        }


        /* ------------------------------------------------------
           TODAY
        ------------------------------------------------------ */

        if (
          isToday &&
          body
        ) {

          const lead =
            body.querySelector(
              ".story-lead"
            );


          const paragraphs = [
            ...body.querySelectorAll(
              "p"
            )
          ].filter(
            (paragraph) =>
              paragraph !== lead
          );


          if (lead) {

            GSAP.fromTo(

              lead,

              {
                y: 32,
                opacity: 0
              },

              {
                y: 0,
                opacity: 1,

                duration: 1,

                ease:
                  "power3.out",

                scrollTrigger: {

                  trigger: section,

                  start: "top 70%",

                  once: true

                }

              }

            );

          }


          if (paragraphs.length) {

            GSAP.fromTo(

              paragraphs,

              {
                y: 18,
                opacity: 0
              },

              {
                y: 0,
                opacity: 1,

                duration: 0.75,

                stagger: 0.1,

                delay: 0.12,

                ease:
                  "power2.out",

                scrollTrigger: {

                  trigger: section,

                  start: "top 68%",

                  once: true

                }

              }

            );

          }

        }

      }
    );

  }


  /* ==========================================================
     LOADER
  ========================================================== */

  function hideLoader() {

    if (
      !loader ||
      state.loaderHidden
    ) {

      return;

    }


    state.loaderHidden =
      true;


    if (
      !GSAP ||
      state.reducedMotion
    ) {

      loader.classList.add(
        "is-hidden"
      );

      loader.setAttribute(
        "aria-hidden",
        "true"
      );

      return;

    }


    GSAP.to(
      loader,
      {

        autoAlpha: 0,

        duration: 0.65,

        ease:
          "power2.inOut",

        onComplete: () => {

          loader.classList.add(
            "is-hidden"
          );

          loader.setAttribute(
            "aria-hidden",
            "true"
          );

        }

      }
    );

  }


  function initLoader() {

    if (!loader) {
      return;
    }


    const fallback =
      setTimeout(
        hideLoader,
        3500
      );


    if (
      document.readyState ===
      "complete"
    ) {

      clearTimeout(
        fallback
      );

      hideLoader();

      return;

    }


    window.addEventListener(
      "load",
      () => {

        clearTimeout(
          fallback
        );

        hideLoader();

      },
      { once: true }
    );

  }


  /* ==========================================================
     REDUCED MOTION
  ========================================================== */

  motionQuery.addEventListener(
    "change",
    (event) => {

      state.reducedMotion =
        event.matches;


      if (
        state.reducedMotion &&
        ScrollTrigger
      ) {

        ScrollTrigger
          .getAll()
          .forEach(
            (trigger) =>
              trigger.kill()
          );

      }

    }
  );


  /* ==========================================================
     HASH
  ========================================================== */

  function initInitialHash() {

    const hash =
      window.location.hash;


    if (!hash) {
      return;
    }


    let target = null;


    try {

      target =
        document.querySelector(
          hash
        );

    } catch {
      return;
    }


    if (
      !target ||
      !target.classList.contains(
        "story-section"
      )
    ) {

      return;

    }


    const index =
      sections.indexOf(
        target
      );


    if (index === -1) {
      return;
    }


    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          () => {

            goToSection(
              index
            );

          }
        );

      }
    );

  }


  /* ==========================================================
     LAYOUT
  ========================================================== */

  function refreshLayout() {

    updateActiveSection();


    if (ScrollTrigger) {

      ScrollTrigger.refresh();

    }

  }


  let resizeTimer = null;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          refreshLayout,
          120
        );

    },
    { passive: true }
  );


  window.addEventListener(
    "orientationchange",
    refreshLayout,
    { passive: true }
  );


  window.addEventListener(
    "pageshow",
    () => {

      refreshLayout();

      scheduleStandby();

    }
  );


  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        stopStandby();

      } else {

        scheduleStandby();

        refreshLayout();

      }

    }
  );


  /* ==========================================================
     SCROLL
  ========================================================== */

  let ticking = false;


  function handleScroll() {

    if (ticking) {
      return;
    }


    ticking = true;


    requestAnimationFrame(
      () => {

        updateActiveSection();

        ticking = false;

      }
    );

  }


  window.addEventListener(
    "scroll",
    handleScroll,
    { passive: true }
  );


  /* ==========================================================
     YEAR
  ========================================================== */

  if (year) {

    year.textContent =
      new Date()
        .getFullYear()
        .toString();

  }


  /* ==========================================================
     INIT
  ========================================================== */

  function init() {

    initMenu();

    initLoader();

    initAnimations();

    setActiveSection(0);

    updateActiveSection();

    initInitialHash();

    scheduleStandby();

  }


  init();

})();
