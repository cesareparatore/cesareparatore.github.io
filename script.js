(() => {
  "use strict";

  /*
   * ========================================================
   * CESARE PARATORE
   * Navigation / loader / narrative progression
   * ========================================================
   */

  const html = document.documentElement;
  const body = document.body;

  html.classList.add("js");


  /* ========================================================
     DOM
     ======================================================== */

  const loader = document.getElementById("site-loader");

  const header = document.getElementById("site-header");

  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("site-menu");
  const menuLinks = Array.from(
    document.querySelectorAll(".menu-link")
  );

  const activeChapter =
    document.getElementById("active-chapter");

  const previousButton =
    document.getElementById("prev-section");

  const nextButton =
    document.getElementById("next-section");

  const nextArrowSymbol =
    document.getElementById("next-arrow-symbol");

  const nextArrowLabel =
    document.getElementById("next-arrow-label");

  const wowProgress =
    document.getElementById("wow-progress");

  const wowDot =
    document.getElementById("wow-dot-active");

  const brand =
    document.querySelector(".brand");

  const sections =
    Array.from(
      document.querySelectorAll(".story-section")
    );


  /* ========================================================
     STATE
     ======================================================== */

  let activeIndex = 0;
  let menuOpen = false;

  let scrollFrame = null;

  let loaderStartTimer = null;
  let loaderExitTimer = null;

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  /* ========================================================
     HELPERS
     ======================================================== */

  const clamp = (value, min, max) => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  const smoothStep = (value) => {
    const t = clamp(value, 0, 1);

    return t * t * (3 - 2 * t);
  };


  const getHeaderHeight = () => {
    if (!header) {
      return 134;
    }

    return header.getBoundingClientRect().height;
  };


  const getSectionIndex = (section) => {
    return sections.indexOf(section);
  };


  const scrollToSection = (
    section,
    behavior = "smooth"
  ) => {
    if (!section) return;

    const headerHeight =
      getHeaderHeight();

    const rect =
      section.getBoundingClientRect();

    const targetTop =
      window.scrollY +
      rect.top -
      headerHeight;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior
    });
  };


  /* ========================================================
     LOADER
     ======================================================== */

  const startLoader = () => {
    if (!loader) return;

    loader.classList.add("is-active");

    const revealDuration =
      reducedMotion.matches
        ? 500
        : 2300;

    loaderStartTimer =
      window.setTimeout(() => {

        loader.classList.add(
          "is-exiting"
        );

        loaderExitTimer =
          window.setTimeout(() => {

            loader.classList.remove(
              "is-active"
            );

            loader.classList.remove(
              "is-exiting"
            );

            loader.setAttribute(
              "aria-hidden",
              "true"
            );

          }, reducedMotion.matches ? 20 : 1150);

      }, revealDuration);
  };


  /* ========================================================
     MENU
     ======================================================== */

  const setMenuState = (open) => {
    menuOpen = Boolean(open);

    header.classList.toggle(
      "menu-open",
      menuOpen
    );

    menu.classList.toggle(
      "is-open",
      menuOpen
    );

    menu.setAttribute(
      "aria-hidden",
      String(!menuOpen)
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

    body.classList.toggle(
      "menu-is-open",
      menuOpen
    );

    if (menuOpen) {

      window.setTimeout(() => {

        const firstLink =
          menuLinks[0];

        if (firstLink) {
          firstLink.focus({
            preventScroll: true
          });
        }

      }, 100);
    }
  };


  menuToggle.addEventListener(
    "click",
    () => {
      setMenuState(!menuOpen);
    }
  );


  menuLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const href =
          link.getAttribute("href");

        if (!href || href.charAt(0) !== "#") {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        const index =
          getSectionIndex(target);

        setMenuState(false);

        if (index >= 0) {
          setActiveSection(
            index,
            false
          );
        }

        scrollToSection(
          target,
          reducedMotion.matches
            ? "auto"
            : "smooth"
        );

        window.history.replaceState(
          null,
          "",
          href
        );
      }
    );

  });


  /* ========================================================
     ACTIVE SECTION UI
     ======================================================== */

  const setActiveSection = (
    index,
    updateHash = false
  ) => {

    const safeIndex =
      clamp(
        Number(index) || 0,
        0,
        sections.length - 1
      );

    activeIndex = safeIndex;

    const section =
      sections[safeIndex];

    if (!section) return;

    const chapter =
      section.dataset.chapter ||
      "";

    activeChapter.textContent =
      chapter;


    /* ------------------------------------
       PREVIOUS
       ------------------------------------ */

    const first =
      safeIndex === 0;

    previousButton.disabled =
      first;

    previousButton.setAttribute(
      "aria-label",
      first
        ? "Sei all'inizio"
        : `Vai alla sezione precedente: ${
            sections[safeIndex - 1]
              ?.dataset.chapter || ""
          }`
    );


    /* ------------------------------------
       NEXT / RETURN
       ------------------------------------ */

    const last =
      safeIndex === sections.length - 1;

    nextButton.classList.toggle(
      "is-return",
      last
    );

    if (last) {

      nextArrowSymbol.textContent =
        "↶";

      nextArrowLabel.textContent =
        "INIZIO";

      nextButton.setAttribute(
        "aria-label",
        "Torna all'inizio"
      );

    } else {

      nextArrowSymbol.textContent =
        "→";

      nextArrowLabel.textContent =
        "AVANTI";

      nextButton.setAttribute(
        "aria-label",
        `Vai alla sezione successiva: ${
          sections[safeIndex + 1]
            ?.dataset.chapter || ""
        }`
      );
    }


    /* ------------------------------------
       PROGRESS
       ------------------------------------ */

    const percentage =
      sections.length > 1
        ? safeIndex /
          (sections.length - 1) *
          100
        : 0;

    wowProgress.style.width =
      `${percentage}%`;

    wowDot.style.left =
      `${percentage}%`;


    /* ------------------------------------
       HASH
       ------------------------------------ */

    if (updateHash) {

      const id =
        section.id;

      if (id) {

        window.history.replaceState(
          null,
          "",
          `#${id}`
        );
      }
    }
  };


  /* ========================================================
     FIND ACTIVE SECTION
     ======================================================== */

  const updateNarrative = () => {

    scrollFrame = null;

    if (!sections.length) {
      return;
    }

    const viewportHeight =
      window.innerHeight;

    const headerHeight =
      getHeaderHeight();

    /*
     * The anchor is intentionally below the header.
     * This prevents the title of the next section from
     * taking control too early.
     */
    const anchor =
      headerHeight +
      (viewportHeight - headerHeight) * .38;

    let bestIndex = 0;
    let bestDistance = Infinity;


    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const height =
          Math.max(
            rect.height,
            1
          );

        /*
         * Progress through the section.
         */
        const raw =
          (anchor - rect.top) /
          height;

        const progress =
          clamp(raw, 0, 1);


        /*
         * TITLE
         *
         * At section entrance:
         * title is strong.
         *
         * While scrolling:
         * title fades away.
         */
        const titleFade =
          smoothStep(
            (progress - .05) / .42
          );

        const titleAlpha =
          1 - titleFade;

        const titleY =
          -22 * titleFade;


        /*
         * CONTENT
         *
         * Appears after the title,
         * then becomes fully readable.
         */
        const contentReveal =
          smoothStep(
            (progress - .14) / .42
          );

        const contentAlpha =
          .18 +
          (.82 * contentReveal);

        const contentY =
          32 * (1 - contentReveal);


        section.style.setProperty(
          "--title-alpha",
          titleAlpha.toFixed(3)
        );

        section.style.setProperty(
          "--title-y",
          `${titleY.toFixed(1)}px`
        );

        section.style.setProperty(
          "--content-alpha",
          contentAlpha.toFixed(3)
        );

        section.style.setProperty(
          "--content-y",
          `${contentY.toFixed(1)}px`
        );


        /*
         * Determine the chapter from the section
         * whose narrative anchor is closest to the
         * current viewport anchor.
         */
        const narrativePoint =
          rect.top +
          Math.min(
            height * .35,
            viewportHeight * .42
          );

        const distance =
          Math.abs(
            narrativePoint - anchor
          );

        const visible =
          rect.bottom > headerHeight &&
          rect.top < viewportHeight;

        if (
          visible &&
          distance < bestDistance
        ) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    );


    if (bestIndex !== activeIndex) {
      setActiveSection(
        bestIndex,
        false
      );
    }
  };


  const requestNarrativeUpdate = () => {

    if (scrollFrame !== null) {
      return;
    }

    scrollFrame =
      window.requestAnimationFrame(
        updateNarrative
      );
  };


  window.addEventListener(
    "scroll",
    requestNarrativeUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestNarrativeUpdate,
    {
      passive: true
    }
  );


  /* ========================================================
     PREVIOUS
     ======================================================== */

  previousButton.addEventListener(
    "click",
    () => {

      if (activeIndex <= 0) {
        return;
      }

      const targetIndex =
        activeIndex - 1;

      setActiveSection(
        targetIndex,
        true
      );

      scrollToSection(
        sections[targetIndex],
        reducedMotion.matches
          ? "auto"
          : "smooth"
      );
    }
  );


  /* ========================================================
     NEXT / RETURN TO START
     ======================================================== */

  nextButton.addEventListener(
    "click",
    () => {

      const last =
        activeIndex ===
        sections.length - 1;


      if (last) {

        setActiveSection(
          0,
          true
        );

        scrollToSection(
          sections[0],
          reducedMotion.matches
            ? "auto"
            : "smooth"
        );

        return;
      }


      const targetIndex =
        activeIndex + 1;

      setActiveSection(
        targetIndex,
        true
      );

      scrollToSection(
        sections[targetIndex],
        reducedMotion.matches
          ? "auto"
          : "smooth"
      );
    }
  );


  /* ========================================================
     BRAND
     ======================================================== */

  brand.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      setMenuState(false);

      setActiveSection(
        0,
        true
      );

      scrollToSection(
        sections[0],
        reducedMotion.matches
          ? "auto"
          : "smooth"
      );
    }
  );


  /* ========================================================
     KEYBOARD
     ======================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        if (menuOpen) {

          setMenuState(false);

          menuToggle.focus();
        }

        return;
      }


      const target =
        event.target;

      if (
        target instanceof
          HTMLInputElement ||
        target instanceof
          HTMLTextAreaElement ||
        target instanceof
          HTMLSelectElement
      ) {
        return;
      }


      if (
        event.key === "ArrowLeft" &&
        !menuOpen
      ) {

        event.preventDefault();

        previousButton.click();

        return;
      }


      if (
        event.key === "ArrowRight" &&
        !menuOpen
      ) {

        event.preventDefault();

        nextButton.click();

        return;
      }
    }
  );


  /* ========================================================
     HASH
     ======================================================== */

  const handleHash = () => {

    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const id =
      decodeURIComponent(
        hash.slice(1)
      );

    const target =
      document.getElementById(id);

    if (!target) {
      return;
    }

    const index =
      getSectionIndex(target);

    if (index < 0) {
      return;
    }

    setActiveSection(
      index,
      false
    );

    window.setTimeout(
      () => {

        scrollToSection(
          target,
          reducedMotion.matches
            ? "auto"
            : "smooth"
        );

      },
      60
    );
  };


  window.addEventListener(
    "hashchange",
    handleHash
  );


  /* ========================================================
     INITIAL STATE
     ======================================================== */

  sections.forEach(
    (section, index) => {

      if (index === 0) {

        section.style.setProperty(
          "--title-alpha",
          "1"
        );

        section.style.setProperty(
          "--title-y",
          "0px"
        );

        section.style.setProperty(
          "--content-alpha",
          "1"
        );

        section.style.setProperty(
          "--content-y",
          "0px"
        );

      } else {

        section.style.setProperty(
          "--title-alpha",
          "0.15"
        );

        section.style.setProperty(
          "--title-y",
          "-10px"
        );

        section.style.setProperty(
          "--content-alpha",
          "0.18"
        );

        section.style.setProperty(
          "--content-y",
          "32px"
        );
      }
    }
  );


  setActiveSection(
    0,
    false
  );


  requestNarrativeUpdate();


  /*
   * Loader is enhancement only.
   * If this script never runs, .site-loader remains
   * display:none and the website is immediately usable.
   */
  startLoader();


  /*
   * Restore URL hash after initialization.
   */
  if (window.location.hash) {
    handleHash();
  }


  /* ========================================================
     CLEANUP
     ======================================================== */

  window.addEventListener(
    "pagehide",
    () => {

      if (loaderStartTimer !== null) {
        window.clearTimeout(
          loaderStartTimer
        );
      }

      if (loaderExitTimer !== null) {
        window.clearTimeout(
          loaderExitTimer
        );
      }

      if (scrollFrame !== null) {
        window.cancelAnimationFrame(
          scrollFrame
        );
      }
    }
  );

})();
