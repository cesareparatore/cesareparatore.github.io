(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE
     Navigation / loader / progressive narrative
     ========================================================= */

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  html.classList.add("js");


  /* =========================================================
     ELEMENTS
     ========================================================= */

  const loader = doc.getElementById("site-loader");

  const header = doc.getElementById("site-header");

  const menuToggle = doc.getElementById("menu-toggle");
  const menu = doc.getElementById("site-menu");
  const menuLinks = Array.from(
    doc.querySelectorAll(".menu-link")
  );

  const activeChapter = doc.getElementById("active-chapter");

  const previousButton = doc.getElementById("prev-section");
  const nextButton = doc.getElementById("next-section");

  const nextArrowSymbol = doc.getElementById("next-arrow-symbol");
  const nextArrowLabel = doc.getElementById("next-arrow-label");

  const wowProgress = doc.getElementById("wow-progress");
  const wowDot = doc.getElementById("wow-dot-active");

  const brand = doc.querySelector(".brand");

  const sections = Array.from(
    doc.querySelectorAll(".story-section")
  );


  /* =========================================================
     STATE
     ========================================================= */

  let activeIndex = 0;
  let menuOpen = false;
  let ticking = false;
  let loaderTimer = null;
  let loaderExitTimer = null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  /* =========================================================
     HELPERS
     ========================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const smoothstep = (edge0, edge1, value) => {
    const t = clamp(
      (value - edge0) / (edge1 - edge0),
      0,
      1
    );

    return t * t * (3 - 2 * t);
  };


  const getHeaderHeight = () => {
    return header
      ? header.getBoundingClientRect().height
      : 134;
  };


  const scrollToSection = (section, behavior = "smooth") => {
    if (!section) return;

    const top =
      section.getBoundingClientRect().top +
      window.scrollY -
      getHeaderHeight();

    window.scrollTo({
      top: Math.max(0, top),
      behavior
    });
  };


  /* =========================================================
     LOADER
     ========================================================= */

  const startLoader = () => {
    if (!loader) return;

    loader.classList.add("is-active");

    const totalDuration = reducedMotion.matches
      ? 450
      : 2400;

    loaderTimer = window.setTimeout(() => {
      loader.classList.add("is-exiting");

      loaderExitTimer = window.setTimeout(() => {
        loader.classList.remove("is-active");
        loader.classList.remove("is-exiting");
        loader.setAttribute("aria-hidden", "true");
      }, reducedMotion.matches ? 50 : 1050);

    }, totalDuration);
  };


  /* =========================================================
     MENU
     ========================================================= */

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

    body.classList.toggle(
      "menu-is-open",
      menuOpen
    );

    if (menuOpen) {
      menuToggle.setAttribute(
        "aria-label",
        "Chiudi menu"
      );

      window.setTimeout(() => {
        const firstLink = menuLinks[0];

        if (firstLink) {
          firstLink.focus({
            preventScroll: true
          });
        }
      }, 80);

    } else {
      menuToggle.setAttribute(
        "aria-label",
        "Apri menu"
      );
    }
  };


  menuToggle.addEventListener("click", () => {
    setMenuState(!menuOpen);
  });


  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });


  /* =========================================================
     CHAPTER STATE
     ========================================================= */

  const updateChapterUI = (index) => {
    const safeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    activeIndex = safeIndex;

    const section = sections[safeIndex];

    if (!section) return;

    const chapter =
      section.dataset.chapter ||
      section.querySelector(".story-title")?.textContent?.trim() ||
      "";

    activeChapter.textContent = chapter;


    /* Previous */

    const isFirst = safeIndex === 0;

    previousButton.disabled = isFirst;

    previousButton.setAttribute(
      "aria-label",
      isFirst
        ? "Sei all'inizio"
        : `Vai alla sezione precedente: ${
            sections[safeIndex - 1]?.dataset.chapter || ""
          }`
    );


    /* Next / return */

    const isLast =
      safeIndex === sections.length - 1;

    nextButton.classList.toggle(
      "is-return",
      isLast
    );

    nextArrowSymbol.textContent =
      isLast ? "↶" : "→";

    nextArrowLabel.textContent =
      isLast ? "INIZIO" : "AVANTI";

    nextButton.setAttribute(
      "aria-label",
      isLast
        ? "Torna all'inizio"
        : `Vai alla sezione successiva: ${
            sections[safeIndex + 1]?.dataset.chapter || ""
          }`
    );


    /* Progress */

    const progress =
      sections.length > 1
        ? (safeIndex / (sections.length - 1)) * 100
        : 0;

    wowProgress.style.width =
      `${progress}%`;

    wowDot.style.left =
      `${progress}%`;
  };


  /* =========================================================
     DETERMINE ACTIVE SECTION
     ========================================================= */

  const updateNarrativeProgress = () => {
    if (!sections.length) return;

    const viewportHeight =
      window.innerHeight;

    const headerHeight =
      getHeaderHeight();

    const viewportAnchor =
      headerHeight +
      (viewportHeight - headerHeight) * 0.34;

    let closestIndex = 0;
    let closestDistance = Infinity;

    sections.forEach((section, index) => {

      const rect =
        section.getBoundingClientRect();

      const sectionTop = rect.top;
      const sectionHeight =
        Math.max(rect.height, 1);

      /*
       * Progress inside the current section.
       * This is continuous and reversible.
       */
      const rawProgress =
        (viewportAnchor - sectionTop) /
        sectionHeight;

      const progress = clamp(
        rawProgress,
        0,
        1
      );

      /*
       * Title:
       * strong at entrance,
       * then gradually gives way to content.
       */
      const titleFade =
        smoothstep(
          0.12,
          0.52,
          progress
        );

      const titleAlpha =
        1 - titleFade;

      /*
       * Content:
       * arrives after the title.
       */
      const contentAlpha =
        0.15 +
        0.85 *
        smoothstep(
          0.18,
          0.55,
          progress
        );

      const contentY =
        34 *
        (1 -
          smoothstep(
            0.18,
            0.58,
            progress
          )
        );

      section.style.setProperty(
        "--title-alpha",
        titleAlpha.toFixed(3)
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
       * Active section is selected by the point closest
       * to the visual narrative anchor.
       */
      const sectionCenter =
        sectionTop +
        sectionHeight * 0.35;

      const distance =
        Math.abs(
          sectionCenter -
          viewportAnchor
        );

      if (
        rect.bottom > headerHeight &&
        rect.top < viewportHeight &&
        distance < closestDistance
      ) {
        closestDistance = distance;
        closestIndex = index;
      }
    });


    if (closestIndex !== activeIndex) {
      updateChapterUI(closestIndex);
    }
  };


  const requestNarrativeUpdate = () => {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updateNarrativeProgress();
      ticking = false;
    });
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


  /* =========================================================
     WOW BAR NAVIGATION
     ========================================================= */

  previousButton.addEventListener(
    "click",
    () => {

      if (activeIndex <= 0) {
        return;
      }

      const targetIndex =
        activeIndex - 1;

      updateChapterUI(targetIndex);

      scrollToSection(
        sections[targetIndex]
      );
    }
  );


  nextButton.addEventListener(
    "click",
    () => {

      const isLast =
        activeIndex === sections.length - 1;

      if (isLast) {

        updateChapterUI(0);

        scrollToSection(
          sections[0]
        );

        return;
      }

      const targetIndex =
        activeIndex + 1;

      updateChapterUI(targetIndex);

      scrollToSection(
        sections[targetIndex]
      );
    }
  );


  /* =========================================================
     BRAND → START
     ========================================================= */

  brand.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      if (menuOpen) {
        setMenuState(false);
      }

      updateChapterUI(0);

      scrollToSection(
        sections[0]
      );
    }
  );


  /* =========================================================
     KEYBOARD
     ========================================================= */

  doc.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {
        if (menuOpen) {
          setMenuState(false);
          menuToggle.focus();
        }

        return;
      }


      /*
       * Do not hijack keyboard controls while the user
       * is typing inside an input or textarea.
       */
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }


      if (
        event.key === "ArrowLeft" &&
        !menuOpen
      ) {
        event.preventDefault();

        if (activeIndex > 0) {
          previousButton.click();
        }

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


  /* =========================================================
     HASH NAVIGATION
     ========================================================= */

  const scrollToHash = () => {

    const hash =
      window.location.hash;

    if (!hash) return;

    const id =
      decodeURIComponent(
        hash.slice(1)
      );

    const target =
      doc.getElementById(id);

    if (!target) return;

    const index =
      sections.indexOf(target);

    if (index >= 0) {
      updateChapterUI(index);
    }

    window.setTimeout(() => {
      scrollToSection(
        target,
        reducedMotion.matches
          ? "auto"
          : "smooth"
      );
    }, 40);
  };


  window.addEventListener(
    "hashchange",
    scrollToHash
  );


  /* =========================================================
     INITIALIZE
     ========================================================= */

  sections.forEach((section) => {
    section.style.setProperty(
      "--title-alpha",
      "0.15"
    );

    section.style.setProperty(
      "--content-alpha",
      "0.18"
    );

    section.style.setProperty(
      "--content-y",
      "30px"
    );
  });


  updateChapterUI(0);

  requestNarrativeUpdate();

  /*
   * Start loader after the page structure exists.
   * It is progressive enhancement only:
   * if JS fails, the loader remains display:none.
   */
  startLoader();

  /*
   * Restore a requested hash after initialization.
   */
  if (window.location.hash) {
    scrollToHash();
  }


  /* =========================================================
     CLEANUP
     ========================================================= */

  window.addEventListener(
    "pagehide",
    () => {

      if (loaderTimer) {
        window.clearTimeout(loaderTimer);
      }

      if (loaderExitTimer) {
        window.clearTimeout(loaderExitTimer);
      }
    }
  );

})();
