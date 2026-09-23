/* =========================================================
   CESARE PARATORE — HOME
   CINEMATIC / EDITORIAL SYSTEM
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 4500,

    activeLineRatio: 0.34,
    activeLineMax: 300,

    scrollOffset: 10,

    pointerThrottle: 700,

    titleEnterStart: "top 82%",
    titleEnterEnd: "top 45%",

    contentStart: "top 68%",

    smoothDuration: 1.05
  };


  /* =======================================================
     DOM
     ======================================================= */

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const standby = doc.getElementById("standby");

  const menuToggle = doc.querySelector(".menu-toggle");
  const menu = doc.getElementById("menu");

  const main = doc.getElementById("main-content");
  const footer = doc.querySelector(".site-footer");

  const header = doc.querySelector(".site-header");

  const activeSectionTitle =
    doc.getElementById("active-section-title");

  const wowProgress =
    doc.querySelector(".wow-track-progress");

  const wowDot =
    doc.querySelector(".wow-track-dot");

  const sectionPrev =
    doc.querySelector(".wow-arrow-prev");

  const sectionNext =
    doc.querySelector(".wow-arrow-next");

  const sections = Array.from(
    doc.querySelectorAll(".story")
  );


  /* =======================================================
     STATE
     ======================================================= */

  let currentIndex = 0;

  let menuOpen = false;

  let standbyTimer = null;

  let loaderHidden = false;

  let lastPointerActivity = 0;

  let menuFocusables = [];

  let restoreFocusElement = null;

  let scrollTicking = false;

  let loaderTimeline = null;


  const reduceMotionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  /* =======================================================
     HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const getSectionTitle = (section) => {
    if (!section) return "";

    return (
      section.dataset.title ||
      section
        .querySelector("h1, h2")
        ?.textContent
        ?.trim() ||
      ""
    );
  };


  const isVisible = (element) => {
    if (!element) return false;

    const style =
      window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  };


  const getFocusableElements = (container) => {
    if (!container) return [];

    return Array.from(
      container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter(isVisible);
  };


  /* =======================================================
     YEAR
     ======================================================= */

  /*
   * Kept intentionally for compatibility with any future
   * footer modules that may reintroduce a year element.
   */

  const currentYear =
    doc.getElementById("current-year");

  if (currentYear) {
    currentYear.textContent =
      String(new Date().getFullYear());
  }


  /* =======================================================
     MENU ACCESSIBILITY
     ======================================================= */

  function setMenuTabState(disabled) {
    if (!menu) return;

    const focusables =
      getFocusableElements(menu);

    focusables.forEach((element) => {

      if (disabled) {

        element.dataset.menuTabindex =
          element.getAttribute("tabindex") ?? "";

        element.setAttribute(
          "tabindex",
          "-1"
        );

      } else {

        const previous =
          element.dataset.menuTabindex;

        if (previous === "") {

          element.removeAttribute("tabindex");

        } else if (
          previous !== undefined
        ) {

          element.setAttribute(
            "tabindex",
            previous
          );
        }

        delete element.dataset.menuTabindex;
      }
    });
  }


  function setBackgroundInteractionDisabled(
    disabled
  ) {

    if (main) {
      main.inert = disabled;

      main.setAttribute(
        "aria-hidden",
        disabled ? "true" : "false"
      );
    }

    if (footer) {
      footer.inert = disabled;

      footer.setAttribute(
        "aria-hidden",
        disabled ? "true" : "false"
      );
    }
  }


  function updateMenuLabel() {

    if (!menuToggle) return;

    const label =
      menuToggle.querySelector(
        ".menu-label"
      );

    menuToggle.setAttribute(
      "aria-expanded",
      String(menuOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      menuOpen
        ? "Chiudi menu"
        : "Apri menu"
    );

    if (label) {
      label.textContent =
        menuOpen
          ? "CHIUDI"
          : "MENU";
    }
  }


  function updateMenuState(
    forceOpen = null
  ) {

    if (!menu || !menuToggle) return;

    const shouldOpen =
      forceOpen === null
        ? !menuOpen
        : Boolean(forceOpen);

    if (
      shouldOpen === menuOpen &&
      forceOpen !== null
    ) {
      return;
    }

    if (shouldOpen) {
      restoreFocusElement =
        doc.activeElement;
    }

    menuOpen = shouldOpen;

    menu.classList.toggle(
      "is-open",
      menuOpen
    );

    menu.setAttribute(
      "aria-hidden",
      String(!menuOpen)
    );

    setBackgroundInteractionDisabled(
      menuOpen
    );

    setMenuTabState(!menuOpen);

    updateMenuLabel();

    html.classList.toggle(
      "menu-is-open",
      menuOpen
    );

    body.classList.toggle(
      "menu-is-open",
      menuOpen
    );

    if (menuOpen) {

      hideStandby();

      requestAnimationFrame(() => {

        menuFocusables =
          getFocusableElements(menu);

        if (menuFocusables.length) {
          menuFocusables[0].focus();
        }
      });

    } else {

      const target =
        restoreFocusElement &&
        typeof restoreFocusElement.focus ===
          "function"
          ? restoreFocusElement
          : menuToggle;

      requestAnimationFrame(() => {
        target?.focus?.();
      });

      restoreFocusElement = null;

      resetStandbyTimer();
    }
  }


  function trapMenuFocus(event) {

    if (
      !menuOpen ||
      event.key !== "Tab"
    ) {
      return;
    }

    menuFocusables =
      getFocusableElements(menu);

    if (!menuFocusables.length) {
      event.preventDefault();
      return;
    }

    const first =
      menuFocusables[0];

    const last =
      menuFocusables[
        menuFocusables.length - 1
      ];

    if (
      event.shiftKey &&
      doc.activeElement === first
    ) {

      event.preventDefault();
      last.focus();

      return;
    }

    if (
      !event.shiftKey &&
      doc.activeElement === last
    ) {

      event.preventDefault();
      first.focus();
    }
  }


  menuToggle?.addEventListener(
    "click",
    () => {
      updateMenuState();
    }
  );


  menu?.addEventListener(
    "click",
    (event) => {

      const link =
        event.target.closest("a");

      if (!link) return;

      updateMenuState(false);
    }
  );


  doc.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        menuOpen
      ) {

        event.preventDefault();

        updateMenuState(false);

        return;
      }

      trapMenuFocus(event);
    }
  );


  /* =======================================================
     STANDBY
     ======================================================= */

  function hideStandby() {

    if (!standby) return;

    standby.classList.remove(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );
  }


  function showStandby() {

    if (!standby) return;

    if (
      menuOpen ||
      doc.hidden
    ) {
      return;
    }

    standby.classList.add(
      "is-visible"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  function resetStandbyTimer() {

    if (standbyTimer) {
      window.clearTimeout(
        standbyTimer
      );
    }

    hideStandby();

    standbyTimer =
      window.setTimeout(
        showStandby,
        CONFIG.standbyDelay
      );
  }


  function handleActivity() {

    hideStandby();

    resetStandbyTimer();
  }


  [
    "scroll",
    "wheel",
    "touchstart",
    "keydown",
    "click"
  ].forEach((eventName) => {

    window.addEventListener(
      eventName,
      handleActivity,
      {
        passive: true
      }
    );
  });


  window.addEventListener(
    "pointermove",
    () => {

      const now =
        Date.now();

      if (
        now -
          lastPointerActivity <
        CONFIG.pointerThrottle
      ) {
        return;
      }

      lastPointerActivity = now;

      handleActivity();
    },
    {
      passive: true
    }
  );


  /* =======================================================
     CINEMATIC LOADER
     ======================================================= */

  function finishLoader() {

    if (!loader) return;

    loader.setAttribute(
      "aria-hidden",
      "true"
    );

    loader.style.display = "none";

    html.classList.add(
      "site-ready"
    );
  }


  function hideLoader() {

    if (
      loaderHidden ||
      !loader
    ) {
      return;
    }

    loaderHidden = true;

    if (
      reduceMotionQuery.matches ||
      !window.gsap
    ) {

      finishLoader();

      return;
    }

    window.gsap.to(
      loader,
      {
        opacity: 0,
        duration: .75,
        ease: "power2.inOut",
        onComplete:
          finishLoader
      }
    );
  }


  function initLoader() {

    if (!loader) return;

    if (
      reduceMotionQuery.matches
    ) {

      const mark =
        loader.querySelector(
          ".loader-mark img"
        );

      const signature =
        loader.querySelector(
          ".loader-signature"
        );

      const line =
        loader.querySelector(
          ".loader-line"
        );

      if (mark) {
        mark.style.opacity = "1";
        mark.style.transform =
          "none";
      }

      if (signature) {
        signature.style.opacity = "1";
        signature.style.transform =
          "none";
      }

      if (line) {
        line.style.opacity = "1";
      }

      window.setTimeout(
        hideLoader,
        250
      );

      return;
    }


    if (!window.gsap) {

      window.setTimeout(
        hideLoader,
        500
      );

      return;
    }


    const mark =
      loader.querySelector(
        ".loader-mark img"
      );

    const signature =
      loader.querySelector(
        ".loader-signature"
      );

    const line =
      loader.querySelector(
        ".loader-line"
      );

    const lineInner =
      loader.querySelector(
        ".loader-line span"
      );


    loaderTimeline =
      window.gsap.timeline({
        defaults: {
          ease: "power4.out"
        }
      });


    loaderTimeline

      .to(
        mark,
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1.05,
          ease: "power4.out"
        }
      )

      .to(
        line,
        {
          opacity: 1,
          duration: .25
        },
        "-=.25"
      )

      .to(
        lineInner,
        {
          x: "0%",
          duration: .8,
          ease: "power3.inOut"
        }
      )

      .to(
        signature,
        {
          opacity: 1,
          y: 0,
          duration: .8,
          ease: "power3.out"
        },
        "-=.35"
      )

      .to(
        {},
        {
          duration: .35
        }
      )

      .call(
        hideLoader
      );


    window.setTimeout(
      hideLoader,
      CONFIG.loaderFailsafe
    );
  }


  /* =======================================================
     SECTION STATE
     ======================================================= */

  function getReadingLine() {

    const headerHeight =
      header?.offsetHeight || 0;

    return (
      headerHeight +
      Math.min(
        window.innerHeight *
          CONFIG.activeLineRatio,
        CONFIG.activeLineMax
      )
    );
  }


  function getActiveSectionIndex() {

    if (!sections.length) {
      return 0;
    }

    const readingLine =
      getReadingLine();

    let bestIndex = 0;

    let bestDistance =
      Number.POSITIVE_INFINITY;


    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();


        if (
          rect.top <=
            readingLine &&
          rect.bottom >=
            readingLine
        ) {

          bestIndex = index;
          bestDistance = 0;

          return;
        }


        const center =
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            center -
              readingLine
          );


        if (
          distance <
          bestDistance
        ) {

          bestDistance =
            distance;

          bestIndex =
            index;
        }
      }
    );


    return bestIndex;
  }


  function updateWowBar(index) {

    if (!sections.length) return;

    const total =
      sections.length - 1;

    const progress =
      total <= 0
        ? 0
        : (index / total) * 100;


    if (wowProgress) {
      wowProgress.style.width =
        `${progress}%`;
    }


    if (wowDot) {
      wowDot.style.left =
        `${progress}%`;
    }
  }


  function updateHeaderTitle(
    index
  ) {

    if (!activeSectionTitle) {
      return;
    }

    const title =
      getSectionTitle(
        sections[index]
      );

    if (
      activeSectionTitle.textContent ===
      title
    ) {
      return;
    }

    activeSectionTitle.style.opacity =
      "0";

    activeSectionTitle.style.transform =
      "translateY(5px)";

    window.setTimeout(
      () => {

        if (!activeSectionTitle) {
          return;
        }

        activeSectionTitle.textContent =
          title;

        activeSectionTitle.style.opacity =
          "1";

        activeSectionTitle.style.transform =
          "translateY(0)";
      },
      170
    );
  }


  function updateSectionAccessibility(
    index
  ) {

    sections.forEach(
      (section, itemIndex) => {

        section.setAttribute(
          "aria-current",
          itemIndex === index
            ? "true"
            : "false"
        );
      }
    );
  }


  function updateSectionNavigation(
    index =
      getActiveSectionIndex()
  ) {

    if (!sections.length) {
      return;
    }

    index =
      clamp(
        index,
        0,
        sections.length - 1
      );


    currentIndex =
      index;


    updateHeaderTitle(
      index
    );

    updateWowBar(
      index
    );

    updateSectionAccessibility(
      index
    );


    if (sectionPrev) {

      const disabled =
        index === 0;

      sectionPrev.disabled =
        disabled;

      sectionPrev.setAttribute(
        "aria-label",
        disabled
          ? "Sezione precedente non disponibile"
          : `Vai a ${getSectionTitle(
              sections[index - 1]
            )}`
      );
    }


    if (sectionNext) {

      const disabled =
        index ===
        sections.length - 1;

      sectionNext.disabled =
        disabled;

      sectionNext.setAttribute(
        "aria-label",
        disabled
          ? "Sezione successiva non disponibile"
          : `Vai a ${getSectionTitle(
              sections[index + 1]
            )}`
      );
    }


    html.dataset.activeSection =
      sections[index]?.id || "";
  }


  /* =======================================================
     SCROLL TO SECTION
     ======================================================= */

  function scrollToSection(index) {

    if (!sections[index]) {
      return;
    }

    const section =
      sections[index];


    const top =
      window.scrollY +
      section.getBoundingClientRect()
        .top -
      CONFIG.scrollOffset;


    if (
      reduceMotionQuery.matches
    ) {

      window.scrollTo({
        top,
        behavior: "auto"
      });

      return;
    }


    if (
      window.gsap &&
      window.ScrollToPlugin
    ) {

      window.gsap.to(
        window,
        {
          duration:
            CONFIG.smoothDuration,
          scrollTo: {
            y: top,
            autoKill: true
          },
          ease: "power3.inOut"
        }
      );

      return;
    }


    window.scrollTo({
      top,
      behavior: "smooth"
    });
  }


  sectionPrev?.addEventListener(
    "click",
    () => {

      if (
        currentIndex > 0
      ) {

        scrollToSection(
          currentIndex - 1
        );
      }
    }
  );


  sectionNext?.addEventListener(
    "click",
    () => {

      if (
        currentIndex <
        sections.length - 1
      ) {

        scrollToSection(
          currentIndex + 1
        );
      }
    }
  );


  /* =======================================================
     KEYBOARD CHAPTER NAVIGATION
     ======================================================= */

  doc.addEventListener(
    "keydown",
    (event) => {

      if (
        menuOpen ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }


      const bodyFocused =
        doc.activeElement ===
        body;


      if (
        event.key ===
          "ArrowDown" &&
        bodyFocused
      ) {

        event.preventDefault();

        if (
          currentIndex <
          sections.length - 1
        ) {

          scrollToSection(
            currentIndex + 1
          );
        }
      }


      if (
        event.key ===
          "ArrowUp" &&
        bodyFocused
      ) {

        event.preventDefault();

        if (
          currentIndex > 0
        ) {

          scrollToSection(
            currentIndex - 1
          );
        }
      }
    }
  );


  /* =======================================================
     SCROLL / ACTIVE SECTION
     ======================================================= */

  function requestSectionUpdate() {

    if (scrollTicking) {
      return;
    }

    scrollTicking = true;


    window.requestAnimationFrame(
      () => {

        updateSectionNavigation();

        scrollTicking = false;
      }
    );
  }


  window.addEventListener(
    "scroll",
    requestSectionUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestSectionUpdate,
    {
      passive: true
    }
  );


  /* =======================================================
     GSAP
     ======================================================= */

  function gsapAvailable() {

    return (
      !reduceMotionQuery.matches &&
      window.gsap &&
      window.ScrollTrigger
    );
  }


  function killStoryAnimations() {

    if (
      !window.ScrollTrigger
    ) {
      return;
    }


    window.ScrollTrigger
      .getAll()
      .filter(
        (trigger) =>
          trigger.vars &&
          trigger.vars.id &&
          String(
            trigger.vars.id
          ).startsWith(
            "story-"
          )
      )
      .forEach(
        (trigger) =>
          trigger.kill()
      );
  }


  /* =======================================================
     TITLE SCROLL SYSTEM
     ======================================================= */

  function initTitleScroll(
    section,
    index
  ) {

    const title =
      section.querySelector(
        ".story-title"
      );

    if (!title) return;


    if (
      section.classList.contains(
        "story-opening"
      )
    ) {

      window.gsap.fromTo(
        title,
        {
          opacity: 1,
          y: 0,
          scale: 1
        },
        {
          opacity: 0,
          y: -60,
          scale: .96,

          ease: "none",

          scrollTrigger: {
            id:
              `story-${index}-opening-title`,

            trigger:
              section,

            start: "top top",

            end: "bottom 58%",

            scrub: true
          }
        }
      );

      return;
    }


    window.gsap.fromTo(
      title,
      {
        opacity: 0,
        y: 48,
        scale: .97
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,

        ease: "none",

        scrollTrigger: {
          id:
            `story-${index}-title-enter`,

          trigger:
            section,

          start:
            CONFIG.titleEnterStart,

          end:
            CONFIG.titleEnterEnd,

          scrub: true
        }
      }
    );


    window.gsap.to(
      title,
      {
        opacity: 0,
        y: -48,
        scale: .98,

        ease: "none",

        scrollTrigger: {
          id:
            `story-${index}-title-exit`,

          trigger:
            section,

          start: "center 35%",

          end: "bottom 18%",

          scrub: true
        }
      }
    );
  }


  /* =======================================================
     CONTENT SCROLL SYSTEM
     ======================================================= */

  function initContentAnimation(
    section,
    index
  ) {

    if (
      section.classList.contains(
        "story-opening"
      )
    ) {
      return;
    }


    const contentSelectors = [
      ".narrative-copy p",
      ".understand-lead",
      ".split-lead p",
      ".detail-lead p",
      ".return-copy > p",
      ".return-list span",
      ".connect-words span",
      ".today-lead",
      ".objective-lead",
      ".place-copy .narrative-copy",
      ".from-here-lead",
      ".person-copy .narrative-copy p",
      ".contact-lead",
      ".contact-layout .narrative-copy",
      ".contact-link",
      ".map-frame",
      ".person-frame"
    ];


    const elements =
      section.querySelectorAll(
        contentSelectors.join(",")
      );


    if (!elements.length) {
      return;
    }


    window.gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 34
      },
      {
        opacity: 1,
        y: 0,

        duration: .8,

        stagger: {
          each: .075,
          from: "start"
        },

        ease: "power3.out",

        scrollTrigger: {
          id:
            `story-${index}-content`,

          trigger:
            section,

          start:
            CONFIG.contentStart,

          once: true
        }
      }
    );
  }


  /* =======================================================
     SPECIAL VISUAL MOTION
     ======================================================= */

  function initSpecialMotion(
    section,
    index
  ) {

    const frame =
      section.querySelector(
        ".person-frame img"
      );

    if (frame) {

      window.gsap.to(
        frame,
        {
          yPercent: -4,

          ease: "none",

          scrollTrigger: {
            id:
              `story-${index}-portrait`,

            trigger:
              section,

            start: "top bottom",

            end: "bottom top",

            scrub: true
          }
        }
      );
    }


    const map =
      section.querySelector(
        ".map-frame"
      );

    if (map) {

      window.gsap.fromTo(
        map,
        {
          clipPath:
            "inset(0 8% 0 8%)"
        },
        {
          clipPath:
            "inset(0 0% 0 0%)",

          ease: "none",

          scrollTrigger: {
            id:
              `story-${index}-map-reveal`,

            trigger:
              section,

            start: "top 72%",

            end: "top 35%",

            scrub: true
          }
        }
      );
    }
  }


  /* =======================================================
     INIT STORY ANIMATIONS
     ======================================================= */

  function initStoryAnimations() {

    killStoryAnimations();


    if (!gsapAvailable()) {

      sections.forEach(
        (section) => {

          section
            .querySelectorAll(
              [
                ".story-title",
                ".narrative-copy p",
                ".understand-lead",
                ".split-lead p",
                ".detail-lead p",
                ".return-copy > p",
                ".return-list span",
                ".connect-words span",
                ".today-lead",
                ".objective-lead",
                ".from-here-lead",
                ".contact-lead",
                ".contact-link",
                ".person-frame",
                ".map-frame"
              ].join(",")
            )
            .forEach(
              (element) => {

                element.style.opacity =
                  "1";

                element.style.transform =
                  "none";
              }
            );
        }
      );

      return;
    }


    window.gsap.registerPlugin(
      window.ScrollTrigger
    );


    sections.forEach(
      (section, index) => {

        initTitleScroll(
          section,
          index
        );

        initContentAnimation(
          section,
          index
        );

        initSpecialMotion(
          section,
          index
        );
      }
    );


    window.ScrollTrigger.refresh();
  }


  /* =======================================================
     MOTION PREFERENCE
     ======================================================= */

  function handleMotionPreferenceChange() {

    initStoryAnimations();

    if (
      window.ScrollTrigger
    ) {

      window.ScrollTrigger.refresh();
    }
  }


  if (
    typeof reduceMotionQuery
      .addEventListener ===
    "function"
  ) {

    reduceMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );

  } else if (
    typeof reduceMotionQuery
      .addListener ===
    "function"
  ) {

    reduceMotionQuery.addListener(
      handleMotionPreferenceChange
    );
  }


  /* =======================================================
     HASH NAVIGATION
     ======================================================= */

  function handleInitialHash() {

    const hash =
      window.location.hash;

    if (!hash) return;


    let id = "";

    try {

      id = decodeURIComponent(
        hash.slice(1)
      );

    } catch {
      id =
        hash.slice(1);
    }


    const target =
      doc.getElementById(id);

    if (!target) {
      return;
    }


    window.setTimeout(
      () => {

        const top =
          window.scrollY +
          target.getBoundingClientRect()
            .top -
          CONFIG.scrollOffset;


        window.scrollTo({
          top,
          behavior:
            reduceMotionQuery.matches
              ? "auto"
              : "smooth"
        });

      },
      350
    );
  }


  /* =======================================================
     MENU HASH MAPPING
     ======================================================= */

  /*
   * The editorial menu intentionally has a smaller
   * vocabulary than the internal narrative chapters.
   *
   * These mappings allow the visible menu to point to
   * the relevant part of the story without introducing
   * extra visible numbering.
   */

  const menuMapping = {
    "chi-sono": "eccomi",
    "sport": "movimento",
    "scienze-motorie": "capire",
    "educazione": "trasmettere",
    "management": "costruire",
    "digitale": "ritorna",
    "territorio": "qui",
    "contatti": "scrivimi"
  };


  function initMenuMapping() {

    if (!menu) return;


    const links =
      menu.querySelectorAll(
        "[data-menu-section]"
      );


    links.forEach(
      (link) => {

        const key =
          link.dataset.menuSection;

        const targetId =
          menuMapping[key];


        if (!targetId) {
          return;
        }


        link.setAttribute(
          "href",
          `#${targetId}`
        );


        link.addEventListener(
          "click",
          (event) => {

            const target =
              doc.getElementById(
                targetId
              );

            if (!target) {
              return;
            }


            event.preventDefault();

            updateMenuState(false);


            window.setTimeout(
              () => {

                scrollToSection(
                  sections.indexOf(
                    target
                  )
                );

              },
              180
            );
          }
        );
      }
    );
  }


  /* =======================================================
     VISIBILITY / BFCACHE
     ======================================================= */

  doc.addEventListener(
    "visibilitychange",
    () => {

      if (doc.hidden) {

        hideStandby();

      } else {

        resetStandbyTimer();

        if (
          window.ScrollTrigger
        ) {

          window.ScrollTrigger.refresh();
        }
      }
    }
  );


  window.addEventListener(
    "pageshow",
    () => {

      resetStandbyTimer();

      if (
        window.ScrollTrigger
      ) {

        window.ScrollTrigger.refresh();
      }

      requestSectionUpdate();
    }
  );


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function init() {

    setMenuTabState(true);

    updateMenuState(false);

    updateSectionNavigation(0);

    initMenuMapping();

    initLoader();

    initStoryAnimations();

    handleInitialHash();

    window.setTimeout(
      () => {

        updateSectionNavigation();

        if (
          window.ScrollTrigger
        ) {

          window.ScrollTrigger.refresh();
        }

      },
      120
    );

    resetStandbyTimer();
  }


  if (
    doc.readyState ===
    "loading"
  ) {

    doc.addEventListener(
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
