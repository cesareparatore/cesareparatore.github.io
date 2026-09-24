(() => {
  "use strict";

  /*
   * ========================================================
   * CESARE PARATORE
   * Navigation / loader / narrative progression
   * V5
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

  const wowTrack =
    document.querySelector(".wow-track");

  const brand =
    document.querySelector(".brand");

  const footerMark =
    document.querySelector(".footer-mark");

  const main =
    document.getElementById("main-content");

  const footer =
    document.querySelector(".site-footer");

  const sections =
    Array.from(
      document.querySelectorAll(".story-section")
    );


  /* ========================================================
     CORE SAFETY
     ======================================================== */

  if (!sections.length) {
    return;
  }


  /* ========================================================
     STATE
     ======================================================== */

  let activeIndex = 0;
  let menuOpen = false;

  let scrollFrame = null;

  let loaderStartedAt = 0;
  let loaderFinished = false;

  let loaderMinTimer = null;
  let loaderFallbackTimer = null;
  let loaderExitTimer = null;

  let lastFocusedElement = null;

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  /* ========================================================
     NARRATIVE CACHE
     ======================================================== */

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
    const t = clamp(
      value,
      0,
      1
    );

    return t * t * (3 - 2 * t);
  };


  const getHeaderHeight = () => {
    if (!header) {
      return 0;
    }

    return header.getBoundingClientRect().height;
  };


  const getSectionIndex = (
    section
  ) => {
    return sections.indexOf(section);
  };


  const isElement = (
    target
  ) => {
    return target instanceof Element;
  };


  const isEditableTarget = (
    target
  ) => {
    if (!isElement(target)) {
      return false;
    }

    return Boolean(
      target.closest(
        "input, textarea, select, [contenteditable='true']"
      )
    );
  };


  const isInteractiveTarget = (
    target
  ) => {
    if (!isElement(target)) {
      return false;
    }

    return Boolean(
      target.closest(
        "a, button, input, textarea, select, summary, [role='button'], [contenteditable='true']"
      )
    );
  };


  const getFocusableMenuElements = () => {
    if (!menu) {
      return [];
    }

    return Array.from(
      menu.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(", ")
      )
    ).filter((element) => {
      return (
        !element.hasAttribute("disabled") &&
        element.getAttribute(
          "aria-hidden"
        ) !== "true"
      );
    });
  };


  const setInert = (
    element,
    locked
  ) => {
    if (!element) {
      return;
    }

    element.inert =
      Boolean(locked);
  };


  const setPageInert = (
    locked
  ) => {
    setInert(
      main,
      locked
    );

    setInert(
      footer,
      locked
    );
  };


  /* ========================================================
     MENU
     ======================================================== */

  const initializeMenu = () => {
    if (
      !menu ||
      !menuToggle
    ) {
      return;
    }

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-controls",
      menu.id || "site-menu"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Apri menu"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    setInert(
      menu,
      true
    );
  };


  const updateMenuCurrentState = () => {
    if (!menuLinks.length) {
      return;
    }

    const currentId =
      sections[activeIndex]?.id || "";

    menuLinks.forEach(
      (link) => {
        const href =
          link.getAttribute(
            "href"
          ) || "";

        const current =
          href === `#${currentId}`;

        if (current) {
          link.setAttribute(
            "aria-current",
            "location"
          );
        } else {
          link.removeAttribute(
            "aria-current"
          );
        }
      }
    );
  };


  const closeMenu = () => {
    if (
      !menu ||
      !menuToggle
    ) {
      return;
    }

    if (!menuOpen) {
      return;
    }

    menuOpen = false;

    menu.classList.remove(
      "is-open"
    );

    if (header) {
      header.classList.remove(
        "menu-open"
      );
    }

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    setInert(
      menu,
      true
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

    const focusTarget =
      lastFocusedElement &&
      document.contains(
        lastFocusedElement
      ) &&
      !lastFocusedElement.hasAttribute(
        "disabled"
      )
        ? lastFocusedElement
        : menuToggle;

    lastFocusedElement = null;

    requestAnimationFrame(
      () => {
        focusTarget.focus({
          preventScroll: true
        });
      }
    );
  };


  const openMenu = () => {
    if (
      !menu ||
      !menuToggle
    ) {
      return;
    }

    if (menuOpen) {
      return;
    }

    lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuToggle;

    menuOpen = true;

    if (header) {
      header.classList.add(
        "menu-open"
      );
    }

    menu.classList.add(
      "is-open"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    setInert(
      menu,
      false
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

    requestAnimationFrame(
      () => {
        const focusable =
          getFocusableMenuElements();

        if (focusable.length) {
          focusable[0].focus({
            preventScroll: true
          });
        }
      }
    );
  };


  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };


  initializeMenu();


  if (
    menuToggle &&
    menu
  ) {
    menuToggle.addEventListener(
      "click",
      toggleMenu
    );
  }


  /* ========================================================
     LOADER
     ======================================================== */

  const finishLoader = () => {
    if (
      !loader ||
      loaderFinished
    ) {
      return;
    }

    loaderFinished = true;

    if (
      loaderMinTimer !== null
    ) {
      clearTimeout(
        loaderMinTimer
      );

      loaderMinTimer = null;
    }

    if (
      loaderFallbackTimer !== null
    ) {
      clearTimeout(
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
      setTimeout(
        () => {
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
        },
        exitDuration
      );
  };


  const tryFinishLoader = () => {
    if (
      !loader ||
      loaderFinished
    ) {
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
        minimumDuration -
        elapsed
      );

    if (
      remaining === 0
    ) {
      finishLoader();
      return;
    }

    if (
      loaderMinTimer !== null
    ) {
      clearTimeout(
        loaderMinTimer
      );
    }

    loaderMinTimer =
      setTimeout(
        finishLoader,
        remaining
      );
  };


  const startLoader = () => {
    if (!loader) {
      return;
    }

    if (
      loader.classList.contains(
        "is-active"
      )
    ) {
      return;
    }

    loaderStartedAt =
      performance.now();

    loaderFinished = false;

    loader.classList.add(
      "is-active"
    );

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

    loaderFallbackTimer =
      setTimeout(
        finishLoader,
        reducedMotion.matches
          ? 1000
          : 4500
      );
  };


  /* ========================================================
     ACTIVE SECTION
     ======================================================== */

  const setActiveSection = (
    index,
    updateHash = false
  ) => {

    const safeIndex =
      clamp(
        Number.isFinite(
          Number(index)
        )
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

    sections.forEach(
      (
        currentSection,
        currentIndex
      ) => {
        currentSection.classList.toggle(
          "is-active",
          currentIndex ===
            safeIndex
        );
      }
    );

    const chapter =
      section.dataset.chapter ||
      "";

    if (activeChapter) {
      activeChapter.textContent =
        chapter;
    }


    /* PREVIOUS */

    if (previousButton) {
      const first =
        safeIndex === 0;

      previousButton.disabled =
        first;

      previousButton.setAttribute(
        "aria-label",
        first
          ? "Sei all'inizio"
          : `Vai alla sezione precedente: ${
              sections[
                safeIndex - 1
              ]?.dataset.chapter || ""
            }`
      );
    }


    /* NEXT */

    if (nextButton) {
      const last =
        safeIndex ===
        sections.length - 1;

      nextButton.classList.toggle(
        "is-return",
        last
      );

      if (nextArrowSymbol) {
        nextArrowSymbol.textContent =
          last
            ? "↶"
            : "→";
      }

      if (nextArrowLabel) {
        nextArrowLabel.textContent =
          last
            ? "INIZIO"
            : "AVANTI";
      }

      nextButton.setAttribute(
        "aria-label",
        last
          ? "Torna all'inizio"
          : `Vai alla sezione successiva: ${
              sections[
                safeIndex + 1
              ]?.dataset.chapter || ""
            }`
      );
    }


    /* PROGRESS */

    const percentage =
      sections.length > 1
        ? (
            safeIndex /
            (sections.length - 1)
          ) * 100
        : 0;

    if (wowProgress) {
      wowProgress.style.width =
        `${percentage}%`;
    }

    if (wowDot) {
      wowDot.style.left =
        `${percentage}%`;
    }

    if (wowTrack) {
      wowTrack.setAttribute(
        "aria-valuenow",
        String(
          safeIndex + 1
        )
      );

      wowTrack.setAttribute(
        "aria-valuetext",
        `Sezione ${
          safeIndex + 1
        } di ${
          sections.length
        }: ${chapter}`
      );
    }


    /* MENU */

    updateMenuCurrentState();


    /* HASH */

    if (
      updateHash &&
      section.id
    ) {
      const newHash =
        `#${section.id}`;

      if (
        window.location.hash !==
        newHash
      ) {
        window.history.replaceState(
          null,
          "",
          newHash
        );
      }
    }
  };


  /* ========================================================
     SCROLL
     ======================================================== */

  const getScrollTarget = (
    section
  ) => {
    if (!section) {
      return 0;
    }

    const rect =
      section.getBoundingClientRect();

    return Math.max(
      0,
      window.scrollY +
        rect.top -
        getHeaderHeight()
    );
  };


  const navigateToSection = (
    index,
    updateHash = true
  ) => {

    const safeIndex =
      clamp(
        Number.isFinite(
          Number(index)
        )
          ? Number(index)
          : 0,
        0,
        sections.length - 1
      );

    const target =
      sections[safeIndex];

    if (!target) {
      return;
    }

    setActiveSection(
      safeIndex,
      updateHash
    );

    const targetTop =
      getScrollTarget(
        target
      );

    window.scrollTo({
      top: targetTop,
      behavior:
        reducedMotion.matches
          ? "auto"
          : "smooth"
    });

    requestNarrativeUpdate();
  };


  /* ========================================================
     MENU LINKS
     ======================================================== */

  menuLinks.forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute(
              "href"
            );

          if (
            !href ||
            !href.startsWith("#")
          ) {
            return;
          }

          const id =
            href.slice(1);

          const target =
            document.getElementById(
              id
            );

          if (!target) {
            return;
          }

          const index =
            getSectionIndex(
              target
            );

          if (index < 0) {
            return;
          }

          event.preventDefault();

          closeMenu();

          navigateToSection(
            index,
            true
          );
        }
      );
    }
  );


  /* ========================================================
     NARRATIVE VARIABLES
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
     ACTIVE SECTION DETECTION
     ======================================================== */

  const getViewportActiveIndex = () => {

    const viewportHeight =
      window.innerHeight;

    const headerHeight =
      getHeaderHeight();

    const anchor =
      headerHeight +
      (
        viewportHeight -
        headerHeight
      ) * 0.38;

    let containingIndex = -1;

    sections.forEach(
      (
        section,
        index
      ) => {

        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <= anchor &&
          rect.bottom > anchor
        ) {
          containingIndex =
            index;
        }
      }
    );

    if (
      containingIndex >= 0
    ) {
      return containingIndex;
    }

    let nearestIndex = 0;
    let nearestDistance =
      Infinity;

    sections.forEach(
      (
        section,
        index
      ) => {

        const rect =
          section.getBoundingClientRect();

        const distance =
          Math.abs(
            rect.top -
            anchor
          );

        if (
          distance <
          nearestDistance
        ) {
          nearestDistance =
            distance;

          nearestIndex =
            index;
        }
      }
    );

    return nearestIndex;
  };


  /* ========================================================
     NARRATIVE PROGRESSION
     ======================================================== */

  const updateNarrative = () => {

    scrollFrame = null;

    const viewportHeight =
      window.innerHeight;

    const headerHeight =
      getHeaderHeight();

    const anchor =
      headerHeight +
      (
        viewportHeight -
        headerHeight
      ) * 0.38;

    sections.forEach(
      (
        section,
        index
      ) => {

        const rect =
          section.getBoundingClientRect();

        const height =
          Math.max(
            rect.height,
            1
          );

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


        /* TITLE */

        const titleFade =
          smoothStep(
            (
              progress -
              0.05
            ) / 0.42
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


        /* CONTENT */

        const contentReveal =
          smoothStep(
            (
              progress -
              0.14
            ) / 0.42
          );

        const contentAlpha =
          (
            0.18 +
            0.82 *
              contentReveal
          ).toFixed(3);

        const contentY =
          `${(
            32 *
            (
              1 -
              contentReveal
            )
          ).toFixed(1)}px`;


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
      }
    );


    const viewportIndex =
      getViewportActiveIndex();

    if (
      viewportIndex !==
      activeIndex
    ) {
      setActiveSection(
        viewportIndex,
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
      requestAnimationFrame(
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

  if (previousButton) {
    previousButton.addEventListener(
      "click",
      () => {

        if (
          activeIndex <= 0
        ) {
          return;
        }

        navigateToSection(
          activeIndex - 1,
          true
        );
      }
    );
  }


  /* ========================================================
     NEXT
     ======================================================== */

  if (nextButton) {
    nextButton.addEventListener(
      "click",
      () => {

        const last =
          activeIndex ===
          sections.length - 1;

        navigateToSection(
          last
            ? 0
            : activeIndex + 1,
          true
        );
      }
    );
  }


  /* ========================================================
     BRAND / FOOTER
     ======================================================== */

  const goHome = (
    event
  ) => {

    event.preventDefault();

    closeMenu();

    navigateToSection(
      0,
      true
    );
  };


  if (brand) {
    brand.addEventListener(
      "click",
      goHome
    );
  }


  if (footerMark) {
    footerMark.addEventListener(
      "click",
      goHome
    );
  }


  /* ========================================================
     KEYBOARD
     ======================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      /* ESC */

      if (
        event.key ===
          "Escape" &&
        menuOpen
      ) {
        event.preventDefault();

        closeMenu();

        return;
      }


      /* MENU FOCUS TRAP */

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
          document.activeElement ===
            first
        ) {
          event.preventDefault();

          last.focus();

          return;
        }

        if (
          !event.shiftKey &&
          document.activeElement ===
            last
        ) {
          event.preventDefault();

          first.focus();
        }

        return;
      }


      /* INTERACTIVE ELEMENTS */

      if (
        isEditableTarget(
          event.target
        ) ||
        isInteractiveTarget(
          event.target
        )
      ) {
        return;
      }


      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }


      /* LEFT */

      if (
        event.key ===
          "ArrowLeft" &&
        !menuOpen
      ) {

        event.preventDefault();

        previousButton?.click();

        return;
      }


      /* RIGHT */

      if (
        event.key ===
          "ArrowRight" &&
        !menuOpen
      ) {

        event.preventDefault();

        nextButton?.click();
      }
    }
  );


  /* ========================================================
     HASH
     ======================================================== */

  const getHashTarget = () => {

    const hash =
      window.location.hash;

    if (!hash) {
      return null;
    }

    let id = "";

    try {
      id =
        decodeURIComponent(
          hash.slice(1)
        );
    } catch {
      return null;
    }

    if (!id) {
      return null;
    }

    return document.getElementById(
      id
    );
  };


  const handleHash = () => {

    const target =
      getHashTarget();

    if (!target) {
      return;
    }

    const index =
      getSectionIndex(
        target
      );

    if (index < 0) {
      return;
    }

    requestAnimationFrame(
      () => {
        navigateToSection(
          index,
          false
        );
      }
    );
  };


  window.addEventListener(
    "hashchange",
    handleHash
  );


  /* ========================================================
     INITIAL NARRATIVE STATE
     ======================================================== */

  sections.forEach(
    (
      section,
      index
    ) => {

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

      narrativeCache[index] =
        {
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


  /* ========================================================
     INITIAL PAGE STATE
     ======================================================== */

  setPageInert(false);

  setActiveSection(
    0,
    false
  );

  requestNarrativeUpdate();


  /* ========================================================
     LOADER
     ======================================================== */

  startLoader();


  /* ========================================================
     HASH RESTORE
     ======================================================== */

  if (
    window.location.hash
  ) {
    handleHash();
  }


  /* ========================================================
     BF CACHE
     ======================================================== */

  window.addEventListener(
    "pageshow",
    (event) => {

      if (
        !event.persisted
      ) {
        return;
      }

      menuOpen = false;

      if (header) {
        header.classList.remove(
          "menu-open"
        );
      }

      if (menu) {
        menu.classList.remove(
          "is-open"
        );

        menu.setAttribute(
          "aria-hidden",
          "true"
        );

        setInert(
          menu,
          true
        );
      }

      body.classList.remove(
        "menu-is-open"
      );

      setPageInert(false);

      requestNarrativeUpdate();
    }
  );


  /* ========================================================
     CLEANUP
     ======================================================== */

  window.addEventListener(
    "pagehide",
    () => {

      if (
        loaderMinTimer !== null
      ) {
        clearTimeout(
          loaderMinTimer
        );
      }

      if (
        loaderFallbackTimer !== null
      ) {
        clearTimeout(
          loaderFallbackTimer
        );
      }

      if (
        loaderExitTimer !== null
      ) {
        clearTimeout(
          loaderExitTimer
        );
      }

      if (
        scrollFrame !== null
      ) {
        cancelAnimationFrame(
          scrollFrame
        );

        scrollFrame = null;
      }
    }
  );

})();
