(() => {
  "use strict";

  /*
   * ========================================================
   * CESARE PARATORE
   * Navigation / loader / narrative progression
   * V2
   * ========================================================
   */

  const html = document.documentElement;
  const body = document.body;

  html.classList.add("js");


  /* ========================================================
     DOM
     ======================================================== */

  const loader =
    document.getElementById("site-loader");

  const header =
    document.getElementById("site-header");

  const menuToggle =
    document.getElementById("menu-toggle");

  const menu =
    document.getElementById("site-menu");

  const menuLinks =
    Array.from(
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

  const main =
    document.getElementById("main-content");

  const footer =
    document.querySelector(".site-footer");

  const sections =
    Array.from(
      document.querySelectorAll(".story-section")
    );


  /* ========================================================
     BASIC SAFETY
     ======================================================== */

  if (
    !header ||
    !menuToggle ||
    !menu ||
    !activeChapter ||
    !previousButton ||
    !nextButton ||
    !nextArrowSymbol ||
    !nextArrowLabel ||
    !wowProgress ||
    !wowDot ||
    !sections.length
  ) {
    return;
  }


  /* ========================================================
     STATE
     ======================================================== */

  let activeIndex = 0;
  let menuOpen = false;

  let scrollFrame = null;

  let loaderMinTimer = null;
  let loaderFallbackTimer = null;
  let loaderExitTimer = null;

  let loaderStartedAt = 0;
  let loaderFinished = false;

  let lastFocusedElement = null;

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  /*
   * Cache dell'ultimo stato applicato.
   *
   * Evita di riscrivere continuamente le stesse
   * custom properties durante lo scroll.
   */
  const narrativeCache =
    sections.map(() => ({
      titleAlpha: null,
      titleY: null,
      contentAlpha: null,
      contentY: null
    }));


  /* ========================================================
     HELPERS
     ======================================================== */

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


  const smoothStep = (value) => {
    const t =
      clamp(value, 0, 1);

    return t * t * (3 - 2 * t);
  };


  const getHeaderHeight = () => {
    return header.getBoundingClientRect().height;
  };


  const getSectionIndex = (section) => {
    return sections.indexOf(section);
  };


  const scrollToSection = (
    section,
    behavior = "smooth"
  ) => {

    if (!section) {
      return;
    }

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


  const isEditableTarget = (target) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        "input, textarea, select, [contenteditable='true']"
      )
    );
  };


  const getFocusableMenuElements = () => {
    return Array.from(
      menu.querySelectorAll(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => {
      return (
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true"
      );
    });
  };


  const setPageInert = (locked) => {
    [main, footer].forEach((element) => {
      if (!element) {
        return;
      }

      if (locked) {
        element.setAttribute("inert", "");
      } else {
        element.removeAttribute("inert");
      }
    });
  };


  /* ========================================================
     LOADER
     ======================================================== */

  const finishLoader = () => {

    if (!loader || loaderFinished) {
      return;
    }

    loaderFinished = true;

    if (loaderMinTimer !== null) {
      window.clearTimeout(
        loaderMinTimer
      );

      loaderMinTimer = null;
    }

    if (loaderFallbackTimer !== null) {
      window.clearTimeout(
        loaderFallbackTimer
      );

      loaderFallbackTimer = null;
    }

    loader.classList.add(
      "is-exiting"
    );

    const exitDuration =
      reducedMotion.matches
        ? 20
        : 1150;

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

        loaderExitTimer = null;

      }, exitDuration);
  };


  const tryFinishLoader = () => {

    if (!loader || loaderFinished) {
      return;
    }

    const minimumDuration =
      reducedMotion.matches
        ? 0
        : 900;

    const elapsed =
      performance.now() -
      loaderStartedAt;

    const remaining =
      Math.max(
        0,
        minimumDuration - elapsed
      );

    if (remaining === 0) {
      finishLoader();
      return;
    }

    loaderMinTimer =
      window.setTimeout(
        finishLoader,
        remaining
      );
  };


  const startLoader = () => {

    if (!loader) {
      return;
    }

    loaderStartedAt =
      performance.now();

    loaderFinished = false;

    loader.classList.add(
      "is-active"
    );

    /*
     * Se la pagina è già caricata, non aspettiamo
     * inutilmente l'evento load.
     */
    if (
      document.readyState ===
      "complete"
    ) {
      tryFinishLoader();
    } else {

      window.addEventListener(
        "load",
        tryFinishLoader,
        {
          once: true
        }
      );
    }

    /*
     * Fallback di sicurezza:
     * il loader non può rimanere bloccato
     * indefinitamente in caso di risorsa lenta.
     */
    loaderFallbackTimer =
      window.setTimeout(
        finishLoader,
        reducedMotion.matches
          ? 1000
          : 4500
      );
  };


  /* ========================================================
     MENU
     * ======================================================== */

  const setMenuState = (open) => {

    const nextState =
      Boolean(open);

    if (
      nextState === menuOpen &&
      menu.classList.contains(
        "is-open"
      )
    ) {
      return;
    }

    if (nextState) {

      lastFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : menuToggle;

      menuOpen = true;

      header.classList.add(
        "menu-open"
      );

      menu.classList.add(
        "is-open"
      );

      menu.setAttribute(
        "aria-hidden",
        "false"
      );

      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Chiudi menu"
      );

      body.classList.add(
        "menu-is-open"
      );

      setPageInert(true);

      window.requestAnimationFrame(() => {

        const focusable =
          getFocusableMenuElements();

        if (focusable.length) {
          focusable[0].focus({
            preventScroll: true
          });
        }

      });

      return;
    }


    /*
     * CHIUSURA
     */

    menuOpen = false;

    header.classList.remove(
      "menu-open"
    );

    menu.classList.remove(
      "is-open"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Apri menu"
    );

    body.classList.remove(
      "menu-is-open"
    );

    setPageInert(false);

    /*
     * Restituisce il focus a chi aveva aperto il menu.
     */
    const focusTarget =
      lastFocusedElement &&
      document.contains(lastFocusedElement) &&
      !lastFocusedElement.hasAttribute("disabled")
        ? lastFocusedElement
        : menuToggle;

    window.requestAnimationFrame(() => {
      focusTarget.focus({
        preventScroll: true
      });
    });

    lastFocusedElement = null;
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

        if (
          !href ||
          !href.startsWith("#")
        ) {
          return;
        }

        const target =
          document.getElementById(
            href.slice(1)
          );

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

    if (!sections.length) {
      return;
    }

    const safeIndex =
      clamp(
        Number.isFinite(Number(index))
          ? Number(index)
          : 0,
        0,
        sections.length - 1
      );

    activeIndex =
      safeIndex;

    const section =
      sections[safeIndex];

    if (!section) {
      return;
    }

    const chapter =
      section.dataset.chapter || "";

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
      safeIndex ===
      sections.length - 1;

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
        ? (
            safeIndex /
            (sections.length - 1)
          ) * 100
        : 0;

    const percentageValue =
      `${percentage}%`;

    if (
      wowProgress.style.width !==
      percentageValue
    ) {
      wowProgress.style.width =
        percentageValue;
    }

    if (
      wowDot.style.left !==
      percentageValue
    ) {
      wowDot.style.left =
        percentageValue;
    }


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
     NARRATIVE STYLE CACHE
     ======================================================== */

  const updateSectionVariable = (
    section,
    index,
    key,
    value
  ) => {

    if (
      narrativeCache[index][key] ===
      value
    ) {
      return;
    }

    narrativeCache[index][key] =
      value;

    section.style.setProperty(
      `--${key.replace(
        /[A-Z]/g,
        (match) =>
          `-${match.toLowerCase()}`
      )}`,
      value
    );
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
     * Anchor narrativo.
     *
     * Rimane sotto l'header e impedisce
     * alla sezione successiva di prendere
     * il controllo troppo presto.
     */
    const anchor =
      headerHeight +
      (
        viewportHeight -
        headerHeight
      ) * .38;

    let bestIndex =
      activeIndex;

    let bestDistance =
      Infinity;


    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const height =
          Math.max(
            rect.height,
            1
          );


        /* --------------------------------
           SECTION PROGRESS
           -------------------------------- */

        const raw =
          (
            anchor -
            rect.top
          ) / height;

        const progress =
          clamp(
            raw,
            0,
            1
          );


        /* --------------------------------
           TITLE
           -------------------------------- */

        const titleFade =
          smoothStep(
            (progress - .05) / .42
          );

        const titleAlpha =
          (
            1 -
            titleFade
          ).toFixed(3);

        const titleY =
          `${(
            -22 *
            titleFade
          ).toFixed(1)}px`;


        /* --------------------------------
           CONTENT
           -------------------------------- */

        const contentReveal =
          smoothStep(
            (progress - .14) / .42
          );

        const contentAlpha =
          (
            .18 +
            (.82 * contentReveal)
          ).toFixed(3);

        const contentY =
          `${(
            32 *
            (1 - contentReveal)
          ).toFixed(1)}px`;


        /* --------------------------------
           WRITE ONLY WHEN CHANGED
           -------------------------------- */

        updateSectionVariable(
          section,
          index,
          "titleAlpha",
          titleAlpha
        );

        updateSectionVariable(
          section,
          index,
          "titleY",
          titleY
        );

        updateSectionVariable(
          section,
          index,
          "contentAlpha",
          contentAlpha
        );

        updateSectionVariable(
          section,
          index,
          "contentY",
          contentY
        );


        /* --------------------------------
           ACTIVE CHAPTER
           -------------------------------- */

        const narrativePoint =
          rect.top +
          Math.min(
            height * .35,
            viewportHeight * .42
          );

        const distance =
          Math.abs(
            narrativePoint -
            anchor
          );

        const visible =
          rect.bottom > headerHeight &&
          rect.top < viewportHeight;

        if (
          visible &&
          distance < bestDistance
        ) {
          bestDistance =
            distance;

          bestIndex =
            index;
        }
      }
    );


    if (
      bestIndex !==
      activeIndex
    ) {
      setActiveSection(
        bestIndex,
        false
      );
    }
  };


  const requestNarrativeUpdate = () => {

    if (
      scrollFrame !== null
    ) {
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

      const target =
        sections[targetIndex];

      if (!target) {
        return;
      }

      setActiveSection(
        targetIndex,
        true
      );

      scrollToSection(
        target,
        reducedMotion.matches
          ? "auto"
          : "smooth"
      );
    }
  );


  /* ========================================================
     NEXT / RETURN
     ======================================================== */

  nextButton.addEventListener(
    "click",
    () => {

      const last =
        activeIndex ===
        sections.length - 1;


      if (last) {

        const firstSection =
          sections[0];

        setActiveSection(
          0,
          true
        );

        scrollToSection(
          firstSection,
          reducedMotion.matches
            ? "auto"
            : "smooth"
        );

        return;
      }


      const targetIndex =
        activeIndex + 1;

      const target =
        sections[targetIndex];

      if (!target) {
        return;
      }

      setActiveSection(
        targetIndex,
        true
      );

      scrollToSection(
        target,
        reducedMotion.matches
          ? "auto"
          : "smooth"
      );
    }
  );


  /* ========================================================
     BRAND
     ======================================================== */

  if (brand) {

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
  }


  /* ========================================================
     KEYBOARD
     ======================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      /* --------------------------------
         ESCAPE
         -------------------------------- */

      if (
        event.key === "Escape" &&
        menuOpen
      ) {
        event.preventDefault();

        setMenuState(false);

        return;
      }


      /* --------------------------------
         FOCUS TRAP
         -------------------------------- */

      if (
        event.key === "Tab" &&
        menuOpen
      ) {

        const focusable =
          getFocusableMenuElements();

        if (!focusable.length) {
          event.preventDefault();
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

          return;
        }

        if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();

          first.focus();

          return;
        }
      }


      /* --------------------------------
         EDITABLE ELEMENTS
         -------------------------------- */

      if (
        isEditableTarget(
          event.target
        )
      ) {
        return;
      }


      /* --------------------------------
         ARROW NAVIGATION
         -------------------------------- */

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

    let id = "";

    try {
      id =
        decodeURIComponent(
          hash.slice(1)
        );
    } catch {
      return;
    }

    if (!id) {
      return;
    }

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

    /*
     * Aspettiamo il primo layout completo.
     */
    window.setTimeout(
      () => {

        scrollToSection(
          target,
          reducedMotion.matches
            ? "auto"
            : "smooth"
        );

      },
      80
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

      const initialState =
        index === 0
          ? {
              titleAlpha: "1",
              titleY: "0px",
              contentAlpha: "1",
              contentY: "0px"
            }
          : {
              titleAlpha: "0.15",
              titleY: "-10px",
              contentAlpha: "0.18",
              contentY: "32px"
            };


      narrativeCache[index] = {
        ...initialState
      };


      section.style.setProperty(
        "--title-alpha",
        initialState.titleAlpha
      );

      section.style.setProperty(
        "--title-y",
        initialState.titleY
      );

      section.style.setProperty(
        "--content-alpha",
        initialState.contentAlpha
      );

      section.style.setProperty(
        "--content-y",
        initialState.contentY
      );
    }
  );


  setActiveSection(
    0,
    false
  );


  requestNarrativeUpdate();


  /* ========================================================
     LOADER START
     ======================================================== */

  startLoader();


  /* ========================================================
     RESTORE HASH
     ======================================================== */

  if (window.location.hash) {
    handleHash();
  }


  /* ========================================================
     CLEANUP
     ======================================================== */

  window.addEventListener(
    "pagehide",
    () => {

      if (
        loaderMinTimer !== null
      ) {
        window.clearTimeout(
          loaderMinTimer
        );
      }

      if (
        loaderFallbackTimer !== null
      ) {
        window.clearTimeout(
          loaderFallbackTimer
        );
      }

      if (
        loaderExitTimer !== null
      ) {
        window.clearTimeout(
          loaderExitTimer
        );
      }

      if (
        scrollFrame !== null
      ) {
        window.cancelAnimationFrame(
          scrollFrame
        );

        scrollFrame = null;
      }
    }
  );

})();
